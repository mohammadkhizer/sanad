import { Request, Response, NextFunction } from 'express';
import { ReportModel, AuditLogModel } from './moderation.model.js';
import { UserModel, SessionModel } from '../auth/auth.model.js';
import { PostModel } from '../content/content.model.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';
import mongoose from 'mongoose';

export class ModerationController {
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await ReportModel.create({
        reporterId: req.user!.id,
        targetType: req.body.targetType,
        targetId: req.body.targetId,
        reason: req.body.reason,
      });

      // Automated moderation rule: 3 reports in 1 hour auto-hides the target content
      if (req.body.targetType === 'post') {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const reportCount = await ReportModel.countDocuments({
          targetType: 'post',
          targetId: req.body.targetId,
          createdAt: { $gte: oneHourAgo },
        }).exec();

        if (reportCount >= 3) {
          await PostModel.findByIdAndUpdate(req.body.targetId, {
            status: 'removed',
          }).exec();

          await AuditLogModel.create({
            action: 'post:auto_hide',
            targetType: 'post',
            targetId: req.body.targetId,
            reason: 'Automated policy rule triggered: 3 reports received within 1 hour',
          });
        }
      }

      res.status(201).json({
        message: 'Report received and queued for review',
        report,
      });
    } catch (error) {
      next(error);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const filter = status ? { status } : {};

      const reports = await ReportModel.find(filter)
        .populate('reporterId', 'displayName email')
        .sort({ createdAt: -1 })
        .limit(100)
        .exec();

      res.status(200).json({ reports });
    } catch (error) {
      next(error);
    }
  }

  async handleReportAction(req: Request, res: Response, next: NextFunction) {
    try {
      const reportId = req.params.id;
      const { action, reason, durationDays } = req.body;

      const report = await ReportModel.findById(reportId).exec();
      if (!report) {
        throw new NotFoundError('Report not found');
      }

      // Permanent ban requires admin role
      if (action === 'ban' && !req.user!.roles.includes('admin')) {
        throw new ForbiddenError('Only administrators can issue permanent bans');
      }

      report.status = 'resolved';
      report.handledBy = new mongoose.Types.ObjectId(req.user!.id);
      report.resolutionNote = `Action: ${action} - Reason: ${reason}`;
      await report.save();

      // Execute moderation action
      if (action === 'remove_content' && report.targetType === 'post') {
        await PostModel.findByIdAndUpdate(report.targetId, { status: 'removed' });
      } else if (action === 'suspend' || action === 'ban') {
        const userToSuspend =
          report.targetType === 'user'
            ? report.targetId
            : (await PostModel.findById(report.targetId))?.authorId;

        if (userToSuspend) {
          await UserModel.findByIdAndUpdate(userToSuspend, { status: 'suspended' });
        }
      }

      // Record audit log
      await AuditLogModel.create({
        actorId: req.user!.id,
        action: `moderation:${action}`,
        targetType: report.targetType,
        targetId: report.targetId,
        meta: { reportId, reason, durationDays },
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      });

      res.status(200).json({ success: true, message: `Action ${action} executed successfully` });
    } catch (error) {
      next(error);
    }
  }

  async suspendUser(req: Request, res: Response, next: NextFunction) {
    try {
      const targetUserId = req.params.id;
      const { reason, status: requestedStatus } = req.body;

      const user = await UserModel.findById(targetUserId).exec();
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Admin can disable any user of any role
      const nextStatus = requestedStatus || (user.status === 'active' ? 'disabled' : 'active');
      user.status = nextStatus;
      user.tokenVersion = (user.tokenVersion || 1) + 1;
      await user.save();

      // Revoke all active sessions immediately if disabled/suspended
      if (nextStatus === 'disabled' || nextStatus === 'suspended') {
        await SessionModel.updateMany({ userId: user._id }, { revokedAt: new Date() }).exec();
      }

      await AuditLogModel.create({
        actorId: req.user!.id,
        action: nextStatus === 'active' ? 'user:enable' : 'user:disable',
        targetType: 'user',
        targetId: targetUserId,
        meta: { reason, newStatus: nextStatus, roles: user.roles },
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      });

      res.status(200).json({
        success: true,
        message: `User account is now ${nextStatus}`,
        status: nextStatus,
        user: { _id: user._id, displayName: user.displayName, username: user.username, status: user.status, roles: user.roles },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditLogModel.find()
        .populate('actorId', 'displayName email roles')
        .sort({ createdAt: -1 })
        .limit(100)
        .exec();

      res.status(200).json({ logs });
    } catch (error) {
      next(error);
    }
  }
}

export const moderationController = new ModerationController();

