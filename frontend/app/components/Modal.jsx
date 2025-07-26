import styles from './Modal.module.css';

export default function Modal({ children, onClose }) {
  return (
    <div className={styles.overlay} tabIndex={-1} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
