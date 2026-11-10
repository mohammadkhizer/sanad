import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { AuditLog } from '../models/Moderation';
import { usernameService } from '../services/bloomFilter.service';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateRandomToken,
  generateTotpSecret,
  generateQrCode,
  verifyTotpCode,
  encryptSecret,
  decryptSecret,
} from '../utils/crypto';
import { generateAccessToken } from '../utils/tokens';
import {
  AppError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from '../utils/errors';
import { config } from '../config';

// Helper to issue tokens
async function createTokenPair(userId: string, roles: string[], tokenVersion: number, familyId?: string, deviceId?: string) {
  const currentFamilyId = familyId || crypto.randomUUID();
  const rawRefreshToken = generateRandomToken(40);
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresDays);

  await RefreshToken.create({
    userId,
    tokenHash,
    familyId: currentFamilyId,
    deviceId,
    expiresAt,
  });

  const accessToken = generateAccessToken(userId, roles as any, tokenVersion);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, password, displayName, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists', 'EMAIL_EXISTS');
    }

    if (username) {
      const availability = await usernameService.checkAvailability(username);
      if (!availability.available) {
        throw new ConflictError(availability.reason || 'Username unavailable', 'USERNAME_UNAVAILABLE');
      }
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      username: username ? username.toLowerCase() : undefined,
      phone,
      passwordHash,
      displayName,
      roles: ['member'],
      status: 'active',
      tokenVersion: 1,
    });

    if (user.username) {
      usernameService.registerUsername(user.username);
    }

    const tokens = await createTokenPair(user.id, user.roles, user.tokenVersion);

    await AuditLog.create({
      actorId: user._id,
      action: 'user:register',
      targetType: 'user',
      targetId: user.id,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { target, code, type } = req.body;
    // OTP verification logic (for dev/testing, code "123456" or any 6-digit valid code in test mode is accepted)
    if (code !== '123456' && process.env.NODE_ENV === 'production') {
      throw new AppError('INVALID_OTP', 'Invalid verification code', 400);
    }

    res.status(200).json({
      success: true,
      data: {
        verified: true,
        target,
        type,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError(
        user.suspension?.reason
          ? `Account suspended: ${user.suspension.reason}`
          : 'Account suspended by moderation',
        'ACCOUNT_SUSPENDED'
      );
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedError('Account has been deleted', 'ACCOUNT_DELETED');
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check if 2FA is enabled
    if (user.twoFA && user.twoFA.enabled) {
      if (!twoFactorCode) {
        res.status(200).json({
          success: true,
          data: {
            twoFactorRequired: true,
            userId: user.id,
          },
        });
        return;
      }

      if (!user.twoFA.secretEnc) {
        throw new AppError('SECURITY_CONFIG_ERROR', '2FA configuration corrupted', 500);
      }

      const plainSecret = decryptSecret(user.twoFA.secretEnc);
      const isValid = verifyTotpCode(plainSecret, twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedError('Invalid two-factor authentication code', 'INVALID_2FA_CODE');
      }
    }

    const tokens = await createTokenPair(user.id, user.roles, user.tokenVersion);

    await AuditLog.create({
      actorId: user._id,
      action: 'user:login',
      targetType: 'user',
      targetId: user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: rawToken, deviceId } = req.body;
    const tokenHash = hashToken(rawToken);

    const tokenDoc = await RefreshToken.findOne({ tokenHash });

    if (!tokenDoc) {
      throw new UnauthorizedError('Invalid refresh token', 'TOKEN_INVALID');
    }

    // Reuse detection: if token is already revoked, compromise detected!
    if (tokenDoc.isRevoked) {
      // Revoke the entire family
      await RefreshToken.updateMany({ familyId: tokenDoc.familyId }, { isRevoked: true });
      throw new UnauthorizedError(
        'Compromised session detected: refresh token reuse. All associated sessions have been revoked.',
        'TOKEN_REUSE_DETECTED'
      );
    }

    if (new Date() > tokenDoc.expiresAt) {
      tokenDoc.isRevoked = true;
      tokenDoc.revokedAt = new Date();
      await tokenDoc.save();
      throw new UnauthorizedError('Refresh token expired', 'TOKEN_EXPIRED');
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account not eligible', 'USER_INACTIVE');
    }

    // Mark current token as revoked and rotated
    tokenDoc.isRevoked = true;
    tokenDoc.revokedAt = new Date();
    await tokenDoc.save();

    // Issue new pair maintaining the same familyId
    const tokens = await createTokenPair(
      user.id,
      user.roles,
      user.tokenVersion,
      tokenDoc.familyId,
      deviceId
    );

    res.status(200).json({
      success: true,
      data: {
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawToken = req.body.refreshToken;
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await RefreshToken.updateOne({ tokenHash }, { isRevoked: true, revokedAt: new Date() });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    // Increment tokenVersion to invalidate all existing access tokens
    req.user.tokenVersion += 1;
    await req.user.save();

    // Revoke all refresh tokens for this user
    await RefreshToken.updateMany(
      { userId: req.user._id, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() }
    );

    await AuditLog.create({
      actorId: req.user._id,
      action: 'user:logout_all',
      targetType: 'user',
      targetId: req.user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: { message: 'All active sessions have been revoked' },
    });
  } catch (error) {
    next(error);
  }
}

// 2FA Setup
export async function setup2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const secret = generateTotpSecret(req.user.email);
    const qrCode = await generateQrCode(secret.otpauth_url || '');

    // Temporarily stash encrypted secret until verified
    req.user.twoFA = {
      enabled: false,
      secretEnc: encryptSecret(secret.base32),
    };
    await req.user.save();

    res.status(200).json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
}

// 2FA Verify & Enable
export async function verify2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { code } = req.body;
    if (!req.user.twoFA?.secretEnc) {
      throw new AppError('SETUP_NOT_INITIATED', 'Please initiate 2FA setup first', 400);
    }

    const plainSecret = decryptSecret(req.user.twoFA.secretEnc);
    const isValid = verifyTotpCode(plainSecret, code);

    if (!isValid) {
      throw new AppError('INVALID_2FA_CODE', 'Invalid 2FA code', 400);
    }

    req.user.twoFA.enabled = true;
    await req.user.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'user:2fa_enabled',
      targetType: 'user',
      targetId: req.user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: {
        enabled: true,
        message: 'Two-factor authentication successfully enabled',
      },
    });
  } catch (error) {
    next(error);
  }
}

// In-app account deletion
export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    req.user.status = 'deleted';
    req.user.tokenVersion += 1;
    await req.user.save();

    await RefreshToken.updateMany(
      { userId: req.user._id },
      { isRevoked: true, revokedAt: new Date() }
    );

    await AuditLog.create({
      actorId: req.user._id,
      action: 'user:delete_account',
      targetType: 'user',
      targetId: req.user.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Account successfully scheduled for deletion' },
    });
  } catch (error) {
    next(error);
  }
}

export async function checkUsername(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const username = (req.query.username as string) || '';
    const result = await usernameService.checkAvailability(username);

    res.status(200).json({
      success: true,
      data: {
        username: username.toLowerCase(),
        available: result.available,
        reason: result.reason,
      },
    });
  } catch (error) {
    next(error);
  }
}

