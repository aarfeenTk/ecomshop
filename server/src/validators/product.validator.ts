import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

/**
 * Product validation rules
 * Reusable validation middleware for product routes
 */

// ID validation
export const validateProductId = [
  param('id')
    .isString()
    .withMessage('Product ID must be a string')
    .isMongoId()
    .withMessage('Invalid product ID format'),
  handleValidationErrors,
];

// Create product validation
export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),
  
  body('price')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between 0.01 and 999999.99'),
  
  body('stock')
    .isInt({ min: 0, max: 99999 })
    .withMessage('Stock must be between 0 and 99999'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Image is required')
    .custom((value) => {
      // Accept either a URL or a base64 encoded image
      try {
        new URL(value);
        return true;
      } catch {
        // If not a URL, check if it's a valid base64 data URI
        if (value.startsWith('data:image/') && value.includes('base64,')) {
          return true;
        }
        throw new Error('Image must be a valid URL or base64 encoded image');
      }
    }),

  handleValidationErrors,
];

// Update product validation (all fields optional)
export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty')
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product description cannot be empty')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between 0.01 and 999999.99'),
  
  body('stock')
    .optional()
    .isInt({ min: 0, max: 99999 })
    .withMessage('Stock must be between 0 and 99999'),
  
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  
  body('image')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Image cannot be empty')
    .custom((value) => {
      // Accept either a URL or a base64 encoded image
      try {
        new URL(value);
        return true;
      } catch {
        // If not a URL, check if it's a valid base64 data URI
        if (value.startsWith('data:image/') && value.includes('base64,')) {
          return true;
        }
        throw new Error('Image must be a valid URL or base64 encoded image');
      }
    }),

  handleValidationErrors,
];

// Query parameter validation for getProducts
export const validateProductQuery = [
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
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'stock', 'category'])
    .withMessage('Sort by must be one of: name, price, createdAt, stock, category'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors,
];
