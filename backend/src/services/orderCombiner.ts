import Order from '../models/Order';
import pool from '../config/database';
import { OrderRow } from '../types/database';

interface CombinableOrderGroup {
  patientId: string;
  siteId: number;
  orders: (OrderRow | undefined)[];
  orderTypes: string[];
  physicians: string[];
  potentialSavings: number;
}

class OrderCombiner {
  static async findCombinableOrders(): Promise<CombinableOrderGroup[]> {
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
    
    const combinableGroups: CombinableOrderGroup[] = [];
    
    for (const row of result.rows) {
      const orders = await Promise.all(
        (row.order_ids as number[]).map((id: number) => Order.getById(id))
      );
      
      const validOrders = orders.filter((o): o is OrderRow => o !== undefined);
      const canCombine = this.canCombineOrders(validOrders);
      
      if (canCombine) {
        combinableGroups.push({
          patientId: row.patient_id,
          siteId: row.site_id,
          orders: validOrders,
          orderTypes: row.order_types as string[],
          physicians: [...new Set(row.physicians as string[])] as string[],
          potentialSavings: validOrders.length - 1
        });
      }
    }
    
    return combinableGroups;
  }
  
  static canCombineOrders(orders: OrderRow[]): boolean {
    if (orders.length < 2) return false;
    
    const siteId = orders[0].site_id;
    if (!siteId || !orders.every(o => o.site_id === siteId)) return false;
    
    return true;
  }
  
  static async combineOrders(orderIds: number[], scheduledDate: string, scheduledTime: string): Promise<any> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const order = await Order.getById(orderIds[0]);
      if (!order || !order.site_id) {
        throw new Error('Order not found or invalid');
      }

      const combinedResult = await client.query(
        `INSERT INTO combined_orders (combined_date, combined_time, site_id, status)
         VALUES ($1, $2, $3, 'scheduled') RETURNING *`,
        [scheduledDate, scheduledTime, order.site_id]
      );
      
      const combinedOrderId = combinedResult.rows[0].id;
      
      for (const orderId of orderIds) {
        await client.query(
          'INSERT INTO combined_order_items (combined_order_id, order_id) VALUES ($1, $2)',
          [combinedOrderId, orderId]
        );
        
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

export default OrderCombiner;
