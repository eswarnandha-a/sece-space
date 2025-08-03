'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import styles from './page.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    rollNumber: '',
    year: '',
    department: '',
    branch: '',
    phone: '',
    
    // Social Links
    github: '',
    linkedin: '',
    portfolio: '',
    
    // Profile Image
    profileImage: '',
    
    // Bio
    bio: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Populate form with existing user data
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      rollNumber: parsedUser.rollNumber || '',
      year: parsedUser.year || '',
      department: parsedUser.department || '',
      branch: parsedUser.branch || '',
      phone: parsedUser.phone || '',
      github: parsedUser.socialLinks?.github || '',
      linkedin: parsedUser.socialLinks?.linkedin || '',
      portfolio: parsedUser.socialLinks?.portfolio || '',
      profileImage: parsedUser.profileImage || '',
      bio: parsedUser.bio || ''
    });
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setImageUploading(true);
    setError('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
      const response = await fetch(`${baseUrl}/api/upload/profile-image`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update form data with new image URL
      setFormData(prev => ({
        ...prev,
        profileImage: data.imageUrl
      }));

      setSuccess('Profile image uploaded successfully!');
    } catch (error) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${baseUrl}/api/auth/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          rollNumber: formData.rollNumber,
          year: formData.year,
          department: formData.department,
          branch: formData.branch,
          phone: formData.phone,
          socialLinks: {
            github: formData.github,
            linkedin: formData.linkedin,
            portfolio: formData.portfolio
          },
          profileImage: formData.profileImage,
          bio: formData.bio
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/auth/change-password/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
        </div>

        <div className={styles.tabContainer}>
          <button 
            className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            📝 Profile Details
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'password' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('password')}
          >
            🔒 Change Password
          </button>
        </div>

        {activeTab === 'profile' && (
          <form className={styles.form} onSubmit={handleProfileSubmit}>
            {/* Profile Picture Section */}
            <div className={styles.profilePictureSection}>
              <h3 className={styles.sectionTitle}>Profile Picture</h3>
              <div className={styles.profilePictureContainer}>
                <div className={styles.currentProfilePicture}>
                  {formData.profileImage ? (
                    <img 
                      src={formData.profileImage} 
                      alt="Profile" 
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.defaultProfileIcon}>
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    id="profileImageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                    disabled={imageUploading}
                  />
                  <label htmlFor="profileImageUpload" className={styles.uploadButton}>
                    {imageUploading ? 'Uploading...' : 'Choose Photo'}
                  </label>
                  {formData.profileImage && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                      className={styles.removeButton}
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className={styles.input}
                    disabled
                  />
                  <span className={styles.hint}>Email cannot be changed</span>
                </div>

                {user.role === 'student' && (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className={styles.input}
                      placeholder="Enter your roll number"
                    />
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., 2024, Final Year"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Branch/Specialization</label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="e.g., AI & ML, Web Development"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Social Links</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>GitHub Profile</label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>About</h3>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className={styles.textarea}
                  rows="4"
                  placeholder="Tell us about yourself, your interests, goals, etc."
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Updating...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form className={styles.form} onSubmit={handlePasswordSubmit}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Change Password</h3>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    required
                    placeholder="Enter current password"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    required
                    placeholder="Enter new password"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={styles.input}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton} disabled={loading}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
