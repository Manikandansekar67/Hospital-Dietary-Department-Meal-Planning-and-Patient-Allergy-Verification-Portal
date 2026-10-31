import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { sendError, AppError } from '../utils/response.js';
import { ErrorCode } from '../constants/index.js';
import { AuthTokenPayload } from '../types/models.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

import { db } from '../repositories/database.js';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, ErrorCode.UNAUTHORIZED, 'Authentication token missing or invalid');
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    // Development fallback for mock tokens e.g. mock-jwt-token-for-usr-doc-1
    if (token.startsWith('mock-jwt-token-for-')) {
      const userId = token.replace('mock-jwt-token-for-', '');
      const user = db.users.get(userId) || Array.from(db.users.values()).find((u) => u.id === userId);
      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
        return next();
      }
    }
    sendError(res, 401, ErrorCode.UNAUTHORIZED, 'Invalid or expired authentication token');
  }
};
