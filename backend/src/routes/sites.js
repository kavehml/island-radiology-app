const express = require('express');
const router = express.Router();
const {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
} = require('../controllers/siteController');

router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.post('/', createSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

module.exports = router;

