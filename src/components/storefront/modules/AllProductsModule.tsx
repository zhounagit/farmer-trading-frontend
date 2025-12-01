import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-hot-toast';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ShoppingCart, FavoriteBorder, Search } from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';
import type { StorefrontProduct } from '@/shared/types/storefront';
import {
  useProductsPaginated,
  mapApiProductToStorefrontProduct,
  type ApiProduct,
} from '@/features/storefront/hooks/useProductAPIs';

interface AllProductsModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const AllProductsModule: React.FC<AllProductsModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};

  // Get settings with fallbacks
  const title = (settings.title as string) || 'All Products';
  const productsPerRow = (settings.productsPerRow as number) || 3;
  const showPrices = (settings.showPrices as boolean) !== false;
  const productsPerPage = (settings.productsPerPage as number) || 12;
  const showSearch = (settings.showSearch as boolean) !== false;
  const showFilters = (settings.showFilters as boolean) !== false;

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Get store ID
  const storeId = storefront.store?.storeId || storefront.storeId;

  // Fetch paginated products from API
  const {
    products: apiProducts,
    pagination,
    loading,
    error,
    goToPage,
  } = useProductsPaginated(storeId, currentPage, productsPerPage);

  // Map API products to StorefrontProduct format
  const mappedProducts = apiProducts.map((apiProduct: ApiProduct) =>
    mapApiProductToStorefrontProduct(apiProduct)
  );

  // Get products from API or fallback to storefront products
  const allProducts: StorefrontProduct[] =
    mappedProducts.length > 0
      ? mappedProducts
      : (storefront.products as unknown as StorefrontProduct[]) || [];

  // Debug logging
  console.log('🔍 DEBUG - AllProductsModule:', {
    storeId,
    currentPage,
    productsPerPage,
    apiProductsCount: apiProducts.length,
    totalProducts: pagination?.total || allProducts.length,
    pagination,
    loading,
    error,
    searchQuery,
  });

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matches =
      (product.name as string)?.toLowerCase().includes(query) ||
      (product.description as string)?.toLowerCase().includes(query);

    return matches;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name': {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      }
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  // Use paginated products from API if available
  const paginatedProducts =
    apiProducts.length > 0 ? mappedProducts : sortedProducts;

  // Calculate pagination for local sorting
  const totalPages =
    apiProducts.length > 0
      ? pagination?.totalPages || 1
      : Math.ceil(sortedProducts.length / productsPerPage);

  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleAddToCart = async (product: StorefrontProduct) => {
    setAddingToCart(product.itemId);
    try {
      const result = await addItem(product.itemId, 1, {
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        storeId: storefront.storeId,
        storeName: storefront.storeName,
        availableQuantity: product.quantityAvailable,
      });
      if (result.success) {
        toast.success(`Added ${product.name} to cart!`);
      } else {
        toast.error(result.error || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    goToPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderProduct = (product: StorefrontProduct, index: number) => {
    const price = product.price || 0;
    const imageUrl = product.imageUrl || '';
    const productName = product.name || 'Product Name';

    return (
      <Grid
        key={product.productId || product.itemId || index}
        sx={{
          width: '100%',
          '@media (min-width: 600px)': { width: '50%' },
          [`@media (min-width: 900px)`]: { width: `${100 / productsPerRow}%` },
        }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3,
            },
          }}
        >
          {/* Product Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component='img'
              height='200'
              image={
                imageUrl ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDUiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
              }
              alt={productName}
              sx={{ objectFit: 'cover' }}
            />
            {/* Favorite Button */}
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.9)',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
              size='small'
            >
              <FavoriteBorder fontSize='small' />
            </IconButton>
          </Box>

          <CardContent
            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Product Name */}
            <Typography variant='h6' component='h3' gutterBottom>
              {productName}
            </Typography>

            {/* Product Description */}
            {product.description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  mb: 2,
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </Typography>
            )}

            {/* Unit Info */}
            {product.unit && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mb: 1 }}
              >
                Unit: {product.unit}
              </Typography>
            )}

            {/* Price and Actions */}
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mt: 'auto', pt: 2 }}
            >
              {showPrices && (
                <Typography variant='h6' color='primary' fontWeight='bold'>
                  {formatPrice(price)}
                </Typography>
              )}

              <Button
                variant='outlined'
                size='small'
                startIcon={
                  addingToCart === product.itemId ? undefined : <ShoppingCart />
                }
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart === product.itemId}
              >
                {addingToCart === product.itemId ? 'Adding...' : 'Add to Cart'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  // Loading state
  if (loading && paginatedProducts.length === 0) {
    return (
      <Box
        id='all-products'
        sx={{ py: 6, backgroundColor: 'background.default' }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            textAlign='center'
            sx={{ mb: 4 }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={48} />
          </Box>
          <Typography variant='body1' textAlign='center' color='text.secondary'>
            Loading products...
          </Typography>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error && paginatedProducts.length === 0) {
    return (
      <Box
        id='all-products'
        sx={{ py: 6, backgroundColor: 'background.default' }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            textAlign='center'
            sx={{ mb: 4 }}
          >
            {title}
          </Typography>
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Typography variant='body1' textAlign='center' color='text.secondary'>
            Unable to load products. Please try again later.
          </Typography>
        </Container>
      </Box>
    );
  }

  // Empty state
  if (paginatedProducts.length === 0) {
    return (
      <Box
        id='all-products'
        sx={{ py: 6, backgroundColor: 'background.default' }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h3'
            component='h2'
            textAlign='center'
            sx={{ mb: 4 }}
          >
            {title}
          </Typography>
          <Typography variant='body1' textAlign='center' color='text.secondary'>
            No products available at this time.
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      id='all-products'
      sx={{ py: 6, backgroundColor: 'background.default' }}
    >
      <Container maxWidth='lg'>
        {/* Section Header */}
        <Typography
          variant='h3'
          component='h2'
          textAlign='center'
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        <Typography
          variant='subtitle1'
          textAlign='center'
          color='text.secondary'
          sx={{ mb: 4 }}
        >
          Browse our complete collection of fresh, quality products
        </Typography>

        {/* Search and Filter Controls */}
        {(showSearch || showFilters) && (
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {showSearch && (
              <TextField
                placeholder='Search products...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
              />
            )}

            {showFilters && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label='Sort By'
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value='name'>Name (A-Z)</MenuItem>
                  <MenuItem value='price-low'>Price: Low to High</MenuItem>
                  <MenuItem value='price-high'>Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        )}

        {/* Products Count */}
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Showing {paginatedProducts.length} products
          {pagination &&
            ` (Page ${pagination.page} of ${pagination.totalPages})`}
          {searchQuery && ` matching "${searchQuery}"`}
          {pagination && ` (${pagination.total} total)`}
        </Typography>

        {/* Products Grid */}
        {paginatedProducts.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {paginatedProducts.map(renderProduct)}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display='flex' justifyContent='center' sx={{ mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color='primary'
                  size='large'
                />
              </Box>
            )}
          </>
        ) : (
          <Typography variant='body1' textAlign='center' color='text.secondary'>
            No products found matching your search criteria.
          </Typography>
        )}
      </Container>
    </Box>
  );
};

export default AllProductsModule;
