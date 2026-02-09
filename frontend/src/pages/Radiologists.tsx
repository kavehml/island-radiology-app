import { useState, useEffect } from 'react';
import axios from 'axios';
import RadiologistForm from '../components/Radiologists/RadiologistForm';
import AssignSiteForm from '../components/Radiologists/AssignSiteForm';
import AddSpecialtyForm from '../components/Radiologists/AddSpecialtyForm';
import { Radiologist, Site } from '../types';
import { API_URL } from '../config/api';

const SPECIALTIES = [
  'General',
  'Neuroradiology',
  'Musculoskeletal',
  'Cardiac',
  'Pediatric',
  'Oncology',
  'Emergency',
  'Mammography',
  'Abdominal',
  'Chest',
  'Nuclear Medicine'
];

function Radiologists() {
  const [radiologists, setRadiologists] = useState<Radiologist[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedRadiologist, setSelectedRadiologist] = useState<Radiologist | null>(null);
  const [showRadiologistForm, setShowRadiologistForm] = useState(false);
  const [showAssignSiteForm, setShowAssignSiteForm] = useState(false);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);

  useEffect(() => {
    fetchRadiologists();
    fetchSites();
  }, []);

  const fetchRadiologists = async () => {
    try {
      const response = await axios.get(`${API_URL}/radiologists`);
      setRadiologists(response.data);
    } catch (error) {
      console.error('Error fetching radiologists:', error);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleRadiologistSelect = async (radiologistId: number): Promise<void> => {
    try {
      const response = await axios.get(`${API_URL}/radiologists/${radiologistId}`);
      setSelectedRadiologist(response.data);
    } catch (error) {
      console.error('Error fetching radiologist:', error);
    }
  };

  const formatWorkHours = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'Not set';
    return `${start} - ${end}`;
  };

  return (
    <div className="radiologists-page">
      <div className="page-header">
        <h2>Radiologists Management</h2>
        <button onClick={() => {
          setSelectedRadiologist(null);
          setShowRadiologistForm(true);
        }}>Add New Radiologist</button>
      </div>

      <div className="radiologists-layout">
        <div className="radiologists-list">
          <h3>Radiologists</h3>
          {radiologists.map(radiologist => (
            <div
              key={radiologist.id}
              className={`radiologist-card ${selectedRadiologist?.id === radiologist.id ? 'selected' : ''}`}
              onClick={() => handleRadiologistSelect(radiologist.id)}
            >
              <h4>{radiologist.name}</h4>
              <p>{radiologist.email}</p>
              <p>Work Hours: {formatWorkHours(radiologist.work_hours_start, radiologist.work_hours_end)}</p>
              {radiologist.work_days && <p>Days: {radiologist.work_days}</p>}
              {radiologist.specialties && radiologist.specialties.length > 0 && (
                <p style={{ marginTop: '0.5rem', color: '#3498db', fontWeight: '500' }}>
                  Specialties: {radiologist.specialties.map((s: { specialty: string }) => s.specialty).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>

        {selectedRadiologist && (
          <div className="radiologist-details">
            <h3>{selectedRadiologist.name}</h3>
            <div style={{ marginBottom: '1rem' }}>
              <button onClick={() => setShowRadiologistForm(true)} style={{ marginRight: '0.5rem' }}>
                Edit Radiologist
              </button>
              <button onClick={() => setShowAssignSiteForm(true)} style={{ marginRight: '0.5rem' }}>
                Assign to Site
              </button>
              <button onClick={() => setShowSpecialtyForm(true)}>
                Add Specialty
              </button>
            </div>

            <div className="info-section">
              <h4>Contact Information</h4>
              <p><strong>Email:</strong> {selectedRadiologist.email}</p>
              <p><strong>Role:</strong> {selectedRadiologist.role}</p>
            </div>

            <div className="info-section">
              <h4>Work Schedule</h4>
              <p><strong>Hours:</strong> {formatWorkHours(selectedRadiologist.work_hours_start, selectedRadiologist.work_hours_end)}</p>
              <p><strong>Days:</strong> {selectedRadiologist.work_days || 'Not set'}</p>
            </div>

            {selectedRadiologist.sites && selectedRadiologist.sites.length > 0 && (
              <div className="info-section">
                <h4>Assigned Sites</h4>
                <ul>
                  {selectedRadiologist.sites.map(site => (
                    <li key={site.id}>{site.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedRadiologist.specialties && selectedRadiologist.specialties.length > 0 && (
              <div className="info-section">
                <h4>Specialties</h4>
                <ul>
                  {selectedRadiologist.specialties.map(spec => (
                    <li key={spec.id}>
                      {spec.specialty} (Proficiency: {spec.proficiency_level}/10)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {showRadiologistForm && (
        <RadiologistForm
          radiologist={selectedRadiologist}
          onClose={() => {
            setShowRadiologistForm(false);
            setSelectedRadiologist(null);
          }}
          onSuccess={() => {
            setShowRadiologistForm(false);
            fetchRadiologists();
            if (selectedRadiologist) {
              handleRadiologistSelect(selectedRadiologist.id);
            }
          }}
        />
      )}

      {showAssignSiteForm && selectedRadiologist && (
        <AssignSiteForm
          radiologist={selectedRadiologist}
          sites={sites}
          onClose={() => setShowAssignSiteForm(false)}
          onSuccess={() => {
            setShowAssignSiteForm(false);
            handleRadiologistSelect(selectedRadiologist.id);
          }}
        />
      )}

      {showSpecialtyForm && selectedRadiologist && (
        <AddSpecialtyForm
          radiologist={selectedRadiologist}
          specialties={SPECIALTIES}
          onClose={() => setShowSpecialtyForm(false)}
          onSuccess={() => {
            setShowSpecialtyForm(false);
            handleRadiologistSelect(selectedRadiologist.id);
          }}
        />
      )}
    </div>
  );
}

export default Radiologists;


