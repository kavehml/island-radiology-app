import { useState, useEffect } from 'react';
import axios from 'axios';
import { Radiologist, Site } from '../../types';
import { API_URL } from '../../config/api';

interface AssignSiteFormProps {
  radiologist: Radiologist;
  sites: Site[];
  onClose: () => void;
  onSuccess: () => void;
}

function AssignSiteForm({ radiologist, sites, onClose, onSuccess }: AssignSiteFormProps) {
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [assignedSites, setAssignedSites] = useState<number[]>([]);

  useEffect(() => {
    if (radiologist?.sites) {
      setAssignedSites(radiologist.sites.map(s => s.id));
    }
  }, [radiologist]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) {
      alert('Please select a site');
      return;
    }

    try {
      await axios.post(`${API_URL}/radiologists/assign-site`, {
        radiologistId: radiologist.id,
        siteId: parseInt(selectedSiteId)
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error assigning site:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert('Error assigning site: ' + (axiosError.response?.data?.error || errorMessage));
    }
  };

  const handleRemove = async (siteId: number): Promise<void> => {
    if (!confirm('Remove this site assignment?')) {
      return;
    }

    try {
      await axios.post(`${API_URL}/radiologists/remove-site`, {
        radiologistId: radiologist.id,
        siteId: siteId
      });
      onSuccess();
    } catch (error: unknown) {
      console.error('Error removing site:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert('Error removing site: ' + (axiosError.response?.data?.error || errorMessage));
    }
  };

  const availableSites = sites.filter((site: Site) => !assignedSites.includes(site.id));

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Assign {radiologist?.name} to Site</h3>
        
        {assignedSites.length > 0 && radiologist.sites && (
          <div style={{ marginBottom: '1rem' }}>
            <h4>Currently Assigned Sites:</h4>
            <ul>
              {radiologist.sites.map((site: Site) => (
                <li key={site.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>{site.name}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemove(site.id)}
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleAssign}>
          <div className="form-group">
            <label>Select Site:</label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              required
            >
              <option value="">-- Select a site --</option>
              {availableSites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
            {availableSites.length === 0 && (
              <p style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                All sites are already assigned to this radiologist.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={availableSites.length === 0}>Assign to Site</button>
            <button type="button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignSiteForm;

