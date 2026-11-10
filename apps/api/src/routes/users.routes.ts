import { Router } from 'express';
import {
  getMe,
  updateMe,
  getUserById,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
} from '../controllers/users.controller';
import { deleteAccount } from '../controllers/auth.controller';
import { authenticate, optionalAuth } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { UpdateUserSchema } from '@sanad/types';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validateBody(UpdateUserSchema), updateMe);
router.delete('/me', authenticate, deleteAccount);

router.get('/:id', optionalAuth, getUserById);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);
router.post('/:id/block', authenticate, blockUser);
router.delete('/:id/block', authenticate, unblockUser);

export const usersRouter = router;
