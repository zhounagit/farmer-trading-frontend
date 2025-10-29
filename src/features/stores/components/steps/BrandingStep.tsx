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
      videoUrl: branding?.videoUrl,
    });

    if (branding) {
      const newPreviewUrls = {
        logo: branding.logoUrl || undefined,
        banner: branding.bannerUrl || undefined,
        gallery: branding.galleryUrls || [],
        video: branding.videoUrl || undefined,
      };

      console.log(
        '🖼️ BrandingStep - New preview URLs being set:',
        newPreviewUrls
      );
      setPreviewUrls(newPreviewUrls);
    }
  }, [formState.branding]);

  // Ensure gallery images are properly loaded from branding data
  useEffect(() => {
    if (
      formState.branding?.galleryUrls &&
      formState.branding.galleryUrls.length > 0
    ) {
      console.log(
        '🖼️ Loading gallery images from branding data:',
        formState.branding.galleryUrls
      );
      setPreviewUrls((prev) => ({
        ...prev,
        gallery: formState.branding.galleryUrls || [],
      }));
    }
  }, [formState.branding?.galleryUrls]);

  // Cleanup effect to revoke object URLs on unmount
  useEffect(() => {
    return () => {
      // Only revoke object URLs (blob:), not server URLs
      const isObjectUrl = (url: string) => url && url.startsWith('blob:');

      if (previewUrls.logo && isObjectUrl(previewUrls.logo)) {
        console.log('🔄 Cleanup: Revoking logo blob URL');
        URL.revokeObjectURL(previewUrls.logo);
      }
      if (previewUrls.banner && isObjectUrl(previewUrls.banner)) {
        console.log('🔄 Cleanup: Revoking banner blob URL');
        URL.revokeObjectURL(previewUrls.banner);
      }
      if (previewUrls.gallery) {
        previewUrls.gallery.forEach((url) => {
          if (isObjectUrl(url)) {
            console.log('🔄 Cleanup: Revoking gallery blob URL');
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, [previewUrls]);

  const validateFile = (
    file: File,
    type: 'logo' | 'banner' | 'gallery' | 'video'
  ): Promise<string | null> => {
    if (type === 'video') {
      if (file.size > MAX_VIDEO_SIZE) {
        return Promise.resolve('Video file size must be less than 100MB');
      }
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return Promise.resolve(
          'Only MP4, AVI, MOV, WMV, and WebM videos are allowed'
        );
      }
    } else {
      if (file.size > MAX_FILE_SIZE) {
        return Promise.resolve('File size must be less than 5MB');
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return Promise.resolve('Only JPEG, PNG, and WebP images are allowed');
      }
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
    const blobUrl = URL.createObjectURL(file);
    console.log(`🔄 Created blob URL for ${file.name}:`, blobUrl);
    return blobUrl;
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner' | 'gallery' | 'video'
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // For video, only allow one file
    if (type === 'video' && files.length > 1) {
      toast.error('Please select only one video file');
      return;
    }

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      const error = await validateFile(file, type);
      if (error) {
        toast.error(error);
        continue;
      }
      validFiles.push(file);

      if (type === 'video') {
        // For video, store the file and create preview
        setVideoFile(file);
        const videoPreviewUrl = createPreviewUrl(file);
        setPreviewUrls((prev) => ({ ...prev, video: videoPreviewUrl }));
      } else {
        newPreviewUrls.push(createPreviewUrl(file));
      }
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
      console.log(`🖼️ Set logo preview URL:`, newPreviewUrls[0]);

      // Immediately upload logo
      await uploadSingleFile('logo', validFiles[0]);
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
      console.log(`🖼️ Set banner preview URL:`, newPreviewUrls[0]);

      // Immediately upload banner
      await uploadSingleFile('banner', validFiles[0]);
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
      console.log(`🖼️ Set gallery preview URLs:`, allPreviews);

      // Immediately upload gallery images
      await uploadGalleryFiles(validFiles);
    }
  };

  const uploadGalleryFiles = async (files: File[]) => {
    if (!formState.storeId) {
      toast.error('Store ID not found');
      return false;
    }

    try {
      console.log(
        `🚀 Starting immediate upload for gallery:`,
        files.map((f) => f.name)
      );

      const galleryResponse = await OpenShopApiService.uploadGalleryImages(
        formState.storeId,
        files
      );

      // Update preview URLs with actual server URLs
      const newGalleryUrls = galleryResponse.map((image) => image.fileUrl);
      setPreviewUrls((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newGalleryUrls].slice(0, 6),
      }));

      // Update form state with server URLs
      const currentUrls = formState.branding.galleryUrls || [];
      updateFormState({
        branding: {
          ...formState.branding,
          galleryUrls: [...currentUrls, ...newGalleryUrls].slice(0, 6),
          galleryFiles: (formState.branding.galleryFiles || []).filter(
            (f) => !files.includes(f)
          ),
        },
      });

      toast.success('Gallery images uploaded successfully!');
      console.log(
        `✅ Immediate upload completed for gallery:`,
        galleryResponse
      );
      return true;
    } catch (error: unknown) {
      console.error(`❌ Immediate upload failed for gallery:`, error);
      toast.error(`Failed to upload gallery images. Please try again.`);
      return false;
    }
  };

  const uploadSingleFile = async (
    type: 'logo' | 'banner' | 'gallery',
    file: File
  ) => {
    if (!formState.storeId) {
      toast.error('Store ID not found');
      return false;
    }

    try {
      console.log(`🚀 Starting immediate upload for ${type}:`, file.name);

      let response: StoreImage | null = null;
      if (type === 'logo') {
        response = await OpenShopApiService.uploadLogo(formState.storeId, file);

        console.log('🔍 Logo upload response:', response);
        console.log('🔍 Response fileUrl:', response?.fileUrl);

        // Update preview URL with actual server URL
        setPreviewUrls((prev) => {
          console.log('🔍 Setting logo preview URL:', response?.fileUrl);
          console.log('🔍 Previous preview URLs:', prev);
          const newUrls = {
            ...prev,
            logo: response?.fileUrl || '',
          };
          console.log('🔍 New preview URLs:', newUrls);
          return newUrls;
        });

        // Update form state with server URL
        updateFormState({
          branding: {
            ...formState.branding,
            logoUrl: response?.fileUrl || '',
            logoFile: undefined, // Clear file after successful upload
          },
        });
        console.log(
          '✅ Logo uploaded - Updated form state with logoUrl:',
          response?.fileUrl
        );

        toast.success('Logo uploaded successfully!');
      } else if (type === 'banner') {
        response = await OpenShopApiService.uploadBanner(
          formState.storeId,
          file
        );

        console.log('🔍 Banner upload response:', response);
        console.log('🔍 Response fileUrl:', response?.fileUrl);

        // Update preview URL with actual server URL
        setPreviewUrls((prev) => {
          console.log('🔍 Setting banner preview URL:', response?.fileUrl);
          console.log('🔍 Previous preview URLs:', prev);
          const newUrls = {
            ...prev,
            banner: response?.fileUrl || '',
          };
          console.log('🔍 New preview URLs:', newUrls);
          return newUrls;
        });

        // Update form state with server URL
        updateFormState({
          branding: {
            ...formState.branding,
            bannerUrl: response?.fileUrl || '',
            bannerFile: undefined, // Clear file after successful upload
          },
        });
        console.log(
          '✅ Banner uploaded - Updated form state with bannerUrl:',
          response?.fileUrl
        );

        toast.success('Banner uploaded successfully!');
      } else if (type === 'gallery') {
        // Use the gallery upload function for single gallery files
        await uploadGalleryFiles([file]);
        response = { fileUrl: 'gallery-uploaded' } as StoreImage; // Placeholder since gallery doesn't return single URL
      }

      if (!response) {
        console.error('❌ No response received from upload');
        return false;
      }

      console.log(`✅ Immediate upload completed for ${type}:`, response);
      return true;
    } catch (error: unknown) {
      console.error(`❌ Immediate upload failed for ${type}:`, error);
      toast.error(`Failed to upload ${type}. Please try again.`);
      return false;
    }
  };

  const uploadFiles = async () => {
    if (!formState.storeId) {
      toast.error('Store ID not found');
      return false;
    }

    try {
      // Upload logo if not already uploaded
      if (formState.branding.logoFile && !formState.branding.logoUrl) {
        await uploadSingleFile('logo', formState.branding.logoFile);
      }

      // Upload banner if not already uploaded
      if (formState.branding.bannerFile && !formState.branding.bannerUrl) {
        await uploadSingleFile('banner', formState.branding.bannerFile);
      }

      // Upload gallery images if not already uploaded
      if (
        formState.branding.galleryFiles &&
        formState.branding.galleryFiles.length > 0
      ) {
        await uploadGalleryFiles(formState.branding.galleryFiles);
      }

      // Upload video if not already uploaded
      if (videoFile && !formState.branding.videoUrl) {
        console.log('🎬 Starting video upload for store:', formState.storeId);
        try {
          const videoResponse = await OpenShopApiService.uploadStoreVideo(
            formState.storeId,
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
            console.log('✅ Video uploaded successfully:', uploadedVideoUrl);
          }
        } catch (error) {
          console.error('❌ Video upload failed:', error);
          toast.error('Failed to upload video. Please try again.');
          return false;
        }
      }

      return true;
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images. Please try again.');
      return false;
    }
  };

  const handleNext = async () => {
    // Debug current branding state before proceeding
    console.log('🔄 BrandingStep handleNext - Current branding state:', {
      logoFile: !!formState.branding.logoFile,
      logoUrl: formState.branding.logoUrl,
      bannerFile: !!formState.branding.bannerFile,
      bannerUrl: formState.branding.bannerUrl,
      galleryFiles: formState.branding.galleryFiles?.length || 0,
      galleryUrls: formState.branding.galleryUrls?.length || 0,
      videoFile: !!videoFile,
      videoUrl: formState.branding.videoUrl,
    });

    // Check if there are any files that haven't been uploaded yet
    const hasUnuploadedFiles =
      (formState.branding.logoFile && !formState.branding.logoUrl) ||
      (formState.branding.bannerFile && !formState.branding.bannerUrl) ||
      (formState.branding.galleryFiles &&
        formState.branding.galleryFiles.length > 0) ||
      (videoFile && !formState.branding.videoUrl);

    if (hasUnuploadedFiles) {
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
      <Typography variant='h4' gutterBottom>
        Branding & Visuals
      </Typography>

      <Typography variant='body1' sx={{ mb: 4 }}>
        Make your store stand out with custom images and videos.
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant='h6' gutterBottom>
            Store Logo
          </Typography>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
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
                />
                <Typography variant='body2' gutterBottom>
                  Current Logo
                </Typography>
              </Box>
            )}
            <Button
              variant={previewUrls.logo ? 'outlined' : 'contained'}
              onClick={() => logoInputRef.current?.click()}
            >
              {previewUrls.logo ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            <input
              ref={logoInputRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'logo')}
            />
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant='h6' gutterBottom>
            Store Banner
          </Typography>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
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
                />
                <Typography variant='body2' gutterBottom sx={{ mt: 1 }}>
                  Current Banner
                </Typography>
              </Box>
            )}
            <Button
              variant={previewUrls.banner ? 'outlined' : 'contained'}
              onClick={() => bannerInputRef.current?.click()}
            >
              {previewUrls.banner ? 'Replace Banner' : 'Upload Banner'}
            </Button>
            <input
              ref={bannerInputRef}
              type='file'
              accept='image/*'
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e, 'banner')}
            />
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          Gallery ({previewUrls.gallery?.length || 0}/6)
        </Typography>
        <Paper sx={{ p: 2 }}>
          {previewUrls.gallery && previewUrls.gallery.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <ImageList cols={3} rowHeight={120} gap={8}>
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
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              No images uploaded yet
            </Typography>
          )}
          <Button
            variant={previewUrls.gallery?.length ? 'outlined' : 'contained'}
            onClick={() => galleryInputRef.current?.click()}
            disabled={(previewUrls.gallery?.length || 0) >= 6}
          >
            {previewUrls.gallery?.length
              ? 'Add More Images'
              : 'Upload Gallery Images'}
          </Button>
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

      {/* Video Upload Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          Store Introduction Video
        </Typography>
        <Paper sx={{ p: 2 }}>
          {previewUrls.video ? (
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  maxWidth: 400,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              >
                <video
                  src={previewUrls.video}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <Typography variant='body2' gutterBottom sx={{ mt: 1 }}>
                Current Video
              </Typography>
              {videoFile && (
                <Chip
                  label={`${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`}
                  size='small'
                  color='primary'
                  variant='outlined'
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          ) : (
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              No video uploaded yet
            </Typography>
          )}
          <Button
            variant={previewUrls.video ? 'outlined' : 'contained'}
            onClick={() => videoInputRef.current?.click()}
          >
            {previewUrls.video ? 'Replace Video' : 'Upload Video'}
          </Button>
          <input
            ref={videoInputRef}
            type='file'
            accept='video/*'
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e, 'video')}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 1 }}
          >
            Supported formats: MP4, AVI, MOV, WMV, WebM (max 100MB)
          </Typography>
        </Paper>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mt: 4,
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
            Back to Store Policies
          </Button>

          <Button
            variant='text'
            onClick={handleSkip}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              px: 2,
            }}
          >
            Skip for Now
          </Button>
        </Box>

        <Button
          variant='contained'
          onClick={handleNext}
          size='large'
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            order: { xs: 1, sm: 2 },
          }}
        >
          Continue to Review
        </Button>
      </Box>
    </Box>
  );
};

export default BrandingStep;
