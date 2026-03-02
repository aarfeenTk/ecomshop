const express = require('express');
const { body, param } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} = require('../controllers/cart');
const { protect } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(protect, getCart)
  .post(
    protect,
    [
      body('productId').isMongoId().withMessage('Invalid product ID'),
      body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    ],
    handleValidationErrors,
    addToCart
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
    updateCartItem
  )
  .delete(
    protect,
    param('productId').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
    removeFromCart
  );

module.exports = router;
