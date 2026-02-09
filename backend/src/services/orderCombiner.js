const Order = require('../models/Order');
const pool = require('../config/database');

class OrderCombiner {
  static async findCombinableOrders() {
    // Get all pending orders grouped by patient and site
    const result = await pool.query(
      `SELECT patient_id, site_id, COUNT(*) as order_count, 
              ARRAY_AGG(id) as order_ids,
              ARRAY_AGG(order_type) as order_types,
              ARRAY_AGG(ordering_physician) as physicians
       FROM orders 
       WHERE status = 'pending'
       GROUP BY patient_id, site_id
       HAVING COUNT(*) > 1`
    );
    
    const combinableGroups = [];
    
    for (const row of result.rows) {
      // Get full order details
      const orders = await Promise.all(
        row.order_ids.map(id => Order.getById(id))
      );
      
      // Check if orders can be combined (same day scheduling possible)
      const canCombine = this.canCombineOrders(orders);
      
      if (canCombine) {
        combinableGroups.push({
          patientId: row.patient_id,
          siteId: row.site_id,
          orders: orders,
          orderTypes: row.order_types,
          physicians: [...new Set(row.physicians)],
          potentialSavings: orders.length - 1 // Number of trips saved
        });
      }
    }
    
    return combinableGroups;
  }
  
  static canCombineOrders(orders) {
    // Orders can be combined if:
    // 1. They're at the same site
    // 2. They're not conflicting (different body parts or compatible)
    // 3. They can be scheduled on the same day
    
    if (orders.length < 2) return false;
    
    const siteId = orders[0].site_id;
    if (!orders.every(o => o.site_id === siteId)) return false;
    
    // Check for conflicting body parts (simplified logic)
    const bodyParts = orders.map(o => o.body_part).filter(Boolean);
    const uniqueBodyParts = new Set(bodyParts);
    
    // If all same body part, can combine
    // If different body parts, can combine
    // This is simplified - you might want more sophisticated logic
    
    return true;
  }
  
  static async combineOrders(orderIds, scheduledDate, scheduledTime) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create combined order
      const order = await Order.getById(orderIds[0]);
      const combinedResult = await client.query(
        `INSERT INTO combined_orders (combined_date, combined_time, site_id, status)
         VALUES ($1, $2, $3, 'scheduled') RETURNING *`,
        [scheduledDate, scheduledTime, order.site_id]
      );
      
      const combinedOrderId = combinedResult.rows[0].id;
      
      // Link orders to combined order
      for (const orderId of orderIds) {
        await client.query(
          'INSERT INTO combined_order_items (combined_order_id, order_id) VALUES ($1, $2)',
          [combinedOrderId, orderId]
        );
        
        // Update order status
        await client.query(
          `UPDATE orders SET status = 'scheduled', scheduled_date = $1, scheduled_time = $2 WHERE id = $3`,
          [scheduledDate, scheduledTime, orderId]
        );
      }
      
      await client.query('COMMIT');
      return combinedResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = OrderCombiner;

