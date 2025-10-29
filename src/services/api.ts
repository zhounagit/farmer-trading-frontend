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

// AGGRESSIVE LOCALSTORAGE CLEARING
console.log('🧹 CLEARING ALL POTENTIAL API URL OVERRIDES...');
console.log(
  'Before clearing - TEMP_API_BASE_URL:',
  localStorage.getItem('TEMP_API_BASE_URL')
);
console.log(
  'Before clearing - API_BASE_URL:',
  localStorage.getItem('API_BASE_URL')
);
console.log(
  'Before clearing - VITE_API_BASE_URL:',
  localStorage.getItem('VITE_API_BASE_URL')
);

// Clear all possible localStorage API URL keys
localStorage.removeItem('TEMP_API_BASE_URL');
localStorage.removeItem('API_BASE_URL');
localStorage.removeItem('VITE_API_BASE_URL');
localStorage.removeItem('BASE_URL');

// Use HTTPS endpoint since browser is forcing HTTPS redirect
const API_BASE_URL = 'https://localhost:7008';

// Final normalization - remove any /api suffix
const normalizedApiUrl = API_BASE_URL.replace(/\/api$/, '');

// Debug logging for API configuration
console.log('=== API CONFIGURATION DEBUG ===');
console.log('Environment API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Using HTTPS API_BASE_URL:', API_BASE_URL);
console.log('Final normalized API URL:', normalizedApiUrl);
console.log('Window location:', window.location.href);
console.log('Environment mode:', import.meta.env.MODE);
console.log('Development mode:', import.meta.env.DEV);

// Double-check localStorage is clear
console.log(
  'After clearing - TEMP_API_BASE_URL:',
  localStorage.getItem('TEMP_API_BASE_URL')
);
console.log(
  'After clearing - all localStorage keys:',
  Object.keys(localStorage)
);

// Create axios instance
export const api = axios.create({
  baseURL: normalizedApiUrl,
  timeout: 30000, // Increased to 30 seconds for debugging
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add debug logging for the axios instance
console.log('🔧 AXIOS INSTANCE CREATED:', {
  baseURL: api.defaults.baseURL,
  normalizedApiUrl: normalizedApiUrl,
  timeout: api.defaults.timeout,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Request interceptor processing

    // Ensure HTTPS URL is used
    if (!config.baseURL?.startsWith('https://localhost:7008')) {
      config.baseURL = 'https://localhost:7008';
    }

    // Debug the actual URL being called
    const fullUrl = `${config.baseURL}${config.url}`;

    // Request configuration updated

    // Verify correct HTTPS URL is being used
    if (!fullUrl.startsWith('https://localhost:7008')) {
      console.log('🔧 Ensuring HTTPS URL for:', fullUrl);
      config.baseURL = 'https://localhost:7008';
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Auth token added

      // Debug token payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔐 Token payload debug:', {
          sub: payload.sub,
          nameid: payload.nameid,
          role: payload.role,
          exp: new Date(payload.exp * 1000),
          expired: payload.exp * 1000 < Date.now(),
        });
      } catch (e) {
        console.log('🔐 Could not decode token payload:', e.message);
      }
    } else {
      console.log('⚠️ No auth token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
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
          console.error('Token refresh failed:', refreshError);

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
      console.error('Network error:', error.message);
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
  // GET request
  get: async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<T> => {
    console.log('=== API SERVICE POST ===');
    console.log('URL:', url);
    console.log('Data:', data);
    console.log('Request start time:', new Date().toISOString());

    try {
      const response = await api.post(url, data);
      console.log('=== API SERVICE SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);
      console.log('Request end time:', new Date().toISOString());

      // Handle ApiResponse wrapper structure from backend
      // Backend returns: { data: T, success: boolean, ... }
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // Fallback for direct response (if backend changes)
      return response.data;
    } catch (error: any) {
      console.error('=== API SERVICE ERROR ===');
      console.error('Error in apiService.post:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Has response:', !!error?.response);
      if (error?.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      console.error('Request failed time:', new Date().toISOString());
      throw error;
    }
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put(url, data);

    // Handle ApiResponse wrapper structure from backend
    // Backend returns: { data: T, success: boolean, ... }
    if (response.data && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct response (if backend changes)
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch(url, data);

    // Handle ApiResponse wrapper structure from backend
    // Backend returns: { data: T, success: boolean, ... }
    if (response.data && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct response (if backend changes)
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await api.delete(url);

    // Handle ApiResponse wrapper structure from backend
    // Backend returns: { data: T, success: boolean, ... }
    if (response.data && response.data.data) {
      return response.data.data;
    }

    // Fallback for direct response (if backend changes)
    return response.data;
  },

  // File upload
  upload: async <T>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progress: number) => void
  ): Promise<T> => {
    console.log('🌐 === apiService.upload CALLED ===');
    console.log('URL:', url);
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`- ${key}:`, {
          name: value.name,
          size: value.size,
          type: value.type,
        });
      } else {
        console.log(`- ${key}:`, value);
      }
    }
    console.log('🔧 API Configuration Check:');
    console.log('- API_BASE_URL constant:', API_BASE_URL);
    console.log('- axios baseURL:', api.defaults.baseURL);
    console.log('- Expected full URL:', `${API_BASE_URL}${url}`);
    console.log(
      '- localStorage TEMP_API_BASE_URL:',
      localStorage.getItem('TEMP_API_BASE_URL')
    );

    try {
      console.log('🚀 Making axios POST request...');
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`📊 Upload progress: ${progress}%`);
            onUploadProgress(progress);
          }
        },
      });
      console.log('✅ Upload response received:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Upload request failed in apiService:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
          : 'No response',
      });
      throw error;
    }
  },

  // Upload user profile picture
  uploadProfilePicture: async (
    userId: string,
    imageFile: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ profilePictureUrl: string }> => {
    console.log('🔄 uploadProfilePicture: Starting upload', {
      userId,
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
    });

    // Dynamic import for localStorage utilities (avoid import errors if not available)
    const { storeProfilePicture } = await import(
      '../utils/profilePictureStorage'
    );

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('file', imageFile);

    const endpoint = `/api/users/${userId}/profile-picture`;
    // Making upload request

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

      // Handle ApiResponse wrapper structure from backend
      // Backend returns: { data: { profilePictureUrl: string, ... }, success: boolean, ... }
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // Fallback for direct response (if backend changes)
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile picture upload failed in apiService:', error);

      // Handle 404 error (endpoint not implemented) with localStorage fallback
      if (error.response?.status === 404) {
        console.warn(
          '⚠️ Profile picture endpoint not implemented, using localStorage fallback'
        );

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
          console.error('❌ localStorage fallback also failed:', fallbackError);

          // Last resort: create temporary blob URL
          const blobUrl = URL.createObjectURL(imageFile);
          console.warn('⚠️ Using temporary blob URL as final fallback');

          return {
            profilePictureUrl: blobUrl,
          };
        }
      }

      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
          : 'No response',
      });
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

        // Handle ApiResponse wrapper structure from backend
        let responseData = response.data;
        if (response.data && response.data.data) {
          responseData = response.data.data;
        }

        if (responseData) {
          return {
            profilePictureUrl: responseData.profilePictureUrl || null,
            hasProfilePicture: responseData.hasProfilePicture || false,
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
    // Always log the actual URL we're connecting to
    const testUrl = 'https://localhost:7008/health';
    console.log(`🔍 Testing health endpoint: ${testUrl}`);
    console.log(`🔧 Environment var: ${import.meta.env.VITE_API_BASE_URL}`);

    const response = await axios.get(testUrl, {
      timeout: 5000,
    });
    console.log(`✅ API Connection Successful:`, response.data);
    return true;
  } catch (error: any) {
    console.error('❌ API Connection Failed:', error.message || error);
    console.log('🔍 Attempted to connect to:', testUrl);
    console.log(
      '💡 Tip: Make sure your .NET backend is running on HTTPS port 7008'
    );
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
