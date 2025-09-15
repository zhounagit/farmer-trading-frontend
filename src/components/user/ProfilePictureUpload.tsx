import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { CameraAlt, Delete, CloudUpload, Cancel } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

interface ProfilePictureUploadProps {
  size?: 'small' | 'medium' | 'large';
  editable?: boolean;
  showUploadButton?: boolean;
  onUploadSuccess?: (profilePictureUrl: string) => void;
  onUploadError?: (error: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  size = 'medium',
  editable = true,
  showUploadButton = false,
  onUploadSuccess,
  onUploadError,
}) => {
  const { user, updateProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarSize = () => {
    switch (size) {
      case 'small':
        return { width: 40, height: 40, fontSize: '1rem' };
      case 'large':
        return { width: 100, height: 100, fontSize: '2rem' };
      default:
        return { width: 60, height: 60, fontSize: '1.5rem' };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await apiService.uploadProfilePicture(
        user.userId,
        file,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Update user profile with new picture URL
      await updateProfile({
        profilePictureUrl: result.profilePictureUrl,
      });

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(result.profilePictureUrl);
      }

      setUploading(false);
    } catch (error: unknown) {
      console.error('Profile picture upload failed:', error);

      const errorObj = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      let errorMessage = 'Failed to upload profile picture';

      // Handle 404 error (endpoint not implemented)
      if (errorObj.response?.status === 404) {
        errorMessage =
          'Profile picture upload is not yet available on this server. The feature is in development.';
        console.info('ℹ️ Profile picture endpoint not implemented yet');
      } else {
        errorMessage =
          errorObj.response?.data?.message ||
          errorObj.message ||
          'Failed to upload profile picture';
      }

      setError(errorMessage);

      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      if (onUploadError) {
        onUploadError(errorMessage);
      }

      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!user) return;

    setConfirmDialog(false);
    setUploading(true);

    try {
      await updateProfile({
        profilePictureUrl: '',
      });
      setUploading(false);
    } catch (error: unknown) {
      console.error('Failed to remove profile picture:', error);
      setError('Failed to remove profile picture');
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const avatarSize = getAvatarSize();
  const currentImageUrl = previewUrl || user?.profilePictureUrl;

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Avatar with Upload Overlay */}
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <Avatar
          src={currentImageUrl || undefined}
          sx={{
            ...avatarSize,
            bgcolor: currentImageUrl ? 'transparent' : 'primary.main',
            fontWeight: 600,
            border: uploading ? '2px solid' : 'none',
            borderColor: uploading ? 'primary.main' : 'transparent',
            filter: uploading ? 'brightness(0.7)' : 'none',
          }}
        >
          {!currentImageUrl && getInitials(user.firstName, user.lastName)}
        </Avatar>

        {/* Upload Progress Overlay */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <CircularProgress
              variant='determinate'
              value={uploadProgress}
              size={avatarSize.width * 0.4}
              sx={{ color: 'white' }}
            />
          </Box>
        )}

        {/* Edit Button Overlay */}
        {editable && !uploading && (
          <Tooltip title='Change profile picture'>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: 'primary.main',
                color: 'white',
                width: 28,
                height: 28,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                boxShadow: 2,
              }}
              onClick={triggerFileSelect}
            >
              <CameraAlt sx={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Action Buttons */}
      {showUploadButton && editable && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Button
            variant='outlined'
            startIcon={<CloudUpload />}
            onClick={triggerFileSelect}
            disabled={uploading}
            size='small'
            sx={{ textTransform: 'none' }}
          >
            Upload Photo
          </Button>

          {user.profilePictureUrl && (
            <Button
              variant='outlined'
              color='error'
              startIcon={<Delete />}
              onClick={() => setConfirmDialog(true)}
              disabled={uploading}
              size='small'
              sx={{ textTransform: 'none' }}
            >
              Remove
            </Button>
          )}
        </Box>
      )}

      {/* Development Notice */}
      {!error && (
        <Alert severity='info' sx={{ mt: 1, maxWidth: 400 }}>
          <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
            Profile Picture Feature (Development Mode)
          </Typography>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert
          severity={error.includes('not yet available') ? 'info' : 'error'}
          sx={{ mt: 1, maxWidth: 400 }}
        >
          {error}
          {error.includes('not yet available') && (
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              You can still change your profile picture once the backend API is
              ready.
            </Typography>
          )}
        </Alert>
      )}

      {/* Upload Progress Text */}
      {uploading && (
        <Typography variant='body2' color='text.secondary'>
          Uploading... {uploadProgress}%
        </Typography>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/jpg,image/png,image/webp'
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Remove Profile Picture</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove your profile picture? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog(false)}
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemovePicture}
            color='error'
            variant='contained'
            startIcon={<Delete />}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePictureUpload;
