import React, { useState } from 'react';
import { Box, Container, Typography, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { PublicStorefront } from '@/features/storefront/types/public-storefront';

interface GalleryMediaSectionProps {
  storefront: PublicStorefront;
}

interface GalleryImage {
  imageId: number;
  filePath: string;
  imageType: string;
  caption?: string;
  displayOrder: number;
  uploadedAt: string;
}

interface VideoData {
  imageId: number;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
  isExternalVideo?: boolean;
}

const GalleryMediaSection: React.FC<GalleryMediaSectionProps> = ({
  storefront,
}) => {
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Get gallery images - filter only gallery type images
  const galleryImages: GalleryImage[] =
    storefront.store?.galleryImages?.filter(
      (img) => img.imageType === 'gallery'
    ) || [];

  // Get video if available
  const videoData: VideoData | undefined = storefront.store?.video;

  // Debug logging

  // Early return if no gallery or video
  if (galleryImages.length === 0 && !videoData) {
    return null;
  }

  // Helper to get absolute image URL
  const getImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `https://localhost:7008${url}`;
    return `https://localhost:7008/${url}`;
  };

  // Handle gallery navigation
  const handleNextImage = (): void => {
    setGalleryIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = (): void => {
    setGalleryIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  // Render video section
  const renderVideoSection = (): React.ReactNode => {
    if (!videoData) {
      return null;
    }

    const videoUrl = getImageUrl(videoData.filePath);
    const isExternalVideo =
      videoData.isExternalVideo ||
      videoUrl.includes('youtube') ||
      videoUrl.includes('vimeo');

    return (
      <Box sx={{ mb: galleryImages.length > 0 ? 6 : 0 }}>
        <Typography
          variant='h3'
          component='h3'
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: 'var(--theme-primary, #2563eb)',
            fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
          }}
        >
          Our Video
        </Typography>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--theme-background, #f0f0f0)',
            borderRadius: 'var(--theme-radius-lg, 12px)',
            overflow: 'hidden',
            border: '1px solid var(--theme-border, #e2e8f0)',
          }}
        >
          {isExternalVideo ? (
            <iframe
              src={videoUrl}
              title='Store Video'
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
        </Box>
      </Box>
    );
  };

  // Render gallery section
  const renderGallerySection = (): React.ReactNode => {
    if (galleryImages.length === 0) {
      return null;
    }

    const currentImage = galleryImages[galleryIndex];

    return (
      <Box>
        <Typography
          variant='h3'
          component='h3'
          sx={{
            mb: 3,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: 'var(--theme-primary, #2563eb)',
            fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
          }}
        >
          Gallery
        </Typography>

        {/* Main Gallery Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 9',
            backgroundColor: 'var(--theme-background, #f0f0f0)',
            borderRadius: 'var(--theme-radius-lg, 12px)',
            overflow: 'hidden',
            border: '1px solid var(--theme-border, #e2e8f0)',
            mb: 3,
          }}
        >
          <Box
            component='img'
            src={getImageUrl(currentImage.filePath)}
            alt={currentImage.caption || 'Gallery image'}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.backgroundColor = '#e2e8f0';
            }}
          />

          {/* Navigation Buttons */}
          {galleryImages.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                aria-label='Previous image'
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  transition: 'background-color 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                aria-label='Next image'
              >
                <ChevronRight />
              </IconButton>
            </>
          )}

          {/* Image Counter */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 'var(--theme-radius-md, 8px)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {galleryIndex + 1} / {galleryImages.length}
          </Box>
        </Box>

        {/* Image Caption */}
        {currentImage.caption && (
          <Typography
            variant='body2'
            sx={{
              textAlign: 'center',
              color: 'var(--theme-text-secondary, #475569)',
              mb: 3,
              fontStyle: 'italic',
            }}
          >
            {currentImage.caption}
          </Typography>
        )}

        {/* Thumbnail Strip */}
        {galleryImages.length > 1 && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '3px',
              },
            }}
          >
            {galleryImages.map((image, index) => (
              <Box
                key={image.imageId}
                onClick={() => setGalleryIndex(index)}
                sx={{
                  flexShrink: 0,
                  width: 80,
                  height: 80,
                  borderRadius: 'var(--theme-radius-md, 8px)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '3px solid',
                  borderColor:
                    index === galleryIndex
                      ? 'var(--theme-primary, #2563eb)'
                      : 'var(--theme-border, #e2e8f0)',
                  transition: 'border-color 0.2s ease',
                  '&:hover': {
                    borderColor: 'var(--theme-primary, #2563eb)',
                  },
                }}
                role='button'
                tabIndex={0}
                aria-label={`View image ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setGalleryIndex(index);
                  }
                }}
              >
                <Box
                  component='img'
                  src={getImageUrl(image.filePath)}
                  alt={image.caption || `Gallery thumbnail ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = '#e2e8f0';
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: 'var(--theme-background, white)',
      }}
    >
      <Container maxWidth='lg' sx={{ px: { xs: 2, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 8 },
            backgroundColor: 'var(--theme-surface, #f8fafc)',
            borderRadius: 'var(--theme-radius-lg, 12px)',
            border: '1px solid var(--theme-border, #e2e8f0)',
          }}
        >
          {renderVideoSection()}
          {renderGallerySection()}
        </Paper>
      </Container>
    </Box>
  );
};

export default GalleryMediaSection;
