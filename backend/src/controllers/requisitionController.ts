import { Request, Response } from 'express';
import Requisition, { RequisitionFormData } from '../models/Requisition';
import Order from '../models/Order';
import RequisitionRouter from '../services/requisitionRouter';
import { ApiAuthenticatedRequest } from '../middleware/apiAuth';
import { AuthenticatedRequest } from '../types/api';
import { sendRequisitionConfirmationEmail } from '../services/emailService';

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

    // Send confirmation email to submitter if email is provided
    if (data.submittedByEmail && data.submittedByName) {
      try {
        await sendRequisitionConfirmationEmail({
          to: data.submittedByEmail,
          requisitionNumber: requisition.requisition_number,
          patientName: data.patientName,
          orderType: data.orderType,
          submittedByName: data.submittedByName,
          submittedAt: new Date(requisition.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      } catch (emailError) {
        // Log error but don't fail the request if email fails
        console.error('Failed to send confirmation email:', emailError);
      }
    }

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

    // Automatically assign to optimal site (considers radiologist specialty)
    try {
      const routingResult = await RequisitionRouter.routeRequisitionToOptimalSite(id);
      
      // Automatically assign to a radiologist at the assigned site if specialty is specified
      let assignedRadiologist = null;
      if (requisition.specialty_required) {
        try {
          assignedRadiologist = await RequisitionRouter.assignToRadiologist(id, routingResult.assignedSiteId, requisition.specialty_required);
        } catch (radiologistError) {
          console.error('Failed to auto-assign radiologist:', radiologistError);
          // Continue even if radiologist assignment fails
        }
      }
      
      // Automatically convert approved requisition to an order
      try {
        const orderData = {
          patientId: requisition.patient_id || null,
          patientName: requisition.patient_name,
          orderingPhysician: requisition.referring_physician_name,
          physicianSpecialty: null,
          siteId: routingResult.assignedSiteId || null,
          orderType: requisition.order_type,
          bodyPart: requisition.body_part || null,
          priority: requisition.priority || 'routine',
          specialtyRequired: requisition.specialty_required || null,
          isTimeSensitive: requisition.is_time_sensitive || false,
          timeSensitiveDeadline: requisition.time_sensitive_deadline || null,
          status: 'pending' as const
        };

        const order = await Order.create(orderData);
        
        // Assign the order to the same site as the requisition
        if (routingResult.assignedSiteId) {
          await Order.updateAssignedSite(order.id, routingResult.assignedSiteId, routingResult.reasoning);
        }
        
        // Mark requisition as converted
        await Requisition.convertToOrder(id, order.id);
        
        // Update requisition status to 'converted'
        const updatedRequisition = await Requisition.getById(id);
        
        res.json({
          ...updatedRequisition,
          assigned_site_id: routingResult.assignedSiteId,
          assigned_site_name: routingResult.assignedSiteName,
          assignment_reason: routingResult.reasoning,
          routing_score: routingResult.score,
          assigned_radiologist_id: assignedRadiologist?.radiologistId || null,
          assigned_radiologist_name: assignedRadiologist?.radiologistName || null,
          converted_to_order_id: order.id,
          order: {
            id: order.id,
            status: order.status,
            assigned_site_id: order.assigned_site_id
          }
        });
      } catch (conversionError) {
        console.error('Failed to convert requisition to order:', conversionError);
        // Still return approved requisition even if conversion fails
        res.json({
          ...requisition,
          assigned_site_id: routingResult.assignedSiteId,
          assigned_site_name: routingResult.assignedSiteName,
          assignment_reason: routingResult.reasoning,
          routing_score: routingResult.score,
          assigned_radiologist_id: assignedRadiologist?.radiologistId || null,
          assigned_radiologist_name: assignedRadiologist?.radiologistName || null,
          warning: 'Requisition approved and assigned, but automatic order conversion failed. Please convert manually.'
        });
      }
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
