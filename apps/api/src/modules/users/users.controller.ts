import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { UserModel, SessionModel } from '../auth/auth.model.js';
import { FollowModel, BlockModel } from './users.model.js';
import { PostModel } from '../content/content.model.js';
import { AuditLogModel } from '../moderation/moderation.model.js';
import { createAndSendNotification } from '../../services/notification.service.js';
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

      if (!user.publicId) {
        user.publicId = `snd_${crypto.randomBytes(5).toString('hex')}`;
        await user.save();
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
      const {
        username,
        displayName,
        bio,
        avatarUrl,
        isPrivate,
        specialties,
        languages,
        phone,
        email,
        dateOfBirth,
      } = req.body;
      const updateData: Record<string, unknown> = {};

      const currentUserId = req.user!.id;
      const userIdFilter = mongoose.Types.ObjectId.isValid(currentUserId)
        ? new mongoose.Types.ObjectId(currentUserId)
        : currentUserId;

      if (username !== undefined) {
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername) {
          const existing = await UserModel.findOne({
            username: cleanUsername,
            _id: { $ne: userIdFilter },
          }).exec();

          if (existing) {
            throw new ConflictError('Username is already taken');
          }
          updateData.username = cleanUsername;
        }
      }

      if (email !== undefined) {
        const cleanEmail = email.trim().toLowerCase();
        if (cleanEmail) {
          const existingEmail = await UserModel.findOne({
            email: cleanEmail,
            _id: { $ne: userIdFilter },
          }).exec();
          if (existingEmail) {
            throw new ConflictError('Email is already registered to another account');
          }
          updateData.email = cleanEmail;
        }
      }

      if (phone !== undefined) {
        const cleanPhone = phone.trim();
        if (cleanPhone) {
          const existingPhone = await UserModel.findOne({
            phone: cleanPhone,
            _id: { $ne: userIdFilter },
          }).exec();
          if (existingPhone) {
            throw new ConflictError('Contact number is already registered to another account');
          }
          updateData.phone = cleanPhone;
        }
      }

      if (displayName !== undefined && displayName.trim()) {
        updateData.displayName = displayName.trim();
      }
      if (bio !== undefined) {
        updateData.bio = bio.trim();
      }
      if (avatarUrl !== undefined) {
        updateData.avatarUrl = avatarUrl;
      }
      if (dateOfBirth !== undefined) {
        const parsedDob = new Date(dateOfBirth);
        if (!isNaN(parsedDob.getTime())) {
          updateData.dateOfBirth = parsedDob;
        }
      }
      if (isPrivate !== undefined) {
        updateData.isPrivate = Boolean(isPrivate);
      }
      if (specialties) {
        updateData['scholarProfile.specialties'] = specialties;
      }
      if (languages) {
        updateData['scholarProfile.languages'] = languages;
      }

      const user = await UserModel.findByIdAndUpdate(userIdFilter, { $set: updateData }, { new: true })
        .select('-passwordHash -twoFA.secretEnc -twoFA.backupCodes')
        .exec();

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetParam = req.params.id;
      const isObjectId = mongoose.Types.ObjectId.isValid(targetParam);
      const cleanParam = targetParam.startsWith('@') ? targetParam.slice(1).toLowerCase() : targetParam.toLowerCase();

      const baseFilter: Record<string, unknown> = { status: 'active' };
      const identifierFilter = isObjectId
        ? { $or: [{ _id: targetParam }, { username: cleanParam }, { publicId: cleanParam }] }
        : { $or: [{ username: cleanParam }, { publicId: cleanParam }] };

      const user = await UserModel.findOne({ ...baseFilter, ...identifierFilter })
        .select('publicId username displayName avatarUrl bio roles scholarProfile isPrivate status createdAt')
        .exec();

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.publicId) {
        user.publicId = `snd_${crypto.randomBytes(5).toString('hex')}`;
        await user.save();
      }

      const targetId = user._id.toString();

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

      const followerCount = await FollowModel.countDocuments({ followeeId: user._id });
      const followingCount = await FollowModel.countDocuments({ followerId: user._id });
      const lessonsCount = await PostModel.countDocuments({ authorId: user._id, status: 'live' });

      let isFollowing = false;
      let isFollowedBy = false;
      if (req.user) {
        const [followingDoc, followedByDoc] = await Promise.all([
          FollowModel.findOne({ followerId: req.user.id, followeeId: user._id }),
          FollowModel.findOne({ followerId: user._id, followeeId: req.user.id }),
        ]);
        isFollowing = Boolean(followingDoc);
        isFollowedBy = Boolean(followedByDoc);
      }

      const relation =
        isFollowing && isFollowedBy
          ? 'mutual'
          : isFollowing
            ? 'following'
            : isFollowedBy
              ? 'follow_back'
              : 'none';

      res.status(200).json({
        user,
        counts: {
          followers: followerCount,
          following: followingCount,
          lessons: lessonsCount,
        },
        isFollowing,
        isFollowedBy,
        relation,
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

      // Trigger real-time follower notification
      const actor = (await UserModel.findById(req.user!.id)
        .select('displayName username avatarUrl')
        .lean()) as any;

      createAndSendNotification({
        recipientId: targetObjectId,
        actorId: req.user!.id,
        type: 'follow',
        title: 'New Follower',
        body: `${actor?.displayName || 'A user'} started following your profile.`,
        entityId: req.user!.id,
        entityType: 'user',
        metadata: {
          followerUsername: actor?.username,
          followerDisplayName: actor?.displayName,
          followerAvatar: actor?.avatarUrl,
        },
      }).catch(() => {});

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
        const cleanQ = q.trim();
        const strippedQ = cleanQ.startsWith('@') ? cleanQ.slice(1) : cleanQ;
        const regex = new RegExp(strippedQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        query.$or = [
          { username: regex },
          { publicId: regex },
          { displayName: regex },
          { bio: regex },
          { 'scholarProfile.specialties': regex },
        ];
      }

      const users = await UserModel.find(query)
        .select('publicId displayName username avatarUrl bio roles scholarProfile isPrivate createdAt')
        .sort({ 'scholarProfile.verified': -1, createdAt: -1 })
        .limit(50)
        .exec();

      if (req.user) {
        const viewerId = req.user.id;
        const userIds = users.map((u) => u._id);

        const [myFollows, followsMe] = await Promise.all([
          FollowModel.find({ followerId: viewerId, followeeId: { $in: userIds } }).select('followeeId').exec(),
          FollowModel.find({ followerId: { $in: userIds }, followeeId: viewerId }).select('followerId').exec(),
        ]);

        const myFollowSet = new Set(myFollows.map((f: any) => f.followeeId.toString()));
        const followsMeSet = new Set(followsMe.map((f: any) => f.followerId.toString()));

        const enriched = users.map((u) => {
          const uId = u._id.toString();
          const isFollowing = myFollowSet.has(uId);
          const isFollowedBy = followsMeSet.has(uId);
          const relation =
            isFollowing && isFollowedBy
              ? 'mutual'
              : isFollowing
                ? 'following'
                : isFollowedBy
                  ? 'follow_back'
                  : 'none';

          const plain = typeof (u as any).toObject === 'function' ? (u as any).toObject() : u;
          return {
            ...plain,
            isFollowing,
            isFollowedBy,
            relation,
          };
        });

        return res.status(200).json({ users: enriched });
      }

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

      if (!user.publicId) {
        user.publicId = `snd_${crypto.randomBytes(5).toString('hex')}`;
        await user.save();
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

      user.tokenVersion = (user.tokenVersion || 1) + 1;
      await user.save();
      await SessionModel.updateMany({ userId: user._id }, { revokedAt: new Date() }).exec();

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

