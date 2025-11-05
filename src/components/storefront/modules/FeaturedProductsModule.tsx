import React from 'react';
import {
  Box,
  Container,
  Typography,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  ShoppingCart,
  RequestQuote,
  Verified,
  LocalShipping,
  Engineering,
} from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';
import type { StorefrontProduct } from '@/shared/types/storefront';

interface FeaturedProductsModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const FeaturedProductsModule: React.FC<FeaturedProductsModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};

  // Industrial professional settings
  const title = (settings.title as string) || 'Featured Products';
  const subtitle =
    (settings.subtitle as string) ||
    'Professional-grade products trusted by industry leaders';
  const showPrices = (settings.showPrices as boolean) !== false;
  const showSpecifications = (settings.showSpecifications as boolean) !== false;
  const maxProducts = (settings.maxProducts as number) || 6;
  const productIds = (settings.productIds as string[]) || [];

  // Get products from storefront and safely cast to StorefrontProduct[]
  const allProducts =
    (storefront.products as unknown as StorefrontProduct[]) || [];

  // Filter products based on productIds if specified, otherwise use all products
  const featuredProducts =
    productIds.length > 0
      ? allProducts.filter((product: StorefrontProduct) =>
          productIds.includes(product.productId.toString())
        )
      : allProducts.slice(0, maxProducts);

  // Debug logging
  console.log('🛍️ FeaturedProductsModule Debug:', {
    allProductsCount: allProducts.length,
    productIds: productIds,
    featuredProductsCount: featuredProducts.length,
    maxProducts: maxProducts,
    showPrices: showPrices,
  });

  // Show helpful message when no products available
  if (featuredProducts.length === 0) {
    return (
      <Box sx={{ py: 8, backgroundColor: 'var(--theme-surface, #F8FAFC)' }}>
        <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
          <Typography
            variant='h3'
            component='h2'
            textAlign='center'
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'var(--theme-text-primary, #1F2937)',
              fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
            }}
          >
            {title}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'var(--theme-background, white)',
              borderRadius: 2,
              border: '2px dashed var(--theme-border, #E5E7EB)',
            }}
          >
            <Engineering
              sx={{
                fontSize: 64,
                color: 'var(--theme-text-muted, #9CA3AF)',
                mb: 2,
              }}
            />
            <Typography variant='h6' color='text.secondary' gutterBottom>
              No Products Available
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {allProducts.length === 0
                ? 'Add products to your inventory to display them here.'
                : 'Configure featured products in your storefront settings.'}
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  const handleAddToCart = (product: StorefrontProduct) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product);
  };

  const handleRequestQuote = (product: StorefrontProduct) => {
    // TODO: Implement request quote functionality
    console.log('Request quote for:', product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderProductCard = (product: StorefrontProduct, index: number) => {
    const price = product.price || 0;
    const imageUrl = product.imageUrl || '';
    const inStock = product.isInStock !== false;
    const isProfessionalGrade = product.tags?.includes('professional') || false;

    // Debug logging for product image
    console.log('🖼️ Product image debug:', {
      productId: product.productId || product.itemId,
      productName: product.name,
      imageUrl: product.imageUrl,
      images: product.images,
      finalImageUrl: imageUrl,
      hasImageUrl: !!imageUrl,
      quantityAvailable: product.quantityAvailable,
      inStock: inStock,
    });

    return (
      <Box
        key={product.productId || index}
        sx={{
          width: '100%',
          minHeight: '100%',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--theme-border, #E5E7EB)',
            borderRadius: 'var(--theme-radius-md, 8px)',
            transition: 'var(--theme-transition-normal, all 0.2s ease)',
            backgroundColor: 'var(--theme-background, white)',
            '&:hover': {
              borderColor: 'var(--theme-accent, #F59E0B)',
              transform: 'translateY(-2px)',
              boxShadow:
                'var(--theme-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1))',
            },
          }}
        >
          {/* Product Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component='img'
              height='240'
              image={
                imageUrl ||
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTIwTDE4MCA5MEwyMjAgOTBMMjAwIDEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyBpZD0iSWNvbmx5YWZpbGwtUGhvdG8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Im0xOSAzaDRjMS4xIDAgMiAuOSAyIDJ2MTRjMCAxLjEtLjkgMi0yIDJoLTE0Yy0xLjEgMC0yLS45L/placeholder/400/240'
              }
              alt={product.name || 'Product Name'}
              sx={{ objectFit: 'cover' }}
            />

            {/* Status Badges */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {isProfessionalGrade && (
                <Chip
                  icon={<Verified sx={{ fontSize: 16 }} />}
                  label='Professional Grade'
                  size='small'
                  sx={{
                    backgroundColor: '#1E3A8A',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
              )}
              {inStock && (
                <Chip
                  label='In Stock'
                  size='small'
                  sx={{
                    backgroundColor: '#059669',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>

            {/* Quick Shipping Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
              }}
            >
              <Chip
                icon={<LocalShipping sx={{ fontSize: 14 }} />}
                label='Fast Ship'
                size='small'
                sx={{
                  backgroundColor: '#F59E0B',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            </Box>
          </Box>

          <CardContent
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 3,
            }}
          >
            {/* Product Name */}
            <Typography
              variant='h6'
              component='h3'
              sx={{
                mb: 1,
                fontWeight: 600,
                color: '#1F2937',
                fontSize: '1.125rem',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {product.name || 'Product Name'}
            </Typography>

            {/* Model/SKU */}
            {product.unit && (
              <Typography
                variant='body2'
                sx={{
                  mb: 2,
                  color: '#6B7280',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Unit: {product.unit}
              </Typography>
            )}

            {/* Product Description */}
            {product.description && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  mb: 3,
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5,
                  fontSize: '0.875rem',
                }}
              >
                {product.description as string}
              </Typography>
            )}

            {/* Specifications */}
            {showSpecifications && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='caption'
                  sx={{
                    color: '#6B7280',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Key Specs
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(product.unit as string) && (
                    <Chip
                      label={`Unit: ${product.unit}`}
                      size='small'
                      variant='outlined'
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  <Chip
                    label='Industrial Grade'
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Price and Actions */}
            <Box sx={{ mt: 'auto' }}>
              {showPrices && price > 0 && (
                <Typography
                  variant='h6'
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    color: 'var(--theme-text-primary, #1F2937)',
                    fontSize: '1.25rem',
                  }}
                >
                  {formatPrice(price)}
                  {(product.unit as string) && (
                    <Typography
                      component='span'
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontSize: '0.875rem', ml: 0.5 }}
                    >
                      per {product.unit as string}
                    </Typography>
                  )}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  fullWidth
                  startIcon={<ShoppingCart sx={{ fontSize: 18 }} />}
                  onClick={() => handleAddToCart(product)}
                  sx={{
                    py: 1.5,
                    backgroundColor: 'var(--theme-primary, #1E3A8A)',
                    color: 'var(--theme-background, white)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'var(--theme-secondary, #1E40AF)',
                    },
                  }}
                >
                  Add to Cart
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<RequestQuote sx={{ fontSize: 18 }} />}
                  onClick={() => handleRequestQuote(product)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderColor: '#F59E0B',
                    color: '#F59E0B',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: '#D97706',
                      color: '#D97706',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  Quote
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>
      </Box>
    );
  };

  return (
    <Box
      id='products'
      sx={{ py: 8, backgroundColor: 'var(--theme-background, white)' }}
    >
      <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant='h3'
            component='h2'
            sx={{
              mb: 2,
              fontWeight: 700,
              color: 'var(--theme-text-primary, #1F2937)',
              fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
            }}
          >
            {title}
          </Typography>

          <Typography
            variant='subtitle1'
            sx={{
              color: '#6B7280',
              fontSize: '1.125rem',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Products Grid - 4 per row with vertical wrapping */}
        <Box
          sx={{
            mb: 6,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            justifyItems: 'stretch',
          }}
        >
          {featuredProducts.map(renderProductCard)}
        </Box>

        {/* Products Count Display */}
        {featuredProducts.length > 4 && (
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant='body2'
              sx={{
                color: '#6B7280',
                fontSize: '0.875rem',
              }}
            >
              Showing {featuredProducts.length} featured products
            </Typography>
          </Box>
        )}

        {/* Bottom Section */}
        <Box
          sx={{ textAlign: 'center', pt: 4, borderTop: '1px solid #E5E7EB' }}
        >
          {allProducts.length > maxProducts && (
            <Button
              variant='contained'
              size='large'
              onClick={() => {
                // Scroll to all products section if it exists
                const allProductsSection = document.querySelector(
                  '[id*="all-products"]'
                );
                if (allProductsSection) {
                  allProductsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              sx={{
                py: 2,
                px: 6,
                backgroundColor: '#1E3A8A',
                color: 'white',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.875rem',
                mb: 2,
                '&:hover': {
                  backgroundColor: '#1E40AF',
                },
              }}
            >
              View All {allProducts.length} Products
            </Button>
          )}

          <Typography variant='body2' sx={{ color: '#6B7280', mt: 2 }}>
            Professional-grade solutions trusted by industry leaders worldwide
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProductsModule;
