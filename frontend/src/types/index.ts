// Frontend type definitions

export type Priority = 'stat' | 'urgent' | 'routine' | 'low';
export type OrderType = 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray';
export type OrderStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';
export type ScheduleStatus = 'scheduled' | 'vacation' | 'sick';
export type Role = 'radiologist' | 'admin';

export interface Site {
  id: number;
  name: string;
  address: string | null;
  facilities?: Facility[];
  created_at?: string;
  updated_at?: string;
}

export interface Facility {
  id: number;
  site_id: number;
  equipment_type: string;
  quantity: number;
}

export interface Radiologist {
  id: number;
  name: string;
  email: string;
  role: Role;
  work_hours_start: string | null;
  work_hours_end: string | null;
  work_days: string | null;
  specialties?: Specialty[];
  sites?: Site[];
}

export interface Specialty {
  id: number;
  radiologist_id: number;
  specialty: string;
  proficiency_level: number;
}

export interface Order {
  id: number;
  patient_id: string | null;
  patient_name: string | null;
  ordering_physician: string | null;
  physician_specialty: string | null;
  site_id: number | null;
  assigned_site_id: number | null;
  order_type: OrderType;
  body_part: string | null;
  priority: Priority;
  priority_score: number;
  specialty_required: string | null;
  is_time_sensitive: boolean;
  time_sensitive_deadline: string | null;
  status: OrderStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  routing_reason: string | null;
  site_name?: string;
  assigned_site_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: number;
  radiologist_id: number;
  site_id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: ScheduleStatus;
  radiologist_name?: string;
  radiologist_email?: string;
  site_name?: string;
}

export interface Procedure {
  id: number;
  name: string;
  category: string;
  body_part: string | null;
  description: string | null;
}

export interface OrderFormData {
  patientId: string;
  patientName: string;
  orderingPhysician: string;
  physicianSpecialty: string;
  siteId: string;
  orderType: OrderType;
  bodyPart: string;
  priority: Priority;
  priorityScore: number;
  specialtyRequired: string;
  isTimeSensitive: boolean;
  timeSensitiveDeadline: string;
  autoRoute: boolean;
}

export interface RoutingResult {
  orderId: number;
  assignedSiteId: number;
  assignedSiteName: string;
  score: number;
  reasoning: string;
  allScores?: Array<{
    siteId: number;
    siteName: string;
    score: number;
    factors?: {
      equipmentAvailability?: number;
      radiologistAvailability?: number;
      workload?: number;
      priorityMatch?: number;
      geographic?: number;
    };
  }>;
}

export interface OptimizationResult {
  siteWorkloads: Record<string, number>;
  radiologistWorkloads: Record<string, number>;
  recommendations: Array<{
    action: string;
    fromSite: number;
    toSite: number;
    radiologist: number;
    radiologistName: string;
    reason: string;
  }>;
  overworkedSites: Array<{ siteId: number; workload: number }>;
  underworkedSites: Array<{ siteId: number; workload: number }>;
  averageWorkload: number;
}

export interface CombinableOrderGroup {
  patientId: string;
  siteId: number;
  orders: Order[];
  orderTypes: string[];
  physicians: string[];
  potentialSavings: number;
}
