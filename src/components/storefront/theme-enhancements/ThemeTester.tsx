import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Palette,
  Refresh,
  Code,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import {
  AVAILABLE_THEMES,
  generateThemeCSS,
  type StorefrontTheme,
} from '../../../types/themes';

interface ThemeTesterProps {
  selectedTheme?: StorefrontTheme;
  onThemeChange?: (theme: StorefrontTheme) => void;
}

const ThemeTester: React.FC<ThemeTesterProps> = ({
  selectedTheme = AVAILABLE_THEMES[0],
  onThemeChange,
}) => {
  const [currentTheme, setCurrentTheme] = useState(selectedTheme);
  const [showCSSVariables, setShowCSSVariables] = useState(false);
  const [themeCSS, setThemeCSS] = useState('');

  useEffect(() => {
    // Generate CSS for current theme
    const css = generateThemeCSS(currentTheme);
    setThemeCSS(css);

    // Apply theme to the tester
    const style = document.createElement('style');
    style.innerHTML = css;
    style.id = 'theme-tester-css';

    // Remove existing theme tester styles
    const existing = document.getElementById('theme-tester-css');
    if (existing) {
      existing.remove();
    }

    document.head.appendChild(style);

    return () => {
      const cleanup = document.getElementById('theme-tester-css');
      if (cleanup) {
        cleanup.remove();
      }
    };
  }, [currentTheme]);

  const handleThemeChange = (themeId: string) => {
    const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      onThemeChange?.(theme);
    }
  };

  const testCSSVariable = (
    varName: string
  ): 'success' | 'warning' | 'error' => {
    try {
      const value = getComputedStyle(document.documentElement).getPropertyValue(
        varName
      );
      if (value && value.trim()) {
        return 'success';
      } else {
        return 'warning';
      }
    } catch {
      return 'error';
    }
  };

  const getVariableValue = (varName: string): string => {
    try {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim() || 'Not set'
      );
    } catch {
      return 'Error';
    }
  };

  const criticalVariables = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-accent',
    '--theme-background',
    '--theme-surface',
    '--theme-text-primary',
    '--theme-font-primary',
    '--theme-radius-md',
    '--theme-shadow-md',
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Theme Selector */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold' }}>
          🎨 Theme Tester
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Test different themes to verify they're working correctly
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Select Theme</InputLabel>
            <Select
              value={currentTheme.id}
              label='Select Theme'
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {AVAILABLE_THEMES.map((theme) => (
                <MenuItem key={theme.id} value={theme.id}>
                  {theme.name} ({theme.category})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={showCSSVariables}
                onChange={(e) => setShowCSSVariables(e.target.checked)}
              />
            }
            label='Show CSS Variables'
          />

          <Tooltip title='Refresh theme'>
            <IconButton onClick={() => handleThemeChange(currentTheme.id)}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Current Theme Info */}
      <Alert severity='info' icon={<Palette />} sx={{ mb: 4 }}>
        <Typography variant='subtitle2' fontWeight='bold'>
          Current Theme: {currentTheme.name}
        </Typography>
        <Typography variant='body2'>
          Category: {currentTheme.category} • {currentTheme.description}
        </Typography>
      </Alert>

      {/* CSS Variables Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            CSS Variables Status
          </Typography>
          <Grid container spacing={2}>
            {criticalVariables.map((varName) => {
              const status = testCSSVariable(varName);
              const value = getVariableValue(varName);

              return (
                <Grid size={{ xs: 12, md: 6 }} key={varName}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status === 'success' && <CheckCircle color='success' />}
                    {status === 'warning' && <Warning color='warning' />}
                    {status === 'error' && <Error color='error' />}

                    <Typography variant='body2' fontFamily='monospace'>
                      {varName}:
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {value}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Theme Test Components */}
      <Typography variant='h6' gutterBottom>
        Theme Test Components
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Colors Test */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                Colors
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: 'var(--theme-primary, #blue)',
                    border: '1px solid var(--theme-border, #ccc)',
                  }}
                  title='Primary'
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: 'var(--theme-secondary, #gray)',
                    border: '1px solid var(--theme-border, #ccc)',
                  }}
                  title='Secondary'
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: 'var(--theme-accent, #green)',
                    border: '1px solid var(--theme-border, #ccc)',
                  }}
                  title='Accent'
                />
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: 'var(--theme-surface, #white)',
                    border: '2px solid var(--theme-border, #ccc)',
                  }}
                  title='Surface'
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Typography Test */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                Typography
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--theme-font-primary, Arial)',
                  color: 'var(--theme-text-primary, #000)',
                  fontSize: 'var(--theme-text-lg, 1.125rem)',
                  mb: 1,
                }}
              >
                Primary Font Sample
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--theme-font-secondary, Arial)',
                  color: 'var(--theme-text-secondary, #666)',
                  fontSize: 'var(--theme-text-base, 1rem)',
                }}
              >
                Secondary Font Sample
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Button Test */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>
                Buttons & Interactions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant='contained'
                  sx={{
                    backgroundColor: 'var(--theme-primary, #blue)',
                    color: 'var(--theme-background, white)',
                    borderRadius: 'var(--theme-radius-md, 8px)',
                    '&:hover': {
                      backgroundColor: 'var(--theme-secondary, #darkblue)',
                    },
                  }}
                >
                  Primary
                </Button>
                <Button
                  variant='outlined'
                  sx={{
                    borderColor: 'var(--theme-accent, #green)',
                    color: 'var(--theme-accent, #green)',
                    borderRadius: 'var(--theme-radius-md, 8px)',
                  }}
                >
                  Accent
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Test */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              backgroundColor: 'var(--theme-surface, #f5f5f5)',
              borderRadius: 'var(--theme-radius-lg, 12px)',
              boxShadow: 'var(--theme-shadow-md, 0 4px 6px rgba(0,0,0,0.1))',
              border: '1px solid var(--theme-border, #e0e0e0)',
            }}
          >
            <Typography variant='subtitle1' gutterBottom>
              Surface & Shadows
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'var(--theme-text-secondary, #666)',
              }}
            >
              This card tests surface colors, shadows, and border radius from
              the current theme.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CSS Variables Viewer */}
      {showCSSVariables && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Code />
              <Typography variant='h6'>Generated CSS Variables</Typography>
            </Box>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <Typography
                component='pre'
                variant='body2'
                fontFamily='monospace'
                sx={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}
              >
                {themeCSS}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ThemeTester;
