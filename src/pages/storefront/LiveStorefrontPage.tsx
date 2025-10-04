import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Link,
  Breadcrumbs,
} from '@mui/material';
import {
  Store,
  Phone,
  Email,
  LocationOn,
  Schedule,
  Payment,
  ArrowBack,
  Share,
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
  Star,
} from '@mui/icons-material';
import StorefrontApiService from '../../services/storefront.api';
import type { PublicStorefront } from '../../services/storefront.api';
import { AVAILABLE_THEMES, generateThemeCSS } from '../../types/themes';
import type { StorefrontTheme } from '../../types/themes';

interface LiveStorefrontPageProps {}

const LiveStorefrontPage: React.FC<LiveStorefrontPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [storefront, setStorefront] = useState<PublicStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [themeCSS, setThemeCSS] = useState<string>('');

  useEffect(() => {
    const loadStorefront = async () => {
      if (!slug) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await StorefrontApiService.getPublicStorefront(slug);
        setStorefront(data);

        // Generate theme CSS if theme is specified
        if (data.customization?.themeId) {
          const theme = AVAILABLE_THEMES.find(
            (t) => t.id === data.customization.themeId
          );
          if (theme) {
            const css = generateThemeCSS(theme);
            setThemeCSS(css);
          }
        }

        // Record the view for analytics
        await StorefrontApiService.recordView(slug);
      } catch (err) {
        console.error('Failed to load storefront:', err);
        setError('Failed to load store. It may be offline or not exist.');
      } finally {
        setLoading(false);
      }
    };

    loadStorefront();
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storefront?.storeName,
          text: storefront?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  const formatOpenHours = (openHours: any[]) => {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    return openHours
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
      .map((hour) => ({
        day: daysOfWeek[hour.dayOfWeek],
        time: hour.isClosed ? 'Closed' : `${hour.openTime} - ${hour.closeTime}`,
      }));
  };

  const renderHeroSection = () => {
    const heroModule = storefront?.customization.modules.find(
      (m) => m.type === 'hero'
    );

    return (
      <Box
        sx={{
          position: 'relative',
          height: { xs: 300, md: 400 },
          backgroundImage: storefront?.store.bannerUrl
            ? `url(${storefront.store.bannerUrl})`
            : 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container alignItems='center' spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Breadcrumbs sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                  <Link
                    color='inherit'
                    href='/'
                    sx={{ textDecoration: 'none' }}
                  >
                    Home
                  </Link>
                  <Link
                    color='inherit'
                    href='/browse'
                    sx={{ textDecoration: 'none' }}
                  >
                    Browse Stores
                  </Link>
                  <Typography color='white'>{storefront?.storeName}</Typography>
                </Breadcrumbs>
              </Box>

              <Typography
                variant='h2'
                component='h1'
                gutterBottom
                sx={{
                  fontWeight: 700,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {heroModule?.title || storefront?.storeName}
              </Typography>

              <Typography
                variant='h5'
                sx={{
                  mb: 3,
                  opacity: 0.9,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {heroModule?.content?.subtitle ||
                  storefront?.store.description ||
                  'Fresh, local produce from our farm to your table'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant='contained'
                  size='large'
                  startIcon={<ShoppingCart />}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'grey.100' },
                  }}
                  href='#products'
                >
                  Shop Now
                </Button>
                <Button
                  variant='outlined'
                  size='large'
                  startIcon={<LocationOn />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'grey.300',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  href='#contact'
                >
                  Visit Us
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                {storefront?.store.logoUrl && (
                  <Avatar
                    src={storefront.store.logoUrl}
                    alt={storefront.storeName}
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      border: '4px solid white',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Action buttons */}
        <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
          <Tooltip title='Share Store'>
            <IconButton
              onClick={handleShare}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: 'primary.main',
                mr: 1,
                '&:hover': { backgroundColor: 'white' },
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <IconButton
              onClick={() => setIsFavorited(!isFavorited)}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: isFavorited ? 'error.main' : 'grey.600',
                '&:hover': { backgroundColor: 'white' },
              }}
            >
              {isFavorited ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

  const renderStoreInfo = () => {
    const store = storefront?.store;
    if (!store) return null;

    const openHours = formatOpenHours(store.openHours || []);

    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Store Description */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant='h4' gutterBottom sx={{ fontWeight: 600 }}>
                About {store.storeName}
              </Typography>
              <Typography variant='body1' paragraph sx={{ lineHeight: 1.8 }}>
                {store.description ||
                  "Welcome to our store! We're passionate about providing fresh, high-quality products directly from our farm to your table."}
              </Typography>

              {store.categories && store.categories.length > 0 && (
                <Box>
                  <Typography variant='h6' gutterBottom sx={{ mt: 3 }}>
                    What We Offer
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {store.categories.map((category: any, index: number) => (
                      <Chip
                        key={index}
                        label={category.category?.name || category.name}
                        variant='outlined'
                        color='primary'
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Contact & Hours */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant='h5' gutterBottom sx={{ fontWeight: 600 }}>
                <Store sx={{ mr: 1, verticalAlign: 'middle' }} />
                Store Information
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Contact Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' gutterBottom>
                  Contact
                </Typography>
                {store.contactPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone
                      sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }}
                    />
                    <Typography variant='body2'>
                      <Link href={`tel:${store.contactPhone}`} color='inherit'>
                        {store.contactPhone}
                      </Link>
                    </Typography>
                  </Box>
                )}
                {store.contactEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email
                      sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }}
                    />
                    <Typography variant='body2'>
                      <Link
                        href={`mailto:${store.contactEmail}`}
                        color='inherit'
                      >
                        {store.contactEmail}
                      </Link>
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Addresses */}
              {store.addresses && store.addresses.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    Location
                  </Typography>
                  {store.addresses.map((address: any, index: number) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}
                    >
                      <LocationOn
                        sx={{
                          mr: 1,
                          color: 'text.secondary',
                          fontSize: 18,
                          mt: 0.2,
                        }}
                      />
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {address.locationName || address.addressType}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {address.streetAddress}, {address.city}, {address.state}{' '}
                          {address.zipCode}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Open Hours */}
              {openHours.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Hours
                  </Typography>
                  {openHours.map((hour, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant='body2'>{hour.day}</Typography>
                      <Typography
                        variant='body2'
                        color={
                          hour.time === 'Closed' ? 'error' : 'text.primary'
                        }
                      >
                        {hour.time}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Payment Methods */}
              {store.paymentMethods && store.paymentMethods.length > 0 && (
                <Box>
                  <Typography variant='h6' gutterBottom>
                    <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Payment Methods
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {store.paymentMethods.map((method: any, index: number) => (
                      <Chip
                        key={index}
                        label={
                          method.paymentMethod?.methodName || method.methodName
                        }
                        size='small'
                        variant='outlined'
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  };

  const renderProducts = () => {
    const featuredModule = storefront?.customization.modules.find(
      (m) => m.type === 'featured-products'
    );
    const products = storefront?.products || [];

    if (products.length === 0) {
      return null;
    }

    return (
      <Box id='products' sx={{ backgroundColor: 'grey.50', py: 6 }}>
        <Container maxWidth='lg'>
          <Typography
            variant='h4'
            component='h2'
            gutterBottom
            sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}
          >
            {featuredModule?.title || 'Our Products'}
          </Typography>

          <Grid container spacing={3}>
            {products.slice(0, 8).map((product: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.itemId}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <CardMedia
                    component='div'
                    sx={{
                      height: 200,
                      backgroundColor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundImage: product.imageUrl
                        ? `url(${product.imageUrl})`
                        : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!product.imageUrl && (
                      <Typography variant='body2' color='text.secondary'>
                        No Image
                      </Typography>
                    )}
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant='h6' component='h3' gutterBottom>
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        paragraph
                      >
                        {product.description.length > 100
                          ? `${product.description.substring(0, 100)}...`
                          : product.description}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography
                        variant='h6'
                        color='primary'
                        sx={{ fontWeight: 600 }}
                      >
                        ${product.price.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${product.quantity} available`}
                        size='small'
                        color={product.quantity > 0 ? 'success' : 'error'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  };

  const renderFooter = () => {
    return (
      <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: 4, mt: 6 }}>
        <Container maxWidth='lg'>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant='h6' gutterBottom>
                {storefront?.storeName}
              </Typography>
              <Typography variant='body2' color='grey.300'>
                {storefront?.store.description}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: { xs: 'left', md: 'right' } }}
            >
              <Typography variant='body2' color='grey.400'>
                Powered by HelloNeighbors
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error || !storefront) {
    return (
      <Container maxWidth='md' sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity='error' sx={{ mb: 3 }}>
          {error || 'Store not found'}
        </Alert>
        <Button
          variant='contained'
          startIcon={<ArrowBack />}
          onClick={() => navigate('/browse')}
        >
          Browse Other Stores
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      {/* Inject theme CSS */}
      {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}

      {/* Hero Section */}
      {renderHeroSection()}

      {/* Store Information */}
      {renderStoreInfo()}

      {/* Products */}
      {renderProducts()}

      {/* Footer */}
      {renderFooter()}
    </Box>
  );
};

export default LiveStorefrontPage;
