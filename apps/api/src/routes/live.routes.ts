import { Router } from 'express';
import {
  createLive,
  endLive,
  listActiveLives,
  getViewerToken,
} from '../controllers/live.controller';
import { authenticate, optionalAuth, requireRole, require2FA } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateLiveSessionSchema } from '@sanad/types';

const router = Router();

router.get('/', optionalAuth, listActiveLives);
router.post(
  '/',
  authenticate,
  requireRole('scholar'),
  require2FA,
  validateBody(CreateLiveSessionSchema),
  createLive
);
router.post('/:id/end', authenticate, endLive);
router.post('/:id/token', authenticate, getViewerToken);

export const liveRouter = router;

