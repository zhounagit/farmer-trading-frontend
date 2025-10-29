/**
 * Centralized Error Handler for Stores Feature
 * Follows established patterns from Auth and Referral features
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../contexts/AuthContext';
import type { ApiError } from '../services/open-shop.types';

export interface StoreError {
  code?: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface StoreErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuthError?: boolean;
  fallbackMessage?: string;
}

export const useStoreErrorHandler = () => {
  const navigate = useNavigate();
  const { handleAuthenticationError } = useAuth();

  /**
   * Handle API errors specific to store operations
   */
  const handleStoreApiError = useCallback((
    error: unknown,
    options: StoreErrorHandlerOptions = {}
  ): StoreError => {
    const {
      showToast = true,
      redirectOnAuthError = true,
      fallbackMessage = 'An error occurred while processing your request.'
    } = options;

    console.error('Store API Error:', error);

    // Handle authentication errors
    if (isAuthenticationError(error)) {
      if (redirectOnAuthError) {
        const authError = new Error('Authentication required');
        (authError as any).response = { status: 401 };
        handleAuthenticationError(authError, navigate);
      }

      const authError: StoreError = {
        code: 'UNAUTHORIZED',
        message: 'Please log in to continue.'
      };

      if (showToast) {
        toast.error(authError.message);
      }

      return authError;
    }

    // Handle network errors
    if (isNetworkError(error)) {
      const networkError: StoreError = {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your connection and try again.'
      };

      if (showToast) {
        toast.error(networkError.message);
      }

      return networkError;
    }

    // Handle API response errors
    if (isApiErrorResponse(error)) {
      const apiError = extractApiError(error);

      if (showToast) {
        toast.error(apiError.message);
      }

      return apiError;
    }

    // Handle generic errors
    const genericError: StoreError = {
      code: 'UNKNOWN_ERROR',
      message: fallbackMessage
    };

    if (showToast) {
      toast.error(genericError.message);
    }

    return genericError;
  }, [navigate, handleAuthenticationError]);

  /**
   * Handle form validation errors
   */
  const handleValidationError = useCallback((
    errors: Record<string, string>,
    options: { showToast?: boolean } = {}
  ) => {
    const { showToast = true } = options;

    const errorMessages = Object.values(errors);

    if (errorMessages.length > 0 && showToast) {
      const primaryError = errorMessages[0];
      toast.error(primaryError);
    }

    return {
      hasErrors: errorMessages.length > 0,
      errors: errorMessages
    };
  }, []);

  /**
   * Handle store creation specific errors
   */
  const handleStoreCreationError = useCallback((
    error: unknown,
    step?: string
  ): StoreError => {
    const storeError = handleStoreApiError(error, {
      showToast: true,
      fallbackMessage: `Failed to ${step ? `save ${step}` : 'create store'}. Please try again.`
    });

    // Map specific store creation error codes to user-friendly messages
    if (storeError.code === 'STORE_NAME_EXISTS') {
      storeError.message = 'A store with this name already exists. Please choose a different name.';
    } else if (storeError.code === 'INVALID_STORE_TYPE') {
      storeError.message = 'Invalid store type selected. Please choose a valid store type.';
    } else if (storeError.code === 'CATEGORY_REQUIRED') {
      storeError.message = 'Please select at least one product category.';
    }

    return storeError;
  }, [handleStoreApiError]);

  /**
   * Handle store update specific errors
   */
  const handleStoreUpdateError = useCallback((
    error: unknown,
    operation: string = 'update'
  ): StoreError => {
    const storeError = handleStoreApiError(error, {
      showToast: true,
      fallbackMessage: `Failed to ${operation} store. Please try again.`
    });

    // Map specific store update error codes
    if (storeError.code === 'STORE_NOT_FOUND') {
      storeError.message = 'Store not found. It may have been deleted or you may not have permission to access it.';
    } else if (storeError.code === 'PERMISSION_DENIED') {
      storeError.message = 'You do not have permission to modify this store.';
    }

    return storeError;
  }, [handleStoreApiError]);

  /**
   * Handle store media upload errors
   */
  const handleMediaUploadError = useCallback((
    error: unknown,
    fileType: string = 'file'
  ): StoreError => {
    const storeError = handleStoreApiError(error, {
      showToast: true,
      fallbackMessage: `Failed to upload ${fileType}. Please try again.`
    });

    // Map specific media upload error codes
    if (storeError.code === 'FILE_TOO_LARGE') {
      storeError.message = 'File size is too large. Please choose a smaller file.';
    } else if (storeError.code === 'INVALID_FILE_TYPE') {
      storeError.message = 'Invalid file type. Please upload a supported image format.';
    }

    return storeError;
  }, [handleStoreApiError]);

  return {
    handleStoreApiError,
    handleValidationError,
    handleStoreCreationError,
    handleStoreUpdateError,
    handleMediaUploadError
  };
};

// Helper functions for error type detection
function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('401') ||
           error.message.includes('unauthorized') ||
           error.message.includes('authentication');
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return err.response?.status === 401 ||
           err.status === 401 ||
           err.code === 'UNAUTHORIZED';
  }

  return false;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Network Error') ||
           error.message.includes('network') ||
           error.message.includes('offline');
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return err.code === 'NETWORK_ERROR' ||
           err.message?.includes('network');
  }

  return false;
}

function isApiErrorResponse(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    return err.response?.data?.errors !== undefined ||
           err.errors !== undefined ||
           err.code !== undefined;
  }

  return false;
}

function extractApiError(error: unknown): StoreError {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Handle wrapped API response errors
    if (err.response?.data?.errors?.[0]) {
      const apiError = err.response.data.errors[0];
      return {
        code: apiError.code,
        message: apiError.message,
        field: apiError.field,
        details: apiError.details
      };
    }

    // Handle direct API errors
    if (err.errors?.[0]) {
      const apiError = err.errors[0];
      return {
        code: apiError.code,
        message: apiError.message,
        field: apiError.field,
        details: apiError.details
      };
    }

    // Handle error objects with code and message
    if (err.code && err.message) {
      return {
        code: err.code,
        message: err.message,
        field: err.field,
        details: err.details
      };
    }

    // Handle error objects with just message
    if (err.message) {
      return {
        code: err.code || 'API_ERROR',
        message: err.message
      };
    }
  }

  // Fallback for unknown error format
  return {
    code: 'UNKNOWN_API_ERROR',
    message: 'An unexpected error occurred.'
  };
}
