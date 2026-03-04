import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { ApiResponse, UserDocument } from '../types';
import { generateAccessToken, hashRefreshToken } from '../utils/token';

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshTokenBody {
  refreshToken: string;
}

/**
 * Send token response with both access and refresh tokens
 */
const sendTokenResponse = (user: UserDocument, res: Response<ApiResponse>, statusCode: number = 200): void => {
  const accessToken = generateAccessToken(user._id.toString());
  const refreshTokenData = user.generateRefreshToken();
  
  // Save the user with refresh token
  user.save().catch(err => {
    console.error('Failed to save refresh token:', err);
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken: refreshTokenData,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    sendTokenResponse(user as UserDocument, res, 201);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isMatch = await (user as UserDocument).matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    sendTokenResponse(user as UserDocument, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (req: Request<{}, {}, RefreshTokenBody>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Hash the provided refresh token for comparison
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find user with matching refresh token
    const user = await User.findOne({
      refreshToken: refreshTokenHash,
    }).select('+refreshToken +refreshTokenExpires');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Check if refresh token has expired
    if (!user.isRefreshTokenValid()) {
      await user.clearRefreshToken();
      res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please login again.',
      });
      return;
    }

    // Generate new access token and rotate refresh token
    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = user.generateRefreshToken();
    
    await user.save();

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

/**
 * Logout - invalidate current refresh token
 */
export const logout = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ refreshToken: refreshTokenHash });

    if (user) {
      await user.clearRefreshToken();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

/**
 * Logout from all devices - invalidate all refresh tokens
 */
export const logoutAll = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    // Get user ID from authenticated request
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findById(userId);

    if (user) {
      await user.clearRefreshToken();
    }

    res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message,
    });
  }
};
