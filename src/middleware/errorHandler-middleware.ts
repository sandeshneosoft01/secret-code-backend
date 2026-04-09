import { Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status';
import { getMessage } from '@utils/index';
import logger from '@utils/logger';

export interface AppError extends Error {
  status?: number;
  errorCode?: number;
  stack?: string;
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const internalError = HttpStatus.INTERNAL_SERVER_ERROR;

  // Log error
  logger.info(`Error: ${error.message} | Stack: ${error.stack ?? 'N/A'}`);

  // Determine status code
  let statusCode: number;
  if (error?.status === HttpStatus.UNAUTHORIZED) {
    statusCode = HttpStatus.UNAUTHORIZED;
  } else if (error?.status) {
    statusCode = HttpStatus.BAD_REQUEST;
  } else {
    statusCode = internalError;
  }

  // Build error message
  let errorMessage: string;
  if (error.errorCode === 1) {
    statusCode = HttpStatus.BAD_REQUEST;
    errorMessage = String(error)
      .replace(/Error:/g, '')
      .trim();
  } else {
    errorMessage =
      statusCode === internalError
        ? getMessage(req, null, 'INTERNAL_ERROR')
        : (error?.message || 'Unexpected error').replace(/Error:/g, '').trim();
  }

  // Response format
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      status: statusCode,
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    message: errorMessage,
  });
};
