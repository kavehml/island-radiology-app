import { useState, useEffect } from 'react';
import axios from 'axios';
import ProcedureTimeForm from '../components/Procedures/ProcedureTimeForm';
import { Radiologist, Procedure } from '../types';

const API_URL = '/api';

const CATEGORIES = ['CT', 'MRI', 'Ultrasound', 'PET', 'X-Ray'];

function Procedures() {
  const [radiologists, setRadiologists] = useState<Radiologist[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedRadiologist, setSelectedRadiologist] = useState<Radiologist | null>(null);
  const [procedureTimes, setProcedureTimes] = useState<Record<number, { id: number; time: number }>>({});
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

  const fetchRadiologistProcedureTimes = async (radiologistId: number): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/procedures/radiologist/${radiologistId}/times`);
      // Convert array to object for easy lookup: {procedureId: time}
      const timesMap: Record<number, { id: number; time: number }> = {};
      response.data.forEach((item: { procedure_id: number; id: number; average_reporting_time: number }) => {
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

  const handleRadiologistSelect = (radiologistId: number): void => {
    const radiologist = radiologists.find(r => r.id === radiologistId);
    setSelectedRadiologist(radiologist || null);
  };

  const handleTimeUpdate = async (procedureId: number, time: number): Promise<void> => {
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
    } catch (error: unknown) {
      console.error('Error updating procedure time:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { error?: string } } };
      alert('Error updating procedure time: ' + (axiosError.response?.data?.error || errorMessage));
    }
  };

  const getProceduresByCategory = (category: string): Procedure[] => {
    if (category === 'all') {
      return procedures;
    }
    return procedures.filter((p: Procedure) => p.category === category);
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
                  {radiologist.specialties.map((s: { specialty: string }) => s.specialty).join(', ')}
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

