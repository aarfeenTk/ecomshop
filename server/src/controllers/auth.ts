import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

  // Include tokens directly in the response data
  const responseData = {
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  };

  sendSuccessResponse(
    res,
    responseData,
    'User registered successfully',
    StatusCodes.CREATED
  );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  // Include tokens directly in the response data
  const responseData = {
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  };

  sendSuccessResponse(
    res,
    responseData,
    'Login successful',
    StatusCodes.OK
  );
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await authService.refreshToken(refreshToken);

  sendSuccessResponse(
    res,
    tokens,
    'Token refreshed successfully',
    StatusCodes.OK
  );
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  sendSuccessResponse(
    res,
    null,
    'Logged out successfully',
    StatusCodes.OK
  );
});

/**
 * Logout from all devices
 * POST /api/auth/logout-all
 */
export const logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  await authService.logoutAll(userId);

  sendSuccessResponse(
    res,
    null,
    'Logged out from all devices successfully',
    StatusCodes.OK
  );
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const user = await authService.getCurrentUser(userId);

  sendSuccessResponse(
    res,
    { user },
    'User profile retrieved successfully',
    StatusCodes.OK
  );
});
