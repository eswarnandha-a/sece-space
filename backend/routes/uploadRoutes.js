const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const multerMiddleware = require('../middleware/multerMiddleware');

// Profile image upload route
router.post('/profile-image', multerMiddleware.single('file'), uploadController.uploadProfileImage);

// File upload route
router.post('/file', multerMiddleware.single('file'), uploadController.uploadFile);

// YouTube link route
router.post('/youtube', uploadController.addYouTubeLink);

// Get resources for classroom
router.get('/classroom/:classroomId', uploadController.getClassroomResources);

// Delete resource
router.delete('/:id', uploadController.deleteResource);

module.exports = router;
