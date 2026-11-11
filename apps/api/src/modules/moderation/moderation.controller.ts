import { Request, Response, NextFunction } from 'express';
import { ReportModel, AuditLogModel } from './moderation.model.js';
import { UserModel } from '../auth/auth.model.js';
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
      const { reason } = req.body;

      const user = await UserModel.findById(targetUserId).exec();
      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.status = 'suspended';
      await user.save();

      await AuditLogModel.create({
        actorId: req.user!.id,
        action: 'user:suspend',
        targetType: 'user',
        targetId: targetUserId,
        meta: { reason },
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
      });

      res.status(200).json({ success: true, message: 'User suspended' });
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

