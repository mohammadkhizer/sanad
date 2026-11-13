import mongoose, { Schema, Document } from 'mongoose';

export interface IScholarActivity extends Document {
  scholarId: mongoose.Types.ObjectId;
  action: string;
  category: 'content' | 'session' | 'auth' | 'security' | 'governance';
  title: string;
  description: string;
  isUnauthorized: boolean;
  severity: 'info' | 'warning' | 'critical';
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  dismissed?: boolean;
  createdAt: Date;
}

const scholarActivitySchema = new Schema<IScholarActivity>(
  {
    scholarId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    category: { type: String, default: 'content', index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isUnauthorized: { type: Boolean, default: false, index: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    ip: { type: String, default: '127.0.0.1' },
    userAgent: { type: String, default: 'Sanad Client' },
    metadata: { type: Schema.Types.Mixed },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

scholarActivitySchema.index({ scholarId: 1, createdAt: -1 });
scholarActivitySchema.index({ isUnauthorized: 1, createdAt: -1 });

export const ScholarActivityModel =
  mongoose.models.ScholarActivity ||
  mongoose.model<IScholarActivity>('ScholarActivity', scholarActivitySchema);

