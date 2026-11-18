import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/tokens.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserModel, SessionModel } from '../modules/auth/auth.model.js';
import { Role } from '@sanad/shared';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: Role[];
        sessionId: string;
        twoFactorVerified: boolean;
      };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload: AccessTokenPayload = await verifyAccessToken(token);

    // Verify session in DB if database is connected
    if (UserModel.db.readyState === 1) {
      const session = await SessionModel.findById(payload.sessionId).exec();
      if (session && session.revokedAt) {
        return next(new UnauthorizedError('Session has been revoked'));
      }

      // Re-check user status, token version, and latest roles from DB (instant revocation gate)
      const user = await UserModel.findById(payload.sub).select('roles status tokenVersion').exec();
      if (user) {
        if (user.status === 'suspended' || user.status === 'disabled') {
          return next(new ForbiddenError('Account has been disabled or suspended by administrator', 'ACCOUNT_DISABLED'));
        }
        if (user.status === 'deleted') {
          return next(new UnauthorizedError('Account has been deleted'));
        }
        if (payload.ver !== undefined && user.tokenVersion !== undefined && payload.ver < user.tokenVersion) {
          return next(new UnauthorizedError('Authentication token has been superseded or revoked', 'TOKEN_REVOKED'));
        }
        req.user = {
          id: user._id.toString(),
          roles: user.roles,
          sessionId: payload.sessionId,
          twoFactorVerified: payload.twoFactorVerified ?? false,
        };
        return next();
      }
    }

    req.user = {
      id: payload.sub,
      roles: payload.roles,
      sessionId: payload.sessionId,
      twoFactorVerified: payload.twoFactorVerified ?? false,
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  verifyAccessToken(token)
    .then((payload) => {
      req.user = {
        id: payload.sub,
        roles: payload.roles,
        sessionId: payload.sessionId,
        twoFactorVerified: payload.twoFactorVerified ?? false,
      };
      next();
    })
    .catch(() => {
      // Invalid token for optional auth defaults to guest
      next();
    });
}

