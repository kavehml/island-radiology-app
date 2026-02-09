import { Request, Response } from 'express';
import Requisition from '../models/Requisition';
import Site from '../models/Site';
import pool from '../config/database';

// Patient authentication: verify requisition number + DOB
export const authenticatePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requisitionNumber, patientDob } = req.body;

    if (!requisitionNumber || !patientDob) {
      res.status(400).json({ error: 'Requisition number and date of birth are required' });
      return;
    }

    const requisition = await Requisition.getByRequisitionNumber(requisitionNumber);

    if (!requisition) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    // Verify DOB matches (format: YYYY-MM-DD)
    if (!requisition.patient_dob) {
      res.status(400).json({ error: 'Date of birth not on file for this requisition' });
      return;
    }

    const requisitionDob = new Date(requisition.patient_dob).toISOString().split('T')[0];
    const providedDob = new Date(patientDob).toISOString().split('T')[0];

    if (requisitionDob !== providedDob) {
      res.status(401).json({ error: 'Invalid date of birth' });
      return;
    }

    // Return a simple token (in production, use proper JWT)
    // For now, we'll use requisition number as the identifier
    res.json({
      success: true,
      requisitionNumber: requisition.requisition_number,
      patientName: requisition.patient_name
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get requisition details for patient portal
export const getPatientRequisition = async (req: Request, res: Response): Promise<void> => {
  try {
    const requisitionNumber = Array.isArray(req.params.requisitionNumber) 
      ? req.params.requisitionNumber[0] 
      : req.params.requisitionNumber;

    const requisition = await Requisition.getByRequisitionNumber(requisitionNumber);

    if (!requisition) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    // Get assigned site details if available
    let assignedSite = null;
    if (requisition.assigned_site_id) {
      assignedSite = await Site.getById(requisition.assigned_site_id);
    }

    // Return patient-safe information
    res.json({
      requisition_number: requisition.requisition_number,
      status: requisition.status,
      patient_name: requisition.patient_name,
      order_type: requisition.order_type,
      body_part: requisition.body_part,
      priority: requisition.priority,
      is_time_sensitive: requisition.is_time_sensitive,
      time_sensitive_deadline: requisition.time_sensitive_deadline,
      assigned_site: assignedSite ? {
        id: assignedSite.id,
        name: assignedSite.name,
        address: assignedSite.address
      } : null,
      assignment_reason: requisition.assignment_reason,
      assigned_at: requisition.assigned_at,
      created_at: requisition.created_at,
      reviewed_at: requisition.reviewed_at,
      review_notes: requisition.review_notes
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get all requisitions for a patient (by email or phone)
export const getPatientRequisitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      res.status(400).json({ error: 'Email or phone number is required' });
      return;
    }

    let query = 'SELECT * FROM requisitions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (email) {
      query += ` AND patient_email = $${paramCount++}`;
      params.push(email);
    }

    if (phone) {
      query += ` AND patient_phone = $${paramCount++}`;
      params.push(phone);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    const requisitions = result.rows;

    // Get site details for each requisition
    const requisitionsWithSites = await Promise.all(
      requisitions.map(async (req: any) => {
        let assignedSite = null;
        if (req.assigned_site_id) {
          assignedSite = await Site.getById(req.assigned_site_id);
        }

        return {
          requisition_number: req.requisition_number,
          status: req.status,
          order_type: req.order_type,
          body_part: req.body_part,
          priority: req.priority,
          assigned_site: assignedSite ? {
            id: assignedSite.id,
            name: assignedSite.name,
            address: assignedSite.address
          } : null,
          assigned_at: req.assigned_at,
          created_at: req.created_at
        };
      })
    );

    res.json(requisitionsWithSites);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
