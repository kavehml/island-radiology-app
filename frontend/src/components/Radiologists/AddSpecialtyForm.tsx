import React, { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

function AddSpecialtyForm({ radiologist, specialties, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    specialty: '',
    proficiencyLevel: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'proficiencyLevel' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/radiologists/specialty`, {
        radiologistId: radiologist.id,
        specialty: formData.specialty,
        proficiencyLevel: formData.proficiencyLevel
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding specialty:', error);
      alert('Error adding specialty: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add Specialty for {radiologist?.name}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Specialty:</label>
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              required
            >
              <option value="">-- Select specialty --</option>
              {specialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Proficiency Level (1-10):</label>
            <input
              type="number"
              name="proficiencyLevel"
              min="1"
              max="10"
              value={formData.proficiencyLevel}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit">Add Specialty</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddSpecialtyForm;

