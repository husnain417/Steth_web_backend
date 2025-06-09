const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload file to Cloudinary with enhanced error handling
 * @param {string} filePath - Path to the local file
 * @param {string} folder - Cloudinary folder path
 * @param {object} options - Additional Cloudinary options
 * @returns {Promise} - Cloudinary upload response
 */
const uploadToCloudinary = async (filePath, folder, options = {}) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Check file size (optional client-side check)
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`Uploading file: ${filePath}, Size: ${fileSizeInMB.toFixed(2)}MB`);

    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto:best', // Optimize quality
      format: 'auto', // Auto-format selection
      timeout: 120000, // 2 minutes timeout
      ...options
    };

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
    console.log(`Successfully uploaded to Cloudinary: ${result.public_id}`);
    
    // Delete the local file after successful upload
    fs.unlinkSync(filePath);
    return result;
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Delete the local file if upload fails (cleanup)
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up local file: ${filePath}`);
      } catch (cleanupError) {
        console.error('Error cleaning up local file:', cleanupError);
      }
    }
    
    // Provide more specific error messages
    if (error.http_code === 413) {
      throw new Error('File too large for Cloudinary upload');
    } else if (error.http_code === 400) {
      throw new Error('Invalid file format or corrupted file');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Upload timeout - file may be too large or connection slow');
    }
    
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary with batch processing
 * @param {Array} filePaths - Array of file paths
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleToCloudinary = async (filePaths, folder) => {
  const results = [];
  const errors = [];

  for (const filePath of filePaths) {
    try {
      const result = await uploadToCloudinary(filePath, folder);
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload ${filePath}:`, error.message);
      errors.push({ filePath, error: error.message });
    }
  }

  if (errors.length > 0) {
    console.warn(`${errors.length} files failed to upload:`, errors);
  }

  return { results, errors };
};

module.exports = { 
  uploadToCloudinary, 
  uploadMultipleToCloudinary 
};