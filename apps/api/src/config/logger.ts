import pino from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.refreshToken',
      'body.otp',
      'body.twoFactorCode',
      'body.secret',
      'password',
      'token',
      'refreshToken',
      'otp',
      'twoFactorCode',
      'secret',
    ],
    censor: '[REDACTED]',
  },
});
