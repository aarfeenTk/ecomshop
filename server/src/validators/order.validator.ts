import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

/**
 * Order validation rules
 * Reusable validation middleware for order routes
 */

// Create order validation
export const validateCreateOrder = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email must not exceed 100 characters'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('paymentMethod')
    .isIn(['Bank Transfer', 'Cash on Delivery'])
    .withMessage('Payment method must be either "Bank Transfer" or "Cash on Delivery"'),
  
  body('transactionReference')
    .if(body('paymentMethod').equals('Bank Transfer'))
    .trim()
    .notEmpty()
    .withMessage('Transaction reference is required for Bank Transfer')
    .isLength({ min: 5, max: 100 })
    .withMessage('Transaction reference must be between 5 and 100 characters'),
  
  handleValidationErrors,
];

// Update order status validation
export const validateUpdateOrderStatus = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  
  body('status')
    .isIn(['Pending', 'Approved', 'Shipped', 'Delivered'])
    .withMessage('Status must be one of: Pending, Approved, Shipped, Delivered'),
  
  handleValidationErrors,
];

// Get order by ID validation
export const validateOrderId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isMongoId()
    .withMessage('Invalid order ID format'),
  
  handleValidationErrors,
];

// Order query validation
export const validateOrderQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('status')
    .optional()
    .isIn(['Pending', 'Approved', 'Shipped', 'Delivered'])
    .withMessage('Status must be one of: Pending, Approved, Shipped, Delivered'),
  
  handleValidationErrors,
];
