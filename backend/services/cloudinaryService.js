const cloudinary = require('../config/cloudinary');

class CloudinaryService {
  /**
   * Upload profile image to cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} mimetype - File mimetype
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  static async uploadProfileImage(fileBuffer, mimetype) {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      folder: 'sece-space/profile-images',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload cover image to cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} mimetype - File mimetype
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  static async uploadCoverImage(fileBuffer, mimetype) {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      folder: 'sece-space/cover-images',
      transformation: [
        { width: 800, height: 400, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload document to cloudinary
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} mimetype - File mimetype
   * @param {string} originalname - Original filename
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  static async uploadDocument(fileBuffer, mimetype, originalname) {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'sece-space/documents',
      public_id: `${Date.now()}-${originalname.split('.')[0]}`,
      use_filename: true
    });
  }

  /**
   * Upload room image for course materials
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} mimetype - File mimetype
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  static async uploadRoomImage(fileBuffer, mimetype) {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: 'image',
      folder: 'sece-space/room-images',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload room document for course materials
   * @param {Buffer} fileBuffer - File buffer from multer
   * @param {string} mimetype - File mimetype
   * @param {string} originalname - Original filename
   * @returns {Promise<Object>} - Cloudinary upload result
   */
  static async uploadRoomDocument(fileBuffer, mimetype, originalname) {
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;
    
    // Determine resource type based on mimetype
    const isImage = mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: resourceType,
      folder: 'sece-space/room-documents',
      public_id: `${Date.now()}-${originalname.split('.')[0]}`,
      use_filename: true,
      access_mode: 'public'
    });
  }

  /**
   * Delete file from cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} - Deletion result
   */
  static async deleteFile(publicId) {
    return await cloudinary.uploader.destroy(publicId);
  }

  /**
   * Fix Cloudinary URL for proper file access
   * @param {string} url - Original Cloudinary URL
   * @param {string} filename - Original filename to determine file type
   * @returns {string} - Fixed URL for proper file access
   */
  static fixCloudinaryUrl(url, filename) {
    if (!url || !filename) return url;
    
    console.log('Fixing URL for file:', filename, 'Original URL:', url);
    
    // Check if it's a PDF or document file
    const fileExtension = filename.split('.').pop().toLowerCase();
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (documentExtensions.includes(fileExtension)) {
      // For documents uploaded as images, convert to raw/upload endpoint
      if (url.includes('/image/upload/')) {
        // Extract the public ID from the URL
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex > 0) {
          // Get everything after /upload/
          const afterUpload = urlParts.slice(uploadIndex + 1).join('/');
          
          // Remove any file extension from the public ID
          let publicId = afterUpload;
          const lastDotIndex = publicId.lastIndexOf('.');
          if (lastDotIndex > 0) {
            publicId = publicId.substring(0, lastDotIndex);
          }
          
          // Construct the raw URL
          const baseUrl = url.substring(0, url.indexOf('/image/upload/'));
          let fixedUrl = `${baseUrl}/raw/upload/${publicId}.${fileExtension}`;
          
          console.log('Converted image URL to raw URL:', fixedUrl);
          return fixedUrl;
        }
      }
      
      // For properly uploaded raw documents, ensure they have the correct extension
      if (url.includes('/raw/upload/')) {
        if (!url.includes(`.${fileExtension}`)) {
          const result = url + `.${fileExtension}`;
          console.log('Added extension to raw URL:', result);
          return result;
        }
        console.log('Raw URL looks good:', url);
        return url;
      }
      
      // Fallback: Try to construct a proper raw URL, but if it fails, we'll use attachment flag
      const urlParts = url.split('/');
      const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
      
      if (versionIndex > 0) {
        const version = urlParts[versionIndex];
        const publicIdParts = urlParts.slice(versionIndex + 1);
        const publicId = publicIdParts.join('/');
        
        console.log('Attempting to create raw URL for:', publicId);
        
        try {
          // Remove extension from publicId if it already exists to avoid double extensions
          let cleanPublicId = publicId;
          if (cleanPublicId.endsWith(`.${fileExtension}`)) {
            cleanPublicId = cleanPublicId.slice(0, -(fileExtension.length + 1));
          }
          
          const rawUrl = cloudinary.url(cleanPublicId, {
            resource_type: 'raw',
            type: 'upload',
            secure: true,
            version: version.substring(1), // Remove 'v' prefix as cloudinary.url adds it
            format: fileExtension
          });
          
          console.log('Generated raw URL (may not exist):', rawUrl);
          
          // For now, don't return the raw URL since we know it likely doesn't exist
          // Instead, use the attachment flag on the original URL
          let fallbackUrl = url.replace('/image/upload/', '/image/upload/fl_attachment/');
          console.log('Using attachment flag fallback instead:', fallbackUrl);
          return fallbackUrl;
          
        } catch (error) {
          console.log('Failed to generate raw URL, using attachment flag');
          let fallbackUrl = url.replace('/image/upload/', '/image/upload/fl_attachment/');
          return fallbackUrl;
        }
      }
    }
    
    console.log('No changes needed for URL:', url);
    return url;
  }
}

module.exports = CloudinaryService;
