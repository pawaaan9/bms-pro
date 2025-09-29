import React from 'react';
import { User } from 'lucide-react';

const ProfilePicture = ({ 
  profilePicture, 
  name, 
  size = "md", 
  className = "",
  showFallback = true 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (profilePicture) {
    return (
      <img 
        src={profilePicture} 
        alt={name || "Profile"} 
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  if (showFallback) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center ${className}`}>
        {name ? (
          <span className={`${textSizeClasses[size]} font-medium text-gray-600`}>
            {name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <User className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
        )}
      </div>
    );
  }

  return null;
};

export default ProfilePicture;
