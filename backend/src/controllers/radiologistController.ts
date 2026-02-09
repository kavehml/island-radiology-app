import { Request, Response } from 'express';
import Radiologist from '../models/Radiologist';
import RadiologistSpecialty from '../models/RadiologistSpecialty';
import { CreateRadiologistRequest, UpdateRadiologistRequest, AddSpecialtyRequest, AssignSiteRequest } from '../types/api';

export const getAllRadiologists = async (_req: Request, res: Response): Promise<void> => {
  try {
    const radiologists = await Radiologist.getAll();
    const radiologistsWithSpecialties = await Promise.all(
      radiologists.map(async (radiologist) => ({
        ...radiologist,
        specialties: await RadiologistSpecialty.getByRadiologist(radiologist.id)
      }))
    );
    res.json(radiologistsWithSpecialties);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getRadiologistById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const radiologist = await Radiologist.getById(id);
    if (!radiologist) {
      res.status(404).json({ error: 'Radiologist not found' });
      return;
    }
    const sites = await Radiologist.getSites(id);
    const specialties = await RadiologistSpecialty.getByRadiologist(id);
    res.json({ ...radiologist, sites, specialties });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createRadiologist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, workHoursStart, workHoursEnd, workDays } = req.body as CreateRadiologistRequest;
    const radiologist = await Radiologist.create(name, email, role, workHoursStart, workHoursEnd, workDays);
    res.status(201).json(radiologist);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateRadiologist = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { name, email, role, workHoursStart, workHoursEnd, workDays } = req.body as UpdateRadiologistRequest;
    const radiologist = await Radiologist.update(
      id,
      name || '',
      email || '',
      role || 'radiologist',
      workHoursStart || null,
      workHoursEnd || null,
      workDays || null
    );
    res.json(radiologist);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const assignToSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, siteId } = req.body as AssignSiteRequest;
    await Radiologist.assignToSite(radiologistId, siteId);
    res.json({ message: 'Radiologist assigned to site' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const addSpecialty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, specialty, proficiencyLevel } = req.body as AddSpecialtyRequest;
    const result = await RadiologistSpecialty.create(radiologistId, specialty, proficiencyLevel);
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const removeFromSite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, siteId } = req.body as AssignSiteRequest;
    await Radiologist.removeFromSite(radiologistId, siteId);
    res.json({ message: 'Radiologist removed from site' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
