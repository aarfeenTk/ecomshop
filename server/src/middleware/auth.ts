import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { verifyAccessToken } from "../utils/token";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to protect routes that require authentication
 * Validates access token and attaches user to request
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);

    // Verify token type if present
    if (decoded.type && decoded.type !== "access") {
      res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.role === "admin",
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Access token has expired",
        error: "TOKEN_EXPIRED",
      });
      return;
    }

    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: "INVALID_TOKEN",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

/**
 * Middleware to authorize users based on role
 * Must be used after protect middleware
 */
export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const userRole = req.user.isAdmin ? "admin" : "user";

    if (!roles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route`,
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't block
 * Useful for routes that have different behavior for logged-in vs anonymous users
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user._id.toString(),
          email: user.email,
          isAdmin: user.role === "admin",
        };
      }
    } catch (err) {
      // Token is invalid, but we continue without user
    }
  }

  next();
};
