import pool from '../config/database';
import { RadiologistRow, SiteRow } from '../types/database';

class Radiologist {
  static async getAll(): Promise<RadiologistRow[]> {
    const result = await pool.query('SELECT * FROM radiologists ORDER BY name');
    return result.rows as RadiologistRow[];
  }

  static async getById(id: number): Promise<RadiologistRow | undefined> {
    const result = await pool.query('SELECT * FROM radiologists WHERE id = $1', [id]);
    return result.rows[0] as RadiologistRow | undefined;
  }

  static async create(
    name: string,
    email: string,
    role: 'radiologist' | 'admin' = 'radiologist',
    workHoursStart: string | null = null,
    workHoursEnd: string | null = null,
    workDays: string | null = null
  ): Promise<RadiologistRow> {
    const result = await pool.query(
      'INSERT INTO radiologists (name, email, role, work_hours_start, work_hours_end, work_days) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, role, workHoursStart, workHoursEnd, workDays]
    );
    return result.rows[0] as RadiologistRow;
  }

  static async update(
    id: number,
    name: string,
    email: string,
    role: 'radiologist' | 'admin',
    workHoursStart: string | null,
    workHoursEnd: string | null,
    workDays: string | null
  ): Promise<RadiologistRow> {
    const result = await pool.query(
      `UPDATE radiologists 
       SET name = $1, email = $2, role = $3, work_hours_start = $4, work_hours_end = $5, work_days = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 RETURNING *`,
      [name, email, role, workHoursStart, workHoursEnd, workDays, id]
    );
    return result.rows[0] as RadiologistRow;
  }

  static async getSites(radiologistId: number): Promise<SiteRow[]> {
    const result = await pool.query(
      `SELECT s.* FROM sites s
       INNER JOIN radiologist_sites rs ON s.id = rs.site_id
       WHERE rs.radiologist_id = $1`,
      [radiologistId]
    );
    return result.rows as SiteRow[];
  }

  static async assignToSite(radiologistId: number, siteId: number): Promise<any> {
    const result = await pool.query(
      'INSERT INTO radiologist_sites (radiologist_id, site_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [radiologistId, siteId]
    );
    return result.rows[0];
  }

  static async removeFromSite(radiologistId: number, siteId: number): Promise<void> {
    await pool.query(
      'DELETE FROM radiologist_sites WHERE radiologist_id = $1 AND site_id = $2',
      [radiologistId, siteId]
    );
  }
}

export default Radiologist;
