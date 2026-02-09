const pool = require('../config/database');

class TimeEstimate {
  static async getByRadiologist(radiologistId) {
    const result = await pool.query(
      'SELECT * FROM time_estimates WHERE radiologist_id = $1 ORDER BY scan_type',
      [radiologistId]
    );
    return result.rows;
  }

  static async create(radiologistId, scanType, averagePerformTime, averageReadTime) {
    const result = await pool.query(
      `INSERT INTO time_estimates (radiologist_id, scan_type, average_perform_time, average_read_time)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (radiologist_id, scan_type)
       DO UPDATE SET average_perform_time = $3, average_read_time = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [radiologistId, scanType, averagePerformTime, averageReadTime]
    );
    return result.rows[0];
  }

  static async getAverageTimes(scanType) {
    const result = await pool.query(
      `SELECT AVG(average_perform_time) as avg_perform, AVG(average_read_time) as avg_read
       FROM time_estimates WHERE scan_type = $1`,
      [scanType]
    );
    return result.rows[0];
  }
}

module.exports = TimeEstimate;

