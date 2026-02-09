import express, { Router } from 'express';
import {
  submitRequisition,
  getRequisitionByNumber,
  getAllRequisitions,
  getRequisitionById,
  approveRequisition,
  rejectRequisition,
  convertToOrder
} from '../controllers/requisitionController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { authenticateApiKey } from '../middleware/apiAuth';

const router: Router = express.Router();

// Public endpoints (no auth required, but API key optional)
router.post('/submit', submitRequisition); // Can be called with or without API key
router.post('/submit-api', authenticateApiKey, submitRequisition); // Requires API key
router.get('/track/:requisitionNumber', getRequisitionByNumber); // Public tracking

// Admin/Staff endpoints (require authentication)
router.get('/', authenticateToken, requireRole('admin', 'staff'), getAllRequisitions);
router.get('/:id', authenticateToken, requireRole('admin', 'staff'), getRequisitionById);
router.post('/:id/approve', authenticateToken, requireRole('admin', 'staff'), approveRequisition);
router.post('/:id/reject', authenticateToken, requireRole('admin', 'staff'), rejectRequisition);
router.post('/:id/convert', authenticateToken, requireRole('admin', 'staff'), convertToOrder);

export default router;
