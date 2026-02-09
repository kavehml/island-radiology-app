const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const PatientRouter = require('../services/patientRouter');

// Get all orders with enhanced filtering
router.get('/', async (req, res) => {
  try {
    const filters = {
      siteId: req.query.siteId,
      assignedSiteId: req.query.assignedSiteId,
      status: req.query.status,
      orderType: req.query.orderType,
      priorityMin: req.query.priorityMin,
      timeSensitive: req.query.timeSensitive === 'true',
      specialty: req.query.specialty
    };
    const orders = await Order.getAll(filters);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order with enhanced fields
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route order to optimal site
router.post('/:id/route', async (req, res) => {
  try {
    const result = await PatientRouter.routeOrderToOptimalSite(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-route all pending orders
router.post('/route/all', async (req, res) => {
  try {
    const results = await PatientRouter.autoRoutePendingOrders();
    res.json({
      routed: results.filter(r => !r.error).length,
      errors: results.filter(r => r.error).length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route time-sensitive orders
router.post('/route/time-sensitive', async (req, res) => {
  try {
    const results = await PatientRouter.routeTimeSensitiveOrders();
    res.json({
      routed: results.filter(r => !r.error).length,
      errors: results.filter(r => r.error).length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

