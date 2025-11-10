import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Link } from '@mui/material';
import { LocationOn, Phone, Email } from '@mui/icons-material';
import type { StorefrontModuleConfig } from '../../../types/storefront';
import type { Store } from '../../../shared/types/store';

interface BusinessAddressPreviewProps {
  module: StorefrontModuleConfig;
  storeData: Store | null;
}

const BusinessAddressPreview: React.FC<BusinessAddressPreviewProps> = ({
  module,
  storeData,
}) => {
  const settings = module.settings as Record<string, unknown>;
  const showLocationName = settings?.showLocationName !== false;
  const showContactPhone = settings?.showContactPhone !== false;
  const showContactEmail = settings?.showContactEmail !== false;
  const showFullAddress = settings?.showFullAddress !== false;
  const showDirections = settings?.showDirections !== false;

  if (!storeData) {
    return (
      <Typography color='text.secondary'>
        Store information not available
      </Typography>
    );
  }

  const address = storeData.addresses?.[0];
  const phone = storeData.contactPhone || '';
  const email = storeData.contactEmail || '';

  return (
    <Card sx={{ backgroundColor: '#f9f9f9' }}>
      <CardContent>
        {showLocationName && (
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {storeData.storeName}
          </Typography>
        )}

        <Stack spacing={2}>
          {showFullAddress && address && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <LocationOn sx={{ color: 'primary.main', mt: 0.5 }} />
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {address.streetAddress}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {address.city}, {address.state} {address.zipCode}
                </Typography>
              </Box>
            </Box>
          )}

          {showContactPhone && phone && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Phone sx={{ color: 'primary.main' }} />
              <Link
                href={`tel:${phone}`}
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                {phone}
              </Link>
            </Box>
          )}

          {showContactEmail && email && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Email sx={{ color: 'primary.main' }} />
              <Link
                href={`mailto:${email}`}
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                {email}
              </Link>
            </Box>
          )}

          {showDirections && address && (
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${address.streetAddress} ${address.city} ${address.state}`
              )}`}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ textDecoration: 'none', color: 'primary.main', mt: 1 }}
            >
              Get Directions
            </Link>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BusinessAddressPreview;
