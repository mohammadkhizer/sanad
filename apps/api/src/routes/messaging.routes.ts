import { Router } from 'express';
import {
  createChatRequest,
  respondChatRequest,
  getConversations,
  getMessages,
  sendMessage,
  createCall,
  respondCall,
} from '../controllers/messaging.controller';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  CreateChatRequestSchema,
  RespondChatRequestSchema,
  SendMessageSchema,
  CreateCallSessionSchema,
  RespondCallSessionSchema,
} from '@sanad/types';

const router = Router();

// Chat requests
router.post('/requests', authenticate, validateBody(CreateChatRequestSchema), createChatRequest);
router.post(
  '/requests/:id/respond',
  authenticate,
  validateBody(RespondChatRequestSchema),
  respondChatRequest
);

// Conversations and Messages
router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id/messages', authenticate, getMessages);
router.post(
  '/conversations/:id/messages',
  authenticate,
  validateBody(SendMessageSchema),
  sendMessage
);

// Calls
router.post('/calls', authenticate, validateBody(CreateCallSessionSchema), createCall);
router.post(
  '/calls/:id/respond',
  authenticate,
  validateBody(RespondCallSessionSchema),
  respondCall
);

export const messagingRouter = router;
