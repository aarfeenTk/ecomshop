import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const result = await authService.register({ name, email, password });

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

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

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
