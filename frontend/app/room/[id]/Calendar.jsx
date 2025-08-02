"use client";
import { useState, useEffect } from 'react';
import styles from './Calendar.module.css';

export default function Calendar({ events, onEventAdded, canAddEvents, roomId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return events.filter(event => event.date === dateStr);
  };

  const hasEventOnDate = (date) => {
    if (!date) return false;
    return getEventsForDate(date).length > 0;
  };

  const handleDateClick = (date) => {
    if (!date || !canAddEvents) return;
    setSelectedDate(date);
    setShowEventModal(true);
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !selectedDate) return;

    try {
      const newEvent = {
        title: eventTitle,
        description: eventDescription,
        date: formatDate(selectedDate),
        roomId: roomId
      };

      const response = await fetch(`http://localhost:5000/api/classrooms/${roomId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      if (response.ok) {
        const savedEvent = await response.json();
        onEventAdded(savedEvent);
        setEventTitle('');
        setEventDescription('');
        setShowEventModal(false);
        setSelectedDate(null);
        alert('Event added successfully!');
      } else {
        throw new Error('Failed to add event');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event');
    }
  };

  const handleDateHover = (date, event) => {
    if (!date || !hasEventOnDate(date)) return;

    const eventsForDate = getEventsForDate(date);
    if (eventsForDate.length > 0) {
      setHoveredEvent(eventsForDate[0]);
      setHoveredPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleDateLeave = () => {
    setHoveredEvent(null);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h3>Calendar</h3>
        {canAddEvents && (
          <p className={styles.subtitle}>Click dates to add events</p>
        )}
      </div>

      <div className={styles.navigation}>
        <button onClick={() => navigateMonth(-1)} className={styles.navButton}>
          ‹
        </button>
        <h4 className={styles.monthYear}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        <button onClick={() => navigateMonth(1)} className={styles.navButton}>
          ›
        </button>
      </div>

      <div className={styles.daysOfWeek}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayOfWeek}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((date, index) => (
          <div
            key={index}
            className={`${styles.day} ${date ? styles.validDay : styles.emptyDay} ${
              hasEventOnDate(date) ? styles.hasEvent : ''
            } ${canAddEvents && date ? styles.clickable : ''}`}
            onClick={() => handleDateClick(date)}
            onMouseEnter={(e) => handleDateHover(date, e)}
            onMouseLeave={handleDateLeave}
          >
            {date && (
              <>
                <span className={styles.dayNumber}>{date.getDate()}</span>
                {hasEventOnDate(date) && (
                  <div className={styles.eventIndicator}></div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h4>Add Event - {selectedDate?.toDateString()}</h4>
            <input
              type="text"
              placeholder="Event title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className={styles.input}
            />
            <textarea
              placeholder="Event description (optional)"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedDate(null);
                  setEventTitle('');
                  setEventDescription('');
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className={styles.addButton}
                disabled={!eventTitle.trim()}
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Tooltip */}
      {hoveredEvent && (
        <div
          className={styles.tooltip}
          style={{
            left: hoveredPosition.x + 10,
            top: hoveredPosition.y - 50,
          }}
        >
          <h5>{hoveredEvent.title}</h5>
          {hoveredEvent.description && (
            <p>{hoveredEvent.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
