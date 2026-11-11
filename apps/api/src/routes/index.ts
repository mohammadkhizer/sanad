import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { scholarRouter } from '../modules/scholar/scholar.routes.js';
import { contentRouter } from '../modules/content/content.routes.js';
import { liveRouter } from '../modules/live/live.routes.js';
import { messagingRouter } from '../modules/messaging/messaging.routes.js';
import { moderationRouter } from '../modules/moderation/moderation.routes.js';
import { adminRouter } from '../modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/scholar', scholarRouter);
router.use('/', contentRouter);
router.use('/', liveRouter);
router.use('/', messagingRouter);
router.use('/', moderationRouter);
router.use('/admin', adminRouter);

export const apiRouter = router;

