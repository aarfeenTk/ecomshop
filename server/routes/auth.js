const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth');
const { handleValidationErrors } = require('../middleware/validation');

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

module.exports = router;
