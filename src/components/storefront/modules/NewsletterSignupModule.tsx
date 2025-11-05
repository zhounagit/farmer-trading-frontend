import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import type { StorefrontModule } from '@/features/storefront/types/public-storefront';

interface NewsletterSignupModuleProps {
  module: StorefrontModule;
}

const NewsletterSignupModule: React.FC<NewsletterSignupModuleProps> = ({
  module,
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
