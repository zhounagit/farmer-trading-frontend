import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Inventory,
  Star,
  StarBorder,
  DragIndicator,
  Close,
} from '@mui/icons-material';
import { useCallback } from 'react';
import InventoryApiService from '../../features/inventory/services/inventoryApi';
import StorefrontApiService from '../../features/storefront/services/storefrontApi';
import type { InventoryItem } from '../../shared/types/inventory';

interface FeaturedProductsManagerProps {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onSave?: () => void;
}

interface FeaturedProduct extends InventoryItem {
  isFeatured: boolean;
  displayOrder?: number;
}

const FeaturedProductsManager: React.FC<FeaturedProductsManagerProps> = ({
  open,
  onClose,
  storeId,
  onSave,
}) => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load inventory items and current featured products
  const loadDataCallback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all inventory items
      const inventoryResponse =
        await InventoryApiService.getInventoryItems(storeId);
      const allProducts = inventoryResponse.items || [];

      // Load current featured products to get their IDs
      const featuredResponse = await StorefrontApiService.getFeaturedProducts(
        storeId,
        50
      );
      const featuredIds = new Set(
        featuredResponse.map(
          (p: { itemId?: number; ItemId?: number }) => p.itemId || p.ItemId
        )
      );

      // Mark products as featured and set display order
      const productsWithFeaturedStatus: FeaturedProduct[] = allProducts.map(
        (product, index) => ({
          ...product,
          isFeatured: featuredIds.has(product.itemId),
          displayOrder: featuredIds.has(product.itemId) ? index : undefined,
        })
      );

      setProducts(productsWithFeaturedStatus);

      // Set featured products in order
      const featured = productsWithFeaturedStatus
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setFeaturedProducts(featured);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (open && storeId) {
      loadDataCallback();
    }
  }, [open, storeId, loadDataCallback]);

  const handleProductToggle = (product: FeaturedProduct) => {
    const updatedProducts = products.map((p) =>
      p.itemId === product.itemId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setProducts(updatedProducts);

    if (!product.isFeatured) {
      // Adding to featured
      setFeaturedProducts((prev) => [
        ...prev,
        { ...product, isFeatured: true },
      ]);
    } else {
      // Removing from featured
      setFeaturedProducts((prev) =>
        prev.filter((p) => p.itemId !== product.itemId)
      );
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const featuredItemIds = featuredProducts.map((p) => p.itemId);

      await StorefrontApiService.setFeaturedProducts(storeId, featuredItemIds);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSave?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error saving featured products:', err);
      setError('Failed to save featured products. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableProducts = filteredProducts.filter(
    (p) => !p.isFeatured && p.status === 'active'
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>Manage Featured Products</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='400px'
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            display='flex'
            gap={3}
            sx={{ flexDirection: { xs: 'column', md: 'row' } }}
          >
            {/* Featured Products Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' gutterBottom>
                Featured Products ({featuredProducts.length})
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Drag to reorder. These products will appear on your storefront.
              </Typography>

              <Box
                sx={{
                  minHeight: '200px',
                  border: '2px dashed #ddd',
                  borderRadius: 2,
                  p: 2,
                  bgcolor: 'grey.50',
                }}
              >
                {featuredProducts.length === 0 ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    minHeight='150px'
                    color='text.secondary'
                  >
                    <Star sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                    <Typography>No featured products selected</Typography>
                    <Typography variant='caption'>
                      Select products from the available list
                    </Typography>
                  </Box>
                ) : (
                  featuredProducts.map((product) => (
                    <Card key={product.itemId} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box display='flex' alignItems='center' gap={1}>
                          <DragIndicator color='action' />
                          <Box flexGrow={1}>
                            <Typography variant='subtitle2'>
                              {product.name}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              ${product.pricePerUnit?.toFixed(2)} •{' '}
                              {product.unitType}
                            </Typography>
                          </Box>
                          <IconButton
                            size='small'
                            onClick={() => handleProductToggle(product)}
                            color='primary'
                          >
                            <Star />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Box>

            {/* Available Products Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' gutterBottom>
                Available Products
              </Typography>

              <TextField
                fullWidth
                size='small'
                placeholder='Search products...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {availableProducts.length === 0 ? (
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    minHeight='200px'
                    color='text.secondary'
                  >
                    <Inventory sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                    <Typography>No products available</Typography>
                    <Typography variant='caption'>
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Add products to your inventory first'}
                    </Typography>
                  </Box>
                ) : (
                  availableProducts.map((product) => (
                    <Card key={product.itemId} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Box display='flex' alignItems='center' gap={1}>
                          <Box flexGrow={1}>
                            <Typography variant='subtitle2'>
                              {product.name}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              ${product.pricePerUnit?.toFixed(2)} •{' '}
                              {product.unitType}
                            </Typography>
                            {product.quantityAvailable <= 5 && (
                              <Chip
                                label='Low Stock'
                                size='small'
                                color='warning'
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                          <Tooltip title='Add to featured'>
                            <IconButton
                              size='small'
                              onClick={() => handleProductToggle(product)}
                            >
                              <StarBorder />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ mt: 2 }}>
            Featured products saved successfully!
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={20} /> : undefined}
        >
          {saving
            ? 'Saving...'
            : `Save Featured Products (${featuredProducts.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeaturedProductsManager;
