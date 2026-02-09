const express = require('express');
const router = express.Router();
const {
  getAllProcedures,
  getProcedureById,
  getProceduresByCategory,
  getRadiologistProcedureTimes,
  setRadiologistProcedureTime,
  updateProcedureTime,
  deleteProcedureTime
} = require('../controllers/procedureController');

router.get('/', getAllProcedures);
router.get('/category/:category', getProceduresByCategory);
router.get('/:id', getProcedureById);
router.get('/radiologist/:radiologistId/times', getRadiologistProcedureTimes);
router.post('/radiologist/time', setRadiologistProcedureTime);
router.put('/time/:id', updateProcedureTime);
router.delete('/time/:id', deleteProcedureTime);

module.exports = router;

