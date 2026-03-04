import winston from 'winston';
import path from 'path';
import { format } from 'winston';

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Register colors
winston.addColors(logColors);

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Define formats for different transports
const consoleFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.errors({ stack: true }),
  format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  defaultMeta: {
    service: 'ecommerce-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'production',
    }),
    
    // Error log file for production
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file for production
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // HTTP log file
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Stream object for Morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
