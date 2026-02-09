import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

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

function RadiologistForm({ radiologist, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'radiologist',
    workHoursStart: '',
    workHoursEnd: '',
    workDays: 'Mon-Fri'
  });
  const [specialties, setSpecialties] = useState([]); // Array of {specialty, proficiencyLevel}

  useEffect(() => {
    if (radiologist) {
      setFormData({
        name: radiologist.name || '',
        email: radiologist.email || '',
        role: radiologist.role || 'radiologist',
        workHoursStart: radiologist.work_hours_start || '',
        workHoursEnd: radiologist.work_hours_end || '',
        workDays: radiologist.work_days || 'Mon-Fri'
      });
      // Load existing specialties when editing
      if (radiologist.specialties && radiologist.specialties.length > 0) {
        setSpecialties(
          radiologist.specialties.map(s => ({
            specialty: s.specialty,
            proficiencyLevel: s.proficiency_level
          }))
        );
      }
    } else {
      // When creating a new radiologist, start with one empty specialty field
      setSpecialties([{ specialty: '', proficiencyLevel: 5 }]);
    }
  }, [radiologist]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSpecialty = () => {
    setSpecialties([...specialties, { specialty: '', proficiencyLevel: 5 }]);
  };

  const removeSpecialty = (index) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const updateSpecialty = (index, field, value) => {
    const updated = [...specialties];
    updated[index][field] = field === 'proficiencyLevel' ? parseInt(value) : value;
    setSpecialties(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one specialty is provided when creating a new radiologist
    const validSpecialties = specialties.filter(s => s.specialty);
    if (!radiologist && validSpecialties.length === 0) {
      alert('Please add at least one specialty for this radiologist.');
      return;
    }

    try {
      let radiologistId;
      if (radiologist) {
        // Update existing radiologist
        const response = await axios.put(`${API_URL}/radiologists/${radiologist.id}`, formData);
        radiologistId = response.data.id;
        
        // Update specialties - remove old ones and add new ones
        // For simplicity, we'll remove all and re-add (you could optimize this)
        const existingSpecialties = radiologist.specialties || [];
        const newSpecialtyNames = validSpecialties.map(s => s.specialty);
        const toRemove = existingSpecialties.filter(s => !newSpecialtyNames.includes(s.specialty));
        
        // Remove specialties that are no longer in the list
        // Note: We'd need a delete endpoint for this, for now we'll just add/update
      } else {
        // Create new radiologist
        const response = await axios.post(`${API_URL}/radiologists`, formData);
        radiologistId = response.data.id;
      }

      // Add/update specialties
      if (validSpecialties.length > 0) {
        await Promise.all(
          validSpecialties.map(spec =>
            axios.post(`${API_URL}/radiologists/specialty`, {
              radiologistId: radiologistId,
              specialty: spec.specialty,
              proficiencyLevel: spec.proficiencyLevel
            })
          )
        );
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving radiologist:', error);
      alert('Error saving radiologist: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{radiologist ? 'Edit' : 'Add New'} Radiologist</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="radiologist">Radiologist</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Work Hours Start:</label>
            <input
              type="time"
              name="workHoursStart"
              value={formData.workHoursStart}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Work Hours End:</label>
            <input
              type="time"
              name="workHoursEnd"
              value={formData.workHoursEnd}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Work Days:</label>
            <select name="workDays" value={formData.workDays} onChange={handleChange}>
              <option value="Mon-Fri">Monday - Friday</option>
              <option value="Mon-Sat">Monday - Saturday</option>
              <option value="Mon-Sun">Monday - Sunday</option>
              <option value="Tue-Sat">Tuesday - Saturday</option>
              <option value="Wed-Sun">Wednesday - Sunday</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className="form-group" style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
          }}>
            <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>
              Specialties {!radiologist && <span style={{ color: '#3498db', fontSize: '0.9rem', fontWeight: 'normal' }}>(Required during registration)</span>}
            </label>
            {!radiologist && (
              <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '1rem', fontStyle: 'italic' }}>
                Please add at least one specialty for this radiologist. You can add multiple specialties if needed.
              </p>
            )}
            {specialties.map((spec, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                marginBottom: '0.75rem', 
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                <select
                  value={spec.specialty}
                  onChange={(e) => updateSpecialty(index, 'specialty', e.target.value)}
                  style={{ flex: 1, padding: '0.5rem' }}
                  required={!radiologist && index === 0}
                >
                  <option value="">-- Select specialty --</option>
                  {SPECIALTIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', whiteSpace: 'nowrap' }}>
                  Proficiency:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={spec.proficiencyLevel}
                  onChange={(e) => updateSpecialty(index, 'proficiencyLevel', e.target.value)}
                  placeholder="1-10"
                  style={{ width: '80px', padding: '0.5rem' }}
                  required={!radiologist && index === 0}
                />
                {specialties.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecialty(index)}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      background: '#e74c3c', 
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecialty}
              style={{ 
                marginTop: '0.5rem', 
                padding: '0.5rem 1rem', 
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              + Add Another Specialty
            </button>
          </div>

          <div className="form-actions">
            <button type="submit">{radiologist ? 'Update' : 'Create'} Radiologist</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RadiologistForm;

