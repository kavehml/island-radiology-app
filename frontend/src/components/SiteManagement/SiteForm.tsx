import { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

const EQUIPMENT_TYPES = ['CT', 'MRI', 'Ultrasound', 'US', 'PET', 'X-Ray'] as const;

type EquipmentType = typeof EQUIPMENT_TYPES[number];

interface SiteFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type FacilitiesType = {
  CT: number;
  MRI: number;
  Ultrasound: number;
  US: number;
  PET: number;
  'X-Ray': number;
};

function SiteForm({ onClose, onSuccess }: SiteFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    facilities: FacilitiesType;
  }>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFacilityChange = (equipmentType: EquipmentType, value: string): void => {
    setFormData({
      ...formData,
      facilities: {
        ...formData.facilities,
        [equipmentType]: parseInt(value) || 0
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: unknown) {
      console.error('Error creating site:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert('Error creating site: ' + (axiosError.response?.data?.error || errorMessage));
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
                  value={formData.facilities[type].toString()}
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

