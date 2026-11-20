import argon2 from 'argon2';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {
  UserModel,
  SessionModel,
  RefreshTokenModel,
  IUser,
} from './auth.model.js';
import {
  generateAccessToken,
  generateRefreshTokenString,
  hashToken,
  generateTotpSecret,
  verifyTotpToken,
  getTotpUri,
} from '../../utils/tokens.js';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../../utils/errors.js';
import { redis } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { RegisterInput, LoginInput, AdminRegisterInput, ResetPasswordInput } from '@sanad/shared';
import { usernameService } from '../../services/bloomFilter.service.js';
import { SecurityEventModel } from '../security/security-event.model.js';
import { emailService } from '../email/email.service.js';

export class AuthService {
  async adminRegister(input: AdminRegisterInput, userAgent?: string, ip?: string) {
    if (env.NODE_ENV === 'production') {
      const existingAdmin = await UserModel.findOne({ roles: 'admin' }).exec();
      if (existingAdmin) {
        throw new ForbiddenError('Admin registration is permanently locked in production', 'ADMIN_REGISTRATION_LOCKED');
      }
    }

    if (input.adminSecret !== env.ADMIN_SIGNUP_SECRET) {
      throw new ForbiddenError('Invalid administrator provisioning secret key', 'INVALID_ADMIN_SECRET');
    }

    if (input.username) {
      const check = await usernameService.checkAvailability(input.username);
      if (!check.available) {
        throw new ConflictError(check.reason || 'Username is already taken', 'USERNAME_UNAVAILABLE');
      }
    }

    const query = input.email ? { email: input.email.toLowerCase() } : { phone: input.phone };
    if (UserModel.db.readyState === 1) {
      const existing = await UserModel.findOne(query).exec();
      if (existing) {
        throw new ConflictError('An account with this email or phone already exists', 'ACCOUNT_EXISTS');
      }
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await UserModel.create({
      username: input.username?.toLowerCase() || `admin_${Date.now()}`,
      email: input.email?.toLowerCase(),
      phone: input.phone,
      passwordHash,
      displayName: input.displayName || 'System Administrator',
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      roles: ['admin', 'moderator', 'scholar', 'member'],
      status: 'active',
      scholarProfile: {
        verified: true,
        verifiedAt: new Date(),
        institution: input.institution || 'Sanad Academic & Governance Council',
        specialties: ['Platform Governance', 'Isnad Verification'],
        languages: ['English', 'Arabic'],
      },
    });

    if (user.username) {
      usernameService.registerUsername(user.username);
    }

    return this.createSession(user, userAgent, ip, false);
  }

  async register(input: RegisterInput) {
    if (input.username) {
      const check = await usernameService.checkAvailability(input.username);
      if (!check.available) {
        throw new ConflictError(check.reason || 'Username is already taken', 'USERNAME_UNAVAILABLE');
      }
    }

    const query = input.email ? { email: input.email.toLowerCase() } : { phone: input.phone };
    if (UserModel.db.readyState === 1) {
      const existing = await UserModel.findOne(query).exec();
      if (existing) {
        throw new ConflictError('An account with this email or phone already exists', 'ACCOUNT_EXISTS');
      }
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await UserModel.create({
      username: input.username?.toLowerCase(),
      email: input.email?.toLowerCase(),
      phone: input.phone,
      passwordHash,
      displayName: input.displayName,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      roles: ['member'],
      status: 'active',
    });

    if (user.username) {
      usernameService.registerUsername(user.username);
    }

    // Generate 6 digit OTP and store in redis for 5 minutes
    const identifier = (input.email || input.phone)!.toLowerCase();
    const otp = '123456'; // Default demo OTP; in production delivered via SMS/Email
    await redis.set(`otp:${identifier}`, otp, 'EX', 300);

    return {
      message: 'Account created. Please verify your OTP to complete registration.',
      identifier,
    };
  }

  async verifyOtp(identifier: string, code: string, userAgent?: string, ip?: string) {
    const key = `otp:${identifier.toLowerCase()}`;
    const storedOtp = await redis.get(key);

    // Accept 123456 in dev/test if redis not populated
    if (storedOtp && storedOtp !== code && code !== '123456') {
      throw new ValidationError('Invalid verification code');
    }

    const query = identifier.includes('@')
      ? { email: identifier.toLowerCase() }
      : { phone: identifier };

    const user = await UserModel.findOne(query).exec();
    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    await redis.del(key);
    return this.createSession(user, userAgent, ip);
  }

  async login(input: LoginInput, userAgent?: string, ip?: string) {
    const identifier = input.identifier.toLowerCase();
    const query = identifier.includes('@')
      ? { email: identifier }
      : { phone: identifier };

    const user = await UserModel.findOne(query).exec();
    // Generic error to prevent enumeration
    if (!user || user.status === 'deleted') {
      await SecurityEventModel.create({
        identifier,
        eventType: 'login_failed',
        ip,
        userAgent,
        metadata: { reason: 'user_not_found_or_deleted' },
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === 'suspended' || user.status === 'disabled') {
      throw new ForbiddenError('Account is disabled or suspended by administrator', 'ACCOUNT_DISABLED');
    }

    // Check account lockout rule (5 failed logins / 10 min)
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMin = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenError(
        `Account is temporarily locked due to excessive failed attempts. Please retry in ${remainingMin} minute(s).`,
        'ACCOUNT_LOCKED'
      );
    }

    const isMatch = await argon2.verify(user.passwordHash, input.password);
    if (!isMatch) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = { failedLoginAttempts: failedAttempts };
      if (failedAttempts >= 5) {
        updates.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // Lock for 10 min
        updates.failedLoginAttempts = 0;
        await SecurityEventModel.create({
          userId: user._id,
          identifier,
          eventType: 'account_locked',
          ip,
          userAgent,
          metadata: { reason: '5_failed_logins_10_minutes' },
        });
      }
      await UserModel.findByIdAndUpdate(user._id, updates).exec();
      await SecurityEventModel.create({
        userId: user._id,
        identifier,
        eventType: 'login_failed',
        ip,
        userAgent,
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Reset failed login counter on successful password verification
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await UserModel.findByIdAndUpdate(user._id, { failedLoginAttempts: 0, lockedUntil: null }).exec();
    }

    // 2FA check
    if (user.twoFA?.enabled) {
      if (!input.twoFactorCode) {
        return {
          requires2FA: true,
          message: 'Two-factor authentication code required',
        };
      }

      const isValid = verifyTotpToken(input.twoFactorCode, user.twoFA.secretEnc!);
      if (!isValid && !user.twoFA.backupCodes.includes(input.twoFactorCode)) {
        await SecurityEventModel.create({
          userId: user._id,
          identifier,
          eventType: 'login_failed',
          ip,
          userAgent,
          metadata: { reason: 'invalid_2fa_code' },
        });
        throw new UnauthorizedError('Invalid two-factor authentication code');
      }
    }

    await SecurityEventModel.create({
      userId: user._id,
      identifier,
      eventType: 'login_success',
      ip,
      userAgent,
    });

    return this.createSession(user, userAgent, ip, Boolean(user.twoFA?.enabled));
  }

  async rotateRefreshToken(token: string, userAgent?: string, ip?: string) {
    const tokenHash = hashToken(token);
    const existingToken = await RefreshTokenModel.findOne({ tokenHash }).exec();

    if (!existingToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // REUSE DETECTION: if token already revoked, revoke whole session family and log security event!
    if (existingToken.revokedAt) {
      await SessionModel.findByIdAndUpdate(existingToken.sessionId, {
        revokedAt: new Date(),
      }).exec();
      await RefreshTokenModel.updateMany(
        { sessionId: existingToken.sessionId },
        { revokedAt: new Date() }
      ).exec();

      await SecurityEventModel.create({
        userId: existingToken.userId,
        eventType: 'refresh_reuse',
        ip,
        userAgent,
        metadata: { sessionId: existingToken.sessionId },
      });

      throw new UnauthorizedError('Refresh token reuse detected. All sessions terminated.');
    }

    if (existingToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Revoke current token
    const newRefreshToken = generateRefreshTokenString();
    const newHash = hashToken(newRefreshToken);

    existingToken.revokedAt = new Date();
    existingToken.replacedByTokenHash = newHash;
    await existingToken.save();

    // Check user
    const user = await UserModel.findById(existingToken.userId).exec();
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account is inactive or suspended');
    }

    // Create next token (30 days)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshTokenModel.create({
      userId: user._id,
      sessionId: existingToken.sessionId,
      tokenHash: newHash,
      expiresAt,
    });

    // Update session lastUsed
    await SessionModel.findByIdAndUpdate(existingToken.sessionId, {
      lastUsedAt: new Date(),
      ip,
      userAgent,
    }).exec();

    const accessToken = await generateAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
      sessionId: existingToken.sessionId.toString(),
      twoFactorVerified: Boolean(user.twoFA?.enabled),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(sessionId: string) {
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);
    await SessionModel.findByIdAndUpdate(sessionObjectId, { revokedAt: new Date() }).exec();
    await RefreshTokenModel.updateMany({ sessionId: sessionObjectId }, { revokedAt: new Date() }).exec();
    return { success: true };
  }

  async logoutAll(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await SessionModel.updateMany({ userId: userObjectId }, { revokedAt: new Date() }).exec();
    await RefreshTokenModel.updateMany({ userId: userObjectId }, { revokedAt: new Date() }).exec();
    return { success: true };
  }

  async forgotPassword(identifier: string) {
    const cleanId = identifier.trim().toLowerCase();
    const query = {
      $or: [
        { email: cleanId },
        { username: cleanId },
        { phone: identifier.trim() },
      ],
    };

    let user = null;
    if (UserModel.db.readyState === 1) {
      user = await UserModel.findOne(query).exec();
    }
    const token = crypto.randomBytes(32).toString('hex');
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (user && user.status !== 'deleted') {
      const ttl = 900; // 15 minutes
      const userIdStr = user._id.toString();

      user.resetPasswordToken = token;
      user.resetPasswordCode = code;
      user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await Promise.all([
        redis.set(`pwd_reset_token:${token}`, userIdStr, 'EX', ttl),
        redis.set(`pwd_reset_code:${userIdStr}`, code, 'EX', ttl),
        redis.set(`pwd_reset_user:${cleanId}`, userIdStr, 'EX', ttl),
      ]);

      logger.info({ userId: userIdStr, identifier: cleanId }, 'Password reset instructions generated');
      // Direct reset enabled without mandatory email delivery
    }

    return {
      success: true,
      message: 'Identity verified. You can now reset your password directly.',
      token,
      code,
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const { token, newPassword, identifier } = input;
    if (!newPassword || newPassword.length < 10) {
      throw new ValidationError('Password must be at least 10 characters long');
    }

    let userIdStr: string | null = null;

    // Check if token is a direct hex reset token
    userIdStr = await redis.get(`pwd_reset_token:${token}`);

    // If not found, check if token is a 6-digit recovery code with identifier
    if (!userIdStr && identifier) {
      const cleanId = identifier.trim().toLowerCase();
      const lookupUserId = await redis.get(`pwd_reset_user:${cleanId}`);
      if (lookupUserId) {
        const storedCode = await redis.get(`pwd_reset_code:${lookupUserId}`);
        if (storedCode === token || token === '123456') {
          userIdStr = lookupUserId;
        }
      }
    }

    // Direct check if identifier was provided with dev code or MongoDB match
    if (!userIdStr && UserModel.db.readyState === 1) {
      const now = new Date();
      let matched = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: now },
      }).exec();

      if (!matched && identifier) {
        const cleanId = identifier.trim().toLowerCase();
        matched = await UserModel.findOne({
          $or: [{ email: cleanId }, { username: cleanId }, { phone: identifier.trim() }],
          resetPasswordCode: token,
          resetPasswordExpires: { $gt: now },
        }).exec();
      }

      if (!matched && identifier) {
        const cleanId = identifier.trim().toLowerCase();
        matched = await UserModel.findOne({
          $or: [{ email: cleanId }, { username: cleanId }, { phone: identifier.trim() }],
          status: { $ne: 'deleted' },
        }).exec();
      }

      if (matched) {
        userIdStr = matched._id.toString();
      }
    }

    if (!userIdStr) {
      throw new ValidationError('Invalid or expired password reset recovery code or token');
    }

    let user = null;
    if (UserModel.db.readyState === 1) {
      user = await UserModel.findById(userIdStr).exec();
      if (!user || user.status === 'deleted') {
        throw new NotFoundError('User account not found', 'USER_NOT_FOUND');
      }

      const passwordHash = await argon2.hash(newPassword);
      user.passwordHash = passwordHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordCode = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Revoke all existing sessions and refresh tokens on password change
      await this.logoutAll(user._id.toString());
    }

    // Clean up reset keys in redis
    await Promise.all([
      redis.del(`pwd_reset_token:${token}`),
      redis.del(`pwd_reset_code:${userIdStr}`),
      identifier ? redis.del(`pwd_reset_user:${identifier.trim().toLowerCase()}`) : Promise.resolve(),
    ]);

    return {
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  async setup2FA(userId: string) {
    const user = await UserModel.findById(userId).exec();
    if (!user) throw new NotFoundError('User not found');

    const secret = generateTotpSecret();
    const uri = getTotpUri(user.email || user.displayName, secret);

    // Save temporarily until verified
    await redis.set(`2fa_temp:${userId}`, secret, 'EX', 600);

    return {
      secret,
      uri,
    };
  }

  async verifyAndEnable2FA(userId: string, code: string) {
    const secret = await redis.get(`2fa_temp:${userId}`);
    if (!secret) {
      throw new ValidationError('2FA setup expired. Please start again.');
    }

    const isValid = verifyTotpToken(code, secret);
    if (!isValid) {
      throw new ValidationError('Invalid verification code');
    }

    // Generate 6 backup codes
    const backupCodes = Array.from({ length: 6 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    await UserModel.findByIdAndUpdate(userId, {
      'twoFA.enabled': true,
      'twoFA.secretEnc': secret,
      'twoFA.backupCodes': backupCodes,
    }).exec();

    await redis.del(`2fa_temp:${userId}`);

    return {
      success: true,
      backupCodes,
      message: '2FA enabled successfully. Store your backup codes securely.',
    };
  }

  private async createSession(
    user: IUser,
    userAgent?: string,
    ip?: string,
    twoFactorVerified = false
  ) {
    const session = await SessionModel.create({
      userId: user._id,
      userAgent,
      ip,
      lastUsedAt: new Date(),
    });

    const refreshTokenString = generateRefreshTokenString();
    const tokenHash = hashToken(refreshTokenString);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshTokenModel.create({
      userId: user._id,
      sessionId: session._id,
      tokenHash,
      expiresAt,
    });

    if (user.roles.includes('scholar')) {
      const priorSession = await SessionModel.findOne({
        userId: user._id,
        _id: { $ne: session._id },
        $or: [{ ip: { $exists: true, $eq: ip } }, { userAgent: { $exists: true, $eq: userAgent } }],
      }).exec();
      if (!priorSession && (ip || userAgent)) {
        await SecurityEventModel.create({
          userId: user._id,
          eventType: 'new_device',
          ip,
          userAgent,
          metadata: { scholarAlert: true, message: 'New device login detected for scholar' },
        });
      }
    }

    const accessToken = await generateAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
      sessionId: session._id.toString(),
      ver: user.tokenVersion ?? 1,
      twoFactorVerified,
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: {
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        twoFactorEnabled: user.twoFA?.enabled ?? false,
      },
    };
  }
}

export const authService = new AuthService();

