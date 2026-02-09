const express = require('express');
const router = express.Router();
const TimeEstimate = require('../models/TimeEstimate');

router.get('/radiologist/:radiologistId', async (req, res) => {
  try {
    const estimates = await TimeEstimate.getByRadiologist(req.params.radiologistId);
    res.json(estimates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { radiologistId, scanType, averagePerformTime, averageReadTime } = req.body;
    const estimate = await TimeEstimate.create(radiologistId, scanType, averagePerformTime, averageReadTime);
    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/average/:scanType', async (req, res) => {
  try {
    const averages = await TimeEstimate.getAverageTimes(req.params.scanType);
    res.json(averages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

