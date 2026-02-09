import { Request, Response } from 'express';
import Requisition, { RequisitionFormData } from '../models/Requisition';
import Order from '../models/Order';
import RequisitionRouter from '../services/requisitionRouter';
import { ApiAuthenticatedRequest } from '../middleware/apiAuth';
import { AuthenticatedRequest } from '../types/api';

// Public endpoint for submitting requisitions (no auth required, but can use API key)
export const submitRequisition = async (req: Request | ApiAuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as RequisitionFormData;

    // Validate required fields
    if (!data.patientName || !data.referringPhysicianName || !data.orderType) {
      res.status(400).json({ 
        error: 'Missing required fields: patientName, referringPhysicianName, and orderType are required' 
      });
      return;
    }

    // Determine submission method
    const submissionMethod = (req as ApiAuthenticatedRequest).apiKey ? 'api' : 'web';
    const apiKeyId = (req as ApiAuthenticatedRequest).apiKey?.id || null;

    const requisition = await Requisition.create(data, submissionMethod, apiKeyId);

    res.status(201).json({
      success: true,
      message: 'Requisition submitted successfully',
      requisition: {
        id: requisition.id,
        requisition_number: requisition.requisition_number,
        status: requisition.status,
        created_at: requisition.created_at
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Get requisition by number (public, for tracking)
export const getRequisitionByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const requisitionNumber = Array.isArray(req.params.requisitionNumber) 
      ? req.params.requisitionNumber[0] 
      : req.params.requisitionNumber;
    const requisition = await Requisition.getByRequisitionNumber(requisitionNumber);

    if (!requisition) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    // Return limited information for public access
    res.json({
      requisition_number: requisition.requisition_number,
      status: requisition.status,
      patient_name: requisition.patient_name,
      order_type: requisition.order_type,
      created_at: requisition.created_at,
      reviewed_at: requisition.reviewed_at
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// Admin endpoints
export const getAllRequisitions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filters: { status?: string } = {};
    if (status) {
      filters.status = status as string;
    }
    const requisitions = await Requisition.getAll(filters);
    res.json(requisitions);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getRequisitionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const requisition = await Requisition.getById(id);

    if (!requisition) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    res.json(requisition);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const approveRequisition = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { reviewNotes } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Approve the requisition
    const requisition = await Requisition.approve(id, req.user.id, reviewNotes);

    // Automatically assign to optimal site
    try {
      const routingResult = await RequisitionRouter.routeRequisitionToOptimalSite(id);
      res.json({
        ...requisition,
        assigned_site_id: routingResult.assignedSiteId,
        assigned_site_name: routingResult.assignedSiteName,
        assignment_reason: routingResult.reasoning,
        routing_score: routingResult.score
      });
    } catch (routingError) {
      // If routing fails, still return approved requisition but log the error
      console.error('Failed to auto-assign requisition:', routingError);
      res.json({
        ...requisition,
        warning: 'Requisition approved but automatic site assignment failed. Please assign manually.'
      });
    }
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const rejectRequisition = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const { reviewNotes } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!reviewNotes) {
      res.status(400).json({ error: 'Review notes are required for rejection' });
      return;
    }

    const requisition = await Requisition.reject(id, req.user.id, reviewNotes);
    res.json(requisition);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const convertToOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    const requisition = await Requisition.getById(id);

    if (!requisition) {
      res.status(404).json({ error: 'Requisition not found' });
      return;
    }

    if (requisition.status !== 'approved') {
      res.status(400).json({ error: 'Only approved requisitions can be converted to orders' });
      return;
    }

    // Convert requisition to order
    const orderData = {
      patientId: requisition.patient_id,
      patientName: requisition.patient_name,
      orderingPhysician: requisition.referring_physician_name,
      physicianSpecialty: null,
      siteId: null,
      orderType: requisition.order_type,
      bodyPart: requisition.body_part || null,
      priority: requisition.priority,
      specialtyRequired: null,
      isTimeSensitive: requisition.is_time_sensitive,
      timeSensitiveDeadline: requisition.time_sensitive_deadline || null,
      status: 'pending' as const
    };

    const order = await Order.create(orderData);
    await Requisition.convertToOrder(id, order.id);

    res.json({
      message: 'Requisition converted to order successfully',
      requisition,
      order
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
