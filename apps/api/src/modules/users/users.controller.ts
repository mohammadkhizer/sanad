import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../auth/auth.model.js';
import { FollowModel, BlockModel } from './users.model.js';
import { PostModel } from '../content/content.model.js';
import { AuditLogModel } from '../moderation/moderation.model.js';
import { NotFoundError, ConflictError, ValidationError } from '../../utils/errors.js';
import mongoose from 'mongoose';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserModel.findById(req.user!.id)
        .select('-passwordHash -twoFA.secretEnc -twoFA.backupCodes')
        .exec();

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const followerCount = await FollowModel.countDocuments({ followeeId: user._id });
      const followingCount = await FollowModel.countDocuments({ followerId: user._id });
      const lessonsCount = await PostModel.countDocuments({ authorId: user._id, status: 'live' });

      res.status(200).json({
        user,
        counts: {
          followers: followerCount,
          following: followingCount,
          lessons: lessonsCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const { displayName, bio, avatarUrl, specialties, languages } = req.body;
      const updateData: Record<string, unknown> = {};

      if (displayName) updateData.displayName = displayName;
      if (bio !== undefined) updateData.bio = bio;
      if (avatarUrl) updateData.avatarUrl = avatarUrl;
      if (specialties) updateData['scholarProfile.specialties'] = specialties;
      if (languages) updateData['scholarProfile.languages'] = languages;

      const user = await UserModel.findByIdAndUpdate(req.user!.id, { $set: updateData }, { new: true })
        .select('-passwordHash -twoFA.secretEnc -twoFA.backupCodes')
        .exec();

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new NotFoundError('User not found');
      }

      // Check block status if viewer is logged in
      if (req.user) {
        const isBlocked = await BlockModel.findOne({
          $or: [
            { blockerId: req.user.id, blockedId: targetId },
            { blockerId: targetId, blockedId: req.user.id },
          ],
        });
        if (isBlocked) {
          throw new NotFoundError('User not found');
        }
      }

      const user = await UserModel.findById(targetId)
        .select('displayName avatarUrl bio roles scholarProfile createdAt')
        .exec();

      if (!user || user.status !== 'active') {
        throw new NotFoundError('User not found');
      }

      const followerCount = await FollowModel.countDocuments({ followeeId: user._id });
      const followingCount = await FollowModel.countDocuments({ followerId: user._id });
      const lessonsCount = await PostModel.countDocuments({ authorId: user._id, status: 'live' });

      let isFollowing = false;
      if (req.user) {
        const followDoc = await FollowModel.findOne({
          followerId: req.user.id,
          followeeId: user._id,
        });
        isFollowing = Boolean(followDoc);
      }

      res.status(200).json({
        user,
        counts: {
          followers: followerCount,
          following: followingCount,
          lessons: lessonsCount,
        },
        isFollowing,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNetwork(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(targetId)) {
        return res.status(200).json({ followers: [], following: [] });
      }

      const targetObjectId = new mongoose.Types.ObjectId(targetId);

      const [followerDocs, followingDocs] = await Promise.all([
        FollowModel.find({ followeeId: targetObjectId })
          .populate('followerId', 'displayName username avatarUrl roles scholarProfile bio')
          .limit(50)
          .exec(),
        FollowModel.find({ followerId: targetObjectId })
          .populate('followeeId', 'displayName username avatarUrl roles scholarProfile bio')
          .limit(50)
          .exec(),
      ]);

      const followers = followerDocs
        .map((f: any) => f.followerId)
        .filter(Boolean);
      const following = followingDocs
        .map((f: any) => f.followeeId)
        .filter(Boolean);

      res.status(200).json({ followers, following });
    } catch (error) {
      next(error);
    }
  }

  async followUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      if (targetId === req.user!.id) {
        throw new ConflictError('Cannot follow yourself');
      }

      const targetObjectId = new mongoose.Types.ObjectId(targetId);
      const followerObjectId = new mongoose.Types.ObjectId(req.user!.id);

      await FollowModel.findOneAndUpdate(
        { followerId: followerObjectId, followeeId: targetObjectId },
        { followerId: followerObjectId, followeeId: targetObjectId },
        { upsert: true, new: true }
      );

      res.status(200).json({ success: true, message: 'Followed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async unfollowUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      await FollowModel.deleteOne({
        followerId: new mongoose.Types.ObjectId(req.user!.id),
        followeeId: new mongoose.Types.ObjectId(targetId),
      });

      res.status(200).json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      if (targetId === req.user!.id) {
        throw new ConflictError('Cannot block yourself');
      }

      const blockerId = new mongoose.Types.ObjectId(req.user!.id);
      const blockedId = new mongoose.Types.ObjectId(targetId);

      await BlockModel.findOneAndUpdate(
        { blockerId, blockedId },
        { blockerId, blockedId },
        { upsert: true, new: true }
      );

      // Remove mutual follows
      await FollowModel.deleteMany({
        $or: [
          { followerId: blockerId, followeeId: blockedId },
          { followerId: blockedId, followeeId: blockerId },
        ],
      });

      res.status(200).json({ success: true, message: 'User blocked' });
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetId = req.params.id;
      await BlockModel.deleteOne({
        blockerId: new mongoose.Types.ObjectId(req.user!.id),
        blockedId: new mongoose.Types.ObjectId(targetId),
      });

      res.status(200).json({ success: true, message: 'User unblocked' });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const q = req.query.q as string;
      const role = req.query.role as string;
      const query: Record<string, unknown> = { status: 'active' };

      if (role) {
        query.roles = role;
      }

      if (q && q.trim()) {
        const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [
          { displayName: regex },
          { username: regex },
          { bio: regex },
          { 'scholarProfile.specialties': regex },
        ];
      }

      const users = await UserModel.find(query)
        .select('displayName username avatarUrl bio roles scholarProfile createdAt')
        .sort({ 'scholarProfile.verified': -1, createdAt: -1 })
        .limit(50)
        .exec();

      res.status(200).json({ users });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      if (!Array.isArray(roles) || roles.length === 0) {
        throw new ValidationError('Roles must be a non-empty array of valid roles');
      }

      const user = await UserModel.findById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.roles = roles;
      if (roles.includes('scholar') && !user.scholarProfile?.verified) {
        user.scholarProfile = {
          verified: true,
          verifiedAt: new Date(),
          institution: user.scholarProfile?.institution || 'Sanad Academic Council',
          specialties: user.scholarProfile?.specialties || ['General Islamic Sciences'],
        };
      } else if (!roles.includes('scholar') && user.scholarProfile?.verified) {
        user.scholarProfile.verified = false;
      }

      await user.save();

      await AuditLogModel.create({
        actorId: new mongoose.Types.ObjectId(req.user!.id),
        action: 'role:update',
        targetId: user._id,
        targetType: 'user',
        details: { newRoles: roles },
      });

      res.status(200).json({
        success: true,
        user: {
          _id: user._id.toString(),
          displayName: user.displayName,
          email: user.email,
          roles: user.roles,
          scholarProfile: user.scholarProfile,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();

