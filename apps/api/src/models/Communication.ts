import mongoose, { Schema, Document } from 'mongoose';
import { MessageType, ChatRequestStatus, LiveSessionStatus } from '@sanad/types';

// Chat Requests
export interface IChatRequest extends Document {
  fromId: mongoose.Types.ObjectId;
  toId: mongoose.Types.ObjectId;
  message: string;
  status: ChatRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ChatRequestSchema = new Schema<IChatRequest>(
  {
    fromId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const ChatRequest = mongoose.model<IChatRequest>('ChatRequest', ChatRequestSchema);

// Conversations
export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessageAt: Date;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessage: { type: String },
  },
  {
    timestamps: true,
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
ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);

// Messages
export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: MessageType;
  body: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['text', 'image', 'audio'], default: 'text' },
    body: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);

// Live Sessions
export interface ILiveSession extends Document {
  hostId: mongoose.Types.ObjectId;
  roomName: string;
  title: string;
  description?: string;
  status: LiveSessionStatus;
  startedAt?: Date;
  endedAt?: Date;
  recordingUrl?: string;
  createdAt: Date;
}

const LiveSessionSchema = new Schema<ILiveSession>(
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
    recordingUrl: { type: String },
  },
  {
    timestamps: true,
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

export const LiveSession = mongoose.model<ILiveSession>('LiveSession', LiveSessionSchema);

// Call Sessions
export interface ICallSession extends Document {
  callerId: mongoose.Types.ObjectId;
  calleeId: mongoose.Types.ObjectId;
  roomName: string;
  status: 'ringing' | 'accepted' | 'rejected' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

const CallSessionSchema = new Schema<ICallSession>(
  {
    callerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    calleeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomName: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['ringing', 'accepted', 'rejected', 'ended'],
      default: 'ringing',
      index: true,
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
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

export const CallSession = mongoose.model<ICallSession>('CallSession', CallSessionSchema);
