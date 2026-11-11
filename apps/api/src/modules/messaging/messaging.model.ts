import mongoose, { Schema, Document } from 'mongoose';

export interface IChatRequest extends Document {
  fromId: mongoose.Types.ObjectId;
  toId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

const chatRequestSchema = new Schema<IChatRequest>(
  {
    fromId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    toId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatRequestModel =
  mongoose.models.ChatRequest || mongoose.model<IChatRequest>('ChatRequest', chatRequestSchema);

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessageAt: Date;
  lastMessageText?: string;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date, default: Date.now },
    lastMessageText: { type: String },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export const ConversationModel =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  type: 'text' | 'image';
  body: string;
  attachmentUrl?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['text', 'image'], default: 'text' },
    body: { type: String, required: true },
    attachmentUrl: { type: String },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

