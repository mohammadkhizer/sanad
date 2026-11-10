import { Router } from 'express';
import {
  submitApplication,
  getMyApplication,
  getCredentialUploadUrl,
  endorseApplication,
} from '../controllers/scholar.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  SubmitScholarApplicationSchema,
  EndorseApplicationSchema,
} from '@sanad/types';

const router = Router();

router.post(
  '/applications',
  authenticate,
  requireRole('member'),
  validateBody(SubmitScholarApplicationSchema),
  submitApplication
);

router.get(
  '/applications/me',
  authenticate,
  requireRole('member'),
  getMyApplication
);

router.post(
  '/applications/upload-url',
  authenticate,
  requireRole('member'),
  getCredentialUploadUrl
);

router.post(
  '/applications/:id/endorse',
  authenticate,
  requireRole('scholar'),
  validateBody(EndorseApplicationSchema),
  endorseApplication
);

export const scholarRouter = router;

