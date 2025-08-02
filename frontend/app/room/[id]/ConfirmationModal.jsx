"use client";
import styles from './ConfirmationModal.module.css';

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  isDangerous = false 
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={`${styles.title} ${isDangerous ? styles.dangerous : ''}`}>
            {title}
          </h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button 
            className={`${styles.confirmButton} ${isDangerous ? styles.dangerous : ''}`}
            onClick={onConfirm}
          >
            {isDangerous ? 'Delete' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
