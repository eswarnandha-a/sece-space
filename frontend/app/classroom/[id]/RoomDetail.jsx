
import { useState, useEffect } from 'react';
import MaterialsList from './MaterialsList';
import CalendarView from './CalendarView';
import Navbar from '../../components/Navbar';
import styles from './RoomDetail.module.css';

export default function RoomDetail({ classroomId }) {
  const [classroom, setClassroom] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchClassroomData();
  }, [classroomId]);

  const fetchClassroomData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/classrooms/${classroomId}`);
      
      if (response.ok) {
        const data = await response.json();
        setClassroom(data.classroom);
      } else {
        setError('Classroom not found');
      }
    } catch (error) {
      console.error('Error fetching classroom:', error);
      setError('Failed to load classroom');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className={styles.error}>
        <p>Classroom not found</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.header}>
        <div className={styles.classroomInfo}>
          <h1 className={styles.title}>{classroom.name}</h1>
          <div className={styles.details}>
            <span className={styles.code}>Code: {classroom.code}</span>
            <span className={styles.subject}>{classroom.subject}</span>
            <span className={styles.branch}>{classroom.branch}</span>
          </div>
          <p className={styles.facultyName}>
            Faculty: {classroom.faculty?.email || 'Unknown'}
          </p>
        </div>
        {classroom.coverImage && (
          <div className={styles.coverImageContainer}>
            <img 
              src={classroom.coverImage} 
              alt={classroom.name}
              className={styles.coverImage}
            />
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.materials}>
          <MaterialsList 
            classroomId={classroomId} 
            userRole={user?.role}
            userId={user?.id}
          />
        </div>
        <div className={styles.calendar}>
          <CalendarView 
            classroomId={classroomId}
            userRole={user?.role}
            userId={user?.id}
          />
        </div>
      </div>
    </div>
  );
}
