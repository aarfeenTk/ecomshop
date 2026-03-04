import User from '../models/User';
import { UserDocument } from '../types';
import { generateAccessToken, hashRefreshToken } from '../utils/token';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
} from '../errors';
import { StatusCodes } from 'http-status-codes';

/**
 * User registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * User login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  user: Omit<UserDocument, 'password' | 'refreshToken' | 'refreshTokenExpires'>;
  tokens: AuthTokens;
}

/**
 * AuthService - Handles business logic for authentication
 * Separates business logic from controllers
 */
class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    const { name, email, password } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    // Hash the provided refresh token for comparison
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find user with matching refresh token
    const user = await User.findOne({
      refreshToken: refreshTokenHash,
    }).select('+refreshToken +refreshTokenExpires');

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if refresh token has expired
    if (!user.isRefreshTokenValid()) {
      await user.clearRefreshToken();
      throw new UnauthorizedError('Refresh token expired. Please login again.');
    }

    // Generate new tokens (token rotation)
    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = user.generateRefreshToken();
    
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ refreshToken: refreshTokenHash });

    if (user) {
      await user.clearRefreshToken();
    }
  }

  /**
   * Logout from all devices (invalidate all refresh tokens)
   */
  async logoutAll(userId: string): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.clearRefreshToken();
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = user.generateRefreshToken();
    
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: UserDocument): Omit<UserDocument, 'password' | 'refreshToken' | 'refreshTokenExpires'> {
    const userObject = user.toObject();
    const { password, refreshToken, refreshTokenExpires, ...sanitized } = userObject;
    return sanitized;
  }
}

export default new AuthService();
