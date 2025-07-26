"use client";
import LoginForm from './LoginForm';
import styles from './page.module.css';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { 
  ssr: false,
  loading: () => <div className={styles.loadingAnimation}>Loading...</div>
});

// Import your Lottie animation data
import collegegraduationData from '../../public/collegegraduation.json';

export default function LoginPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isExtraSmall, setIsExtraSmall] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsExtraSmall(window.innerWidth <= 400);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const getLottieSize = () => {
    if (isExtraSmall) return '240px';
    if (isMobile) return '280px';
    return '500px';
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={styles.lottieContainer}>
          <Lottie 
            animationData={collegegraduationData}
            style={{
              height: getLottieSize(),
              width: getLottieSize(),
            }}
            loop={true}
            speed={0.5}
          />
        </div>
        <div className={styles.animationContainer}>
          <h1 className={styles.title}>SECE Space</h1>
          <p className={styles.subtitle}>Connecting Classrooms, Streamlining Success</p>
        </div>
      </div>
      <div className={styles.rightSection}>
        <LoginForm />
      </div>
    </div>
  );
}
