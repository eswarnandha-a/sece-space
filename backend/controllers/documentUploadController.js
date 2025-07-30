const CloudinaryService = require('../services/cloudinaryService');
const Resource = require('../models/Resource');

class DocumentUploadController {
  /**
   * Upload document/file to classroom
   */
  static async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const { classroomId } = req.body;
      
      if (!classroomId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Classroom ID is required' 
        });
      }
      
      const result = await CloudinaryService.uploadDocument(
        req.file.buffer, 
        req.file.mimetype,
        req.file.originalname
      );
      
      // Save to database
      const resource = await Resource.create({
        classroom: classroomId,
        type: 'file',
        url: result.secure_url,
        filename: req.file.originalname,
        publicId: result.public_id
      });
      
      res.status(201).json({
        success: true,
        resource,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload document' 
      });
    }
  }

  /**
   * Add YouTube link to classroom
   */
  static async addYouTubeLink(req, res) {
    try {
      const { classroomId, url, title } = req.body;
      
      if (!classroomId || !url) {
        return res.status(400).json({ 
          success: false, 
          message: 'Classroom ID and URL are required' 
        });
      }
      
      const resource = await Resource.create({
        classroom: classroomId,
        type: 'youtube',
        url,
        filename: title || 'YouTube Video'
      });
      
      res.status(201).json({
        success: true,
        resource,
        message: 'YouTube link added successfully'
      });
    } catch (error) {
      console.error('YouTube link add error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add YouTube link' 
      });
    }
  }

  /**
   * Get resources for a classroom
   */
  static async getClassroomResources(req, res) {
    try {
      const { classroomId } = req.params;
      
      const resources = await Resource.find({ classroom: classroomId })
        .populate('classroom', 'name code')
        .sort({ uploadedAt: -1 });
      
      res.json({
        success: true,
        resources
      });
    } catch (error) {
      console.error('Get resources error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get resources' 
      });
    }
  }

  /**
   * Delete resource
   */
  static async deleteResource(req, res) {
    try {
      const { id } = req.params;
      
      const resource = await Resource.findById(id);
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        });
      }

      // Delete from cloudinary if it has a public ID
      if (resource.publicId) {
        await CloudinaryService.deleteFile(resource.publicId);
      }

      // Delete from database
      await Resource.findByIdAndDelete(id);
      
      res.json({ 
        success: true, 
        message: 'Resource deleted successfully' 
      });
    } catch (error) {
      console.error('Delete resource error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete resource' 
      });
    }
  }
}

module.exports = DocumentUploadController;
