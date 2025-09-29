import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Upload, X, User, Camera, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

const ProfilePictureUpload = ({ 
  profilePicture, 
  onUpload, 
  onDelete, 
  uploading = false, 
  deleting = false,
  disabled = false,
  className = "",
  size = "lg" // sm, md, lg, xl
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleFileSelect = (file) => {
    setError('');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    onUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading && !deleting) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      <Card className="w-fit">
        <CardContent className="p-4">
          <div 
            className={`
              ${sizeClasses[size]} 
              rounded-full 
              border-2 
              border-dashed 
              border-gray-300 
              flex 
              items-center 
              justify-center 
              overflow-hidden 
              cursor-pointer
              transition-all 
              duration-200
              ${dragOver ? 'border-blue-500 bg-blue-50' : ''}
              ${disabled || uploading || deleting ? 'cursor-not-allowed opacity-50' : 'hover:border-gray-400'}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin mb-1" />
                <span className="text-xs">Uploading...</span>
              </div>
            ) : profilePicture ? (
              <div className="relative w-full h-full group">
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
                {!disabled && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <User className="w-8 h-8 mb-1" />
                <span className="text-xs">No photo</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
        className="hidden"
        disabled={disabled || uploading || deleting}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || uploading || deleting}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {profilePicture ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {profilePicture && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={disabled || uploading || deleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Remove
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Drag and drop an image here or click to select</p>
        <p>• Supported formats: JPG, PNG, GIF</p>
        <p>• Maximum file size: 5MB</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
