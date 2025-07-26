"use client";
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header({ user, onCreateRoom }) {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          {/* Add your logo image here */}
          <h2>SECE Space</h2>
        </div>
      </div>
      
      <div className={styles.right}>
        {user?.role === 'faculty' && (
          <button className={styles.createButton} onClick={onCreateRoom}>
            Create Room
          </button>
        )}
        
        <div className={styles.profile} onClick={handleProfileClick}>
          <div className={styles.profileIcon}>
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <span className={styles.profileName}>
            {user?.role === 'faculty' ? 'Faculty' : 'Student'}
          </span>
        </div>
      </div>
    </header>
  );
}
