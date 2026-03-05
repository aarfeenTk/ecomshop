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

router.get('/', validateProductQuery, getProducts);

router.post(
  '/',
  protect,
  authorize('admin'),
  validateCreateProduct,
  createProduct
);

router.get('/:id', validateProductId, getProduct);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  validateProductId,
  validateUpdateProduct,
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  validateProductId,
  deleteProduct
);

router.patch(
  '/:id/soft-delete',
  protect,
  authorize('admin'),
  validateProductId,
  softDeleteProduct
);

export default router;
