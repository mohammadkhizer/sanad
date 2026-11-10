import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  ChatRequest,
  Conversation,
  Message,
  CallSession,
} from '../models/Communication';
import { User } from '../models/User';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  AppError,
} from '../utils/errors';

export async function createChatRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { toId, message } = req.body;

    if (req.user.id === toId) {
      throw new AppError('SELF_REQUEST_NOT_ALLOWED', 'Cannot send chat request to yourself', 400);
    }

    const targetUser = await User.findById(toId);
    if (!targetUser || targetUser.status !== 'active') {
      throw new NotFoundError('Target recipient not found');
    }

    const existingPending = await ChatRequest.findOne({
      fromId: req.user._id,
      toId: targetUser._id,
      status: 'pending',
    });
    if (existingPending) {
      throw new ConflictError('A pending chat request already exists', 'REQUEST_PENDING');
    }

    const chatReq = await ChatRequest.create({
      fromId: req.user._id,
      toId: targetUser._id,
      message,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: chatReq,
    });
  } catch (error) {
    next(error);
  }
}

export async function respondChatRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { status } = req.body;

    const chatReq = await ChatRequest.findById(id);
    if (!chatReq || chatReq.status !== 'pending') {
      throw new NotFoundError('Chat request not found or already processed');
    }

    // Only the target recipient can accept or decline
    if (chatReq.toId.toString() !== req.user.id) {
      throw new ForbiddenError('Only the recipient can respond to this chat request');
    }

    chatReq.status = status;
    await chatReq.save();

    let conversation = null;
    if (status === 'accepted') {
      // Create or find existing conversation between the two participants
      conversation = await Conversation.findOne({
        participants: { $all: [chatReq.fromId, chatReq.toId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [chatReq.fromId, chatReq.toId],
          lastMessageAt: new Date(),
          lastMessage: chatReq.message,
        });

        // Insert initial message
        await Message.create({
          conversationId: conversation._id,
          senderId: chatReq.fromId,
          type: 'text',
          body: chatReq.message,
          readBy: [chatReq.fromId],
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        chatRequest: chatReq,
        conversation,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'displayName avatarUrl scholarProfile')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { limit = '50', skip = '0' } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user?.id
    );
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10))
      .populate('senderId', 'displayName avatarUrl');

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { body, type = 'text' } = req.body;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user?.id
    );
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      type,
      body,
      readBy: [req.user._id],
    });

    conversation.lastMessageAt = new Date();
    conversation.lastMessage = body;
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      'senderId',
      'displayName avatarUrl'
    );

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCall(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { calleeId } = req.body;

    const isScholar = req.user.roles.includes('scholar');
    // If not a scholar, member must have an accepted chat request with the scholar
    if (!isScholar) {
      const acceptedReq = await ChatRequest.findOne({
        $or: [
          { fromId: req.user._id, toId: calleeId, status: 'accepted' },
          { fromId: calleeId, toId: req.user._id, status: 'accepted' },
        ],
      });
      if (!acceptedReq) {
        throw new ForbiddenError(
          'Calls can only be initiated by scholars or members with an accepted request'
        );
      }
    }

    const roomName = `call-${req.user.id}-${calleeId}-${Date.now()}`;
    const callSession = await CallSession.create({
      callerId: req.user._id,
      calleeId: new mongoose.Types.ObjectId(calleeId),
      roomName,
      status: 'ringing',
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      data: {
        callSession,
        roomName,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function respondCall(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { action } = req.body;

    const callSession = await CallSession.findById(id);
    if (!callSession) {
      throw new NotFoundError('Call session not found');
    }

    const isCaller = callSession.callerId.toString() === req.user.id;
    const isCallee = callSession.calleeId.toString() === req.user.id;

    if (!isCaller && !isCallee) {
      throw new ForbiddenError('Not a participant in this call session');
    }

    if (action === 'accept') {
      callSession.status = 'accepted';
    } else if (action === 'reject') {
      callSession.status = 'rejected';
      callSession.endedAt = new Date();
    } else if (action === 'end') {
      callSession.status = 'ended';
      callSession.endedAt = new Date();
    }

    await callSession.save();

    res.status(200).json({
      success: true,
      data: callSession,
    });
  } catch (error) {
    next(error);
  }
}

