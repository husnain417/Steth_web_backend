const { imagekit } = require('../config/imageKit');
const fs = require('fs');

/**
 * Upload file to ImageKit
 * @param {string} filePath - Path to the local file
 * @param {string} folder - ImageKit folder path
 * @param {string} fileName - Name for the uploaded file
 * @returns {Promise} - ImageKit upload response
 */
const uploadToImageKit = async (filePath, folder, fileName) => {
  try {
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    
    // Generate a unique filename if not provided
    const uniqueFileName = fileName || `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: uniqueFileName,
      folder: folder,
      useUniqueFileName: true
    });
    
    // Delete the local file after upload
    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    // Delete the local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Delete file from ImageKit
 * @param {string} fileId - ImageKit file ID
 * @returns {Promise} - ImageKit delete response
 */
const deleteFromImageKit = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { uploadToImageKit, deleteFromImageKit };