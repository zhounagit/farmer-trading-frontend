import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '../../../services/storefront.api';
import { API_CONFIG } from '../../../utils/api';

interface HeroBannerModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const HeroBannerModule: React.FC<HeroBannerModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};

  // Get settings with fallbacks - Industrial Professional style
  const title =
    (settings.title as string) ||
    `${storefront.storeName} Industrial Solutions`;
  const subtitle =
    (settings.subtitle as string) ||
    storefront.description ||
    'Professional-grade products and reliable service for your business needs';
  const ctaText = (settings.ctaText as string) || 'Browse Catalog';
  const textAlignment = (settings.textAlignment as string) || 'center';
  const height = (settings.height as string) || 'large';
  const overlayOpacity = (settings.overlayOpacity as number) || 0.4;

  // Use background image from module settings, fall back to store banner if not set
  let backgroundImage =
    (settings.backgroundImage as string) ||
    storefront.store.bannerUrl ||
    storefront.bannerUrl;

  // Convert relative URLs to absolute URLs with API base
  if (backgroundImage && backgroundImage.startsWith('/')) {
    backgroundImage = `${API_CONFIG.BASE_URL}${backgroundImage}`;
  }

  // Only encode the URL if it's still a relative path (no protocol)
  if (backgroundImage && !backgroundImage.startsWith('http')) {
    backgroundImage = encodeURI(backgroundImage);
  }

  // Debug logging for background image
  console.log('🖼️ HeroBannerModule background image debug:', {
    originalBackgroundImage: settings.backgroundImage,
    storeBannerUrl: storefront.store.bannerUrl,
    storefrontBannerUrl: storefront.bannerUrl,
    finalBackgroundImage: backgroundImage,
    isRelativePath: backgroundImage && backgroundImage.startsWith('/'),
    isAbsolutePath: backgroundImage && backgroundImage.startsWith('http'),
    apiBaseUrl: API_CONFIG.BASE_URL,
    moduleId: module.id,
    moduleType: module.type,
  });

  // Test image loading and CSS validity
  React.useEffect(() => {
    if (backgroundImage) {
      console.log('🧪 Testing background image:', backgroundImage);

      // Log the exact CSS that will be applied
      const cssBackgroundImage = backgroundImage
        ? `url("${backgroundImage}")`
        : 'none';
      console.log('🎨 CSS backgroundImage property:', cssBackgroundImage);

      // Test 1: Direct image loading
      const testImage = new Image();
      testImage.onload = () => {
        console.log('✅ Direct image load successful:', backgroundImage);
        console.log(
          '✅ Image dimensions:',
          testImage.width,
          'x',
          testImage.height
        );
      };
      testImage.onerror = (error) => {
        console.error('❌ Direct image load failed:', backgroundImage);
        console.error('❌ Error details:', error);
        console.error('❌ Test image src that failed:', testImage.src);
      };
      testImage.src = backgroundImage;

      // Test 2: Check if it's a valid URL format
      try {
        const url = new URL(backgroundImage);
        // Valid URL format
      } catch (e) {
        // Invalid URL format
      }

      // Test 3: Fetch test
      fetch(backgroundImage)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.blob();
        })
        .then((blob) => {
          // Image loaded successfully
        })
        .catch((error) => {
          // Image fetch failed
        });
    }
  }, [backgroundImage]);

  // Height mappings
  const getHeight = () => {
    switch (height) {
      case 'small':
        return { xs: 300, md: 350 };
      case 'medium':
        return { xs: 400, md: 450 };
      case 'large':
        return { xs: 500, md: 600 };
      case 'extra-large':
        return { xs: 600, md: 700 };
      default:
        return { xs: 500, md: 600 };
    }
  };

  const getTextAlign = () => {
    switch (textAlignment) {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
      default:
        return 'center';
    }
  };

  const handleCtaClick = () => {
    // Scroll to products section or first product module
    const productsSection =
      document.getElementById('products') ||
      document.querySelector('[id^="module-"][id*="product"]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Additional debug logging for the Box component
  React.useEffect(() => {
    // Apply background image styles if available
  }, [backgroundImage]);

  return (
    <Box
      sx={{
        position: 'relative',
        height: getHeight(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: getTextAlign(),
        backgroundImage: backgroundImage
          ? `url("${backgroundImage}")`
          : 'linear-gradient(135deg, var(--theme-primary, #1E3A8A) 0%, var(--theme-secondary, #1E40AF) 50%, var(--theme-accent, #3B82F6) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: backgroundImage
            ? `linear-gradient(135deg, var(--theme-shadow, rgba(30, 58, 138, ${overlayOpacity})) 0%, var(--theme-shadow, rgba(30, 64, 175, ${overlayOpacity * 0.8})) 100%)`
            : 'none',
          zIndex: 1,
        },
      }}
    >
      {/* Industrial grid pattern overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><g fill='%23ffffff' fill-opacity='0.05'><path d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/></g></g></svg>")`,
          backgroundSize: '60px 60px',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <Container
        maxWidth='xl'
        sx={{
          position: 'relative',
          zIndex: 3,
          textAlign: textAlignment as 'left' | 'center' | 'right',
          px: { xs: 3, md: 6 },
        }}
      >
        <Stack
          spacing={4}
          alignItems={
            textAlignment === 'left'
              ? 'flex-start'
              : textAlignment === 'right'
                ? 'flex-end'
                : 'center'
          }
          sx={{
            maxWidth: { md: textAlignment === 'center' ? '800px' : '70%' },
            margin: textAlignment === 'center' ? '0 auto' : 'initial',
          }}
        >
          {/* Title */}
          <Typography
            variant='h1'
            component='h1'
            sx={{
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              lineHeight: { xs: 1.2, md: 1.1 },
              fontFamily:
                'var(--theme-font-primary, Inter, -apple-system, BlinkMacSystemFont, sans-serif)',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </Typography>

          {/* Subtitle */}
          {subtitle && (
            <Typography
              variant='h5'
              component='p'
              sx={{
                fontSize: { xs: '1.125rem', md: '1.25rem', lg: '1.375rem' },
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                opacity: 0.95,
                lineHeight: 1.4,
                fontFamily:
                  'var(--theme-font-secondary, Inter, -apple-system, BlinkMacSystemFont, sans-serif)',
                maxWidth: { xs: '100%', md: '600px' },
              }}
            >
              {subtitle}
            </Typography>
          )}

          {/* Call to Action Button */}
          {ctaText && (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent:
                  textAlignment === 'center' ? 'center' : 'flex-start',
              }}
            >
              <Button
                variant='contained'
                size='large'
                onClick={handleCtaClick}
                endIcon={<ArrowForward />}
                sx={{
                  py: 2.5,
                  px: 5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--theme-accent, #F59E0B)',
                  color: 'var(--theme-background, white)',
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  boxShadow:
                    '0 4px 14px var(--theme-shadow, rgba(245, 158, 11, 0.3))',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--theme-primary, #D97706)',
                    transform: 'translateY(-1px)',
                    boxShadow:
                      '0 6px 20px var(--theme-shadow, rgba(245, 158, 11, 0.4))',
                  },
                }}
              >
                {ctaText}
              </Button>
              <Button
                variant='outlined'
                size='large'
                sx={{
                  py: 2.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: 'var(--theme-background, white)',
                  borderColor: 'var(--theme-background, white)',
                  borderWidth: 2,
                  borderRadius: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'var(--theme-background, white)',
                    borderWidth: 2,
                  },
                }}
              >
                Request Quote
              </Button>
            </Box>
          )}
        </Stack>
      </Container>

      {/* Trust indicators */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 1,
          zIndex: 3,
        }}
      >
        <Typography
          variant='caption'
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Professional Grade
        </Typography>
        <Typography
          variant='caption'
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Trusted by Industry Leaders
        </Typography>
      </Box>
    </Box>
  );
};

export default HeroBannerModule;
