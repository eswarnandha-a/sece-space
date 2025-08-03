const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Debug: Basic environment info
console.log('🚀 Starting SECE Space Backend...');
console.log('📁 Working directory:', process.cwd());
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Import database connection
let connectDB;
try {
  connectDB = require('./config/database');
  console.log('Successfully imported database config');
} catch (error) {
  console.error('Error importing database config:', error.message);
  // Fallback: create a simple database connection
  const mongoose = require('mongoose');
  connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/course-manager');
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      process.exit(1);
    }
  };
}

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://sece-space.vercel.app', // Production frontend
    'https://sece-space-git-main-eswarnandha-as-projects.vercel.app', // Vercel preview URLs
    'https://sece-space-*.vercel.app' // Any Vercel deployment
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - with error handling
let authRoutes, classroomRoutes, eventRoutes, uploadRoutes, facultyRoutes, studentRoutes, userRoutes, fileRoutes, debugRoutes;

try {
  authRoutes = require('./routes/authRoutes');
  classroomRoutes = require('./routes/classroomRoutes');
  eventRoutes = require('./routes/eventRoutes');
  uploadRoutes = require('./routes/uploadRoutes');
  facultyRoutes = require('./routes/facultyRoutes');
  studentRoutes = require('./routes/studentRoutes');
  userRoutes = require('./routes/userRoutes');
  fileRoutes = require('./routes/fileRoutes');
  debugRoutes = require('./routes/debugRoutes');
  console.log('All routes imported successfully');
} catch (error) {
  console.error('Error importing routes:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SECE Space Backend API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/debug', debugRoutes);

// Error handling middleware
try {
  const errorMiddleware = require('./middleware/errorMiddleware');
  app.use(errorMiddleware);
  console.log('Error middleware loaded successfully');
} catch (error) {
  console.error('Error loading error middleware:', error.message);
  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  });
}

module.exports = app;
