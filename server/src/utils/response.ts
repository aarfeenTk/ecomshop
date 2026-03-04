import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Standardized API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: ResponseMeta;
  code?: string;
  timestamp: string;
  path?: string;
}

/**
 * Response metadata for pagination
 */
export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  pages?: number;
  count?: number;
}

/**
 * Send success response
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = StatusCodes.OK,
  meta?: ResponseMeta
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
    path: res.req.path,
  };

  // Include request ID if available
  if (res.req.requestId) {
    (response as any).requestId = res.req.requestId;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  code?: string,
  details?: Record<string, unknown>
): void => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: res.req.path,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.data = details as never;
  }

  res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreatedResponse = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): void => {
  sendSuccessResponse(res, data, message, StatusCodes.CREATED);
};

/**
 * Send no content response (204)
 */
export const sendNoContentResponse = (res: Response): void => {
  res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
): void => {
  const pages = Math.ceil(total / limit);
  
  const meta: ResponseMeta = {
    page,
    limit,
    total,
    pages,
    count: data.length,
  };

  sendSuccessResponse(res, data, message, StatusCodes.OK, meta);
};
