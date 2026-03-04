import { body, param, query } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";

/**
 * Cart validation rules
 * Reusable validation middleware for cart routes
 */

// Add to cart validation
export const validateAddToCart = [
  body("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  body("quantity")
    .optional()
    .isInt({ min: 1, max: 999 })
    .withMessage("Quantity must be between 1 and 999")
    .toInt(),

  handleValidationErrors,
];

// Update cart item validation
export const validateUpdateCartItem = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  body("quantity")
    .isInt({ min: 1, max: 999 })
    .withMessage("Quantity must be between 1 and 999")
    .toInt(),

  handleValidationErrors,
];

// Remove from cart validation
export const validateRemoveFromCart = [
  param("productId")
    .trim()
    .notEmpty()
    .withMessage("Product ID is required")
    .isMongoId()
    .withMessage("Invalid product ID format"),

  handleValidationErrors,
];
