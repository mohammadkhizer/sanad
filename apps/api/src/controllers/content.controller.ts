import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { Like, Save } from '../models/Social';
import { AuditLog } from '../models/Moderation';
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  AppError,
} from '../utils/errors';

export async function getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const assetId = crypto.randomUUID();
    // Direct upload URL structure (Mux or Cloudflare Stream compatible)
    const uploadUrl = `https://video.sanad.app/uploads/${assetId}?token=${crypto.randomBytes(16).toString('hex')}`;

    res.status(200).json({
      success: true,
      data: {
        assetId,
        uploadUrl,
        expiresIn: 1800,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { type, caption, tags, language, visibility, muxAssetId, playbackId } = req.body;

    const post = await Post.create({
      authorId: req.user._id,
      type,
      caption,
      tags: tags || [],
      language: language || 'en',
      visibility: visibility || 'public',
      muxAssetId: muxAssetId || crypto.randomUUID(),
      playbackId: playbackId || crypto.randomUUID(),
      status: 'live',
    });

    await AuditLog.create({
      actorId: req.user._id,
      action: 'post:create',
      targetType: 'post',
      targetId: post.id,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cursor, limit = '20', authorId, type, tag } = req.query;
    const pageSize = parseInt(limit as string, 10);

    const query: Record<string, unknown> = {
      status: 'live',
      visibility: 'public',
    };

    if (authorId) query.authorId = authorId;
    if (type) query.type = type;
    if (tag) query.tags = tag;

    if (cursor) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor as string) };
    }

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(pageSize + 1)
      .populate('authorId', 'displayName avatarUrl scholarProfile');

    const hasMore = posts.length > pageSize;
    const returnPosts = hasMore ? posts.slice(0, pageSize) : posts;
    const nextCursor = hasMore ? returnPosts[returnPosts.length - 1].id : null;

    res.status(200).json({
      success: true,
      data: returnPosts,
      meta: {
        cursor: nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('authorId', 'displayName avatarUrl scholarProfile');

    if (!post || post.status === 'removed') {
      throw new NotFoundError('Post not found');
    }

    let isLiked = false;
    let isSaved = false;
    if (req.user) {
      isLiked = !!(await Like.findOne({ userId: req.user._id, postId: post._id }));
      isSaved = !!(await Save.findOne({ userId: req.user._id, postId: post._id }));
    }

    res.status(200).json({
      success: true,
      data: {
        post,
        userInteractions: {
          isLiked,
          isSaved,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post || post.status === 'removed') {
      throw new NotFoundError('Post not found');
    }

    // Ownership check: only author or admin can update
    const isOwner = post.authorId.toString() === req.user.id;
    const isAdmin = req.user.roles.includes('admin');
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You can only update your own posts', 'NOT_OWNER');
    }

    const { caption, tags, language, visibility } = req.body;
    if (caption !== undefined) post.caption = caption;
    if (tags !== undefined) post.tags = tags;
    if (language !== undefined) post.language = language;
    if (visibility !== undefined) post.visibility = visibility;

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post || post.status === 'removed') {
      throw new NotFoundError('Post not found');
    }

    // Owner scholar, moderator, or admin can remove
    const isOwner = post.authorId.toString() === req.user.id;
    const isStaff = req.user.roles.some((r) => ['moderator', 'admin'].includes(r));
    if (!isOwner && !isStaff) {
      throw new ForbiddenError('Insufficient permissions to delete this post', 'NOT_AUTHORIZED');
    }

    post.status = 'removed';
    await post.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'post:delete',
      targetType: 'post',
      targetId: post.id,
      meta: { isStaffAction: isStaff && !isOwner },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Post successfully removed' },
    });
  } catch (error) {
    next(error);
  }
}

export async function likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post || post.status === 'removed') {
      throw new NotFoundError('Post not found');
    }

    const existingLike = await Like.findOne({ userId: req.user._id, postId: post._id });
    if (!existingLike) {
      await Like.create({ userId: req.user._id, postId: post._id });
      await Post.findByIdAndUpdate(post._id, { $inc: { 'counts.likes': 1 } });
    }

    res.status(200).json({
      success: true,
      data: { liked: true },
    });
  } catch (error) {
    next(error);
  }
}

export async function unlikePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) throw new NotFoundError('Post not found');

    const deleted = await Like.findOneAndDelete({ userId: req.user._id, postId: post._id });
    if (deleted && post.counts.likes > 0) {
      await Post.findByIdAndUpdate(post._id, { $inc: { 'counts.likes': -1 } });
    }

    res.status(200).json({
      success: true,
      data: { liked: false },
    });
  } catch (error) {
    next(error);
  }
}

export async function savePost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post || post.status === 'removed') throw new NotFoundError('Post not found');

    const existing = await Save.findOne({ userId: req.user._id, postId: post._id });
    if (existing) {
      await Save.deleteOne({ _id: existing._id });
      res.status(200).json({ success: true, data: { saved: false } });
      return;
    }

    await Save.create({ userId: req.user._id, postId: post._id });
    res.status(200).json({ success: true, data: { saved: true } });
  } catch (error) {
    next(error);
  }
}

export async function getComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { limit = '50', skip = '0' } = req.query;

    const comments = await Comment.find({ postId: id, status: 'active' })
      .populate('userId', 'displayName avatarUrl scholarProfile')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { text, parentId } = req.body;

    const post = await Post.findById(id);
    if (!post || post.status === 'removed') {
      throw new NotFoundError('Post not found');
    }

    const comment = await Comment.create({
      postId: post._id,
      userId: req.user._id,
      parentId: parentId || undefined,
      text,
    });

    await Post.findByIdAndUpdate(post._id, { $inc: { 'counts.comments': 1 } });

    const populated = await Comment.findById(comment._id).populate(
      'userId',
      'displayName avatarUrl scholarProfile'
    );

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
}

