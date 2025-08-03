"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
      const userId = userData._id || userData.id; // Handle both _id and id
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
      const endpoint = userData.role === 'faculty' 
        ? `${baseUrl}/api/classrooms/faculty/${userId}`
        : `${baseUrl}/api/classrooms/student/${userId}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        setRooms(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch rooms:', response.status);
        setRooms([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    try {
      const userId = user._id || user.id; // Handle both _id and id
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
      const response = await fetch(`${baseUrl}/api/classrooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode, studentId: userId }),
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
          {!Array.isArray(rooms) || rooms.length === 0 ? (
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
                onClick={() => router.push(`/room/${room._id}`)}
              >
                <div className={styles.coverImageContainer}>
                  {room.coverImage ? (
                    <img src={room.coverImage} alt={room.name} className={styles.coverImage} />
                  ) : (
                    <div className={styles.placeholderCover}>
                      <div className={styles.placeholderContent}>
                        <span className={styles.placeholderIcon}>📚</span>
                      </div>
                    </div>
                  )}
                  <div className={styles.imageOverlay}>
                    <div className={styles.overlayContent}>
                      <div className={styles.roomInfo}>
                        <span className={styles.roomDepartment}>{room.branch}</span>
                        {room.subject && (
                          <span className={styles.roomSubject}> - {room.subject}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
