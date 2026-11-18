import { Request, Response, NextFunction } from 'express';
import { LiveSessionModel, CallSessionModel } from './live.model.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { SignJWT } from 'jose';
import { env } from '../../config/env.js';

export class LiveController {
  private async createLiveKitToken(identity: string, room: string, isPublisher: boolean) {
    const secret = new TextEncoder().encode(env.LIVEKIT_API_SECRET || env.JWT_ACCESS_SECRET);
    return new SignJWT({
      video: {
        room,
        roomJoin: true,
        canPublish: isPublisher,
        canSubscribe: true,
      },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(identity)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);
  }

  async startLive(req: Request, res: Response, next: NextFunction) {
    try {
      const hostId = new mongoose.Types.ObjectId(req.user!.id);
      const roomName = `live_${hostId}_${Date.now()}`;

      const session = await LiveSessionModel.create({
        hostId,
        roomName,
        title: req.body.title,
        description: req.body.description,
        status: 'live',
        startedAt: new Date(),
      });

      const token = await new LiveController().createLiveKitToken(req.user!.id, roomName, true);

      res.status(201).json({
        session,
        token,
        livekitUrl: env.LIVEKIT_URL,
      });
    } catch (error) {
      next(error);
    }
  }

  async endLive(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id;
      const session = await LiveSessionModel.findById(sessionId).exec();

      if (!session) {
        throw new NotFoundError('Live session not found');
      }

      if (
        session.hostId.toString() !== req.user!.id &&
        !req.user!.roles.some((r) => ['admin', 'moderator'].includes(r))
      ) {
        throw new ForbiddenError('Only the host or a moderator can end this session');
      }

      session.status = 'ended';
      session.endedAt = new Date();
      await session.save();

      res.status(200).json({ success: true, message: 'Live stream ended' });
    } catch (error) {
      next(error);
    }
  }

  async getActiveLives(req: Request, res: Response, next: NextFunction) {
    try {
      const lives = await LiveSessionModel.find({ status: 'live' })
        .populate('hostId', 'displayName avatarUrl scholarProfile')
        .sort({ startedAt: -1 })
        .exec();

      res.status(200).json({ lives });
    } catch (error) {
      next(error);
    }
  }

  async getViewerToken(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.id;
      const session = await LiveSessionModel.findById(sessionId).exec();

      if (!session || session.status !== 'live') {
        throw new NotFoundError('Live session not found or already ended');
      }

      // Viewers have canPublish = false (RBAC enforcement)
      const token = await new LiveController().createLiveKitToken(req.user!.id, session.roomName, false);

      await LiveSessionModel.findByIdAndUpdate(session._id, { $inc: { viewerCount: 1 } });

      res.status(200).json({
        token,
        livekitUrl: env.LIVEKIT_URL,
        roomName: session.roomName,
      });
    } catch (error) {
      next(error);
    }
  }

  async initiateCall(req: Request, res: Response, next: NextFunction) {
    try {
      const callerId = new mongoose.Types.ObjectId(req.user!.id);
      const calleeId = new mongoose.Types.ObjectId(req.body.calleeId);

      const roomName = `call_${crypto.randomUUID()}`;
      const session = await CallSessionModel.create({
        callerId,
        calleeId,
        roomName,
        status: 'ringing',
      });

      const token = await new LiveController().createLiveKitToken(req.user!.id, roomName, true);

      res.status(201).json({
        session,
        token,
        livekitUrl: env.LIVEKIT_URL,
      });
    } catch (error) {
      next(error);
    }
  }

  async respondCall(req: Request, res: Response, next: NextFunction) {
    try {
      const callId = req.params.id;
      const { decision } = req.body;

      const session = await CallSessionModel.findById(callId).exec();
      if (!session) {
        throw new NotFoundError('Call not found');
      }

      if (session.calleeId.toString() !== req.user!.id) {
        throw new ForbiddenError('Not authorized to respond to this call');
      }

      session.status = decision === 'accepted' ? 'connected' : 'declined';
      await session.save();

      let token = null;
      if (decision === 'accepted') {
        token = await new LiveController().createLiveKitToken(req.user!.id, session.roomName, true);
      }

      res.status(200).json({
        session,
        token,
        livekitUrl: env.LIVEKIT_URL,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const liveController = new LiveController();

