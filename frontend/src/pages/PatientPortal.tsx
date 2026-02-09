import React, { useState } from 'react';
import axios from 'axios';
import './PatientPortal.css';
import { API_URL } from '../config/api';

interface RequisitionDetails {
  requisition_number: string;
  status: string;
  patient_name: string;
  order_type: string;
  body_part: string | null;
  priority: string;
  is_time_sensitive: boolean;
  time_sensitive_deadline: string | null;
  assigned_site: {
    id: number;
    name: string;
    address: string | null;
  } | null;
  assignment_reason: string | null;
  assigned_at: string | null;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

const PatientPortal: React.FC = () => {
  const [requisitionNumber, setRequisitionNumber] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [requisition, setRequisition] = useState<RequisitionDetails | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!requisitionNumber || !patientDob) {
      setError('Please enter both requisition number and date of birth');
      setLoading(false);
      return;
    }

    try {
      // Authenticate
      await axios.post(`${API_URL}/patient-portal/authenticate`, {
        requisitionNumber,
        patientDob
      });

      // Fetch requisition details
      const response = await axios.get(`${API_URL}/patient-portal/requisition/${requisitionNumber}`);
      setRequisition(response.data);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your requisition number and date of birth.');
      setAuthenticated(false);
      setRequisition(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (): void => {
    setAuthenticated(false);
    setRequisition(null);
    setRequisitionNumber('');
    setPatientDob('');
    setError('');
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'rejected':
        return '#dc3545';
      case 'converted':
        return '#17a2b8';
      default:
        return '#6c757d';
    }
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="patient-portal">
      <div className="patient-portal-container">
        <h1>Patient Portal</h1>
        <p className="portal-subtitle">View your imaging requisition status and assigned center</p>

        {!authenticated ? (
          <div className="auth-form-container">
            <form onSubmit={handleAuthenticate} className="auth-form">
              <div className="form-group">
                <label htmlFor="requisitionNumber">Requisition Number *</label>
                <input
                  type="text"
                  id="requisitionNumber"
                  value={requisitionNumber}
                  onChange={(e) => setRequisitionNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., REQ-20260208-000001"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patientDob">Date of Birth *</label>
                <input
                  type="date"
                  id="patientDob"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Verifying...' : 'View Requisition'}
              </button>
            </form>
          </div>
        ) : (
          <div className="requisition-details">
            <div className="details-header">
              <h2>Requisition Details</h2>
              <button onClick={handleReset} className="reset-button">View Another Requisition</button>
            </div>

            {requisition && (
              <div className="details-content">
                <div className="detail-section">
                  <h3>Status</h3>
                  <div className="status-badge" style={{ backgroundColor: getStatusColor(requisition.status) }}>
                    {requisition.status.toUpperCase()}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Requisition Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Requisition Number:</span>
                      <span className="detail-value">{requisition.requisition_number}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Patient Name:</span>
                      <span className="detail-value">{requisition.patient_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Order Type:</span>
                      <span className="detail-value">{requisition.order_type}</span>
                    </div>
                    {requisition.body_part && (
                      <div className="detail-item">
                        <span className="detail-label">Body Part:</span>
                        <span className="detail-value">{requisition.body_part}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Priority:</span>
                      <span className="detail-value">{requisition.priority.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Time Sensitive:</span>
                      <span className="detail-value">{requisition.is_time_sensitive ? 'Yes' : 'No'}</span>
                    </div>
                    {requisition.time_sensitive_deadline && (
                      <div className="detail-item">
                        <span className="detail-label">Deadline:</span>
                        <span className="detail-value">{formatDateTime(requisition.time_sensitive_deadline)}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Submitted:</span>
                      <span className="detail-value">{formatDateTime(requisition.created_at)}</span>
                    </div>
                  </div>
                </div>

                {requisition.assigned_site && (
                  <div className="detail-section assigned-site-section">
                    <h3>Assigned Imaging Center</h3>
                    <div className="assigned-site-card">
                      <div className="site-name">{requisition.assigned_site.name}</div>
                      {requisition.assigned_site.address && (
                        <div className="site-address">{requisition.assigned_site.address}</div>
                      )}
                      {requisition.assignment_reason && (
                        <div className="assignment-reason">
                          <strong>Assignment Reason:</strong> {requisition.assignment_reason}
                        </div>
                      )}
                      {requisition.assigned_at && (
                        <div className="assigned-date">
                          Assigned on: {formatDateTime(requisition.assigned_at)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!requisition.assigned_site && requisition.status === 'approved' && (
                  <div className="detail-section">
                    <div className="info-message">
                      Your requisition has been approved. Assignment to an imaging center is pending.
                    </div>
                  </div>
                )}

                {requisition.reviewed_at && (
                  <div className="detail-section">
                    <h3>Review Information</h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Reviewed:</span>
                        <span className="detail-value">{formatDateTime(requisition.reviewed_at)}</span>
                      </div>
                      {requisition.review_notes && (
                        <div className="detail-item full-width">
                          <span className="detail-label">Review Notes:</span>
                          <span className="detail-value">{requisition.review_notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientPortal;
