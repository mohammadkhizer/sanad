import { Router } from 'express';
import { scholarController } from '../scholar/scholar.controller.js';
import { moderationController } from '../moderation/moderation.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { reviewScholarApplicationSchema, moderationActionSchema } from '@sanad/shared';

const router = Router();

// Scholar Application Moderation
router.get(
  '/applications',
  authenticate,
  requirePermission('application:review'),
  scholarController.listApplications
);

router.post(
  '/applications/:id/decision',
  authenticate,
  requirePermission('application:review'),
  validate(reviewScholarApplicationSchema),
  scholarController.decideApplication
);

router.post(
  '/users/:id/revoke-scholar',
  authenticate,
  requirePermission('role:revoke_scholar'),
  scholarController.revokeScholar
);

// Reports and Moderation
router.get(
  '/reports',
  authenticate,
  requirePermission('application:review'),
  moderationController.listReports
);

router.post(
  '/reports/:id/action',
  authenticate,
  requirePermission('application:review'),
  validate(moderationActionSchema),
  moderationController.handleReportAction
);

router.post(
  '/users/:id/suspend',
  authenticate,
  requirePermission('user:suspend'),
  moderationController.suspendUser
);

// Audit Logs
router.get(
  '/audit-logs',
  authenticate,
  requirePermission('audit:view'),
  moderationController.getAuditLogs
);

export const adminRouter = router;

