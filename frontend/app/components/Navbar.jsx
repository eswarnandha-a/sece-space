"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ showCreateRoom = false, onCreateRoom }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.logo} onClick={handleDashboardClick}>
            <h2>SECE Space</h2>
          </div>
        </div>
        
        <div className={styles.right}>
          {user && (
            <>
              {showCreateRoom && user.role === 'faculty' && (
                <button className={styles.createButton} onClick={onCreateRoom}>
                  Create Room
                </button>
              )}
              
              <div className={styles.profile} onClick={handleProfileClick}>
                <div className={styles.profileIcon}>
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt="Profile" 
                      className={styles.profileImage}
                    />
                  ) : (
                    user.email?.[0]?.toUpperCase()
                  )}
                </div>
                <span className={styles.profileName}>
                  {user.role === 'faculty' ? 'Faculty' : 'Student'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
