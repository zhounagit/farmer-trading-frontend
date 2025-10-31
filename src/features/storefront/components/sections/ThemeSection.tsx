import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Palette, Visibility, Settings } from '@mui/icons-material';
import { Button, Stack } from '../../../../shared/components';
import { Card } from '@mui/material';
import ThemeSelector from '../../../../components/storefront/ThemeSelector';
import type { StorefrontTheme } from '../../../../types/themes';

export interface ThemeSectionProps {
  selectedTheme: StorefrontTheme;
  availableThemes: StorefrontTheme[];
  onThemeChange: (theme: StorefrontTheme) => void;
  isLivePreview: boolean;
  onLivePreviewToggle: (enabled: boolean) => void;
  loading?: boolean;
}

const ThemeSection: React.FC<ThemeSectionProps> = ({
  selectedTheme,
  availableThemes,
  onThemeChange,
  isLivePreview,
  onLivePreviewToggle,
  loading = false,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Section Header */}
        <Box>
          <Stack direction='row' spacing={2} alignItems='center' sx={{ mb: 1 }}>
            <Palette color='primary' />
            <Typography variant='h6' fontWeight={600}>
              Theme Selection
            </Typography>
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            Choose a theme that represents your brand and customize it to match
            your style.
          </Typography>
        </Box>

        {/* Live Preview Toggle */}
        <Card variant='outlined' padding='small'>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Box>
              <Typography variant='subtitle2' fontWeight={600}>
                Live Preview
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                See changes instantly as you customize
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={isLivePreview}
                  onChange={(e) => onLivePreviewToggle(e.target.checked)}
                  color='primary'
                />
              }
              label=''
            />
          </Stack>
        </Card>

        {/* Current Theme Display */}
        <Card title='Current Theme' variant='outlined'>
          <Stack direction='row' spacing={2} alignItems='center'>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${selectedTheme.colors.primary} 0%, ${selectedTheme.colors.secondary} 100%)`,
                border: 2,
                borderColor: 'primary.main',
              }}
            />
            <Box flex={1}>
              <Typography variant='h6' fontWeight={600}>
                {selectedTheme.name}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedTheme.description}
              </Typography>
              <Stack direction='row' spacing={1} sx={{ mt: 1 }}>
                <Chip
                  size='small'
                  label={selectedTheme.category}
                  color='primary'
                  variant='outlined'
                />
                {selectedTheme.premium && (
                  <Chip size='small' label='Premium' color='secondary' />
                )}
              </Stack>
            </Box>
          </Stack>
        </Card>

        {/* Theme Selector */}
        <Card title='Available Themes' variant='outlined'>
          <ThemeSelector
            themes={availableThemes}
            selectedTheme={selectedTheme}
            onThemeSelect={onThemeChange}
            loading={loading}
          />
        </Card>

        {/* Theme Customization Options */}
        <Card title='Theme Customization' variant='outlined'>
          <Stack spacing={2}>
            <Typography variant='body2' color='text.secondary'>
              Advanced customization options will be available here in a future
              update.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    opacity: 0.6,
                    cursor: 'not-allowed',
                  }}
                >
                  <Palette
                    sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                  />
                  <Typography variant='subtitle2'>Color Palette</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Customize brand colors
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    opacity: 0.6,
                    cursor: 'not-allowed',
                  }}
                >
                  <Settings
                    sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }}
                  />
                  <Typography variant='subtitle2'>Layout Options</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Adjust spacing and layout
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box
              sx={{
                p: 2,
                bgcolor: 'info.light',
                borderRadius: 1,
                border: 1,
                borderColor: 'info.main',
              }}
            >
              <Typography variant='body2' color='info.dark'>
                <strong>Coming Soon:</strong> Advanced theme customization
                including custom colors, fonts, and layout options will be
                available in the next update.
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Theme Actions */}
        <Stack direction='row' spacing={2} justifyContent='flex-end'>
          <Tooltip title='Preview in new tab'>
            <Button
              variant='outline'
              startIcon={<Visibility />}
              disabled={loading}
            >
              Preview
            </Button>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};

export default ThemeSection;
