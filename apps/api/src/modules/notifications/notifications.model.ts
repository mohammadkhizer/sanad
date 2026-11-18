import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'follow' | 'like' | 'comment' | 'security_warning' | 'system';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  entityId?: string;
  entityType?: 'user' | 'post' | 'comment' | 'security';
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    entityId: { type: String },
    entityType: { type: String },
    read: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);

