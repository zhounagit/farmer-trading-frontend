import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Store,
  Phone,
  Email,
  LocationOn,
  Refresh,
  Search,
} from '@mui/icons-material';
import { StorefrontApiService } from '../../features/storefront/services/storefrontApi';
import { StoresApiService } from '../../features/stores/services/storesApi';

interface PublicStorefront {
  storeId: number;
  storeName: string;
  description?: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  customization: any;
  store: {
    storeId: number;
    storeName: string;
    description?: string;
    addresses?: Array<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      addressType: string;
    }>;
    contactInfo?: {
      phone: string;
      email: string;
    };
    categories?: Array<{
      categoryId: number;
      categoryName: string;
    }>;
    openHours?: Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;
  };
  products: Array<{
    productId: number;
    productName: string;
    price: number;
  }>;
  isActive: boolean;
}

const SimplePublishedStorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  const [availableStores, setAvailableStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true);

        if (!slug) {
          setError('No store slug provided');
          return;
        }

        // Try to use the public storefront API to get store by slug
        try {
          const storefrontData =
            await StorefrontApiService.getPublicStorefront(slug);
          setStorefront(storefrontData);
          setError(null);
          return;
        } catch (slugError: any) {
          console.warn(
            'Failed to fetch by slug, trying fallback approaches:',
            slugError
          );

          // If slug fails, try to get by store ID (assuming slug might be a store ID)
          if (!fallbackAttempted) {
            setFallbackAttempted(true);
            const storeId = parseInt(slug);
            if (!isNaN(storeId)) {
              try {
                const storefrontData =
                  await StorefrontApiService.getPublicStorefrontById(storeId);
                setStorefront(storefrontData);
                setError(null);
                return;
              } catch (idError) {
                console.warn('Failed to fetch by store ID:', idError);
              }
            }
          }

          throw slugError; // Re-throw original error if fallbacks fail
        }
      } catch (err) {
        console.error('Error fetching store:', err);

        // Provide more specific error messages
        const errorMessage =
          (err as any)?.status === 404
            ? `Storefront "${slug}" not found. This could mean:
               • The store is not approved yet (check admin panel for store applications)
               • The storefront is not published (needs storefront customization)
               • The store doesn't exist or the slug is incorrect`
            : 'Failed to load storefront information. Please try again later.';

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [slug, fallbackAttempted]);

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading storefront...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>

        {/* Setup workflow guidance */}
        <Alert severity='warning' sx={{ mb: 2 }}>
          <Typography variant='body2' gutterBottom>
            <strong>Store Setup Required</strong>
          </Typography>
          <Typography variant='body2' sx={{ mb: 1 }}>
            The store "{slug}" exists but needs additional setup:
          </Typography>
          <Typography variant='body2' component='div' sx={{ ml: 2, mb: 1 }}>
            1. Store must be approved (✓ if you approved it)
            <br />
            2. Storefront customization must be created and published
          </Typography>
          <Typography variant='body2'>
            <strong>Action needed:</strong> The store owner needs to access
            their storefront customization page to create the initial storefront
            setup before it can be published.
          </Typography>
        </Alert>

        {/* Debug information for admins */}
        <Alert severity='info' sx={{ mb: 2 }}>
          <Typography variant='body2' gutterBottom>
            <strong>Technical Details:</strong>
          </Typography>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Store slug: <code>{slug}</code>
          </Typography>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Database requirements for public visibility:
          </Typography>
          <Typography variant='body2' component='div' sx={{ ml: 2 }}>
            • stores.approval_status = 'approved' ✓
            <br />• storefront_customizations.is_published = true ❌
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant='outlined'
          >
            Go Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant='contained'
            color='primary'
          >
            Retry
          </Button>
          <Button
            onClick={() => navigate('/admin/store-applications')}
            variant='outlined'
            color='secondary'
          >
            Admin Panel
          </Button>
          <Button
            onClick={() => navigate(`/stores/${parseInt(slug) || 1}/customize`)}
            variant='contained'
            color='primary'
          >
            Setup Storefront
          </Button>
        </Box>
      </Container>
    );
  }

  if (!storefront) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Storefront data is empty. This might be a server issue.
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant='outlined'
          >
            Go Back
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant='contained'
            color='primary'
          >
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 3,
        }}
      >
        <Container maxWidth='xl'>
          <Box display='flex' alignItems='center' gap={2} mb={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ color: 'white' }}
            >
              Back
            </Button>
          </Box>
          <Typography variant='h3' component='h1' gutterBottom>
            {storefront.storeName}
          </Typography>
          <Typography variant='h6' sx={{ opacity: 0.9 }}>
            {storefront.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip
              icon={<Store />}
              label={storefront.isActive ? 'Active' : 'Inactive'}
              color={storefront.isActive ? 'success' : 'default'}
              sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth='xl' sx={{ py: 6 }}>
        <Typography variant='h4' textAlign='center' gutterBottom sx={{ mb: 4 }}>
          Welcome to {storefront.storeName}
        </Typography>

        <Grid container spacing={4}>
          {/* Store Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Store Information
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Store ID:</strong> {storefront.storeId}
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Store Slug:</strong> {storefront.slug}
                </Typography>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  <strong>Active:</strong> {storefront.isActive ? 'Yes' : 'No'}
                </Typography>
                {storefront.store.categories &&
                  storefront.store.categories.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        <strong>Categories:</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {storefront.store.categories.map((category) => (
                          <Chip
                            key={category.categoryId}
                            label={category.categoryName}
                            size='small'
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Contact Information
                </Typography>
                {storefront.store.contactInfo?.phone && (
                  <Typography
                    variant='body2'
                    sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <Phone sx={{ mr: 1, fontSize: 16 }} />
                    {storefront.store.contactInfo.phone}
                  </Typography>
                )}
                {storefront.store.contactInfo?.email && (
                  <Typography
                    variant='body2'
                    sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
                  >
                    <Email sx={{ mr: 1, fontSize: 16 }} />
                    {storefront.store.contactInfo.email}
                  </Typography>
                )}
                {storefront.store.addresses &&
                  storefront.store.addresses.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {storefront.store.addresses.map((address, index) => (
                        <Typography
                          key={index}
                          variant='body2'
                          sx={{
                            mb: 1,
                            display: 'flex',
                            alignItems: 'flex-start',
                          }}
                        >
                          <LocationOn sx={{ mr: 1, fontSize: 16, mt: 0.2 }} />
                          <Box>
                            <div>{address.street}</div>
                            <div>
                              {address.city}, {address.state} {address.zipCode}
                            </div>
                            <div>
                              <em>({address.addressType})</em>
                            </div>
                          </Box>
                        </Typography>
                      ))}
                    </Box>
                  )}
              </CardContent>
            </Card>
          </Grid>

          {/* Products */}
          {storefront.products && storefront.products.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Products ({storefront.products.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {storefront.products.slice(0, 6).map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product.productId}>
                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200',
                          }}
                        >
                          <Typography variant='body1' fontWeight='bold'>
                            {product.productName}
                          </Typography>
                          <Typography variant='body2' color='primary'>
                            ${product.price.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  {storefront.products.length > 6 && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 2 }}
                    >
                      ... and {storefront.products.length - 6} more products
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Business Hours */}
          {storefront.store.openHours &&
            storefront.store.openHours.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      Business Hours
                    </Typography>
                    {storefront.store.openHours.map((hours) => {
                      const dayNames = [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ];
                      return (
                        <Box
                          key={hours.dayOfWeek}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            py: 0.5,
                          }}
                        >
                          <Typography variant='body2'>
                            {dayNames[hours.dayOfWeek]}
                          </Typography>
                          <Typography
                            variant='body2'
                            color={hours.isClosed ? 'error' : 'success.main'}
                          >
                            {hours.isClosed
                              ? 'Closed'
                              : `${hours.openTime} - ${hours.closeTime}`}
                          </Typography>
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>
            )}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: 'grey.900',
          color: 'white',
          py: 4,
          mt: 6,
        }}
      >
        <Container maxWidth='xl' sx={{ textAlign: 'center' }}>
          <Typography variant='body2'>
            © {new Date().getFullYear()} {storefront.storeName}. All rights
            reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default SimplePublishedStorePage;
