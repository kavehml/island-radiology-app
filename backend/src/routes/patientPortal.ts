import express, { Router } from 'express';
import {
  authenticatePatient,
  getPatientRequisition,
  getPatientRequisitions
} from '../controllers/patientPortalController';

const router: Router = express.Router();

// Public patient portal endpoints
router.post('/authenticate', authenticatePatient);
router.get('/requisition/:requisitionNumber', getPatientRequisition);
router.get('/requisitions', getPatientRequisitions);

export default router;
