"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RoomList from './RoomList';
import Navbar from '../components/Navbar';
import CreateRoomModal from './CreateRoomModal';
import styles from './page.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      
      try {
        // Fetch fresh data from database
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
        const response = await fetch(`${baseUrl}/api/users/${parsedUser._id}`);
        if (response.ok) {
          const freshUserData = await response.json();
          setUser(freshUserData);
          // Update localStorage with fresh data from database
          localStorage.setItem('user', JSON.stringify(freshUserData));
        } else {
          // Fallback to localStorage data if API fails
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage data if API fails
        setUser(parsedUser);
      }
    };

    fetchUserData();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar 
        user={user}
        showCreateRoom={true}
        onCreateRoom={() => setShowCreateRoom(true)}
      />
      <main className={styles.main}>
        <RoomList user={user} />
      </main>
      
      {showCreateRoom && (
        <CreateRoomModal 
          user={user}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
    </div>
  );
}
