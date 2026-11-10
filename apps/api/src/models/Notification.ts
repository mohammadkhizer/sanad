import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'verification_update'
  | 'new_lecture'
  | 'live_started'
  | 'chat_request'
  | 'call_ringing'
  | 'moderation_action';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    body: {
      type: String,
      required: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: [
        'verification_update',
        'new_lecture',
        'live_started',
        'chat_request',
        'call_ringing',
        'moderation_action',
      ],
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

