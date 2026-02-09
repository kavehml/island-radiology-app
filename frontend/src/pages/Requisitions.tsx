import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Requisitions.css';

const API_URL = '/api';

interface Requisition {
  id: number;
  requisition_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'converted';
  patient_name: string;
  patient_dob: string | null;
  referring_physician_name: string;
  clinic_name: string | null;
  order_type: string;
  body_part: string | null;
  clinical_indication: string | null;
  priority: string;
  is_time_sensitive: boolean;
  submitted_by_email: string | null;
  submitted_by_name: string | null;
  created_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
  converted_to_order_id: number | null;
}

const Requisitions: React.FC = () => {
  const { hasRole } = useAuth();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    if (hasRole(['admin', 'staff'])) {
      fetchRequisitions();
    }
  }, [statusFilter, hasRole]);

  const fetchRequisitions = async (): Promise<void> => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await axios.get(`${API_URL}/requisitions`, { params });
      setRequisitions(response.data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch requisitions');
    }
  };

  const handleApprove = async (id: number): Promise<void> => {
    try {
      await axios.post(`${API_URL}/requisitions/${id}/approve`, { reviewNotes });
      setSuccess('Requisition approved successfully');
      setReviewNotes('');
      setSelectedRequisition(null);
      fetchRequisitions();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to approve requisition');
    }
  };

  const handleReject = async (id: number): Promise<void> => {
    if (!reviewNotes.trim()) {
      setError('Review notes are required for rejection');
      return;
    }

    try {
      await axios.post(`${API_URL}/requisitions/${id}/reject`, { reviewNotes });
      setSuccess('Requisition rejected');
      setReviewNotes('');
      setSelectedRequisition(null);
      fetchRequisitions();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reject requisition');
    }
  };

  const handleConvert = async (id: number): Promise<void> => {
    try {
      await axios.post(`${API_URL}/requisitions/${id}/convert`);
      setSuccess('Requisition converted to order successfully');
      setSelectedRequisition(null);
      fetchRequisitions();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to convert requisition');
    }
  };

  const getStatusBadgeClass = (status: string): string => {
    const classes: Record<string, string> = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      converted: 'status-converted'
    };
    return classes[status] || 'status-pending';
  };

  if (!hasRole(['admin', 'staff'])) {
    return (
      <div className="requisitions-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only administrators and staff can access requisition management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requisitions-page">
      <div className="page-header">
        <h2>Requisition Management</h2>
        <div className="header-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="requisitions-container">
        <div className="requisitions-list">
          <h3>Requisitions ({requisitions.length})</h3>
          {requisitions.length === 0 ? (
            <div className="empty-state">No requisitions found</div>
          ) : (
            <div className="requisitions-grid">
              {requisitions.map((req) => (
                <div
                  key={req.id}
                  className={`requisition-card ${selectedRequisition?.id === req.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRequisition(req)}
                >
                  <div className="card-header">
                    <span className="requisition-number">{req.requisition_number}</span>
                    <span className={`status-badge ${getStatusBadgeClass(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><strong>Patient:</strong> {req.patient_name}</p>
                    <p><strong>Physician:</strong> {req.referring_physician_name}</p>
                    <p><strong>Type:</strong> {req.order_type}</p>
                    {req.body_part && <p><strong>Body Part:</strong> {req.body_part}</p>}
                    <p><strong>Priority:</strong> {req.priority}</p>
                    <p className="date-text">
                      Submitted: {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRequisition && (
          <div className="requisition-details">
            <div className="details-header">
              <h3>Requisition Details</h3>
              <button onClick={() => setSelectedRequisition(null)} className="close-btn">×</button>
            </div>

            <div className="details-content">
              <div className="detail-section">
                <h4>Requisition Information</h4>
                <p><strong>Number:</strong> {selectedRequisition.requisition_number}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${getStatusBadgeClass(selectedRequisition.status)}`}>
                    {selectedRequisition.status}
                  </span>
                </p>
                <p><strong>Submitted:</strong> {new Date(selectedRequisition.created_at).toLocaleString()}</p>
                {selectedRequisition.submitted_by_name && (
                  <p><strong>Submitted By:</strong> {selectedRequisition.submitted_by_name}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Patient Information</h4>
                <p><strong>Name:</strong> {selectedRequisition.patient_name}</p>
                {selectedRequisition.patient_dob && (
                  <p><strong>DOB:</strong> {new Date(selectedRequisition.patient_dob).toLocaleDateString()}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Order Details</h4>
                <p><strong>Type:</strong> {selectedRequisition.order_type}</p>
                {selectedRequisition.body_part && (
                  <p><strong>Body Part:</strong> {selectedRequisition.body_part}</p>
                )}
                <p><strong>Priority:</strong> {selectedRequisition.priority}</p>
                {selectedRequisition.is_time_sensitive && (
                  <p className="time-sensitive">⏰ Time Sensitive</p>
                )}
                {selectedRequisition.clinical_indication && (
                  <div>
                    <strong>Clinical Indication:</strong>
                    <p className="indication-text">{selectedRequisition.clinical_indication}</p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h4>Referring Physician</h4>
                <p><strong>Name:</strong> {selectedRequisition.referring_physician_name}</p>
                {selectedRequisition.clinic_name && (
                  <p><strong>Clinic:</strong> {selectedRequisition.clinic_name}</p>
                )}
              </div>

              {selectedRequisition.review_notes && (
                <div className="detail-section">
                  <h4>Review Notes</h4>
                  <p className="review-notes">{selectedRequisition.review_notes}</p>
                </div>
              )}

              {selectedRequisition.status === 'pending' && (
                <div className="action-section">
                  <h4>Actions</h4>
                  <div className="form-group">
                    <label>Review Notes (required for rejection)</label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      placeholder="Add review notes..."
                    />
                  </div>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleApprove(selectedRequisition.id)}
                      className="btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequisition.id)}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedRequisition.status === 'approved' && !selectedRequisition.converted_to_order_id && (
                <div className="action-section">
                  <button
                    onClick={() => handleConvert(selectedRequisition.id)}
                    className="btn-convert"
                  >
                    Convert to Order
                  </button>
                </div>
              )}

              {selectedRequisition.converted_to_order_id && (
                <div className="info-section">
                  <p className="converted-info">
                    ✓ Converted to Order #{selectedRequisition.converted_to_order_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Requisitions;
