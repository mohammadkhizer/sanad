import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { UnauthorizedError, NotFoundError } from '../utils/errors';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { limit = '20', skip = '0' } = req.query;
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string, 10))
      .skip(parseInt(skip as string, 10));

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipientId: req.user._id,
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    await Notification.updateMany(
      { recipientId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}

