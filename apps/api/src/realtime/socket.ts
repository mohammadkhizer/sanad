import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens';
import { User } from '../models/User';
import { Conversation, Message } from '../models/Communication';

export function setupSocketIO(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (!user || user.status !== 'active') {
        return next(new Error('User inactive or not found'));
      }

      (socket as any).user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    // Join personal room for targeted notifications (calls, chat requests)
    socket.join(`user:${user.id}`);

    // Broadcast presence
    io.emit('presence', { userId: user.id, status: 'online' });

    // Join conversation room
    socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
      const conv = await Conversation.findById(conversationId);
      if (conv && conv.participants.some((p) => p.toString() === user.id)) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('conversation:leave', ({ conversationId }: { conversationId: string }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing event
    socket.on(
      'typing',
      ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
        socket.to(`conversation:${conversationId}`).emit('typing', {
          conversationId,
          userId: user.id,
          displayName: user.displayName,
          isTyping,
        });
      }
    );

    // Live chat room join
    socket.on('live:join', ({ liveSessionId }: { liveSessionId: string }) => {
      socket.join(`live:${liveSessionId}`);
    });

    socket.on('live:leave', ({ liveSessionId }: { liveSessionId: string }) => {
      socket.leave(`live:${liveSessionId}`);
    });

    // Live chat message broadcast
    socket.on(
      'live:chat:send',
      ({ liveSessionId, message }: { liveSessionId: string; message: string }) => {
        io.to(`live:${liveSessionId}`).emit('live:chat', {
          liveSessionId,
          user: {
            id: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            scholar: user.roles.includes('scholar'),
          },
          message,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // Call ringing signaling
    socket.on('call:ring', ({ calleeId, callSessionId, roomName }: any) => {
      io.to(`user:${calleeId}`).emit('call:ring', {
        callSessionId,
        caller: {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
        roomName,
      });
    });

    socket.on('disconnect', () => {
      io.emit('presence', { userId: user.id, status: 'offline' });
    });
  });

  return io;
}

