"use client";
import { useRouter } from 'next/navigation';
import Spline from '@splinetool/react-spline';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  const handleContinueToLogin = () => {
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.splineContainer}>
        <Spline
          scene="https://prod.spline.design/qf63BQ7C7Iydl21r/scene.splinecode"
        />
      </div>
      
      <button 
        className={styles.getStartedButton}
        onClick={handleContinueToLogin}
      >
        Get Started
      </button>

      <div className={styles.textContainer}>
        <h1 className={styles.gradientText}>
          Welcome to Space of SECE
        </h1>
      </div>
    </div>
  );
}
