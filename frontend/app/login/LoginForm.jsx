"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if password is correct
    if (password !== 'SECE@123') {
      setError('Invalid password. Default password is SECE@123');
      setLoading(false);
      return;
    }

    // Construct email based on role selection
    const fullEmail = email.includes('@') ? email : `${email}@${role}.com`;

    if (!fullEmail.endsWith('@faculty.com') && !fullEmail.endsWith('@student.com')) {
      setError('Please use a valid email format.');
      setLoading(false);
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fullEmail }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Sign In</h2>
        <p className={styles.subtitle}>Welcome back! Please sign in to your account</p>
      </div>
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.roleSelection}>
          <div className={styles.toggleContainer}>
            <div 
              className={`${styles.toggle} ${role === 'faculty' ? styles.toggleActive : ''}`}
              onClick={() => setRole(role === 'student' ? 'faculty' : 'student')}
            >
              <div className={`${styles.toggleOption} ${role === 'student' ? styles.selected : ''}`}>
                Student
              </div>
              <div className={`${styles.toggleOption} ${role === 'faculty' ? styles.selected : ''}`}>
                Faculty
              </div>
              <div className={`${styles.toggleSlider} ${role === 'faculty' ? styles.sliderRight : styles.sliderLeft}`}></div>
            </div>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email</label>
          <div className={styles.emailContainer}>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              className={styles.emailInput}
            />
            <span className={styles.emailSuffix}>@{role}.com</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              className={styles.passwordInput}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.45703 12C3.73128 7.94291 7.52159 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C20.2672 16.0571 16.4769 19 11.9992 19C7.52159 19 3.73128 16.0571 2.45703 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          <p className={styles.passwordHint}>Default password: SECE@123</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
        >
          {loading ? (
            <span className={styles.spinner}></span>
          ) : (
            'Sign In'
          )}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
}
