const cloudinary = require('../config/cloudinary');
const Classroom = require('../models/Classroom');
const CloudinaryService = require('../services/cloudinaryService');

// Simple proxy to serve files
exports.proxyFile = async (req, res) => {
  try {
    const { classroomId, fileId } = req.params;
    
    // Find the classroom and file
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    const file = classroom.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('Accessing file:', file.name, 'URL:', file.url);
    
    // For YouTube links, redirect
    if (file.type === 'youtube') {
      return res.redirect(file.url);
    }
    
    // For Cloudinary URLs, use Cloudinary SDK to get authenticated URL
    if (file.url.includes('cloudinary.com')) {
      try {
        // Extract public_id from the URL
        const urlParts = file.url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        
        if (uploadIndex > 0) {
          // Get everything after /upload/ (including version)
          const afterUpload = urlParts.slice(uploadIndex + 1).join('/');
          
          // Remove file extension to get clean public_id
          let publicId = afterUpload;
          const lastDotIndex = publicId.lastIndexOf('.');
          if (lastDotIndex > 0) {
            publicId = publicId.substring(0, lastDotIndex);
          }
          
          console.log('Extracted public_id:', publicId);
          
          // Try to use Cloudinary Admin API to get the file content
          try {
            console.log('Attempting to fetch file via Cloudinary Admin API...');
            
            // Get resource info first
            let resourceInfo;
            try {
              resourceInfo = await cloudinary.api.resource(publicId, {
                resource_type: 'image'
              });
            } catch (imageError) {
              console.log('Not found as image, trying raw...');
              resourceInfo = await cloudinary.api.resource(publicId, {
                resource_type: 'raw'
              });
            }
            
            console.log('Resource info obtained:', resourceInfo.secure_url);
            
            // Generate a signed URL with longer expiry
            const signedUrl = cloudinary.url(publicId, {
              resource_type: resourceInfo.resource_type,
              type: 'upload',
              secure: true,
              sign_url: true,
              expires_at: Math.floor(Date.now() / 1000) + 7200 // 2 hours expiry
            });
            
            console.log('Generated admin signed URL:', signedUrl);
            
            // Test the signed URL
            const testResponse = await fetch(signedUrl);
            if (testResponse.ok) {
              console.log('Admin signed URL works, redirecting...');
              return res.redirect(signedUrl);
            } else {
              console.log('Admin signed URL failed with status:', testResponse.status);
            }
            
          } catch (adminApiError) {
            console.log('Admin API approach failed:', adminApiError.message);
          }
        }
        
      } catch (cloudinaryError) {
        console.error('Cloudinary processing failed:', cloudinaryError);
      }
    }
    
    // Fallback: Try to stream through backend with authentication
    try {
      console.log('Attempting to stream file through backend from:', file.url);
      
      // Try to fetch with different approaches
      const fetchOptions = {
        headers: {
          'User-Agent': 'SECE-Space-Backend/1.0',
          'Accept': '*/*'
        }
      };
      
      const response = await fetch(file.url, fetchOptions);
      console.log('Fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('Fetch failed:', response.status, response.statusText);
        
        // If it's a 401/403, try to construct a different URL
        if (response.status === 401 || response.status === 403) {
          console.log('Access denied, trying alternative URL construction...');
          
          // Try the fixed URL approach as last resort
          const fixedUrl = CloudinaryService.fixCloudinaryUrl(file.url, file.name);
          if (fixedUrl !== file.url) {
            console.log('Trying fixed URL:', fixedUrl);
            const fixedResponse = await fetch(fixedUrl, fetchOptions);
            
            if (fixedResponse.ok) {
              console.log('Fixed URL worked, streaming...');
              const contentType = fixedResponse.headers.get('content-type') || 'application/octet-stream';
              const contentLength = fixedResponse.headers.get('content-length');
              
              res.setHeader('Content-Type', contentType);
              if (contentLength) {
                res.setHeader('Content-Length', contentLength);
              }
              // Set CORS headers for file serving
              const origin = req.headers.origin;
              const allowedOrigins = [
                'http://localhost:3000',
                'https://sece-space.vercel.app',
                'https://sece-space-git-main-eswarnandha-as-projects.vercel.app'
              ];
              if (allowedOrigins.includes(origin) || (origin && origin.includes('sece-space') && origin.includes('vercel.app'))) {
                res.setHeader('Access-Control-Allow-Origin', origin);
              } else {
                res.setHeader('Access-Control-Allow-Origin', '*');
              }
              res.setHeader('Cache-Control', 'public, max-age=3600');
              
              const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
              if (disposition === 'inline') {
                res.setHeader('Content-Disposition', 'inline');
              } else {
                res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
              }
              
              // Stream using Node.js built-in fetch
              const reader = fixedResponse.body.getReader();
              
              const pump = async () => {
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                  }
                  res.end();
                } catch (error) {
                  console.error('Error streaming fixed response:', error);
                  res.end();
                }
              };
              
              return pump();
            }
          }
        }
        
        // Return error response
        return res.status(response.status).json({ 
          message: 'File access denied', 
          error: `Cloudinary returned ${response.status}: ${response.statusText}`,
          suggestion: 'The file may not be publicly accessible. Please contact administrator.'
        });
      }
      
      // Set appropriate headers for successful response
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLength = response.headers.get('content-length');
      
      res.setHeader('Content-Type', contentType);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      // Set CORS headers for file serving
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:3000',
        'https://sece-space.vercel.app',
        'https://sece-space-git-main-eswarnandha-as-projects.vercel.app'
      ];
      if (allowedOrigins.includes(origin) || (origin && origin.includes('sece-space') && origin.includes('vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // For viewing, always use inline disposition (unless explicitly requesting download)
      const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
      if (disposition === 'inline') {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
      }
      
      console.log('Successfully streaming file:', file.name);
      // Stream the file using Node.js built-in fetch
      const reader = response.body.getReader();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
        } catch (error) {
          console.error('Error streaming file:', error);
          res.end();
        }
      };
      
      pump();
      
    } catch (fetchError) {
      console.error('Error fetching file:', fetchError);
      res.status(500).json({ 
        message: 'Error accessing file', 
        error: fetchError.message,
        fileUrl: file.url
      });
    }
    
  } catch (error) {
    console.error('Error in proxy file:', error);
    res.status(500).json({ message: 'Error accessing file', error: error.message });
  }
};

// Debug endpoint to test file access
exports.debugFile = async (req, res) => {
  try {
    const { classroomId, fileId } = req.params;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    const file = classroom.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Use built-in fetch (Node.js 18+)
    
    try {
      // Test fetch from Cloudinary
      const response = await fetch(file.url);
      
      res.json({
        fileInfo: {
          name: file.name,
          type: file.type,
          url: file.url,
          uploadDate: file.uploadDate
        },
        cloudinaryTest: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        }
      });
      
    } catch (fetchError) {
      res.json({
        fileInfo: {
          name: file.name,
          type: file.type,
          url: file.url,
          uploadDate: file.uploadDate
        },
        error: fetchError.message
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Debug error', error: error.message });
  }
};

// Get file info and return direct URL
exports.getFileInfo = async (req, res) => {
  try {
    const { classroomId, fileId } = req.params;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    const file = classroom.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Return file information
    res.json({
      name: file.name,
      type: file.type,
      url: file.url,
      viewUrl: `http://localhost:5000/api/files/classrooms/${classroomId}/files/${fileId}/proxy`,
      downloadUrl: `http://localhost:5000/api/files/classrooms/${classroomId}/files/${fileId}/proxy?download=true`,
      directUrl: file.url
    });
    
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ message: 'Error getting file info' });
  }
};

// Fix file access by making it publicly accessible
exports.fixFileAccess = async (req, res) => {
  try {
    const { classroomId, fileId } = req.params;
    
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }
    
    const file = classroom.files.id(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('Attempting to fix access for file:', file.name);
    
    // Extract public_id from the URL
    const urlParts = file.url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex > 0) {
      // Get everything after /upload/
      const afterUpload = urlParts.slice(uploadIndex + 1).join('/');
      
      // Remove file extension to get clean public_id
      let publicId = afterUpload;
      const lastDotIndex = publicId.lastIndexOf('.');
      if (lastDotIndex > 0) {
        publicId = publicId.substring(0, lastDotIndex);
      }
      
      console.log('Extracted public_id for fixing:', publicId);
      
      try {
        // Try to update the resource to make it public
        const result = await cloudinary.api.update(publicId, {
          resource_type: 'auto',
          access_mode: 'public'
        });
        
        console.log('Successfully made file public:', result.secure_url);
        
        // Update the file URL in the database if it changed
        if (result.secure_url !== file.url) {
          file.url = result.secure_url;
          await classroom.save();
        }
        
        res.json({
          message: 'File access fixed successfully',
          oldUrl: file.url,
          newUrl: result.secure_url,
          publicId: publicId
        });
        
      } catch (updateError) {
        console.error('Failed to update resource access:', updateError);
        
        // Try with raw resource type
        try {
          const rawResult = await cloudinary.api.update(publicId, {
            resource_type: 'raw',
            access_mode: 'public'
          });
          
          console.log('Successfully made raw file public:', rawResult.secure_url);
          
          if (rawResult.secure_url !== file.url) {
            file.url = rawResult.secure_url;
            await classroom.save();
          }
          
          res.json({
            message: 'File access fixed successfully (raw)',
            oldUrl: file.url,
            newUrl: rawResult.secure_url,
            publicId: publicId
          });
          
        } catch (rawUpdateError) {
          console.error('Failed to update raw resource access:', rawUpdateError);
          res.status(500).json({
            message: 'Failed to fix file access',
            error: rawUpdateError.message,
            publicId: publicId
          });
        }
      }
    } else {
      res.status(400).json({
        message: 'Could not extract public ID from URL',
        url: file.url
      });
    }
    
  } catch (error) {
    console.error('Error fixing file access:', error);
    res.status(500).json({ message: 'Error fixing file access', error: error.message });
  }
};
