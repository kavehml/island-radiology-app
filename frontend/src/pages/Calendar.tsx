import React, { useState, useEffect } from 'react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = '/api';

function Calendar() {
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    fetchSchedules(startOfMonth, endOfMonth);
  }, [date]);

  const fetchSchedules = async (startDate, endDate) => {
    try {
      const response = await axios.get(`${API_URL}/schedules`, {
        params: {
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd')
        }
      });
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    const startOfMonth = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
    const endOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
    fetchSchedules(startOfMonth, endOfMonth);
  };

  const getSchedulesForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => s.date === dateStr);
  };

  return (
    <div className="calendar-page">
      <h2>Radiologist Schedule Calendar</h2>
      <div className="calendar-container">
        <CalendarComponent
          onChange={handleDateChange}
          value={date}
          onClickDay={(value) => setSelectedDate(value)}
        />
        {selectedDate && (
          <div className="schedule-details">
            <h3>Schedules for {format(selectedDate, 'MMMM dd, yyyy')}</h3>
            {getSchedulesForDate(selectedDate).length === 0 ? (
              <p>No schedules for this date</p>
            ) : (
              getSchedulesForDate(selectedDate).map(schedule => (
                <div key={schedule.id} className="schedule-item">
                  <p><strong>{schedule.radiologist_name}</strong></p>
                  <p>Site: {schedule.site_name}</p>
                  <p>Time: {schedule.start_time} - {schedule.end_time}</p>
                  <p>Status: {schedule.status}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;

