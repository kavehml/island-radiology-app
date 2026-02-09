const pool = require('../config/database');

class Procedure {
  static async getAll(filters = {}) {
    let query = 'SELECT * FROM procedures WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.category) {
      query += ` AND category = $${paramCount++}`;
      params.push(filters.category);
    }
    if (filters.bodyPart) {
      query += ` AND body_part = $${paramCount++}`;
      params.push(filters.bodyPart);
    }

    query += ' ORDER BY category, name';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM procedures WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async getByCategory(category) {
    const result = await pool.query(
      'SELECT * FROM procedures WHERE category = $1 ORDER BY name',
      [category]
    );
    return result.rows;
  }
}

module.exports = Procedure;

