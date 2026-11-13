import { Router } from 'express';
import { notificationsController } from './notifications.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, notificationsController.listNotifications);
router.get('/unread-count', authenticate, notificationsController.unreadCount);
router.put('/read-all', authenticate, notificationsController.markAllRead);
router.put('/:id/read', authenticate, notificationsController.markRead);
router.get('/preferences', authenticate, notificationsController.getPreferences);
router.put('/preferences', authenticate, notificationsController.updatePreferences);

export const notificationsRouter = router;

