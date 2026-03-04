import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Name must be at least 2 characters'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

export default router;
