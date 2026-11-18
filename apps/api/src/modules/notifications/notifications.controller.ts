import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from './notifications.model.js';
import mongoose from 'mongoose';

export class NotificationsController {
  async listNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const limit = Math.min(Number(req.query.limit) || 40, 100);

      const notifications = await NotificationModel.find({ recipientId: userId })
        .populate('actorId', 'displayName username avatarUrl roles scholarProfile')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      res.status(200).json({ notifications });
    } catch (err) {
      next(err);
    }
  }

  async unreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);
      const count = await NotificationModel.countDocuments({
        recipientId: userId,
        read: false,
      });

      res.status(200).json({ unreadCount: count });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      await NotificationModel.findOneAndUpdate(
        { _id: id, recipientId: userId },
        { read: true }
      );

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user!.id);

      await NotificationModel.updateMany(
        { recipientId: userId, read: false },
        { read: true }
      );

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async getPreferences(_req: Request, res: Response) {
    res.status(200).json({
      quietHoursEnabled: true,
      prayerQuietHours: true,
      pushEnabled: true,
    });
  }

  async updatePreferences(_req: Request, res: Response) {
    res.status(200).json({ success: true });
  }
}

export const notificationsController = new NotificationsController();

