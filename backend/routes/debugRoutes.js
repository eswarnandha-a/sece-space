const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const CloudinaryService = require('../services/cloudinaryService');

// Debug endpoint to list all classrooms and their files
router.get('/classrooms-files', async (req, res) => {
  try {
    const classrooms = await Classroom.find().select('_id branch subject files');
    
    const result = classrooms.map(classroom => ({
      classroomId: classroom._id,
      branch: classroom.branch,
      subject: classroom.subject,
      files: classroom.files.map(file => ({
        fileId: file._id,
        name: file.name,
        url: file.url,
        type: file.type
      }))
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test URL fixing function
router.get('/test-url-fix', (req, res) => {
  const testUrl = req.query.url;
  const testFilename = req.query.filename;
  
  if (!testUrl || !testFilename) {
    return res.status(400).json({ 
      error: 'Please provide url and filename as query parameters',
      example: '/api/debug/test-url-fix?url=https://res.cloudinary.com/dlknvduo8/image/upload/v1754111684/sece-space/room-documents/1754111679924-BYOL-PS.pdf&filename=BYOL-PS.pdf'
    });
  }
  
  const fixedUrl = CloudinaryService.fixCloudinaryUrl(testUrl, testFilename);
  
  res.json({
    original: testUrl,
    filename: testFilename,
    fixed: fixedUrl,
    changed: testUrl !== fixedUrl
  });
});

module.exports = router;
