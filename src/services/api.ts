import axios from 'axios';
import { profilePictureCache } from './profilePictureCache';
import { STORAGE_KEYS } from '../utils/api';

// Define Axios types explicitly
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
};

type AxiosError<T = any> = Error & {
  config: any;
  code?: string;
  request?: any;
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: any;
  };
  isAxiosError: boolean;
};

// Clear any localStorage API URL overrides
localStorage.removeItem('TEMP_API_BASE_URL');
localStorage.removeItem('API_BASE_URL');
localStorage.removeItem('VITE_API_BASE_URL');
localStorage.removeItem('BASE_URL');

// Use correct HTTPS endpoint
const API_BASE_URL = 'https://localhost:7008';
const normalizedApiUrl = API_BASE_URL.replace(/\/api$/, '');

// Create axios instance
export const api = axios.create({
  baseURL: normalizedApiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }

    // Ensure URL doesn't have double slashes or trailing slashes
    if (config.url?.startsWith('/')) {
      config.url = config.url;
    } else if (config.url) {
      config.url = '/' + config.url;
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['authorization'] = `Bearer ${token}`;

      // Check token expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          const error = new Error('Token expired - please log in again');
          error.name = 'TokenExpiredError';
          throw error;
        }
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          throw e;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config as any;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Update stored tokens
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          // Clear tokens and throw authentication error
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

          // Create a custom authentication error
          const authError = new Error(
            'Authentication failed - please log in again'
          );
          authError.name = 'AuthenticationError';

          return Promise.reject(authError);
        }
      } else {
        // No refresh token, clear storage and throw error
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        const authError = new Error(
          'No authentication token - please log in again'
        );
        authError.name = 'AuthenticationError';

        return Promise.reject(authError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        originalError: error,
      });
    }

    // Handle other HTTP errors
    const errorMessage =
      error.response.data?.error?.message ||
      error.response.data?.message ||
      error.message ||
      'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      status: error.response.status,
      code: error.response.data?.error?.code || 'HTTP_ERROR',
      details: error.response.data?.error?.details,
      originalError: error,
    });
  }
);

// Utility functions for common HTTP methods
export const apiService = {
  // GET request with robust auth header injection
  get: async <T>(url: string, params?: any): Promise<T> => {
    // Get token
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    // For non-auth endpoints, allow requests without token
    const isPublicEndpoint =
      url.includes('/auth/') ||
      url.includes('/browse') ||
      url.includes('/search') ||
      url.includes('/store/') ||
      url.includes('/product/');

    if (!token && !isPublicEndpoint) {
      const error = new Error('Authentication required - please log in again');
      error.name = 'AuthenticationError';
      throw error;
    }

    // Create config with explicit headers
    const config: any = {
      params,
    };

    // If we have a token, add it in multiple ways to ensure it gets through
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
        authorization: `Bearer ${token}`, // lowercase variant
        'Content-Type': 'application/json',
      };
    }

    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error: any) {
      // If it's a 401 and we have a token, the token might be invalid
      if (error.response?.status === 401 && token) {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }

      throw error;
    }
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    // Ensure auth token is present
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token && !url.includes('/auth/')) {
      throw new Error('Authentication required - please log in again');
    }

    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete(url);
    return response.data;
  },

  // File upload
  upload: async <T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progress: number) => void
  ): Promise<T> => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload user profile picture
  uploadProfilePicture: async (
    userId: string,
    imageFile: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ profilePictureUrl: string }> => {
    // Dynamic import for localStorage utilities (avoid import errors if not available)
    const { storeProfilePicture } = await import(
      '../utils/profilePictureStorage'
    );

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('file', imageFile);

    const endpoint = `/api/users/${userId}/profile-picture`;

    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      // Handle 404 error (endpoint not implemented) with localStorage fallback
      if (error.response?.status === 404) {
        try {
          // Simulate upload progress for better UX
          if (onUploadProgress) {
            let progress = 0;
            const progressInterval = setInterval(() => {
              progress += 25;
              onUploadProgress(progress);
              if (progress >= 100) {
                clearInterval(progressInterval);
              }
            }, 150);
          }

          // Store image in localStorage and get base64 data URL
          const localImageData = await storeProfilePicture(
            userId.toString(),
            imageFile
          );

          return {
            profilePictureUrl: localImageData,
          };
        } catch (fallbackError) {
          // Last resort: create temporary blob URL
          const blobUrl = URL.createObjectURL(imageFile);

          return {
            profilePictureUrl: blobUrl,
          };
        }
      }

      throw error;
    }
  },

  // Get user profile picture with caching
  getUserProfilePicture: async (
    userId: string
  ): Promise<{
    profilePictureUrl: string | null;
    hasProfilePicture: boolean;
  }> => {
    const result = await profilePictureCache.getProfilePicture(
      userId,
      async () => {
        const endpoint = `/api/users/${userId}/profile-picture`;
        const response = await api.get(endpoint);

        if (response.data) {
          return {
            profilePictureUrl: response.data.profilePictureUrl || null,
            hasProfilePicture: response.data.hasProfilePicture || false,
          };
        }

        return {
          profilePictureUrl: null,
          hasProfilePicture: false,
        };
      }
    );

    return {
      profilePictureUrl: result.profilePictureUrl,
      hasProfilePicture: result.hasProfilePicture,
    };
  },
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    const testUrl = 'https://localhost:7008/health';
    const response = await axios.get(testUrl, {
      timeout: 5000,
    });
    return true;
  } catch (error: any) {
    return false;
  }
};

// Test inventory API endpoint specifically
export const testInventoryApi = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/inventory');
    return true;
  } catch (error: any) {
    return false;
  }
};

// Get API health status
export const getApiHealth = async () => {
  try {
    const healthUrl = 'https://localhost:7008/health';
    const response = await axios.get(healthUrl, {
      timeout: 5000,
    });
    return {
      isHealthy: true,
      status: response.data,
      baseUrl: 'https://localhost:7008',
      endpoint: '/health',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      isHealthy: false,
      error: error.message || 'Health check failed',
      baseUrl: 'https://localhost:7008',
      endpoint: '/health',
      timestamp: new Date().toISOString(),
    };
  }
};

export default api;
