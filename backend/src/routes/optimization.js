const express = require('express');
const router = express.Router();
const VacationOptimizer = require('../services/vacationOptimizer');
const OrderCombiner = require('../services/orderCombiner');

router.post('/vacation', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await VacationOptimizer.optimizeVacations(startDate, endDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/combinable-orders', async (req, res) => {
  try {
    const combinable = await OrderCombiner.findCombinableOrders();
    res.json(combinable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/combine-orders', async (req, res) => {
  try {
    const { orderIds, scheduledDate, scheduledTime } = req.body;
    const result = await OrderCombiner.combineOrders(orderIds, scheduledDate, scheduledTime);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

