import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export function validate(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
