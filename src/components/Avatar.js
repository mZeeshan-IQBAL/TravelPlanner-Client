import React, { useEffect, useMemo, useState, useRef } from 'react';
import { uploadAvatar, getAvatarUrl, validateImageFile } from '../services/cloudinary';
import { getCachedPublicConfig, loadPublicConfig } from '../services/publicConfig';
import { useAuth } from '../context/AuthContext';

const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'medium', 
  editable = false, 
  showOnlineStatus = false,
  className = '',
  onClick,
  ...props 
}) => {
  const { user, updateUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Track when Cloudinary config is available so we only attempt transforms then
  const initialCfg = getCachedPublicConfig();
  const [cfgReady, setCfgReady] = useState(!!(initialCfg?.cloudinaryCloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME));
  useEffect(() => {
    if (!cfgReady) {
      loadPublicConfig().then(cfg => {
        if (cfg?.cloudinaryCloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME) {
          setCfgReady(true);
        }
      }).catch(() => {});
    }
  }, [cfgReady]);

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base',
    xlarge: 'w-24 h-24 text-lg'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setUploadError(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const result = await uploadAvatar(file, user._id);
      
      // Update user profile with new avatar
      await updateUser({
        avatar: {
          publicId: result.publicId,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          mediumUrl: result.mediumUrl,
          largeUrl: result.largeUrl
        }
      });
      
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setUploadError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (editable && !isUploading) {
      fileInputRef.current?.click();
    } else if (onClick) {
      onClick();
    }
  };

  const getAvatarSrc = () => {
    if (src) {
      // If it's a Cloudinary public ID, generate the transformed URL
      if (typeof src === 'string' && !src.startsWith('http')) {
        // Only attempt when config is ready
        if (!cfgReady) return null;
        const url = getAvatarUrl(src, size);
        return url || null;
      }
      return src;
    }
    
    if (user?.avatar?.publicId) {
      if (!cfgReady) return null;
      const url = getAvatarUrl(user.avatar.publicId, size);
      return url || null;
    }
    
    return null;
  };

  const avatarSrc = useMemo(getAvatarSrc, [src, size, user?.avatar?.publicId, cfgReady]);
  const displayName = alt === 'Avatar' ? (user?.username || user?.name || 'User') : alt;

  return (
    <div className={`relative inline-block ${className}`} {...props}>
      {/* Avatar Container */}
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-full overflow-hidden cursor-pointer transition-all duration-200 
          ${editable ? 'hover:opacity-80 hover:ring-2 hover:ring-primary-300' : ''}
          ${isUploading ? 'opacity-50' : ''}
          ${onClick || editable ? 'cursor-pointer' : 'cursor-default'}
          relative group
        `}
        onClick={handleAvatarClick}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Initials Fallback */}
        <div
          className={`
            w-full h-full bg-gradient-to-br from-primary-500 to-wanderlog-orange 
            flex items-center justify-center text-white font-bold
            ${avatarSrc ? 'hidden' : 'flex'}
          `}
        >
          {getInitials(displayName)}
        </div>

        {/* Upload Overlay */}
        {editable && !isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )}

        {/* Loading Spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-wanderlog-green border-2 border-white rounded-full"></div>
      )}

      {/* File Input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="absolute top-full left-0 mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-xs whitespace-nowrap z-10">
          {uploadError}
        </div>
      )}
    </div>
  );
};

// Avatar Group Component for showing multiple users
export const AvatarGroup = ({ users = [], maxVisible = 4, size = 'medium', className = '' }) => {
  const displayUsers = users.slice(0, maxVisible);
  const extraCount = users.length - maxVisible;

  const sizeClasses = {
    small: 'w-6 h-6 text-xs -ml-1',
    medium: 'w-8 h-8 text-xs -ml-2',
    large: 'w-10 h-10 text-sm -ml-2',
    xlarge: 'w-12 h-12 text-base -ml-3'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {displayUsers.map((user, index) => (
        <div
          key={user._id || user.id || index}
          className={`
            ${sizeClasses[size]} 
            rounded-full border-2 border-white relative z-${10 - index}
            ${index > 0 ? '-ml-2' : ''}
          `}
          style={{ zIndex: displayUsers.length - index }}
        >
          <Avatar
            src={user.avatar?.publicId || user.avatar?.url}
            alt={user.username || user.name}
            size={size}
            className="w-full h-full"
          />
        </div>
      ))}
      
      {extraCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full bg-secondary-200 dark:bg-secondary-700 
            flex items-center justify-center text-secondary-600 dark:text-secondary-300 
            font-medium border-2 border-white -ml-2
          `}
        >
          +{extraCount}
        </div>
      )}
    </div>
  );
};

// Collaboration Indicator - shows user avatars for active collaboration
export const CollaborationIndicator = ({ activeUsers = [], className = '' }) => {
  if (activeUsers.length === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-wanderlog-green rounded-full animate-pulse"></div>
        <span className="text-xs text-secondary-500 dark:text-secondary-400">
          Live collaboration
        </span>
      </div>
      <AvatarGroup users={activeUsers} size="small" maxVisible={3} />
    </div>
  );
};

export default Avatar;