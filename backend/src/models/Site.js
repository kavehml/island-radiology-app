const pool = require('../config/database');

class Site {
  static async getAll() {
    const result = await pool.query('SELECT * FROM sites ORDER BY name');
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM sites WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(name, address) {
    const result = await pool.query(
      'INSERT INTO sites (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    return result.rows[0];
  }

  static async update(id, name, address) {
    const result = await pool.query(
      'UPDATE sites SET name = $1, address = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, address, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM sites WHERE id = $1', [id]);
  }
}

module.exports = Site;

