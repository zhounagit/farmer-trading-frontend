import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Breadcrumbs,
  Link,
  Stack,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  StarBorder,
  Store,
  Visibility,
  ArrowForward,
} from '@mui/icons-material';
import Header from '../../components/layout/Header';
import StorefrontApiService, {
  type PublicStorefront,
} from '../../services/storefront.api';

const SimpleBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [storefronts, setStorefronts] = useState<PublicStorefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Dairy',
    'Meat & Poultry',
    'Baked Goods',
    'Preserved Foods',
    'Honey & Syrup',
  ];

  // Initialize search from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const categoryFromUrl = searchParams.get('category');

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      console.log('🔍 Search initialized from URL:', searchFromUrl);
    }

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadStorefronts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          page: 1,
          limit: 12,
        };

        const response = await StorefrontApiService.browseStorefronts(params);
        setStorefronts(response.storefronts);
      } catch (err) {
        console.error('Failed to load storefronts:', err);
        setError('Failed to load stores. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStorefronts();
  }, [searchQuery, selectedCategory]);

  const handleFavoriteToggle = (storeId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(storeId)) {
      newFavorites.delete(storeId);
    } else {
      newFavorites.add(storeId);
    }
    setFavorites(newFavorites);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    // Clear URL parameters
    setSearchParams({});
    console.log('🔍 Filters cleared');
  };

  return (
    <Box>
      <Header onLoginClick={() => navigate('/login')} />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link color='inherit' href='/' sx={{ textDecoration: 'none' }}>
              Home
            </Link>
            <Typography color='text.primary'>Browse Stores</Typography>
          </Breadcrumbs>

          <Typography
            variant='h3'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            <Store sx={{ mr: 2, verticalAlign: 'middle' }} />
            Discover Local Stores
          </Typography>
          <Typography variant='h6' color='text.secondary' paragraph>
            Browse fresh, local produce and artisanal goods from farmers and
            creators in your area
          </Typography>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder='Search stores and products...'
              value={searchQuery}
              onChange={(e) => {
                const newQuery = e.target.value;
                setSearchQuery(newQuery);
                // Update URL parameters
                if (newQuery) {
                  setSearchParams((prev) => {
                    prev.set('search', newQuery);
                    return prev;
                  });
                } else {
                  setSearchParams((prev) => {
                    prev.delete('search');
                    return prev;
                  });
                }
                console.log('🔍 Search query updated:', newQuery);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search />
                  </InputAdornment>
                ),
              }}
              variant='outlined'
              size='small'
            />

            <FormControl size='small' sx={{ minWidth: 200 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setSelectedCategory(newCategory);
                  // Update URL parameters
                  if (newCategory) {
                    setSearchParams((prev) => {
                      prev.set('category', newCategory);
                      return prev;
                    });
                  } else {
                    setSearchParams((prev) => {
                      prev.delete('category');
                      return prev;
                    });
                  }
                }}
                label='Category'
              >
                <MenuItem value=''>All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant='outlined'
              onClick={clearFilters}
              disabled={!searchQuery && !selectedCategory}
              sx={{ minWidth: 120 }}
            >
              Clear Filters
            </Button>
          </Stack>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' color='text.secondary'>
            {loading ? 'Loading...' : `Found ${storefronts.length} stores`}
            {(searchQuery || selectedCategory) && ' matching your search'}
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          <Typography>Loading stores...</Typography>
        ) : error ? (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : storefronts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h5' gutterBottom>
              No stores found
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Try adjusting your search criteria or check back later for new
              stores.
            </Typography>
            <Button variant='contained' onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {storefronts.map((storefront) => {
              const isFavorited = favorites.has(storefront.storeId);

              return (
                <Card
                  key={storefront.storeId}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                    },
                  }}
                  onClick={() => navigate(`/store/${storefront.slug}`)}
                >
                  <CardMedia
                    component='div'
                    sx={{
                      height: 200,
                      position: 'relative',
                      backgroundColor: 'grey.200',
                      backgroundImage: storefront.store.bannerUrl
                        ? `url(${storefront.store.bannerUrl})`
                        : 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Store Logo Overlay */}
                    {storefront.store.logoUrl && (
                      <Avatar
                        src={storefront.store.logoUrl}
                        alt={storefront.storeName}
                        sx={{
                          position: 'absolute',
                          bottom: -30,
                          left: 16,
                          width: 60,
                          height: 60,
                          border: '3px solid white',
                          boxShadow: 2,
                        }}
                      />
                    )}

                    {/* Favorite Button */}
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFavoriteToggle(storefront.storeId);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: isFavorited ? 'error.main' : 'grey.600',
                        '&:hover': { backgroundColor: 'white' },
                      }}
                      size='small'
                    >
                      {isFavorited ? <Star /> : <StarBorder />}
                    </IconButton>
                  </CardMedia>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      pt: storefront.store.logoUrl ? 5 : 2,
                    }}
                  >
                    <Typography
                      variant='h6'
                      component='h3'
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {storefront.storeName}
                    </Typography>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                      sx={{ minHeight: 40 }}
                    >
                      {storefront.store.description ||
                        'Fresh, local produce and artisanal goods'}
                    </Typography>

                    {/* Categories */}
                    {storefront.store.categories &&
                      storefront.store.categories.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction='row' spacing={0.5} flexWrap='wrap'>
                            {storefront.store.categories
                              .slice(0, 3)
                              .map(
                                (
                                  category: Record<string, unknown>,
                                  index: number
                                ) => (
                                  <Chip
                                    key={index}
                                    label={String(
                                      (
                                        category.category as Record<
                                          string,
                                          unknown
                                        >
                                      )?.name || category.name
                                    )}
                                    size='small'
                                    variant='outlined'
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                )
                              )}
                            {storefront.store.categories.length > 3 && (
                              <Chip
                                label={`+${
                                  storefront.store.categories.length - 3
                                }`}
                                size='small'
                                variant='outlined'
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Stack>
                        </Box>
                      )}

                    {/* Location */}
                    {storefront.store.addresses &&
                      storefront.store.addresses.length > 0 && (
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              color: 'text.secondary',
                              mr: 0.5,
                            }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {String(
                              (
                                storefront.store.addresses[0] as Record<
                                  string,
                                  unknown
                                >
                              ).city
                            )}
                            ,{' '}
                            {String(
                              (
                                storefront.store.addresses[0] as Record<
                                  string,
                                  unknown
                                >
                              ).state
                            )}
                          </Typography>
                        </Box>
                      )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Button
                        size='small'
                        endIcon={<ArrowForward />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/store/${storefront.slug}`);
                        }}
                      >
                        Visit Store
                      </Button>

                      <Tooltip title='Store Views'>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Visibility
                            sx={{
                              fontSize: 16,
                              color: 'text.secondary',
                              mr: 0.5,
                            }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            {Math.floor(Math.random() * 1000 + 100)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SimpleBrowsePage;
