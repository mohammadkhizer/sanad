import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Follow, Block } from '../models/Social';
import { NotFoundError, AppError, UnauthorizedError } from '../utils/errors';

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { displayName, bio, avatarUrl, phone } = req.body;

    if (displayName) req.user.displayName = displayName;
    if (bio !== undefined) req.user.bio = bio;
    if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl;
    if (phone !== undefined) req.user.phone = phone;

    await req.user.save();

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.status === 'deleted') {
      throw new NotFoundError('User not found');
    }

    // Check if requester has blocked or is blocked
    if (req.user) {
      const isBlocked = await Block.findOne({
        $or: [
          { blockerId: req.user._id, blockedId: user._id },
          { blockerId: user._id, blockedId: req.user._id },
        ],
      });

      if (isBlocked) {
        throw new NotFoundError('User profile unavailable');
      }
    }

    const followersCount = await Follow.countDocuments({ followeeId: user._id });
    const followingCount = await Follow.countDocuments({ followerId: user._id });

    let isFollowing = false;
    if (req.user) {
      const followDoc = await Follow.findOne({ followerId: req.user._id, followeeId: user._id });
      isFollowing = !!followDoc;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          followersCount,
          followingCount,
          isFollowing,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function followUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    if (req.user.id === id) {
      throw new AppError('SELF_FOLLOW_NOT_ALLOWED', 'You cannot follow yourself', 400);
    }

    const targetUser = await User.findById(id);
    if (!targetUser || targetUser.status !== 'active') {
      throw new NotFoundError('Target user not found');
    }

    await Follow.findOneAndUpdate(
      { followerId: req.user._id, followeeId: targetUser._id },
      { followerId: req.user._id, followeeId: targetUser._id },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: { message: 'Successfully followed user' },
    });
  } catch (error) {
    next(error);
  }
}

export async function unfollowUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    await Follow.deleteOne({ followerId: req.user._id, followeeId: id });

    res.status(200).json({
      success: true,
      data: { message: 'Successfully unfollowed user' },
    });
  } catch (error) {
    next(error);
  }
}

export async function blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    if (req.user.id === id) {
      throw new AppError('SELF_BLOCK_NOT_ALLOWED', 'You cannot block yourself', 400);
    }

    await Block.findOneAndUpdate(
      { blockerId: req.user._id, blockedId: id },
      { blockerId: req.user._id, blockedId: id },
      { upsert: true, new: true }
    );

    // Also remove any existing follow
    await Follow.deleteOne({ followerId: req.user._id, followeeId: id });
    await Follow.deleteOne({ followerId: id, followeeId: req.user._id });

    res.status(200).json({
      success: true,
      data: { message: 'User blocked' },
    });
  } catch (error) {
    next(error);
  }
}

export async function unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    await Block.deleteOne({ blockerId: req.user._id, blockedId: id });

    res.status(200).json({
      success: true,
      data: { message: 'User unblocked' },
    });
  } catch (error) {
    next(error);
  }
}

