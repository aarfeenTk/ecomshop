import express, { Request, Response } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  softDeleteProduct,
} from '../controllers/product';
import { protect, authorize } from '../middleware/auth';
import {
  validateProductId,
  validateCreateProduct,
  validateUpdateProduct,
  validateProductQuery,
} from '../validators/product.validator';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination and filtering
 * @access  Public
 */
router.get('/', validateProductQuery, getProducts);

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Private/Admin
 */
router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateProduct,
  createProduct
);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
router.get('/:id', validateProductId, getProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product
 * @access  Private/Admin
 */
router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateProductId,
  validateUpdateProduct,
  updateProduct
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (soft delete)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateProductId,
  deleteProduct
);

/**
 * @route   PATCH /api/products/:id/soft-delete
 * @desc    Soft delete a product
 * @access  Private/Admin
 */
router.patch(
  '/:id/soft-delete',
  protect,
  authorize('admin'),
  validateProductId,
  softDeleteProduct
);

export default router;
