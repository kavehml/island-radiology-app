const pool = require('../config/database');

class RadiologistSpecialty {
  static async getByRadiologist(radiologistId) {
    const result = await pool.query(
      'SELECT * FROM radiologist_specialties WHERE radiologist_id = $1 ORDER BY specialty',
      [radiologistId]
    );
    return result.rows;
  }

  static async create(radiologistId, specialty, proficiencyLevel = 5) {
    const result = await pool.query(
      `INSERT INTO radiologist_specialties (radiologist_id, specialty, proficiency_level)
       VALUES ($1, $2, $3)
       ON CONFLICT (radiologist_id, specialty)
       DO UPDATE SET proficiency_level = $3 RETURNING *`,
      [radiologistId, specialty, proficiencyLevel]
    );
    return result.rows[0];
  }

  static async findBySpecialty(specialty) {
    const result = await pool.query(
      `SELECT r.*, rs.proficiency_level 
       FROM radiologists r
       INNER JOIN radiologist_specialties rs ON r.id = rs.radiologist_id
       WHERE rs.specialty = $1
       ORDER BY rs.proficiency_level DESC`,
      [specialty]
    );
    return result.rows;
  }
}

module.exports = RadiologistSpecialty;

