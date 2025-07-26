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
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar 
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
