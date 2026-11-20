import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/logger.js';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string;

  // Handle custom AppError or errors with explicit statusCode
  const customStatus = (err as any).statusCode || (err instanceof AppError ? err.statusCode : undefined);
  if (customStatus) {
    const code = (err as any).code || 'ERROR';
    const message = err.message || 'An error occurred';
    res.status(customStatus).json({
      code,
      message,
      details: (err as any).details,
      error: {
        code,
        message,
        details: (err as any).details,
      },
    });
    return;
  }

  // Handle MongoDB E11000 Duplicate Key Errors
  if ((err as any).code === 11000 || err.name === 'MongoServerError') {
    const keyPattern = (err as any).keyPattern || {};
    let message = 'An account with this information already exists.';
    if (keyPattern.email) {
      message = 'An account with this email address already exists. Please sign in instead.';
    } else if (keyPattern.username) {
      message = 'This username handle is already taken. Please choose another username.';
    } else if (keyPattern.phone) {
      message = 'An account with this contact phone number already exists.';
    }

    res.status(409).json({
      code: 'CONFLICT',
      message,
      error: {
        code: 'CONFLICT',
        message,
      },
    });
    return;
  }

  if (err.name === 'ZodError' || err instanceof ZodError) {
    const zodErr = err as ZodError;
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: zodErr.errors,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: zodErr.errors,
      },
    });
    return;
  }

  logger.error({ requestId, err }, 'Unhandled application error');

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred',
    },
  });
}

