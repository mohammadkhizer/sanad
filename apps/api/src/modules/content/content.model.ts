import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  type: 'reel' | 'video' | 'text';
  muxAssetId?: string;
  playbackId?: string;
  caption: string;
  tags: string[];
  language: string;
  visibility: 'public' | 'followers';
  status: 'processing' | 'live' | 'removed';
  counts: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['reel', 'video', 'text'], required: true },
    muxAssetId: { type: String },
    playbackId: { type: String },
    caption: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    language: { type: String, default: 'en' },
    visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
    status: {
      type: String,
      enum: ['processing', 'live', 'removed'],
      default: 'live',
      index: true,
    },
    counts: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ status: 1, createdAt: -1 });

export const PostModel = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  text: string;
  status: 'active' | 'hidden' | 'removed';
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
    text: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'hidden', 'removed'], default: 'active' },
  },
  { timestamps: true }
);

commentSchema.index({ postId: 1, createdAt: 1 });

export const CommentModel =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export interface ILike extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const LikeModel = mongoose.models.Like || mongoose.model<ILike>('Like', likeSchema);

export interface ISave extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const saveSchema = new Schema<ISave>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

saveSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const SaveModel = mongoose.models.Save || mongoose.model<ISave>('Save', saveSchema);

