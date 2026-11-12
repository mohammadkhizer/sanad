import { Request, Response, NextFunction } from 'express';
import { PostModel, CommentModel, LikeModel, SaveModel } from './content.model.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import { BlockModel } from '../users/users.model.js';
import mongoose from 'mongoose';

export class ContentController {
  async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(Number(req.query.limit) || 20, 50);
      const cursor = req.query.cursor as string;
      const type = req.query.type as string;
      const scholarId = req.query.scholarId as string;

      const query: Record<string, unknown> = { status: 'live' };

      if (type && type !== 'all') {
        query.type = type;
      }

      if (scholarId && mongoose.Types.ObjectId.isValid(scholarId)) {
        query.authorId = new mongoose.Types.ObjectId(scholarId);
      }

      if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
        query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      }

      // Filter out posts from blocked users if user logged in
      if (req.user) {
        const blocks = await BlockModel.find({
          $or: [{ blockerId: req.user.id }, { blockedId: req.user.id }],
        }).exec();

        const blockedUserIds = blocks.map((b) =>
          b.blockerId.toString() === req.user!.id ? b.blockedId : b.blockerId
        );

        if (blockedUserIds.length > 0) {
          query.authorId = { $nin: blockedUserIds };
        }
      }

      const posts = await PostModel.find(query)
        .populate('authorId', 'displayName avatarUrl scholarProfile')
        .sort({ _id: -1 })
        .limit(limit + 1)
        .exec();

      const hasNextPage = posts.length > limit;
      const items = hasNextPage ? posts.slice(0, limit) : posts;
      const nextCursor = hasNextPage && items.length > 0 ? items[items.length - 1]._id : null;

      res.status(200).json({
        posts: items,
        items,
        nextCursor,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostById(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new NotFoundError('Post not found');
      }

      const post = await PostModel.findById(postId)
        .populate('authorId', 'displayName avatarUrl scholarProfile')
        .exec();

      if (!post || post.status === 'removed') {
        throw new NotFoundError('Post not found');
      }

      let isLiked = false;
      let isSaved = false;
      if (req.user) {
        const [likeDoc, saveDoc] = await Promise.all([
          LikeModel.findOne({ postId: post._id, userId: req.user.id }),
          SaveModel.findOne({ postId: post._id, userId: req.user.id }),
        ]);
        isLiked = Boolean(likeDoc);
        isSaved = Boolean(saveDoc);
      }

      // Increment views count atomically
      await PostModel.findByIdAndUpdate(post._id, { $inc: { 'counts.views': 1 } });

      res.status(200).json({
        post,
        isLiked,
        isSaved,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      // Mux Direct Upload URL mock/implementation
      const uploadId = new mongoose.Types.ObjectId().toString();
      const uploadUrl = `https://video.sanad.internal/upload/${uploadId}`;
      const assetId = `mux_${uploadId}`;

      res.status(200).json({
        uploadUrl,
        assetId,
        maxDurationSeconds: 5400, // up to 90 mins max
      });
    } catch (error) {
      next(error);
    }
  }

  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = new mongoose.Types.ObjectId(req.user!.id);
      const post = await PostModel.create({
        authorId,
        ...req.body,
        status: req.body.muxAssetId ? 'processing' : 'live',
      });

      res.status(201).json({
        message: 'Post created successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id;
      const post = await PostModel.findById(postId).exec();
      if (!post || post.status === 'removed') {
        throw new NotFoundError('Post not found');
      }

      if (post.authorId.toString() !== req.user!.id && !req.user!.roles.includes('admin')) {
        throw new ForbiddenError('Not authorized to edit this post');
      }

      const updated = await PostModel.findByIdAndUpdate(postId, { $set: req.body }, { new: true });
      res.status(200).json({ post: updated });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = req.params.id;
      const post = await PostModel.findById(postId).exec();
      if (!post) {
        throw new NotFoundError('Post not found');
      }

      if (
        post.authorId.toString() !== req.user!.id &&
        !req.user!.roles.some((r) => ['admin', 'moderator'].includes(r))
      ) {
        throw new ForbiddenError('Not authorized to delete this post');
      }

      post.status = 'removed';
      await post.save();

      res.status(200).json({ success: true, message: 'Post removed' });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      const existing = await LikeModel.findOne({ postId, userId });
      if (!existing) {
        await LikeModel.create({ postId, userId });
        await PostModel.findByIdAndUpdate(postId, { $inc: { 'counts.likes': 1 } });
      }

      res.status(200).json({ success: true, message: 'Post liked' });
    } catch (error) {
      next(error);
    }
  }

  async unlikePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      const deleted = await LikeModel.findOneAndDelete({ postId, userId });
      if (deleted) {
        await PostModel.findByIdAndUpdate(postId, {
          $inc: { 'counts.likes': -1 },
        });
      }

      res.status(200).json({ success: true, message: 'Post unliked' });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = new mongoose.Types.ObjectId(req.params.id);
      const comments = await CommentModel.find({ postId, status: 'active' })
        .populate('userId', 'displayName avatarUrl scholarProfile')
        .sort({ createdAt: 1 })
        .limit(100)
        .exec();

      res.status(200).json({ comments });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      const comment = await CommentModel.create({
        postId,
        userId,
        text: req.body.text,
        parentId: req.body.parentId ? new mongoose.Types.ObjectId(req.body.parentId) : undefined,
      });

      await PostModel.findByIdAndUpdate(postId, { $inc: { 'counts.comments': 1 } });

      const populated = await CommentModel.findById(comment._id).populate(
        'userId',
        'displayName avatarUrl scholarProfile'
      );

      res.status(201).json({ comment: populated });
    } catch (error) {
      next(error);
    }
  }

  async savePost(req: Request, res: Response, next: NextFunction) {
    try {
      const postId = new mongoose.Types.ObjectId(req.params.id);
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      const existing = await SaveModel.findOne({ postId, userId });
      if (existing) {
        await SaveModel.deleteOne({ postId, userId });
        return res.status(200).json({ saved: false });
      }

      await SaveModel.create({ postId, userId });
      res.status(200).json({ saved: true });
    } catch (error) {
      next(error);
    }
  }
}

export const contentController = new ContentController();

