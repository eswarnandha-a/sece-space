const CloudinaryService = require('../services/cloudinaryService');

class ImageUploadController {
  /**
   * Upload profile image
   */
  static async uploadProfileImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const result = await CloudinaryService.uploadProfileImage(
        req.file.buffer, 
        req.file.mimetype
      );
      
      res.json({ 
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        message: 'Profile image uploaded successfully'
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload profile image' 
      });
    }
  }

  /**
   * Upload cover image for classroom
   */
  static async uploadCoverImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const result = await CloudinaryService.uploadCoverImage(
        req.file.buffer, 
        req.file.mimetype
      );
      
      res.json({ 
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        message: 'Cover image uploaded successfully'
      });
    } catch (error) {
      console.error('Cover image upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload cover image' 
      });
    }
  }

  /**
   * Upload room image for course materials
   */
  static async uploadRoomImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const result = await CloudinaryService.uploadRoomImage(
        req.file.buffer, 
        req.file.mimetype
      );
      
      res.json({ 
        success: true,
        url: result.secure_url,
        originalName: req.file.originalname,
        type: 'image',
        publicId: result.public_id,
        message: 'Room image uploaded successfully'
      });
    } catch (error) {
      console.error('Room image upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload room image' 
      });
    }
  }

  /**
   * Upload room document for course materials
   */
  static async uploadRoomDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }
      
      const result = await CloudinaryService.uploadRoomDocument(
        req.file.buffer, 
        req.file.mimetype,
        req.file.originalname
      );
      
      res.json({ 
        success: true,
        url: result.secure_url,
        originalName: req.file.originalname,
        type: 'document',
        publicId: result.public_id,
        message: 'Room document uploaded successfully'
      });
    } catch (error) {
      console.error('Room document upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload room document' 
      });
    }
  }
}

module.exports = ImageUploadController;
