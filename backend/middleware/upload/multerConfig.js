const multer = require('multer');

// Memory storage for cloudinary uploads
const storage = multer.memoryStorage();

// File filter for images only (cover images)
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, JPG, WEBP images are allowed.'), false);
  }
};

// File filter for documents and images
const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf', 
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', 
    'image/png',
    'image/jpg'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPEG, PNG files are allowed.'), false);
  }
};

// Upload middleware for cover images
const uploadCoverImage = multer({ 
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
});

// Upload middleware for profile images
const uploadProfileImage = multer({ 
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for profile images
  }
});

// Upload middleware for documents
const uploadDocument = multer({ 
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

module.exports = {
  uploadCoverImage,
  uploadProfileImage,
  uploadDocument
};
