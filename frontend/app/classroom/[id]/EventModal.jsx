import styles from './EventModal.module.css';

export default function EventModal({ event, onClose }) {
  return (
    <div className={styles.overlay} tabIndex={-1} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {event.date}</p>
        <p>{event.description}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
