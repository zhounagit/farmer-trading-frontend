import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { STORAGE_KEYS } from '../../utils/api';

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  code: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// API Client Configuration
const API_CONFIG = {
  baseURL: 'https://localhost:7008',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token and normalize URLs
    this.client.interceptors.request.use(
      (config) => {
        // Ensure headers object exists
        if (!config.headers) {
          config.headers = new axios.AxiosHeaders();
        }

        // For FormData requests, don't set Content-Type header
        // Let axios auto-detect and set proper multipart boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }

        // Normalize URL (remove double slashes, ensure leading slash)
        if (config.url && !config.url.startsWith('/')) {
          config.url = '/' + config.url;
        }

        // Add authentication token
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;

          // Validate token expiry
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
              throw new Error('Token expired');
            }
          } catch (e) {
            if (e instanceof Error && e.message === 'Token expired') {
              throw e;
            }
            // Invalid token format - remove it
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.createApiError(error));
      }
    );

    // Response interceptor - handle token refresh and errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            try {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } =
                response.data;

              // Update stored tokens
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
              if (newRefreshToken) {
                localStorage.setItem(
                  STORAGE_KEYS.REFRESH_TOKEN,
                  newRefreshToken
                );
              }

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.client.request(originalRequest);
            } catch {
              // Refresh failed - clear tokens
              localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
              localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

              // Redirect to login or emit auth failure event
              window.dispatchEvent(
                new CustomEvent('auth:logout', {
                  detail: { reason: 'token_refresh_failed' },
                })
              );
            }
          }
        }

        return Promise.reject(this.createApiError(error));
      }
    );
  }

  private createApiError(error: unknown): ApiError {
    // Handle axios error type
    if (axios.isAxiosError(error)) {
      // Network errors
      if (!error.response) {
        return {
          message: 'Network error. Please check your internet connection.',
          code: 'NETWORK_ERROR',
          details: { originalError: error.message },
        };
      }

      // HTTP errors
      const response = error.response;
      const data = response?.data;

      return {
        message:
          data?.message ||
          data?.error?.message ||
          error.message ||
          'An unexpected error occurred',
        code: data?.code || data?.error?.code || `HTTP_${response.status}`,
        status: response.status,
        details: data?.details || data?.error?.details,
      };
    }

    // Handle non-axios errors
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      message: errorMessage,
      code: 'UNKNOWN_ERROR',
      details: { originalError: String(error) },
    };
  }

  // Core HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw this.createApiError({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response.data.data as T;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw this.createApiError({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response.data.data as T;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);

    // Handle HTTP 204 No Content - successful response with no body
    if (response.status === 204) {
      return {} as T;
    }

    // Handle HTTP 200 OK with JSON response body
    if (response.status === 200) {
      if (response.data?.success === false) {
        throw this.createApiError({
          response: {
            status: 400,
            data: response.data,
          },
        });
      }
      // Return the data if present, otherwise return empty object
      const result = response.data?.data || response.data;
      return result as T;
    }

    // Handle other status codes
    throw this.createApiError({
      response: {
        status: response.status,
        data: response.data,
      },
    });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);

    // Handle 204 No Content as successful
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 200 OK as successful
    if (response.status === 200) {
      if (response.data?.success === false) {
        throw this.createApiError({
          response: {
            status: 400,
            data: response.data,
          },
        });
      }
      return (response.data?.data || response.data) as T;
    }

    // Handle other responses
    if (!response.data?.success) {
      throw this.createApiError({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response.data.data as T;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);

    // Handle 204 No Content as successful
    if (response.status === 204) {
      return {} as T;
    }

    // Handle 200 OK as successful
    if (response.status === 200) {
      if (response.data?.success === false) {
        throw this.createApiError({
          response: {
            status: 400,
            data: response.data,
          },
        });
      }
      return (response.data?.data || response.data) as T;
    }

    // Handle other responses
    if (!response.data || !response.data.success) {
      throw this.createApiError({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response.data.data as T;
  }

  // File upload method
  async upload<T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const uploadConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        // Don't set Content-Type header for FormData
        // Axios automatically detects FormData and sets the correct header with boundary
        'Content-Type': undefined,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(
      url,
      formData,
      uploadConfig
    );
    if (!response.data.success) {
      throw this.createApiError({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response.data.data as T;
  }

  // Health check
  async healthCheck(): Promise<{
    isHealthy: boolean;
    status?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      const response = await this.client.get('/health', { timeout: 5000 });
      return {
        isHealthy: true,
        status: response.data,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Health check failed';
      return {
        isHealthy: false,
        error: errorMessage,
      };
    }
  }

  // Get the underlying axios instance if needed for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  // Public endpoint check (no auth required)
  isPublicEndpoint(url: string): boolean {
    const publicPatterns = [
      '/auth/',
      '/health',
      '/browse',
      '/search',
      '/store/',
      '/product/',
      '/storefront/',
    ];

    return publicPatterns.some((pattern) => url.includes(pattern));
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in feature services
export type { AxiosRequestConfig, AxiosResponse };
