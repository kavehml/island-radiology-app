const express = require('express');
const router = express.Router();
const {
  getSchedules,
  createSchedule,
  getRadiologistSchedule
} = require('../controllers/scheduleController');

router.get('/', getSchedules);
router.post('/', createSchedule);
router.get('/radiologist/:radiologistId', getRadiologistSchedule);

module.exports = router;

