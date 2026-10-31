import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.config.js';
import { logger } from './utils/logger.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import apiRouter from './routes/index.js';
import { sendError } from './utils/response.js';
import { ErrorCode } from './constants/index.js';
import { isDatabaseConnected } from './config/database.js';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy for Vercel Serverless / reverse proxy deployment (ensures correct client IP)
  app.set('trust proxy', 1);

  // 1. Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible integration within iframe and AI Studio
      crossOriginEmbedderPolicy: false,
    })
  );

  // Dynamic CORS configuration supporting local dev, Vercel deployments (*.vercel.app), and custom origins
  const configuredOrigin = env.CORS_ORIGIN;
  const allowedList = configuredOrigin && configuredOrigin !== '*' ? configuredOrigin.split(',').map((o) => o.trim().replace(/\/+$/, '')) : [];
  if (env.FRONTEND_URL) {
    const cleanFrontendUrl = env.FRONTEND_URL.trim().replace(/\/+$/, '');
    if (cleanFrontendUrl && !allowedList.includes(cleanFrontendUrl)) {
      allowedList.push(cleanFrontendUrl);
    }
  }

  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || configuredOrigin === '*' || allowedList.includes('*')) {
          return callback(null, true);
        }
        if (allowedList.includes(requestOrigin) || requestOrigin.endsWith('.vercel.app')) {
          return callback(null, true);
        }
        // Fallback allow for deployed frontends
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
    })
  );

  // 2. Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. HTTP Request Logging
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.originalUrl !== '/api/health' && req.originalUrl !== '/health') {
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  // 4. Rate Limiting
  app.use('/api', apiRateLimiter);

  // 5. System Health Check & Root Endpoint (supports /, /api, /api/health, and /health)
  app.get(['/', '/api', '/api/health', '/health'], (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      service: 'hospital-dietary-api',
      message: 'Hospital Dietary Department Meal Planning and Patient Allergy Verification API is active',
      database: isDatabaseConnected() ? 'connected' : 'in-memory-fallback',
      odm: 'mongoose',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 6. Master REST API - mounted on /api and root / for seamless serverless rewrite handling
  app.use('/api', apiRouter);
  app.use(apiRouter);

  // 7. 404 Handler for undefined API routes
  app.all(['/api/*', '/*'], (req: Request, res: Response) => {
    sendError(res, 404, ErrorCode.NOT_FOUND, `Route '${req.originalUrl || req.url}' not found on this server`);
  });

  // 8. Centralized Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
