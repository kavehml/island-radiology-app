import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SiteForm from '../components/SiteManagement/SiteForm';
import FacilityForm from '../components/SiteManagement/FacilityForm';

const API_URL = '/api';

function Sites() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/sites`);
      setSites(response.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleSiteSelect = async (siteId) => {
    try {
      const response = await axios.get(`${API_URL}/sites/${siteId}`);
      setSelectedSite(response.data);
    } catch (error) {
      console.error('Error fetching site:', error);
    }
  };

  const equipmentTypes = ['CT', 'MRI', 'Ultrasound', 'US', 'PET', 'X-Ray'];

  return (
    <div className="sites-page">
      <div className="page-header">
        <h2>Sites Management</h2>
        <button onClick={() => setShowSiteForm(true)}>Add New Site</button>
      </div>

      <div className="sites-layout">
        <div className="sites-list">
          <h3>Sites</h3>
          {sites.map(site => (
            <div
              key={site.id}
              className={`site-card ${selectedSite?.id === site.id ? 'selected' : ''}`}
              onClick={() => handleSiteSelect(site.id)}
            >
              <h4>{site.name}</h4>
              <p>{site.address}</p>
            </div>
          ))}
        </div>

        {selectedSite && (
          <div className="site-details">
            <h3>{selectedSite.name}</h3>
            <button onClick={() => setShowFacilityForm(true)}>Edit Facilities</button>
            
            <div className="facilities-section">
              <h4>Facilities</h4>
              <table>
                <thead>
                  <tr>
                    <th>Equipment Type</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentTypes.map(type => {
                    const facility = selectedSite.facilities?.find(f => f.equipment_type === type);
                    return (
                      <tr key={type}>
                        <td>{type}</td>
                        <td>{facility?.quantity || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showSiteForm && (
        <SiteForm
          onClose={() => setShowSiteForm(false)}
          onSuccess={() => {
            setShowSiteForm(false);
            fetchSites();
          }}
        />
      )}

      {showFacilityForm && selectedSite && (
        <FacilityForm
          site={selectedSite}
          onClose={() => setShowFacilityForm(false)}
          onSuccess={() => {
            setShowFacilityForm(false);
            handleSiteSelect(selectedSite.id);
          }}
        />
      )}
    </div>
  );
}

export default Sites;

