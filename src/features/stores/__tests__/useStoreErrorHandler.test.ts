import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStoreErrorHandler } from '../hooks/useStoreErrorHandler';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Mock dependencies
vi.mock('../../../contexts/AuthContext');
vi.mock('react-hot-toast');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('useStoreErrorHandler', () => {
  const mockHandleAuthenticationError = vi.fn();
  const mockToastError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      handleAuthenticationError: mockHandleAuthenticationError,
    });
    (toast.error as any).mockImplementation(mockToastError);
  });

  describe('handleStoreApiError', () => {
    it('should handle authentication errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const authError = new Error('401 Unauthorized');

      const storeError = result.current.handleStoreApiError(authError);

      expect(storeError.code).toBe('UNAUTHORIZED');
      expect(storeError.message).toBe('Please log in to continue.');
      expect(mockHandleAuthenticationError).toHaveBeenCalled();
      expect(mockToastError).toHaveBeenCalledWith('Please log in to continue.');
    });

    it('should handle network errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const networkError = new Error('Network Error');

      const storeError = result.current.handleStoreApiError(networkError);

      expect(storeError.code).toBe('NETWORK_ERROR');
      expect(storeError.message).toContain('Network connection failed');
      expect(mockToastError).toHaveBeenCalledWith(storeError.message);
    });

    it('should handle API response errors with wrapped response', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const apiError = {
        response: {
          data: {
            errors: [
              {
                code: 'VALIDATION_ERROR',
                message: 'Invalid store name',
                field: 'storeName',
              },
            ],
          },
        },
      };

      const storeError = result.current.handleStoreApiError(apiError);

      expect(storeError.code).toBe('VALIDATION_ERROR');
      expect(storeError.message).toBe('Invalid store name');
      expect(storeError.field).toBe('storeName');
      expect(mockToastError).toHaveBeenCalledWith('Invalid store name');
    });

    it('should handle generic errors with fallback message', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const genericError = new Error('Something went wrong');

      const storeError = result.current.handleStoreApiError(genericError);

      expect(storeError.code).toBe('UNKNOWN_ERROR');
      expect(storeError.message).toBe('An error occurred while processing your request.');
      expect(mockToastError).toHaveBeenCalledWith(storeError.message);
    });

    it('should not show toast when showToast is false', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const error = new Error('Test error');

      result.current.handleStoreApiError(error, { showToast: false });

      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors and show toast', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const validationErrors = {
        storeName: 'Store name is required',
        description: 'Description is too short',
      };

      const resultObj = result.current.handleValidationError(validationErrors);

      expect(resultObj.hasErrors).toBe(true);
      expect(resultObj.errors).toHaveLength(2);
      expect(resultObj.errors).toContain('Store name is required');
      expect(mockToastError).toHaveBeenCalledWith('Store name is required');
    });

    it('should not show toast when showToast is false', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const validationErrors = {
        storeName: 'Store name is required',
      };

      result.current.handleValidationError(validationErrors, { showToast: false });

      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('should handle empty validation errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const validationErrors = {};

      const resultObj = result.current.handleValidationError(validationErrors);

      expect(resultObj.hasErrors).toBe(false);
      expect(resultObj.errors).toHaveLength(0);
      expect(mockToastError).not.toHaveBeenCalled();
    });
  });

  describe('handleStoreCreationError', () => {
    it('should handle store creation specific errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const storeNameError = {
        code: 'STORE_NAME_EXISTS',
        message: 'Store name already exists',
      };

      const storeError = result.current.handleStoreCreationError(storeNameError, 'basics');

      expect(storeError.code).toBe('STORE_NAME_EXISTS');
      expect(storeError.message).toBe('A store with this name already exists. Please choose a different name.');
      expect(mockToastError).toHaveBeenCalledWith(storeError.message);
    });

    it('should handle invalid store type errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const storeTypeError = {
        code: 'INVALID_STORE_TYPE',
        message: 'Invalid store type',
      };

      const storeError = result.current.handleStoreCreationError(storeTypeError);

      expect(storeError.code).toBe('INVALID_STORE_TYPE');
      expect(storeError.message).toBe('Invalid store type selected. Please choose a valid store type.');
    });

    it('should handle category required errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const categoryError = {
        code: 'CATEGORY_REQUIRED',
        message: 'Category required',
      };

      const storeError = result.current.handleStoreCreationError(categoryError);

      expect(storeError.code).toBe('CATEGORY_REQUIRED');
      expect(storeError.message).toBe('Please select at least one product category.');
    });
  });

  describe('handleStoreUpdateError', () => {
    it('should handle store not found errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const notFoundError = {
        code: 'STORE_NOT_FOUND',
        message: 'Store not found',
      };

      const storeError = result.current.handleStoreUpdateError(notFoundError, 'update');

      expect(storeError.code).toBe('STORE_NOT_FOUND');
      expect(storeError.message).toContain('Store not found');
      expect(storeError.message).toContain('deleted');
    });

    it('should handle permission denied errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const permissionError = {
        code: 'PERMISSION_DENIED',
        message: 'Permission denied',
      };

      const storeError = result.current.handleStoreUpdateError(permissionError);

      expect(storeError.code).toBe('PERMISSION_DENIED');
      expect(storeError.message).toContain('do not have permission');
    });
  });

  describe('handleMediaUploadError', () => {
    it('should handle file too large errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const fileSizeError = {
        code: 'FILE_TOO_LARGE',
        message: 'File too large',
      };

      const storeError = result.current.handleMediaUploadError(fileSizeError, 'logo');

      expect(storeError.code).toBe('FILE_TOO_LARGE');
      expect(storeError.message).toContain('File size is too large');
    });

    it('should handle invalid file type errors', () => {
      const { result } = renderHook(() => useStoreErrorHandler());
      const fileTypeError = {
        code: 'INVALID_FILE_TYPE',
        message: 'Invalid file type',
      };

      const storeError = result.current.handleMediaUploadError(fileTypeError, 'banner');

      expect(storeError.code).toBe('INVALID_FILE_TYPE');
      expect(storeError.message).toContain('Invalid file type');
    });
  });
});
