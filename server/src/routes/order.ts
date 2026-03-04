import express from 'express';
import { body, param } from 'express-validator';
import {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} from '../controllers/order';
import { protect, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router
  .route('/')
  .post(
    protect,
    [
      body('fullName').notEmpty().withMessage('Full name is required').trim(),
      body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
      body('phone').notEmpty().withMessage('Phone number is required'),
      body('address').notEmpty().withMessage('Address is required'),
      body('paymentMethod').isIn(['Bank Transfer', 'Cash on Delivery']).withMessage('Invalid payment method'),
      body('transactionReference').if(body('paymentMethod').equals('Bank Transfer')).notEmpty().withMessage('Transaction reference is required for bank transfer'),
    ],
    handleValidationErrors,
    createOrder as any
  )
  .get(protect, authorize('admin'), getOrders as any);

router.get('/my', protect, getMyOrders as any);

router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['Pending', 'Approved', 'Shipped', 'Delivered']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  updateOrderStatus as any
);

export default router;
