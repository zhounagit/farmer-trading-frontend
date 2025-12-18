import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Grid } from '../../../shared/components/layout/Grid';
import {
  ShoppingCart,
  Store as StoreIcon,
  DeleteSweep,
  ShoppingBag,
  Warning,
  Person,
} from '@mui/icons-material';
import Header from '../../../components/layout/Header';
import { useCart } from '../../../hooks/useCart';
import { CartItem } from './CartItem';
import { StorefrontApiService } from '../../../features/storefront/services/storefrontApi';
import type { StoreCartGroup } from '../../../types/cart';
import type { GuestCartItem } from '../../../types/guest-cart';

/**
 * Cart Page Component
 *
 * Main cart page displaying all cart items grouped by store with totals and checkout actions.
 * Follows Material-UI patterns from existing components.
 */
export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    guestCart,
    isLoading,
    error,
    updateItem,
    removeItem,
    clearCart,
    refetchCart,
  } = useCart();
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [storeNames, setStoreNames] = useState<Map<number, string>>(new Map());

  // Fetch store names for all unique store IDs in cart
  useEffect(() => {
    const fetchStoreNames = async () => {
      // Get all unique store IDs from both authenticated and guest carts
      const storeIds = new Set<number>();

      // Add store IDs from authenticated cart
      if (cart?.cartItems?.length) {
        cart.cartItems.forEach((item) => {
          storeIds.add(item.storeId);
        });
      }

      // Add store IDs from guest cart
      if (guestCart?.items?.length) {
        guestCart.items.forEach((item) => {
          if (item.storeId) {
            storeIds.add(item.storeId);
          }
        });
      }

      // Fetch store names for each store ID that we don't already have
      const newStoreNames = new Map<number, string>();
      const storeIdsToFetch = Array.from(storeIds).filter(
        (storeId) => !storeNames.has(storeId)
      );

      const promises = storeIdsToFetch.map(async (storeId) => {
        try {
          console.log(`🛒 Fetching store name for store ID: ${storeId}`);
          const storefront =
            await StorefrontApiService.getPublicStorefrontById(storeId);
          console.log(`🛒 Storefront response for ${storeId}:`, storefront);

          if (
            storefront &&
            typeof storefront === 'object' &&
            'storeName' in storefront
          ) {
            const publicStorefront = storefront as { storeName: string };
            console.log(
              `🛒 Found store name: ${publicStorefront.storeName} for store ID: ${storeId}`
            );
            newStoreNames.set(storeId, publicStorefront.storeName);
          } else {
            console.warn(
              `🛒 No store name found in response for store ID: ${storeId}`
            );
          }
        } catch (error) {
          console.warn(
            `🛒 Failed to fetch store name for store ID ${storeId}:`,
            error
          );
          // Don't set anything - we'll use the fallback from cart items
        }
      });

      await Promise.all(promises);
      // Only update if we got new store names
      if (newStoreNames.size > 0) {
        console.log(
          `🛒 Updated store names:`,
          Array.from(newStoreNames.entries())
        );
        setStoreNames(
          (prevStoreNames) => new Map([...prevStoreNames, ...newStoreNames])
        );
      } else {
        console.log(`🛒 No new store names fetched`);
      }
    };

    if (cart || guestCart) {
      fetchStoreNames();
    }
  }, [cart, guestCart, storeNames]);

  // Group cart items by store for authenticated cart
  const storeGroups = useMemo((): StoreCartGroup[] => {
    if (!cart?.cartItems?.length) return [];

    const groups = new Map<number, StoreCartGroup>();

    cart.cartItems.forEach((item) => {
      if (!groups.has(item.storeId)) {
        groups.set(item.storeId, {
          storeId: item.storeId,
          storeName: storeNames.get(item.storeId) || `Store #${item.storeId}`,
          items: [],
          subtotal: 0,
          itemCount: 0,
        });
      }

      const group = groups.get(item.storeId)!;
      group.items.push(item);
      group.subtotal += item.lineTotalWithDiscount;
      group.itemCount += item.quantity;
    });

    return Array.from(groups.values());
  }, [cart?.cartItems, storeNames]);

  // Group guest cart items by store
  const guestStoreGroups = useMemo(() => {
    if (!guestCart?.items?.length) return [];

    const groups = new Map<
      number,
      {
        storeId: number;
        storeName: string;
        items: GuestCartItem[];
        subtotal: number;
        itemCount: number;
      }
    >();

    guestCart.items.forEach((item) => {
      const storeId = item.storeId || 0;
      if (!groups.has(storeId)) {
        groups.set(storeId, {
          storeId,
          storeName:
            item.storeName || storeNames.get(storeId) || `Store #${storeId}`,
          items: [],
          subtotal: 0,
          itemCount: 0,
        });
      }

      const group = groups.get(storeId)!;
      group.items.push(item);
      group.subtotal += (item.productPrice || 0) * item.quantity;
      group.itemCount += item.quantity;
    });

    return Array.from(groups.values());
  }, [guestCart?.items, storeNames]);

  // Handle quantity changes with loading state
  const handleQuantityChange = useCallback(
    async (itemId: number, newQuantity: number) => {
      setIsUpdating(itemId);
      try {
        await updateItem(itemId, newQuantity);
      } finally {
        setIsUpdating(null);
      }
    },
    [updateItem]
  );

  // Handle item removal
  const handleRemoveItem = useCallback(
    async (itemId: number) => {
      setIsUpdating(itemId);
      try {
        await removeItem(itemId);
      } finally {
        setIsUpdating(null);
      }
    },
    [removeItem]
  );

  // Handle clear cart
  const handleClearCart = useCallback(async () => {
    setIsClearing(true);
    try {
      await clearCart();
    } finally {
      setIsClearing(false);
    }
  }, [clearCart]);

  // Handle retry
  const handleRetry = useCallback(async () => {
    await refetchCart();
  }, [refetchCart]);

  // Calculate cart totals
  const cartTotals = useMemo(() => {
    if (cart) {
      return {
        subtotal: cart.subtotal,
        totalDiscount: cart.totalDiscount,
        total: cart.total,
        itemCount: cart.itemCount,
        isEmpty: cart.isEmpty,
      };
    } else if (guestCart) {
      const subtotal = guestCart.items.reduce(
        (sum, item) => sum + (item.productPrice || 0) * item.quantity,
        0
      );
      return {
        subtotal,
        totalDiscount: 0,
        total: subtotal,
        itemCount: guestCart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        isEmpty: guestCart.items.length === 0,
      };
    }
    return null;
  }, [cart, guestCart]);

  // Check if cart has any validation issues
  const hasValidationIssues = useMemo(() => {
    if (cart) {
      return cart.cartItems?.some(
        (item) =>
          item.isOutOfStock || item.needsQuantityAdjustment || !item.isActive
      );
    }
    // Guest cart items don't have validation issues since they're not checked against inventory
    return false;
  }, [cart]);

  // Loading state
  if (isLoading && !cart && !guestCart) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        </Container>
      </>
    );
  }

  // Error state
  if (error && !cart && !guestCart) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Alert
            severity='error'
            action={
              <Button color='inherit' size='small' onClick={handleRetry}>
                Retry
              </Button>
            }
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button variant='outlined' onClick={handleRetry}>
              Try Again
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  // Empty cart state
  if ((!cart || cart.isEmpty) && (!guestCart || guestCart.items.length === 0)) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Box sx={{ backgroundColor: 'grey.50', py: { xs: 6, md: 8 }, mb: 4 }}>
          <Container maxWidth='lg'>
            <Box sx={{ textAlign: 'center' }}>
              <ShoppingBag
                sx={{
                  fontSize: 64,
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 700, mb: 1 }}
              >
                Your Cart is Empty
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
                Add some items to get started with your order
              </Typography>
              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/unified-search')}
              >
                Browse Products
              </Button>
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header onLoginClick={() => navigate('/login')} />
      {/* Hero Banner Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: { xs: 4, md: 6 }, mb: 4 }}>
        <Container maxWidth='lg'>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ShoppingCart sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant='h4' component='h1' sx={{ fontWeight: 700 }}>
                Shopping Cart
              </Typography>
              {guestCart && (
                <Chip
                  icon={<Person />}
                  label='Guest Cart'
                  color='secondary'
                  size='small'
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Box>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            Review your items and proceed to checkout
          </Typography>
          {guestCart && (
            <Alert severity='info' sx={{ mt: 2 }}>
              You're shopping as a guest.{' '}
              <strong>Sign in to save your cart</strong> and access additional
              features.
            </Alert>
          )}
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Validation Warning */}
        {hasValidationIssues && (
          <Alert severity='warning' icon={<Warning />} sx={{ mb: 3 }}>
            Some items in your cart require attention before checkout
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {/* Clear Cart Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                startIcon={<DeleteSweep />}
                onClick={handleClearCart}
                disabled={isClearing}
                color='error'
                size='small'
              >
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </Button>
            </Box>

            {/* Guest Cart Items */}
            {guestCart &&
              guestStoreGroups.map((storeGroup, index) => (
                <Box key={`guest-${storeGroup.storeId}`} sx={{ mb: 4 }}>
                  {/* Store Header */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'secondary.light',
                      color: 'secondary.contrastText',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StoreIcon sx={{ mr: 1 }} />
                      <Typography
                        variant='h6'
                        component='h2'
                        sx={{ fontWeight: 600 }}
                      >
                        {storeGroup.storeName}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ ml: 'auto', opacity: 0.9 }}
                      >
                        {storeGroup.itemCount} item
                        {storeGroup.itemCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Guest Store Items */}
                  {storeGroup.items.map((item) => (
                    <CartItem
                      key={`guest-${item.itemId}`}
                      item={{
                        cartItemId: item.itemId,
                        cartId: 0,
                        itemId: item.itemId,
                        quantity: item.quantity,
                        addedAt: item.addedAt,
                        itemPrice: item.productPrice || 0,
                        itemName: item.productName || `Item #${item.itemId}`,
                        itemSku: '',
                        itemImageUrl: item.productImageUrl,
                        storeId: item.storeId || 0,
                        originalPrice: item.productPrice || 0,
                        discountAmount: 0,
                        isActive: true,
                        inStock: true,
                        availableQuantity: item.availableQuantity || 0,
                        lineTotal: (item.productPrice || 0) * item.quantity,
                        effectivePrice: item.productPrice || 0,
                        lineTotalWithDiscount:
                          (item.productPrice || 0) * item.quantity,
                        hasDiscount: false,
                        totalSavings: 0,
                        discountPercentage: 0,
                        isQuantityAvailable: true,
                        needsQuantityAdjustment: false,
                        isOutOfStock: false,
                        statusDisplay: 'Available',
                      }}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      disabled={isUpdating === item.itemId}
                      isGuestItem={true}
                    />
                  ))}

                  {/* Store Subtotal */}
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          Store Subtotal
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                          ${storeGroup.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Divider between stores */}
                  {index < guestStoreGroups.length - 1 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                </Box>
              ))}

            {/* Authenticated Cart Items */}
            {cart &&
              storeGroups.map((storeGroup, index) => (
                <Box key={storeGroup.storeId} sx={{ mb: 4 }}>
                  {/* Store Header */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StoreIcon sx={{ mr: 1 }} />
                      <Typography
                        variant='h6'
                        component='h2'
                        sx={{ fontWeight: 600 }}
                      >
                        {storeGroup.storeName}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ ml: 'auto', opacity: 0.9 }}
                      >
                        {storeGroup.itemCount} item
                        {storeGroup.itemCount !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Store Items */}
                  {storeGroup.items.map((item) => (
                    <CartItem
                      key={item.cartItemId}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      disabled={isUpdating === item.itemId}
                    />
                  ))}

                  {/* Store Subtotal */}
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant='body1' sx={{ fontWeight: 600 }}>
                          Store Subtotal
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                          ${storeGroup.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Divider between stores */}
                  {index < storeGroups.length - 1 && <Divider sx={{ my: 4 }} />}
                </Box>
              ))}
          </Grid>

          {/* Cart Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Typography
                variant='h6'
                component='h3'
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                Order Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant='body2' color='text.secondary'>
                    Items ({cartTotals?.itemCount})
                  </Typography>
                  <Typography variant='body2'>
                    ${cartTotals?.subtotal.toFixed(2)}
                  </Typography>
                </Box>

                {cartTotals && cartTotals.totalDiscount > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      Discounts
                    </Typography>
                    <Typography variant='body2' color='success.main'>
                      -${cartTotals.totalDiscount.toFixed(2)}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    ${cartTotals?.total.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {guestCart ? (
                <>
                  <Button
                    variant='outlined'
                    size='large'
                    fullWidth
                    disabled={hasValidationIssues || isLoading}
                    href='/checkout/guest'
                    sx={{ mb: 2 }}
                  >
                    Checkout as Guest
                  </Button>
                  <Button
                    variant='outlined'
                    size='large'
                    fullWidth
                    disabled={hasValidationIssues || isLoading}
                    href='/login?returnUrl=/checkout'
                    sx={{ mb: 2 }}
                  >
                    Sign In to Checkout
                  </Button>
                </>
              ) : (
                <Button
                  variant='outlined'
                  size='large'
                  fullWidth
                  disabled={hasValidationIssues || isLoading}
                  href='/checkout'
                  sx={{ mb: 2 }}
                >
                  {hasValidationIssues && 'Fix Issues to Checkout'}
                  {!hasValidationIssues && 'Proceed to Checkout'}
                </Button>
              )}

              <Button
                variant='outlined'
                size='large'
                fullWidth
                href='/unified-search'
              >
                Continue Shopping
              </Button>

              {/* Loading indicator for cart operations */}
              {(isLoading || isUpdating !== null) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CartPage;
