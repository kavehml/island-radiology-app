import express, { Router } from 'express';
import { Request, Response } from 'express';
import Order from '../models/Order';
import PatientRouter from '../services/patientRouter';
import { OrderFilters, CreateOrderRequest } from '../types/api';

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: OrderFilters = {
      siteId: req.query.siteId ? parseInt(req.query.siteId as string) : undefined,
      assignedSiteId: req.query.assignedSiteId ? parseInt(req.query.assignedSiteId as string) : undefined,
      status: req.query.status as string | undefined,
      orderType: req.query.orderType as string | undefined,
      priorityMin: req.query.priorityMin ? parseInt(req.query.priorityMin as string) : undefined,
      timeSensitive: req.query.timeSensitive === 'true',
      specialty: req.query.specialty as string | undefined
    };
    const orders = await Order.getAll(filters);
    res.json(orders);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const order = await Order.getById(id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.create(req.body as CreateOrderRequest);
    res.status(201).json(order);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/route', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const result = await PatientRouter.routeOrderToOptimalSite(id);
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/all', async (_req: Request, res: Response): Promise<void> => {
  try {
    const results = await PatientRouter.autoRoutePendingOrders();
    res.json({
      routed: results.filter((r: any) => !r.error).length,
      errors: results.filter((r: any) => r.error).length,
      results
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

router.post('/route/time-sensitive', async (_req: Request, res: Response): Promise<void> => {
  try {
    const results = await PatientRouter.routeTimeSensitiveOrders();
    res.json({
      routed: results.filter((r: any) => !r.error).length,
      errors: results.filter((r: any) => r.error).length,
      results
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
