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

router.get('/', protect, getCart);

router.post('/', protect, validateAddToCart, addToCart);

router.put('/:productId', protect, validateUpdateCartItem, updateCartItem);

router.delete('/:productId', protect, validateRemoveFromCart, removeFromCart);

router.delete('/', protect, clearCart);

export default router;
