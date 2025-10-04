import React, { useState, useRef, useEffect } from 'react';
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

  // Debug: Log what formState this step receives
  console.log('🖼️ BrandingStep - Received formState:', {
    hasBranding: !!formState.branding,
    logoUrl: formState.branding?.logoUrl,
    bannerUrl: formState.branding?.bannerUrl,
    galleryUrls: formState.branding?.galleryUrls,
    galleryUrlsLength: formState.branding?.galleryUrls?.length || 0,
    logoFile: formState.branding?.logoFile,
    bannerFile: formState.branding?.bannerFile,
    galleryFiles: formState.branding?.galleryFiles,
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview URLs with existing images in edit mode
  useEffect(() => {
    const branding = formState.branding;
    console.log('🖼️ BrandingStep useEffect - Setting preview URLs:', {
      hasBranding: !!branding,
      logoUrl: branding?.logoUrl,
      bannerUrl: branding?.bannerUrl,
      galleryUrls: branding?.galleryUrls,
      galleryCount: branding?.galleryUrls?.length || 0,
    });

    if (branding) {
      const newPreviewUrls = {
        logo: branding.logoUrl || undefined,
        banner: branding.bannerUrl || undefined,
        gallery: branding.galleryUrls || [],
      };

      console.log(
        '🖼️ BrandingStep - New preview URLs being set:',
        newPreviewUrls
      );
      setPreviewUrls(newPreviewUrls);
    }
  }, [formState.branding]);

  // Cleanup effect to revoke object URLs on unmount
  useEffect(() => {
    return () => {
      // Only revoke object URLs (blob:), not server URLs
      const isObjectUrl = (url: string) => url.startsWith('blob:');

      if (previewUrls.logo && isObjectUrl(previewUrls.logo)) {
        URL.revokeObjectURL(previewUrls.logo);
      }
      if (previewUrls.banner && isObjectUrl(previewUrls.banner)) {
        URL.revokeObjectURL(previewUrls.banner);
      }
      if (previewUrls.gallery) {
        previewUrls.gallery.forEach((url) => {
          if (isObjectUrl(url)) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, [previewUrls]);

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
    // Helper function to check if URL is an object URL (starts with blob:)
    const isObjectUrl = (url: string) => url.startsWith('blob:');

    if (type === 'logo') {
      updateFormState({
        branding: {
          ...formState.branding,
          logoFile: undefined,
          logoUrl: undefined, // Clear existing URL as well
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        logo: undefined,
      }));
      if (previewUrls.logo && isObjectUrl(previewUrls.logo)) {
        URL.revokeObjectURL(previewUrls.logo);
      }
    } else if (type === 'banner') {
      updateFormState({
        branding: {
          ...formState.branding,
          bannerFile: undefined,
          bannerUrl: undefined, // Clear existing URL as well
        },
      });
      setPreviewUrls((prev) => ({
        ...prev,
        banner: undefined,
      }));
      if (previewUrls.banner && isObjectUrl(previewUrls.banner)) {
        URL.revokeObjectURL(previewUrls.banner);
      }
    } else if (type === 'gallery' && typeof index === 'number') {
      const currentFiles = formState.branding.galleryFiles || [];
      const currentPreviews = previewUrls.gallery || [];
      const currentUrls = formState.branding.galleryUrls || [];

      const newFiles = currentFiles.filter((_, i) => i !== index);
      const newPreviews = currentPreviews.filter((_, i) => i !== index);
      const newUrls = currentUrls.filter((_, i) => i !== index);

      if (currentPreviews[index] && isObjectUrl(currentPreviews[index])) {
        URL.revokeObjectURL(currentPreviews[index]);
      }

      updateFormState({
        branding: {
          ...formState.branding,
          galleryFiles: newFiles,
          galleryUrls: newUrls, // Update existing URLs as well
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

          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
          >
            {previewUrls.logo && (
              <Box sx={{ mb: 2 }}>
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
                  onLoad={() =>
                    console.log('✅ Logo image loaded:', previewUrls.logo)
                  }
                  onError={() =>
                    console.error(
                      '❌ Logo image failed to load:',
                      previewUrls.logo
                    )
                  }
                />
                <Typography variant='body2' gutterBottom>
                  Current Logo
                </Typography>
              </Box>
            )}
            <Button
              variant={previewUrls.logo ? 'outlined' : 'contained'}
              startIcon={<UploadIcon />}
              onClick={() => logoInputRef.current?.click()}
              sx={{ mb: previewUrls.logo ? 1 : 0 }}
              disabled={
                uploadProgress.logo !== undefined && uploadProgress.logo < 100
              }
            >
              {previewUrls.logo ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            {uploadProgress.logo !== undefined && uploadProgress.logo < 100 && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <LinearProgress
                  variant='determinate'
                  value={uploadProgress.logo}
                  sx={{ borderRadius: 1 }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  Uploading... {uploadProgress.logo}%
                </Typography>
              </Box>
            )}
            {previewUrls.logo && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFile('logo')}
                color='error'
                size='small'
                sx={{ ml: 1 }}
              >
                Remove
              </Button>
            )}
          </Paper>

          {/* Hidden input for logo */}
          <input
            ref={logoInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'logo')}
          />
        </Box>

        {/* Banner Upload */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Store Banner
          </Typography>

          <Paper
            elevation={2}
            sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}
          >
            {previewUrls.banner && (
              <Box sx={{ mb: 2 }}>
                <Box
                  component='img'
                  src={previewUrls.banner}
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                  onLoad={() =>
                    console.log('✅ Banner image loaded:', previewUrls.banner)
                  }
                  onError={() =>
                    console.error(
                      '❌ Banner image failed to load:',
                      previewUrls.banner
                    )
                  }
                />
                <Typography variant='body2' gutterBottom sx={{ mt: 1 }}>
                  Current Banner
                </Typography>
              </Box>
            )}
            <Button
              variant={previewUrls.banner ? 'outlined' : 'contained'}
              startIcon={<UploadIcon />}
              onClick={() => bannerInputRef.current?.click()}
              sx={{ mb: previewUrls.banner ? 1 : 0 }}
              disabled={
                uploadProgress.banner !== undefined &&
                uploadProgress.banner < 100
              }
            >
              {previewUrls.banner ? 'Replace Banner' : 'Upload Banner'}
            </Button>
            {uploadProgress.banner !== undefined &&
              uploadProgress.banner < 100 && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress
                    variant='determinate'
                    value={uploadProgress.banner}
                    sx={{ borderRadius: 1 }}
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mt: 0.5, display: 'block' }}
                  >
                    Uploading... {uploadProgress.banner}%
                  </Typography>
                </Box>
              )}
            {previewUrls.banner && (
              <Button
                startIcon={<DeleteIcon />}
                onClick={() => handleRemoveFile('banner')}
                color='error'
                size='small'
                sx={{ ml: 1 }}
              >
                Remove
              </Button>
            )}
          </Paper>

          {/* Hidden input for banner */}
          <input
            ref={bannerInputRef}
            type='file'
            accept='image/*'
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'banner')}
          />
        </Box>
      </Box>

      {/* Gallery Upload */}
      <Box sx={{ mt: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Store Gallery
        </Typography>

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
              Gallery Images ({previewUrls.gallery?.length || 0}/6)
            </Typography>
            <Button
              variant={
                previewUrls.gallery && previewUrls.gallery.length > 0
                  ? 'outlined'
                  : 'contained'
              }
              startIcon={<UploadIcon />}
              onClick={() => galleryInputRef.current?.click()}
              disabled={
                (previewUrls.gallery?.length || 0) >= 6 ||
                (uploadProgress.gallery !== undefined &&
                  uploadProgress.gallery < 100)
              }
              size='small'
            >
              {previewUrls.gallery && previewUrls.gallery.length > 0
                ? 'Add More'
                : 'Upload Images'}
            </Button>
          </Box>

          {uploadProgress.gallery !== undefined &&
            uploadProgress.gallery < 100 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant='determinate'
                  value={uploadProgress.gallery}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 1, display: 'block' }}
                >
                  Uploading... {uploadProgress.gallery}%
                </Typography>
              </Box>
            )}

          {previewUrls.gallery && previewUrls.gallery.length > 0 ? (
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
                    onLoad={() =>
                      console.log(`✅ Gallery image ${index + 1} loaded:`, url)
                    }
                    onError={() =>
                      console.error(
                        `❌ Gallery image ${index + 1} failed to load:`,
                        url
                      )
                    }
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
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <GalleryIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant='body2' color='text.secondary'>
                Showcase your products and farm (up to 6 images)
              </Typography>
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
        </Paper>
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
