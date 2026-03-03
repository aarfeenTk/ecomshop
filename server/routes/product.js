const express = require('express');
const { body, param } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
} = require('../controllers/product');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Name is required').trim(),
      body('description').notEmpty().withMessage('Description is required'),
      body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
      body('category').notEmpty().withMessage('Category is required').trim(),
      body('image').notEmpty().withMessage('Image is required'),
    ],
    handleValidationErrors,
    createProduct
  );

router
  .route('/:id')
  .get(
    param('id').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
    getProduct
  )
  .put(
    protect,
    authorize('admin'),
    [
      param('id').isMongoId().withMessage('Invalid product ID'),
      body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
      body('description').optional().notEmpty().withMessage('Description cannot be empty'),
      body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
      body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
      body('category').optional().notEmpty().withMessage('Category cannot be empty').trim(),
      body('image').optional().notEmpty().withMessage('Image cannot be empty'),
    ],
    handleValidationErrors,
    updateProduct
  )
  .delete(
    protect,
    authorize('admin'),
    param('id').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
    deleteProduct
  );

// Soft delete endpoint (alternative to hard delete)
router.patch(
  '/:id/soft-delete',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors,
  softDeleteProduct
);

module.exports = router;
