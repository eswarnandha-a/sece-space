const cloudinary = require('../utility/cloudinary');
const Resource = require('../models/Resource');

// Upload profile image to Cloudinary
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      folder: 'profile-images',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    res.json({ 
      imageUrl: result.secure_url,
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
};

// Upload file to Cloudinary
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { classroomId } = req.body;
    
    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    
    // Check if this is an image (for cover image) or other file
    const isImage = req.file.mimetype.startsWith('image/');
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: isImage ? 'image' : 'auto',
      folder: isImage ? 'cover-images' : 'course-manager',
      ...(isImage && {
        transformation: [
          { width: 400, height: 200, crop: 'fill' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })
    });
    
    // If it's a cover image, just return the URL
    if (isImage && classroomId === 'temp') {
      return res.json({ 
        url: result.secure_url,
        message: 'Cover image uploaded successfully'
      });
    }
    
    // Save to database for regular files
    const resource = await Resource.create({
      classroom: classroomId,
      type: 'file',
      url: result.secure_url,
      filename: req.file.originalname
    });
    
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add YouTube link
exports.addYouTubeLink = async (req, res) => {
  try {
    const { classroomId, url, title } = req.body;
    
    const resource = await Resource.create({
      classroom: classroomId,
      type: 'youtube',
      url,
      filename: title || 'YouTube Video'
    });
    
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get resources for a classroom
exports.getClassroomResources = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const resources = await Resource.find({ classroom: classroomId })
      .populate('classroom', 'name code')
      .sort({ uploadedAt: -1 });
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete resource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await Resource.findByIdAndDelete(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
