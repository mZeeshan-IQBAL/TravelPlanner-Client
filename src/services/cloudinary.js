import { Cloudinary } from '@cloudinary/url-gen';

// Initialize Cloudinary
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
  }
});

/**
 * Upload image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  
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
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
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

    return {
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl: cloudinary.image(result.public_id)
        .resize('w_50,h_50,c_fill')
        .format('auto')
        .quality('auto')
        .toURL(),
      mediumUrl: cloudinary.image(result.public_id)
        .resize('w_100,h_100,c_fill')
        .format('auto')
        .quality('auto')
        .toURL(),
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
  let image = cloudinary.image(publicId);

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

export default cloudinary;