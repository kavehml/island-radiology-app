import pool from '../config/database';
import { ProcedureRow } from '../types/database';

interface ProcedureFilters {
  category?: string;
  bodyPart?: string;
}

class Procedure {
  static async getAll(filters: ProcedureFilters = {}): Promise<ProcedureRow[]> {
    let query = 'SELECT * FROM procedures WHERE 1=1';
    const params: any[] = [];
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
    return result.rows as ProcedureRow[];
  }

  static async getById(id: number): Promise<ProcedureRow | undefined> {
    const result = await pool.query('SELECT * FROM procedures WHERE id = $1', [id]);
    return result.rows[0] as ProcedureRow | undefined;
  }

  static async getByCategory(category: string): Promise<ProcedureRow[]> {
    const result = await pool.query(
      'SELECT * FROM procedures WHERE category = $1 ORDER BY name',
      [category]
    );
    return result.rows as ProcedureRow[];
  }
}

export default Procedure;
