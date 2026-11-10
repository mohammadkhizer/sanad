import { Request, Response, NextFunction } from 'express';
import { Report, AuditLog } from '../models/Moderation';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { RefreshToken } from '../models/RefreshToken';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export async function createReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { targetType, targetId, reason, details } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
      details,
      status: 'pending',
    });

    await AuditLog.create({
      actorId: req.user._id,
      action: 'report:create',
      targetType,
      targetId,
      meta: { reason },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function listReports(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status = 'pending', limit = '20', skip = '0' } = req.query;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const reports = await Report.find(query)
      .populate('reporterId', 'displayName email avatarUrl')
      .populate('handledBy', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      meta: { total },
    });
  } catch (error) {
    next(error);
  }
}

export async function actionReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { action, resolutionNote, suspendUser, removeContent } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    report.status = action === 'resolve' ? 'resolved' : 'dismissed';
    report.handledBy = req.user._id;
    if (resolutionNote) report.resolutionNote = resolutionNote;
    await report.save();

    // Content removal
    if (removeContent) {
      if (report.targetType === 'post') {
        await Post.findByIdAndUpdate(report.targetId, { status: 'removed' });
      } else if (report.targetType === 'comment') {
        await Comment.findByIdAndUpdate(report.targetId, { status: 'removed' });
      }
    }

    // User suspension
    if (suspendUser) {
      let targetUserId = report.targetId;
      if (report.targetType === 'post') {
        const p = await Post.findById(report.targetId);
        if (p) targetUserId = p.authorId;
      } else if (report.targetType === 'comment') {
        const c = await Comment.findById(report.targetId);
        if (c) targetUserId = c.userId;
      }

      await User.findByIdAndUpdate(targetUserId, {
        status: 'suspended',
        $inc: { tokenVersion: 1 },
        suspension: { reason: resolutionNote || 'Violated platform safety guidelines' },
      });
      await RefreshToken.updateMany({ userId: targetUserId }, { isRevoked: true });
    }

    await AuditLog.create({
      actorId: req.user._id,
      action: `report:${action}`,
      targetType: 'report',
      targetId: report.id,
      meta: { suspendUser, removeContent, resolutionNote },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;
    const { reason, durationDays } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    let until: Date | undefined;
    if (durationDays) {
      until = new Date();
      until.setDate(until.getDate() + durationDays);
    }

    targetUser.status = 'suspended';
    targetUser.suspension = { reason, until };
    // Invalidate tokens immediately
    targetUser.tokenVersion += 1;
    await targetUser.save();

    await RefreshToken.updateMany(
      { userId: targetUser._id },
      { isRevoked: true, revokedAt: new Date() }
    );

    await AuditLog.create({
      actorId: req.user._id,
      action: 'user:suspend',
      targetType: 'user',
      targetId: targetUser.id,
      meta: { reason, durationDays },
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'User account has been suspended',
        user: targetUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { limit = '50', skip = '0', action } = req.query;

    const query: Record<string, unknown> = {};
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate('actorId', 'displayName email roles')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: logs,
      meta: { total },
    });
  } catch (error) {
    next(error);
  }
}
