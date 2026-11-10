import { Request, Response, NextFunction } from 'express';
import { ScholarApplication } from '../models/ScholarApplication';
import { User } from '../models/User';
import { AuditLog } from '../models/Moderation';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/errors';

export async function listApplications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status = 'pending', limit = '20', skip = '0' } = req.query;

    const query: Record<string, unknown> = {};
    if (status) {
      query.status = status;
    }

    const applications = await ScholarApplication.find(query)
      .populate('userId', 'displayName email avatarUrl')
      .sort({ createdAt: 1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    const total = await ScholarApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      meta: {
        total,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function decideApplication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { id } = req.params;
    const { status, reviewNote } = req.body;

    const application = await ScholarApplication.findById(id);
    if (!application) {
      throw new NotFoundError('Scholar application not found');
    }

    const isAdmin = req.user.roles.includes('admin');
    const isModerator = req.user.roles.includes('moderator');

    // Separation of duties: Only Admin can approve scholar applications
    if (status === 'approved' && !isAdmin) {
      throw new ForbiddenError(
        'Separation of duties policy: Only administrators can approve scholar status',
        'ADMIN_APPROVAL_REQUIRED'
      );
    }

    // Moderator or Admin can review or reject
    if (isModerator && !isAdmin) {
      application.reviewedBy = req.user._id;
      application.reviewedAt = new Date();
      if (reviewNote) application.reviewNote = reviewNote;
      application.status = status;
    } else if (isAdmin) {
      application.decidedBy = req.user._id;
      application.decidedAt = new Date();
      if (reviewNote) application.reviewNote = reviewNote;
      application.status = status;

      if (status === 'approved') {
        const applicant = await User.findById(application.userId);
        if (applicant) {
          if (!applicant.roles.includes('scholar')) {
            applicant.roles.push('scholar');
          }
          applicant.scholarProfile.verified = true;
          applicant.scholarProfile.verifiedAt = new Date();
          applicant.scholarProfile.institution = application.institution;
          applicant.scholarProfile.specialties = application.specialties;
          applicant.scholarProfile.languages = application.languages;
          // Increment tokenVersion so user receives fresh role claim on next refresh
          applicant.tokenVersion += 1;
          await applicant.save();
        }
      }
    }

    await application.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: `scholar_application:${status}`,
      targetType: 'scholar_application',
      targetId: application.id,
      meta: { reviewNote, applicantId: application.userId },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeScholar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.roles = user.roles.filter((role) => role !== 'scholar');
    user.scholarProfile.verified = false;
    user.scholarProfile.verifiedAt = undefined;
    // Invalidate existing tokens so scholar actions cease immediately
    user.tokenVersion += 1;
    await user.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'scholar:revoke',
      targetType: 'user',
      targetId: user.id,
      meta: { reason },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Scholar status revoked successfully',
        user,
      },
    });
  } catch (error) {
    next(error);
  }
}

