import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { verifyAccessToken } from '../utils/tokens';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '@sanad/types';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required', 'TOKEN_MISSING');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Invalid bearer format', 'TOKEN_INVALID');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError('Session expired or invalid token', 'TOKEN_EXPIRED');
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedError('User account not found', 'USER_NOT_FOUND');
    }

    if (user.status === 'suspended') {
      throw new ForbiddenError(
        user.suspension?.reason
          ? `Account suspended: ${user.suspension.reason}`
          : 'Account has been suspended by moderation',
        'ACCOUNT_SUSPENDED'
      );
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedError('Account has been deleted', 'ACCOUNT_DELETED');
    }

    if (user.tokenVersion !== payload.ver) {
      throw new UnauthorizedError('Session has been revoked', 'TOKEN_REVOKED');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const payload = verifyAccessToken(token);
          const user = await User.findById(payload.sub);
          if (user && user.status === 'active' && user.tokenVersion === payload.ver) {
            req.user = user;
          }
        } catch {
          // Token invalid; proceed as guest
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    // Admin has superuser access
    if (req.user.roles.includes('admin')) {
      next();
      return;
    }

    const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasPermission) {
      next(new ForbiddenError('Insufficient role permissions for this action', 'FORBIDDEN'));
      return;
    }

    next();
  };
}

export function require2FA(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required', 'UNAUTHORIZED'));
    return;
  }

  if (!req.user.twoFA || !req.user.twoFA.enabled) {
    next(
      new ForbiddenError(
        'Two-factor authentication (2FA) is mandatory for this action',
        'TWO_FACTOR_REQUIRED'
      )
    );
    return;
  }

  next();
}

