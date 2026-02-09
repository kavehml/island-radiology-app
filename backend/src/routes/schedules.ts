import express, { Router } from 'express';
import {
  getSchedules,
  createSchedule,
  getRadiologistSchedule
} from '../controllers/scheduleController';

const router: Router = express.Router();

router.get('/', getSchedules);
router.post('/', createSchedule);
router.get('/radiologist/:radiologistId', getRadiologistSchedule);

export default router;
