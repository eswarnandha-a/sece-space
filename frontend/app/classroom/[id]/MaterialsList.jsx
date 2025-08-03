"use client";
import { useState, useEffect } from 'react';
import styles from './MaterialsList.module.css';

export default function MaterialsList({ classroomId, userRole, userId }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [uploadData, setUploadData] = useState({
    title: '',
    url: '',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/classrooms/${classroomId}/resources`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('classroomId', classroomId);
      formData.append('type', uploadType);
      
      if (uploadType === 'file' && uploadData.file) {
        formData.append('file', uploadData.file);
        formData.append('title', uploadData.title || uploadData.file.name);
      } else if (uploadType === 'url') {
        formData.append('url', uploadData.url);
        formData.append('title', uploadData.title);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadData({ title: '', url: '', file: null });
        setShowUploadForm(false);
        fetchMaterials(); // Refresh materials list
        alert('Material uploaded successfully!');
      } else {
        alert('Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Error uploading material');
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>Loading materials...</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2>Course Materials</h2>
        {userRole === 'faculty' && (
          <button 
            className={styles.uploadButton}
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            {showUploadForm ? 'Cancel' : 'Add Material'}
          </button>
        )}
      </div>

      {showUploadForm && userRole === 'faculty' && (
        <div className={styles.uploadForm}>
          <div className={styles.uploadTypeSelector}>
            <button 
              className={`${styles.typeButton} ${uploadType === 'file' ? styles.active : ''}`}
              onClick={() => setUploadType('file')}
            >
              📁 Upload File
            </button>
            <button 
              className={`${styles.typeButton} ${uploadType === 'url' ? styles.active : ''}`}
              onClick={() => setUploadType('url')}
            >
              🔗 Add URL
            </button>
          </div>

          <form onSubmit={handleUpload} className={styles.form}>
            <input
              type="text"
              placeholder="Material title"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              className={styles.input}
              required
            />

            {uploadType === 'file' ? (
              <input
                type="file"
                onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
                className={styles.fileInput}
                required
              />
            ) : (
              <input
                type="url"
                placeholder="Enter URL (YouTube, Google Drive, etc.)"
                value={uploadData.url}
                onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                className={styles.input}
                required
              />
            )}

            <div className={styles.formButtons}>
              <button type="submit" className={styles.submitButton}>
                Upload Material
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.materialsGrid}>
        {materials.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No materials available yet.</p>
            {userRole === 'faculty' && <p>Click "Add Material" to upload your first resource!</p>}
          </div>
        ) : (
          materials.map((material) => (
            <div key={material._id} className={styles.materialCard}>
              <div className={styles.materialIcon}>
                {material.type === 'file' ? '📄' : '🔗'}
              </div>
              <div className={styles.materialContent}>
                <h3 className={styles.materialTitle}>{material.title || material.filename}</h3>
                <p className={styles.materialType}>
                  {material.type === 'file' ? 'File' : 'URL'}
                </p>
                <a 
                  href={material.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.materialLink}
                >
                  {material.type === 'file' ? 'Download' : 'Open Link'}
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
