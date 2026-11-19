import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.ts';

declare global {
    namespace Express{
        interface Request {
            userId: string;
        }
    }
}

export const isAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return next(new AppError('User not authenticated', 401));
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return next(new AppError('JWT secret is not configured', 500));
    }

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (!decoded?.userId) {
      return next(new AppError('Invalid token', 401));
    }

    req.userId = String(decoded.userId);
    next();
  } catch {
    return next(new AppError('Invalid or expired token', 401));
  }
};