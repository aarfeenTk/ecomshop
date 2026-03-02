const express = require('express');
const { body, param } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require('../controllers/order');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

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
    createOrder
  )
  .get(protect, authorize('admin'), getOrders);

router.get('/my', protect, getMyOrders);

router.put(
  '/:id/status',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(['Pending', 'Approved', 'Shipped', 'Delivered']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  updateOrderStatus
);

module.exports = router;
