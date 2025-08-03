"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './page.module.css';
import AddFilesModal from './AddFilesModal';
import Calendar from './Calendar';
import ConfirmationModal from './ConfirmationModal';
import { apiUrl, API_ENDPOINTS } from '../../../utils/api';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [showAddFiles, setShowAddFiles] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('All');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(userData);
    fetchRoomData();
  }, [params.id]);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.CLASSROOM(params.id)));
      if (response.ok) {
        const data = await response.json();
        console.log('Room data:', data); // Debug log
        setRoom(data);
        setFiles(data.files || []);
        setEvents(data.events || []);
      } else {
        console.error('Failed to fetch room data');
      }
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClass = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.CLASSROOM_ARCHIVE(params.id)), {
        method: 'PUT',
      });
      if (response.ok) {
        alert('Class archived successfully');
        router.push('/dashboard');
      } else {
        alert('Failed to archive class');
      }
    } catch (error) {
      console.error('Error archiving class:', error);
      alert('Error archiving class');
    }
    setShowArchiveModal(false);
  };

  const handleDeleteClass = async () => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.CLASSROOM(params.id)), {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Class deleted successfully');
        router.push('/dashboard');
      } else {
        alert('Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class');
    }
    setShowDeleteModal(false);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await fetch(apiUrl(API_ENDPOINTS.DELETE_FILE(params.id, fileId)), {
        method: 'DELETE',
      });
      if (response.ok) {
        setFiles(files.filter(file => file._id !== fileId));
        alert('File deleted successfully');
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleFilesAdded = (newFiles) => {
    setFiles([...files, ...newFiles]);
    setShowAddFiles(false);
  };

  const handleEventAdded = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleDownloadFile = async (file) => {
    try {
      console.log('Downloading file:', file);
      
      if (file.type === 'youtube') {
        window.open(file.url, '_blank');
        return;
      }
      
      // Create download URL with download=true parameter
      const downloadUrl = `${apiUrl(API_ENDPOINTS.FILE_PROXY(params.id, file._id))}?download=true`;
      
      // Create a temporary link and click it to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Error downloading file: ${error.message}`);
    }
  };



  const filteredFiles = selectedUnit === 'All' 
    ? files 
    : files.filter(file => file.unit === selectedUnit);

  const units = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5'];

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!room) {
    return <div className={styles.error}>Room not found</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header with cover image */}
      <div className={styles.header}>
        <div className={styles.coverImageContainer}>
          {room.coverImage ? (
            <img src={room.coverImage} alt={room.name} className={styles.coverImage} />
          ) : (
            <div className={styles.placeholderCover}>
              <h2>{room.branch}</h2>
            </div>
          )}
          <div className={styles.coverOverlay}>
            <h1 className={styles.roomTitle}>{room.branch}</h1>
            <p className={styles.roomSubject}>{room.subject}</p>
          </div>
        </div>

        {/* Three dots menu - only for faculty */}
        {user?.role === 'faculty' && (
          <div className={styles.optionsContainer}>
            <button 
              className={styles.optionsButton}
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            >
              ⋮
            </button>
            {showOptionsMenu && (
              <div className={styles.optionsMenu}>
                <button 
                  className={styles.optionItem}
                  onClick={() => {
                    setShowCodeModal(true);
                    setShowOptionsMenu(false);
                  }}
                >
                  Class Code
                </button>
                <button 
                  className={styles.optionItem}
                  onClick={() => {
                    setShowArchiveModal(true);
                    setShowOptionsMenu(false);
                  }}
                >
                  Archive Class
                </button>
                <button 
                  className={styles.optionItem}
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowOptionsMenu(false);
                  }}
                >
                  Delete Class
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        {/* Files section (70%) */}
        <div className={styles.filesSection}>
          <div className={styles.filesHeader}>
            <h2>Course Materials</h2>
            {user?.role === 'faculty' && (
              <button 
                className={styles.addFilesButton}
                onClick={() => setShowAddFiles(true)}
              >
                + Add Files
              </button>
            )}
          </div>

          {/* Unit filter */}
          <div className={styles.unitFilter}>
            {units.map(unit => (
              <button
                key={unit}
                className={`${styles.unitButton} ${selectedUnit === unit ? styles.active : ''}`}
                onClick={() => setSelectedUnit(unit)}
              >
                {unit}
              </button>
            ))}
          </div>

          {/* Files grid */}
          <div className={styles.filesGrid}>
            {filteredFiles.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No files uploaded yet</p>
              </div>
            ) : (
              filteredFiles.map(file => (
                <div key={file._id} className={styles.fileCard}>
                  <div className={styles.fileIcon}>
                    {file.type === 'youtube' ? '📺' : 
                     file.type === 'pdf' ? '📄' : 
                     file.type === 'image' ? '🖼️' : '📁'}
                  </div>
                  <div className={styles.fileInfo}>
                    <h4 className={styles.fileName}>{file.name}</h4>
                    <p className={styles.fileUnit}>Unit: {file.unit}</p>
                    <p className={styles.fileDate}>
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.fileActions}>
                    <button 
                      className={styles.downloadButton}
                      onClick={() => handleDownloadFile(file)}
                      title="Download file"
                    >
                      Download
                    </button>
                    {user?.role === 'faculty' && (
                      <button 
                        className={styles.deleteButton}
                        onClick={() => handleDeleteFile(file._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Calendar section (30%) */}
        <div className={styles.calendarSection}>
          <Calendar 
            events={events}
            onEventAdded={handleEventAdded}
            canAddEvents={user?.role === 'faculty'}
            roomId={params.id}
          />
        </div>
      </div>

      {/* Modals */}
      {showCodeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCodeModal(false)}>
          <div className={styles.codeModal} onClick={(e) => e.stopPropagation()}>
            <h3>Class Code</h3>
            <div className={styles.codeDisplay}>
              <span className={styles.codeText}>
                {room.code || 'Code not available'}
              </span>
              <button 
                className={styles.copyButton}
                onClick={() => {
                  if (room.code) {
                    navigator.clipboard.writeText(room.code);
                    alert('Code copied to clipboard!');
                  } else {
                    alert('No code available to copy');
                  }
                }}
                disabled={!room.code}
              >
                Copy
              </button>
            </div>
            <p className={styles.codeDescription}>
              Share this code with students to let them join the class
            </p>
            <button 
              className={styles.closeButton}
              onClick={() => setShowCodeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAddFiles && (
        <AddFilesModal
          isOpen={showAddFiles}
          onClose={() => setShowAddFiles(false)}
          onFilesAdded={handleFilesAdded}
          roomId={params.id}
        />
      )}

      {showArchiveModal && (
        <ConfirmationModal
          isOpen={showArchiveModal}
          title="Archive Class"
          message="Are you sure you want to archive this class? Students will no longer be able to access it."
          onConfirm={handleArchiveClass}
          onCancel={() => setShowArchiveModal(false)}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Class"
          message="Are you sure you want to delete this class? This action cannot be undone."
          onConfirm={handleDeleteClass}
          onCancel={() => setShowDeleteModal(false)}
          isDangerous={true}
        />
      )}
    </div>
  );
}
