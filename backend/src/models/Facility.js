const pool = require('../config/database');

class Facility {
  static async getBySite(siteId) {
    const result = await pool.query(
      'SELECT * FROM facilities WHERE site_id = $1 ORDER BY equipment_type',
      [siteId]
    );
    return result.rows;
  }

  static async create(siteId, equipmentType, quantity) {
    const result = await pool.query(
      `INSERT INTO facilities (site_id, equipment_type, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (site_id, equipment_type) 
       DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP 
       RETURNING *`,
      [siteId, equipmentType, quantity]
    );
    return result.rows[0];
  }

  static async update(siteId, equipmentType, quantity) {
    const result = await pool.query(
      'UPDATE facilities SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE site_id = $2 AND equipment_type = $3 RETURNING *',
      [quantity, siteId, equipmentType]
    );
    return result.rows[0];
  }
}

module.exports = Facility;

