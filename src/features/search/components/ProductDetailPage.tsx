import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  TextField,
  Avatar,
  Alert,
  Skeleton,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  ShoppingCart,
  Add,
  Remove,
  Favorite,
  FavoriteBorder,
  Share,
  ArrowBack,
  Store as StoreIcon,
  LocationOn,
  Phone,
  Email,
  RequestQuote,
  Inventory,
  NavigateNext,
  Close,
  ZoomIn,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { InventoryApiService } from '../../../features/inventory/services/inventoryApi';
import { StoresApiService } from '../../../features/stores/services/storesApi';
import Header from '../../../components/layout/Header';
import type { InventoryItem } from '../../../shared/types/inventory';
import type { Store } from '../../../shared/types/store';
import { API_CONFIG } from '../../../utils/api';

// Helper function to safely handle image URLs with proper backend base URL
const getSafeImageUrl = (url?: string, fallback?: string): string => {
  if (!url || !url.trim()) {
    return fallback || '';
  }

  const trimmedUrl = url.trim();

  // If already an absolute URL, return as-is
  if (trimmedUrl.startsWith('http')) {
    return trimmedUrl;
  }

  // If it's a relative path, prepend the API base URL
  if (trimmedUrl.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${trimmedUrl}`;
  }

  // Otherwise, prepend / and then base URL
  return `${API_CONFIG.BASE_URL}/${trimmedUrl}`;
};

const ProductDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<InventoryItem | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get back navigation info from location state
  const backTo = (location.state as any)?.from || '/unified-search';
  const backLabel = (location.state as any)?.backLabel || 'Back to Search';

  useEffect(() => {
    fetchProductDetail();
  }, [itemId]);

  useEffect(() => {
    if (product?.itemId) {
      loadProductImages();
    }
  }, [product?.itemId]);

  useEffect(() => {
    if (product?.storeId) {
      loadStoreInfo();
    }
  }, [product?.storeId]);

  const loadProductImages = async () => {
    try {
      const images = await InventoryApiService.getInventoryItemImages(
        product!.itemId
      );
      if (images && images.length > 0) {
        // Update product with fetched images
        setProduct((prev) => (prev ? { ...prev, images } : null));
        // Set default selected image
        setSelectedImageIndex(0);
      }
    } catch (err) {
      console.error('Error loading product images:', err);
      // Continue without images
    }
  };

  const loadStoreInfo = async () => {
    try {
      console.log('🔍 Loading store info for storeId:', product!.storeId);
      // Use enhanced endpoint to get complete store data including logoUrl
      const storeData = await StoresApiService.getEnhancedStoreById(
        product!.storeId
      );
      console.log('✅ Store info loaded:', storeData);

      // Extract logo from nested images object
      let logoUrl = storeData.logoUrl;
      if (!logoUrl && (storeData as any).images?.logoUrl) {
        logoUrl = (storeData as any).images.logoUrl;
        console.log('📸 Logo found in nested images object:', logoUrl);
      } else {
        console.log('📸 Store logoUrl from top level:', logoUrl);
      }

      // Convert relative logoUrl to absolute URL with backend base
      if (logoUrl) {
        logoUrl = getSafeImageUrl(logoUrl);
        console.log('📸 Final processed store logoUrl:', logoUrl);
      } else {
        console.log('ℹ️ No logo found - Avatar will show StoreIcon fallback');
      }

      // Update store with processed logoUrl
      const finalStore = {
        ...storeData,
        logoUrl: logoUrl,
      };

      setStore(finalStore);
    } catch (err) {
      console.error('❌ Error loading store info:', err);
      console.error('Error details:', (err as any)?.message || 'Unknown error');
    }
  };

  const fetchProductDetail = async () => {
    if (!itemId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse itemId - could be in format "product-30" or just "30"
      let parsedId: number;
      if (itemId.includes('-')) {
        // Format: "product-30" - extract the number
        parsedId = parseInt(itemId.split('-')[1]);
      } else {
        // Format: "30" - parse directly
        parsedId = parseInt(itemId);
      }

      console.log(
        '🔍 ProductDetailPage: Fetching product with itemId:',
        parsedId
      );

      // Fetch product details from inventory API
      const inventoryItem = await InventoryApiService.getInventoryItem(
        parsedId,
        true
      );

      if (!inventoryItem) {
        console.error('❌ No product data returned from API');
        setError('Product not found');
        return;
      }

      console.log('✅ Product data received:', inventoryItem);
      setProduct(inventoryItem);

      // Set default selected image if available
      if (inventoryItem.images && inventoryItem.images.length > 0) {
        setSelectedImageIndex(0);
      }
    } catch (err) {
      console.error('Error fetching product detail:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      // TODO: Implement actual cart API call
      // await CartApiService.addToCart({ itemId: product.itemId, quantity });

      toast.success(`Added ${quantity} ${product.name} to cart!`);

      // Optional: Reset quantity to 1 after adding
      setQuantity(1);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRequestQuote = () => {
    if (!product) return;

    // TODO: Implement quote request functionality
    toast.success('Quote request sent! The store owner will contact you soon.');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} from ${product?.storeName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Box>
        <Header />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant='rectangular' height={400} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant='text' width='60%' height={40} />
              <Skeleton variant='text' width='30%' height={30} />
              <Skeleton variant='text' width='100%' height={100} />
              <Skeleton variant='rectangular' height={60} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box>
        <Header />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Alert severity='error' sx={{ mb: 2 }}>
            {error || 'Product not found'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(backTo)}>
            {backLabel}
          </Button>
        </Container>
      </Box>
    );
  }

  const currentImage =
    product?.images && product.images.length > 0
      ? product.images[selectedImageIndex]
      : null;

  return (
    <Box>
      <Header />
      <Container maxWidth='lg' sx={{ py: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize='small' />}
          sx={{ mb: 3 }}
        >
          <Link
            component='button'
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            component='button'
            onClick={() => navigate(backTo)}
            sx={{ textDecoration: 'none' }}
          >
            Search
          </Link>
          {product.category && (
            <Typography color='text.primary'>{product.category}</Typography>
          )}
          <Typography color='text.primary' sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(backTo)}
          sx={{ mb: 3 }}
          variant='outlined'
          size='small'
        >
          {backLabel}
        </Button>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              {/* Main Image */}
              <Card sx={{ mb: 2, position: 'relative' }}>
                <CardMedia
                  component='img'
                  height='400'
                  image={getSafeImageUrl(
                    currentImage?.originalUrl || currentImage?.url
                  )}
                  alt={currentImage?.altText || product.name}
                  sx={{
                    objectFit: 'cover',
                    cursor: product?.images?.length > 0 ? 'pointer' : 'default',
                    '&:hover':
                      product?.images?.length > 0 ? { opacity: 0.9 } : {},
                  }}
                  onClick={() =>
                    product?.images?.length > 0 && setImageDialogOpen(true)
                  }
                />
                {product?.images?.length > 0 && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                    }}
                    onClick={() => setImageDialogOpen(true)}
                  >
                    <ZoomIn />
                  </IconButton>
                )}
              </Card>

              {/* Thumbnail Images */}
              {product?.images && product.images.length > 1 && (
                <ImageList cols={4} gap={8} sx={{ height: 100 }}>
                  {product.images.map((image: any, index: number) => (
                    <ImageListItem
                      key={`thumbnail-${index}-${image.imageId}`}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? 2 : 1,
                        borderColor:
                          selectedImageIndex === index
                            ? 'primary.main'
                            : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden',
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={getSafeImageUrl(
                          image.url || image.thumbnailUrl || image.originalUrl
                        )}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {/* No Image Placeholder */}
              {!product?.images ||
                (product.images.length === 0 && (
                  <Card sx={{ mb: 2 }}>
                    <CardMedia
                      component='img'
                      height='400'
                      image='/placeholder-product.svg'
                      alt={`${product.name} - No image available`}
                      sx={{ objectFit: 'cover' }}
                    />
                  </Card>
                ))}
            </Paper>
          </Grid>

          {/* Product Information */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Typography
                variant='h4'
                component='h1'
                sx={{ fontWeight: 700, flex: 1 }}
              >
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip
                  title={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    color={isFavorite ? 'error' : 'default'}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title='Share product'>
                  <IconButton onClick={handleShare}>
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* SKU */}
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              SKU: {product.sku || 'N/A'}
            </Typography>

            {/* Price */}
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}
            >
              <Typography variant='h5' color='primary' sx={{ fontWeight: 700 }}>
                {formatPrice(product.price)}
              </Typography>
              {(product.unit || product.Unit) && (
                <Typography variant='body1' color='text.secondary'>
                  per {product.unit}
                </Typography>
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={
                  (product.quantity || 0) > 0 ? 'In Stock' : 'Out of Stock'
                }
                color={(product.quantity || 0) > 0 ? 'success' : 'error'}
                variant='filled'
                icon={<Inventory />}
              />
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                {product.quantity || 0} units available
              </Typography>
            </Box>

            {/* Description */}
            {product.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 1, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant='body1' sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Add to Cart Section */}
            {(product.quantity || 0) > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                  Add to Cart
                </Typography>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}
                >
                  <Typography variant='body1'>Quantity:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      size='small'
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={quantity}
                      size='small'
                      sx={{ width: 80, mx: 1 }}
                      inputProps={{
                        style: { textAlign: 'center' },
                        min: 1,
                        max: product.quantity,
                      }}
                      type='number'
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= product.quantity) {
                          setQuantity(val);
                        }
                      }}
                    />
                    <IconButton
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.quantity}
                      size='small'
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant='contained'
                    size='large'
                    startIcon={addingToCart ? undefined : <ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      py: 1.5,
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                  >
                    {addingToCart
                      ? 'Adding to Cart...'
                      : `Add to Cart - ${formatPrice((product.price || product.Price || 0) * quantity)}`}
                  </Button>

                  {(product.allowOffers || product.AllowOffers) && (
                    <Button
                      variant='outlined'
                      size='large'
                      startIcon={<RequestQuote />}
                      onClick={handleRequestQuote}
                      sx={{ py: 1.5 }}
                    >
                      Request Quote
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Store Information */}
            <Paper sx={{ p: 3, backgroundColor: 'grey.50' }}>
              <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
                Store Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={store?.logoUrl ? getSafeImageUrl(store.logoUrl) : ''}
                  alt={store?.storeName}
                  sx={{ width: 48, height: 48, mr: 2 }}
                  onError={(e) => {
                    console.error('🔴 Avatar image failed to load');
                    console.error('Attempted URL:', store?.logoUrl);
                    console.error(
                      'Processed URL:',
                      store?.logoUrl ? getSafeImageUrl(store.logoUrl) : 'empty'
                    );
                  }}
                >
                  <StoreIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    {store?.storeName || 'Store'}
                  </Typography>
                  {store?.addresses && store.addresses.length > 0 && (
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                    >
                      <LocationOn
                        fontSize='small'
                        color='action'
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant='body2' color='text.secondary'>
                        {store.addresses[0].city}, {store.addresses[0].state}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {store?.description && (
                <Typography
                  variant='body2'
                  sx={{ mb: 2, color: 'text.secondary' }}
                >
                  {store.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {store?.contactPhone && (
                  <Button
                    startIcon={<Phone />}
                    size='small'
                    href={`tel:${store.contactPhone}`}
                  >
                    Call
                  </Button>
                )}
                {store?.contactEmail && (
                  <Button
                    startIcon={<Email />}
                    size='small'
                    href={`mailto:${store.contactEmail}`}
                  >
                    Email
                  </Button>
                )}
                <Button
                  startIcon={<StoreIcon />}
                  size='small'
                  onClick={() =>
                    navigate(
                      `/store/${store?.slug || store?.storeName || 'store'}`
                    )
                  }
                >
                  Visit Store
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Related Products */}
        {product?.relatedProducts && product.relatedProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant='h5' sx={{ mb: 3, fontWeight: 700 }}>
              Related Products
            </Typography>

            <Grid container spacing={3}>
              {product.relatedProducts.map((relatedProduct, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`related-${relatedProduct.itemId}-${index}`}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() =>
                      navigate(`/product/${relatedProduct.itemId}`)
                    }
                  >
                    <CardMedia
                      component='img'
                      height='200'
                      image={getSafeImageUrl(relatedProduct.imageUrl)}
                      alt={relatedProduct.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography
                        variant='h6'
                        sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}
                      >
                        {relatedProduct.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        {relatedProduct.storeName}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant='h6'
                          color='primary'
                          sx={{ fontWeight: 700 }}
                        >
                          {formatPrice(relatedProduct.price)}
                        </Typography>
                        <Chip
                          label={
                            relatedProduct.inStock ? 'In Stock' : 'Out of Stock'
                          }
                          size='small'
                          color={relatedProduct.inStock ? 'success' : 'default'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Image Dialog */}
        {currentImage && (
          <Dialog
            open={imageDialogOpen}
            onClose={() => setImageDialogOpen(false)}
            maxWidth='md'
            fullWidth
          >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                }}
                onClick={() => setImageDialogOpen(false)}
              >
                <Close />
              </IconButton>
              <img
                src={getSafeImageUrl(currentImage?.originalUrl)}
                alt={currentImage?.altText || product.name}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </DialogContent>
          </Dialog>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
