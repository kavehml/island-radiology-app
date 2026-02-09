import express, { Router } from 'express';
import {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
} from '../controllers/siteController';

const router: Router = express.Router();

router.get('/', getAllSites);
router.get('/:id', getSiteById);
router.post('/', createSite);
router.put('/:id', updateSite);
router.delete('/:id', deleteSite);

export default router;
