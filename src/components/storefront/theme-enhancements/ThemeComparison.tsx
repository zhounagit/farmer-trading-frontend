import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CompareArrows,
  Check,
  Close,
  Info,
  Palette,
  FormatSize,
  ViewModule,
  Speed,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { AVAILABLE_THEMES, type StorefrontTheme } from '../../../types/themes';

interface ThemeComparisonProps {
  selectedThemes?: string[];
  onThemeSelect?: (themeId: string) => void;
  maxComparison?: number;
}

const ThemeComparison: React.FC<ThemeComparisonProps> = ({
  selectedThemes = [],
  onThemeSelect,
  maxComparison = 3,
}) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [compareThemes, setCompareThemes] = useState<string[]>(selectedThemes);
  const [showDetails, setShowDetails] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const themesToCompare = AVAILABLE_THEMES.filter((theme) =>
    compareThemes.includes(theme.id)
  );

  const toggleThemeComparison = (themeId: string) => {
    if (compareThemes.includes(themeId)) {
      setCompareThemes(compareThemes.filter((id) => id !== themeId));
    } else if (compareThemes.length < maxComparison) {
      setCompareThemes([...compareThemes, themeId]);
    }
  };

  const toggleFavorite = (themeId: string) => {
    if (favorites.includes(themeId)) {
      setFavorites(favorites.filter((id) => id !== themeId));
    } else {
      setFavorites([...favorites, themeId]);
    }
  };

  const getFeatureComparison = () => {
    const features = [
      {
        category: 'Visual Style',
        items: [
          { name: 'Color Scheme', key: 'colors' },
          { name: 'Typography', key: 'typography' },
          { name: 'Border Radius', key: 'borderRadius' },
          { name: 'Shadows', key: 'shadows' },
        ],
      },
      {
        category: 'Layout',
        items: [
          { name: 'Container Width', key: 'maxWidth' },
          { name: 'Spacing', key: 'spacing' },
          { name: 'Grid System', key: 'grid' },
          { name: 'Responsive Design', key: 'responsive' },
        ],
      },
      {
        category: 'Best For',
        items: [
          { name: 'Product Types', key: 'productTypes' },
          { name: 'Business Model', key: 'businessModel' },
          { name: 'Target Audience', key: 'audience' },
          { name: 'Brand Personality', key: 'personality' },
        ],
      },
    ];

    return features;
  };

  const getThemeScore = (theme: StorefrontTheme, criteria: string): number => {
    // Simplified scoring system based on theme characteristics
    const scores: Record<string, Record<string, number>> = {
      professional: {
        'clean-modern': 10,
        'industrial-professional': 10,
        'minimalist-scandinavian': 9,
        'modern-luxe': 8,
      },
      creative: {
        'gallery-expressive': 10,
        'playful-quirky': 9,
        'bold-brutalist': 8,
        'vintage-retro': 7,
      },
      authentic: {
        'rustic-artisanal': 10,
        'vintage-retro': 9,
        'playful-quirky': 7,
        'gallery-expressive': 7,
      },
      modern: {
        'clean-modern': 10,
        'minimalist-scandinavian': 9,
        'modern-luxe': 9,
        'bold-brutalist': 8,
      },
    };

    return scores[criteria]?.[theme.id] || 5;
  };

  const renderThemeCard = (theme: StorefrontTheme) => {
    const isComparing = compareThemes.includes(theme.id);
    const isFavorite = favorites.includes(theme.id);

    return (
      <Card
        key={theme.id}
        sx={{
          height: '100%',
          border: isComparing ? '2px solid primary.main' : '1px solid',
          borderColor: isComparing ? 'primary.main' : 'divider',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => toggleFavorite(theme.id)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              }}
            >
              {isFavorite ? (
                <Star sx={{ color: 'gold', fontSize: 20 }} />
              ) : (
                <StarBorder sx={{ fontSize: 20 }} />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => toggleThemeComparison(theme.id)}
              sx={{
                backgroundColor: isComparing ? 'primary.main' : 'rgba(255,255,255,0.9)',
                color: isComparing ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: isComparing ? 'primary.dark' : 'rgba(255,255,255,1)',
                },
              }}
            >
              <CompareArrows sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(255,255,255,0.95)',
              px: 2,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="caption" fontWeight="bold" color="primary">
              {theme.category.toUpperCase()}
            </Typography>
          </Box>
        </Box>

        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {theme.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {theme.description}
          </Typography>

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Best For:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {theme.recommendedFor.slice(0, 3).map((item, index) => (
              <Chip key={index} label={item} size="small" variant="outlined" />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Tooltip title="Professional Score">
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="primary">
                  {getThemeScore(theme, 'professional')}
                </Typography>
                <Typography variant="caption">Pro</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Creative Score">
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="secondary">
                  {getThemeScore(theme, 'creative')}
                </Typography>
                <Typography variant="caption">Creative</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Authentic Score">
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="success.main">
                  {getThemeScore(theme, 'authentic')}
                </Typography>
                <Typography variant="caption">Authentic</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Modern Score">
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="info.main">
                  {getThemeScore(theme, 'modern')}
                </Typography>
                <Typography variant="caption">Modern</Typography>
              </Box>
            </Tooltip>
          </Box>

          <Button
            fullWidth
            variant={isComparing ? 'contained' : 'outlined'}
            onClick={() => onThemeSelect?.(theme.id)}
            sx={{ mb: 1 }}
          >
            {isComparing ? 'Selected for Comparison' : 'Select Theme'}
          </Button>

          <Button
            fullWidth
            size="small"
            startIcon={<Visibility />}
            onClick={() => setShowDetails(true)}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderComparisonTable = () => {
    if (themesToCompare.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CompareArrows sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Themes Selected for Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select up to {maxComparison} themes to compare their features side by side
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Feature</TableCell>
              {themesToCompare.map((theme) => (
                <TableCell key={theme.id} align="center" sx={{ fontWeight: 'bold' }}>
                  {theme.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {getFeatureComparison().map((category) => (
              <React.Fragment key={category.category}>
                <TableRow>
                  <TableCell
                    colSpan={themesToCompare.length + 1}
                    sx={{
                      backgroundColor: 'action.hover',
                      fontWeight: 'bold',
                    }}
                  >
                    {category.category}
                  </TableCell>
                </TableRow>
                {category.items.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    {themesToCompare.map((theme) => (
                      <TableCell key={theme.id} align="center">
                        {renderFeatureValue(theme, item.key)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderFeatureValue = (theme: StorefrontTheme, featureKey: string) => {
    // Simplified feature rendering based on key
    const featureMap: Record<string, any> = {
      colors: (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: theme.colors.secondary,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: theme.colors.accent,
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          />
        </Box>
      ),
      typography: (
        <Typography variant="caption">{theme.typography.fontFamily.primary.split(',')[0]}</Typography>
      ),
      borderRadius: <Chip label={theme.layout.borderRadius.md} size="small" />,
      shadows: theme.effects.boxShadow.md ? <Check color="success" /> : <Close color="error" />,
      maxWidth: <Typography variant="caption">{theme.layout.maxWidth}</Typography>,
      spacing: <Rating value={4} size="small" readOnly />,
      grid: <Check color="success" />,
      responsive: <Check color="success" />,
      productTypes: <Typography variant="caption">Various</Typography>,
      businessModel: <Typography variant="caption">B2C/B2B</Typography>,
      audience: <Typography variant="caption">All</Typography>,
      personality: <Chip label={theme.category} size="small" color="primary" />,
    };

    return featureMap[featureKey] || <Typography variant="caption">-</Typography>;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Theme Comparison Tool
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Compare up to {maxComparison} themes side by side to find the perfect match for your store
        </Typography>
      </Box>

      {compareThemes.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Selected for Comparison ({compareThemes.length}/{maxComparison}):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {compareThemes.map((themeId) => {
                const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
                return (
                  <Chip
                    key={themeId}
                    label={theme?.name}
                    onDelete={() => toggleThemeComparison(themeId)}
                    color="primary"
                  />
                );
              })}
            </Box>
          </Paper>
        </Box>
      )}

      <Grid container spacing={3}>
        {AVAILABLE_THEMES.map((theme) => (
          <Grid item xs={12} sm={6} md={4} key={theme.id}>
            {renderThemeCard(theme)}
          </Grid>
        ))}
      </Grid>

      {compareThemes.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Detailed Comparison
          </Typography>
          {renderComparisonTable()}
        </Box>
      )}
    </Box>
  );
};

export default ThemeComparison;
