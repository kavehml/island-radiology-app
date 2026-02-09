import { useState } from 'react';
import axios from 'axios';
import { Radiologist } from '../../types';
import { API_URL } from '../../config/api';

interface AddSpecialtyFormProps {
  radiologist: Radiologist;
  specialties: string[];
  onClose: () => void;
  onSuccess: () => void;
}

function AddSpecialtyForm({ radiologist, specialties, onClose, onSuccess }: AddSpecialtyFormProps) {
  const [formData, setFormData] = useState({
    specialty: '',
    proficiencyLevel: 5
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'proficiencyLevel' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/radiologists/specialty`, {
        radiologistId: radiologist.id,
        specialty: formData.specialty,
        proficiencyLevel: formData.proficiencyLevel
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error adding specialty:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert('Error adding specialty: ' + (axiosError.response?.data?.error || errorMessage));
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

