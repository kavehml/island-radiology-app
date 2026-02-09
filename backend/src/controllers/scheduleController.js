const Schedule = require('../models/Schedule');

const getSchedules = async (req, res) => {
  try {
    const { startDate, endDate, siteId } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const schedules = await Schedule.getByDateRange(startDate, endDate, siteId);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const { radiologistId, siteId, date, startTime, endTime, status } = req.body;
    const schedule = await Schedule.create(radiologistId, siteId, date, startTime, endTime, status);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRadiologistSchedule = async (req, res) => {
  try {
    const { radiologistId } = req.params;
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    const schedules = await Schedule.getByRadiologist(radiologistId, startDate, endDate);
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSchedules,
  createSchedule,
  getRadiologistSchedule
};

