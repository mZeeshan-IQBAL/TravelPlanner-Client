import { Cloudinary } from '@cloudinary/url-gen';
import { getPublicConfig, getCachedPublicConfig } from './publicConfig';

// Lazily created Cloudinary instance. Never create at import time so we don't crash on missing env.
let cldInstance = null;

function ensureCloudinarySync() {
  if (cldInstance) return cldInstance;
  const cfg = getCachedPublicConfig();
  const cloudName = cfg?.cloudinaryCloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  cldInstance = new Cloudinary({ cloud: { cloudName } });
  return cldInstance;
}

async function getCloudinaryAsync() {
  const cfg = await getPublicConfig();
  const cloudName = cfg?.cloudinaryCloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  if (cldInstance) return cldInstance;
  cldInstance = new Cloudinary({ cloud: { cloudName } });
  return cldInstance;
}

/**
 * Upload image to Cloudinary (unsigned or via preset)
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  const cfg = await getPublicConfig();
  const uploadPreset = cfg?.cloudinaryUploadPreset || process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = cfg?.cloudinaryCloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

  if (uploadPreset) {
    formData.append('upload_preset', uploadPreset);
  }
  
  // Add transformation options
  if (options.width && options.height) {
    formData.append('width', options.width);
    formData.append('height', options.height);
    formData.append('crop', options.crop || 'fill');
  }
  
  // Add folder for organization
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  // Add tags for better management
  if (options.tags) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    if (!cloudName) throw new Error('Missing Cloudinary cloudName');
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload avatar image with specific transformations
 * @param {File} file - The avatar image file
 * @param {string} userId - User ID for organizing uploads
 * @returns {Promise<Object>} Upload result with avatar URLs
 */
export const uploadAvatar = async (file, userId) => {
  try {
    const result = await uploadImage(file, {
      folder: `avatars/${userId}`,
      width: 200,
      height: 200,
      crop: 'fill',
      tags: ['avatar', 'profile']
    });

    const cld = await getCloudinaryAsync();

    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl: cld ? cld.image(result.public_id)
        .resize('w_50,h_50,c_fill')
        .format('auto')
        .quality('auto')
        .toURL() : result.secure_url,
      mediumUrl: cld ? cld.image(result.public_id)
        .resize('w_100,h_100,c_fill')
        .format('auto')
        .quality('auto')
        .toURL() : result.secure_url,
      largeUrl: result.secure_url
    };
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    // Note: For security reasons, deletion should typically be handled on the backend
    // This is a placeholder for the frontend interface
    const response = await fetch('/api/images/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ publicId })
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Image deletion error:', error);
    throw error;
  }
};

/**
 * Generate transformed image URL
 * @param {string} publicId - The public ID of the image
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Transformed image URL
 */
export const getTransformedImageUrl = (publicId, transformations = {}) => {
  const cld = ensureCloudinarySync();
  if (!cld) {
    // No config yet; skip building a URL and let the caller render a fallback.
    return '';
  }
  let image = cld.image(publicId);

  if (transformations.width && transformations.height) {
    image = image.resize(`w_${transformations.width},h_${transformations.height},c_${transformations.crop || 'fill'}`);
  }

  if (transformations.quality) {
    image = image.quality(transformations.quality);
  }

  if (transformations.format) {
    image = image.format(transformations.format);
  } else {
    image = image.format('auto');
  }

  return image.toURL();
};

/**
 * Generate avatar URL with default transformations
 * @param {string} publicId - The public ID of the avatar
 * @param {string} size - Size preset (small, medium, large)
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (publicId, size = 'medium') => {
  const sizeMap = {
    small: { width: 32, height: 32 },
    medium: { width: 64, height: 64 },
    large: { width: 128, height: 128 },
    xlarge: { width: 200, height: 200 }
  };

  const dimensions = sizeMap[size] || sizeMap.medium;
  
  return getTransformedImageUrl(publicId, {
    ...dimensions,
    crop: 'fill',
    quality: 'auto',
    format: 'auto'
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {Object} Validation result
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large (max 10MB)' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Please use JPEG, PNG, WebP, or GIF' };
  }

  return { isValid: true };
};

// Named getters are preferred to avoid accidental early initialization.
export { ensureCloudinarySync as getCloudinarySync, getCloudinaryAsync };

// Provide a benign default export to avoid React Refresh probing noise.
// Not intended for use; kept only to avoid breaking imports if any exist.
const noopDefault = {};
export default noopDefault;
