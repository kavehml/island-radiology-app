import express, { Router } from 'express';
import {
  updateFacility,
  getFacilitiesBySite
} from '../controllers/facilityController';

const router: Router = express.Router();

router.get('/site/:siteId', getFacilitiesBySite);
router.post('/', updateFacility);

export default router;
