import { Router } from 'express';
import { authRouter } from './auth.routes';
import { usersRouter } from './users.routes';
import { scholarRouter } from './scholar.routes';
import { contentRouter } from './content.routes';
import { liveRouter } from './live.routes';
import { messagingRouter } from './messaging.routes';
import { moderationRouter } from './moderation.routes';
import { adminRouter } from './admin.routes';
import { notificationRouter } from './notification.routes';
import { webhookRouter } from './webhook.routes';
import { getFeed } from '../controllers/content.controller';
import { optionalAuth } from '../middlewares/auth';
import { validateQuery } from '../middlewares/validate';
import { FeedQuerySchema } from '@sanad/types';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/scholar', scholarRouter);
apiRouter.use('/posts', contentRouter);
apiRouter.get('/feed', optionalAuth, validateQuery(FeedQuerySchema), getFeed);
apiRouter.use('/live', liveRouter);
apiRouter.use('/chat', messagingRouter);
apiRouter.use('/conversations', messagingRouter);
apiRouter.use('/calls', messagingRouter);
apiRouter.use('/reports', moderationRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/webhooks', webhookRouter);

export { apiRouter };
