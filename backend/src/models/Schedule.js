const pool = require('../config/database');

class Schedule {
  static async getByDateRange(startDate, endDate, siteId = null) {
    let query = `
      SELECT s.*, r.name as radiologist_name, r.email as radiologist_email, st.name as site_name
      FROM schedules s
      INNER JOIN radiologists r ON s.radiologist_id = r.id
      INNER JOIN sites st ON s.site_id = st.id
      WHERE s.date BETWEEN $1 AND $2
    `;
    const params = [startDate, endDate];
    
    if (siteId) {
      query += ' AND s.site_id = $3';
      params.push(siteId);
    }
    
    query += ' ORDER BY s.date, s.start_time';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async create(radiologistId, siteId, date, startTime, endTime, status = 'scheduled') {
    const result = await pool.query(
      `INSERT INTO schedules (radiologist_id, site_id, date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (radiologist_id, site_id, date)
       DO UPDATE SET start_time = $4, end_time = $5, status = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [radiologistId, siteId, date, startTime, endTime, status]
    );
    return result.rows[0];
  }

  static async getByRadiologist(radiologistId, startDate, endDate) {
    const result = await pool.query(
      `SELECT s.*, st.name as site_name FROM schedules s
       INNER JOIN sites st ON s.site_id = st.id
       WHERE s.radiologist_id = $1 AND s.date BETWEEN $2 AND $3
       ORDER BY s.date, s.start_time`,
      [radiologistId, startDate, endDate]
    );
    return result.rows;
  }

  static async delete(id) {
    await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
  }
}

module.exports = Schedule;

