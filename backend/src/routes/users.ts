import express, { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router: Router = express.Router();

// All user management routes require admin role
router.get('/', authenticateToken, requireRole('admin'), getAllUsers);
router.post('/', authenticateToken, requireRole('admin'), createUser);
router.put('/:id', authenticateToken, requireRole('admin'), updateUser);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteUser);

export default router;
