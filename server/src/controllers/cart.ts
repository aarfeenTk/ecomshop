import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import cartService from '../services/cart.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { CartItemData, UpdateCartItemData } from '../services/cart.service';

export const getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const cart = await cartService.getCart(userId);

  sendSuccessResponse(
    res,
    cart,
    'Cart retrieved successfully',
    StatusCodes.OK
  );
});

export const addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const itemData = req.body as CartItemData;

  const cart = await cartService.addToCart(userId, itemData);

  sendSuccessResponse(
    res,
    cart,
    'Item added to cart successfully',
    StatusCodes.OK
  );
});

export const updateCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = req.params.productId as string;
  const { quantity } = req.body as UpdateCartItemData;

  const cart = await cartService.updateCartItem(userId, productId, { quantity });

  sendSuccessResponse(
    res,
    cart,
    'Cart item updated successfully',
    StatusCodes.OK
  );
});

export const removeFromCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const productId = req.params.productId as string;

  const cart = await cartService.removeFromCart(userId, productId);

  sendSuccessResponse(
    res,
    cart,
    'Item removed from cart successfully',
    StatusCodes.OK
  );
});

export const clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  await cartService.clearCart(userId);

  sendSuccessResponse(
    res,
    [],
    'Cart cleared successfully',
    StatusCodes.OK
  );
});
