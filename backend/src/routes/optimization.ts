import express, { Router } from 'express';
import { Request, Response } from 'express';
import VacationOptimizer from '../services/vacationOptimizer';
import OrderCombiner from '../services/orderCombiner';
import { VacationOptimizationRequest, CombineOrdersRequest } from '../types/api';

const router: Router = express.Router();

router.post('/vacation', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.body as VacationOptimizationRequest;
    const result = await VacationOptimizer.optimizeVacations(startDate, endDate);
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.get('/combinable-orders', async (_req: Request, res: Response): Promise<void> => {
  try {
    const combinable = await OrderCombiner.findCombinableOrders();
    res.json(combinable);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/combine-orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderIds, scheduledDate, scheduledTime } = req.body as CombineOrdersRequest;
    const result = await OrderCombiner.combineOrders(orderIds, scheduledDate, scheduledTime);
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
