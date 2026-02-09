import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

function AssignSiteForm({ radiologist, sites, onClose, onSuccess }) {
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [assignedSites, setAssignedSites] = useState([]);

  useEffect(() => {
    if (radiologist?.sites) {
      setAssignedSites(radiologist.sites.map(s => s.id));
    }
  }, [radiologist]);

  const handleAssign = async (e) => {
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
    } catch (error) {
      console.error('Error assigning site:', error);
      alert('Error assigning site: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRemove = async (siteId) => {
    if (!confirm('Remove this site assignment?')) {
      return;
    }

    try {
      await axios.post(`${API_URL}/radiologists/remove-site`, {
        radiologistId: radiologist.id,
        siteId: siteId
      });
      onSuccess();
    } catch (error) {
      console.error('Error removing site:', error);
      alert('Error removing site: ' + (error.response?.data?.error || error.message));
    }
  };

  const availableSites = sites.filter(site => !assignedSites.includes(site.id));

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Assign {radiologist?.name} to Site</h3>
        
        {assignedSites.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h4>Currently Assigned Sites:</h4>
            <ul>
              {radiologist.sites.map(site => (
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

