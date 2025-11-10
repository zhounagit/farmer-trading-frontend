import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  ImageList,
  ImageListItem,
  Chip,
} from '@mui/material';
import {
  type StepProps,
  type StoreImage,
} from '../../services/open-shop.types';

import OpenShopApiService from '../../services/open-shop.api';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB for videos
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/webm',
];

const BrandingStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const [previewUrls, setPreviewUrls] = useState<{
    logo?: string;
    banner?: string;
    gallery?: string[];
    video?: string;
  }>({});

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Initialize preview URLs with existing images in edit mode
  useEffect(() => {
    const branding = formState.branding;

    if (branding) {
      const newPreviewUrls = {
        logo: branding.logoUrl || undefined,
        banner: branding.bannerUrl || undefined,
        gallery: branding.galleryUrls || [],
        video: branding.videoUrl || undefined,
      };

      setPreviewUrls(newPreviewUrls);
    }
  }, [formState.branding]);

  // Helper function to check if URL is a blob/object URL
  const isObjectUrl = (url: string): boolean => {
    return url.startsWith('blob:');
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup logo URL
      if (previewUrls.logo && isObjectUrl(previewUrls.logo)) {
        URL.revokeObjectURL(previewUrls.logo);
      }
      // Cleanup banner URL
      if (previewUrls.banner && isObjectUrl(previewUrls.banner)) {
        URL.revokeObjectURL(previewUrls.banner);
      }
      // Cleanup gallery URLs
      if (previewUrls.gallery) {
        previewUrls.gallery.forEach((url) => {
          if (isObjectUrl(url)) {
            URL.revokeObjectURL(url);
          }
        });
      }
      // Cleanup video URL
      if (previewUrls.video && isObjectUrl(previewUrls.video)) {
        URL.revokeObjectURL(previewUrls.video);
      }
    };
  }, [previewUrls]);

  // Helper function to validate file
  const validateFile = (
    file: File,
    allowedTypes: string[],
    maxSize: number
  ): { isValid: boolean; error?: string } => {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not supported. Please use ${allowedTypes
          .map((type) => type.split('/')[1])
          .join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File too large. Maximum size is ${maxSizeMB}MB`,
      };
    }

    return { isValid: true };
  };

  // Helper function to build image URL
  const buildImageUrl = (fileUrl: string): string => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    if (fileUrl.startsWith('blob:')) return fileUrl;

    // Use absolute URLs for production
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'https://localhost:7008';
    const normalizedPath = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
    const finalUrl = `${baseUrl}${normalizedPath}`;

    return finalUrl;
  };

  // Handle file selection
  const handleFileSelect = async (
    type: 'logo' | 'banner' | 'gallery' | 'video',
    files: FileList | null
  ) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file
    let validation;
    if (type === 'video') {
      validation = validateFile(file, ALLOWED_VIDEO_TYPES, MAX_VIDEO_SIZE);
    } else {
      validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
    }

    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (type === 'logo') {
      setPreviewUrls((prev) => ({
        ...prev,
        logo: previewUrl,
      }));

      // Immediately upload logo
      await uploadSingleFile('logo', file);
    } else if (type === 'banner') {
      setPreviewUrls((prev) => ({
        ...prev,
        banner: previewUrl,
      }));

      // Immediately upload banner
      await uploadSingleFile('banner', file);
    } else if (type === 'gallery') {
      const newPreviewUrls = [previewUrl];
      setPreviewUrls((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newPreviewUrls],
      }));

      // Immediately upload gallery images
      await uploadGalleryFiles([file]);
    } else if (type === 'video') {
      setVideoFile(file);
      setPreviewUrls((prev) => ({
        ...prev,
        video: previewUrl,
      }));
    }
  };

  // Upload single file (logo or banner)
  const uploadSingleFile = async (type: 'logo' | 'banner', file: File) => {
    try {
      let response: StoreImage | undefined;

      if (type === 'logo') {
        response = await OpenShopApiService.uploadLogo(
          formState.storeId!,
          file
        );
      } else if (type === 'banner') {
        response = await OpenShopApiService.uploadBanner(
          formState.storeId!,
          file
        );
      }

      if (response?.filePath) {
        const imageUrl = buildImageUrl(response.filePath);

        updateFormState({
          branding: {
            ...formState.branding,
            [`${type}Url`]: imageUrl,
          },
        });

        toast.success(
          `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`
        );
      }
    } catch (error) {
      console.error(`❌ ${type} upload failed:`, error);
      toast.error(`Failed to upload ${type}`);
    }
  };

  // Upload gallery files
  const uploadGalleryFiles = async (files: File[]) => {
    try {
      const responses = await OpenShopApiService.uploadGalleryImages(
        formState.storeId!,
        files
      );

      if (responses && responses.length > 0) {
        const galleryUrls = responses
          .map((response) => buildImageUrl(response.filePath))
          .filter((url) => url !== '');

        updateFormState({
          branding: {
            ...formState.branding,
            galleryUrls: [
              ...(formState.branding?.galleryUrls || []),
              ...galleryUrls,
            ],
          },
        });

        toast.success('Gallery images uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Gallery upload failed:', error);
      toast.error('Failed to upload gallery images');
    }
  };

  // Remove gallery image
  const removeGalleryImage = (index: number) => {
    const updatedGallery = [...(previewUrls.gallery || [])];
    const removedUrl = updatedGallery[index];

    // Cleanup object URL if it's a blob
    if (removedUrl && isObjectUrl(removedUrl)) {
      URL.revokeObjectURL(removedUrl);
    }

    updatedGallery.splice(index, 1);

    setPreviewUrls((prev) => ({
      ...prev,
      gallery: updatedGallery,
    }));

    // Update form state
    const updatedGalleryUrls = [...(formState.branding?.galleryUrls || [])];
    updatedGalleryUrls.splice(index, 1);

    updateFormState({
      branding: {
        ...formState.branding,
        galleryUrls: updatedGalleryUrls,
      },
    });
  };

  // Remove video
  const removeVideo = () => {
    if (previewUrls.video && isObjectUrl(previewUrls.video)) {
      URL.revokeObjectURL(previewUrls.video);
    }

    setVideoFile(null);
    setPreviewUrls((prev) => ({
      ...prev,
      video: undefined,
    }));

    updateFormState({
      branding: {
        ...formState.branding,
        videoUrl: undefined,
      },
    });
  };

  // Upload video
  const uploadVideo = async () => {
    if (!videoFile) return;

    try {
      const videoResponse = await OpenShopApiService.uploadStoreVideo(
        formState.storeId!,
        videoFile
      );
      const uploadedVideoUrl =
        videoResponse?.fileUrl || videoResponse?.filePath || '';

      if (uploadedVideoUrl) {
        updateFormState({
          branding: {
            ...formState.branding,
            videoUrl: uploadedVideoUrl,
          },
        });
      }
    } catch (error) {
      console.error('❌ Video upload failed:', error);
      toast.error('Video upload failed');
    }
  };

  // Handle next step
  const handleNext = async () => {
    // Upload video if not already uploaded
    if (videoFile && !formState.branding?.videoUrl) {
      await uploadVideo();
    }

    // Validate that we have at least a logo
    if (!formState.branding?.logoUrl) {
      toast.error('Please upload a store logo');
      return;
    }

    onNext();
  };

  // Handle skip
  const handleSkip = () => {
    // Skip branding step
    updateFormState({
      branding: {
        logoUrl: formState.branding?.logoUrl,
        bannerUrl: formState.branding?.bannerUrl,
        galleryUrls: formState.branding?.galleryUrls,
        videoUrl: formState.branding?.videoUrl,
      },
    });
    onNext();
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Brand Your Store
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Add visual elements to make your store stand out. Upload a logo, banner,
        gallery images, and a video to showcase your products.
      </Typography>

      {/* Logo Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Store Logo
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Upload your store logo. This will be displayed on your storefront and
          in search results.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {previewUrls.logo ? (
            <Avatar src={previewUrls.logo} sx={{ width: 100, height: 100 }} />
          ) : (
            <Avatar sx={{ width: 100, height: 100 }} />
          )}

          <Box>
            <Button variant='outlined' component='label' sx={{ mb: 1 }}>
              Upload Logo
              <input
                type='file'
                hidden
                accept={ALLOWED_IMAGE_TYPES.join(',')}
                ref={logoInputRef}
                onChange={(e) => handleFileSelect('logo', e.target.files)}
              />
            </Button>
            <Typography
              variant='caption'
              display='block'
              color='text.secondary'
            >
              Recommended: 200x200px, PNG or JPG
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Banner Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Store Banner
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Add a banner image that will be displayed at the top of your
          storefront.
        </Typography>

        <Box sx={{ mb: 2 }}>
          {previewUrls.banner ? (
            <Box
              component='img'
              src={previewUrls.banner}
              sx={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 150,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography color='text.secondary'>No banner uploaded</Typography>
            </Box>
          )}
        </Box>

        <Button variant='outlined' component='label' sx={{ mb: 1 }}>
          Upload Banner
          <input
            type='file'
            hidden
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            ref={bannerInputRef}
            onChange={(e) => handleFileSelect('banner', e.target.files)}
          />
        </Button>
        <Typography variant='caption' display='block' color='text.secondary'>
          Recommended: 1200x400px, PNG or JPG
        </Typography>
      </Paper>

      {/* Gallery Upload */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant='h6' gutterBottom>
          Gallery Images
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Add multiple images to showcase your products and store environment.
        </Typography>

        {previewUrls.gallery && previewUrls.gallery.length > 0 && (
          <ImageList sx={{ mb: 2 }} cols={3} gap={8}>
            {previewUrls.gallery.map((url, index) => (
              <ImageListItem key={index}>
                <Box
                  component='img'
                  src={url}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                  }}
                >
                  <Chip
                    label='Remove'
                    size='small'
                    onClick={() => removeGalleryImage(index)}
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  />
                </Box>
              </ImageListItem>
            ))}
          </ImageList>
        )}

        <Button variant='outlined' component='label' sx={{ mb: 1 }}>
          Add Gallery Images
          <input
            type='file'
            hidden
            multiple
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            ref={galleryInputRef}
            onChange={(e) => handleFileSelect('gallery', e.target.files)}
          />
        </Button>
        <Typography variant='caption' display='block' color='text.secondary'>
          You can upload multiple images at once
        </Typography>
      </Paper>

      {/* Video Upload */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          Store Video
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Add a video to showcase your store, products, or story.
        </Typography>

        {previewUrls.video ? (
          <Box sx={{ mb: 2 }}>
            <video
              controls
              style={{
                width: '100%',
                maxHeight: 300,
                borderRadius: 8,
                objectFit: 'cover',
              }}
              src={previewUrls.video}
            />
            <Button
              variant='outlined'
              color='error'
              onClick={removeVideo}
              sx={{ mt: 1 }}
            >
              Remove Video
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: 200,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <Typography color='text.secondary'>No video uploaded</Typography>
          </Box>
        )}

        <Button variant='outlined' component='label' sx={{ mb: 1 }}>
          Upload Video
          <input
            type='file'
            hidden
            accept={ALLOWED_VIDEO_TYPES.join(',')}
            ref={videoInputRef}
            onChange={(e) => handleFileSelect('video', e.target.files)}
          />
        </Button>
        <Typography variant='caption' display='block' color='text.secondary'>
          Supported formats: MP4, AVI, MOV, WMV, WebM (max 100MB)
        </Typography>
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button onClick={onPrevious} variant='outlined'>
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleSkip} variant='outlined' color='secondary'>
            Skip for Now
          </Button>
          <Button onClick={handleNext} variant='contained'>
            Continue
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BrandingStep;
