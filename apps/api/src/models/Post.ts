import mongoose, { Schema, Document } from 'mongoose';
import { PostType, PostStatus } from '@sanad/types';

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  type: PostType;
  muxAssetId?: string;
  playbackId?: string;
  caption: string;
  tags: string[];
  language: string;
  visibility: 'public' | 'followers' | 'unlisted';
  status: PostStatus;
  counts: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['reel', 'video'],
      required: true,
    },
    muxAssetId: {
      type: String,
    },
    playbackId: {
      type: String,
    },
    caption: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'unlisted'],
      default: 'public',
    },
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

PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
