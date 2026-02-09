import { Request, Response } from 'express';
import Site from '../models/Site';
import Facility from '../models/Facility';
import { CreateSiteRequest, UpdateSiteRequest } from '../types/api';

export const getAllSites = async (_req: Request, res: Response): Promise<void> => {
  try {
    const sites = await Site.getAll();
    const sitesWithFacilities = await Promise.all(
      sites.map(async (site) => ({
        ...site,
        facilities: await Facility.getBySite(site.id)
      }))
    );
    res.json(sitesWithFacilities);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getSiteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const site = await Site.getById(id);
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    const facilities = await Facility.getBySite(id);
    res.json({ ...site, facilities });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, address } = req.body as CreateSiteRequest;
    const site = await Site.create(name, address || null);
    res.status(201).json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { name, address } = req.body as UpdateSiteRequest;
    const site = await Site.update(id, name || '', address || null);
    res.json(site);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await Site.delete(id);
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
