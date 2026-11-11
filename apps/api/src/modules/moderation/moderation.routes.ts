import { Router } from 'express';
import { moderationController } from './moderation.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { createReportSchema, moderationActionSchema } from '@sanad/shared';

const router = Router();

router.post(
  '/reports',
  authenticate,
  validate(createReportSchema),
  moderationController.createReport
);

export const moderationRouter = router;

