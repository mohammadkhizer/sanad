import { Request, Response, NextFunction } from 'express';
import { AuditLogModel } from '../modules/moderation/moderation.model.js';
import mongoose from 'mongoose';

export function auditAction(action: string, targetType: string, getTargetId?: (req: Request) => string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
      const targetId = getTargetId ? getTargetId(req) : req.params.id;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      await AuditLogModel.create({
        actorId,
        action,
        targetType,
        targetId,
        meta: {
          path: req.originalUrl,
          method: req.method,
          body: req.body,
        },
        ip,
      });
    } catch {
      // Never fail the request because of audit logging
    }
    next();
  };
}

