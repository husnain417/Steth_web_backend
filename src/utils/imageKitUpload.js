const { imagekit } = require('../config/imageKit');
const fs = require('fs');
const path = require('path');

/**
 * Upload file to ImageKit
 * @param {string} filePath - Path to the local file
 * @param {string} folder - ImageKit folder path
 * @returns {Promise} - ImageKit upload response
 */
const uploadToImageKit = async (filePath, folder) => {
  try {
    const fileName = path.basename(filePath);
    const folderPath = folder ? `${folder}/${fileName}` : fileName;
    
    const result = await imagekit.upload({
      file: fs.createReadStream(filePath),
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true
    });
    
    // Delete the local file after upload
    fs.unlinkSync(filePath);
    
    // Return result in similar format to Cloudinary for compatibility
    return {
      secure_url: result.url,
      public_id: result.fileId,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      height: result.height,
      width: result.width
    };
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