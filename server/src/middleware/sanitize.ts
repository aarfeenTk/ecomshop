import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { BadRequestError } from '../errors';


export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  allowDots: true,
});

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as Record<string, unknown>) as any;
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params as Record<string, unknown>) as any;
    }

    next();
  } catch (error) {
    next(new BadRequestError('Failed to sanitize input'));
  }
};

const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export default sanitizeInput;
