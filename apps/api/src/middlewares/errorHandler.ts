import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Input validation failed',
      details: formattedIssues,
    });
    return;
  }

  // Handle Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      code: 'INVALID_ID',
      message: 'Invalid resource identifier',
    });
    return;
  }

  // Handle JSON parse error
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      code: 'BAD_REQUEST',
      message: 'Malformed JSON payload',
    });
    return;
  }

  // Default internal server error
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected internal error occurred',
  });
}
