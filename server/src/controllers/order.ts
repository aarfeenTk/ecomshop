import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import orderService from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse, sendCreatedResponse, sendPaginatedResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateOrderData, UpdateOrderStatusData } from '../services/order.service';

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orderData = req.body as CreateOrderData;

  const order = await orderService.createOrder(userId, orderData);

  sendCreatedResponse(res, order, 'Order placed successfully');
});

export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const result = await orderService.getMyOrders(userId, page, limit);

  sendPaginatedResponse(
    res,
    result.orders,
    result.pagination.total,
    result.pagination.page,
    result.pagination.limit,
    'Orders retrieved successfully'
  );
});

export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const status = req.query.status as string | undefined;

  const result = await orderService.getAllOrders(page, limit, status);

  sendPaginatedResponse(
    res,
    result.orders,
    result.pagination.total,
    result.pagination.page,
    result.pagination.limit,
    'Orders retrieved successfully'
  );
});

export const getOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const isAdmin = req.user!.isAdmin;
  const orderId = req.params.id as string;

  const order = await orderService.getOrderById(orderId, userId, isAdmin);

  sendSuccessResponse(
    res,
    order,
    'Order retrieved successfully',
    StatusCodes.OK
  );
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body as UpdateOrderStatusData;

  const order = await orderService.updateOrderStatus(req.params.id as string, status);

  sendSuccessResponse(
    res,
    order,
    'Order status updated successfully',
    StatusCodes.OK
  );
});

export const cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orderId = req.params.id as string;

  const order = await orderService.cancelOrder(orderId, userId);

  sendSuccessResponse(
    res,
    order,
    'Order cancelled successfully',
    StatusCodes.OK
  );
});
