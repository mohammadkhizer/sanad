import mongoose, { Schema, Document } from 'mongoose';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IJob extends Document {
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  runAt: Date;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  lockedAt?: Date;
  lockedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    type: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    runAt: { type: Date, default: Date.now, index: true },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastError: { type: String },
    lockedAt: { type: Date },
    lockedBy: { type: String },
  },
  { timestamps: true }
);

// Compound index for efficient worker polling
jobSchema.index({ status: 1, runAt: 1 });

export const JobModel = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

