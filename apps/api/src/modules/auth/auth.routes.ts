import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  adminRegisterSchema,
  verifyOtpSchema,
  loginSchema,
  refreshTokenSchema,
  totpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@sanad/shared';

const router = Router();

router.get('/check-username', authRateLimiter, authController.checkUsername);
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/admin-register', authRateLimiter, validate(adminRegisterSchema), authController.adminRegister);
router.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), authController.verifyOtp);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authRateLimiter, validate(refreshTokenSchema), authController.refresh);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);
router.post('/2fa/setup', authenticate, authController.setup2FA);
router.post('/2fa/verify', authenticate, validate(totpVerifySchema), authController.verify2FA);
router.get('/sessions', authenticate, authController.getSessions);

export const authRouter = router;

