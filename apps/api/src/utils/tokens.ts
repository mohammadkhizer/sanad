import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Role } from '@sanad/types';

export interface JwtPayload {
  sub: string;
  roles: Role[];
  ver: number;
}

export function generateAccessToken(userId: string, roles: Role[], tokenVersion: number = 1): string {
  const payload: JwtPayload = {
    sub: userId,
    roles,
    ver: tokenVersion,
  };
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as unknown as number,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
}

