import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.js';
import { ErrorCode } from '../constants/index.js';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          400,
          ErrorCode.VALIDATION_ERROR,
          'Input validation failed',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          400,
          ErrorCode.VALIDATION_ERROR,
          'Query parameters validation failed',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};

export const validateParams = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = (await schema.parseAsync(req.params)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        sendError(
          res,
          400,
          ErrorCode.VALIDATION_ERROR,
          'Route parameters validation failed',
          error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        );
        return;
      }
      next(error);
    }
  };
};
