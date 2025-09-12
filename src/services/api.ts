import axios from 'axios';

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

// Use localStorage override if available (for development debugging)
const storedApiUrl = localStorage.getItem('TEMP_API_BASE_URL');
const API_BASE_URL =
  storedApiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5008';

// Debug logging for API configuration
console.log('=== API CONFIGURATION ===');
console.log('Stored API URL:', storedApiUrl);
console.log('Environment API URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Final API_BASE_URL:', API_BASE_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for debugging
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
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

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', {
            refreshToken: refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } =
            response.data.data;

          // Update stored tokens
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);

          // Clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Only redirect if we're not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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
  },
};

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Always log the actual URL we're connecting to
    console.log(`🔍 Testing health endpoint: ${API_BASE_URL}/health`);
    console.log(`🔧 Environment var: ${import.meta.env.VITE_API_BASE_URL}`);
    console.log(
      `🔧 localStorage override: ${localStorage.getItem('TEMP_API_BASE_URL')}`
    );

    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    console.log(`✅ API Connection Successful:`, response.data);
    return true;
  } catch (error: any) {
    console.error('❌ API Connection Failed:', error.message || error);
    console.log('🔍 Attempted to connect to:', `${API_BASE_URL}/health`);
    console.log(
      '💡 Tip: Make sure your .NET backend is running and check your .env.local file'
    );
    return false;
  }
};

// Get API health status
export const getApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    return {
      isHealthy: true,
      status: response.data,
      baseUrl: API_BASE_URL,
      endpoint: '/health',
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      isHealthy: false,
      error: error.message || 'Health check failed',
      baseUrl: API_BASE_URL,
      endpoint: '/health',
      timestamp: new Date().toISOString(),
    };
  }
};

export default api;
