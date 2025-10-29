import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/search/services/storefront.api';

interface SocialMediaModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const SocialMediaModule: React.FC<SocialMediaModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};
  const title = (settings.title as string) || 'Follow Us';

  return (
    <Box sx={{ py: 6, backgroundColor: 'background.default' }}>
      <Container maxWidth='lg'>
        <Typography
          variant='h3'
          component='h2'
          textAlign='center'
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary'>
          Social Media module - Coming Soon
        </Typography>
      </Container>
    </Box>
  );
};

export default SocialMediaModule;
