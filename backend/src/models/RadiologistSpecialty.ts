import pool from '../config/database';
import { RadiologistSpecialtyRow, RadiologistRow } from '../types/database';

class RadiologistSpecialty {
  static async getByRadiologist(radiologistId: number): Promise<RadiologistSpecialtyRow[]> {
    const result = await pool.query(
      'SELECT * FROM radiologist_specialties WHERE radiologist_id = $1 ORDER BY specialty',
      [radiologistId]
    );
    return result.rows as RadiologistSpecialtyRow[];
  }

  static async create(radiologistId: number, specialty: string, proficiencyLevel: number = 5): Promise<RadiologistSpecialtyRow> {
    const result = await pool.query(
      `INSERT INTO radiologist_specialties (radiologist_id, specialty, proficiency_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (radiologist_id, specialty)
       DO UPDATE SET proficiency_level = $3 RETURNING *`,
      [radiologistId, specialty, proficiencyLevel]
    );
    return result.rows[0] as RadiologistSpecialtyRow;
  }

  static async findBySpecialty(specialty: string): Promise<(RadiologistRow & { proficiency_level: number })[]> {
    const result = await pool.query(
      `SELECT r.*, rs.proficiency_level 
       FROM radiologists r
       INNER JOIN radiologist_specialties rs ON r.id = rs.radiologist_id
       WHERE rs.specialty = $1
       ORDER BY rs.proficiency_level DESC`,
      [specialty]
    );
    return result.rows as (RadiologistRow & { proficiency_level: number })[];
  }
}

export default RadiologistSpecialty;
