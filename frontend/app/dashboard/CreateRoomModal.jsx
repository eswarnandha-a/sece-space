"use client";
import { useState } from 'react';
import styles from './CreateRoomModal.module.css';

export default function CreateRoomModal({ user, onClose }) {
  const [formData, setFormData] = useState({
    branchName: '',
    subject: '',
    coverImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First upload the cover image if provided
      let coverImageUrl = '';
      if (formData.coverImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.coverImage);

        const uploadResponse = await fetch('http://localhost:5000/api/upload/cover-image', {
          method: 'POST',
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          coverImageUrl = uploadResult.url;
        }
      }

      // Create the classroom
      const classroomData = {
        name: `${formData.branchName} - ${formData.subject}`,
        facultyId: user._id || user.id, // Handle both _id and id
        branch: formData.branchName,
        subject: formData.subject,
        coverImage: coverImageUrl
      };

      const response = await fetch('http://localhost:5000/api/classrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classroomData),
      });

      if (response.ok) {
        onClose();
        window.location.reload(); // Refresh to show new classroom
      } else {
        throw new Error('Failed to create classroom');
      }
    } catch (error) {
      setError('Failed to create classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Create New Classroom</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Branch Name</label>
            <input
              type="text"
              name="branchName"
              value={formData.branchName}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="e.g., Data Structures"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Cover Picture (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {formData.coverImage && (
              <div className={styles.imagePreview}>
                <img 
                  src={URL.createObjectURL(formData.coverImage)} 
                  alt="Cover preview"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.createButton}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
