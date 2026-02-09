import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProcedureTimeForm from '../components/Procedures/ProcedureTimeForm';

const API_URL = '/api';

const CATEGORIES = ['CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'];

function Procedures() {
  const [radiologists, setRadiologists] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [selectedRadiologist, setSelectedRadiologist] = useState(null);
  const [procedureTimes, setProcedureTimes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRadiologists();
    fetchProcedures();
  }, []);

  useEffect(() => {
    if (selectedRadiologist) {
      fetchRadiologistProcedureTimes(selectedRadiologist.id);
    }
  }, [selectedRadiologist]);

  const fetchRadiologists = async () => {
    try {
      const response = await axios.get(`${API_URL}/radiologists`);
      setRadiologists(response.data);
    } catch (error) {
      console.error('Error fetching radiologists:', error);
    }
  };

  const fetchProcedures = async () => {
    try {
      const response = await axios.get(`${API_URL}/procedures`);
      setProcedures(response.data);
    } catch (error) {
      console.error('Error fetching procedures:', error);
    }
  };

  const fetchRadiologistProcedureTimes = async (radiologistId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/procedures/radiologist/${radiologistId}/times`);
      // Convert array to object for easy lookup: {procedureId: time}
      const timesMap = {};
      response.data.forEach(item => {
        timesMap[item.procedure_id] = {
          id: item.id,
          time: item.average_reporting_time
        };
      });
      setProcedureTimes(timesMap);
    } catch (error) {
      console.error('Error fetching procedure times:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRadiologistSelect = (radiologistId) => {
    const radiologist = radiologists.find(r => r.id === radiologistId);
    setSelectedRadiologist(radiologist);
  };

  const handleTimeUpdate = async (procedureId, time) => {
    if (!selectedRadiologist) return;

    try {
      if (procedureTimes[procedureId]) {
        // Update existing
        await axios.put(`${API_URL}/procedures/time/${procedureTimes[procedureId].id}`, {
          averageReportingTime: time
        });
      } else {
        // Create new
        await axios.post(`${API_URL}/procedures/radiologist/time`, {
          radiologistId: selectedRadiologist.id,
          procedureId: procedureId,
          averageReportingTime: time
        });
      }
      // Refresh the times
      await fetchRadiologistProcedureTimes(selectedRadiologist.id);
    } catch (error) {
      console.error('Error updating procedure time:', error);
      alert('Error updating procedure time: ' + (error.response?.data?.error || error.message));
    }
  };

  const getProceduresByCategory = (category) => {
    if (category === 'all') {
      return procedures;
    }
    return procedures.filter(p => p.category === category);
  };

  const filteredProcedures = getProceduresByCategory(selectedCategory);

  return (
    <div className="procedures-page">
      <div className="page-header">
        <h2>Procedures & Reporting Times</h2>
      </div>

      <div className="procedures-layout">
        <div className="radiologists-sidebar">
          <h3>Radiologists</h3>
          {radiologists.map(radiologist => (
            <div
              key={radiologist.id}
              className={`radiologist-item ${selectedRadiologist?.id === radiologist.id ? 'selected' : ''}`}
              onClick={() => handleRadiologistSelect(radiologist.id)}
            >
              <h4>{radiologist.name}</h4>
              {radiologist.specialties && radiologist.specialties.length > 0 && (
                <p className="specialties-preview">
                  {radiologist.specialties.map(s => s.specialty).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="procedures-content">
          {!selectedRadiologist ? (
            <div className="no-selection">
              <p>Please select a radiologist to view and set procedure reporting times.</p>
            </div>
          ) : (
            <>
              <div className="radiologist-header">
                <h3>{selectedRadiologist.name} - Procedure Reporting Times</h3>
                <div className="category-filter">
                  <label>Filter by Category: </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <p>Loading procedure times...</p>
              ) : (
                <div className="procedures-list">
                  {filteredProcedures.length === 0 ? (
                    <p>No procedures found for selected category.</p>
                  ) : (
                    filteredProcedures.map(procedure => (
                      <ProcedureTimeForm
                        key={procedure.id}
                        procedure={procedure}
                        currentTime={procedureTimes[procedure.id]?.time}
                        onTimeUpdate={(time) => handleTimeUpdate(procedure.id, time)}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Procedures;

