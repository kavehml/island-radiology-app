import { Request } from 'express';

// Request/Response types for API endpoints

export interface CreateSiteRequest {
  name: string;
  address?: string;
}

export interface UpdateSiteRequest {
  name?: string;
  address?: string;
}

export interface CreateRadiologistRequest {
  name: string;
  email: string;
  role?: 'radiologist' | 'admin';
  workHoursStart?: string;
  workHoursEnd?: string;
  workDays?: string;
}

export interface UpdateRadiologistRequest {
  name?: string;
  email?: string;
  role?: 'radiologist' | 'admin';
  workHoursStart?: string;
  workHoursEnd?: string;
  workDays?: string;
}

export interface AddSpecialtyRequest {
  radiologistId: number;
  specialty: string;
  proficiencyLevel?: number;
}

export interface AssignSiteRequest {
  radiologistId: number;
  siteId: number;
}

export interface CreateOrderRequest {
  patientId?: string;
  patientName?: string;
  orderingPhysician?: string;
  physicianSpecialty?: string;
  siteId?: number;
  orderType: 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray';
  bodyPart?: string;
  priority?: 'stat' | 'urgent' | 'routine' | 'low';
  priorityScore?: number;
  specialtyRequired?: string;
  isTimeSensitive?: boolean;
  timeSensitiveDeadline?: string;
  status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
}

export interface CreateScheduleRequest {
  radiologistId: number;
  siteId: number;
  date: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'vacation' | 'sick';
}

export interface OrderFilters {
  siteId?: number;
  assignedSiteId?: number;
  status?: string;
  orderType?: string;
  priorityMin?: number;
  timeSensitive?: boolean;
  specialty?: string;
}

export interface VacationOptimizationRequest {
  startDate: string;
  endDate: string;
}

export interface CombineOrdersRequest {
  orderIds: number[];
  scheduledDate: string;
  scheduledTime: string;
}

// Express Request extensions
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}
