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
  IconButton,
  Tooltip,
  Paper,
  Breadcrumbs,
  Link,
  Stack,
  Grid,
  Pagination,
  Skeleton,
} from '@mui/material';
import {
  Search,
  LocationOn,
  Store,
  ShoppingCart,
  FilterList,
  GridView,
  ViewList,
} from '@mui/icons-material';
import Header from '../../../components/layout/Header';
import StorefrontApiService from '../services/storefront.api';
import { imageUtils } from '../../../utils/api';

// Sort options constant moved outside component
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'rating', label: 'Highest Rated' },
];

interface ProductSearchResult {
  itemId: number;
  productName: string;
  itemName: string;
  description: string;
  price: number;
  unitPrice: number;
  unit: string;
  quantity: number;
  isActive: boolean;
  images: Array<{
    imageUrl: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
  store: {
    storeId: number;
    storeName: string;
    slug: string;
    logoUrl?: string;
    city?: string;
    state?: string;
  };
  categories: Array<{
    name: string;
  }>;
}

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  location?: string;
  inStock?: boolean;
}

const ProductSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const categories = [
    'Vegetables',
    'Fruits',
    'Herbs',
    'Dairy',
    'Meat & Poultry',
    'Baked Goods',
    'Preserved Foods',
    'Honey & Syrup',
    'Grains & Cereals',
    'Beverages',
    'Spices',
    'Nuts & Seeds',
  ];

  // Initialize from URL parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || searchParams.get('q');
    const categoryFromUrl = searchParams.get('category');
    const sortFromUrl = searchParams.get('sort');
    const pageFromUrl = searchParams.get('page');

    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      console.log('🔍 Product search initialized from URL:', searchFromUrl);
    }

    if (categoryFromUrl) {
      setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
    }

    if (sortFromUrl && SORT_OPTIONS.some((opt) => opt.value === sortFromUrl)) {
      setSortBy(sortFromUrl);
    }

    if (pageFromUrl && !isNaN(Number(pageFromUrl))) {
      setCurrentPage(Number(pageFromUrl));
    }
  }, [searchParams]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchQuery.trim()) {
        setProducts([]);
        setTotalResults(0);
        setTotalPages(1);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Searching products:', {
          query: searchQuery,
          filters,
          sortBy,
          page: currentPage,
        });

        // Mock search implementation - replace with actual API call
        // For now, we'll simulate a search by getting storefronts and extracting products
        const storefrontResponse = await StorefrontApiService.browseStorefronts(
          {
            search: searchQuery,
            page: 1,
            limit: 50, // Get more stores to extract products from
          }
        );

        // Extract and flatten products from all storefronts
        const allProducts: ProductSearchResult[] = [];

        storefrontResponse.storefronts.forEach((storefront: any) => {
          if (storefront.products && Array.isArray(storefront.products)) {
            storefront.products.forEach((product: any) => {
              // Filter products based on search query
              const query = searchQuery.toLowerCase();
              const matchesSearch =
                product.productName?.toLowerCase().includes(query) ||
                product.itemName?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query);

              if (matchesSearch) {
                // Debug log the raw product data
                console.log('🔍 DEBUG - Raw product data:', {
                  itemId: product.itemId,
                  itemName: product.itemName,
                  productName: product.productName,
                  description: product.description,
                  price: product.price,
                  unitPrice: product.unitPrice,
                  unit: product.unit,
                  quantity: product.quantity,
                  quantityAvailable: product.quantityAvailable,
                  imageUrl: product.imageUrl,
                  images: product.images,
                  isActive: product.isActive,
                  categories: product.categories,
                });

                const searchResult: ProductSearchResult = {
                  itemId: product.itemId || Math.random(), // fallback for missing ID
                  productName:
                    product.productName ||
                    product.itemName ||
                    'Unnamed Product',
                  itemName:
                    product.itemName || product.productName || 'Unnamed Item',
                  description:
                    product.description || 'No description available',
                  price: product.price || product.unitPrice || 0,
                  unitPrice: product.unitPrice || product.price || 0,
                  unit: product.unit || 'piece',
                  quantity: product.quantityAvailable || 0,
                  isActive: product.isActive !== false,
                  images: product.imageUrl
                    ? [
                        {
                          imageUrl: imageUtils.getImageUrl(product.imageUrl),
                          altText: product.productName || product.itemName,
                          isPrimary: true,
                        },
                      ]
                    : [
                        {
                          imageUrl: imageUtils.getImageUrl(null),
                          altText: product.productName || product.itemName,
                          isPrimary: true,
                        },
                      ],
                  store: {
                    storeId: storefront.storeId,
                    storeName: storefront.storeName,
                    slug: storefront.slug,
                    logoUrl: storefront.store?.logoUrl,
                    city: storefront.store?.addresses?.[0]?.city,
                    state: storefront.store?.addresses?.[0]?.state,
                  },
                  categories: product.categories || [],
                };

                // Debug log the processed search result
                console.log('🔍 DEBUG - Processed search result:', {
                  itemId: searchResult.itemId,
                  productName: searchResult.productName,
                  quantity: searchResult.quantity,
                  images: searchResult.images,
                  imageUrl: searchResult.images[0]?.imageUrl,
                });

                allProducts.push(searchResult);
              }
            });
          }
        });

        // Apply filters
        const filteredProducts = allProducts.filter((product) => {
          if (filters.category && product.categories.length > 0) {
            return product.categories.some(
              (cat) => cat.name === filters.category
            );
          }
          if (filters.minPrice && product.price < filters.minPrice)
            return false;
          if (filters.maxPrice && product.price > filters.maxPrice)
            return false;
          if (filters.inStock && product.quantity <= 0) return false;
          return true;
        });

        // Apply sorting
        filteredProducts.sort((a, b) => {
          switch (sortBy) {
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            case 'name':
              return a.productName.localeCompare(b.productName);
            case 'newest':
              return b.itemId - a.itemId; // Assuming higher ID = newer
            case 'popular':
              return b.quantity - a.quantity; // More stock = more popular (rough approximation)
            default: // relevance
              return 0; // Keep original order for relevance
          }
        });

        // Pagination
        const itemsPerPage = 12;
        const totalResults = filteredProducts.length;
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setProducts(paginatedProducts);
        setTotalResults(totalResults);
        setTotalPages(totalPages);

        console.log('🔍 Search results:', {
          totalFound: totalResults,
          currentPage,
          totalPages,
          displayedItems: paginatedProducts.length,
        });
      } catch (err) {
        console.error('Failed to search products:', err);
        setError('Failed to search products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery, filters, sortBy, currentPage]);

  const updateSearchParams = (
    newParams: Record<string, string | number | undefined>
  ) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          updated.set(key, String(value));
        } else {
          updated.delete(key);
        }
      });
      return updated;
    });
  };

  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(1);
    updateSearchParams({ search: newQuery, page: undefined });
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
    updateSearchParams({ page: undefined, category: newFilters.category });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateSearchParams({ sort: newSort, page: undefined });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('relevance');
    setCurrentPage(1);
    updateSearchParams({
      category: undefined,
      sort: undefined,
      page: undefined,
    });
  };

  const getPrimaryImage = (product: ProductSearchResult) => {
    return imageUtils.getPrimaryImageUrl(product.images);
  };

  return (
    <Box>
      <Header onLoginClick={() => navigate('/login')} />
      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link color='inherit' href='/' sx={{ textDecoration: 'none' }}>
              Home
            </Link>
            <Typography color='text.primary'>Product Search</Typography>
          </Breadcrumbs>

          <Typography
            variant='h3'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            <Search sx={{ mr: 2, verticalAlign: 'middle' }} />
            Search Products
          </Typography>
          <Typography variant='h6' color='text.secondary' paragraph>
            Find fresh, local products from farmers and creators in your area
          </Typography>
        </Box>

        {/* Search Bar */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            placeholder='Search for products... (e.g., fresh vegetables, organic fruits, beef)'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
            variant='outlined'
            size='medium'
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '1.1rem',
              },
            }}
          />
        </Paper>

        {/* Filters and Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent='space-between'
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ flex: 1 }}
            >
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      category: e.target.value || undefined,
                    })
                  }
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

              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label='Sort by'
                >
                  {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant='outlined'
                onClick={clearFilters}
                startIcon={<FilterList />}
                disabled={!filters.category && sortBy === 'relevance'}
              >
                Clear Filters
              </Button>
            </Stack>

            <Stack direction='row' spacing={1}>
              <Tooltip title='Grid View'>
                <IconButton
                  onClick={() => setViewMode('grid')}
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                >
                  <GridView />
                </IconButton>
              </Tooltip>
              <Tooltip title='List View'>
                <IconButton
                  onClick={() => setViewMode('list')}
                  color={viewMode === 'list' ? 'primary' : 'default'}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Paper>

        {/* Results Summary */}
        <Box sx={{ mb: 3 }}>
          {searchQuery ? (
            <Typography variant='body1' color='text.secondary'>
              {loading
                ? 'Searching...'
                : `Found ${totalResults} products matching "${searchQuery}"`}
              {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </Typography>
          ) : (
            <Typography variant='body1' color='text.secondary'>
              Enter a search term to find products
            </Typography>
          )}
        </Box>

        {/* Content */}
        {error ? (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : !searchQuery ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h5' gutterBottom>
              Start your product search
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Enter keywords like "beef", "fresh vegetables", or "organic
              fruits" to find products from local stores.
            </Typography>
          </Box>
        ) : loading ? (
          <Grid container spacing={3}>
            {[...Array(12)].map((_, index) => (
              <Grid
                key={index}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3
                }}>
                <Card>
                  <Skeleton variant='rectangular' height={200} />
                  <CardContent>
                    <Skeleton variant='text' sx={{ fontSize: '1.2rem' }} />
                    <Skeleton variant='text' />
                    <Skeleton variant='text' width='60%' />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Search sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h5' gutterBottom>
              No products found
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Try adjusting your search terms or filters to find what you're
              looking for.
            </Typography>
            <Button variant='contained' onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            {/* Products Grid/List */}
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid
                  key={product.itemId}
                  size={{
                    xs: 12,
                    sm: viewMode === 'list' ? 12 : 6,
                    md: viewMode === 'list' ? 12 : 4,
                    lg: viewMode === 'list' ? 12 : 3
                  }}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: viewMode === 'list' ? 'row' : 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() =>
                      navigate(
                        `/store/${product.store.slug}?product=${product.itemId}`
                      )
                    }
                  >
                    <CardMedia
                      component='div'
                      sx={{
                        height: viewMode === 'list' ? 120 : 200,
                        width: viewMode === 'list' ? 120 : '100%',
                        minWidth: viewMode === 'list' ? 120 : 'auto',
                        backgroundImage: `url(${getPrimaryImage(product)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'grey.200',
                      }}
                    />

                    <CardContent sx={{ flex: 1, p: 2 }}>
                      <Typography
                        variant='h6'
                        component='h3'
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          fontSize: viewMode === 'list' ? '1rem' : '1.1rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {product.productName}
                      </Typography>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        paragraph
                        sx={{
                          minHeight: viewMode === 'list' ? 'auto' : 40,
                          display: '-webkit-box',
                          WebkitLineClamp: viewMode === 'list' ? 2 : 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {product.description}
                      </Typography>

                      {/* Store info */}
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Store
                          sx={{
                            fontSize: 16,
                            color: 'text.secondary',
                            mr: 0.5,
                          }}
                        />
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/store/${product.store.slug}`);
                          }}
                        >
                          {product.store.storeName}
                        </Typography>
                      </Box>

                      {/* Location */}
                      {product.store.city && (
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
                            {product.store.city}, {product.store.state}
                          </Typography>
                        </Box>
                      )}

                      {/* Categories */}
                      {product.categories && product.categories.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction='row' spacing={0.5} flexWrap='wrap'>
                            {product.categories
                              .slice(0, 2)
                              .map((category, index) => (
                                <Chip
                                  key={index}
                                  label={category.name}
                                  size='small'
                                  variant='outlined'
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Price and Actions */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 'auto',
                        }}
                      >
                        <Box>
                          <Typography
                            variant='h6'
                            component='span'
                            color='primary.main'
                            sx={{ fontWeight: 600 }}
                          >
                            ${product.price.toFixed(2)}
                          </Typography>
                          {product.unit && (
                            <Typography
                              variant='body2'
                              component='span'
                              color='text.secondary'
                              sx={{ ml: 0.5 }}
                            >
                              / {product.unit}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          size='small'
                          variant='contained'
                          startIcon={<ShoppingCart />}
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement add to cart
                            console.log('Add to cart:', product);
                          }}
                          disabled={product.quantity <= 0}
                        >
                          {product.quantity <= 0
                            ? 'Out of Stock'
                            : 'Add to Cart'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display='flex' justifyContent='center' sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => handlePageChange(page)}
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

export default ProductSearchPage;
