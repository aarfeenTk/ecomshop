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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: Omit<UserDocument, 'password' | 'refreshToken' | 'refreshTokenExpires'>;
  tokens: AuthTokens;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResult> {
    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required');
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);

    const user = await User.findOne({
      refreshToken: refreshTokenHash,
    }).select('+refreshToken +refreshTokenExpires');

    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (!user.isRefreshTokenValid()) {
      await user.clearRefreshToken();
      throw new UnauthorizedError('Refresh token expired. Please login again.');
    }

    const accessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = user.generateRefreshToken();
    
    await user.save();

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

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

  async logoutAll(userId: string): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await user.clearRefreshToken();
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = user.generateRefreshToken();
    
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: UserDocument): Omit<UserDocument, 'password' | 'refreshToken' | 'refreshTokenExpires'> {
    const userObject = user.toObject();
    const { password, refreshToken, refreshTokenExpires, ...sanitized } = userObject;
    return sanitized;
  }
}

export default new AuthService();
