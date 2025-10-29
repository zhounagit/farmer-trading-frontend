import React, { useState, useRef } from 'react';
import { removeStoredProfilePicture } from '@/utils/profilePictureStorage';
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
import { apiService } from '@/services/api';

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
  const [isLoading, setIsLoading] = useState(false);
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
        return { width: 200, height: 200, fontSize: '3rem' };
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

    setUploadProgress(0);
    setError(null);
    setIsLoading(true);

    try {
      const result = await apiService
        .uploadProfilePicture(user.userId, file, (progress) => {
          setUploadProgress(progress);
        })
        .catch((error) => {
          throw new Error(`Upload failed: ${error.message}`);
        });

      // Update user profile with new picture URL - this will trigger re-render of all components
      // If no profilePictureUrl in response, try to construct it from the upload
      let finalProfilePictureUrl = result.profilePictureUrl;
      if (!finalProfilePictureUrl) {
        // Try to construct the URL based on common patterns
        const uuid = crypto.randomUUID();
        finalProfilePictureUrl = `/uploads/profilepictures/${user.userId}_${uuid}.jpg`;
      }

      // Force immediate state update with timestamp to ensure components re-render
      updateProfile({
        profilePictureUrl: finalProfilePictureUrl,
      });

      // Trigger global refresh
      if (window.resetHeaderProfilePictureState) {
        window.resetHeaderProfilePictureState();
      }

      // Clean up preview URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      // Call success callback
      if (onUploadSuccess && result.profilePictureUrl) {
        onUploadSuccess(finalProfilePictureUrl);
      }

      setUploadProgress(100);
      setIsLoading(false);
    } catch (error: unknown) {
      console.error('❌ Profile picture upload failed:', {
        error,
        fullError: JSON.stringify(error, null, 2),
        responseData: (error as any)?.response?.data,
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
      });

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
      } else if (errorObj.response?.status === 413) {
        errorMessage = 'File too large. Please choose a smaller image.';
      } else if (errorObj.response?.status === 415) {
        errorMessage =
          'Invalid file type. Please use JPEG, PNG, or GIF images.';
      } else if (errorObj.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage =
          errorObj.response?.data?.message ||
          errorObj.message ||
          'Failed to upload profile picture';
      }

      setError(errorMessage);
      setIsLoading(false);

      // Clean up preview URL on error
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  };

  const handleRemovePicture = async () => {
    if (!user) return;

    setConfirmDialog(false);
    setIsLoading(true);

    try {
      // First, get the complete user data from the backend to ensure we have all required fields
      const userResponse = await apiService.get<{
        data?: {
          userId: string;
          firstName: string;
          lastName: string;
          phone?: string;
          title?: string;
          suffix?: string;
          workPhone?: string;
        };
        userId?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        title?: string;
        suffix?: string;
        workPhone?: string;
      }>(`/api/users/${user.userId}`);
      // Handle ApiResponse wrapper: { data: { ...userData }, success: boolean, ... }
      const completeUserData = userResponse.data || userResponse;

      console.log('🔄 ProfilePictureUpload: Complete user data from backend', {
        userId: completeUserData.userId,
        firstName: completeUserData.firstName,
        lastName: completeUserData.lastName,
        phone: completeUserData.phone,
        hasTitle: 'title' in completeUserData,
        hasSuffix: 'suffix' in completeUserData,
        hasWorkPhone: 'workPhone' in completeUserData,
        fullData: completeUserData,
      });

      // Use PUT endpoint to update user with null profile picture URL
      // Backend doesn't support DELETE for profile pictures, so we update with null
      // Include all required fields for UpdateUserRequest with proper null handling
      const updateData = {
        FirstName: completeUserData.firstName || user.firstName || '',
        LastName: completeUserData.lastName || user.lastName || '',
        Phone: completeUserData.phone || user.phone || '000-000-0000', // Required field, provide default if missing
        Title: completeUserData.title || '',
        Suffix: completeUserData.suffix || '',
        WorkPhone: completeUserData.workPhone || '',
        ProfilePictureUrl: '',
      };

      try {
        await apiService.put('/api/auth/profile', updateData);
      } catch (authError) {
        // If auth/profile fails, try the users endpoint as fallback
        try {
          await apiService.put(`/api/users/${user.userId}`, updateData);
        } catch (usersError) {
          console.error('❌ ProfilePictureUpload: Both endpoints failed', {
            authError,
            usersError,
            authErrorResponse: (authError as any)?.response?.data,
            usersErrorResponse: (usersError as any)?.response?.data,
          });
          throw usersError; // Re-throw the error to be caught by outer catch
        }
      }

      // Update user profile to remove picture URL - this will trigger re-render of all components
      // Force immediate UI update by updating user state
      // Use null instead of undefined for consistent state handling
      updateProfile({
        profilePictureUrl: null,
      });

      // Clear any cached image data
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      // Clear localStorage profile picture cache
      try {
        removeStoredProfilePicture(user.userId);
      } catch (error) {
        console.warn(
          'Failed to clear localStorage profile picture cache:',
          error
        );
      }

      // Force immediate UI refresh by updating component state
      setPreviewUrl(null);
      setUploadProgress(0);

      setIsLoading(false);
    } catch (error: unknown) {
      console.error(
        '❌ ProfilePictureUpload: Failed to remove profile picture:',
        {
          error,
          fullError: JSON.stringify(error, null, 2),
          responseData: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
          statusText: (error as any)?.response?.statusText,
          headers: (error as any)?.response?.headers,
          requestData: updateData,
          userId: user.userId,
        }
      );
      setError('Failed to remove profile picture');
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const avatarSize = getAvatarSize();

  // Convert relative URL to absolute URL using backend server
  const getFullImageUrl = (
    url: string | null | undefined
  ): string | undefined => {
    if (!url) return undefined;

    // If it's already a full URL, return as is (cache busting handled by component)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If it's a relative URL, make it absolute using backend server URL
    if (url.startsWith('/')) {
      const backendUrl = 'https://localhost:7008'; // Same as API_BASE_URL in api.ts
      return `${backendUrl}${url}`;
    }

    return url;
  };

  // Get profile picture URL from user object - handle null, undefined, and empty string
  const currentImageUrl =
    user?.profilePictureUrl && user.profilePictureUrl !== ''
      ? getFullImageUrl(user.profilePictureUrl)
      : null;

  // Debug: Log current image state

  // Force re-render when profile picture changes by using a key
  // Use a simple key that changes when profilePictureUrl changes
  const avatarKey = `avatar-${user?.userId}-${user?.profilePictureUrl || 'no-image'}`;

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
          key={avatarKey}
          src={
            user?.profilePictureUrl && user.profilePictureUrl !== ''
              ? `${currentImageUrl}?t=${Date.now()}`
              : undefined
          }
          sx={{
            ...avatarSize,
            bgcolor:
              user?.profilePictureUrl && user.profilePictureUrl !== ''
                ? 'transparent'
                : 'primary.main',
            fontWeight: 600,
            border: isLoading ? '2px solid' : 'none',
            borderColor: isLoading ? 'primary.main' : 'transparent',
            filter: isLoading ? 'brightness(0.7)' : 'none',
          }}
          onError={() => {
            // If image fails to load, force refresh by updating the key
            setPreviewUrl(null);
          }}
          onLoad={() => {
            // Image loaded successfully
          }}
          onError={(e) => {
            // Only handle blob URL errors silently, log others
            if (currentImageUrl?.startsWith('blob:')) {
              // Blob URL expired (expected)
            } else {
              console.error('🔄 ProfilePictureUpload: Image load error', {
                src: currentImageUrl,
                error: e,
              });
            }
          }}
        >
          {(!user?.profilePictureUrl || user.profilePictureUrl === '') &&
            getInitials(user.firstName, user.lastName)}
        </Avatar>

        {/* Upload Progress Overlay */}
        {isLoading && (
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
        {editable && !isLoading && (
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
            disabled={isLoading}
            size='small'
            sx={{ textTransform: 'none' }}
          >
            Upload Photo
          </Button>

          {user?.profilePictureUrl && (
            <Button
              variant='outlined'
              color='error'
              startIcon={<Delete />}
              onClick={() => setConfirmDialog(true)}
              disabled={isLoading}
              size='small'
              sx={{ textTransform: 'none' }}
            >
              Remove
            </Button>
          )}
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert
          severity={error?.includes('not yet available') ? 'info' : 'error'}
          sx={{ mt: 1, maxWidth: 400 }}
        >
          {error}
          {error?.includes('not yet available') && (
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              You can still change your profile picture once the backend API is
              ready.
            </Typography>
          )}
        </Alert>
      )}

      {/* Upload Progress Text */}
      {isLoading && (
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
