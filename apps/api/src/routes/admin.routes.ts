import { Router } from 'express';
import {
  listApplications,
  decideApplication,
  revokeScholar,
} from '../controllers/admin.scholar.controller';
import {
  listReports,
  actionReport,
  suspendUser,
  getAuditLogs,
} from '../controllers/moderation.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  ApplicationDecisionSchema,
  RevokeScholarSchema,
  ReportActionSchema,
  SuspendUserSchema,
} from '@sanad/types';

const router = Router();

// Scholar Applications Management (moderator review, admin approve)
router.get(
  '/applications',
  authenticate,
  requireRole('moderator', 'admin'),
  listApplications
);

router.post(
  '/applications/:id/decision',
  authenticate,
  requireRole('moderator', 'admin'),
  validateBody(ApplicationDecisionSchema),
  decideApplication
);

router.post(
  '/users/:id/revoke-scholar',
  authenticate,
  requireRole('admin'),
  validateBody(RevokeScholarSchema),
  revokeScholar
);

// Reports Queue & Moderation
router.get(
  '/reports',
  authenticate,
  requireRole('moderator', 'admin'),
  listReports
);

router.post(
  '/reports/:id/action',
  authenticate,
  requireRole('moderator', 'admin'),
  validateBody(ReportActionSchema),
  actionReport
);

router.post(
  '/users/:id/suspend',
  authenticate,
  requireRole('moderator', 'admin'),
  validateBody(SuspendUserSchema),
  suspendUser
);

// Audit Logs (admin only)
router.get(
  '/audit-logs',
  authenticate,
  requireRole('admin'),
  getAuditLogs
);

export const adminRouter = router;

