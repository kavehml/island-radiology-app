import React, { useState, useEffect } from 'react';

function ProcedureTimeForm({ procedure, currentTime, onTimeUpdate }) {
  const [time, setTime] = useState(currentTime || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTime(currentTime || '');
    setIsEditing(false);
  }, [currentTime]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (time && parseInt(time) > 0) {
      onTimeUpdate(parseInt(time));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTime(currentTime || '');
    setIsEditing(false);
  };

  return (
    <div className="procedure-item">
      <div className="procedure-info">
        <h4>{procedure.name}</h4>
        <p className="procedure-meta">
          <span className="category-badge">{procedure.category}</span>
          {procedure.body_part && <span className="body-part">{procedure.body_part}</span>}
        </p>
        {procedure.description && (
          <p className="procedure-description">{procedure.description}</p>
        )}
      </div>
      <div className="procedure-time">
        {isEditing ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Minutes"
              style={{ width: '100px', padding: '0.5rem' }}
              autoFocus
            />
            <span>minutes</span>
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>Save</button>
            <button type="button" onClick={handleCancel} style={{ padding: '0.5rem 1rem', background: '#95a5a6' }}>
              Cancel
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {currentTime ? (
              <>
                <span className="time-display">{currentTime} minutes</span>
                <button onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1rem' }}>
                  Edit
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} style={{ padding: '0.5rem 1rem', background: '#27ae60' }}>
                Set Time
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProcedureTimeForm;

