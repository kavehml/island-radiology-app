import { useState, useEffect } from 'react';
import axios from 'axios';
import OrderForm from '../components/Orders/OrderForm';
import OrderRouting from '../components/Orders/OrderRouting';
import { Order } from '../types';

const API_URL = '/api';

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    orderType: '',
    timeSensitive: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async (): Promise<void> => {
    try {
      const params: Record<string, string | boolean> = {};
      if (filters.status) params.status = filters.status;
      if (filters.orderType) params.orderType = filters.orderType;
      if (filters.timeSensitive === 'true') params.timeSensitive = true;
      if (filters.timeSensitive === 'false') params.timeSensitive = false;

      const response = await axios.get(`${API_URL}/orders`, { params });
      setOrders(response.data);
    } catch (error: unknown) {
      console.error('Error fetching orders:', error);
    }
  };

  const getPriorityClass = (priority: string): string => {
    const map: Record<string, string> = {
      'stat': 'priority-stat',
      'urgent': 'priority-urgent',
      'routine': 'priority-routine',
      'low': 'priority-low'
    };
    return map[priority] || 'priority-routine';
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <h2>Orders Management</h2>
        <button onClick={() => setShowOrderForm(true)}>Create New Order</button>
      </div>

      <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.orderType}
          onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="CT">CT</option>
          <option value="MRI">MRI</option>
          <option value="Ultrasound">Ultrasound</option>
          <option value="PET">PET</option>
          <option value="X-Ray">X-Ray</option>
        </select>
        <select
          value={filters.timeSensitive}
          onChange={(e) => setFilters({ ...filters, timeSensitive: e.target.value })}
        >
          <option value="">All Orders</option>
          <option value="true">Time Sensitive</option>
          <option value="false">Not Time Sensitive</option>
        </select>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Order Type</th>
              <th>Priority</th>
              <th>Specialty</th>
              <th>Time Sensitive</th>
              <th>Status</th>
              <th>Assigned Site</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: Order) => (
              <tr key={order.id}>
                <td>{order.patient_name || order.patient_id}</td>
                <td>{order.order_type}</td>
                <td>
                  <span className={`priority-badge ${getPriorityClass(order.priority)}`}>
                    {order.priority} ({order.priority_score}/10)
                  </span>
                </td>
                <td>{order.specialty_required || 'General'}</td>
                <td>
                  {order.is_time_sensitive ? (
                    <span className="time-sensitive">Yes</span>
                  ) : (
                    'No'
                  )}
                </td>
                <td>{order.status}</td>
                <td>{order.assigned_site_name || 'Not assigned'}</td>
                <td>
                  <button onClick={() => setSelectedOrder(order)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            setShowOrderForm(false);
            fetchOrders();
          }}
        />
      )}

      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>Order Details</h3>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Patient:</strong> {selectedOrder.patient_name}</p>
              <p><strong>Order Type:</strong> {selectedOrder.order_type}</p>
              <p><strong>Priority:</strong> {selectedOrder.priority} (Score: {selectedOrder.priority_score})</p>
              <p><strong>Specialty Required:</strong> {selectedOrder.specialty_required || 'General'}</p>
              <p><strong>Time Sensitive:</strong> {selectedOrder.is_time_sensitive ? 'Yes' : 'No'}</p>
              {selectedOrder.time_sensitive_deadline && (
                <p><strong>Deadline:</strong> {new Date(selectedOrder.time_sensitive_deadline).toLocaleString()}</p>
              )}
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Assigned Site:</strong> {selectedOrder.assigned_site_name || 'Not assigned'}</p>
            </div>
            <OrderRouting order={selectedOrder} onRouteComplete={() => fetchOrders()} />
            <button onClick={() => setSelectedOrder(null)} style={{ marginTop: '1rem' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;

