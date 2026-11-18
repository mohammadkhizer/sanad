import mongoose from 'mongoose';
import { NotificationModel, NotificationType } from '../modules/notifications/notifications.model.js';
import { getSocketIO } from '../realtime/socket.js';
import { logger } from '../config/logger.js';

export interface CreateNotificationParams {
  recipientId: string | mongoose.Types.ObjectId;
  actorId?: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  entityId?: string;
  entityType?: 'user' | 'post' | 'comment' | 'security';
  metadata?: Record<string, unknown>;
}

export async function createAndSendNotification(params: CreateNotificationParams) {
  try {
    const recipientStr = params.recipientId.toString();
    const actorStr = params.actorId ? params.actorId.toString() : null;

    // Do not notify a user about their own actions
    if (actorStr && recipientStr === actorStr) {
      return null;
    }

    const doc = await NotificationModel.create({
      recipientId: new mongoose.Types.ObjectId(recipientStr),
      actorId: actorStr ? new mongoose.Types.ObjectId(actorStr) : undefined,
      type: params.type,
      title: params.title,
      body: params.body,
      entityId: params.entityId,
      entityType: params.entityType,
      metadata: params.metadata,
      read: false,
    });

    const populated = await NotificationModel.findById(doc._id)
      .populate('actorId', 'displayName username avatarUrl roles scholarProfile')
      .lean();

    // Realtime notification via Socket.IO
    const io = getSocketIO();
    if (io) {
      io.to(`user:${recipientStr}`).emit('notification:new', populated);
    }

    return populated;
  } catch (err) {
    logger.warn({ err }, 'Failed to dispatch notification');
    return null;
  }
}

