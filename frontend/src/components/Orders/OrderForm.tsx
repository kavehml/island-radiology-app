import { useState, useEffect } from 'react';
import axios from 'axios';
import { Site, OrderFormData as OrderFormDataType } from '../../types';
import { API_URL } from '../../config/api';

const SPECIALTIES = [
  'General',
  'Neuroradiology',
  'Musculoskeletal',
  'Cardiac',
  'Pediatric',
  'Oncology',
  'Emergency',
  'Mammography'
];

interface OrderFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function OrderForm({ onClose, onSuccess }: OrderFormProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [formData, setFormData] = useState<Partial<OrderFormDataType>>({
    patientId: '',
    patientName: '',
    orderingPhysician: '',
    physicianSpecialty: '',
    siteId: '',
    orderType: 'CT',
    bodyPart: '',
    priority: 'routine',
    priorityScore: 5,
    specialtyRequired: '',
    isTimeSensitive: false,
    timeSensitiveDeadline: '',
    autoRoute: true
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-calculate priority score
    if (name === 'priority' || name === 'isTimeSensitive') {
      const priority = name === 'priority' ? value : formData.priority;
      const isTimeSensitive = name === 'isTimeSensitive' ? checked : formData.isTimeSensitive;
      
      const priorityScores: Record<string, number> = {
        'stat': 10,
        'urgent': 7,
        'routine': 5,
        'low': 3
      };
      let score = priorityScores[priority as string] || 5;
      
      if (isTimeSensitive) {
        score = Math.min(10, score + 2);
      }
      
      setFormData(prev => ({ ...prev, priorityScore: score }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/orders`, formData);
      
      // Auto-route if enabled
      if (formData.autoRoute) {
        try {
          await axios.post(`${API_URL}/orders/${response.data.id}/route`);
        } catch (routeError) {
          console.error('Error auto-routing:', routeError);
          // Don't fail the order creation if routing fails
        }
      }
      
      onSuccess();
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error creating order: ' + errorMessage);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create New Order</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient ID:</label>
            <input
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Patient Name:</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ordering Physician:</label>
            <input
              type="text"
              name="orderingPhysician"
              value={formData.orderingPhysician}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Preferred Site (optional):</label>
            <select name="siteId" value={formData.siteId} onChange={handleChange}>
              <option value="">None</option>
              {sites.map((site: Site) => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Order Type:</label>
            <select name="orderType" value={formData.orderType} onChange={handleChange}>
              <option value="CT">CT Scan</option>
              <option value="MRI">MRI</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="PET">PET Scan</option>
              <option value="X-Ray">X-Ray</option>
            </select>
          </div>

          <div className="form-group">
            <label>Body Part:</label>
            <input
              type="text"
              name="bodyPart"
              value={formData.bodyPart}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Priority:</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
            <span className="priority-score">Score: {formData.priorityScore}/10</span>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isTimeSensitive"
                checked={formData.isTimeSensitive}
                onChange={handleChange}
              />
              Time Sensitive
            </label>
          </div>

          {formData.isTimeSensitive && (
            <div className="form-group">
              <label>Deadline:</label>
              <input
                type="datetime-local"
                name="timeSensitiveDeadline"
                value={formData.timeSensitiveDeadline}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Specialty Required:</label>
            <select 
              name="specialtyRequired" 
              value={formData.specialtyRequired} 
              onChange={handleChange}
            >
              <option value="">None (General)</option>
              {SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="autoRoute"
                checked={formData.autoRoute}
                onChange={handleChange}
              />
              Auto-route to optimal site
            </label>
          </div>

          <div className="form-actions">
            <button type="submit">Create Order</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;

