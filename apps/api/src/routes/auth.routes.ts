import { Router } from 'express';
import {
  register,
  verifyOtp,
  login,
  refreshToken,
  logout,
  logoutAll,
  setup2FA,
  verify2FA,
  deleteAccount,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  VerifyOtpRequestSchema,
  RefreshTokenRequestSchema,
  TwoFactorVerifySchema,
} from '@sanad/types';

const router = Router();

router.post('/register', validateBody(RegisterRequestSchema), register);
router.post('/verify-otp', validateBody(VerifyOtpRequestSchema), verifyOtp);
router.post('/login', validateBody(LoginRequestSchema), login);
router.post('/refresh', validateBody(RefreshTokenRequestSchema), refreshToken);
router.post('/logout', logout);
router.post('/logout-all', authenticate, logoutAll);

// 2FA Endpoints
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, validateBody(TwoFactorVerifySchema), verify2FA);

export const authRouter = router;
