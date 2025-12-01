/**
 * Cart Management Hook
 *
 * Provides cart state management with React Query integration.
 * Supports both authenticated user carts and guest carts for non-authenticated users.
 * Follows existing patterns from useUserStore hook.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { CartService } from '../features/cart/services/userCartService';
import { GuestCartService } from '../features/cart/services/guestCartStorageService';
import type {
  Cart,
  UseCartReturn,
  CartOperationResult,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types/cart';
import type { GuestCart, GuestCartItem } from '../types/guest-cart';
import toast from 'react-hot-toast';

// React Query keys
const CART_QUERY_KEY = 'cart';
const CART_COUNT_QUERY_KEY = 'cart-count';

/**
 * Custom hook to manage user cart data and operations
 */
export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestCart, setGuestCart] = useState<GuestCart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const hasInitializedRef = useRef(false);

  // React Query for authenticated cart data
  const {
    data: cartData,
    isLoading: isQueryLoading,
    error: queryError,
    refetch: refetchCartQuery,
  } = useQuery({
    queryKey: [CART_QUERY_KEY, user?.userId],
    queryFn: () => {
      if (!user?.userId) {
        throw new Error('User ID not available');
      }
      return CartService.getCart(parseInt(user.userId));
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: 1000 * 60, // 1 minute
    retry: 2,
  });

  // Guest cart management (no React Query needed for localStorage)
  const loadGuestCart = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const guestCartItems = await GuestCartService.getItems();
        const guestCart: GuestCart = {
          sessionId: GuestCartService.getGuestSessionId(),
          items: guestCartItems,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setGuestCart(guestCart);
        setError(null);
      } catch (error) {
        console.error('Error loading guest cart:', error);
        // Fallback to localStorage-only cart
        const guestCart = GuestCartService.getCart();
        setGuestCart(guestCart);
        setError(null);
      }
    }
  }, [isAuthenticated]);

  // Load guest cart on mount and when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestCart();
    }
  }, [isAuthenticated, loadGuestCart]);

  // React Query for authenticated cart count
  const { data: authenticatedItemCount = 0, refetch: refetchCount } = useQuery({
    queryKey: [CART_COUNT_QUERY_KEY, user?.userId],
    queryFn: () => {
      if (!user?.userId) {
        return 0;
      }
      return CartService.getItemCount(parseInt(user.userId));
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Calculate total item count (authenticated + guest)
  const itemCount = useMemo(() => {
    if (isAuthenticated) {
      return authenticatedItemCount;
    } else {
      // For guest users, we'll use the localStorage count as fallback
      // The async count will be handled by the guestCart state updates
      const guestCart = GuestCartService.getCart();
      return guestCart.items.reduce(
        (total: number, item: GuestCartItem) => total + item.quantity,
        0
      );
    }
  }, [isAuthenticated, authenticatedItemCount]);

  // Update local state when query data changes
  useEffect(() => {
    if (cartData) {
      setCart(cartData);
      setGuestCart(null); // Clear guest cart when authenticated cart loads
      setError(null);
    }
  }, [cartData]);

  // Clear guest cart when user authenticates
  useEffect(() => {
    if (isAuthenticated && guestCart) {
      setGuestCart(null);
    }
  }, [isAuthenticated, guestCart]);

  // Update error state when query error changes
  useEffect(() => {
    if (queryError) {
      const errorMessage =
        queryError instanceof Error
          ? queryError.message
          : 'Failed to load cart';
      setError(errorMessage);
    }
  }, [queryError]);

  // Combine loading states
  useEffect(() => {
    setIsLoading(isQueryLoading);
  }, [isQueryLoading]);

  // Add item mutation for authenticated users
  const addItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (!user?.userId) {
        throw new Error('User ID not available');
      }
      const request: AddToCartRequest = { itemId, quantity };
      return CartService.addItem(parseInt(user.userId), request);
    },
    onSuccess: (newItem) => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });

      toast.success(`Added ${newItem.itemName} to cart`);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to add item to cart';
      toast.error(errorMessage);
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: number;
      quantity: number;
    }) => {
      if (!user?.userId) {
        throw new Error('User ID not available');
      }
      const request: UpdateCartItemRequest = { quantity };
      return CartService.updateItem(parseInt(user.userId), itemId, request);
    },
    onSuccess: (updatedItem) => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });

      if (updatedItem.quantity === 0) {
        toast.success(`Removed ${updatedItem.itemName} from cart`);
      } else {
        toast.success(`Updated ${updatedItem.itemName} quantity`);
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to update cart item';
      toast.error(errorMessage);
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!user?.userId) {
        throw new Error('User ID not available');
      }
      return CartService.removeItem(parseInt(user.userId), itemId);
    },
    onSuccess: (_, itemId) => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });

      // Find item name for toast message
      const removedItem = cart?.cartItems.find(
        (item) => item.itemId === itemId
      );
      if (removedItem) {
        toast.success(`Removed ${removedItem.itemName} from cart`);
      } else {
        toast.success('Item removed from cart');
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to remove item from cart';
      toast.error(errorMessage);
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!user?.userId) {
        throw new Error('User ID not available');
      }
      return CartService.clearCart(parseInt(user.userId));
    },
    onSuccess: () => {
      // Invalidate and refetch cart data
      queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CART_COUNT_QUERY_KEY] });

      toast.success('Cart cleared');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to clear cart';
      toast.error(errorMessage);
    },
  });

  // Cart operations
  const addItem = useCallback(
    async (
      itemId: number,
      quantity: number,
      productInfo?: {
        name?: string;
        price?: number;
        imageUrl?: string;
        storeId?: number;
        storeName?: string;
        availableQuantity?: number;
      }
    ): Promise<CartOperationResult> => {
      try {
        if (isAuthenticated && user?.userId) {
          // Use authenticated cart
          await addItemMutation.mutateAsync({ itemId, quantity });
          return { success: true };
        } else {
          // Use guest cart
          const result = await GuestCartService.addItem(
            itemId,
            quantity,
            productInfo
          );

          if (result.success) {
            // Update local guest cart state
            await loadGuestCart();
            toast.success('Item added to cart');
            return { success: true };
          } else {
            return {
              success: false,
              error: result.error || 'Failed to add item to cart',
            };
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add item to cart';
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isAuthenticated, user?.userId, addItemMutation, loadGuestCart]
  );

  const updateItem = useCallback(
    async (itemId: number, quantity: number): Promise<CartOperationResult> => {
      try {
        if (isAuthenticated && user?.userId) {
          // Use authenticated cart
          await updateItemMutation.mutateAsync({ itemId, quantity });
          return { success: true };
        } else {
          // Use guest cart
          const result = await GuestCartService.updateItemQuantity(
            itemId,
            quantity
          );

          if (result.success) {
            // Update local guest cart state
            await loadGuestCart();
            return { success: true };
          } else {
            return {
              success: false,
              error: result.error || 'Failed to update cart item',
            };
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update cart item';
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isAuthenticated, user?.userId, updateItemMutation, loadGuestCart]
  );

  const removeItem = useCallback(
    async (itemId: number): Promise<CartOperationResult> => {
      try {
        if (isAuthenticated && user?.userId) {
          // Use authenticated cart
          await removeItemMutation.mutateAsync(itemId);
          return { success: true };
        } else {
          // Use guest cart
          const result = await GuestCartService.removeItem(itemId);

          if (result.success) {
            // Update local guest cart state
            await loadGuestCart();
            return { success: true };
          } else {
            return {
              success: false,
              error: result.error || 'Failed to remove item from cart',
            };
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to remove item from cart';
        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [isAuthenticated, user?.userId, removeItemMutation, loadGuestCart]
  );

  const clearCart = useCallback(async (): Promise<CartOperationResult> => {
    try {
      if (isAuthenticated && user?.userId) {
        // Use authenticated cart
        await clearCartMutation.mutateAsync();
        return { success: true };
      } else {
        // Use guest cart
        const result = await GuestCartService.clearCart();

        if (result.success) {
          // Update local guest cart state
          await loadGuestCart();
          return { success: true };
        } else {
          return {
            success: false,
            error: result.error || 'Failed to clear cart',
          };
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to clear cart';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [isAuthenticated, user?.userId, clearCartMutation, loadGuestCart]);

  const refetchCart = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      await refetchCartQuery();
      await refetchCount();
    } else {
      // For guest cart, just reload from localStorage
      await loadGuestCart();
    }
  }, [isAuthenticated, refetchCartQuery, refetchCount, loadGuestCart]);

  const validateCart = useCallback(async (): Promise<boolean> => {
    try {
      if (isAuthenticated && user?.userId) {
        return await CartService.validateCart(parseInt(user.userId));
      } else {
        // For guest cart, basic validation - just check if cart is not empty
        const guestCart = GuestCartService.getCart();
        const itemCount = guestCart.items.reduce(
          (total: number, item: GuestCartItem) => total + item.quantity,
          0
        );
        return itemCount > 0;
      }
    } catch (error) {
      console.error('Cart validation error:', error);
      return false;
    }
  }, [isAuthenticated, user?.userId]);

  // Auto-initialize when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user?.userId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
    } else if (!isAuthenticated) {
      // Reset authenticated cart state when user logs out, load guest cart
      setCart(null);
      setError(null);
      loadGuestCart();
      hasInitializedRef.current = false;
    }
  }, [isAuthenticated, user?.userId, loadGuestCart]);

  return {
    cart: isAuthenticated ? cart : null,
    guestCart: !isAuthenticated ? guestCart : null,
    isLoading,
    error,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refetchCart,
    validateCart,
    itemCount,
  };
};
