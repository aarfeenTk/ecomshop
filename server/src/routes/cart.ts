import express, { Request, Response } from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart';
import { protect } from '../middleware/auth';
import {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
} from '../validators/cart.validator';

const router = express.Router();

/**
 * @route   GET /api/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/', protect, getCart);

/**
 * @route   POST /api/cart
 * @desc    Add item to cart
 * @access  Private
 */
router.post('/', protect, validateAddToCart, addToCart);

/**
 * @route   PUT /api/cart/:productId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/:productId', protect, validateUpdateCartItem, updateCartItem);

/**
 * @route   DELETE /api/cart/:productId
 * @desc    Remove item from cart
 * @access  Private
 */
router.delete('/:productId', protect, validateRemoveFromCart, removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/', protect, clearCart);

export default router;
