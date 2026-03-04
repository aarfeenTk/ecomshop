import { StatusCodes } from 'http-status-codes';

/**
 * Base error class for all custom errors
 * Extends the built-in Error class with additional properties
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', details?: Record<string, unknown>) {
    super(message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST', details);
  }
}

/**
 * HTTP 401 Unauthorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details?: Record<string, unknown>) {
    super(message, StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED', details);
  }
}

/**
 * HTTP 403 Forbidden
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: Record<string, unknown>) {
    super(message, StatusCodes.FORBIDDEN, 'FORBIDDEN', details);
  }
}

/**
 * HTTP 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: Record<string, unknown>) {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND', details);
  }
}

/**
 * HTTP 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', details?: Record<string, unknown>) {
    super(message, StatusCodes.CONFLICT, 'CONFLICT', details);
  }
}

/**
 * HTTP 422 Unprocessable Entity
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation error', details?: Record<string, unknown>) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_ERROR', details);
  }
}

/**
 * HTTP 429 Too Many Requests
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests', details?: Record<string, unknown>) {
    super(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * HTTP 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', details);
  }
}

/**
 * HTTP 503 Service Unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable', details?: Record<string, unknown>) {
    super(message, StatusCodes.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE', details);
  }
}
