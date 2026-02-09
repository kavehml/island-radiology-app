const pool = require('../config/database');

class Order {
  static async getAll(filters = {}) {
    let query = `
      SELECT o.*, s.name as site_name, 
             ass.name as assigned_site_name
      FROM orders o 
      LEFT JOIN sites s ON o.site_id = s.id
      LEFT JOIN sites ass ON o.assigned_site_id = ass.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.siteId) {
      query += ` AND o.site_id = $${paramCount++}`;
      params.push(filters.siteId);
    }
    if (filters.assignedSiteId) {
      query += ` AND o.assigned_site_id = $${paramCount++}`;
      params.push(filters.assignedSiteId);
    }
    if (filters.status) {
      query += ` AND o.status = $${paramCount++}`;
      params.push(filters.status);
    }
    if (filters.orderType) {
      query += ` AND o.order_type = $${paramCount++}`;
      params.push(filters.orderType);
    }
    if (filters.priorityMin) {
      query += ` AND o.priority_score >= $${paramCount++}`;
      params.push(filters.priorityMin);
    }
    if (filters.timeSensitive !== undefined) {
      query += ` AND o.is_time_sensitive = $${paramCount++}`;
      params.push(filters.timeSensitive);
    }
    if (filters.specialty) {
      query += ` AND o.specialty_required = $${paramCount++}`;
      params.push(filters.specialty);
    }

    query += ' ORDER BY o.priority_score DESC, o.is_time_sensitive DESC, o.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(orderData) {
    const {
      patientId, patientName, orderingPhysician, physicianSpecialty,
      siteId, orderType, bodyPart, priority, priorityScore,
      specialtyRequired, isTimeSensitive, timeSensitiveDeadline,
      status
    } = orderData;
    
    const calculatedScore = priorityScore || this.calculatePriorityScore(priority, isTimeSensitive);
    
    const result = await pool.query(
      `INSERT INTO orders (
        patient_id, patient_name, ordering_physician, physician_specialty,
        site_id, order_type, body_part, priority, priority_score,
        specialty_required, is_time_sensitive, time_sensitive_deadline, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        patientId, patientName, orderingPhysician, physicianSpecialty,
        siteId, orderType, bodyPart, priority || 'routine',
        calculatedScore,
        specialtyRequired, isTimeSensitive || false, timeSensitiveDeadline,
        status || 'pending'
      ]
    );
    return result.rows[0];
  }

  static calculatePriorityScore(priority, isTimeSensitive) {
    // Convert priority string to numeric score (1-10)
    const priorityMap = {
      'stat': 10,
      'urgent': 7,
      'routine': 5,
      'low': 3
    };
    
    let score = priorityMap[priority] || 5;
    
    // Boost score if time sensitive
    if (isTimeSensitive) {
      score = Math.min(10, score + 2);
    }
    
    return score;
  }

  static async updateAssignedSite(orderId, siteId, routingReason) {
    const result = await pool.query(
      `UPDATE orders 
       SET assigned_site_id = $1, routing_reason = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [siteId, routingReason, orderId]
    );
    return result.rows[0];
  }

  static async getTimeSensitiveOrders(deadlineThreshold) {
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE is_time_sensitive = TRUE 
       AND time_sensitive_deadline <= $1 
       AND status IN ('pending', 'scheduled')
       ORDER BY time_sensitive_deadline ASC`,
      [deadlineThreshold]
    );
    return result.rows;
  }

  static async getCombinableOrders(patientId, siteId) {
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE patient_id = $1 AND site_id = $2 AND status = 'pending'
       ORDER BY created_at`,
      [patientId, siteId]
    );
    return result.rows;
  }
}

module.exports = Order;

