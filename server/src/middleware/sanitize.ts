import { Request, Response, NextFunction } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import { BadRequestError } from '../errors';

/**
 * Input sanitization middleware
 * Prevents NoSQL injection and XSS attacks by sanitizing user input
 */

// Configure MongoDB sanitization
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  allowDots: true,
});

/**
 * Custom input sanitization for XSS prevention
 * Sanitizes string inputs in request body, query, and params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as Record<string, unknown>) as any;
    }

    // Sanitize URL params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params as Record<string, unknown>) as any;
    }

    next();
  } catch (error) {
    next(new BadRequestError('Failed to sanitize input'));
  }
};

/**
 * Recursively sanitize object properties
 */
const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Skip prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      // Remove potential XSS scripts and HTML tags
      sanitized[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      // Sanitize arrays
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
