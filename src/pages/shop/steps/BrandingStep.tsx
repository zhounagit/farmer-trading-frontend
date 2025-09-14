import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  IconButton,
  LinearProgress,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PhotoCamera as PhotoIcon,
  Collections as GalleryIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../../services/open-shop.api';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const BrandingStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{
    logo?: string;
    banner?: string;
    gallery?: string[];
  }>({});

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (
    file: File,
    type: 'logo' | 'banner' | 'gallery'
  ): Promise<string | null> => {
    if (file.size > MAX_FILE_SIZE) {
      return Promise.resolve('File size must be less than 5MB');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Promise.resolve('Only JPEG, PNG, and WebP images are allowed');
    }

    // Additional validation for logo (should be square-ish)
    if (type === 'logo') {
      return new Promise<string | null>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio < 0.8 || aspectRatio > 1.25) {
            resolve('Logo should be approximately square (1:1 aspect ratio)');
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve('Invalid image file');
        img.src = URL.createObjectURL(file);
      });
    }

    return Promise.resolve(null);
  };

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'gallery'
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      const error = await validateFile(file, type);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        continue;
      }

      validFiles.push(file);
      newPreviewUrls.push(createPreviewUrl(file));
    }

    if (validFiles.length === 0) return;

    if (type === 'logo') {
      updateFormState({
        branding: {
          ...formState.branding,
          logoFile: validFiles[0],
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        logo: newPreviewUrls[0],
      }));
    } else if (type === 'banner') {
      updateFormState({
        branding: {
          ...formState.branding,
          bannerFile: validFiles[0],
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        banner: newPreviewUrls[0],
      }));
    } else if (type === 'gallery') {
      const currentGallery = formState.branding.galleryFiles || [];
      const newGallery = [...currentGallery, ...validFiles].slice(0, 6); // Max 6 images

      updateFormState({
        branding: {
          ...formState.branding,
          galleryFiles: newGallery,
        },
      });

      const currentPreviews = previewUrls.gallery || [];
      const allPreviews = [...currentPreviews, ...newPreviewUrls].slice(0, 6);

      setPreviewUrls((prev) => ({
        ...prev,
        gallery: allPreviews,
      }));
    }
  };

  const handleRemoveFile = (
    type: 'logo' | 'banner' | 'gallery',
    index?: number
  ) => {
    if (type === 'logo') {
      updateFormState({
        branding: {
          ...formState.branding,
          logoFile: undefined,
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        logo: undefined,
      }));
      if (previewUrls.logo) {
        URL.revokeObjectURL(previewUrls.logo);
      }
    } else if (type === 'banner') {
      updateFormState({
        branding: {
          ...formState.branding,
          bannerFile: undefined,
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        banner: undefined,
      }));
      if (previewUrls.banner) {
        URL.revokeObjectURL(previewUrls.banner);
      }
    } else if (type === 'gallery' && typeof index === 'number') {
      const currentFiles = formState.branding.galleryFiles || [];
      const currentPreviews = previewUrls.gallery || [];

      const newFiles = currentFiles.filter((_, i) => i !== index);
      const newPreviews = currentPreviews.filter((_, i) => i !== index);

      if (currentPreviews[index]) {
        URL.revokeObjectURL(currentPreviews[index]);
      }

      updateFormState({
        branding: {
          ...formState.branding,
          galleryFiles: newFiles,
        },
      });

      setPreviewUrls((prev) => ({
        ...prev,
        gallery: newPreviews,
      }));
    }
  };

  const uploadFiles = async () => {
    if (!formState.storeId) {
      toast.error('Store ID not found');
      return false;
    }

    setIsUploading(true);
    try {
      // Upload logo
      if (formState.branding.logoFile) {
        setUploadProgress((prev) => ({ ...prev, logo: 0 }));
        await OpenShopApiService.uploadLogo(
          formState.storeId,
          formState.branding.logoFile,
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, logo: progress }))
        );
        setUploadProgress((prev) => ({ ...prev, logo: 100 }));
      }

      // Upload banner
      if (formState.branding.bannerFile) {
        setUploadProgress((prev) => ({ ...prev, banner: 0 }));
        await OpenShopApiService.uploadBanner(
          formState.storeId,
          formState.branding.bannerFile,
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, banner: progress }))
        );
        setUploadProgress((prev) => ({ ...prev, banner: 100 }));
      }

      // Upload gallery images
      if (
        formState.branding.galleryFiles &&
        formState.branding.galleryFiles.length > 0
      ) {
        setUploadProgress((prev) => ({ ...prev, gallery: 0 }));
        await OpenShopApiService.uploadGalleryImages(
          formState.storeId,
          formState.branding.galleryFiles,
          (progress) =>
            setUploadProgress((prev) => ({ ...prev, gallery: progress }))
        );
        setUploadProgress((prev) => ({ ...prev, gallery: 100 }));
      }

      return true;
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    if (
      formState.branding.logoFile ||
      formState.branding.bannerFile ||
      formState.branding.galleryFiles?.length
    ) {
      const success = await uploadFiles();
      if (!success) return;
      toast.success('Images uploaded successfully!');
    }
    onNext();
  };

  const handleSkip = () => {
    console.log('=== HANDLE SKIP CLICKED ===');
    console.log('Current step:', formState.currentStep);
    console.log('onNext function:', onNext);
    console.log('Form state:', formState);

    try {
      toast('You can add images later from your store dashboard');

      console.log('Calling onNext()...');
      onNext();
      console.log('onNext() called successfully');
    } catch (error: unknown) {
      console.error('Error in handleSkip:', error);
      toast.error('Failed to proceed to next step. Please try again.');
    }
  };

  const renderUploadArea = (
    type: 'logo' | 'banner' | 'gallery',
    title: string,
    description: string,
    icon: React.ReactNode,
    inputRef: React.RefObject<HTMLInputElement>,
    accept: string = 'image/*',
    multiple: boolean = false
  ) => (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover',
        },
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e, type)}
      />

      <Box sx={{ mb: 2 }}>{icon}</Box>

      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      <Typography variant='body2' color='text.secondary' gutterBottom>
        {description}
      </Typography>

      <Button variant='outlined' startIcon={<UploadIcon />} sx={{ mt: 2 }}>
        Choose {multiple ? 'Files' : 'File'}
      </Button>

      <Typography
        variant='caption'
        display='block'
        sx={{ mt: 2, color: 'text.secondary' }}
      >
        Max file size: 5MB • Formats: JPEG, PNG, WebP
      </Typography>

      {uploadProgress[type] !== undefined && uploadProgress[type] < 100 && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant='determinate'
            value={uploadProgress[type]}
            sx={{ borderRadius: 1 }}
          />
          <Typography variant='caption' color='text.secondary'>
            Uploading... {uploadProgress[type]}%
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <Box>
      <Typography
        variant='h4'
        component='h2'
        gutterBottom
        sx={{ fontWeight: 600, mb: 3 }}
      >
        Branding & Visuals
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Make your store stand out with custom images. This step is optional –
        you can add photos later from your store dashboard.
      </Typography>

      <Alert severity='info' sx={{ mb: 4 }}>
        <Typography variant='body2'>
          <strong>Optional Step:</strong> You can skip this section and add your
          branding images later from your store dashboard.
        </Typography>
      </Alert>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
        }}
      >
        {/* Logo Upload */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Store Logo
          </Typography>

          {previewUrls.logo ? (
            <Paper
              elevation={2}
              sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
            >
              <Avatar
                src={previewUrls.logo}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant='body2' gutterBottom>
                Logo Preview
              </Typography>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFile('logo')}
                color='error'
                size='small'
              >
                Remove
              </Button>
            </Paper>
          ) : (
            renderUploadArea(
              'logo',
              'Upload Logo',
              'Your store logo (square format recommended)',
              <PhotoIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
              logoInputRef as React.RefObject<HTMLInputElement>
            )
          )}
        </Box>

        {/* Banner Upload */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Store Banner
          </Typography>

          {previewUrls.banner ? (
            <Paper
              elevation={2}
              sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
            >
              <Box
                component='img'
                src={previewUrls.banner}
                sx={{
                  width: '100%',
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
              <Typography variant='body2' gutterBottom>
                Banner Preview
              </Typography>
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFile('banner')}
                color='error'
                size='small'
              >
                Remove
              </Button>
            </Paper>
          ) : (
            renderUploadArea(
              'banner',
              'Upload Banner',
              'Header image for your store page',
              <ImageIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
              bannerInputRef as React.RefObject<HTMLInputElement>
            )
          )}
        </Box>
      </Box>

      {/* Gallery Upload */}
      <Box sx={{ mt: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Store Gallery
        </Typography>

        {previewUrls.gallery && previewUrls.gallery.length > 0 ? (
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                Gallery Images ({previewUrls.gallery.length}/6)
              </Typography>
              <Button
                startIcon={<UploadIcon />}
                onClick={() => galleryInputRef.current?.click()}
                disabled={previewUrls.gallery.length >= 6}
                size='small'
              >
                Add More
              </Button>
            </Box>

            <ImageList cols={3} rowHeight={164} gap={8}>
              {previewUrls.gallery.map((url, index) => (
                <ImageListItem key={index}>
                  <img
                    src={url}
                    alt={`Gallery image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        onClick={() => handleRemoveFile('gallery', index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>

            <input
              ref={galleryInputRef}
              type='file'
              accept='image/*'
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'gallery')}
            />
          </Paper>
        ) : (
          renderUploadArea(
            'gallery',
            'Upload Gallery Images',
            'Showcase your products and farm (up to 6 images)',
            <GalleryIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
            galleryInputRef as React.RefObject<HTMLInputElement>,
            'image/*',
            true
          )
        )}
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mt: 6,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, order: { xs: 2, sm: 1 } }}>
          <Button
            variant='outlined'
            onClick={onPrevious}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Back to Policies
          </Button>

          <Button
            variant='text'
            onClick={() => navigate(user?.hasStore ? '/dashboard' : '/')}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              px: 2,
            }}
          >
            Save & Exit Later
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, order: { xs: 1, sm: 2 } }}>
          <Button
            variant='outlined'
            onClick={handleSkip}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Skip for Now
          </Button>

          <LoadingButton
            variant='contained'
            onClick={handleNext}
            loading={isUploading}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {formState.branding.logoFile ||
            formState.branding.bannerFile ||
            formState.branding.galleryFiles?.length
              ? 'Upload & Continue'
              : 'Continue to Review'}
          </LoadingButton>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandingStep;
