"use client";
import { useState } from 'react';
import styles from './CalendarView.module.css';
import EventModal from './EventModal';

// TODO: Replace with real data from backend
const mockEvents = [
  { id: 1, date: '2025-07-22', title: 'Quiz 1', description: 'First quiz' },
  { id: 2, date: '2025-07-25', title: 'Assignment Due', description: 'Submit assignment' },
];

export default function CalendarView({ classroomId }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // For demo, just show event list
  return (
    <section className={styles.section}>
      <h2>Calendar</h2>
      <ul className={styles.eventList}>
        {mockEvents.map(ev => (
          <li key={ev.id}>
            <button className={styles.eventBtn} onClick={() => setSelectedEvent(ev)}>
              {ev.date}: {ev.title}
            </button>
          </li>
        ))}
      </ul>
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  );
}
