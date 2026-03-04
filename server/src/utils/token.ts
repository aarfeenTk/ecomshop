import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload } from '../types';

/**
 * Generate access token (short-lived, 15 minutes)
 */
export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' } as SignOptions
  );
};

/**
 * Generate refresh token (long-lived, 7 days)
 * Returns both the token and its hash
 */
export const generateRefreshTokenData = (userId: string): { token: string; hash: string; expiresAt: Date } => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
  
  return { token: refreshToken, hash, expiresAt };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload & { type?: string } => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { type?: string };
};

/**
 * Hash a refresh token for comparison
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Get token expiry time from env
 */
export const getAccessTokenExpiry = (): string => {
  return process.env.JWT_ACCESS_EXPIRE || '15m';
};

export const getRefreshTokenExpiry = (): number => {
  return 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
};
