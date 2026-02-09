import React, { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

const EQUIPMENT_TYPES = ['CT', 'MRI', 'Ultrasound', 'US', 'PET', 'X-Ray'];

function SiteForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    facilities: {
      CT: 0,
      MRI: 0,
      Ultrasound: 0,
      US: 0,
      PET: 0,
      'X-Ray': 0
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFacilityChange = (equipmentType, value) => {
    setFormData({
      ...formData,
      facilities: {
        ...formData.facilities,
        [equipmentType]: parseInt(value) || 0
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First create the site
      const siteResponse = await axios.post(`${API_URL}/sites`, {
        name: formData.name,
        address: formData.address
      });

      const siteId = siteResponse.data.id;

      // Then add facilities
      await Promise.all(
        Object.entries(formData.facilities).map(([type, quantity]) => {
          if (quantity > 0) {
            return axios.post(`${API_URL}/facilities`, {
              siteId: siteId,
              equipmentType: type,
              quantity: quantity
            });
          }
          return Promise.resolve();
        })
      );

      onSuccess();
    } catch (error) {
      console.error('Error creating site:', error);
      alert('Error creating site: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Add New Site</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Site Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label style={{ marginBottom: '1rem', display: 'block', fontWeight: 'bold' }}>
              Equipment / Machines:
            </label>
            {EQUIPMENT_TYPES.map(type => (
              <div key={type} className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'inline-block', width: '150px' }}>{type}:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.facilities[type]}
                  onChange={(e) => handleFacilityChange(type, e.target.value)}
                  style={{ width: '100px' }}
                />
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit">Create Site</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SiteForm;

