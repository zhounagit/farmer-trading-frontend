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
  Store,
  LocationOn,
  Phone,
  Email,
  RequestQuote,
  Inventory,
  LocalOffer,
  NavigateNext,
  Close,
  ZoomIn,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import StorefrontApiService from '../../services/storefront.api';
import Header from '../../components/layout/Header';

// Helper function to safely handle image URLs
const getSafeImageUrl = (url?: string, fallback: string = '/placeholder-product.svg'): string => {
  if (!url || !url.trim()) {
    return fallback;
  }
  return url.trim();
};

interface ProductImage {
  imageId: number;
  originalUrl: string;
  thumbnailUrl?: string;
  altText?: string;
  displayOrder: number;
  isDefault: boolean;
}

interface RelatedProduct {
  itemId: number;
  name: string;
  sku?: string;
  price: number;
  imageUrl?: string;
  storeName: string;
  storeSlug?: string;
  inStock: boolean;
}

interface ProductDetail {
  itemId: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  unitPrice?: number;
  unit?: string;
  quantity: number;
  minStockLevel: number;
  isActive: boolean;
  allowOffers: boolean;
  minOfferPrice?: number;
  createdAt: string;
  lastUpdated: string;
  categoryName?: string;
  categoryId?: number;
  storeId: number;
  storeName: string;
  storeSlug?: string;
  storeDescription?: string;
  storeLogoUrl?: string;
  storeLocation?: string;
  storePhone?: string;
  storeEmail?: string;
  storeApprovalStatus: string;
  images: ProductImage[];
  inStock: boolean;
  lowStock: boolean;
  outOfStock: boolean;
  stockStatus: string;
  relatedProducts: RelatedProduct[];
}

const ProductDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState<ProductDetail | null>(null);
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

  const fetchProductDetail = async () => {
    if (!itemId) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 ProductDetailPage: Fetching product with itemId:', itemId);
      console.log('🔍 ProductDetailPage: Parsed itemId:', parseInt(itemId));

      // Debug call to see what the backend is actually returning
      const debugData = await StorefrontApiService.debugProductDetail(parseInt(itemId));
      console.log('🔍 ProductDetailPage: Debug response:', debugData);

      const productData = await StorefrontApiService.getProductDetail(parseInt(itemId));
      console.log('🔍 ProductDetailPage: Product data received:', productData);

      if (!productData) {
        console.error('🔍 ProductDetailPage: No product data returned from API');
        setError('Product not found');
        return;
      }

      console.log('🔍 ProductDetailPage: Setting product data:', {
        price: productData.price,
        quantity: productData.quantity,
        images: productData.images?.length || 0,
        name: productData.name
      });

      setProduct(productData);

      // Set default selected image (first default image or first image)
      if (productData.images.length > 0) {
        const defaultImageIndex = productData.images.findIndex(img => img.isDefault);
        setSelectedImageIndex(defaultImageIndex >= 0 ? defaultImageIndex : 0);
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
      case 'In Stock': return 'success';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'error';
      default: return 'default';
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="30%" height={30} />
              <Skeleton variant="text" width="100%" height={100} />
              <Skeleton variant="rectangular" height={60} />
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Product not found'}
          </Alert>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(backTo)}>
            {backLabel}
          </Button>
        </Container>
      </Box>
    );
  }

  const currentImage = product.images.length > 0 ? product.images[selectedImageIndex] : null;

  return (
    <Box>
      <Header />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link
            component="button"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link
            component="button"
            onClick={() => navigate(backTo)}
            sx={{ textDecoration: 'none' }}
          >
            Search
          </Link>
          {product.categoryName && (
            <Typography color="text.primary">{product.categoryName}</Typography>
          )}
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(backTo)}
          sx={{ mb: 3 }}
          variant="outlined"
          size="small"
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
                  component="img"
                  height="400"
                  image={getSafeImageUrl(currentImage?.originalUrl)}
                  alt={currentImage?.altText || product.name}
                  sx={{
                    objectFit: 'cover',
                    cursor: product.images.length > 0 ? 'pointer' : 'default',
                    '&:hover': product.images.length > 0 ? { opacity: 0.9 } : {}
                  }}
                  onClick={() => product.images.length > 0 && setImageDialogOpen(true)}
                />
                {product.images.length > 0 && (
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                    }}
                    onClick={() => setImageDialogOpen(true)}
                  >
                    <ZoomIn />
                  </IconButton>
                )}
              </Card>

              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <ImageList cols={4} gap={8} sx={{ height: 100 }}>
                  {product.images.map((image, index) => (
                    <ImageListItem
                      key={`thumbnail-${index}-${image.imageId}`}
                      sx={{
                        cursor: 'pointer',
                        border: selectedImageIndex === index ? 2 : 1,
                        borderColor: selectedImageIndex === index ? 'primary.main' : 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={getSafeImageUrl(image.thumbnailUrl || image.originalUrl)}
                        alt={image.altText || `${product.name} ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {/* No Image Placeholder */}
              {product.images.length === 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="400"
                    image="/placeholder-product.svg"
                    alt={`${product.name} - No image available`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              )}
            </Paper>
          </Grid>

          {/* Product Information */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, flex: 1 }}>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    color={isFavorite ? "error" : "default"}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share product">
                  <IconButton onClick={handleShare}>
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* SKU */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              SKU: {product.sku}
            </Typography>

            {/* Price */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                {formatPrice(product.price)}
              </Typography>
              {product.unit && (
                <Typography variant="body1" color="text.secondary">
                  per {product.unit}
                </Typography>
              )}
            </Box>

            {/* Stock Status */}
            <Box sx={{ mb: 3 }}>
              <Chip
                label={product.stockStatus}
                color={getStockStatusColor(product.stockStatus)}
                variant="filled"
                icon={<Inventory />}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {product.quantity} units available
              </Typography>
            </Box>

            {/* Description */}
            {product.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {product.description}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Add to Cart Section */}
            {!product.outOfStock && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Add to Cart
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="body1">Quantity:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      size="small"
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={quantity}
                      size="small"
                      sx={{ width: 80, mx: 1 }}
                      inputProps={{
                        style: { textAlign: 'center' },
                        min: 1,
                        max: product.quantity
                      }}
                      type="number"
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
                      size="small"
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={addingToCart ? undefined : <ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      py: 1.5,
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                  >
                    {addingToCart ? 'Adding to Cart...' : `Add to Cart - ${formatPrice(product.price * quantity)}`}
                  </Button>

                  {product.allowOffers && (
                    <Button
                      variant="outlined"
                      size="large"
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
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Store Information
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={product.storeLogoUrl}
                  sx={{ width: 48, height: 48, mr: 2 }}
                >
                  <Store />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {product.storeName}
                  </Typography>
                  {product.storeLocation && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.storeLocation}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {product.storeDescription && (
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  {product.storeDescription}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {product.storePhone && (
                  <Button
                    startIcon={<Phone />}
                    size="small"
                    href={`tel:${product.storePhone}`}
                  >
                    Call
                  </Button>
                )}
                {product.storeEmail && (
                  <Button
                    startIcon={<Email />}
                    size="small"
                    href={`mailto:${product.storeEmail}`}
                  >
                    Email
                  </Button>
                )}
                <Button
                  startIcon={<Store />}
                  size="small"
                  onClick={() => navigate(`/store/${product.storeSlug}`)}
                >
                  Visit Store
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              Related Products
            </Typography>

            <Grid container spacing={3}>
              {product.relatedProducts.map((relatedProduct, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`related-${relatedProduct.itemId}-${index}`}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      },
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate(`/product/${relatedProduct.itemId}`)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={getSafeImageUrl(relatedProduct.imageUrl)}
                      alt={relatedProduct.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}>
                        {relatedProduct.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {relatedProduct.storeName}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          {formatPrice(relatedProduct.price)}
                        </Typography>
                        <Chip
                          label={relatedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                          size="small"
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
            maxWidth="md"
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
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
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
