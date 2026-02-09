const express = require('express');
const router = express.Router();
const {
  getAllRadiologists,
  getRadiologistById,
  createRadiologist,
  updateRadiologist,
  assignToSite,
  removeFromSite,
  addSpecialty
} = require('../controllers/radiologistController');

router.get('/', getAllRadiologists);
router.get('/:id', getRadiologistById);
router.post('/', createRadiologist);
router.put('/:id', updateRadiologist);
router.post('/assign-site', assignToSite);
router.post('/remove-site', removeFromSite);
router.post('/specialty', addSpecialty);

module.exports = router;

