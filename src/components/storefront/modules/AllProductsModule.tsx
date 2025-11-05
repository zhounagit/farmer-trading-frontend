import React, { useState } from 'react';
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
} from '@mui/material';
import { ShoppingCart, FavoriteBorder, Search } from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';
import type { StorefrontProduct } from '@/shared/types/storefront';

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

  // Get products from storefront and safely cast to StorefrontProduct[]
  const allProducts =
    (storefront.products as unknown as StorefrontProduct[]) || [];

  // Debug logging
  console.log('🔍 DEBUG - AllProductsModule:', {
    totalProducts: allProducts.length,
    searchQuery,
    sampleProduct: allProducts[0] || null,
    allProductsKeys: allProducts[0] ? Object.keys(allProducts[0]) : [],
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

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handleAddToCart = () => {
    // Add to cart functionality would be implemented here
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderProduct = (product: StorefrontProduct, index: number) => {
    const price = product.price || 0;
    const imageUrl = product.imageUrl || '/api/placeholder/300/200';
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
              image={imageUrl}
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
                startIcon={<ShoppingCart />}
                onClick={() => handleAddToCart()}
              >
                Add to Cart
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (allProducts.length === 0) {
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
          Showing {paginatedProducts.length} of {sortedProducts.length} products
          {searchQuery && ` matching "${searchQuery}"`}
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
                  onChange={(_, page) => setCurrentPage(page)}
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
