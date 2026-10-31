import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';
import { ErrorCode } from '../constants/index.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Too many requests from this IP address, please try again later.',
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login attempts per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: {
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Too many authentication attempts, please try again in 15 minutes.',
    },
  },
});
