import { useState, useEffect } from 'react';
import axios from 'axios';
import { Site } from '../../types';

const API_URL = '/api';

interface FacilityFormProps {
  site: Site;
  onClose: () => void;
  onSuccess: () => void;
}

type FacilitiesType = {
  CT: number;
  MRI: number;
  Ultrasound: number;
  PET: number;
  'X-Ray': number;
  US: number;
};

function FacilityForm({ site, onClose, onSuccess }: FacilityFormProps) {
  const [facilities, setFacilities] = useState<FacilitiesType>({
    CT: 0,
    MRI: 0,
    Ultrasound: 0,
    PET: 0,
    'X-Ray': 0,
    US: 0  // Alternative name for Ultrasound
  });

  useEffect(() => {
    if (site?.facilities) {
      const facilityMap: Partial<FacilitiesType> = {};
      site.facilities.forEach((f: { equipment_type: string; quantity: number }) => {
        const key = f.equipment_type as keyof FacilitiesType;
        if (key) {
          facilityMap[key] = f.quantity;
        }
      });
      setFacilities(prev => ({ ...prev, ...facilityMap }));
    }
  }, [site]);

  const handleChange = (equipmentType: keyof FacilitiesType, value: string): void => {
    setFacilities(prev => ({
      ...prev,
      [equipmentType]: parseInt(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: unknown) {
      console.error('Error updating facilities:', error);
      alert('Error updating facilities');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit Facilities for {site?.name}</h3>
        <form onSubmit={handleSubmit}>
          {Object.keys(facilities).map((type: string) => (
            <div key={type} className="form-group">
              <label>{type}:</label>
              <input
                type="number"
                min="0"
                value={facilities[type as keyof FacilitiesType]}
                onChange={(e) => handleChange(type as keyof FacilitiesType, e.target.value)}
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

