import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Breadcrumbs,
  Link,
  Skeleton,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Star,
  StarBorder,
  Store,
  Visibility,
  ArrowForward,
  Category,
} from '@mui/icons-material';
import Header from '../../components/layout/Header';
import StorefrontApiService, {
  type PublicStorefront,
} from '../../services/storefront.api';

const BrowseStorefrontsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [storefronts, setStorefronts] = useState<PublicStorefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || ''
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get('location') || ''
  );
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page')) || 1
  );

  // Categories for filtering
  const categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Dairy',
    'Meat & Poultry',
    'Baked Goods',
    'Preserved Foods',
    'Honey & Syrup',
    'Flowers',
    'Crafts',
  ];

  // Load storefronts
  useEffect(() => {
    const loadStorefronts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          location: selectedLocation || undefined,
          page: currentPage,
          limit: 12,
        };

        const response = await StorefrontApiService.browseStorefronts(params);
        setStorefronts(response.storefronts);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Failed to load storefronts:', err);
        setError('Failed to load stores. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStorefronts();
  }, [searchQuery, selectedCategory, selectedLocation, currentPage]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLocation) params.set('location', selectedLocation);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params);
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    currentPage,
    setSearchParams,
  ]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    setSelectedLocation('');
    setCurrentPage(1);
  };

  const renderFilters = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={3} alignItems='center'>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder='Search stores...'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
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
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size='small'>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              label='Category'
              startAdornment={<Category sx={{ mr: 1 }} />}
            >
              <MenuItem value=''>All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder='Location...'
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LocationOn />
                </InputAdornment>
              ),
            }}
            variant='outlined'
            size='small'
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant='outlined'
            onClick={clearFilters}
            disabled={!searchQuery && !selectedCategory && !selectedLocation}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderStorefrontCard = (storefront: PublicStorefront) => {
    const isFavorited = favorites.has(storefront.storeId);

    return (
      <Grid item xs={12} sm={6} md={4} key={storefront.storeId}>
        <Card
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
            sx={{ flexGrow: 1, pt: storefront.store.logoUrl ? 5 : 2 }}
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
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {storefront.store.categories
                      .slice(0, 3)
                      .map(
                        (category: Record<string, unknown>, index: number) => (
                          <Chip
                            key={index}
                            label={
                              (category.category as Record<string, unknown>)
                                ?.name || category.name
                            }
                            size='small'
                            variant='outlined'
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )
                      )}
                    {storefront.store.categories.length > 3 && (
                      <Chip
                        label={`+${storefront.store.categories.length - 3}`}
                        size='small'
                        variant='outlined'
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              )}

            {/* Location */}
            {storefront.store.addresses &&
              storefront.store.addresses.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn
                    sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {
                      (storefront.store.addresses[0] as Record<string, unknown>)
                        .city
                    }
                    ,{' '}
                    {
                      (storefront.store.addresses[0] as Record<string, unknown>)
                        .state
                    }
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
                    sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {Math.floor(Math.random() * 1000 + 100)}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderLoadingSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 9 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant='rectangular' height={200} />
            <CardContent>
              <Skeleton variant='text' height={32} width='80%' />
              <Skeleton variant='text' height={20} width='100%' />
              <Skeleton variant='text' height={20} width='60%' />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant='rounded' width={60} height={24} />
                <Skeleton variant='rounded' width={80} height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

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
        {renderFilters()}

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='body1' color='text.secondary'>
            {loading ? 'Loading...' : `Found ${storefronts.length} stores`}
            {(searchQuery || selectedCategory || selectedLocation) &&
              ' matching your search'}
          </Typography>
        </Box>

        {/* Content */}
        {loading ? (
          renderLoadingSkeletons()
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
          <>
            <Grid container spacing={3}>
              {storefronts.map(renderStorefrontCard)}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color='primary'
                  size='large'
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default BrowseStorefrontsPage;
