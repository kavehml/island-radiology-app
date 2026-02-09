const pool = require('../config/database');

class Radiologist {
  static async getAll() {
    const result = await pool.query('SELECT * FROM radiologists ORDER BY name');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM radiologists WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(name, email, role = 'radiologist', workHoursStart = null, workHoursEnd = null, workDays = null) {
    const result = await pool.query(
      'INSERT INTO radiologists (name, email, role, work_hours_start, work_hours_end, work_days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, role, workHoursStart, workHoursEnd, workDays]
    );
    return result.rows[0];
  }

  static async update(id, name, email, role, workHoursStart, workHoursEnd, workDays) {
    const result = await pool.query(
      `UPDATE radiologists 
       SET name = $1, email = $2, role = $3, work_hours_start = $4, work_hours_end = $5, work_days = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [name, email, role, workHoursStart, workHoursEnd, workDays, id]
    );
    return result.rows[0];
  }

  static async getSites(radiologistId) {
    const result = await pool.query(
      `SELECT s.* FROM sites s
       INNER JOIN radiologist_sites rs ON s.id = rs.site_id
       WHERE rs.radiologist_id = $1`,
      [radiologistId]
    );
    return result.rows;
  }

  static async assignToSite(radiologistId, siteId) {
    const result = await pool.query(
      'INSERT INTO radiologist_sites (radiologist_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [radiologistId, siteId]
    );
    return result.rows[0];
  }

  static async removeFromSite(radiologistId, siteId) {
    await pool.query(
      'DELETE FROM radiologist_sites WHERE radiologist_id = $1 AND site_id = $2',
      [radiologistId, siteId]
    );
  }
}

module.exports = Radiologist;

