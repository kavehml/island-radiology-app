import express, { Router } from 'express';
import {
  getAllProcedures,
  getProcedureById,
  getProceduresByCategory,
  getRadiologistProcedureTimes,
  setRadiologistProcedureTime,
  updateProcedureTime,
  deleteProcedureTime
} from '../controllers/procedureController';

const router: Router = express.Router();

router.get('/', getAllProcedures);
router.get('/category/:category', getProceduresByCategory);
router.get('/:id', getProcedureById);
router.get('/radiologist/:radiologistId/times', getRadiologistProcedureTimes);
router.post('/radiologist/time', setRadiologistProcedureTime);
router.put('/time/:id', updateProcedureTime);
router.delete('/time/:id', deleteProcedureTime);

export default router;
