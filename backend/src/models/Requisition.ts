import pool from '../config/database';

export interface RequisitionRow {
  id: number;
  requisition_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  patient_id: string | null;
  patient_name: string;
  patient_dob: Date | null;
  patient_phone: string | null;
  patient_email: string | null;
  referring_physician_name: string;
  referring_physician_npi: string | null;
  referring_physician_phone: string | null;
  referring_physician_email: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  order_type: 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray';
  body_part: string | null;
  clinical_indication: string | null;
  priority: 'stat' | 'urgent' | 'routine' | 'low';
  is_time_sensitive: boolean;
  time_sensitive_deadline: Date | null;
  previous_studies: string | null;
  special_instructions: string | null;
  contrast_required: boolean;
  contrast_allergy: boolean;
  submitted_by_email: string | null;
  submitted_by_name: string | null;
  submission_method: 'web' | 'api' | 'email';
  api_key_id: number | null;
  reviewed_by: number | null;
  reviewed_at: Date | null;
  review_notes: string | null;
  converted_to_order_id: number | null;
  assigned_site_id: number | null;
  assigned_at: Date | null;
  assignment_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RequisitionFormData {
  patientName: string;
  patientDob?: string;
  patientPhone?: string;
  patientEmail?: string;
  referringPhysicianName: string;
  referringPhysicianNpi?: string;
  referringPhysicianPhone?: string;
  referringPhysicianEmail?: string;
  clinicName?: string;
  clinicAddress?: string;
  orderType: 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray';
  bodyPart?: string;
  clinicalIndication?: string;
  priority?: 'stat' | 'urgent' | 'routine' | 'low';
  isTimeSensitive?: boolean;
  timeSensitiveDeadline?: string;
  previousStudies?: string;
  specialInstructions?: string;
  contrastRequired?: boolean;
  contrastAllergy?: boolean;
  submittedByEmail?: string;
  submittedByName?: string;
}

class Requisition {
  static async create(data: RequisitionFormData, submissionMethod: 'web' | 'api' | 'email' = 'web', apiKeyId: number | null = null): Promise<RequisitionRow> {
    const result = await pool.query(
      `INSERT INTO requisitions (
        patient_name, patient_dob, patient_phone, patient_email,
        referring_physician_name, referring_physician_npi, referring_physician_phone, referring_physician_email,
        clinic_name, clinic_address,
        order_type, body_part, clinical_indication, priority,
        is_time_sensitive, time_sensitive_deadline,
        previous_studies, special_instructions, contrast_required, contrast_allergy,
        submitted_by_email, submitted_by_name, submission_method, api_key_id
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
       RETURNING *`,
      [
        data.patientName,
        data.patientDob || null,
        data.patientPhone || null,
        data.patientEmail || null,
        data.referringPhysicianName,
        data.referringPhysicianNpi || null,
        data.referringPhysicianPhone || null,
        data.referringPhysicianEmail || null,
        data.clinicName || null,
        data.clinicAddress || null,
        data.orderType,
        data.bodyPart || null,
        data.clinicalIndication || null,
        data.priority || 'routine',
        data.isTimeSensitive || false,
        data.timeSensitiveDeadline || null,
        data.previousStudies || null,
        data.specialInstructions || null,
        data.contrastRequired || false,
        data.contrastAllergy || false,
        data.submittedByEmail || null,
        data.submittedByName || null,
        submissionMethod,
        apiKeyId
      ]
    );
    return result.rows[0] as RequisitionRow;
  }

  static async getAll(filters: { status?: string; submittedByEmail?: string } = {}): Promise<RequisitionRow[]> {
    let query = 'SELECT * FROM requisitions WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }

    if (filters.submittedByEmail) {
      query += ` AND submitted_by_email = $${paramCount++}`;
      params.push(filters.submittedByEmail);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows as RequisitionRow[];
  }

  static async getById(id: number): Promise<RequisitionRow | undefined> {
    const result = await pool.query('SELECT * FROM requisitions WHERE id = $1', [id]);
    return result.rows[0] as RequisitionRow | undefined;
  }

  static async getByRequisitionNumber(requisitionNumber: string): Promise<RequisitionRow | undefined> {
    const result = await pool.query('SELECT * FROM requisitions WHERE requisition_number = $1', [requisitionNumber]);
    return result.rows[0] as RequisitionRow | undefined;
  }

  static async approve(id: number, reviewedBy: number, reviewNotes?: string): Promise<RequisitionRow> {
    const result = await pool.query(
      `UPDATE requisitions 
       SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [reviewedBy, reviewNotes || null, id]
    );
    return result.rows[0] as RequisitionRow;
  }

  static async reject(id: number, reviewedBy: number, reviewNotes: string): Promise<RequisitionRow> {
    const result = await pool.query(
      `UPDATE requisitions 
       SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, review_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [reviewedBy, reviewNotes, id]
    );
    return result.rows[0] as RequisitionRow;
  }

  static async assignToSite(requisitionId: number, siteId: number, reason: string): Promise<RequisitionRow> {
    const result = await pool.query(
      `UPDATE requisitions 
       SET assigned_site_id = $1, assigned_at = CURRENT_TIMESTAMP, assignment_reason = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [siteId, reason, requisitionId]
    );
    return result.rows[0] as RequisitionRow;
  }

  static async convertToOrder(requisitionId: number, orderId: number): Promise<RequisitionRow> {
    const result = await pool.query(
      `UPDATE requisitions 
       SET status = 'converted', converted_to_order_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [orderId, requisitionId]
    );
    return result.rows[0] as RequisitionRow;
  }
}

export default Requisition;
