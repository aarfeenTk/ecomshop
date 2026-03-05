import { Request, Response, NextFunction } from 'express';
import { MongooseError } from 'mongoose';
import logger from '../config/logger';
import { AppError } from '../errors';
import { StatusCodes } from 'http-status-codes';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

interface MongooseValidationError extends Error {
  errors?: Record<string, MongooseValidationError>;
  kind?: string;
  path?: string;
  value?: string;
  message: string;
}

interface MongooseErrorWithCode extends Error {
  code?: string;
  name: string;
  errors?: Record<string, MongooseValidationError>;
  statusCode?: number;
  isOperational?: boolean;
  keyValue?: Record<string, unknown>;
  value?: string;
  path?: string;
  kind?: string;
  details?: Record<string, unknown>;
}

const errorHandler = (
  err: MongooseErrorWithCode,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: MongooseErrorWithCode = { ...err };
  error.message = err.message;

  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (err.name === 'ValidationError') {
    const message = handleValidationError(err.errors!).message;
    error.message = message;
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.code = 'VALIDATION_ERROR';
  }

  if (err.code === '11000' || (err as any).code === 11000) {
    const { message, field } = handleDuplicateKeyError(err.keyValue!);
    error.message = message;
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.code = 'DUPLICATE_KEY';
    error.details = { field };
  }

  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.statusCode = StatusCodes.BAD_REQUEST;
    error.code = 'INVALID_ID';
    error.details = { path: err.path };
  }

  if (err instanceof TokenExpiredError) {
    error.message = 'Session expired. Please login again.';
    error.statusCode = StatusCodes.UNAUTHORIZED;
    error.code = 'TOKEN_EXPIRED';
  }

  if (err instanceof JsonWebTokenError) {
    error.message = 'Invalid authentication token';
    error.statusCode = StatusCodes.UNAUTHORIZED;
    error.code = 'INVALID_TOKEN';
  }

  if (err instanceof MongooseError && err.message.includes('ECONNREFUSED')) {
    error.message = 'Database connection failed';
    error.statusCode = StatusCodes.SERVICE_UNAVAILABLE;
    error.code = 'DATABASE_ERROR';
  }

  if (err.isOperational) {
    error.statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    error.code = err.code || 'OPERATIONAL_ERROR';
  }

  if (!error.statusCode) {
    error.message = process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message || 'Internal server error';
    error.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    error.code = 'INTERNAL_ERROR';
  }

  const errorResponse: Record<string, unknown> = {
    success: false,
    message: error.message,
    code: error.code,
  };

  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    if (error.details) {
      errorResponse.details = error.details;
    }
  }

  res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
};

const handleValidationError = (errors: Record<string, MongooseValidationError>): { message: string } => {
  const messages = Object.values(errors).map((err) => {
    if (err.kind === 'required') {
      return `${err.path} is required`;
    }
    if (err.kind === 'enum') {
      return `${err.path} must be one of: ${err.value}`;
    }
    if (err.kind === 'minlength' || err.kind === 'maxlength') {
      return `${err.path} length must be within valid range`;
    }
    if (err.kind === 'min' || err.kind === 'max') {
      return `${err.path} must be within valid range`;
    }
    if (err.kind === 'invalid') {
      return `${err.path} is invalid`;
    }
    return err.message;
  });

  return { message: messages.join(', ') };
};

const handleDuplicateKeyError = (keyValue: Record<string, unknown>): { message: string; field: string } => {
  const field = Object.keys(keyValue)[0];
  
  return {
    message: `Duplicate value entered for field: ${field}`,
    field,
  };
};

export default errorHandler;
