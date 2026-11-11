import { Request, Response, NextFunction } from 'express';
import { ScholarApplicationModel } from './scholar.model.js';
import { UserModel } from '../auth/auth.model.js';
import { NotFoundError, ConflictError, ForbiddenError, ValidationError } from '../../utils/errors.js';
import mongoose from 'mongoose';
import crypto from 'node:crypto';

export class ScholarController {
  async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      // Check if user already has an active or pending application
      const existing = await ScholarApplicationModel.findOne({
        userId,
        status: { $in: ['pending', 'more_info', 'approved'] },
      }).exec();

      if (existing) {
        throw new ConflictError('You already have an active scholar application', 'APPLICATION_EXISTS');
      }

      const application = await ScholarApplicationModel.create({
        userId,
        ...req.body,
      });

      res.status(201).json({
        message: 'Scholar application submitted for review',
        application,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await ScholarApplicationModel.findOne({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .exec();

      res.status(200).json({ application });
    } catch (error) {
      next(error);
    }
  }

  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const fileKey = `credentials/${req.user!.id}/${crypto.randomUUID()}.pdf`;
      // Pre-signed R2/S3 upload url placeholder (simulated or real S3 SDK)
      const uploadUrl = `https://storage.sanad.internal/${fileKey}?expires=900`;

      res.status(200).json({
        uploadUrl,
        fileKey,
        expiresInSeconds: 900,
      });
    } catch (error) {
      next(error);
    }
  }

  async endorseScholar(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = req.params.id;
      const application = await ScholarApplicationModel.findById(applicationId).exec();

      if (!application) {
        throw new NotFoundError('Application not found');
      }

      const scholarId = new mongoose.Types.ObjectId(req.user!.id);
      if (application.userId.toString() === req.user!.id) {
        throw new ConflictError('You cannot endorse your own application');
      }

      const alreadyEndorsed = application.endorsements.some(
        (e: any) => e.scholarId.toString() === req.user!.id
      );
      if (alreadyEndorsed) {
        throw new ConflictError('You have already endorsed this application');
      }

      application.endorsements.push({
        scholarId,
        note: req.body.note,
        createdAt: new Date(),
      });
      await application.save();

      res.status(200).json({ success: true, message: 'Endorsement added successfully' });
    } catch (error) {
      next(error);
    }
  }

  async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const filter = status ? { status } : {};

      const applications = await ScholarApplicationModel.find(filter)
        .populate('userId', 'displayName email phone createdAt')
        .sort({ createdAt: -1 })
        .exec();

      res.status(200).json({ applications });
    } catch (error) {
      next(error);
    }
  }

  async decideApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationId = req.params.id;
      const { decision, reviewNote } = req.body;

      const application = await ScholarApplicationModel.findById(applicationId).exec();
      if (!application) {
        throw new NotFoundError('Application not found');
      }

      // Moderator can review or request more_info; only Admin can grant approval
      if (decision === 'approved' && !req.user!.roles.includes('admin')) {
        throw new ForbiddenError('Only an administrator can approve scholar applications', 'ADMIN_REQUIRED');
      }

      application.status = decision;
      application.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
      application.reviewNote = reviewNote;
      await application.save();

      if (decision === 'approved') {
        const user = await UserModel.findById(application.userId).exec();
        if (user) {
          if (!user.roles.includes('scholar')) {
            user.roles.push('scholar');
          }
          user.scholarProfile = {
            verified: true,
            verifiedAt: new Date(),
            institution: application.institution,
            specialties: application.specialties,
            languages: application.languages,
          };
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: `Application ${decision}`,
        application,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeScholar(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.id;
      const user = await UserModel.findById(targetUserId).exec();
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.roles = user.roles.filter((r: string) => r !== 'scholar');
      if (user.scholarProfile) {
        user.scholarProfile.verified = false;
      }
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Scholar verification revoked immediately',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const scholarController = new ScholarController();

