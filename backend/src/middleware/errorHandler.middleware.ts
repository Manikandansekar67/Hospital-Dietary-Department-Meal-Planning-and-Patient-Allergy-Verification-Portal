import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { ErrorCode } from '../constants/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  logger.error('Unhandled API Error: %s', err.message, {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Never expose raw database or internal errors in production
  sendError(
    res,
    500,
    ErrorCode.INTERNAL_SERVER_ERROR,
    'An unexpected internal server error occurred. Please contact hospital dietary support.'
  );
};
