import express, { Request, Response } from 'express';
import { register, login, refreshToken, logout, logoutAll, getMe } from '../controllers/auth';
import { protect } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateLogout,
} from '../validators/auth.validator';

const router = express.Router();

router.post('/register', validateRegister, register);

router.post('/login', validateLogin, login);

router.post('/refresh', validateRefreshToken, refreshToken);

router.post('/logout', validateLogout, logout);

router.post('/logout-all', protect, logoutAll);

router.get('/me', protect, getMe);

export default router;
