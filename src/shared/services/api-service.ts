/**
 * Enhanced API Service with Type Safety and Better Error Handling
 * Supports standardized ApiResponse<T> format from backend
 */

import { isApiResponse } from '../types/api-contracts';
import { STORAGE_KEYS } from '../../utils/api';

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5008';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    // Auth token check
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      // Authorization header added
    } else if (!endpoint.includes('/auth/')) {
      console.warn('⚠️ No auth token found for non-auth endpoint');
    }

    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body
        ? typeof options.body === 'string'
          ? JSON.parse(options.body)
          : 'FormData/Other'
        : 'No body',
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      // Check for authentication errors first
      if (response.status === 401) {
        console.error('❌ Authentication failed - clearing token');
        this.clearAuthToken();
        throw new ApiError(
          401,
          'UNAUTHORIZED',
          'Authentication required - please log in again'
        );
      }

      if (response.status === 403) {
        console.error('❌ Forbidden - insufficient permissions');
        throw new ApiError(
          403,
          'FORBIDDEN',
          'You do not have permission to perform this action'
        );
      }

      if (response.status === 404) {
        console.error('❌ Endpoint not found');
        throw new ApiError(
          404,
          'NOT_FOUND',
          'The requested endpoint was not found'
        );
      }

      const data = await this.handleResponse<T>(response);
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw this.handleError(error);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    // Clone the response to avoid "body stream already read" errors
    const responseClone = response.clone();
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!response.ok) {
      console.error('❌ HTTP Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      if (isJson) {
        try {
          const errorData = await response.json();
          console.error('❌ Error response data:', errorData);

          // Handle standardized ApiResponse error format
          if (isApiResponse(errorData)) {
            if (
              !errorData.success &&
              errorData.errors &&
              errorData.errors.length > 0
            ) {
              const firstError = errorData.errors[0];
              const errorMessage =
                firstError.message || errorData.message || 'Request failed';
              console.error('❌ API Error Response:', {
                errors: errorData.errors,
                message: errorData.message,
                status: response.status,
              });
              throw new ApiError(
                response.status,
                firstError.code || 'UNKNOWN_ERROR',
                errorMessage,
                errorData.errors
              );
            } else if (!errorData.success) {
              const errorMessage = errorData.message || 'Request failed';
              console.error('❌ API Error Response:', {
                message: errorData.message,
                status: response.status,
              });
              throw new ApiError(
                response.status,
                'UNKNOWN_ERROR',
                errorMessage
              );
            }
          }

          // Handle legacy error format (backward compatibility)
          if (errorData.error) {
            throw new ApiError(
              response.status,
              errorData.error,
              errorData.message,
              errorData.details
            );
          }

          // Handle any other JSON error format
          throw new ApiError(
            response.status,
            'Request failed',
            JSON.stringify(errorData)
          );
        } catch (jsonError) {
          console.error('❌ Failed to parse error JSON:', jsonError);
          throw new ApiError(
            response.status,
            'Request failed',
            await responseClone.text()
          );
        }
      } else {
        const text = await responseClone.text();
        console.error('❌ Non-JSON error response:', text);
        throw new ApiError(response.status, 'Request failed', text);
      }
    }

    if (isJson) {
      try {
        const data = await response.json();
        // Response data processed

        // Handle standardized ApiResponse<T> format
        if (isApiResponse(data)) {
          if (!data.success) {
            const errorMessage = data.message || 'Request failed';
            throw new ApiError(
              response.status,
              'API_ERROR',
              errorMessage,
              data
            );
          }

          // Return the data from the successful ApiResponse
          return data.data as T;
        }

        // Handle legacy response format (direct data)
        return data as T;
      } catch (jsonError) {
        console.error('❌ Failed to parse response JSON:', jsonError);
        throw new ApiError(
          response.status,
          'JSON_PARSE_ERROR',
          'Failed to parse response data'
        );
      }
    }

    // Handle non-JSON responses
    return (await responseClone.text()) as unknown as T;
  }

  private handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApiError(0, 'Network Error', error.message);
    }

    return new ApiError(0, 'Unknown Error', 'An unexpected error occurred');
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Public API Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // File upload helper
  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file'
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type for FormData, let browser set it
      },
    });
  }

  // FormData upload with progress support
  async upload<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {};

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      const data = await this.handleResponse<T>(response);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Set auth token
  setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  // Clear auth token
  clearAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export class ApiError extends Error {
  public status: number;
  public error: string;
  public details?: unknown;

  constructor(
    status: number,
    error: string,
    message?: string,
    details?: unknown
  ) {
    super(message || error);
    this.name = 'ApiError';
    this.status = status;
    this.error = error;
    this.details = details;
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isForbidden(): boolean {
    return this.status === 403;
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  toJSON() {
    return {
      error: this.error,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const apiService = new ApiService();

// React Query integration helper
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'],
    user: (userId: string) => ['auth', 'user', userId],
  },
  categories: {
    all: ['categories'],
    list: (activeOnly?: boolean) => ['categories', 'list', { activeOnly }],
    byId: (id: number) => ['categories', id],
    bySlug: (slug: string) => ['categories', 'slug', slug],
    withCounts: ['categories', 'with-counts'],
  },
  stores: {
    all: ['stores'],
    byId: (id: number) => ['stores', id],
    categories: (id: number) => ['stores', id, 'categories'],
    openHours: (id: number) => ['stores', id, 'open-hours'],
    paymentMethods: (id: number) => ['stores', id, 'payment-methods'],
  },
  inventory: {
    all: ['inventory'],
    byStore: (storeId: number) => ['inventory', 'store', storeId],
    byId: (id: number) => ['inventory', id],
  },
  orders: {
    all: ['orders'],
    byId: (id: number) => ['orders', id],
    byCustomer: (customerId: number) => ['orders', 'customer', customerId],
    byStore: (storeId: number) => ['orders', 'store', storeId],
  },
  admin: {
    dashboard: ['admin', 'dashboard'],
    storeApplications: {
      all: ['admin', 'store-applications'],
      pending: ['admin', 'store-applications', 'pending'],
      byId: (id: string) => ['admin', 'store-applications', id],
    },
  },
  search: {
    products: (params: unknown) => ['search', 'products', params],
    stores: (params: unknown) => ['search', 'stores', params],
  },
  users: {
    profile: (userId: string) => ['users', 'profile', userId],
    addresses: (userId: string) => ['users', 'addresses', userId],
    referral: (userId: string) => ['users', 'referral', userId],
  },
};

// Hook for API error handling in React components
export const useApiErrorHandler = () => {
  const handleApiError = (error: unknown, fallbackMessage?: string): string => {
    if (error instanceof ApiError) {
      // Handle specific error types
      if (error.isUnauthorized()) {
        // Redirect to login or show auth error
        console.warn('Authentication required');
        apiService.clearAuthToken();
        // You might want to redirect to login here
        return 'Please log in to continue';
      }

      if (error.isForbidden()) {
        return 'You do not have permission to perform this action';
      }

      if (error.isNotFound()) {
        return 'The requested resource was not found';
      }

      if (error.isServerError()) {
        return 'Server error occurred. Please try again later.';
      }

      return (
        error.message ||
        error.error ||
        fallbackMessage ||
        'An unexpected error occurred'
      );
    }

    return fallbackMessage || 'An unexpected error occurred';
  };

  return { handleApiError };
};

export default apiService;
