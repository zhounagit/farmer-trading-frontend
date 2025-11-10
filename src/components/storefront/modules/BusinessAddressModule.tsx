import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Business,
  Directions,
} from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';

interface BusinessAddressModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

interface AddressData {
  addressType?: string;
  locationName?: string;
  contactPhone?: string;
  contactEmail?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// API response structure for addresses
interface StoreAddress {
  type: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  instructions: string;
  email?: string;
}

const BusinessAddressModule: React.FC<BusinessAddressModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};
  const showLocationName = (settings.showLocationName as boolean) !== false;
  const showContactPhone = (settings.showContactPhone as boolean) !== false;
  const showContactEmail = (settings.showContactEmail as boolean) !== false;
  const showFullAddress = (settings.showFullAddress as boolean) !== false;
  const showDirections = (settings.showDirections as boolean) !== false;
  const displayStyle = (settings.displayStyle as string) || 'card';

  // Get business address from store data or module settings
  // The API returns store.addresses with 'type' property and snake_case field names
  const storeAddresses =
    (storefront.store?.addresses as StoreAddress[] | undefined) || [];
  const foundAddress = storeAddresses.find(
    (addr: StoreAddress) => addr.type === 'business'
  );
  const businessAddress = (foundAddress ||
    (settings.businessAddress as AddressData) ||
    {}) as Partial<StoreAddress> & Partial<AddressData>;

  // Map API field names to component field names
  const locationName = (businessAddress.name ||
    businessAddress.locationName) as string | undefined;
  const contactPhone = (businessAddress.phone ||
    businessAddress.contactPhone) as string | undefined;
  const streetAddress = (businessAddress.street ||
    businessAddress.streetAddress) as string | undefined;
  const city = businessAddress.city as string | undefined;
  const state = businessAddress.state as string | undefined;
  const zipCode = (businessAddress.zip || businessAddress.zipCode) as
    | string
    | undefined;
  const contactEmail = (businessAddress.email ||
    businessAddress.contactEmail) as string | undefined;

  // Format full address
  const fullAddress = [streetAddress, city, state, zipCode]
    .filter(Boolean)
    .join(', ');

  if (locationName || contactPhone || contactEmail || fullAddress) {
    // Data is available for rendering
  }

  // Don't render if no address data available
  if (!locationName && !contactPhone && !contactEmail && !fullAddress) {
    return null;
  }

  const handleGetDirections = () => {
    if (fullAddress) {
      const encodedAddress = encodeURIComponent(fullAddress);
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
      window.open(directionsUrl, '_blank');
    }
  };

  const renderCompactStyle = () => (
    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: '800px', width: '100%' }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'var(--theme-text-primary, #1F2937)',
            fontFamily: 'var(--theme-font-primary, inherit)',
            mb: 3,
            textAlign: 'center',
          }}
        >
          {module.title || 'Store Location'}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Location Info */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <List dense>
              {showLocationName && locationName && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Business
                      sx={{
                        color: 'var(--theme-primary, #2563eb)',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={locationName}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: 'var(--theme-text-primary, #1F2937)',
                    }}
                  />
                </ListItem>
              )}

              {showFullAddress && fullAddress && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn
                      sx={{
                        color: 'var(--theme-primary, #2563eb)',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={fullAddress}
                    primaryTypographyProps={{
                      color: 'var(--theme-text-secondary, #6B7280)',
                    }}
                  />
                </ListItem>
              )}

              {showDirections && fullAddress && (
                <ListItem sx={{ px: 0, pt: 1 }}>
                  <ListItemIcon>
                    <Directions
                      sx={{
                        color: 'var(--theme-accent, #059669)',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      component='button'
                      onClick={handleGetDirections}
                      sx={{
                        color: 'var(--theme-accent, #059669)',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        '&:hover': {
                          color: 'var(--theme-primary, #2563eb)',
                        },
                      }}
                    >
                      Get Directions
                    </Typography>
                  </ListItemText>
                </ListItem>
              )}
            </List>
          </Box>

          {/* Contact Info */}
          <Box sx={{ flex: 1, minWidth: 250 }}>
            <List dense>
              {showContactPhone && contactPhone && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Phone
                      sx={{
                        color: 'var(--theme-primary, #2563eb)',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      component='a'
                      href={`tel:${contactPhone}`}
                      sx={{
                        color: 'var(--theme-text-primary, #1F2937)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'var(--theme-primary, #2563eb)',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contactPhone}
                    </Typography>
                  </ListItemText>
                </ListItem>
              )}

              {showContactEmail && contactEmail && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Email
                      sx={{
                        color: 'var(--theme-primary, #2563eb)',
                        fontSize: 20,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      component='a'
                      href={`mailto:${contactEmail}`}
                      sx={{
                        color: 'var(--theme-text-primary, #1F2937)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'var(--theme-primary, #2563eb)',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contactEmail}
                    </Typography>
                  </ListItemText>
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const renderCardStyle = () => (
    <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: '800px', width: '100%' }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'var(--theme-text-primary, #1F2937)',
            fontFamily: 'var(--theme-font-primary, inherit)',
            mb: 3,
            textAlign: 'center',
          }}
        >
          {module.title || 'Visit Our Store'}
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 'var(--theme-radius-lg, 12px)',
            backgroundColor: 'var(--theme-surface, white)',
            border: '1px solid var(--theme-border, #E5E7EB)',
            boxShadow: 'var(--theme-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1))',
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {/* Location Section */}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: 'var(--theme-text-primary, #1F2937)',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LocationOn
                    sx={{
                      mr: 1,
                      color: 'var(--theme-primary, #2563eb)',
                    }}
                  />
                  Location
                </Typography>

                {showLocationName && locationName && (
                  <Typography
                    variant='body1'
                    sx={{
                      fontWeight: 600,
                      color: 'var(--theme-text-primary, #1F2937)',
                      mb: 1,
                    }}
                  >
                    {locationName}
                  </Typography>
                )}

                {showFullAddress && fullAddress && (
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'var(--theme-text-secondary, #6B7280)',
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {fullAddress}
                  </Typography>
                )}

                {showDirections && fullAddress && (
                  <Chip
                    label='Get Directions'
                    onClick={handleGetDirections}
                    icon={<Directions />}
                    variant='outlined'
                    sx={{
                      borderColor: 'var(--theme-accent, #059669)',
                      color: 'var(--theme-accent, #059669)',
                      '&:hover': {
                        backgroundColor: 'var(--theme-accent, #059669)',
                        color: 'white',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Contact Section */}
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 600,
                  color: 'var(--theme-text-primary, #1F2937)',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Phone
                  sx={{
                    mr: 1,
                    color: 'var(--theme-primary, #2563eb)',
                  }}
                />
                Contact
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {showContactPhone && contactPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone
                      sx={{
                        mr: 2,
                        color: 'var(--theme-text-secondary, #6B7280)',
                        fontSize: 20,
                      }}
                    />
                    <Typography
                      component='a'
                      href={`tel:${contactPhone}`}
                      sx={{
                        color: 'var(--theme-text-primary, #1F2937)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'var(--theme-primary, #2563eb)',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contactPhone}
                    </Typography>
                  </Box>
                )}

                {showContactEmail && contactEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email
                      sx={{
                        mr: 2,
                        color: 'var(--theme-text-secondary, #6B7280)',
                        fontSize: 20,
                      }}
                    />
                    <Typography
                      component='a'
                      href={`mailto:${contactEmail}`}
                      sx={{
                        color: 'var(--theme-text-primary, #1F2937)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'var(--theme-primary, #2563eb)',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contactEmail}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );

  // Main render
  return (
    <Box
      sx={{
        backgroundColor: 'var(--theme-background, white)',
        color: 'var(--theme-text-primary, #1F2937)',
        fontFamily: 'var(--theme-font-primary, inherit)',
      }}
    >
      {displayStyle === 'compact' ? renderCompactStyle() : renderCardStyle()}
    </Box>
  );
};

export default BusinessAddressModule;
