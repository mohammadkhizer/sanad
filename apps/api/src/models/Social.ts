import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });
LikeSchema.index({ postId: 1 });

export const Like = mongoose.model<ILike>('Like', LikeSchema);

export interface ISave extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SaveSchema = new Schema<ISave>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
SaveSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Save = mongoose.model<ISave>('Save', SaveSchema);

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId;
  followeeId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    followeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
FollowSchema.index({ followerId: 1, followeeId: 1 }, { unique: true });
FollowSchema.index({ followeeId: 1 });

export const Follow = mongoose.model<IFollow>('Follow', FollowSchema);

export interface IBlock extends Document {
  blockerId: mongoose.Types.ObjectId;
  blockedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
BlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

export const Block = mongoose.model<IBlock>('Block', BlockSchema);

