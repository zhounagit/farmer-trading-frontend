import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import type { StorefrontModule, PublicStorefront } from '../../../services/storefront.api';

interface TestimonialsModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const TestimonialsModule: React.FC<TestimonialsModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};
  const title = (settings.title as string) || 'Customer Testimonials';

  return (
    <Box sx={{ py: 6, backgroundColor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{ mb: 4 }}
        >
          {title}
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary">
          Customer Testimonials module - Coming Soon
        </Typography>
      </Container>
    </Box>
  );
};

export default TestimonialsModule;
