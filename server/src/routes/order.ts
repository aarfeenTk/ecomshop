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

router.post('/', protect, validateCreateOrder, createOrder);

router.get('/my', protect, validateOrderQuery, getMyOrders);

router.get('/', protect, authorize('admin'), validateOrderQuery, getOrders);

router.get('/:id', protect, validateOrderId, getOrder);

router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  validateUpdateOrderStatus,
  updateOrderStatus
);

router.post('/:id/cancel', protect, validateOrderId, cancelOrder);

export default router;
