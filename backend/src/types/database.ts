// Database row types matching PostgreSQL schema

export interface SiteRow {
  id: number;
  name: string;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface FacilityRow {
  id: number;
  site_id: number;
  equipment_type: string;
  quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface RadiologistRow {
  id: number;
  name: string;
  email: string;
  role: 'radiologist' | 'admin';
  work_hours_start: string | null;
  work_hours_end: string | null;
  work_days: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RadiologistSpecialtyRow {
  id: number;
  radiologist_id: number;
  specialty: string;
  proficiency_level: number;
  created_at: Date;
}

export interface ScheduleRow {
  id: number;
  radiologist_id: number;
  site_id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'vacation' | 'sick';
  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: number;
  patient_id: string | null;
  patient_name: string | null;
  ordering_physician: string | null;
  physician_specialty: string | null;
  site_id: number | null;
  assigned_site_id: number | null;
  order_type: 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray';
  body_part: string | null;
  priority: 'stat' | 'urgent' | 'routine' | 'low';
  priority_score: number;
  specialty_required: string | null;
  is_time_sensitive: boolean;
  time_sensitive_deadline: Date | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  scheduled_date: string | null;
  scheduled_time: string | null;
  routing_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProcedureRow {
  id: number;
  name: string;
  category: string;
  body_part: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RadiologistProcedureTimeRow {
  id: number;
  radiologist_id: number;
  procedure_id: number;
  average_reporting_time: number;
  created_at: Date;
  updated_at: Date;
}

export interface TimeEstimateRow {
  id: number;
  radiologist_id: number;
  scan_type: string;
  average_perform_time: number;
  average_read_time: number;
  created_at: Date;
  updated_at: Date;
}
