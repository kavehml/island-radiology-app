import { Request, Response } from 'express';
import Procedure from '../models/Procedure';
import RadiologistProcedureTime from '../models/RadiologistProcedureTime';

export const getAllProcedures = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters = {
      category: req.query.category as string | undefined,
      bodyPart: req.query.bodyPart as string | undefined
    };
    const procedures = await Procedure.getAll(filters);
    res.json(procedures);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getProcedureById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const procedure = await Procedure.getById(id);
    if (!procedure) {
      res.status(404).json({ error: 'Procedure not found' });
      return;
    }
    res.json(procedure);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getProceduresByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = Array.isArray(req.params.category) ? req.params.category[0] : req.params.category;
    const procedures = await Procedure.getByCategory(category);
    res.json(procedures);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getRadiologistProcedureTimes = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiologistId = parseInt(Array.isArray(req.params.radiologistId) ? req.params.radiologistId[0] : req.params.radiologistId);
    const times = await RadiologistProcedureTime.getByRadiologist(radiologistId);
    res.json(times);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const setRadiologistProcedureTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, procedureId, averageReportingTime } = req.body;
    const result = await RadiologistProcedureTime.create(
      radiologistId,
      procedureId,
      averageReportingTime
    );
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const updateProcedureTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { averageReportingTime } = req.body;
    const result = await RadiologistProcedureTime.update(id, averageReportingTime);
    res.json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const deleteProcedureTime = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    await RadiologistProcedureTime.delete(id);
    res.json({ message: 'Procedure time deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
