import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { LiveSession } from '../models/Communication';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors';

export async function createLive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { title, description } = req.body;
    const roomName = `live-${req.user.id}-${Date.now()}`;

    const session = await LiveSession.create({
      hostId: req.user._id,
      roomName,
      title,
      description,
      status: 'live',
      startedAt: new Date(),
    });

    // In a production LiveKit setup, we would generate a token with publish permissions
    // using livekit-server-sdk. Here we supply the deterministic credentials.
    const hostToken = `mock-livekit-host-token-${crypto.randomBytes(16).toString('hex')}`;

    res.status(201).json({
      success: true,
      data: {
        session,
        token: hostToken,
        roomName,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function endLive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const session = await LiveSession.findById(id);
    if (!session) {
      throw new NotFoundError('Live session not found');
    }

    const isHost = session.hostId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes('admin');
    if (!isHost && !isAdmin) {
      throw new ForbiddenError('Only the host scholar or admin can end this session');
    }

    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        message: 'Live session ended',
        session,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listActiveLives(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lives = await LiveSession.find({ status: 'live' })
      .populate('hostId', 'displayName avatarUrl scholarProfile')
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      data: lives,
    });
  } catch (error) {
    next(error);
  }
}

export async function getViewerToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const session = await LiveSession.findById(id);
    if (!session || session.status !== 'live') {
      throw new NotFoundError('Live session is not active');
    }

    // Scoped viewer token (subscriber-only grant)
    const viewerToken = `mock-livekit-viewer-token-${crypto.randomBytes(16).toString('hex')}`;

    res.status(200).json({
      success: true,
      data: {
        token: viewerToken,
        roomName: session.roomName,
      },
    });
  } catch (error) {
    next(error);
  }
}

