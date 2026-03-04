import express from 'express';
import { body, param } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from '../controllers/cart';
import { protect } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router
  .route('/')
  .get(protect, getCart as any)
  .post(
    protect,
    [
      body('productId').isMongoId().withMessage('Invalid product ID'),
      body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    ],
    handleValidationErrors,
    addToCart as any
  );

router
  .route('/:productId')
  .put(
    protect,
    [
      param('productId').isMongoId().withMessage('Invalid product ID'),
      body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    ],
    handleValidationErrors,
    updateCartItem as any
  )
  .delete(
    protect,
    param('productId').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
    removeFromCart as any
  );

export default router;
