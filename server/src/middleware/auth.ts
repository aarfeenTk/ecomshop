import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { verifyAccessToken } from '../utils/token';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Middleware to protect routes that require authentication
 * Validates access token and attaches user to request
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Verify token type
    if (decoded.type && decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.role === 'admin',
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize users based on role
 * Must be used after protect middleware
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }

      const userRole = req.user.isAdmin ? 'admin' : 'user';
      
      if (!roles.includes(userRole)) {
        throw new ForbiddenError(`User role '${userRole}' is not authorized to access this route`);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't block
 * Useful for routes that have different behavior for logged-in vs anonymous users
 */
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.role === 'admin',
        };
      }
    }

    next();
  } catch (error) {
    // Token is invalid, but we continue without user
    next();
  }
};
