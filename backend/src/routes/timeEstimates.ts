import express, { Router } from 'express';
import { Request, Response } from 'express';
import TimeEstimate from '../models/TimeEstimate';

const router: Router = express.Router();

router.get('/radiologist/:radiologistId', async (req: Request, res: Response): Promise<void> => {
  try {
    const radiologistId = parseInt(Array.isArray(req.params.radiologistId) ? req.params.radiologistId[0] : req.params.radiologistId);
    const estimates = await TimeEstimate.getByRadiologist(radiologistId);
    res.json(estimates);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, scanType, averagePerformTime, averageReadTime } = req.body;
    const estimate = await TimeEstimate.create(radiologistId, scanType, averagePerformTime, averageReadTime);
    res.json(estimate);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.get('/average/:scanType', async (req: Request, res: Response): Promise<void> => {
  try {
    const scanType = Array.isArray(req.params.scanType) ? req.params.scanType[0] : req.params.scanType;
    const averages = await TimeEstimate.getAverageTimes(scanType);
    res.json(averages);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
