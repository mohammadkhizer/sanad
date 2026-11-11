import { Router } from 'express';
import { scholarController } from './scholar.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission, requireRole } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import {
  submitScholarApplicationSchema,
  reviewScholarApplicationSchema,
} from '@sanad/shared';

const router = Router();

// Member scholar application routes
router.post(
  '/applications',
  authenticate,
  requirePermission('application:submit'),
  validate(submitScholarApplicationSchema),
  scholarController.submitApplication
);

router.get('/applications/me', authenticate, scholarController.getMyApplication);
router.post('/applications/upload-url', authenticate, scholarController.getUploadUrl);

router.post(
  '/applications/:id/endorse',
  authenticate,
  requireRole('scholar'),
  scholarController.endorseScholar
);

export const scholarRouter = router;

