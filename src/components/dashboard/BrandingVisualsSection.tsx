import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Edit,
  Delete,
  Add,
  PhotoCamera,
  Image,
  Collections,
  Visibility,
  Close,
  CheckCircle,
  Warning,
  Store,
  Palette,
} from '@mui/icons-material';

import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../services/open-shop.api';
import StoreApiService from '../../services/store.api';
import { type StoreImage } from '../../types/open-shop.types';
import { useAuth } from '../../contexts/AuthContext';
import { handleAuthError, isAuthError } from '../../utils/authErrorHandler';
import { isAdminUser } from '../../utils/userTypeUtils';
import { STORAGE_KEYS } from '../../utils/api';

// Import types for store submission
interface StoreSubmissionRequest {
  storeId: number;
  agreedToTermsAt: string;
  termsVersion: string;
  submissionNotes?: string;
}

interface BrandingData {
  logoUrl?: string;
  logoImage?: StoreImage;
  bannerUrl?: string;
  bannerImage?: StoreImage;
  galleryImages?: StoreImage[];
  lastUpdated?: string;
}

interface BrandingVisualsSectionProps {
  storeId?: number;
  initialData?: BrandingData;
  onUpdate?: (data: BrandingData) => void;
  onError?: (error: unknown) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const BrandingVisualsSection: React.FC<BrandingVisualsSectionProps> = ({
  storeId,
  initialData = {},
  onUpdate,
  onError,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brandingData, setBrandingData] = useState<BrandingData>(initialData);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    imageUrl?: string;
    title?: string;
  }>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type?: 'logo' | 'banner' | 'gallery';
    imageUrl?: string;
    index?: number;
  }>({ open: false });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Helper function to build proper image URLs
  const buildImageUrl = (fileUrl: string): string => {
    // If fileUrl is already absolute, return as-is
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }

    // The fileUrl from API should be like "/Uploads/Stores/19/image.jpg"
    const baseUrl = 'https://localhost:7008';
    const normalizedPath = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
    const finalUrl = `${baseUrl}${normalizedPath}`;
    return finalUrl;
  };

  // Load existing images when component mounts
  useEffect(() => {
    const loadExistingImages = async () => {
      if (!storeId) return;

      try {
        const images = await StoreApiService.getStoreImages(storeId);

        // Transform the images to match the expected StoreImage type from open-shop.types
        const transformedImages: StoreImage[] = images.map((img) => ({
          ...img,
          imageType: img.imageType as string,
          fileUrl: img.filePath, // Add fileUrl property that matches filePath
        }));

        const logoImage = transformedImages.find(
          (img) => img.imageType === 'logo'
        );
        const bannerImage = transformedImages.find(
          (img) => img.imageType === 'banner'
        );
        const galleryImages = transformedImages.filter(
          (img) => img.imageType === 'gallery'
        );

        const updatedBrandingData: BrandingData = {
          logoUrl: logoImage ? buildImageUrl(logoImage.filePath) : undefined,
          logoImage: logoImage,
          bannerUrl: bannerImage
            ? buildImageUrl(bannerImage.filePath)
            : undefined,
          bannerImage: bannerImage,
          galleryImages: galleryImages,
          lastUpdated: new Date().toISOString(),
        };

        setBrandingData(updatedBrandingData);
        onUpdate?.(updatedBrandingData);
      } catch (error) {
        console.error('Failed to load existing images:', error);
        onError?.(error);
        // Don't show error toast for missing images as it's expected for new stores
      }
    };

    loadExistingImages();
  }, [storeId, onUpdate, onError]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }
    return null;
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'gallery'
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    // Check authentication state before attempting upload
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // If user context shows authenticated but no tokens, this is likely a development scenario
    if (!token && !refreshToken && !user) {
      toast.error('Please log in to upload images');
      handleAuthError(new Error('No authentication token'), navigate);
      return;
    }

    // Special case: User context exists but tokens are missing (development)
    if (!token && !refreshToken && user) {
      toast.error(
        'Authentication tokens missing! Use the "Auth Debug" tab in the dashboard to set authentication tokens.',
        {
          duration: 5000,
        }
      );
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // For gallery, check if adding these files would exceed the limit
    if (type === 'gallery') {
      const currentCount = brandingData.galleryImages?.length || 0;
      if (currentCount + validFiles.length > 6) {
        toast.error(
          `You can only have up to 6 gallery images. You currently have ${currentCount}.`
        );
        return;
      }
    }

    setIsUploading(true);

    try {
      if (!storeId) {
        toast.error('Store ID is required for upload');
        return;
      }

      // Upload files using real API service
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const progressKey = `${type}_${i}`;

        try {
          switch (type) {
            case 'logo': {
              const result = await OpenShopApiService.uploadLogo(
                storeId,
                file,
                (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }));
                }
              );
              setBrandingData((prev) => ({
                ...prev,
                logoUrl: buildImageUrl(result.filePath),
                logoImage: result,
                lastUpdated: new Date().toISOString(),
              }));
              break;
            }

            case 'banner': {
              const result = await OpenShopApiService.uploadBanner(
                storeId,
                file,
                (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }));
                }
              );
              setBrandingData((prev) => ({
                ...prev,
                bannerUrl: buildImageUrl(result.filePath),
                bannerImage: result,
                lastUpdated: new Date().toISOString(),
              }));
              break;
            }

            case 'gallery': {
              const result = await OpenShopApiService.uploadGalleryImages(
                storeId,
                [file],
                (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }));
                }
              );
              setBrandingData((prev) => ({
                ...prev,
                galleryImages: [...(prev.galleryImages || []), ...result],
                lastUpdated: new Date().toISOString(),
              }));
              break;
            }
          }
        } catch (uploadError: unknown) {
          console.error(`${type} upload error:`, uploadError);

          // Break the upload loop on error
          toast.error(`Failed to upload ${file.name}`);

          if (isAuthError(uploadError)) {
            onError?.(uploadError);
            handleAuthError(uploadError, navigate);
            return; // Stop the upload process
          }

          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : 'Unknown error';
          toast.error(`Failed to upload ${type}: ${errorMessage}`);
          continue;
        }
      }

      setUploadProgress({});
      toast.success(`${type} uploaded successfully!`);

      // Notify parent component of updates
      onUpdate?.(brandingData);
    } catch (error: unknown) {
      console.error('Upload error:', error);

      toast.error('Upload failed. Please try again.');

      if (isAuthError(error)) {
        onError?.(error);
        handleAuthError(error, navigate);
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Upload failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      // Clear the input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDelete = async (
    type: 'logo' | 'banner' | 'gallery',
    index?: number
  ) => {
    if (!storeId) {
      toast.error('Store ID is required for deletion');
      return;
    }

    try {
      setIsUploading(true);

      let imageId: number | undefined;

      // Get the image ID to delete
      switch (type) {
        case 'logo':
          if (brandingData.logoImage) {
            imageId = brandingData.logoImage.imageId;
          }
          break;
        case 'banner':
          if (brandingData.bannerImage) {
            imageId = brandingData.bannerImage.imageId;
          }
          break;
        case 'gallery':
          if (
            typeof index === 'number' &&
            brandingData.galleryImages?.[index]
          ) {
            imageId = brandingData.galleryImages[index].imageId;
          }
          break;
      }

      if (!imageId) {
        toast.error('Image ID not found for deletion');
        return;
      }

      // Delete from backend
      await StoreApiService.deleteStoreImage(storeId, imageId);

      // Update local state only after successful backend deletion
      setBrandingData((prev) => {
        const newData = { ...prev };

        switch (type) {
          case 'logo':
            delete newData.logoUrl;
            delete newData.logoImage;
            break;
          case 'banner':
            delete newData.bannerUrl;
            delete newData.bannerImage;
            break;
          case 'gallery':
            if (typeof index === 'number' && newData.galleryImages) {
              newData.galleryImages = newData.galleryImages.filter(
                (_, i) => i !== index
              );
            }
            break;
        }

        newData.lastUpdated = new Date().toISOString();
        onUpdate?.(newData);
        return newData;
      });

      setDeleteDialog({ open: false });
      toast.success(`${type} removed successfully`);
    } catch (error: unknown) {
      console.error('Delete error:', error);

      // Handle authentication errors specially
      if (isAuthError(error)) {
        onError?.(error);
        handleAuthError(error, navigate);
        return;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to remove ${type}: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const openPreview = (imageUrl: string, title: string) => {
    setPreviewDialog({ open: true, imageUrl, title });
  };

  const openDeleteDialog = (
    type: 'logo' | 'banner' | 'gallery',
    imageUrl?: string,
    index?: number
  ) => {
    setDeleteDialog({ open: true, type, imageUrl, index });
  };

  const handleCompleteStoreSetup = async () => {
    if (!storeId) {
      toast.error('Store ID is required');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare submission request
      const submissionRequest: StoreSubmissionRequest = {
        storeId: storeId,
        agreedToTermsAt: new Date().toISOString(),
        termsVersion: '1.0.0',
        submissionNotes:
          'Store setup completed from dashboard - branding section',
      };

      await OpenShopApiService.submitStoreForReview(submissionRequest);
      toast.success('Store submitted for review successfully!');

      // Navigate to success or dashboard overview
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // Refresh to show updated status
      }, 2000);
    } catch (error: unknown) {
      console.error('Store submission failed:', error);

      // Handle authentication errors
      if (isAuthError(error)) {
        onError?.(error);
        handleAuthError(error, navigate);
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit store for review';

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderUploadCard = (
    type: 'logo' | 'banner' | 'gallery',
    title: string,
    description: string,
    icon: React.ReactNode,
    inputRef: React.RefObject<HTMLInputElement | null>,
    currentImage?: string,
    recommendations?: string[]
  ) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Box sx={{ ml: 2, flex: 1 }}>
            <Typography variant='h6' gutterBottom>
              {title}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {description}
            </Typography>
          </Box>
          {currentImage && (
            <Chip
              icon={<CheckCircle />}
              label='Uploaded'
              color='success'
              size='small'
              variant='outlined'
            />
          )}
        </Box>

        {currentImage ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component='img'
              height={type === 'banner' ? 120 : 200}
              image={currentImage}
              alt={title}
              onLoad={() => {}}
              onError={(e) => {
                console.error(`Image failed to load: ${currentImage}`, e);
              }}
              sx={{
                borderRadius: 2,
                objectFit: 'cover',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
              onClick={() => openPreview(currentImage, title)}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                display: 'flex',
                gap: 1,
              }}
            >
              <Tooltip title='Preview'>
                <IconButton
                  size='small'
                  sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                  onClick={() => openPreview(currentImage, title)}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              <Tooltip title='Replace'>
                <IconButton
                  size='small'
                  sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
                  onClick={() => inputRef.current?.click()}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title='Remove'>
                <IconButton
                  size='small'
                  sx={{ bgcolor: 'rgba(255,0,0,0.7)', color: 'white' }}
                  onClick={() => openDeleteDialog(type, currentImage)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => inputRef.current?.click()}
          >
            <CloudUpload
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant='body1' gutterBottom>
              Click to upload {type}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              or drag and drop
            </Typography>
          </Box>
        )}

        {recommendations && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Recommendations:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <Typography variant='body2'>{rec}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          multiple={type === 'gallery'}
          style={{ display: 'none' }}
          onChange={(e) => handleFileSelect(e, type)}
        />

        {uploadProgress[type] !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant='determinate'
              value={uploadProgress[type]}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 1, display: 'block' }}
            >
              Uploading... {uploadProgress[type]}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Show helpful message if no store ID is provided
  if (!storeId) {
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Branding & Visuals
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Palette sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h6' gutterBottom>
            Store ID Required
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            You need to have a store created before you can manage branding and
            visuals.
          </Typography>
          {!isAdminUser(user?.userType) && (
            <Button
              variant='contained'
              onClick={() => (window.location.href = '/open-shop')}
              startIcon={<Store />}
            >
              Create Your Store
            </Button>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant='h5' fontWeight={600}>
          Branding & Visuals
        </Typography>
        {brandingData.lastUpdated && (
          <Typography variant='body2' color='text.secondary'>
            Last updated:{' '}
            {new Date(brandingData.lastUpdated).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* Authentication Warning */}
      {!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) && (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>Upload Disabled:</strong> Authentication tokens missing. Use
            the "Auth Debug" tab in the dashboard to set authentication tokens.
          </Typography>
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Logo Section */}
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          {renderUploadCard(
            'logo',
            'Store Logo',
            'Square format recommended',
            <PhotoCamera sx={{ fontSize: 32, color: 'primary.main' }} />,
            logoInputRef,
            brandingData.logoUrl,
            [
              'Square aspect ratio (1:1)',
              'Clear and simple design',
              'High contrast colors',
              'Works well at small sizes',
            ]
          )}
        </Box>

        {/* Banner Section */}
        <Box sx={{ flex: '2 1 500px', minWidth: '300px' }}>
          {renderUploadCard(
            'banner',
            'Store Banner',
            'Header image for your store page',
            <Image sx={{ fontSize: 32, color: 'primary.main' }} />,
            bannerInputRef,
            brandingData.bannerUrl,
            [
              'Wide aspect ratio (16:9 or 3:1)',
              'High-quality imagery',
              'Showcases your farm/products',
              'Represents your brand well',
            ]
          )}
        </Box>
      </Box>

      {/* Gallery Section */}
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Collections
                  sx={{ fontSize: 32, color: 'primary.main', mr: 2 }}
                />
                <Box>
                  <Typography variant='h6' gutterBottom>
                    Gallery Images
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Showcase your products and farm (up to 6 images)
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={`${brandingData.galleryImages?.length || 0}/6`}
                  variant='outlined'
                  color={
                    brandingData.galleryImages?.length ? 'primary' : 'default'
                  }
                />
                <Button
                  variant='outlined'
                  startIcon={<Add />}
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={
                    isUploading ||
                    (brandingData.galleryImages?.length || 0) >= 6
                  }
                >
                  Add Images
                </Button>
              </Box>
            </Box>

            {brandingData.galleryImages &&
            brandingData.galleryImages.length > 0 ? (
              <ImageList cols={3} gap={16} sx={{ mb: 0 }}>
                {brandingData.galleryImages.map((image, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={buildImageUrl(image.filePath)}
                      alt={`Gallery image ${index + 1}`}
                      loading='lazy'
                      onLoad={() => {}}
                      onError={(e) => {
                        console.error(
                          `Failed to load gallery image ${index + 1}:`,
                          e
                        );
                      }}
                      style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                      onClick={() =>
                        setPreviewDialog({
                          open: true,
                          imageUrl: buildImageUrl(image.filePath),
                          title: `Gallery Image ${index + 1}`,
                        })
                      }
                    />
                    <ImageListItemBar
                      sx={{
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                        borderRadius: '8px 8px 0 0',
                      }}
                      position='top'
                      actionIcon={
                        <IconButton
                          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteDialog({
                              open: true,
                              type: 'gallery',
                              imageUrl: buildImageUrl(image.filePath),
                              index,
                            });
                          }}
                        >
                          <Delete />
                        </IconButton>
                      }
                      actionPosition='right'
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            ) : (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => galleryInputRef.current?.click()}
              >
                <Collections
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant='h6' gutterBottom>
                  No gallery images yet
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  Upload images to showcase your products and farm
                </Typography>
                <Button variant='outlined' startIcon={<CloudUpload />}>
                  Choose Images
                </Button>
              </Box>
            )}

            <input
              ref={galleryInputRef}
              type='file'
              accept='image/*'
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'gallery')}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false })}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {previewDialog.title}
          <IconButton
            onClick={() => setPreviewDialog({ open: false })}
            size='small'
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {previewDialog.imageUrl && (
            <img
              src={previewDialog.imageUrl}
              alt={previewDialog.title}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ color: 'warning.main', mr: 1 }} />
            Confirm Deletion
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this {deleteDialog.type}? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              deleteDialog.type &&
              handleDelete(deleteDialog.type, deleteDialog.index)
            }
            color='error'
            variant='contained'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tips Section */}
      <Paper
        sx={{
          p: 3,
          mt: 3,
          bgcolor: 'info.50',
          border: '1px solid',
          borderColor: 'info.200',
        }}
      >
        <Typography
          variant='h6'
          sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
        >
          💡 Branding Tips
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Logo Best Practices:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Keep it simple, memorable, and scalable. Your logo should work
              well at all sizes.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Banner Guidelines:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Use high-quality images that represent your brand and create a
              welcoming impression.
            </Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Gallery Strategy:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Show your products, farm, and process. Tell your story through
              compelling visuals.
            </Typography>
          </Box>
        </Box>

        {/* Review & Submit Section */}
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 2,
          }}
        >
          <Typography variant='h5' fontWeight={600} gutterBottom>
            Complete Your Store Setup
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
            Ready to submit your store for review? Your branding images have
            been saved. Click below to complete your store setup and submit for
            approval.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              ✓ Store information configured
              <br />
              {brandingData.logoUrl && '✓ Logo uploaded'}
              <br />
              {brandingData.bannerUrl && '✓ Banner uploaded'}
              <br />
              {brandingData.galleryImages &&
                brandingData.galleryImages.length > 0 &&
                `✓ ${brandingData.galleryImages.length} gallery image(s) uploaded`}
            </Typography>
          </Box>

          <Button
            variant='contained'
            size='large'
            onClick={handleCompleteStoreSetup}
            disabled={isSubmitting}
            sx={{
              px: 6,
              py: 2,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
              },
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Review & Submit Store'}
          </Button>

          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 2, display: 'block' }}
          >
            Your store will be reviewed within 1-2 business days
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
};

export default BrandingVisualsSection;
