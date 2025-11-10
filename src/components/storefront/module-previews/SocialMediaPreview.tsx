import React from 'react';
import { Box, Stack, IconButton, Typography, Tooltip } from '@mui/material';
import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  YouTube,
  Pinterest,
} from '@mui/icons-material';
import type { StorefrontModuleConfig } from '../../../types/storefront';

interface SocialMediaPreviewProps {
  module: StorefrontModuleConfig;
}

const SocialMediaPreview: React.FC<SocialMediaPreviewProps> = ({ module }) => {
  const settings = module.settings as Record<string, unknown>;
  const displayStyle = settings?.displayStyle || 'icons';
  const iconSize = settings?.iconSize || 'medium';

  const socialLinks = [
    { name: 'facebook', icon: Facebook, label: 'Facebook', url: '#' },
    { name: 'instagram', icon: Instagram, label: 'Instagram', url: '#' },
    { name: 'twitter', icon: Twitter, label: 'Twitter', url: '#' },
    { name: 'linkedin', icon: LinkedIn, label: 'LinkedIn', url: '#' },
    { name: 'youtube', icon: YouTube, label: 'YouTube', url: '#' },
    { name: 'pinterest', icon: Pinterest, label: 'Pinterest', url: '#' },
  ];

  const iconSizeMap = {
    small: 'small' as const,
    medium: 'medium' as const,
    large: 'large' as const,
  };

  if (displayStyle === 'icons') {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {socialLinks.map(({ name, icon: Icon, label }) => (
          <Tooltip key={name} title={label}>
            <IconButton
              size={
                iconSizeMap[iconSize as keyof typeof iconSizeMap] || 'medium'
              }
              sx={{
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.2)' },
              }}
            >
              <Icon />
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    );
  }

  if (displayStyle === 'buttons') {
    return (
      <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
        {socialLinks.map(({ name, icon: Icon, label }) => (
          <Box
            key={name}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.5,
              py: 0.75,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
            {label}
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={1}>
      {socialLinks.map(({ name, label }) => (
        <Typography
          key={name}
          variant='body2'
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {label}
        </Typography>
      ))}
    </Stack>
  );
};

export default SocialMediaPreview;
