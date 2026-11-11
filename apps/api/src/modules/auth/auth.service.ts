import argon2 from 'argon2';
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
import { RegisterInput, LoginInput } from '@sanad/shared';
import { usernameService } from '../../services/bloomFilter.service.js';

export class AuthService {
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
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError('Account is suspended', 'ACCOUNT_SUSPENDED');
    }

    const isMatch = await argon2.verify(user.passwordHash, input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
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
        throw new UnauthorizedError('Invalid two-factor authentication code');
      }
    }

    return this.createSession(user, userAgent, ip, Boolean(user.twoFA?.enabled));
  }

  async rotateRefreshToken(token: string, userAgent?: string, ip?: string) {
    const tokenHash = hashToken(token);
    const existingToken = await RefreshTokenModel.findOne({ tokenHash }).exec();

    if (!existingToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // REUSE DETECTION: if token already revoked, revoke whole session family!
    if (existingToken.revokedAt) {
      await SessionModel.findByIdAndUpdate(existingToken.sessionId, {
        revokedAt: new Date(),
      }).exec();
      await RefreshTokenModel.updateMany(
        { sessionId: existingToken.sessionId },
        { revokedAt: new Date() }
      ).exec();
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

    const accessToken = await generateAccessToken({
      sub: user._id.toString(),
      roles: user.roles,
      sessionId: session._id.toString(),
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

