import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Preview,
  Info,
  Close,
  Palette,
  BusinessCenter,
  LocalFlorist,
  Whatshot,
  Build,
  PhotoLibrary,
  MinimizeOutlined,
  CrisisAlert,
  Diamond,
  Restore,
} from '@mui/icons-material';
import { AVAILABLE_THEMES, type StorefrontTheme } from '../../types/themes';

interface ThemeSelectorProps {
  selectedThemeId?: string;
  onThemeSelect: (theme: StorefrontTheme) => void;
  onPreviewTheme?: (theme: StorefrontTheme) => void;
  disabled?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onThemeSelect,
  onPreviewTheme,
  disabled = false,
}) => {
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<StorefrontTheme | null>(
    null
  );
  const [hasError, setHasError] = useState(false);

  // Validate themes on component mount
  React.useEffect(() => {
    try {
      if (!AVAILABLE_THEMES || AVAILABLE_THEMES.length === 0) {
        throw new Error('No themes available');
      }

      // Validate each theme has required properties
      AVAILABLE_THEMES.forEach((theme, index) => {
        if (!theme) {
          throw new Error(`Theme at index ${index} is null or undefined`);
        }
        if (
          !theme.id ||
          !theme.name ||
          !theme.colors ||
          !theme.recommendedFor
        ) {
          throw new Error(
            `Theme "${theme.name || 'unknown'}" is missing required properties`
          );
        }
        if (!Array.isArray(theme.recommendedFor)) {
          throw new Error(
            `Theme "${theme.name}" recommendedFor is not an array`
          );
        }
      });

      setHasError(false);
    } catch (error) {
      // ThemeSelector validation error
      setHasError(true);
    }
  }, []);

  // Component rendering

  // Error state
  if (hasError) {
    return (
      <Alert severity='error' sx={{ mb: 2 }}>
        <Typography variant='h6' gutterBottom>
          Theme Loading Error
        </Typography>
        <Typography variant='body2'>
          There was an error loading the available themes. Please refresh the
          page or contact support.
        </Typography>
      </Alert>
    );
  }

  // Safety check for themes array
  if (!AVAILABLE_THEMES || AVAILABLE_THEMES.length === 0) {
    return (
      <Alert severity='warning' sx={{ mb: 2 }}>
        <Typography variant='h6' gutterBottom>
          No Themes Available
        </Typography>
        <Typography variant='body2'>
          No themes are currently available. Please try again later.
        </Typography>
      </Alert>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'modern':
        return <BusinessCenter sx={{ fontSize: 20 }} />;
      case 'rustic':
        return <LocalFlorist sx={{ fontSize: 20 }} />;
      case 'vibrant':
        return <Whatshot sx={{ fontSize: 20 }} />;
      case 'industrial':
        return <Build sx={{ fontSize: 20 }} />;
      case 'gallery':
        return <PhotoLibrary sx={{ fontSize: 20 }} />;
      case 'minimalist':
        return <MinimizeOutlined sx={{ fontSize: 20 }} />;
      case 'bold':
        return <CrisisAlert sx={{ fontSize: 20 }} />;
      case 'luxe':
        return <Diamond sx={{ fontSize: 20 }} />;
      case 'vintage':
        return <Restore sx={{ fontSize: 20 }} />;
      case 'playful':
        return <Whatshot sx={{ fontSize: 20 }} />;
      default:
        return <Palette sx={{ fontSize: 20 }} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'modern':
        return '#2563eb';
      case 'rustic':
        return '#92400e';
      case 'vibrant':
        return '#dc2626';
      case 'industrial':
        return '#1e40af';
      case 'gallery':
        return '#374151';
      case 'minimalist':
        return '#6b7280';
      case 'bold':
        return '#000000';
      case 'luxe':
        return '#d4af37';
      case 'vintage':
        return '#8b4513';
      case 'playful':
        return '#ec4899';
      default:
        return '#64748b';
    }
  };

  const handlePreviewClick = (theme: StorefrontTheme) => {
    try {
      if (!theme) {
        throw new Error('Theme is null or undefined');
      }
      setPreviewTheme(theme);
      setPreviewDialogOpen(true);
      if (onPreviewTheme) {
        onPreviewTheme(theme);
      }
    } catch (error) {
      // Error in handlePreviewClick
      setHasError(true);
    }
  };

  const handleThemeSelect = (theme: StorefrontTheme) => {
    try {
      if (!theme) {
        throw new Error('Theme is null or undefined');
      }
      onThemeSelect(theme);
    } catch (error) {
      // Error in handleThemeSelect
      setHasError(true);
    }
  };

  // Group themes by category
  const themesByCategory = AVAILABLE_THEMES.reduce(
    (acc, theme) => {
      if (!acc[theme.category]) {
        acc[theme.category] = [];
      }
      acc[theme.category].push(theme);
      return acc;
    },
    {} as Record<string, StorefrontTheme[]>
  );

  const categoryLabels = {
    modern: 'Modern & Clean',
    rustic: 'Rustic & Natural',
    vibrant: 'Bold & Vibrant',
    industrial: 'Industrial & Professional',
    gallery: 'Gallery & Creative',
    minimalist: 'Minimalist & Simple',
    bold: 'Bold & Impactful',
    luxe: 'Luxury & Premium',
    vintage: 'Vintage & Classic',
  };

  return (
    <Box>
      <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
        Choose Your Store Theme
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        Select a theme that best represents your brand and products. You can
        customize colors and fonts later.
      </Alert>

      {/* Theme Categories */}
      {Object.entries(themesByCategory).map(([category, themes]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {getCategoryIcon(category)}
            <Typography
              variant='h6'
              sx={{
                ml: 1,
                color: getCategoryColor(category),
                fontWeight: 600,
              }}
            >
              {categoryLabels[category as keyof typeof categoryLabels] ||
                category}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
            }}
          >
            {themes
              .filter((theme) => theme && theme.id && theme.name)
              .map((theme) => (
                <Box
                  key={theme.id}
                  sx={{
                    flex: '1 1 300px',
                    minWidth: 300,
                    maxWidth: 400,
                  }}
                >
                  <Card
                    sx={{
                      position: 'relative',
                      cursor: disabled ? 'default' : 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      border:
                        selectedThemeId === theme.id
                          ? `2px solid ${getCategoryColor(theme.category)}`
                          : '2px solid transparent',
                      '&:hover': disabled
                        ? {}
                        : {
                            transform: 'translateY(-2px)',
                            boxShadow: 3,
                          },
                      opacity: disabled ? 0.6 : 1,
                    }}
                    onClick={() => !disabled && handleThemeSelect(theme)}
                  >
                    {/* Selected indicator */}
                    {selectedThemeId === theme.id && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 2,
                          backgroundColor: getCategoryColor(theme.category),
                          borderRadius: '50%',
                          p: 0.5,
                        }}
                      >
                        <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                    )}

                    {/* Theme preview image */}
                    <CardMedia
                      component='div'
                      sx={{
                        height: 160,
                        background: `linear-gradient(135deg, ${theme.colors?.primary || '#000'}, ${theme.colors?.secondary || '#333'})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Mock storefront preview */}
                      <Box
                        sx={{
                          width: '90%',
                          height: '80%',
                          backgroundColor: theme.colors?.background || '#fff',
                          borderRadius: 1,
                          p: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {/* Header bar */}
                        <Box
                          sx={{
                            height: 8,
                            backgroundColor: theme.colors?.primary || '#000',
                            borderRadius: 0.5,
                            width: '100%',
                          }}
                        />

                        {/* Content blocks */}
                        <Box sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
                          <Box
                            sx={{
                              flex: 1,
                              backgroundColor:
                                theme.colors?.surface || '#f5f5f5',
                              borderRadius: 0.5,
                            }}
                          />
                          <Box
                            sx={{
                              flex: 1,
                              backgroundColor: theme.colors?.accent || '#666',
                              borderRadius: 0.5,
                            }}
                          />
                        </Box>

                        {/* Product grid mockup */}
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                          {[1, 2, 3].map((i) => (
                            <Box
                              key={i}
                              sx={{
                                flex: 1,
                                height: 16,
                                backgroundColor:
                                  theme.colors?.text?.muted || '#999',
                                borderRadius: 0.3,
                                opacity: 0.3,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardMedia>

                    <CardContent sx={{ pb: 2 }}>
                      {/* Theme category chip */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Chip
                          icon={getCategoryIcon(theme.category)}
                          label={
                            theme.category.charAt(0).toUpperCase() +
                            theme.category.slice(1)
                          }
                          size='small'
                          sx={{
                            backgroundColor: getCategoryColor(theme.category),
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      {/* Theme name and description */}
                      <Typography
                        variant='h6'
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {theme.name}
                      </Typography>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 2, minHeight: 40 }}
                      >
                        {theme.description}
                      </Typography>

                      {/* Recommended for tags */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ mb: 0.5, display: 'block' }}
                        >
                          Best for:
                        </Typography>
                        <Box
                          sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          {theme.recommendedFor
                            ?.slice(0, 2)
                            .map((item, index) => (
                              <Chip
                                key={index}
                                label={item}
                                size='small'
                                variant='outlined'
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )) || []}
                          {theme.recommendedFor &&
                            theme.recommendedFor.length > 2 && (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                +{theme.recommendedFor.length - 2} more
                              </Typography>
                            )}
                        </Box>
                      </Box>

                      {/* Action buttons */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          startIcon={<Preview />}
                          size='small'
                          variant='outlined'
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewClick(theme);
                          }}
                          disabled={disabled}
                        >
                          Preview
                        </Button>

                        {selectedThemeId === theme.id ? (
                          <Button
                            startIcon={<CheckCircle />}
                            size='small'
                            variant='contained'
                            sx={{
                              backgroundColor: getCategoryColor(theme.category),
                              '&:hover': {
                                backgroundColor: getCategoryColor(
                                  theme.category
                                ),
                                filter: 'brightness(0.9)',
                              },
                            }}
                          >
                            Selected
                          </Button>
                        ) : (
                          <Button
                            size='small'
                            variant='contained'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleThemeSelect(theme);
                            }}
                            disabled={disabled}
                            sx={{
                              backgroundColor: getCategoryColor(theme.category),
                              '&:hover': {
                                backgroundColor: getCategoryColor(
                                  theme.category
                                ),
                                filter: 'brightness(0.9)',
                              },
                            }}
                          >
                            Select
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
          </Box>
        </Box>
      ))}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Preview />
            <Typography variant='h6'>{previewTheme?.name} Preview</Typography>
          </Box>
          <IconButton onClick={() => setPreviewDialogOpen(false)} size='small'>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {previewTheme && (
            <Box>
              {/* Theme info */}
              {previewTheme.inspiration && (
                <Alert severity='info' sx={{ mb: 3 }} icon={<Info />}>
                  {previewTheme.inspiration}
                </Alert>
              )}

              {/* Color palette preview */}
              <Typography
                variant='subtitle1'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Color Palette
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                {previewTheme.colors &&
                  Object.entries(previewTheme.colors).map(([key, value]) => {
                    if (typeof value === 'string') {
                      return (
                        <Tooltip key={key} title={`${key}: ${value}`}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: value,
                              borderRadius: 1,
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                            }}
                          />
                        </Tooltip>
                      );
                    }
                    return null;
                  })}
              </Box>

              {/* Typography preview */}
              <Typography
                variant='subtitle1'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Typography
              </Typography>
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  backgroundColor: previewTheme.colors.surface,
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant='h4'
                  sx={{
                    fontFamily: previewTheme.typography?.fontFamily?.primary,
                    color: previewTheme.colors?.text?.primary,
                    mb: 1,
                  }}
                >
                  Your Farm Store
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontFamily:
                      previewTheme.typography?.fontFamily?.secondary ||
                      previewTheme.typography?.fontFamily?.primary,
                    color: previewTheme.colors?.text?.secondary,
                  }}
                >
                  Fresh, locally-grown produce delivered straight from our farm
                  to your table.
                </Typography>
              </Box>

              {/* Recommended for */}
              <Typography
                variant='subtitle1'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Perfect For
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {previewTheme.recommendedFor?.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    variant='outlined'
                    sx={{
                      borderColor: previewTheme.colors?.primary,
                      color: previewTheme.colors?.primary,
                    }}
                  />
                )) || []}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {previewTheme && (
            <Button
              variant='contained'
              onClick={() => {
                handleThemeSelect(previewTheme);
                setPreviewDialogOpen(false);
              }}
              disabled={disabled}
              sx={{
                backgroundColor: getCategoryColor(previewTheme.category),
                '&:hover': {
                  backgroundColor: getCategoryColor(previewTheme.category),
                  filter: 'brightness(0.9)',
                },
              }}
            >
              Select This Theme
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThemeSelector;
