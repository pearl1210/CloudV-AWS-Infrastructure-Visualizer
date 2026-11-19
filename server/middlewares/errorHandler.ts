import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.ts';

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.flatten(),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map((validationError) => validationError.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${error.path}`,
    });
    return;
  }

  if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with the same unique key already exists',
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
