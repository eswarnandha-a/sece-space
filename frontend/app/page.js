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
          scene="https://prod.spline.design/Rhe0kLXU3i9yEfxk/scene.splinecode"
        />
      </div>
      
      <button 
        className={styles.loginButton}
        onClick={handleContinueToLogin}
      >
        Continue to Login
      </button>
    </div>
  );
}
