// API utility functions
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  PROFILE: (userId) => `/api/auth/profile/${userId}`,
  CHANGE_PASSWORD: (userId) => `/api/auth/change-password/${userId}`,
  
  // Users
  USER: (userId) => `/api/users/${userId}`,
  
  // Classrooms
  CLASSROOMS: '/api/classrooms',
  CLASSROOM: (id) => `/api/classrooms/${id}`,
  CLASSROOM_ARCHIVE: (id) => `/api/classrooms/${id}/archive`,
  CLASSROOM_JOIN: '/api/classrooms/join',
  FACULTY_CLASSROOMS: (userId) => `/api/classrooms/faculty/${userId}`,
  STUDENT_CLASSROOMS: (userId) => `/api/classrooms/student/${userId}`,
  
  // Files
  CLASSROOM_FILES: (classroomId) => `/api/classrooms/${classroomId}/files`,
  DELETE_FILE: (classroomId, fileId) => `/api/classrooms/${classroomId}/files/${fileId}`,
  FILE_PROXY: (classroomId, fileId) => `/api/files/classrooms/${classroomId}/files/${fileId}/proxy`,
  
  // Events
  CLASSROOM_EVENTS: (classroomId) => `/api/classrooms/${classroomId}/events`,
  
  // Resources
  CLASSROOM_RESOURCES: (classroomId) => `/api/classrooms/${classroomId}/resources`,
  
  // Upload
  UPLOAD: '/api/upload',
  UPLOAD_COVER_IMAGE: '/api/upload/cover-image',
  UPLOAD_PROFILE_IMAGE: '/api/upload/profile-image',
  UPLOAD_ROOM_IMAGE: '/api/upload/room-image',
  UPLOAD_ROOM_DOCUMENT: '/api/upload/room-document',
};