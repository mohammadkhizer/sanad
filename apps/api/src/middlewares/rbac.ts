import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { Role, Permission, can } from '@sanad/shared';
import { UserModel } from '../modules/auth/auth.model.js';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError(`Required role: ${allowedRoles.join(' or ')}`, 'FORBIDDEN_ROLE'));
    }

    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const roles: Role[] = req.user ? req.user.roles : ['guest'];
    if (!can(roles, permission)) {
      return next(new ForbiddenError(`Missing permission: ${permission}`, 'FORBIDDEN_PERMISSION'));
    }
    next();
  };
}

export function requireOwnership(getOwnerId: (req: Request) => Promise<string | undefined> | string | undefined) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (req.user.roles.includes('admin')) {
      return next();
    }

    try {
      const ownerId = await getOwnerId(req);
      if (!ownerId || ownerId !== req.user.id) {
        return next(new ForbiddenError('You do not own this resource', 'OWNERSHIP_REQUIRED'));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function require2FA(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    return next(new UnauthorizedError());
  }

  const isPrivileged = req.user.roles.some((role) =>
    ['scholar', 'moderator', 'admin'].includes(role)
  );

  if (!isPrivileged) {
    return next();
  }

  if (UserModel.db.readyState === 1) {
    const user = await UserModel.findById(req.user.id).select('twoFA').exec();
    if (!user || !user.twoFA?.enabled) {
      return next(new ForbiddenError('2FA is mandatory for this role. Please enable 2FA in settings.', '2FA_MANDATORY'));
    }
  }

  next();
}

