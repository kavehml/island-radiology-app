const express = require('express');
const router = express.Router();
const {
  updateFacility,
  getFacilitiesBySite
} = require('../controllers/facilityController');

router.get('/site/:siteId', getFacilitiesBySite);
router.post('/', updateFacility);

module.exports = router;

