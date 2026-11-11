import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import { ConversationModel, MessageModel } from '../modules/messaging/messaging.model.js';
import { BlockModel } from '../modules/users/users.model.js';
import { logger } from '../config/logger.js';
import mongoose from 'mongoose';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRoles?: string[];
}

export function setupSocketIO(io: Server): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const payload = await verifyAccessToken(token);
      socket.userId = payload.sub;
      socket.userRoles = payload.roles;
      next();
    } catch {
      next(new Error('Invalid or expired socket token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info({ userId, socketId: socket.id }, 'Socket client connected');

    // Join personal user room for targeted notifications/calls
    socket.join(`user:${userId}`);

    // Join conversation room
    socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
        const conv = await ConversationModel.findById(conversationId).exec();
        if (conv && conv.participants.some((p: any) => p.toString() === userId)) {
          socket.join(`conversation:${conversationId}`);
        }
      } catch (err) {
        logger.warn({ err }, 'Failed to join conversation room');
      }
    });

    // Send realtime message
    socket.on('message:send', async (data: { conversationId: string; body: string }) => {
      try {
        if (!data.conversationId || !data.body?.trim()) return;

        const conv = await ConversationModel.findById(data.conversationId).exec();
        if (!conv || !conv.participants.some((p: any) => p.toString() === userId)) {
          return socket.emit('error', { message: 'Not authorized in conversation' });
        }

        // Check block
        const otherParticipant = conv.participants.find((p: any) => p.toString() !== userId);
        if (otherParticipant) {
          const blocked = await BlockModel.findOne({
            $or: [
              { blockerId: userId, blockedId: otherParticipant },
              { blockerId: otherParticipant, blockedId: userId },
            ],
          });
          if (blocked) {
            return socket.emit('error', { message: 'User blocked' });
          }
        }

        const msg = await MessageModel.create({
          conversationId: conv._id,
          senderId: userId,
          body: data.body.trim(),
          readBy: [userId],
        });

        conv.lastMessageAt = new Date();
        conv.lastMessageText = data.body.trim();
        await conv.save();

        io.to(`conversation:${data.conversationId}`).emit('message:new', msg);
      } catch (err) {
        logger.error({ err }, 'Error in message:send socket event');
      }
    });

    // Typing indicators
    socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, userId, isTyping: true });
    });

    socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit('typing', { conversationId, userId, isTyping: false });
    });

    // Live stream chat
    socket.on('live:join', ({ liveId }: { liveId: string }) => {
      socket.join(`live:${liveId}`);
    });

    socket.on('live:message', ({ liveId, text }: { liveId: string; text: string }) => {
      if (!text?.trim()) return;
      io.to(`live:${liveId}`).emit('live:chat', {
        userId,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Socket client disconnected');
    });
  });
}

