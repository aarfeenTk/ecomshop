import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { StatusCodes } from 'http-status-codes';

/**
 * Request logging middleware
 * Logs all incoming requests with method, URL, status code, and response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = getLogLevelForStatusCode(res.statusCode);

    logger[logLevel]('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

/**
 * Determine log level based on status code
 */
const getLogLevelForStatusCode = (statusCode: number): 'info' | 'warn' | 'error' => {
  if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
    return 'error';
  }
  if (statusCode >= StatusCodes.BAD_REQUEST && statusCode < StatusCodes.INTERNAL_SERVER_ERROR) {
    return 'warn';
  }
  return 'info';
};

export default requestLogger;
