import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import { CreateScheduleRequest } from '../types/api';

export const getSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, siteId } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }
    const startDateStr: string = Array.isArray(startDate) ? String(startDate[0]) : String(startDate);
    const endDateStr: string = Array.isArray(endDate) ? String(endDate[0]) : String(endDate);
    const schedules = await Schedule.getByDateRange(
      startDateStr,
      endDateStr,
      siteId ? parseInt(Array.isArray(siteId) ? String(siteId[0]) : String(siteId)) : null
    );
    res.json(schedules);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { radiologistId, siteId, date, startTime, endTime, status } = req.body as CreateScheduleRequest;
    const dateStr = Array.isArray(date) ? date[0] : String(date);
    const schedule = await Schedule.create(radiologistId, siteId, dateStr, startTime || null, endTime || null, status);
    res.status(201).json(schedule);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getRadiologistSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const radiologistId = parseInt(Array.isArray(req.params.radiologistId) ? req.params.radiologistId[0] : req.params.radiologistId);
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }
    const startDateStr = Array.isArray(startDate) ? startDate[0] : String(startDate);
    const endDateStr = Array.isArray(endDate) ? endDate[0] : String(endDate);
    const schedules = await Schedule.getByRadiologist(
      radiologistId,
      String(startDateStr),
      String(endDateStr)
    );
    res.json(schedules);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
