import pool from '../config/database';
import { SiteRow } from '../types/database';

class Site {
  static async getAll(): Promise<SiteRow[]> {
    const result = await pool.query('SELECT * FROM sites ORDER BY name');
    return result.rows as SiteRow[];
  }

  static async getById(id: number): Promise<SiteRow | undefined> {
    const result = await pool.query('SELECT * FROM sites WHERE id = $1', [id]);
    return result.rows[0] as SiteRow | undefined;
  }

  static async create(name: string, address: string | null): Promise<SiteRow> {
    const result = await pool.query(
      'INSERT INTO sites (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    return result.rows[0] as SiteRow;
  }

  static async update(id: number, name: string, address: string | null): Promise<SiteRow> {
    const result = await pool.query(
      'UPDATE sites SET name = $1, address = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, address, id]
    );
    return result.rows[0] as SiteRow;
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM sites WHERE id = $1', [id]);
  }
}

export default Site;
