import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'post' | 'comment' | 'user' | 'message' | 'live';
  targetId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  handledBy?: mongoose.Types.ObjectId;
  resolutionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'user', 'message', 'live'],
      required: true,
    },
    targetId: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolutionNote: { type: String },
  },
  { timestamps: true }
);

export const ReportModel = mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String },
    meta: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

