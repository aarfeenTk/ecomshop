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

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    const decoded = verifyAccessToken(token);
    
    if (decoded.type && decoded.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

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
    next();
  }
};
