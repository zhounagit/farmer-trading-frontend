import React, { useState, useEffect } from 'react';
import {
  Box,
  Fab,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Palette,
  Close,
  CheckCircle,
  Visibility,
  Code,
  RestartAlt,
} from '@mui/icons-material';
import {
  AVAILABLE_THEMES,
  generateThemeCSS,
  type StorefrontTheme,
} from '../../types/themes';

interface ThemeSwitcherProps {
  currentTheme?: StorefrontTheme;
  onThemeChange?: (theme: StorefrontTheme) => void;
  showInProduction?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onThemeChange,
  showInProduction = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<StorefrontTheme>(
    currentTheme || AVAILABLE_THEMES[0]
  );
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isVisible, setIsVisible] = useState(
    process.env.NODE_ENV === 'development' || showInProduction
  );

  useEffect(() => {
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }
  }, [currentTheme]);

  // Apply theme when it changes
  useEffect(() => {
    const applyTheme = (theme: StorefrontTheme) => {
      // Generate and inject CSS
      const css = generateThemeCSS(theme);

      // Remove existing theme switcher styles
      const existingStyle = document.getElementById('theme-switcher-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create new style element
      const style = document.createElement('style');
      style.id = 'theme-switcher-css';
      style.innerHTML = css;
      document.head.appendChild(style);
    };

    applyTheme(selectedTheme);
  }, [selectedTheme]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (theme: StorefrontTheme) => {
    setSelectedTheme(theme);
    onThemeChange?.(theme);
    handleClose();
  };

  const resetToOriginal = () => {
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }
    handleClose();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      modern: '#2563eb',
      rustic: '#92400e',
      vibrant: '#dc2626',
      industrial: '#1e40af',
      gallery: '#374151',
      minimalist: '#6b7280',
      bold: '#000000',
      luxe: '#d4af37',
      vintage: '#8b4513',
    };
    return colors[category] || '#64748b';
  };

  const getVariableValue = (varName: string): string => {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      return value || 'Not set';
    } catch {
      return 'Error';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <Tooltip title='Switch Theme (Testing)'>
        <Fab
          size='medium'
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 9999,
            backgroundColor: selectedTheme.colors.primary,
            color: selectedTheme.colors.background,
            '&:hover': {
              backgroundColor: selectedTheme.colors.secondary,
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Palette />
        </Fab>
      </Tooltip>

      {/* Theme Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: '70vh',
            width: '350px',
            mt: -1,
          },
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
              Theme Tester
            </Typography>
            <IconButton size='small' onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant='caption' color='text.secondary'>
            Test different themes in real-time
          </Typography>
        </Box>

        <Divider />

        {/* Current Theme Info */}
        <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant='subtitle2' gutterBottom>
            Current Theme:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                backgroundColor: getCategoryColor(selectedTheme.category),
              }}
            >
              <Palette sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant='body2' fontWeight='medium'>
              {selectedTheme.name}
            </Typography>
            <Chip label={selectedTheme.category} size='small' />
          </Box>
        </Box>

        <Divider />

        {/* Theme Options */}
        <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
          {AVAILABLE_THEMES.map((theme) => (
            <MenuItem
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              selected={theme.id === selectedTheme.id}
              sx={{
                py: 1.5,
                borderLeft:
                  theme.id === selectedTheme.id
                    ? '3px solid'
                    : '3px solid transparent',
                borderLeftColor:
                  theme.id === selectedTheme.id
                    ? theme.colors.primary
                    : 'transparent',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  width: '100%',
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: theme.colors.primary,
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: theme.colors.accent,
                    }}
                  />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight='medium'>
                    {theme.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {theme.category} • {theme.colors.primary}
                  </Typography>
                </Box>
                {theme.id === selectedTheme.id && (
                  <CheckCircle color='primary' sx={{ fontSize: 18 }} />
                )}
              </Box>
            </MenuItem>
          ))}
        </Box>

        <Divider />

        {/* Controls */}
        <Box sx={{ p: 2 }}>
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={showDebugInfo}
                onChange={(e) => setShowDebugInfo(e.target.checked)}
              />
            }
            label={<Typography variant='caption'>Show debug info</Typography>}
          />

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <IconButton
              size='small'
              onClick={resetToOriginal}
              title='Reset to original theme'
            >
              <RestartAlt />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => window.location.reload()}
              title='Refresh page'
            >
              <Visibility />
            </IconButton>
          </Box>
        </Box>
      </Menu>

      {/* Debug Info Overlay */}
      {showDebugInfo && (
        <Card
          sx={{
            position: 'fixed',
            top: 20,
            left: 20,
            maxWidth: '400px',
            zIndex: 9998,
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Code />
              <Typography variant='subtitle2'>Theme Debug Info</Typography>
              <IconButton
                size='small'
                onClick={() => setShowDebugInfo(false)}
                sx={{ color: 'white', ml: 'auto' }}
              >
                <Close />
              </IconButton>
            </Box>

            <Box sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <Typography variant='caption' display='block'>
                Theme: {selectedTheme.name} ({selectedTheme.id})
              </Typography>
              <Typography variant='caption' display='block'>
                Primary: {getVariableValue('--theme-primary')}
              </Typography>
              <Typography variant='caption' display='block'>
                Secondary: {getVariableValue('--theme-secondary')}
              </Typography>
              <Typography variant='caption' display='block'>
                Accent: {getVariableValue('--theme-accent')}
              </Typography>
              <Typography variant='caption' display='block'>
                Font:{' '}
                {getVariableValue('--theme-font-primary').substring(0, 30)}...
              </Typography>
            </Box>

            {/* Quick Test Elements */}
            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <Typography variant='caption' display='block' gutterBottom>
                Quick Visual Test:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--theme-primary, #blue)',
                    border: '1px solid white',
                  }}
                />
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--theme-secondary, #gray)',
                    border: '1px solid white',
                  }}
                />
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--theme-accent, #green)',
                    border: '1px solid white',
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Development Warning */}
      {process.env.NODE_ENV === 'development' && (
        <Alert
          severity='info'
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            maxWidth: '300px',
            zIndex: 9997,
          }}
          onClose={() => setIsVisible(false)}
        >
          <Typography variant='caption'>
            Theme Switcher is active for testing. This will not appear in
            production unless explicitly enabled.
          </Typography>
        </Alert>
      )}
    </>
  );
};

export default ThemeSwitcher;
