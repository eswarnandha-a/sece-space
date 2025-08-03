const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

// Proxy file through backend (handles both view and download)
router.get('/classrooms/:classroomId/files/:fileId/proxy', fileController.proxyFile);

// Get file information
router.get('/classrooms/:classroomId/files/:fileId/info', fileController.getFileInfo);

// Debug file access
router.get('/classrooms/:classroomId/files/:fileId/debug', fileController.debugFile);

// Fix file access (make public)
router.post('/classrooms/:classroomId/files/:fileId/fix-access', fileController.fixFileAccess);

module.exports = router;
