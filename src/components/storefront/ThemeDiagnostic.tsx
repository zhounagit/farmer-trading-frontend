import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Container,
} from '@mui/material';
import { Palette, FontDownload } from '@mui/icons-material';

interface ThemeDiagnosticProps {
  themeName: string;
  themeId: string;
}

const ThemeDiagnostic: React.FC<ThemeDiagnosticProps> = ({
  themeName,
  themeId,
}) => {
  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Theme Info Header */}
      <Alert
        severity='info'
        icon={<Palette />}
        sx={{
          mb: 4,
          backgroundColor: 'var(--theme-surface, #f8fafc)',
          border: '1px solid var(--theme-border, #e2e8f0)',
        }}
      >
        <Typography
          variant='h6'
          sx={{ fontFamily: 'var(--theme-font-primary, Arial)' }}
        >
          Current Theme: {themeName}
        </Typography>
        <Typography
          variant='body2'
          sx={{ color: 'var(--theme-text-secondary, #666)' }}
        >
          Theme ID: {themeId}
        </Typography>
      </Alert>

      {/* Color Swatches */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'var(--theme-background, white)',
          border: '1px solid var(--theme-border, #e0e0e0)',
          borderRadius: 'var(--theme-radius-lg, 8px)',
          boxShadow: 'var(--theme-shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
        }}
      >
        <CardContent>
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              fontFamily: 'var(--theme-font-primary, Arial)',
              color: 'var(--theme-text-primary, #000)',
            }}
          >
            Theme Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--theme-radius-md, 4px)',
                    backgroundColor: 'var(--theme-primary, #blue)',
                    mb: 1,
                    border: '2px solid var(--theme-border, #ccc)',
                  }}
                />
                <Typography variant='caption'>Primary</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--theme-radius-md, 4px)',
                    backgroundColor: 'var(--theme-secondary, #gray)',
                    mb: 1,
                    border: '2px solid var(--theme-border, #ccc)',
                  }}
                />
                <Typography variant='caption'>Secondary</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--theme-radius-md, 4px)',
                    backgroundColor: 'var(--theme-accent, #green)',
                    mb: 1,
                    border: '2px solid var(--theme-border, #ccc)',
                  }}
                />
                <Typography variant='caption'>Accent</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--theme-radius-md, 4px)',
                    backgroundColor: 'var(--theme-surface, #f5f5f5)',
                    mb: 1,
                    border: '2px solid var(--theme-border, #ccc)',
                  }}
                />
                <Typography variant='caption'>Surface</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Typography Sample */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'var(--theme-surface, #f8fafc)',
          border: '1px solid var(--theme-border, #e0e0e0)',
          borderRadius: 'var(--theme-radius-lg, 8px)',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FontDownload />
            <Typography
              variant='h6'
              sx={{
                fontFamily: 'var(--theme-font-primary, Arial)',
                color: 'var(--theme-text-primary, #000)',
              }}
            >
              Typography
            </Typography>
          </Box>

          <Typography
            variant='h3'
            sx={{
              fontFamily: 'var(--theme-font-primary, Arial)',
              color: 'var(--theme-text-primary, #000)',
              fontSize: 'var(--theme-text-3xl, 1.875rem)',
              mb: 2,
            }}
          >
            Large Heading Sample
          </Typography>

          <Typography
            variant='body1'
            sx={{
              fontFamily: 'var(--theme-font-primary, Arial)',
              color: 'var(--theme-text-primary, #000)',
              fontSize: 'var(--theme-text-base, 1rem)',
              mb: 1,
            }}
          >
            This is body text using the primary font family.
          </Typography>

          <Typography
            variant='body2'
            sx={{
              fontFamily: 'var(--theme-font-secondary, Arial)',
              color: 'var(--theme-text-secondary, #666)',
              fontSize: 'var(--theme-text-sm, 0.875rem)',
            }}
          >
            This is secondary text using the secondary font family.
          </Typography>
        </CardContent>
      </Card>

      {/* Buttons & Components */}
      <Card
        sx={{
          mb: 3,
          backgroundColor: 'var(--theme-background, white)',
          borderRadius: 'var(--theme-radius-lg, 8px)',
          boxShadow: 'var(--theme-shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
        }}
      >
        <CardContent>
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              fontFamily: 'var(--theme-font-primary, Arial)',
              color: 'var(--theme-text-primary, #000)',
            }}
          >
            Interactive Elements
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Button
              variant='contained'
              sx={{
                backgroundColor: 'var(--theme-primary, #blue)',
                color: 'var(--theme-background, white)',
                borderRadius: 'var(--theme-radius-md, 4px)',
                fontFamily: 'var(--theme-font-primary, Arial)',
                '&:hover': {
                  backgroundColor: 'var(--theme-secondary, #darkblue)',
                },
              }}
            >
              Primary Button
            </Button>

            <Button
              variant='outlined'
              sx={{
                borderColor: 'var(--theme-accent, #green)',
                color: 'var(--theme-accent, #green)',
                borderRadius: 'var(--theme-radius-md, 4px)',
                fontFamily: 'var(--theme-font-primary, Arial)',
                '&:hover': {
                  backgroundColor: 'var(--theme-surface, #f0f0f0)',
                },
              }}
            >
              Accent Button
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label='Primary Chip'
              sx={{
                backgroundColor: 'var(--theme-primary, #blue)',
                color: 'var(--theme-background, white)',
              }}
            />
            <Chip
              label='Accent Chip'
              variant='outlined'
              sx={{
                borderColor: 'var(--theme-accent, #green)',
                color: 'var(--theme-accent, #green)',
              }}
            />
            <Chip
              label='Surface Chip'
              sx={{
                backgroundColor: 'var(--theme-surface, #f5f5f5)',
                color: 'var(--theme-text-primary, #000)',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* CSS Variables Display */}
      <Card
        sx={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
        }}
      >
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Expected Theme Differences
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            Different themes should show:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>
              <Typography variant='body2'>
                <strong>Clean Modern:</strong> Blue (#2563eb) primary, clean
                fonts
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                <strong>Rustic Artisanal:</strong> Brown (#92400e) primary, warm
                colors
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                <strong>Industrial Professional:</strong> Dark blue (#1E3A8A),
                bold fonts
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                <strong>Playful Quirky:</strong> Pink (#ec4899) primary, rounded
                corners
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                <strong>Minimalist:</strong> Neutral colors, lots of whitespace
              </Typography>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert severity='warning' sx={{ mt: 3 }}>
        <Typography variant='body2'>
          <strong>How to use:</strong> Switch between themes in the
          customization page. You should see immediate changes in colors, fonts,
          and spacing above. If all themes look the same, check the browser
          console for CSS variable errors.
        </Typography>
      </Alert>
    </Container>
  );
};

export default ThemeDiagnostic;
