import express, { Router } from 'express';
import {
  login,
  register,
  getCurrentUser,
  changePassword
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/change-password', authenticateToken, changePassword);

export default router;
