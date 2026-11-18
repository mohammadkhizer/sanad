import { Router } from 'express';
import { contentController } from './content.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.js';
import { requirePermission, require2FA } from '../../middlewares/rbac.js';
import { validate, validateQuery } from '../../middlewares/validate.js';
import {
  createPostSchema,
  updatePostSchema,
  addCommentSchema,
  feedQuerySchema,
} from '@sanad/shared';

const router = Router();

router.get('/feed', optionalAuthenticate, validateQuery(feedQuerySchema), contentController.getFeed);
router.get('/posts/:id', optionalAuthenticate, contentController.getPostById);

router.post(
  '/posts/upload-url',
  authenticate,
  requirePermission('content:create'),
  contentController.getUploadUrl
);

router.post(
  '/posts',
  authenticate,
  requirePermission('content:create'),
  require2FA,
  validate(createPostSchema),
  contentController.createPost
);

router.patch(
  '/posts/:id',
  authenticate,
  validate(updatePostSchema),
  contentController.updatePost
);

router.delete(
  '/posts/:id',
  authenticate,
  contentController.deletePost
);

router.post(
  '/posts/:id/like',
  authenticate,
  requirePermission('content:like_comment'),
  contentController.likePost
);

router.delete(
  '/posts/:id/like',
  authenticate,
  requirePermission('content:like_comment'),
  contentController.unlikePost
);

router.get('/posts/:id/comments', optionalAuthenticate, contentController.getComments);

router.post(
  '/posts/:id/comments',
  authenticate,
  requirePermission('content:like_comment'),
  validate(addCommentSchema),
  contentController.addComment
);

router.post(
  '/posts/:id/save',
  authenticate,
  requirePermission('content:like_comment'),
  contentController.savePost
);

export const contentRouter = router;

