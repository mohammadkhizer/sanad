import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { requestIdMiddleware } from './middlewares/requestId';
import { errorHandler } from './middlewares/errorHandler';
import { NotFoundError } from './utils/errors';
import { config } from './config';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

app.use(requestIdMiddleware);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((_req: Request, _res: Response, next) => {
  next(new NotFoundError('The requested endpoint was not found', 'ROUTE_NOT_FOUND'));
});

// Centralized Error Handler
app.use(errorHandler);

export { app };

