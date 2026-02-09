import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function FacilityForm({ site, onClose, onSuccess }) {
  const [facilities, setFacilities] = useState({
    CT: 0,
    MRI: 0,
    Ultrasound: 0,
    PET: 0,
    'X-Ray': 0,
    US: 0  // Alternative name for Ultrasound
  });

  useEffect(() => {
    if (site?.facilities) {
      const facilityMap = {};
      site.facilities.forEach(f => {
        facilityMap[f.equipment_type] = f.quantity;
      });
      setFacilities(prev => ({ ...prev, ...facilityMap }));
    }
  }, [site]);

  const handleChange = (equipmentType, value) => {
    setFacilities(prev => ({
      ...prev,
      [equipmentType]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(
        Object.entries(facilities).map(([type, quantity]) =>
          axios.post(`${API_URL}/facilities`, {
            siteId: site.id,
            equipmentType: type,
            quantity
          })
        )
      );
      onSuccess();
    } catch (error) {
      console.error('Error updating facilities:', error);
      alert('Error updating facilities');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Facilities for {site?.name}</h3>
        <form onSubmit={handleSubmit}>
          {Object.keys(facilities).map(type => (
            <div key={type} className="form-group">
              <label>{type}:</label>
              <input
                type="number"
                min="0"
                value={facilities[type]}
                onChange={(e) => handleChange(type, e.target.value)}
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FacilityForm;

