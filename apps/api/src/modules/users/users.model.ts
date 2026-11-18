import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    followeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

followSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });

export const FollowModel = mongoose.models.Follow || mongoose.model<IFollow>('Follow', followSchema);

export interface IBlock extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const blockSchema = new Schema<IBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export const BlockModel = mongoose.models.Block || mongoose.model<IBlock>('Block', blockSchema);

