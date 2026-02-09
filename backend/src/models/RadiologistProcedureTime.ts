import pool from '../config/database';
import { RadiologistProcedureTimeRow } from '../types/database';

class RadiologistProcedureTime {
  static async getByRadiologist(radiologistId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT rpt.*, p.name as procedure_name, p.category, p.body_part
       FROM radiologist_procedure_times rpt
       INNER JOIN procedures p ON rpt.procedure_id = p.id
       WHERE rpt.radiologist_id = $1
       ORDER BY p.category, p.name`,
      [radiologistId]
    );
    return result.rows;
  }

  static async getByProcedure(procedureId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT rpt.*, r.name as radiologist_name, r.email
       FROM radiologist_procedure_times rpt
       INNER JOIN radiologists r ON rpt.radiologist_id = r.id
       WHERE rpt.procedure_id = $1
       ORDER BY r.name`,
      [procedureId]
    );
    return result.rows;
  }

  static async create(
    radiologistId: number,
    procedureId: number,
    averageReportingTime: number
  ): Promise<RadiologistProcedureTimeRow> {
    const result = await pool.query(
      `INSERT INTO radiologist_procedure_times (radiologist_id, procedure_id, average_reporting_time)
       VALUES ($1, $2, $3)
       ON CONFLICT (radiologist_id, procedure_id)
       DO UPDATE SET average_reporting_time = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [radiologistId, procedureId, averageReportingTime]
    );
    return result.rows[0] as RadiologistProcedureTimeRow;
  }

  static async update(id: number, averageReportingTime: number): Promise<RadiologistProcedureTimeRow> {
    const result = await pool.query(
      `UPDATE radiologist_procedure_times 
       SET average_reporting_time = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [averageReportingTime, id]
    );
    return result.rows[0] as RadiologistProcedureTimeRow;
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM radiologist_procedure_times WHERE id = $1', [id]);
  }

  static async getAverageTimeForProcedure(procedureId: number): Promise<{ avg_time: number | null; count: string }> {
    const result = await pool.query(
      `SELECT AVG(average_reporting_time) as avg_time, COUNT(*) as count
       FROM radiologist_procedure_times
       WHERE procedure_id = $1`,
      [procedureId]
    );
    return result.rows[0] as { avg_time: number | null; count: string };
  }
}

export default RadiologistProcedureTime;
