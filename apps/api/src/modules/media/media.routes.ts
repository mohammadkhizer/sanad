import { Router } from 'express';
import { mediaController } from './media.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.js';

const router = Router();

// Presigned PUT upload URL for scholars (reels, videos) and members (credentials, avatars)
router.post('/upload-url', authenticate, mediaController.getUploadUrl);

// Upload completion confirmation
router.post('/complete', authenticate, mediaController.completeUpload);

// Magic-byte sniffing validation
router.post('/sniff-test', authenticate, mediaController.verifySniff);

// Reviewer-only signed GET URL for credentials in private bucket
router.get(
  '/credentials/signed-url',
  authenticate,
  requirePermission('application:review'),
  mediaController.getReviewerCredentialSignedUrl
);

export const mediaRouter = router;
