import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Request ID middleware
 * Generates a unique ID for each request for better tracing and debugging
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Get request ID from headers or generate new one
  const id = (req.headers["x-request-id"] as string) || generateRequestId();

  req.requestId = id;
  res.setHeader("X-Request-ID", id);

  next();
};

/**
 * Generate a unique request ID
 */
const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString("hex");
  return `${timestamp}-${random}`;
};

/**
 * Cache control middleware for GET requests
 * Sets appropriate cache headers based on environment
 */
export const cacheControl = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.method === "GET") {
    if (process.env.NODE_ENV === "production") {
      // Cache for 5 minutes in production
      res.setHeader("Cache-Control", "public, max-age=300");
      res.setHeader("X-Cache", "HIT");
    } else {
      // No caching in development
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  } else {
    // No caching for non-GET requests
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
};

/**
 * Response time middleware
 * Adds X-Response-Time header to track API performance
 */
export const responseTime = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();

  res.on("header", () => {
    const duration = Date.now() - start;
    res.setHeader("X-Response-Time", `${duration}ms`);
  });

  next();
};
