'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import styles from './page.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSocialLink = (url) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar />
      
      {/* Top Section - White Background */}
      <div className={styles.topSection}>
        <div className={styles.profileHeader}>
          <div className={styles.profileImageContainer}>
            {user.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.defaultProfileIcon}>
                {user.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          
          <div className={styles.profileInfo}>
            <div className={styles.userBasicInfo}>
              <h1 className={styles.userName}>{user.name || 'User Name'}</h1>
              <p className={styles.userEmail}>{user.email}</p>
              <p className={styles.userDetails}>{user.rollNumber || '23AM018'}</p>
              <p className={styles.userDetails}>{user.phone || 'Phone not provided'}</p>
            </div>
            
            {/* Social Buttons - Below user info */}
            <div className={styles.socialButtons}>
              <button 
                className={styles.socialBtn}
                onClick={() => handleSocialLink(user.socialLinks?.github)}
                disabled={!user.socialLinks?.github}
              >
                <img src="/github.png" alt="" className={styles.socialBtnIcon} />
                Github
              </button>
              <button 
                className={styles.socialBtn}
                onClick={() => handleSocialLink(user.socialLinks?.linkedin)}
                disabled={!user.socialLinks?.linkedin}
              >
                <img src="/linkedin.png" alt="" className={styles.socialBtnIcon} />
                Linkedin
              </button>
              <button className={styles.socialBtn}>
                <img src="/resume.png" alt="" className={styles.socialBtnIcon} />
                Resume
              </button>
              <button 
                className={styles.socialBtn}
                onClick={() => handleSocialLink(user.socialLinks?.portfolio)}
                disabled={!user.socialLinks?.portfolio}
              >
                <img src="/portfolio.png" alt="" className={styles.socialBtnIcon} />
                Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Blue Background */}
      <div className={styles.bottomSection}>
        <div className={styles.bottomContent}>
          <div className={styles.brandSection}>
            <h2 className={styles.brandTitle}>SECE Space</h2>
            <p className={styles.brandSubtitle}>Connecting Classrooms<br />Streamlining Success</p>
          </div>
          
          <div className={styles.middleSection}>
            <div className={styles.middleContent}>
              <p className={styles.facultyRemarks}>Faculty remarks</p>
              <p className={styles.achievedClasses}>Achieved Classes</p>
            </div>
            
            <div className={styles.toggleSection}>
              <span className={styles.themeSettingsText}>Theme Settings</span>
            </div>
            
            <div className={styles.footerLinks}>
              <a href="#" className={styles.footerLink}>FAQ</a>
              <a href="#" className={styles.footerLink}>Help</a>
              <a href="#" className={styles.footerLink}>About</a>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionBtn}
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
            <button 
              className={styles.actionBtn}
              onClick={() => setShowPasswordModal(true)}
            >
              Change pass
            </button>
            <button 
              className={styles.actionBtn}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
