import jwt from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { AuthTokenPayload } from '../types/models.js';

export const signToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
};
