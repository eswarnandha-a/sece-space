'use client';

import { useState, useEffect } from 'react';
import styles from './Calendar.module.css';

const Calendar = ({ userRole = 'student' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    // Update current date every minute
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasEvent = (day) => {
    if (!day) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.find(event => event.date === dateStr);
  };

  const handleDateMouseEnter = (day, event) => {
    if (!day) return;
    const eventData = hasEvent(day);
    if (eventData) {
      setHoveredEvent(eventData);
      setMousePosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleDateMouseLeave = () => {
    setHoveredEvent(null);
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    if (userRole === 'faculty') {
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = () => {
    if (!eventTitle.trim()) return;

    const newEvent = {
      id: Date.now(),
      title: eventTitle,
      description: eventDescription,
      date: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    };

    setEvents([...events, newEvent]);
    setEventTitle('');
    setEventDescription('');
    setShowEventModal(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(-1)}
        >
          &#8249;
        </button>
        <h3 className={styles.monthYear}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button 
          className={styles.navButton}
          onClick={() => navigateMonth(1)}
        >
          &#8250;
        </button>
      </div>

      <div className={styles.daysOfWeek}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((day, index) => (
          <div
            key={index}
            className={`${styles.dayCell} ${
              day ? styles.validDay : styles.emptyDay
            } ${
              isToday(day) ? styles.today : ''
            } ${
              hasEvent(day) ? styles.hasEvent : ''
            }`}
            onClick={() => handleDateClick(day)}
            onMouseEnter={(e) => handleDateMouseEnter(day, e)}
            onMouseLeave={handleDateMouseLeave}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Event Hover Tooltip */}
      {hoveredEvent && (
        <div 
          className={styles.eventTooltip}
          style={{
            position: 'fixed',
            left: mousePosition.x + 10,
            top: mousePosition.y - 10,
            zIndex: 1001
          }}
        >
          <div className={styles.tooltipContent}>
            <h4>{hoveredEvent.title}</h4>
            {hoveredEvent.description && (
              <p>{hoveredEvent.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Event Modal for Faculty */}
      {showEventModal && userRole === 'faculty' && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h4>Create Event - {selectedDate.toLocaleDateString()}</h4>
              <button 
                className={styles.closeButton}
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <input
                type="text"
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className={styles.eventInput}
              />
              <textarea
                placeholder="Event Description (optional)"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className={styles.eventTextarea}
                rows="3"
              />
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowEventModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.createButton}
                onClick={handleCreateEvent}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
