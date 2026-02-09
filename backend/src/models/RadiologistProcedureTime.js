const pool = require('../config/database');

class RadiologistProcedureTime {
  static async getByRadiologist(radiologistId) {
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

  static async getByProcedure(procedureId) {
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

  static async create(radiologistId, procedureId, averageReportingTime) {
    const result = await pool.query(
      `INSERT INTO radiologist_procedure_times (radiologist_id, procedure_id, average_reporting_time)
       VALUES ($1, $2, $3)
       ON CONFLICT (radiologist_id, procedure_id)
       DO UPDATE SET average_reporting_time = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [radiologistId, procedureId, averageReportingTime]
    );
    return result.rows[0];
  }

  static async update(id, averageReportingTime) {
    const result = await pool.query(
      `UPDATE radiologist_procedure_times 
       SET average_reporting_time = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [averageReportingTime, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM radiologist_procedure_times WHERE id = $1', [id]);
  }

  static async getAverageTimeForProcedure(procedureId) {
    const result = await pool.query(
      `SELECT AVG(average_reporting_time) as avg_time, COUNT(*) as count
       FROM radiologist_procedure_times
       WHERE procedure_id = $1`,
      [procedureId]
    );
    return result.rows[0];
  }
}

module.exports = RadiologistProcedureTime;

