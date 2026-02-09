import { useState } from 'react';
import axios from 'axios';
import { Order, RoutingResult } from '../../types';
import { API_URL } from '../../config/api';

interface OrderRoutingProps {
  order: Order;
  onRouteComplete?: (result: RoutingResult) => void;
}

function OrderRouting({ order, onRouteComplete }: OrderRoutingProps) {
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRoute = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/orders/${order.id}/route`);
      setRoutingResult(response.data);
      if (onRouteComplete) {
        onRouteComplete(response.data);
      }
    } catch (error: unknown) {
      console.error('Error routing order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error routing order: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-routing">
      <h4>Order Routing</h4>
      {!order.assigned_site_id ? (
        <div>
          <p>This order has not been routed to a site yet.</p>
          <button onClick={handleRoute} disabled={loading}>
            {loading ? 'Routing...' : 'Route to Optimal Site'}
          </button>
        </div>
      ) : (
        <div>
          <p><strong>Assigned Site:</strong> {order.assigned_site_name || order.assigned_site_id}</p>
          {order.routing_reason && (
            <p><strong>Reason:</strong> {order.routing_reason}</p>
          )}
          <button onClick={handleRoute} disabled={loading}>
            {loading ? 'Re-routing...' : 'Re-route Order'}
          </button>
        </div>
      )}

      {routingResult && (
        <div className="routing-results">
          <h5>Routing Results</h5>
          <p><strong>Assigned to:</strong> {routingResult.assignedSiteName}</p>
          <p><strong>Score:</strong> {routingResult.score}/100</p>
          <p><strong>Reasoning:</strong> {routingResult.reasoning}</p>
          
          <details>
            <summary>All Site Scores</summary>
            <table>
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Score</th>
                  <th>Factors</th>
                </tr>
              </thead>
              <tbody>
                {routingResult.allScores?.map((siteScore: { siteName: string; score: number; factors?: { equipmentAvailability?: number; radiologistAvailability?: number; workload?: number } }, idx: number) => (
                  <tr key={idx}>
                    <td>{siteScore.siteName}</td>
                    <td>{siteScore.score}</td>
                    <td>
                      Equipment: {siteScore.factors?.equipmentAvailability}, 
                      Radiologists: {siteScore.factors?.radiologistAvailability}, 
                      Workload: {siteScore.factors?.workload}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </div>
      )}
    </div>
  );
}

export default OrderRouting;

