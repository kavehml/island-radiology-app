import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RequisitionSubmit.css';
import { API_URL } from '../config/api';

interface RequisitionFormData {
  // Patient Information
  patientName: string;
  patientDob: string;
  patientPhone: string;
  patientEmail: string;
  
  // Referring Physician Information
  referringPhysicianName: string;
  referringPhysicianNpi: string;
  referringPhysicianPhone: string;
  referringPhysicianEmail: string;
  clinicName: string;
  clinicAddress: string;
  
  // Order Details
  orderType: 'CT' | 'MRI' | 'Ultrasound' | 'PET' | 'X-Ray' | '';
  bodyPart: string;
  clinicalIndication: string;
  priority: 'stat' | 'urgent' | 'routine' | 'low';
  isTimeSensitive: boolean;
  timeSensitiveDeadline: string;
  
  // Additional Information
  previousStudies: string;
  specialInstructions: string;
  contrastRequired: boolean;
  contrastAllergy: boolean;
  
  // Submitter Information
  submittedByEmail: string;
  submittedByName: string;
}

const RequisitionSubmit: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RequisitionFormData>({
    patientName: '',
    patientDob: '',
    patientPhone: '',
    patientEmail: '',
    referringPhysicianName: '',
    referringPhysicianNpi: '',
    referringPhysicianPhone: '',
    referringPhysicianEmail: '',
    clinicName: '',
    clinicAddress: '',
    orderType: '',
    bodyPart: '',
    clinicalIndication: '',
    priority: 'routine',
    isTimeSensitive: false,
    timeSensitiveDeadline: '',
    previousStudies: '',
    specialInstructions: '',
    contrastRequired: false,
    contrastAllergy: false,
    submittedByEmail: '',
    submittedByName: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [requisitionNumber, setRequisitionNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.patientName || !formData.referringPhysicianName || !formData.orderType) {
      setError('Please fill in all required fields (marked with *)');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting requisition to:', `${API_URL}/requisitions/submit`);
      console.log('Form data:', formData);
      
      const response = await axios.post(`${API_URL}/requisitions/submit`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response received:', response.data);
      
      if (response.data.requisition && response.data.requisition.requisition_number) {
        setRequisitionNumber(response.data.requisition.requisition_number);
        setSubmitted(true);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      console.error('Error response:', err.response);
      
      if (err.response) {
        // Server responded with error
        setError(err.response.data?.error || `Server error: ${err.response.status} ${err.response.statusText}`);
      } else if (err.request) {
        // Request made but no response
        setError('Unable to connect to server. Please check your internet connection and try again.');
      } else {
        // Something else happened
        setError(err.message || 'Failed to submit requisition. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="requisition-submit-page">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h1>Requisition Submitted Successfully!</h1>
          <div className="requisition-info">
            <p><strong>Requisition Number:</strong></p>
            <p className="requisition-number">{requisitionNumber}</p>
            <p className="info-text">
              Please save this requisition number for tracking purposes.
              You can check the status of your requisition using this number.
            </p>
          </div>
          <div className="action-buttons">
            <button onClick={() => {
              setSubmitted(false);
              setFormData({
                patientName: '',
                patientDob: '',
                patientPhone: '',
                patientEmail: '',
                referringPhysicianName: '',
                referringPhysicianNpi: '',
                referringPhysicianPhone: '',
                referringPhysicianEmail: '',
                clinicName: '',
                clinicAddress: '',
                orderType: '',
                bodyPart: '',
                clinicalIndication: '',
                priority: 'routine',
                isTimeSensitive: false,
                timeSensitiveDeadline: '',
                previousStudies: '',
                specialInstructions: '',
                contrastRequired: false,
                contrastAllergy: false,
                submittedByEmail: '',
                submittedByName: ''
              });
            }} className="btn-new">
              Submit Another Requisition
            </button>
            <button onClick={() => navigate('/')} className="btn-home">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="requisition-submit-page">
      <div className="requisition-form-container">
        <div className="form-header">
          <h1>Submit Imaging Requisition</h1>
          <p>Fill out the form below to submit an imaging requisition request</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="requisition-form">
          {/* Patient Information Section */}
          <section className="form-section">
            <h2>Patient Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  value={formData.patientDob}
                  onChange={(e) => setFormData({ ...formData, patientDob: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Phone</label>
                <input
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Patient Email</label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Referring Physician Section */}
          <section className="form-section">
            <h2>Referring Physician Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Physician Name *</label>
                <input
                  type="text"
                  value={formData.referringPhysicianName}
                  onChange={(e) => setFormData({ ...formData, referringPhysicianName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>NPI Number</label>
                <input
                  type="text"
                  value={formData.referringPhysicianNpi}
                  onChange={(e) => setFormData({ ...formData, referringPhysicianNpi: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Physician Phone</label>
                <input
                  type="tel"
                  value={formData.referringPhysicianPhone}
                  onChange={(e) => setFormData({ ...formData, referringPhysicianPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Physician Email</label>
                <input
                  type="email"
                  value={formData.referringPhysicianEmail}
                  onChange={(e) => setFormData({ ...formData, referringPhysicianEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Clinic Name</label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Clinic Address</label>
                <input
                  type="text"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Order Details Section */}
          <section className="form-section">
            <h2>Order Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Imaging Type *</label>
                <select
                  value={formData.orderType}
                  onChange={(e) => setFormData({ ...formData, orderType: e.target.value as any })}
                  required
                >
                  <option value="">Select imaging type</option>
                  <option value="CT">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="PET">PET Scan</option>
                  <option value="X-Ray">X-Ray</option>
                </select>
              </div>
              <div className="form-group">
                <label>Body Part</label>
                <input
                  type="text"
                  value={formData.bodyPart}
                  onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                  placeholder="e.g., Head, Chest, Abdomen"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Clinical Indication</label>
              <textarea
                value={formData.clinicalIndication}
                onChange={(e) => setFormData({ ...formData, clinicalIndication: e.target.value })}
                rows={4}
                placeholder="Reason for imaging study..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isTimeSensitive}
                    onChange={(e) => setFormData({ ...formData, isTimeSensitive: e.target.checked })}
                  />
                  Time Sensitive
                </label>
                {formData.isTimeSensitive && (
                  <input
                    type="datetime-local"
                    value={formData.timeSensitiveDeadline}
                    onChange={(e) => setFormData({ ...formData, timeSensitiveDeadline: e.target.value })}
                    className="deadline-input"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Additional Information Section */}
          <section className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label>Previous Studies</label>
              <textarea
                value={formData.previousStudies}
                onChange={(e) => setFormData({ ...formData, previousStudies: e.target.value })}
                rows={3}
                placeholder="Reference to previous imaging studies if applicable"
              />
            </div>
            <div className="form-group">
              <label>Special Instructions</label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                rows={3}
                placeholder="Any special instructions or requirements"
              />
            </div>
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.contrastRequired}
                    onChange={(e) => setFormData({ ...formData, contrastRequired: e.target.checked })}
                  />
                  Contrast Required
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.contrastAllergy}
                    onChange={(e) => setFormData({ ...formData, contrastAllergy: e.target.checked })}
                  />
                  Contrast Allergy
                </label>
              </div>
            </div>
          </section>

          {/* Submitter Information */}
          <section className="form-section">
            <h2>Your Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={formData.submittedByName}
                  onChange={(e) => setFormData({ ...formData, submittedByName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Your Email</label>
                <input
                  type="email"
                  value={formData.submittedByEmail}
                  onChange={(e) => setFormData({ ...formData, submittedByEmail: e.target.value })}
                />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequisitionSubmit;
