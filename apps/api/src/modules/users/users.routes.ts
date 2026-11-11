import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate, optionalAuthenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileSchema } from '@sanad/shared';

const router = Router();

router.get('/me', authenticate, usersController.getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), usersController.updateMe);
router.get('/:id', optionalAuthenticate, usersController.getUser);
router.post('/:id/follow', authenticate, usersController.followUser);
router.delete('/:id/follow', authenticate, usersController.unfollowUser);
router.post('/:id/block', authenticate, usersController.blockUser);
router.delete('/:id/block', authenticate, usersController.unblockUser);

export const usersRouter = router;

