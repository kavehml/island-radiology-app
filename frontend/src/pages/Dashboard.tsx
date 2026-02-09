import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Site, Order } from '../types';

const API_URL = '/api';

interface DashboardStats {
  totalSites: number;
  totalOrders: number;
  pendingOrders: number;
  timeSensitiveOrders: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSites: 0,
    totalOrders: 0,
    pendingOrders: 0,
    timeSensitiveOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (): Promise<void> => {
    try {
      const [sitesRes, ordersRes, pendingRes, timeSensitiveRes] = await Promise.all([
        axios.get<Site[]>(`${API_URL}/sites`),
        axios.get<Order[]>(`${API_URL}/orders`),
        axios.get<Order[]>(`${API_URL}/orders?status=pending`),
        axios.get<Order[]>(`${API_URL}/orders?timeSensitive=true`)
      ]);

      setStats({
        totalSites: sitesRes.data.length,
        totalOrders: ordersRes.data.length,
        pendingOrders: pendingRes.data.length,
        timeSensitiveOrders: timeSensitiveRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <div className="dashboard">
        <div className="dashboard-card">
          <h3>Total Sites</h3>
          <div className="value">{stats.totalSites}</div>
        </div>
        <div className="dashboard-card">
          <h3>Total Orders</h3>
          <div className="value">{stats.totalOrders}</div>
        </div>
        <div className="dashboard-card">
          <h3>Pending Orders</h3>
          <div className="value">{stats.pendingOrders}</div>
        </div>
        <div className="dashboard-card">
          <h3>Time Sensitive Orders</h3>
          <div className="value">{stats.timeSensitiveOrders}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

