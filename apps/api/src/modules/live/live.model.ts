import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveSession extends Document {
  hostId: mongoose.Types.ObjectId;
  roomName: string;
  title: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  recordingUrl?: string;
  createdAt: Date;
}

const liveSessionSchema = new Schema<ILiveSession>(
  {
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomName: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended'],
      default: 'live',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    viewerCount: { type: Number, default: 0 },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const LiveSessionModel =
  mongoose.models.LiveSession || mongoose.model<ILiveSession>('LiveSession', liveSessionSchema);

export interface ICallSession extends Document {
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  roomName: string;
  status: 'ringing' | 'connected' | 'declined' | 'ended' | 'missed';
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
}

const callSessionSchema = new Schema<ICallSession>(
  {
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomName: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['ringing', 'connected', 'declined', 'ended', 'missed'],
      default: 'ringing',
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number },
  },
  { timestamps: true }
);

export const CallSessionModel =
  mongoose.models.CallSession || mongoose.model<ICallSession>('CallSession', callSessionSchema);

