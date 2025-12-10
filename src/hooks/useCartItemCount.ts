/**
 * Cart Item Count Hook
 *
 * Provides cart item count for header badge display.
 * Optimized for frequent updates and minimal data fetching.
 * Supports both authenticated user carts and guest carts.
 */

import type { GuestCartItem } from '../types/guest-cart';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { CartService } from '../features/cart/services/userCartService';
import { GuestCartService } from '../features/cart/services/guestCartStorageService';
import type { UseCartItemCountReturn } from '../types/cart';

// React Query key
const CART_COUNT_QUERY_KEY = 'cart-count';

// Cache time constants
const CART_COUNT_STALE_TIME = 1000 * 60 * 2; // 2 minutes - balance between freshness and performance
const CART_COUNT_CACHE_TIME = 1000 * 60 * 10; // 10 minutes
const CART_COUNT_REFETCH_INTERVAL = 1000 * 60 * 3; // 3 minutes - less frequent than before

/**
 * Custom hook to manage cart item count for header badge
 */
export const useCartItemCount = (): UseCartItemCountReturn => {
  const [itemCount, setItemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const hasInitializedRef = useRef(false);

  // Load guest cart count for non-authenticated users
  const loadGuestCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      try {
        const guestCount = await GuestCartService.getItemCount();
        setItemCount(guestCount);
        setError(null);
      } catch (error) {
        console.error('Error loading guest cart count:', error);
        // Fallback to localStorage-only count
        const guestCart = GuestCartService.getCart();
        const guestCount = guestCart.items.reduce(
          (total: number, item: GuestCartItem) => total + item.quantity,
          0
        );
        setItemCount(guestCount);
        setError(null);
      }
    }
  }, [isAuthenticated]);

  // Listen for localStorage changes to update cart count in real-time
  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === GuestCartService['STORAGE_KEY']) {
        // Cart data changed, update count
        await loadGuestCartCount();
      }
    };

    // Listen for custom cart update events within same tab
    const handleCartUpdate = async () => {
      await loadGuestCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [loadGuestCartCount]);

  // React Query for cart count with optimized settings
  const {
    data: countData = 0,
    isLoading: isQueryLoading,
    error: queryError,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: [CART_COUNT_QUERY_KEY, user?.userId],
    queryFn: () => {
      if (!user?.userId) {
        return 0;
      }
      return CartService.getItemCount(parseInt(user.userId));
    },
    enabled: isAuthenticated && !!user?.userId,
    staleTime: CART_COUNT_STALE_TIME,
    gcTime: CART_COUNT_CACHE_TIME,
    refetchInterval: CART_COUNT_REFETCH_INTERVAL, // Auto-refresh every 3 minutes
    retry: 1, // Minimal retries for performance
  });

  // Update local state when query data changes
  useEffect(() => {
    if (countData !== undefined) {
      setItemCount(countData);
      setError(null);
    }
  }, [countData]);

  // Load guest cart count on mount and when authentication changes
  useEffect(() => {
    if (!isAuthenticated) {
      loadGuestCartCount();
    }
  }, [isAuthenticated, loadGuestCartCount]);

  // Update error state when query error changes
  useEffect(() => {
    if (queryError) {
      const errorMessage =
        queryError instanceof Error
          ? queryError.message
          : 'Failed to load cart count';
      setError(errorMessage);
    }
  }, [queryError]);

  // Combine loading states
  useEffect(() => {
    setIsLoading(isQueryLoading);
  }, [isQueryLoading]);

  const refetch = useCallback(async (): Promise<void> => {
    await refetchQuery();
  }, [refetchQuery]);

  // Auto-initialize when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user?.userId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
    } else if (!isAuthenticated) {
      // Load guest cart when user logs out
      loadGuestCartCount();
      hasInitializedRef.current = false;
    }
  }, [isAuthenticated, user?.userId, loadGuestCartCount]);

  return {
    itemCount,
    isLoading,
    error,
    refetch,
  };
};
