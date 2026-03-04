import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import orderService from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccessResponse, sendCreatedResponse, sendPaginatedResponse } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';
import { CreateOrderData, UpdateOrderStatusData } from '../services/order.service';

/**
 * Create new order
 * POST /api/orders
 */
export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orderData = req.body as CreateOrderData;

  const order = await orderService.createOrder(userId, orderData);

  sendCreatedResponse(res, order, 'Order placed successfully');
});

/**
 * Get my orders
 * GET /api/orders/my?page=1&limit=10
 */
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

/**
 * Get all orders (admin)
 * GET /api/orders?page=1&limit=10&status=Pending
 */
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

/**
 * Get order by ID
 * GET /api/orders/:id
 */
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

/**
 * Update order status (admin)
 * PUT /api/orders/:id/status
 */
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

/**
 * Cancel order
 * POST /api/orders/:id/cancel
 */
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
