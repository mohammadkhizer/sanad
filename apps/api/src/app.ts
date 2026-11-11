import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import { apiRouter } from './routes/index.js';

const app = express();

// Security and transport headers
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Observability and rate limiting
app.use(requestIdMiddleware);
if (env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}
app.use(globalRateLimiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Primary API routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((_req: Request, _res: Response, next) => {
  next(new NotFoundError('The requested endpoint was not found', 'ROUTE_NOT_FOUND'));
});

// Central Error Handler
app.use(errorHandler);

export { app };

