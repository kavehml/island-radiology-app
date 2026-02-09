import express, { Router } from 'express';
import {
  createApiKey,
  getAllApiKeys,
  deactivateApiKey,
  deleteApiKey
} from '../controllers/apiKeyController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router: Router = express.Router();

// All API key management routes require admin role
router.get('/', authenticateToken, requireRole('admin'), getAllApiKeys);
router.post('/', authenticateToken, requireRole('admin'), createApiKey);
router.post('/:id/deactivate', authenticateToken, requireRole('admin'), deactivateApiKey);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteApiKey);

export default router;
