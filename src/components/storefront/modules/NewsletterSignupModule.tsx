import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/search/services/storefront.api';

interface NewsletterSignupModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const NewsletterSignupModule: React.FC<NewsletterSignupModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};
  const title = (settings.title as string) || 'Stay Updated';

  return (
    <Box sx={{ py: 6, backgroundColor: 'primary.main', color: 'white' }}>
      <Container maxWidth='lg'>
        <Typography
          variant='h3'
          component='h2'
          textAlign='center'
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>
        <Typography variant='body1' textAlign='center' color='inherit'>
          Newsletter Signup module - Coming Soon
        </Typography>
      </Container>
    </Box>
  );
};

export default NewsletterSignupModule;
