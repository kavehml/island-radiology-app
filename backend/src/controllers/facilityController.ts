import { Request, Response } from 'express';
import Facility from '../models/Facility';

export const updateFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { siteId, equipmentType, quantity } = req.body;
    const facility = await Facility.create(siteId, equipmentType, quantity);
    res.json(facility);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getFacilitiesBySite = async (req: Request, res: Response): Promise<void> => {
  try {
    const siteId = parseInt(Array.isArray(req.params.siteId) ? req.params.siteId[0] : req.params.siteId);
    const facilities = await Facility.getBySite(siteId);
    res.json(facilities);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
