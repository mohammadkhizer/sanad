import { Request, Response, NextFunction } from 'express';
import { ChatRequestModel, ConversationModel, MessageModel } from './messaging.model.js';
import { UserModel } from '../auth/auth.model.js';
import { BlockModel } from '../users/users.model.js';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../../utils/errors.js';
import { getSocketIO } from '../../realtime/socket.js';
import { createAndSendNotification } from '../../services/notification.service.js';
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

      // Dispatch notification to recipient
      const sender = await UserModel.findById(fromId).select('displayName').exec();
      await createAndSendNotification({
        recipientId: toId.toString(),
        actorId: fromId.toString(),
        type: 'system',
        title: `Consultation Inquiry from ${sender?.displayName || 'User'}`,
        body: req.body.message.slice(0, 100),
        entityId: request._id.toString(),
        entityType: 'user',
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
              lastMessageText: request.message,
            },
          },
          { upsert: true, new: true }
        );

        // Create the initial message record
        await MessageModel.create({
          conversationId: conversation._id,
          senderId: request.fromId,
          body: request.message,
          type: 'text',
          readBy: [request.fromId],
        });

        // Notify original sender that inquiry was accepted
        const responder = await UserModel.findById(request.toId).select('displayName').exec();
        await createAndSendNotification({
          recipientId: request.fromId.toString(),
          actorId: request.toId.toString(),
          type: 'system',
          title: 'Consultation Accepted',
          body: `${responder?.displayName || 'Scholar'} accepted your consultation inquiry.`,
          entityId: conversation._id.toString(),
          entityType: 'user',
        });
      }

      res.status(200).json({ success: true, request, conversation });
    } catch (error) {
      next(error);
    }
  }

  async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const filter = req.query.filter as string | undefined;

      if (filter === 'requests') {
        const requests = await ChatRequestModel.find({
          toId: userId,
          status: 'pending',
        })
          .populate('fromId', 'displayName username avatarUrl roles scholarProfile')
          .populate('toId', 'displayName username avatarUrl roles scholarProfile')
          .sort({ createdAt: -1 })
          .exec();

        const formatted = requests.map((r) => ({
          _id: r._id,
          isRequest: true,
          requestStatus: r.status,
          participants: [r.fromId, r.toId],
          lastMessageText: r.message,
          lastMessageAt: r.createdAt,
          createdAt: r.createdAt,
          lastMessage: {
            body: r.message,
            createdAt: r.createdAt,
          },
        }));

        return res.status(200).json({ conversations: formatted });
      }

      const conversations = await ConversationModel.find({
        participants: userId,
      })
        .populate('participants', 'displayName username avatarUrl roles scholarProfile')
        .sort({ lastMessageAt: -1 })
        .exec();

      const formatted = conversations.map((c) => {
        const doc = c.toObject();
        return {
          ...doc,
          lastMessageText: c.lastMessageText || 'Consultation initiated.',
          lastMessage: {
            body: c.lastMessageText || 'Consultation initiated.',
            createdAt: c.lastMessageAt || c.createdAt,
          },
        };
      });

      res.status(200).json({ conversations: formatted });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(rawId)) {
        throw new NotFoundError('Invalid identifier');
      }

      const currentUserId = new mongoose.Types.ObjectId(req.user!.id);
      const targetId = new mongoose.Types.ObjectId(rawId);

      // Check if rawId is a direct Conversation ID
      let conversation = await ConversationModel.findById(targetId)
        .populate('participants', 'displayName username avatarUrl roles scholarProfile')
        .exec();

      // If not found by conversation _id, check if rawId is a recipient User ID
      if (!conversation) {
        conversation = await ConversationModel.findOne({
          participants: { $all: [currentUserId, targetId] },
        })
          .populate('participants', 'displayName username avatarUrl roles scholarProfile')
          .exec();
      }

      if (conversation) {
        const isParticipant = conversation.participants.some(
          (p: any) => p._id.toString() === req.user!.id
        );
        if (!isParticipant && !req.user!.roles.includes('admin')) {
          throw new ForbiddenError('Not a participant in this conversation');
        }

        const messages = await MessageModel.find({ conversationId: conversation._id })
          .populate('senderId', 'displayName username avatarUrl roles scholarProfile')
          .sort({ createdAt: 1 })
          .limit(100)
          .exec();

        // Mark read
        await MessageModel.updateMany(
          { conversationId: conversation._id, senderId: { $ne: req.user!.id }, readBy: { $ne: req.user!.id } },
          { $addToSet: { readBy: currentUserId } }
        );

        const recipient = conversation.participants.find(
          (p: any) => p._id.toString() !== req.user!.id
        );

        return res.status(200).json({
          messages,
          conversationId: conversation._id,
          recipient,
        });
      }

      // No conversation exists yet between current user and this target.
      // Check if targetId is a valid user so we can return empty conversation (200 OK) instead of 404
      const targetUser = await UserModel.findById(targetId)
        .select('displayName username avatarUrl roles scholarProfile')
        .exec();

      if (targetUser) {
        return res.status(200).json({
          messages: [],
          conversationId: null,
          recipient: targetUser,
        });
      }

      throw new NotFoundError('Conversation or recipient not found');
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const rawId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(rawId)) {
        throw new NotFoundError('Invalid identifier');
      }

      const senderId = new mongoose.Types.ObjectId(req.user!.id);
      const targetId = new mongoose.Types.ObjectId(rawId);
      const bodyText = req.body.body?.trim();

      if (!bodyText) {
        throw new ValidationError('Message body is required');
      }

      // Check if targetId is an existing Conversation ID
      let conversation = await ConversationModel.findById(targetId).exec();

      // If not, check if targetId is another participant User ID
      if (!conversation) {
        conversation = await ConversationModel.findOne({
          participants: { $all: [senderId, targetId] },
        }).exec();
      }

      // If STILL not found, verify targetId is a valid recipient user and create conversation
      if (!conversation) {
        const recipientUser = await UserModel.findById(targetId).exec();
        if (!recipientUser) {
          throw new NotFoundError('Recipient not found');
        }

        if (senderId.equals(targetId)) {
          throw new ConflictError('Cannot send message to yourself');
        }

        // Check block
        const blocked = await BlockModel.findOne({
          $or: [
            { blockerId: senderId, blockedId: targetId },
            { blockerId: targetId, blockedId: senderId },
          ],
        });
        if (blocked) {
          throw new ForbiddenError('Cannot send message to this user');
        }

        conversation = await ConversationModel.create({
          participants: [senderId, targetId],
          lastMessageAt: new Date(),
          lastMessageText: bodyText,
        });
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
        conversationId: conversation._id,
        senderId,
        body: bodyText,
        type: req.body.type || 'text',
        attachmentUrl: req.body.attachmentUrl,
        readBy: [senderId],
      });

      conversation.lastMessageAt = new Date();
      conversation.lastMessageText = bodyText;
      await conversation.save();

      await message.populate('senderId', 'displayName username avatarUrl roles scholarProfile');

      // Realtime emit via Socket.IO
      const io = getSocketIO();
      if (io) {
        io.to(`conversation:${conversation._id}`).emit('message:new', message);
        if (otherParticipant) {
          io.to(`user:${otherParticipant}`).emit('message:received', {
            conversationId: conversation._id,
            message,
          });
        }
      }

      // Send notification to recipient
      if (otherParticipant) {
        const senderDoc = await UserModel.findById(senderId).select('displayName').exec();
        await createAndSendNotification({
          recipientId: otherParticipant.toString(),
          actorId: senderId.toString(),
          type: 'system',
          title: `Message from ${senderDoc?.displayName || 'User'}`,
          body: bodyText.slice(0, 100),
          entityId: conversation._id.toString(),
          entityType: 'user',
        });
      }

      res.status(201).json({ message, conversationId: conversation._id });
    } catch (error) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();
