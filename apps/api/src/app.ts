import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
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
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// SEO, AIO, and GEO Discovery Endpoints
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nAllow: /llms.txt\nAllow: /sitemap.xml\nAllow: /geo.json\nDisallow: /admin/\n\nSitemap: https://sanad.app/sitemap.xml\n`);
});

app.get('/llms.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send(`# Sanad Platform - LLM Context & Architecture Specification\n# Format: /llms.txt\n# Lead Architect: Mohammed Khizer Shaikh (https://mohammedkhizershaikh.netlify.app)\n\nSanad is a verified-scholars-only platform for authentic classical Islamic sciences and Isnad transmission chains.\n\nNon-negotiable policies: Strictly verified posting, anti-takfir zero-tolerance, 13+ age compliance, 15m access tokens with rotating refresh tokens.\n`);
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://sanad.app/</loc><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>`);
});

app.get('/geo.json', (_req: Request, res: Response) => {
  res.type('application/json').json({
    region: 'GLOBAL',
    network: 'Sanad Global Islamic Scholarship Network',
    hubs: ['Hejaz', 'Cairo', 'Karachi', 'London'],
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

