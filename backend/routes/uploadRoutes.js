const express = require('express');
const router = express.Router();

// Import controllers
const ImageUploadController = require('../controllers/imageUploadController');
const DocumentUploadController = require('../controllers/documentUploadController');

// Import middleware
const { uploadProfileImage, uploadCoverImage, uploadDocument } = require('../middleware/upload/multerConfig');

// Image upload routes
router.post('/profile-image', 
  uploadProfileImage.single('file'), 
  ImageUploadController.uploadProfileImage
);

router.post('/cover-image', 
  uploadCoverImage.single('file'), 
  ImageUploadController.uploadCoverImage
);

// Document upload routes
router.post('/document', 
  uploadDocument.single('file'), 
  DocumentUploadController.uploadDocument
);

router.post('/youtube', 
  DocumentUploadController.addYouTubeLink
);

// Resource management routes
router.get('/classroom/:classroomId', 
  DocumentUploadController.getClassroomResources
);

router.delete('/resource/:id', 
  DocumentUploadController.deleteResource
);

// Legacy route for backward compatibility
router.post('/file', 
  uploadDocument.single('file'), 
  DocumentUploadController.uploadDocument
);

module.exports = router;
