import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = '/api';

function Optimization() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [combinableOrders, setCombinableOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default dates (next 30 days)
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    setStartDate(format(today, 'yyyy-MM-dd'));
    setEndDate(format(nextMonth, 'yyyy-MM-dd'));

    fetchCombinableOrders();
  }, []);

  const handleVacationOptimization = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/optimization/vacation`, {
        startDate,
        endDate
      });
      setOptimizationResult(response.data);
    } catch (error) {
      console.error('Error optimizing:', error);
      alert('Error optimizing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCombinableOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/optimization/combinable-orders`);
      setCombinableOrders(response.data);
    } catch (error) {
      console.error('Error fetching combinable orders:', error);
    }
  };

  const handleCombineOrders = async (orderIds, scheduledDate, scheduledTime) => {
    try {
      await axios.post(`${API_URL}/optimization/combine-orders`, {
        orderIds,
        scheduledDate,
        scheduledTime
      });
      alert('Orders combined successfully!');
      fetchCombinableOrders();
    } catch (error) {
      console.error('Error combining orders:', error);
      alert('Error combining orders: ' + error.message);
    }
  };

  return (
    <div className="optimization-page">
      <h2>Optimization Tools</h2>

      <div className="optimization-section">
        <h3>Vacation & Workload Optimization</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div className="form-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button onClick={handleVacationOptimization} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Workload'}
        </button>

        {optimizationResult && (
          <div className="optimization-results">
            <h4>Optimization Results</h4>
            <p><strong>Average Workload:</strong> {optimizationResult.averageWorkload?.toFixed(2) || 0} orders</p>
            
            {optimizationResult.overworkedSites?.length > 0 && (
              <div>
                <h5>Overworked Sites:</h5>
                {optimizationResult.overworkedSites.map((site, idx) => (
                  <p key={idx}>Site {site.siteId}: {site.workload} orders</p>
                ))}
              </div>
            )}

            {optimizationResult.underworkedSites?.length > 0 && (
              <div>
                <h5>Underworked Sites:</h5>
                {optimizationResult.underworkedSites.map((site, idx) => (
                  <p key={idx}>Site {site.siteId}: {site.workload} orders</p>
                ))}
              </div>
            )}

            {optimizationResult.recommendations?.length > 0 && (
              <div>
                <h5>Recommendations:</h5>
                {optimizationResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="recommendation">
                    <p>{rec.reason}</p>
                    <p>Action: Reassign {rec.radiologistName} from site {rec.fromSite} to site {rec.toSite}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="optimization-section">
        <h3>Order Combination</h3>
        <button onClick={fetchCombinableOrders}>Refresh Combinable Orders</button>

        {combinableOrders.length === 0 ? (
          <p>No combinable orders found</p>
        ) : (
          combinableOrders.map((group, idx) => (
            <div key={idx} className="combinable-group">
              <h4>Patient: {group.patientId}</h4>
              <p><strong>Site:</strong> {group.siteId}</p>
              <p><strong>Orders:</strong> {group.orderTypes.join(', ')}</p>
              <p><strong>Physicians:</strong> {group.physicians.join(', ')}</p>
              <p><strong>Potential Savings:</strong> {group.potentialSavings} trip(s)</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="date"
                  id={`date-${idx}`}
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
                <input
                  type="time"
                  id={`time-${idx}`}
                  defaultValue="09:00"
                />
                <button
                  onClick={() => {
                    const date = document.getElementById(`date-${idx}`).value;
                    const time = document.getElementById(`time-${idx}`).value;
                    handleCombineOrders(
                      group.orders.map(o => o.id),
                      date,
                      time
                    );
                  }}
                >
                  Combine These Orders
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Optimization;

