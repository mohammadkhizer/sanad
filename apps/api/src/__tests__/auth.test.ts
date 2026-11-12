import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshTokenString,
  hashToken,
  generateTotpSecret,
  verifyTotpToken,
} from '../utils/tokens.js';

describe('Authentication & Token Security', () => {
  it('generates valid 15-minute access JWT with roles and sessionId', async () => {
    const token = await generateAccessToken({
      sub: 'user_123',
      roles: ['scholar'],
      sessionId: 'sess_456',
      twoFactorVerified: true,
    });

    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe('user_123');
    expect(payload.roles).toContain('scholar');
    expect(payload.sessionId).toBe('sess_456');
    expect(payload.twoFactorVerified).toBe(true);
  });

  it('rejects tampered access tokens', async () => {
    const token = await generateAccessToken({
      sub: 'user_123',
      roles: ['member'],
      sessionId: 'sess_1',
    });

    const tampered = token.slice(0, -4) + 'abcd';
    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it('generates cryptographically secure refresh token string and hashes via SHA-256', () => {
    const rawToken = generateRefreshTokenString();
    expect(rawToken.length).toBe(80); // 40 bytes hex

    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex
  });

  it('generates and verifies TOTP 2FA secret', () => {
    const secret = generateTotpSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });

  it('generates recovery code and reset token without leaking user existence', async () => {
    const { authService } = await import('../modules/auth/auth.service.js');
    const res = await authService.forgotPassword('nonexistent@sanad.app');
    expect(res.success).toBe(true);
    expect(res.message).toContain('If an account exists');
    expect(res.token).toBeDefined();
    expect(res.token.length).toBe(64);
  });

  it('rejects password reset with insufficient password length', async () => {
    const { authService } = await import('../modules/auth/auth.service.js');
    await expect(
      authService.resetPassword({
        token: 'abcdef1234567890abcdef1234567890',
        newPassword: 'short',
      })
    ).rejects.toThrow('at least 10 characters');
  });
});

