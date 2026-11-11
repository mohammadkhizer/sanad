import { Request, Response, NextFunction } from 'express';
import { ChatRequestModel, ConversationModel, MessageModel } from './messaging.model.js';
import { BlockModel } from '../users/users.model.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors.js';
import mongoose from 'mongoose';

export class MessagingController {
  async sendChatRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const fromId = new mongoose.Types.ObjectId(req.user!.id);
      const toId = new mongoose.Types.ObjectId(req.body.scholarId);

      if (fromId.equals(toId)) {
        throw new ConflictError('Cannot send chat request to yourself');
      }

      // Check block
      const blocked = await BlockModel.findOne({
        $or: [
          { blockerId: fromId, blockedId: toId },
          { blockerId: toId, blockedId: fromId },
        ],
      });
      if (blocked) {
        throw new ForbiddenError('Unable to send request');
      }

      const existing = await ChatRequestModel.findOne({
        fromId,
        toId,
        status: 'pending',
      });
      if (existing) {
        throw new ConflictError('A pending chat request already exists');
      }

      const request = await ChatRequestModel.create({
        fromId,
        toId,
        message: req.body.message,
      });

      res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  }

  async respondChatRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.id;
      const { decision } = req.body;

      const request = await ChatRequestModel.findById(requestId).exec();
      if (!request) {
        throw new NotFoundError('Chat request not found');
      }

      if (request.toId.toString() !== req.user!.id) {
        throw new ForbiddenError('Not authorized to respond to this request');
      }

      request.status = decision;
      await request.save();

      let conversation = null;
      if (decision === 'accepted') {
        conversation = await ConversationModel.findOneAndUpdate(
          {
            participants: { $all: [request.fromId, request.toId] },
          },
          {
            $setOnInsert: {
              participants: [request.fromId, request.toId],
              lastMessageAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      }

      res.status(200).json({ success: true, request, conversation });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const conversations = await ConversationModel.find({
        participants: userId,
      })
        .populate('participants', 'displayName avatarUrl roles scholarProfile')
        .sort({ lastMessageAt: -1 })
        .exec();

      res.status(200).json({ conversations });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = new mongoose.Types.ObjectId(req.params.id);
      const conversation = await ConversationModel.findById(conversationId).exec();

      if (!conversation) {
        throw new NotFoundError('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (p: any) => p.toString() === req.user!.id
      );
      if (!isParticipant && !req.user!.roles.includes('admin')) {
        throw new ForbiddenError('Not a participant in this conversation');
      }

      const messages = await MessageModel.find({ conversationId })
        .populate('senderId', 'displayName avatarUrl')
        .sort({ createdAt: 1 })
        .limit(100)
        .exec();

      // Mark read
      await MessageModel.updateMany(
        { conversationId, senderId: { $ne: req.user!.id }, readBy: { $ne: req.user!.id } },
        { $addToSet: { readBy: new mongoose.Types.ObjectId(req.user!.id) } }
      );

      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const conversationId = new mongoose.Types.ObjectId(req.params.id);
      const senderId = new mongoose.Types.ObjectId(req.user!.id);

      const conversation = await ConversationModel.findById(conversationId).exec();
      if (!conversation) {
        throw new NotFoundError('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (p: any) => p.toString() === req.user!.id
      );
      if (!isParticipant) {
        throw new ForbiddenError('Not a participant in this conversation');
      }

      // Check block between participants
      const otherParticipant = conversation.participants.find(
        (p: any) => p.toString() !== req.user!.id
      );
      if (otherParticipant) {
        const isBlocked = await BlockModel.findOne({
          $or: [
            { blockerId: senderId, blockedId: otherParticipant },
            { blockerId: otherParticipant, blockedId: senderId },
          ],
        });
        if (isBlocked) {
          throw new ForbiddenError('Cannot send message to this user');
        }
      }

      const message = await MessageModel.create({
        conversationId,
        senderId,
        body: req.body.body,
        type: req.body.type || 'text',
        attachmentUrl: req.body.attachmentUrl,
        readBy: [senderId],
      });

      conversation.lastMessageAt = new Date();
      conversation.lastMessageText = req.body.body;
      await conversation.save();

      res.status(201).json({ message });
    } catch (error) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();

