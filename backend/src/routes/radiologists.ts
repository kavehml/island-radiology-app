import express, { Router } from 'express';
import {
  getAllRadiologists,
  getRadiologistById,
  createRadiologist,
  updateRadiologist,
  assignToSite,
  removeFromSite,
  addSpecialty
} from '../controllers/radiologistController';

const router: Router = express.Router();

router.get('/', getAllRadiologists);
router.get('/:id', getRadiologistById);
router.post('/', createRadiologist);
router.put('/:id', updateRadiologist);
router.post('/assign-site', assignToSite);
router.post('/remove-site', removeFromSite);
router.post('/specialty', addSpecialty);

export default router;
