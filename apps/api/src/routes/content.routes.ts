import { Router } from 'express';
import {
  getUploadUrl,
  createPost,
  getFeed,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  getComments,
  createComment,
} from '../controllers/content.controller';
import { authenticate, optionalAuth, requireRole, require2FA } from '../middlewares/auth';
import { validateBody, validateQuery } from '../middlewares/validate';
import {
  CreatePostSchema,
  UpdatePostSchema,
  FeedQuerySchema,
  CreateCommentSchema,
} from '@sanad/types';

const router = Router();

// Feed (can also be mounted directly at /feed or /posts)
router.get('/', optionalAuth, validateQuery(FeedQuerySchema), getFeed);
router.get('/:id', optionalAuth, getPostById);

// Scholar Video/Reel upload
router.post(
  '/upload-url',
  authenticate,
  requireRole('scholar'),
  require2FA,
  getUploadUrl
);

router.post(
  '/',
  authenticate,
  requireRole('scholar'),
  require2FA,
  validateBody(CreatePostSchema),
  createPost
);

router.patch('/:id', authenticate, validateBody(UpdatePostSchema), updatePost);
router.delete('/:id', authenticate, deletePost);

// Social interactions
router.post('/:id/like', authenticate, likePost);
router.delete('/:id/like', authenticate, unlikePost);
router.post('/:id/save', authenticate, savePost);

// Comments
router.get('/:id/comments', optionalAuth, getComments);
router.post('/:id/comments', authenticate, validateBody(CreateCommentSchema), createComment);

export const contentRouter = router;
