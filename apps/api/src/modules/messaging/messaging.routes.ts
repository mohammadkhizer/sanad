import { Router } from 'express';
import { messagingController } from './messaging.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import {
  sendChatRequestSchema,
  respondChatRequestSchema,
  sendMessageSchema,
} from '@sanad/shared';

const router = Router();

router.post(
  '/chat/requests',
  authenticate,
  requirePermission('chat:request'),
  validate(sendChatRequestSchema),
  messagingController.sendChatRequest
);

router.post(
  '/chat/requests/:id/respond',
  authenticate,
  requirePermission('chat:accept_initiate'),
  validate(respondChatRequestSchema),
  messagingController.respondChatRequest
);

router.get('/conversations', authenticate, messagingController.getConversations);

router.get('/conversations/:id/messages', authenticate, messagingController.getMessages);

router.post(
  '/conversations/:id/messages',
  authenticate,
  validate(sendMessageSchema.omit({ conversationId: true })),
  messagingController.sendMessage
);

export const messagingRouter = router;

