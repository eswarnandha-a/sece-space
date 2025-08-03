"use client";
import { useState } from 'react';
import styles from './AddFilesModal.module.css';

export default function AddFilesModal({ isOpen, onClose, onFilesAdded, roomId }) {
  const [activeTab, setActiveTab] = useState('files');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('Unit 1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const units = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleFilesUpload = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('unit', selectedUnit);
        formData.append('description', description);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
        const endpoint = file.type.startsWith('image/') 
          ? `${baseUrl}/api/upload/room-image`
          : `${baseUrl}/api/upload/room-document`;

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return await response.json();
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      // Add files to classroom
      const response = await fetch(`${baseUrl}/api/classrooms/${roomId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: uploadResults.map(result => ({
            name: result.originalName || result.name,
            url: result.url,
            type: result.type || 'document',
            unit: selectedUnit,
            description: description,
            uploadDate: new Date().toISOString()
          }))
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onFilesAdded(data.files);
        setSelectedFiles([]);
        setDescription('');
        alert('Files uploaded successfully!');
      } else {
        throw new Error('Failed to add files to classroom');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleYouTubeUpload = async () => {
    if (!youtubeLink.trim()) return;

    setLoading(true);
    try {
      // Extract video ID from YouTube URL
      const videoId = extractYouTubeVideoId(youtubeLink);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
      const response = await fetch(`${baseUrl}/api/classrooms/${roomId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: [{
            name: `YouTube Video - ${selectedUnit}`,
            url: youtubeLink,
            type: 'youtube',
            unit: selectedUnit,
            description: description,
            uploadDate: new Date().toISOString()
          }]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onFilesAdded(data.files);
        setYoutubeLink('');
        setDescription('');
        alert('YouTube link added successfully!');
      } else {
        throw new Error('Failed to add YouTube link');
      }
    } catch (error) {
      console.error('Error adding YouTube link:', error);
      alert('Error adding YouTube link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = () => {
    if (activeTab === 'files') {
      handleFilesUpload();
    } else {
      handleYouTubeUpload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Add Course Materials</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Upload Files
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'youtube' ? styles.active : ''}`}
            onClick={() => setActiveTab('youtube')}
          >
            YouTube Link
          </button>
        </div>

        <div className={styles.content}>
          {/* Unit Selection */}
          <div className={styles.section}>
            <label className={styles.label}>Select Unit:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className={styles.select}
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <label className={styles.label}>Description (optional):</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this material..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          {activeTab === 'files' ? (
            <div className={styles.section}>
              <label className={styles.label}>Upload Files:</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className={styles.fileInput}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />
                <div className={styles.uploadArea}>
                  <div className={styles.uploadIcon}>📁</div>
                  <p>Click to select files or drag and drop</p>
                  <p className={styles.supportedFormats}>
                    Supported: PDF, DOC, PPT, Images
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className={styles.selectedFiles}>
                  <h4>Selected Files:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className={styles.fileItem}>
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className={styles.removeButton}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.section}>
              <label className={styles.label}>YouTube URL:</label>
              <input
                type="url"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={styles.input}
              />
              {youtubeLink && extractYouTubeVideoId(youtubeLink) && (
                <div className={styles.preview}>
                  <p>✓ Valid YouTube URL</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={loading || (activeTab === 'files' ? selectedFiles.length === 0 : !youtubeLink.trim())}
          >
            {loading ? 'Uploading...' : 'Add Materials'}
          </button>
        </div>
      </div>
    </div>
  );
}
