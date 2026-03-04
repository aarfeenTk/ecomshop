import express, { Request, Response } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/order';
import { protect, authorize } from '../middleware/auth';
import {
  validateCreateOrder,
  validateUpdateOrderStatus,
  validateOrderId,
  validateOrderQuery,
} from '../validators/order.validator';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', protect, validateCreateOrder, createOrder);

/**
 * @route   GET /api/orders/my
 * @desc    Get my orders with pagination
 * @access  Private
 */
router.get('/my', protect, validateOrderQuery, getMyOrders);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (admin)
 * @access  Private/Admin
 */
router.get('/', protect, authorize('admin'), validateOrderQuery, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (owner or admin)
 */
router.get('/:id', protect, validateOrderId, getOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  validateUpdateOrderStatus,
  updateOrderStatus
);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order (pending orders only)
 * @access  Private (owner only)
 */
router.post('/:id/cancel', protect, validateOrderId, cancelOrder);

export default router;
