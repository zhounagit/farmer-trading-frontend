import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  ThemeProvider,
  createTheme,
  Chip,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Share,
  Favorite,
  FavoriteBorder,
  Store as StoreIcon,
} from '@mui/icons-material';
import StorefrontApiService from '../services/storefrontApi';
import type { PublicStorefront } from '../types/public-storefront';
import {
  AVAILABLE_THEMES,
  generateThemeCSS,
  type StorefrontTheme,
} from '../../../types/themes';
import { StorefrontModules } from '../../../components/storefront/StorefrontModuleRenderer';
import { API_CONFIG } from '../../../utils/api';

const PublishedStorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [themeCSS, setThemeCSS] = useState<string>('');
  const [muiTheme, setMuiTheme] = useState(createTheme());

  // Helper function to convert relative URLs to absolute
  const getImageUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${API_CONFIG.BASE_URL}${url}`;
    return `${API_CONFIG.BASE_URL}/${url}`;
  };

  useEffect(() => {
    const loadStorefront = async () => {
      console.log('🔍 PublishedStorePage loading with slug:', slug);

      if (!slug) {
        console.error('❌ No slug provided to PublishedStorePage');
        setError('Store not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🚀 Calling getPublicStorefront with slug:', slug);

        const response = await StorefrontApiService.getPublicStorefront(slug);
        console.log('📦 Raw API response:', response);
        console.log('📦 Response type:', typeof response);
        console.log(
          '📦 Response keys:',
          response ? Object.keys(response) : 'null'
        );

        // Handle different response formats
        let data: PublicStorefront | null = null;

        if (response && typeof response === 'object') {
          // Check if it's wrapped in a data property
          if ('data' in response && response.data) {
            data = response.data as PublicStorefront;
            console.log('✅ Found data in response.data');
          } else if ('storeName' in response && 'storeId' in response) {
            // Response is already the storefront data
            data = response as PublicStorefront;
            console.log('✅ Response is direct storefront data');
          } else {
            console.warn(
              '⚠️ Response structure:',
              JSON.stringify(response, null, 2)
            );
          }
        }

        if (!data) {
          throw new Error('Unable to parse storefront data from API response');
        }

        console.log('📦 Storefront data extracted:', {
          storeName: data.storeName,
          slug: data.slug,
          modulesCount: data.customization?.modules?.length || 0,
          isPublished: data.customization?.isPublished,
          bannerUrl: data.bannerUrl,
          logoUrl: data.logoUrl,
        });

        setStorefront(data);

        // Apply theme if available
        if (data.customization?.themeId) {
          const selectedTheme = AVAILABLE_THEMES.find(
            (t: StorefrontTheme) => t.id === data.customization.themeId
          );

          if (selectedTheme) {
            const dynamicMuiTheme = createTheme({
              palette: {
                primary: {
                  main: selectedTheme.colors.primary,
                },
                secondary: {
                  main: selectedTheme.colors.secondary,
                },
                background: {
                  default: selectedTheme.colors.background,
                  paper: selectedTheme.colors.surface,
                },
                text: {
                  primary: selectedTheme.colors.text.primary,
                  secondary: selectedTheme.colors.text.secondary,
                },
              },
              typography: {
                fontFamily: selectedTheme.typography.fontFamily.primary,
              },
            });
            setMuiTheme(dynamicMuiTheme);

            // Generate and apply theme CSS
            const css = generateThemeCSS(selectedTheme);
            setThemeCSS(css);
          }
        }
      } catch (err) {
        console.error('Error loading storefront:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace',
        });
        setError(
          `Failed to load storefront: ${
            err instanceof Error ? err.message : 'Unknown error'
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [slug]);

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: storefront?.storeName,
        text: storefront?.description,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='60vh'
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !storefront) {
    return (
      <Container maxWidth='md' sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity='error' sx={{ mb: 4 }}>
          {error || 'Store not found'}
        </Alert>
        <Button
          variant='contained'
          startIcon={<ArrowBack />}
          onClick={() => navigate('/browse')}
        >
          Browse Other Stores
        </Button>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={muiTheme}>
      {/* Inject additional theme CSS variables */}
      {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}

      <Box>
        {/* Header Navigation */}
        <Box
          sx={{
            py: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 2 }}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<ArrowBack />}
                  onClick={() => {
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      navigate('/browse');
                    }
                  }}
                  sx={{
                    minWidth: 'auto',
                    px: { xs: 1, sm: 2 },
                    color: 'text.secondary',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Back</Box>
                </Button>
                <Breadcrumbs>
                  <Link
                    color='inherit'
                    href='/browse'
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/browse');
                    }}
                    sx={{ fontSize: '0.875rem' }}
                  >
                    Browse Stores
                  </Link>
                  <Typography
                    color='text.primary'
                    sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    {storefront.storeName}
                  </Typography>
                </Breadcrumbs>
              </Box>

              <Box display='flex' gap={1}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleToggleFavorite}
                  color={isFavorited ? 'error' : 'primary'}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<Share />}
                  onClick={handleShare}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Share
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Store Banner Section - Only show if no hero-banner module exists */}
        {(!storefront.customization?.modules ||
          !storefront.customization.modules.some(
            (m) => m.type === 'hero-banner'
          )) && (
          <Box
            sx={{
              position: 'relative',
              height: { xs: 200, sm: 300, md: 400 },
              backgroundImage: storefront.bannerUrl
                ? `url(${getImageUrl(storefront.bannerUrl)})`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              overflow: 'visible',
            }}
          >
            {/* Logo Overlay */}
            {storefront.logoUrl && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: { xs: 20, md: 40 },
                  zIndex: 10,
                }}
              >
                <Avatar
                  src={getImageUrl(storefront.logoUrl)}
                  alt={storefront.storeName}
                  sx={{
                    width: { xs: 100, md: 140 },
                    height: { xs: 100, md: 140 },
                    border: '4px solid white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Store Info Section */}
        <Box
          sx={{
            backgroundColor: 'white',
            pt: { xs: 8, md: 10 },
            pb: 4,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                mt: -6,
              }}
            >
              {/* Store Logo - Display prominently */}
              {storefront.logoUrl && (
                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Avatar
                    src={getImageUrl(storefront.logoUrl)}
                    alt={storefront.storeName}
                    sx={{
                      width: { xs: 120, md: 160 },
                      height: { xs: 120, md: 160 },
                      border: '3px solid',
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Box>
              )}
              {/* Store Details */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <StoreIcon color='primary' />
                  <Typography variant='h3' component='h1'>
                    {storefront.storeName}
                  </Typography>
                </Box>
                {storefront.description && (
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    paragraph
                    sx={{ maxWidth: '600px' }}
                  >
                    {storefront.description}
                  </Typography>
                )}
                {storefront.isActive && (
                  <Chip
                    label='Active'
                    color='success'
                    variant='outlined'
                    size='medium'
                    sx={{ mt: 1 }}
                  />
                )}

                {/* Store Categories */}
                {storefront.store?.categories &&
                  storefront.store.categories.length > 0 && (
                    <Box
                      sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 3 }}
                    >
                      {storefront.store.categories.map((category, index) => (
                        <Chip
                          key={index}
                          label={category.name}
                          variant='outlined'
                          size='small'
                        />
                      ))}
                    </Box>
                  )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Dynamic Module Rendering */}
        <Box sx={{ minHeight: '80vh' }}>
          <StorefrontModules storefront={storefront} />
        </Box>

        {/* Fallback: If no modules are configured, show basic store info */}
        {(!storefront.customization?.modules ||
          storefront.customization.modules.length === 0) && (
          <Box
            sx={{
              py: 8,
              minHeight: '80vh',
              backgroundColor: 'background.default',
            }}
          >
            <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
              <Box textAlign='center' sx={{ mb: 8 }}>
                <Typography variant='h2' component='h1' gutterBottom>
                  {storefront.storeName}
                </Typography>
                {storefront.description && (
                  <Typography variant='h5' color='text.secondary' paragraph>
                    {storefront.description}
                  </Typography>
                )}
              </Box>
            </Container>
          </Box>
        )}

        {/* Footer */}
        <Box
          component='footer'
          sx={{
            backgroundColor: '#1F2937',
            color: 'white',
            py: 6,
            mt: 8,
          }}
        >
          <Container maxWidth='xl'>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant='body2'>
                © {new Date().getFullYear()} {storefront.storeName}. All rights
                reserved.
              </Typography>
              <Typography variant='caption' sx={{ mt: 1 }}>
                Powered by HelloNeighbors
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PublishedStorePage;
