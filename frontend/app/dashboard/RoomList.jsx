"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '../components/Calendar';
import styles from './RoomList.module.css';

export default function RoomList({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchRooms(user);
    }
  }, [user]);

  const fetchRooms = async (userData) => {
    try {
      const endpoint = userData.role === 'faculty' 
        ? `http://localhost:5000/api/classrooms/faculty/${userData.id}`
        : `http://localhost:5000/api/classrooms/student/${userData.id}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/classrooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode, studentId: user.id }),
      });
      
      if (response.ok) {
        setJoinCode('');
        setShowJoinForm(false);
        fetchRooms(user); // Refresh the list
      } else {
        alert('Failed to join classroom');
      }
    } catch (error) {
      alert('Error joining classroom');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.roomsSection}>
        <div className={styles.header}>
          <h2>
            {user?.role === 'faculty' ? 'My Classrooms' : 'Joined Classrooms'}
          </h2>
          {user?.role === 'student' && (
            <button 
              className={styles.joinButton}
              onClick={() => setShowJoinForm(!showJoinForm)}
            >
              Join Classroom
            </button>
          )}
        </div>

        {showJoinForm && (
          <form onSubmit={handleJoinClassroom} className={styles.joinForm}>
            <input
              type="text"
              placeholder="Enter classroom code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              required
              className={styles.joinInput}
            />
            <button type="submit" className={styles.joinSubmit}>Join</button>
          </form>
        )}

        <div className={styles.roomsGrid}>
          {rooms.length === 0 ? (
            <div className={styles.emptyState}>
              <p>
                {user?.role === 'faculty' 
                  ? 'No classrooms created yet. Click "Create Room" to get started!'
                  : 'No classrooms joined yet. Use a classroom code to join!'
                }
              </p>
            </div>
          ) : (
            rooms.map(room => (
              <div 
                key={room._id} 
                className={styles.roomCard} 
                onClick={() => router.push(`/classroom/${room._id}`)}
              >
                <div className={styles.coverImage}>
                  {room.coverImage ? (
                    <img src={room.coverImage} alt={room.name} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <div className={styles.placeholderContent}>
                        <span className={styles.placeholderIcon}>📚</span>
                        <span className={styles.placeholderText}>{room.subject}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.roomTitle}>{room.name}</h3>
                  <p className={styles.roomCode}>Code: {room.code}</p>
                  {room.branch && (
                    <p className={styles.roomBranch}>Branch: {room.branch}</p>
                  )}
                  {room.subject && (
                    <p className={styles.roomSubject}>Subject: {room.subject}</p>
                  )}
                  {user?.role === 'faculty' && (
                    <p className={styles.studentCount}>
                      Students: {room.students?.length || 0}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className={styles.calendarSection}>
        <Calendar userRole={user?.role || 'student'} />
      </div>
    </div>
  );
}
