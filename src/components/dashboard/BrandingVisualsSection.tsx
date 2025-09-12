import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
  Fade,
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
  VisibilityOff,
  Close,
  CheckCircle,
  Warning,
  Store,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import toast from 'react-hot-toast';
import OpenShopApiService from '../../services/open-shop.api';
import { useAuth } from '../../contexts/AuthContext';

interface BrandingData {
  logoUrl?: string;
  bannerUrl?: string;
  galleryImages?: string[];
  lastUpdated?: string;
}

interface BrandingVisualsSectionProps {
  storeId?: number;
  initialData?: BrandingData;
  onUpdate?: (data: BrandingData) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const BrandingVisualsSection: React.FC<BrandingVisualsSectionProps> = ({
  storeId,
  initialData = {},
  onUpdate,
}) => {
  const { user } = useAuth();
  const [brandingData, setBrandingData] = useState<BrandingData>(initialData);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
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
    if (files.length === 0) return;

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
          let result;

          switch (type) {
            case 'logo':
              result = await OpenShopApiService.uploadLogo(
                storeId,
                file,
                (progress) =>
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }))
              );
              setBrandingData((prev) => ({
                ...prev,
                logoUrl: result.logoUrl,
                lastUpdated: new Date().toISOString(),
              }));
              break;

            case 'banner':
              result = await OpenShopApiService.uploadBanner(
                storeId,
                file,
                (progress) =>
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }))
              );
              setBrandingData((prev) => ({
                ...prev,
                bannerUrl: result.bannerUrl,
                lastUpdated: new Date().toISOString(),
              }));
              break;

            case 'gallery':
              result = await OpenShopApiService.uploadGalleryImages(
                storeId,
                [file],
                (progress) =>
                  setUploadProgress((prev) => ({
                    ...prev,
                    [progressKey]: progress,
                  }))
              );
              setBrandingData((prev) => ({
                ...prev,
                galleryImages: [
                  ...(prev.galleryImages || []),
                  ...result.imageUrls,
                ],
                lastUpdated: new Date().toISOString(),
              }));
              break;
          }
        } catch (uploadError: any) {
          console.error(`${type} upload error:`, uploadError);
          toast.error(
            `Failed to upload ${type}: ${uploadError.message || 'Unknown error'}`
          );
          continue;
        }
      }

      setUploadProgress({});
      toast.success(`${type} uploaded successfully!`);

      // Notify parent component of updates
      onUpdate?.(brandingData);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed. Please try again.');
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

      // Note: In a real implementation, you would call delete APIs here
      // For now, we'll just remove from local state as the APIs might not support deletion

      setBrandingData((prev) => {
        const newData = { ...prev };

        switch (type) {
          case 'logo':
            delete newData.logoUrl;
            break;
          case 'banner':
            delete newData.bannerUrl;
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
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(
        `Failed to remove ${type}: ${error.message || 'Unknown error'}`
      );
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

  const renderUploadCard = (
    type: 'logo' | 'banner' | 'gallery',
    title: string,
    description: string,
    icon: React.ReactNode,
    inputRef: React.RefObject<HTMLInputElement>,
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
          <Button
            variant='contained'
            onClick={() => (window.location.href = '/open-shop')}
            startIcon={<Store />}
          >
            Create Your Store
          </Button>
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

      <Grid container spacing={3}>
        {/* Logo Section */}
        <Grid item xs={12} md={4}>
          {renderUploadCard(
            'logo',
            'Store Logo',
            'Square format recommended',
            <PhotoCamera sx={{ fontSize: 32, color: 'primary.main' }} />,
            logoInputRef,
            brandingData.logoUrl,
            [
              'Square aspect ratio (1:1)',
              'Minimum 200x200px',
              'Clear, simple design',
              'Works well at small sizes',
            ]
          )}
        </Grid>

        {/* Banner Section */}
        <Grid item xs={12} md={8}>
          {renderUploadCard(
            'banner',
            'Store Banner',
            'Header image for your store page',
            <Image sx={{ fontSize: 32, color: 'primary.main' }} />,
            bannerInputRef,
            brandingData.bannerUrl,
            [
              'Wide aspect ratio (16:9 or 3:1)',
              'Minimum 1200x400px',
              'High quality, engaging image',
              'Represents your farm/products',
            ]
          )}
        </Grid>

        {/* Gallery Section */}
        <Grid item xs={12}>
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
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        loading='lazy'
                        style={{
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                        onClick={() =>
                          openPreview(image, `Gallery Image ${index + 1}`)
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
                              openDeleteDialog('gallery', image, index);
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
        </Grid>
      </Grid>

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
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Logo Best Practices:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Keep it simple, memorable, and scalable. Your logo should work
              well at all sizes.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Banner Guidelines:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Use high-quality images that tell your story and showcase your
              products or farm.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Gallery Strategy:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Mix product shots, behind-the-scenes farm photos, and lifestyle
              images.
            </Typography>
          </Grid>
        </Grid>

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant='caption' color='text.secondary'>
              Debug: Store ID: {storeId}, User: {user?.email}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default BrandingVisualsSection;
