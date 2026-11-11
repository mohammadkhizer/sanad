import { SignJWT, jwtVerify } from 'jose';
import crypto from 'node:crypto';
import { authenticator } from 'otplib';
import { env } from '../config/env.js';
import { Role } from '@sanad/shared';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export interface AccessTokenPayload {
  sub: string;
  roles: Role[];
  sessionId: string;
  twoFactorVerified?: boolean;
}

export async function generateAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({
    roles: payload.roles,
    sessionId: payload.sessionId,
    twoFactorVerified: payload.twoFactorVerified ?? false,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, accessSecret);
  return {
    sub: payload.sub as string,
    roles: payload.roles as Role[],
    sessionId: payload.sessionId as string,
    twoFactorVerified: Boolean(payload.twoFactorVerified),
  };
}

export function generateRefreshTokenString(): string {
  return crypto.randomBytes(40).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function verifyTotpToken(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret });
}

export function getTotpUri(accountName: string, secret: string): string {
  return authenticator.keyuri(accountName, 'Sanad', secret);
}

