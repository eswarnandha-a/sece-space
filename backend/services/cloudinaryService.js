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
    
    return await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'sece-space/room-documents',
      public_id: `${Date.now()}-${originalname.split('.')[0]}`,
      use_filename: true
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
}

module.exports = CloudinaryService;
