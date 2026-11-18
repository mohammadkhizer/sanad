import mongoose, { Schema, Document } from 'mongoose';

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'otp_failed'
  | 'new_device'
  | 'refresh_reuse'
  | '2fa_changed'
  | 'account_locked'
  | 'credential_access';

export interface ISecurityEvent extends Document {
  userId?: mongoose.Types.ObjectId;
  identifier?: string;
  eventType: SecurityEventType;
  ip?: string;
  userAgent?: string;
  deviceId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const securityEventSchema = new Schema<ISecurityEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    identifier: { type: String, index: true },
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'login_success',
        'login_failed',
        'otp_failed',
        'new_device',
        'refresh_reuse',
        '2fa_changed',
        'account_locked',
        'credential_access',
      ],
    },
    ip: { type: String },
    userAgent: { type: String },
    deviceId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SecurityEventModel =
  mongoose.models.SecurityEvent || mongoose.model<ISecurityEvent>('SecurityEvent', securityEventSchema);

