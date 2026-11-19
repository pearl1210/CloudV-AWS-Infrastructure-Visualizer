import type { RequestHandler } from 'express';

export const asyncHandler = <T extends RequestHandler>(handler: T): T => {
  return ((req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  }) as T;
};
