import express from 'express';
import { body, param } from 'express-validator';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
} from '../controllers/product';
import { protect, authorize } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';

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
    createProduct as any
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
    updateProduct as any
  )
  .delete(
    protect,
    authorize('admin'),
    param('id').isMongoId().withMessage('Invalid product ID'),
    handleValidationErrors,
    deleteProduct as any
  );

router.patch(
  '/:id/soft-delete',
  protect,
  authorize('admin'),
  param('id').isMongoId().withMessage('Invalid product ID'),
  handleValidationErrors,
  softDeleteProduct as any
);

export default router;
