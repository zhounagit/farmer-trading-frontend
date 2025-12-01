/**
 * Cart Validation Hook
 *
 * Provides cart validation functionality for checkout preparation.
 * Ensures cart is ready for checkout with proper error handling.
 */

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CartService } from '../features/cart/services/userCartService';
import type { UseCartValidationReturn } from '../types/cart';
import toast from 'react-hot-toast';

/**
 * Custom hook to manage cart validation for checkout
 */
export const useCartValidation = (): UseCartValidationReturn => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const isFetchingRef = useRef(false);

  const validate = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated || !user?.userId) {
      const errorMessage = 'Please log in to validate cart';
      setError(errorMessage);
      setIsValid(false);
      return false;
    }

    // Prevent duplicate validation calls
    if (isFetchingRef.current) {
      return isValid;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const validationResult = await CartService.validateCart(
        parseInt(user.userId)
      );

      setIsValid(validationResult);

      if (!validationResult) {
        toast.error('Cart validation failed. Please check your cart items.');
      }

      return validationResult;
    } catch (validationError) {
      const errorMessage =
        validationError instanceof Error
          ? validationError.message
          : 'Failed to validate cart';

      setError(errorMessage);
      setIsValid(false);

      toast.error('Cart validation error. Please try again.');

      return false;
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.userId, isValid]);

  return {
    isValid,
    isLoading,
    error,
    validate,
  };
};
