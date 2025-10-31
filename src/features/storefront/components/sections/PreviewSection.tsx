import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Refresh,
  OpenInNew,
  Phone,
  Tablet,
  Computer,
} from '@mui/icons-material';
import { Button, Stack } from '../../../../shared/components';
import { Card } from '@mui/material';
import type {
  StorefrontPreviewMode,
  StorefrontModuleConfig,
} from '../../../../types/storefront';
import type { StorefrontTheme } from '../../../../types/themes';
import type { Store } from '../../../../shared/types/store';

export interface PreviewSectionProps {
  storeData: Store | null;
  selectedTheme: StorefrontTheme;
  modules: StorefrontModuleConfig[];
  previewMode: StorefrontPreviewMode;
  onPreviewModeChange: (mode: StorefrontPreviewMode) => void;
  loading?: boolean;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  storeData,
  selectedTheme,
  modules,
  previewMode,
  onPreviewModeChange,
  loading = false,
}) => {
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    onPreviewModeChange({
      ...previewMode,
      device,
    });
  };

  const handleLivePreviewToggle = (enabled: boolean) => {
    onPreviewModeChange({
      ...previewMode,
      isLivePreview: enabled,
    });
  };

  const handleRefreshPreview = () => {
    // Force preview refresh by toggling live preview
    onPreviewModeChange({
      ...previewMode,
      isLivePreview: false,
    });
    setTimeout(() => {
      onPreviewModeChange({
        ...previewMode,
        isLivePreview: true,
      });
    }, 100);
  };

  const handleOpenInNewTab = () => {
    if (storeData) {
      const previewUrl = `/storefront/preview/${storeData.id}`;
      window.open(previewUrl, '_blank');
    }
  };

  const getPreviewFrameStyles = () => {
    switch (previewMode.device) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          maxWidth: '100%',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
        };
      default: // desktop
        return {
          width: '100%',
          height: '800px',
        };
    }
  };

  const enabledModules = modules.filter((module) => module.enabled);

  return (
    <Box
      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Stack spacing={3} sx={{ height: '100%' }}>
        {/* Section Header */}
        <Box>
          <Stack
            direction='row'
            spacing={2}
            alignItems='center'
            justifyContent='space-between'
          >
            <Box>
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{ mb: 1 }}
              >
                <Visibility color='primary' />
                <Typography variant='h6' fontWeight={600}>
                  Live Preview
                </Typography>
              </Stack>
              <Typography variant='body2' color='text.secondary'>
                See how your storefront will look to customers.
              </Typography>
            </Box>

            <Stack direction='row' spacing={1}>
              <Tooltip title='Refresh preview'>
                <IconButton onClick={handleRefreshPreview} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title='Open in new tab'>
                <IconButton
                  onClick={handleOpenInNewTab}
                  disabled={!storeData || loading}
                >
                  <OpenInNew />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        {/* Preview Controls */}
        <Card variant='outlined' padding='small'>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            {/* Device Selection */}
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='body2' color='text.secondary' sx={{ mr: 1 }}>
                Device:
              </Typography>
              <Tooltip title='Desktop view'>
                <IconButton
                  size='small'
                  onClick={() => handleDeviceChange('desktop')}
                  color={
                    previewMode.device === 'desktop' ? 'primary' : 'default'
                  }
                  sx={{
                    border: 1,
                    borderColor:
                      previewMode.device === 'desktop'
                        ? 'primary.main'
                        : 'divider',
                  }}
                >
                  <Computer fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Tablet view'>
                <IconButton
                  size='small'
                  onClick={() => handleDeviceChange('tablet')}
                  color={
                    previewMode.device === 'tablet' ? 'primary' : 'default'
                  }
                  sx={{
                    border: 1,
                    borderColor:
                      previewMode.device === 'tablet'
                        ? 'primary.main'
                        : 'divider',
                  }}
                >
                  <Tablet fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Mobile view'>
                <IconButton
                  size='small'
                  onClick={() => handleDeviceChange('mobile')}
                  color={
                    previewMode.device === 'mobile' ? 'primary' : 'default'
                  }
                  sx={{
                    border: 1,
                    borderColor:
                      previewMode.device === 'mobile'
                        ? 'primary.main'
                        : 'divider',
                  }}
                >
                  <Phone fontSize='small' />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Live Preview Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={previewMode.isLivePreview}
                  onChange={(e) => handleLivePreviewToggle(e.target.checked)}
                  color='primary'
                  size='small'
                />
              }
              label='Live preview'
            />
          </Stack>
        </Card>

        {/* Preview Stats */}
        <Stack direction='row' spacing={2}>
          <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
            <Typography variant='h6' color='primary.main'>
              {enabledModules.length}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Active Modules
            </Typography>
          </Paper>
          <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
            <Typography variant='h6' color='primary.main'>
              {selectedTheme.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Current Theme
            </Typography>
          </Paper>
          <Paper sx={{ p: 1.5, flex: 1, textAlign: 'center' }}>
            <Typography variant='h6' color='primary.main'>
              {previewMode.device.toUpperCase()}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Preview Device
            </Typography>
          </Paper>
        </Stack>

        {/* Preview Frame */}
        <Card
          title='Preview'
          variant='outlined'
          padding='none'
          sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              p: 2,
              bgcolor: 'grey.50',
              overflow: 'auto',
            }}
          >
            {storeData && previewMode.isLivePreview ? (
              <Paper
                elevation={3}
                sx={{
                  ...getPreviewFrameStyles(),
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Preview Content */}
                <Box
                  sx={{
                    height: '100%',
                    overflow: 'auto',
                    bgcolor: 'background.default',
                    background: `linear-gradient(135deg, ${selectedTheme.colors.primary}10 0%, ${selectedTheme.colors.secondary}10 100%)`,
                  }}
                >
                  {/* Store Header */}
                  <Box
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: selectedTheme.colors.primary,
                      color: 'white',
                    }}
                  >
                    <Typography variant='h4' fontWeight={700} gutterBottom>
                      {storeData.storeName}
                    </Typography>
                    <Typography variant='body1' sx={{ opacity: 0.9 }}>
                      {storeData.description || 'Welcome to our store!'}
                    </Typography>
                  </Box>

                  {/* Module Preview */}
                  <Box sx={{ p: 2 }}>
                    {enabledModules.length === 0 ? (
                      <Box
                        sx={{
                          textAlign: 'center',
                          py: 6,
                          color: 'text.secondary',
                        }}
                      >
                        <Typography variant='h6' gutterBottom>
                          No modules enabled
                        </Typography>
                        <Typography variant='body2'>
                          Add and enable modules to see your storefront content.
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={3}>
                        {enabledModules
                          .sort((a, b) => a.order - b.order)
                          .map((module) => (
                            <Paper
                              key={module.id}
                              sx={{
                                p: 3,
                                textAlign: 'center',
                                border: 2,
                                borderColor: 'primary.light',
                                borderStyle: 'dashed',
                              }}
                            >
                              <Typography
                                variant='h6'
                                color='primary.main'
                                gutterBottom
                              >
                                {module.title}
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {module.type} module content would appear here
                              </Typography>
                            </Paper>
                          ))}
                      </Stack>
                    )}
                  </Box>

                  {/* Store Footer */}
                  <Box
                    sx={{
                      mt: 'auto',
                      p: 2,
                      textAlign: 'center',
                      bgcolor: 'grey.100',
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      © {new Date().getFullYear()} {storeData.storeName}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <Box
                sx={{
                  ...getPreviewFrameStyles(),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.200',
                  borderRadius: 2,
                  border: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                }}
              >
                <Stack
                  spacing={2}
                  alignItems='center'
                  sx={{ textAlign: 'center', p: 4 }}
                >
                  <VisibilityOff
                    sx={{ fontSize: 64, color: 'text.secondary' }}
                  />
                  <Typography variant='h6' color='text.secondary'>
                    Preview Disabled
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Enable live preview to see your storefront
                  </Typography>
                  <Button
                    variant='outline'
                    onClick={() => handleLivePreviewToggle(true)}
                  >
                    Enable Preview
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Card>
      </Stack>
    </Box>
  );
};

export default PreviewSection;
