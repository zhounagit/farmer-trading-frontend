import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  IconButton,
  Stack,
} from '@mui/material';
import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material';
import StorefrontApiService from '@/features/search/services/storefront.api';

interface HeroBannerImageUploadProps {
  storeId: number;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => Promise<void>;
  onImageRemoved: () => Promise<void>;
}

const HeroBannerImageUpload: React.FC<HeroBannerImageUploadProps> = ({
  storeId,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await StorefrontApiService.uploadHeroBannerImage(
        storeId,
        file
      );

      setIsSaving(true);
      await onImageUploaded(result.imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setIsSaving(false);
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = async () => {
    setIsSaving(true);
    try {
      await onImageRemoved();
    } finally {
      setIsSaving(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Upload a background image for your hero banner. Recommended size:
        1920x1080px
      </Typography>

      {/* Current Image Display */}
      {currentImageUrl && !isUploading && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Box
                sx={{
                  width: 120,
                  height: 80,
                  backgroundImage: `url(${currentImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' color='text.primary'>
                  Current hero banner image
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {currentImageUrl}
                </Typography>
              </Box>
              <IconButton
                onClick={handleRemoveImage}
                color='error'
                size='small'
                title='Remove image'
              >
                <Delete />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardContent>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            sx={{
              border: 2,
              borderStyle: 'dashed',
              borderColor: dragOver ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragOver ? 'action.hover' : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
            onClick={triggerFileInput}
          >
            {isUploading || isSaving ? (
              <Box>
                <CloudUpload
                  sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}
                />
                <Typography variant='body1' gutterBottom>
                  {isUploading ? 'Uploading image...' : 'Saving changes...'}
                </Typography>
                <LinearProgress
                  variant='indeterminate'
                  sx={{ width: '100%', maxWidth: 300, mx: 'auto' }}
                />
              </Box>
            ) : (
              <Box>
                <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant='body1' gutterBottom>
                  {dragOver
                    ? 'Drop image here'
                    : 'Click to upload or drag and drop'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  JPEG, PNG, GIF, or WebP • Max 5MB
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<CloudUpload />}
                  sx={{ mt: 2 }}
                  disabled={isUploading || isSaving}
                >
                  Choose Image
                </Button>
              </Box>
            )}
          </Box>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept='image/jpeg,image/png,image/gif,image/webp'
            style={{ display: 'none' }}
          />

          {error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default HeroBannerImageUpload;
