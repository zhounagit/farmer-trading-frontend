/**
 * Cart Fulfillment Hook
 *
 * Hook to analyze fulfillment options for stores in a shopping cart.
 * Provides functionality to determine available pickup/delivery options
 * based on store configurations.
 */

import { useState, useCallback, useEffect } from 'react';
import { useCart } from './useCart';
import StoreFulfillmentService, {
  type CartFulfillmentAnalysis,
} from '../features/cart/services/storeFulfillmentService';

export interface UseCartFulfillmentReturn {
  // Analysis state
  analysis: CartFulfillmentAnalysis | null;
  isLoading: boolean;
  error: string | null;

  // Available options
  availableFulfillmentMethods: string[];
  recommendedFulfillmentMethod: string | null;

  // Validation
  validateFulfillmentMethod: (method: string) => {
    isValid: boolean;
    invalidStoreIds: number[];
  };

  // Actions
  refreshAnalysis: () => Promise<void>;

  // Helper flags
  canChooseFulfillment: boolean;
  requiresSeparateCheckout: boolean;
  showDeliveryAddress: (selectedMethod?: string) => boolean;
  showPickupOptions: (selectedMethod?: string) => boolean;
}

/**
 * Hook to analyze cart fulfillment options
 */
export const useCartFulfillment = (): UseCartFulfillmentReturn => {
  const { cart, guestCart, isLoading: cartLoading } = useCart();
  const [analysis, setAnalysis] = useState<CartFulfillmentAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get cart items from either authenticated or guest cart
  const getCartItems = useCallback(() => {
    if (cart?.cartItems?.length) {
      return cart.cartItems;
    }
    if (guestCart?.items?.length) {
      return guestCart.items;
    }
    return [];
  }, [cart, guestCart]);

  // Analyze cart fulfillment options
  const analyzeCart = useCallback(async () => {
    const cartItems = getCartItems();

    if (cartItems.length === 0) {
      setAnalysis(StoreFulfillmentService.createEmptyAnalysis());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result =
        await StoreFulfillmentService.analyzeCartFulfillment(cartItems);
      setAnalysis(result);
    } catch (err) {
      console.error('Failed to analyze cart fulfillment:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load fulfillment options'
      );
      // Set empty analysis on error to prevent UI breakage
      setAnalysis(StoreFulfillmentService.createEmptyAnalysis());
    } finally {
      setIsLoading(false);
    }
  }, [getCartItems]);

  // Initial analysis and refresh when cart changes
  useEffect(() => {
    analyzeCart();
  }, [analyzeCart]);

  // Available fulfillment methods (common across all stores)
  const availableFulfillmentMethods = analysis?.commonFulfillmentMethods || [];

  // Recommended fulfillment method
  const recommendedFulfillmentMethod = analysis
    ? StoreFulfillmentService.getRecommendedFulfillmentMethod(analysis)
    : null;

  // Validate a fulfillment method
  const validateFulfillmentMethod = useCallback(
    (method: string) => {
      if (!analysis) {
        return { isValid: false, invalidStoreIds: [] };
      }
      return StoreFulfillmentService.validateFulfillmentMethod(
        analysis,
        method
      );
    },
    [analysis]
  );

  // Helper: Can user choose fulfillment method?
  const canChooseFulfillment = availableFulfillmentMethods.length > 1;

  // Helper: Show delivery address fields?
  const showDeliveryAddress = useCallback(
    (selectedMethod?: string) => {
      if (!analysis) return true; // Default to showing for backward compatibility

      // If method is specified, check if it's delivery
      if (selectedMethod) {
        return selectedMethod === 'delivery';
      }

      // If no method selected, show if delivery is available
      return analysis.anyStoreSupportsDelivery;
    },
    [analysis]
  );

  // Helper: Show pickup options?
  const showPickupOptions = useCallback(
    (selectedMethod?: string) => {
      if (!analysis) return false;

      // If method is specified, check if it's pickup
      if (selectedMethod) {
        return selectedMethod === 'pickup';
      }

      // If no method selected, show if pickup is available
      return analysis.anyStoreSupportsPickup;
    },
    [analysis]
  );

  return {
    // Analysis state
    analysis,
    isLoading: isLoading || cartLoading,
    error,

    // Available options
    availableFulfillmentMethods,
    recommendedFulfillmentMethod,

    // Validation
    validateFulfillmentMethod,

    // Actions
    refreshAnalysis: analyzeCart,

    // Helper flags
    canChooseFulfillment,
    requiresSeparateCheckout: analysis?.requiresSeparateCheckout || false,
    showDeliveryAddress,
    showPickupOptions,
  };
};

export default useCartFulfillment;
