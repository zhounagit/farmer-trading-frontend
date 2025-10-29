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
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Share,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';
import StorefrontApiService, {
  type PublicStorefront,
} from '../../services/storefront.api';
import {
  AVAILABLE_THEMES,
  generateThemeCSS,
  type StorefrontTheme,
} from '../../types/themes';
import {
  StorefrontModules,
  getFooterModules,
} from '../../components/storefront/StorefrontModuleRenderer';
import StorefrontModuleRenderer from '../../components/storefront/StorefrontModuleRenderer';
import type { StorefrontModule } from '../../services/storefront.api';
import ThemeSwitcher from '../../components/storefront/ThemeSwitcher';

interface FooterModuleItem {
  id: string;
  title: string;
  type: string;
  section?: string;
  originalModule: StorefrontModule;
}

const PublishedStorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [themeCSS, setThemeCSS] = useState<string>('');
  const [muiTheme, setMuiTheme] = useState(createTheme());
  const [currentTheme, setCurrentTheme] = useState<StorefrontTheme | null>(
    null
  );
  const [expandedFooterModule, setExpandedFooterModule] = useState<
    string | null
  >(null);

  useEffect(() => {
    const loadStorefront = async () => {
      console.log('🔍 PublishedStorePage loading with slug:', slug);
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 URL pathname:', window.location.pathname);

      if (!slug) {
        console.error('❌ No slug provided to PublishedStorePage');
        setError('Store not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🚀 Calling getPublicStorefront with slug:', slug);
        const data = await StorefrontApiService.getPublicStorefront(slug);

        // Debug: Check storefront modules and settings
        console.log('📋 Storefront data loaded:', {
          storeName: data.storeName,
          moduleCount: Array.isArray(data.customization?.modules)
            ? data.customization.modules.length
            : 0,
          modules: Array.isArray(data.customization?.modules)
            ? data.customization.modules.map((m) => ({
                type: m.type,
                hasSettings: !!m.settings && Object.keys(m.settings).length > 0,
                settingsKeys: m.settings ? Object.keys(m.settings) : [],
              }))
            : [],
          lastUpdated: data.customization?.updatedAt,
          isPublished: data.customization?.isPublished,
        });

        setStorefront(data);

        // Apply theme to Material-UI and generate CSS
        let selectedTheme: StorefrontTheme | null = null;

        if (data.customization?.themeId) {
          selectedTheme =
            AVAILABLE_THEMES.find((t) => t.id === data.customization.themeId) ||
            null;

          if (selectedTheme) {
            // Create Material-UI theme from storefront theme
            const dynamicMuiTheme = createTheme({
              palette: {
                primary: {
                  main: selectedTheme.colors.primary,
                  light: selectedTheme.colors.secondary,
                  dark: selectedTheme.colors.accent,
                },
                secondary: {
                  main: selectedTheme.colors.secondary,
                  light: selectedTheme.colors.accent,
                  dark: selectedTheme.colors.primary,
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
                h1: { fontSize: selectedTheme.typography.fontSize['4xl'] },
                h2: { fontSize: selectedTheme.typography.fontSize['3xl'] },
                h3: { fontSize: selectedTheme.typography.fontSize['2xl'] },
                h4: { fontSize: selectedTheme.typography.fontSize.xl },
                h5: { fontSize: selectedTheme.typography.fontSize.lg },
                h6: { fontSize: selectedTheme.typography.fontSize.base },
              },
              shape: {
                borderRadius: parseInt(selectedTheme.layout.borderRadius.md),
              },
            });

            setMuiTheme(dynamicMuiTheme);
            setCurrentTheme(selectedTheme);

            // Generate CSS variables as fallback
            const css = generateThemeCSS(selectedTheme);
            setThemeCSS(css);
          }
        }

        // Fallback to custom CSS if available but no theme
        if (!selectedTheme && data.customization?.customCss) {
          setThemeCSS(data.customization.customCss);
        }

        // Record the view for analytics
        await StorefrontApiService.recordView(slug);
      } catch (err) {
        console.error('Failed to load storefront:', err);
        setError('Failed to load storefront');
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storefront?.storeName,
          text: storefront?.description,
          url: window.location.href,
        });
      } catch {
        // Handle sharing error silently
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
      } catch {
        // Handle clipboard error silently
      }
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality with backend
  };

  const handleThemeChange = (theme: StorefrontTheme) => {
    setCurrentTheme(theme);

    // Update MUI theme
    const dynamicMuiTheme = createTheme({
      palette: {
        primary: {
          main: theme.colors.primary,
          light: theme.colors.secondary,
          dark: theme.colors.accent,
        },
        secondary: {
          main: theme.colors.secondary,
          light: theme.colors.accent,
          dark: theme.colors.primary,
        },
        background: {
          default: theme.colors.background,
          paper: theme.colors.surface,
        },
        text: {
          primary: theme.colors.text.primary,
          secondary: theme.colors.text.secondary,
        },
      },
      typography: {
        fontFamily: theme.typography.fontFamily.primary,
      },
    });
    setMuiTheme(dynamicMuiTheme);

    // Update CSS variables
    const css = generateThemeCSS(theme);
    setThemeCSS(css);
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
                <Tooltip title='Go back to previous page'>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<ArrowBack />}
                    onClick={() => {
                      // Smart back navigation with fallback
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        // Fallback to browse page if no history
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
                      '& .MuiButton-startIcon': {
                        marginRight: { xs: 0, sm: 1 },
                      },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      Back
                    </Box>
                  </Button>
                </Tooltip>
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
                <Typography
                  variant='h2'
                  component='h1'
                  gutterBottom
                  sx={{ mb: 3 }}
                >
                  {storefront.storeName}
                </Typography>
                {storefront.description && (
                  <Typography
                    variant='h5'
                    color='text.secondary'
                    sx={{ mb: 6, maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}
                  >
                    {storefront.description}
                  </Typography>
                )}
              </Box>

              {storefront.products && storefront.products.length > 0 && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 6,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Typography
                    variant='h4'
                    component='h2'
                    sx={{ mb: 4, fontWeight: 600 }}
                  >
                    Our Products
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ fontSize: '1.125rem' }}
                  >
                    {storefront.products.length} products available
                  </Typography>
                </Box>
              )}
            </Container>
          </Box>
        )}

        {/* Store Footer */}
        <Box
          sx={{
            py: 6,
            backgroundColor: 'grey.900',
            color: 'white',
            mt: 0,
            borderTop: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
            {/* Footer Modules - Compact Policy Section and Contact Form */}
            {(() => {
              const footerModules = getFooterModules(storefront);
              if (footerModules.length === 0) return null;

              const handleToggleModule = (moduleId: string) => {
                setExpandedFooterModule(
                  expandedFooterModule === moduleId ? null : moduleId
                );
              };

              // Create individual policy sections from policy-section module
              const createPolicySections = (
                module: StorefrontModule
              ): FooterModuleItem[] => {
                if (module.type !== 'policy-section') return [];

                return [
                  {
                    id: `${module.id}-business-hours`,
                    title: 'Business Hours',
                    type: 'policy-section',
                    section: 'business-hours',
                    originalModule: module,
                  },
                  {
                    id: `${module.id}-payment-terms`,
                    title: 'Payment & Terms',
                    type: 'policy-section',
                    section: 'payment-terms',
                    originalModule: module,
                  },
                  {
                    id: `${module.id}-shipping-logistics`,
                    title: 'Shipping & Logistics',
                    type: 'policy-section',
                    section: 'shipping-logistics',
                    originalModule: module,
                  },
                  {
                    id: `${module.id}-returns-warranty`,
                    title: 'Returns & Warranty',
                    type: 'policy-section',
                    section: 'returns-warranty',
                    originalModule: module,
                  },
                ];
              };

              // Expand policy sections into individual items
              const expandedFooterModules: FooterModuleItem[] =
                footerModules.flatMap((module): FooterModuleItem[] => {
                  if (module.type === 'policy-section') {
                    return createPolicySections(module);
                  } else if (module.type === 'contact-form') {
                    return [
                      {
                        id: module.id,
                        title: 'Contact Us',
                        type: 'contact-form',
                        originalModule: module,
                      } as FooterModuleItem,
                    ];
                  }
                  return [];
                });

              return (
                <Box
                  sx={{
                    mb: 6,
                    pb: 4,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(5, 1fr)',
                      },
                      gap: 2,
                      mb: expandedFooterModule ? 4 : 0,
                    }}
                  >
                    {expandedFooterModules.map((item: FooterModuleItem) => (
                      <Box
                        key={item.id}
                        sx={{
                          textAlign: 'center',
                          cursor: 'pointer',
                          py: 1.5,
                          px: 2,
                          borderRadius: 1,
                          transition: 'all 0.2s ease',
                          backgroundColor:
                            expandedFooterModule === item.id
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'transparent',
                          border:
                            expandedFooterModule === item.id
                              ? '1px solid rgba(255, 255, 255, 0.3)'
                              : '1px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.12)',
                            transform: 'translateY(-1px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          },
                        }}
                        onClick={() => handleToggleModule(item.id)}
                      >
                        <Typography
                          variant='body2'
                          sx={{
                            color: 'white',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          variant='caption'
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            display: 'block',
                            mt: 0.5,
                            fontSize: '0.7rem',
                            fontWeight: 400,
                          }}
                        >
                          {expandedFooterModule === item.id
                            ? '▲ Collapse'
                            : '▼ View'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Expanded Module Content */}
                  {expandedFooterModule && (
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: 2,
                        p: 3,
                        mt: 3,
                        color: '#1F2937',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        backdropFilter: 'blur(10px)',
                        animation: 'slideDown 0.3s ease-out',
                        '@keyframes slideDown': {
                          '0%': {
                            opacity: 0,
                            transform: 'translateY(-10px)',
                            maxHeight: 0,
                          },
                          '100%': {
                            opacity: 1,
                            transform: 'translateY(0)',
                            maxHeight: '1000px',
                          },
                        },
                        '& .MuiContainer-root': {
                          px: { xs: 0, md: 0 },
                          backgroundColor: 'transparent',
                        },
                        '& .MuiBox-root': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiPaper-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          color: '#1F2937',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        },
                        '& .MuiTypography-root': {
                          color: '#1F2937',
                          '&.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6':
                            {
                              color: '#111827',
                              fontWeight: 600,
                            },
                        },
                        '& .MuiTextField-root': {
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            color: '#1F2937',
                            '& fieldset': {
                              borderColor: 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(0, 0, 0, 0.87)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                              color: 'primary.main',
                            },
                          },
                        },
                        '& .MuiAccordion-root': {
                          backgroundColor: 'white',
                          color: '#1F2937',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          '&:before': {
                            display: 'none',
                          },
                        },
                        '& .MuiAccordionSummary-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                          color: '#1F2937',
                          '&.Mui-expanded': {
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          },
                        },
                        '& .MuiAccordionDetails-root': {
                          backgroundColor: 'white',
                          color: '#1F2937',
                        },
                        '& .MuiButton-root': {
                          '&.MuiButton-contained': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            },
                          },
                          '&.MuiButton-outlined': {
                            color: 'primary.main',
                            borderColor: 'primary.main',
                          },
                        },
                        '& .MuiChip-root': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        },
                        '& .MuiList-root': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiListItem-root': {
                          color: '#1F2937',
                        },
                        '& .MuiListItemText-root': {
                          '& .MuiListItemText-primary': {
                            color: '#1F2937',
                          },
                          '& .MuiListItemText-secondary': {
                            color: '#6B7280',
                          },
                        },
                        '& .MuiDivider-root': {
                          backgroundColor: 'rgba(0, 0, 0, 0.12)',
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#6B7280',
                        },
                        '& .MuiIconButton-root': {
                          color: '#6B7280',
                        },
                        '& .MuiAlert-root': {
                          backgroundColor: '#F3F4F6',
                          color: '#1F2937',
                        },
                        '& .MuiFormLabel-root': {
                          color: 'rgba(0, 0, 0, 0.6)',
                        },
                        '& .MuiSelect-root': {
                          backgroundColor: 'white',
                          color: '#1F2937',
                        },
                      }}
                    >
                      {expandedFooterModules
                        .filter(
                          (item: FooterModuleItem) =>
                            item.id === expandedFooterModule
                        )
                        .map(
                          (
                            item: FooterModuleItem,
                            index: number
                          ): React.ReactElement | null => {
                            if (item.type === 'contact-form') {
                              return (
                                <StorefrontModuleRenderer
                                  key={item.id}
                                  module={item.originalModule}
                                  storefront={storefront}
                                  index={index}
                                />
                              );
                            } else if (item.type === 'policy-section') {
                              // Render individual policy section
                              const module = item.originalModule;
                              const settings = module.settings || {};
                              const businessHours =
                                (settings.businessHours as Array<{
                                  dayOfWeek: number;
                                  openTime: string;
                                  closeTime: string;
                                  isClosed: boolean;
                                }>) || [];
                              const paymentMethods =
                                (settings.paymentMethods as string[]) || [];

                              const dayNames = [
                                'Sunday',
                                'Monday',
                                'Tuesday',
                                'Wednesday',
                                'Thursday',
                                'Friday',
                                'Saturday',
                              ];

                              const renderBusinessHours = () => (
                                <Box>
                                  <Typography
                                    variant='h6'
                                    sx={{ mb: 2, color: '#1F2937' }}
                                  >
                                    Business Hours
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{ mb: 2, color: '#6B7280' }}
                                  >
                                    Our professional service hours for orders,
                                    support, and deliveries.
                                  </Typography>
                                  {businessHours.length > 0 ? (
                                    <Box>
                                      {businessHours
                                        .sort(
                                          (a, b) => a.dayOfWeek - b.dayOfWeek
                                        )
                                        .map((hour) => (
                                          <Box
                                            key={hour.dayOfWeek}
                                            sx={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              py: 1,
                                              borderBottom: '1px solid #E5E7EB',
                                            }}
                                          >
                                            <Typography
                                              variant='body2'
                                              sx={{
                                                fontWeight: 600,
                                                color: '#1F2937',
                                              }}
                                            >
                                              {dayNames[hour.dayOfWeek]}
                                            </Typography>
                                            <Typography
                                              variant='body2'
                                              sx={{
                                                color: hour.isClosed
                                                  ? '#DC2626'
                                                  : '#059669',
                                                fontWeight: 500,
                                              }}
                                            >
                                              {hour.isClosed
                                                ? 'Closed'
                                                : `${hour.openTime} - ${hour.closeTime}`}
                                            </Typography>
                                          </Box>
                                        ))}
                                    </Box>
                                  ) : (
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                    >
                                      Business hours not configured
                                    </Typography>
                                  )}
                                </Box>
                              );

                              const renderPaymentTerms = () => (
                                <Box>
                                  <Typography
                                    variant='h6'
                                    sx={{ mb: 2, color: '#1F2937' }}
                                  >
                                    Payment & Terms
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{ mb: 3, color: '#6B7280' }}
                                  >
                                    Secure payment options designed for business
                                    customers.
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: 1,
                                    }}
                                  >
                                    {(paymentMethods.length > 0
                                      ? paymentMethods
                                      : [
                                          'Credit Card',
                                          'Corporate Account',
                                          'Purchase Order',
                                          'Bank Transfer',
                                        ]
                                    ).map((method) => (
                                      <Chip
                                        key={method}
                                        label={method}
                                        size='small'
                                        sx={{
                                          backgroundColor: '#1E3A8A',
                                          color: 'white',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              );

                              const renderShippingLogistics = () => (
                                <Box>
                                  <Typography
                                    variant='h6'
                                    sx={{ mb: 2, color: '#1F2937' }}
                                  >
                                    Shipping & Logistics
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{ mb: 2, color: '#6B7280' }}
                                  >
                                    Professional shipping solutions for your
                                    business needs.
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: 1,
                                    }}
                                  >
                                    {[
                                      'Standard Delivery',
                                      'Express Shipping',
                                      'Freight Services',
                                      'Local Pickup',
                                    ].map((option) => (
                                      <Chip
                                        key={option}
                                        label={option}
                                        size='small'
                                        variant='outlined'
                                        sx={{ fontSize: '0.75rem' }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              );

                              const renderReturnsWarranty = () => (
                                <Box>
                                  <Typography
                                    variant='h6'
                                    sx={{ mb: 2, color: '#1F2937' }}
                                  >
                                    Returns & Warranty
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    sx={{ mb: 2, color: '#6B7280' }}
                                  >
                                    Comprehensive warranty and return policies
                                    for your protection.
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      gap: 1,
                                    }}
                                  >
                                    {[
                                      '30-Day Returns',
                                      'Manufacturer Warranty',
                                      'Professional Support',
                                    ].map((feature) => (
                                      <Chip
                                        key={feature}
                                        label={feature}
                                        size='small'
                                        sx={{
                                          backgroundColor: '#059669',
                                          color: 'white',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              );

                              // Render the specific section based on item.section
                              switch (item.section) {
                                case 'business-hours':
                                  return (
                                    <Box key={item.id}>
                                      {renderBusinessHours()}
                                    </Box>
                                  );
                                case 'payment-terms':
                                  return (
                                    <Box key={item.id}>
                                      {renderPaymentTerms()}
                                    </Box>
                                  );
                                case 'shipping-logistics':
                                  return (
                                    <Box key={item.id}>
                                      {renderShippingLogistics()}
                                    </Box>
                                  );
                                case 'returns-warranty':
                                  return (
                                    <Box key={item.id}>
                                      {renderReturnsWarranty()}
                                    </Box>
                                  );
                                default:
                                  return null;
                              }
                            }
                            return null;
                          }
                        )}
                    </Box>
                  )}
                </Box>
              );
            })()}

            {/* Main Footer Content */}
            <Box
              sx={{
                textAlign: 'center',
                mb: 3,
                pt: getFooterModules(storefront).length > 0 ? 4 : 0,
              }}
            >
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                {storefront.storeName}
              </Typography>
              <Typography variant='body2' color='grey.300' sx={{ mb: 3 }}>
                © {new Date().getFullYear()} {storefront.storeName}. All rights
                reserved.
              </Typography>
              {(() => {
                const footerText =
                  storefront.customization?.globalSettings?.footerText;
                if (footerText && typeof footerText === 'string') {
                  return (
                    <Typography
                      variant='body2'
                      color='grey.400'
                      sx={{ fontStyle: 'italic' }}
                    >
                      {footerText}
                    </Typography>
                  );
                }
                return null;
              })()}
            </Box>

            <Box
              sx={{
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'grey.700',
                textAlign: 'center',
              }}
            >
              <Typography variant='caption' color='grey.500'>
                Powered by HelloNeighbors Farm-to-Table Platform
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      {/* Theme Switcher for Testing */}
      <ThemeSwitcher
        currentTheme={currentTheme || undefined}
        onThemeChange={handleThemeChange}
        showInProduction={false}
      />
    </ThemeProvider>
  );
};

export default PublishedStorePage;
