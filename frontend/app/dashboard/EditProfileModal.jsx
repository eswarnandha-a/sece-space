"use client";
import { useState, useRef } from 'react';
import styles from './EditProfileModal.module.css';

export default function EditProfileModal({ user, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    phone: user?.phone || '',
    github: user?.socialLinks?.github || '',
    linkedin: user?.socialLinks?.linkedin || '',
    portfolio: user?.socialLinks?.portfolio || '',
    resume: user?.socialLinks?.resume || '',
    bio: user?.bio || ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImage || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profileImageUrl = user?.profileImage;

      // Upload profile image if a new one is selected
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImage);

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://sece-space.onrender.com';
        const imageResponse = await fetch(`${baseUrl}/api/upload/profile-image`, {
          method: 'POST',
          body: imageFormData,
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          profileImageUrl = imageData.imageUrl;
        }
      }

      // Update user profile
      const updateData = {
        ...formData,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          resume: formData.resume
        },
        profileImage: profileImageUrl
      };

      const response = await fetch(`${baseUrl}/api/users/${user._id || user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        
        // Update localStorage with the updated user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Call onUpdate with the updated user data
        onUpdate(updatedUser);
        onClose();
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        alert('Failed to update profile: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit Profile</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Profile Image */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              {profileImagePreview ? (
                <img src={profileImagePreview} alt="Profile" className={styles.profileImage} />
              ) : (
                <div className={styles.defaultImage}>
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                className={styles.changeImageButton}
                onClick={() => fileInputRef.current?.click()}
              >
                Change Photo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.hiddenInput}
            />
          </div>

          {/* Basic Information */}
          <div className={styles.section}>
            <h3>Basic Information</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.section}>
            <h3>Social Links</h3>
            <div className={styles.field}>
              <label>GitHub Profile</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://github.com/username"
              />
            </div>
            <div className={styles.field}>
              <label>LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className={styles.field}>
              <label>Portfolio Website</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className={styles.field}>
              <label>Resume Link</label>
              <input
                type="url"
                name="resume"
                value={formData.resume}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="https://drive.google.com/file/resume.pdf"
              />
            </div>
          </div>

          {/* Bio */}
          <div className={styles.section}>
            <h3>About</h3>
            <div className={styles.field}>
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={styles.textarea}
                rows="4"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={styles.saveButton}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
