import { Router } from 'express';
import { liveController } from './live.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.js';
import { requirePermission, require2FA } from '../../middlewares/rbac.js';
import { validate } from '../../middlewares/validate.js';
import { createLiveSchema, initiateCallSchema, respondCallSchema } from '@sanad/shared';

const router = Router();

router.get('/live', optionalAuthenticate, liveController.getActiveLives);

router.post(
  '/live',
  authenticate,
  requirePermission('live:host'),
  require2FA,
  validate(createLiveSchema),
  liveController.startLive
);

router.post('/live/:id/end', authenticate, liveController.endLive);
router.post(
  '/live/:id/token',
  authenticate,
  requirePermission('live:watch_chat'),
  liveController.getViewerToken
);

router.post(
  '/calls',
  authenticate,
  requirePermission('call:initiate'),
  validate(initiateCallSchema),
  liveController.initiateCall
);

router.post(
  '/calls/:id/respond',
  authenticate,
  validate(respondCallSchema),
  liveController.respondCall
);

export const liveRouter = router;

