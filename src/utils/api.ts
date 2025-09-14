// API Configuration and utilities

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5008',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN:
    import.meta.env.VITE_JWT_STORAGE_KEY || 'heartwood_access_token',
  REFRESH_TOKEN:
    import.meta.env.VITE_REFRESH_TOKEN_KEY || 'heartwood_refresh_token',
  USER_DATA: 'heartwood_user_data',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  HEALTH: '/health',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  REFERRAL: {
    GENERATE: '/api/users/generate-referral-code',
    INFO: '/api/users/referral-info',
  },
  STORE: {
    CREATE: '/api/stores',
    MY_STORES: '/api/stores/my-stores',
    BY_ID: '/api/stores',
    ALL: '/api/stores',
    DELETE: '/api/stores',
    UPDATE: '/api/stores',
    ACCESS_CHECK: '/api/stores',
  },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Error class
export class ApiErrorClass extends Error {
  public status: number;
  public data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Generic API request function
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Get auth token
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  // Default headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Handle different response types
    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorData = data as Record<string, unknown>;
      throw new ApiErrorClass(
        (errorData.error as string) ||
          (errorData.message as string) ||
          `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiErrorClass(
        'Network error - please check your connection',
        0
      );
    }

    // Handle other errors
    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
};

// Specific API methods
export const api = {
  // GET request
  get: <T = unknown>(endpoint: string, options?: RequestInit): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'GET', ...options });
  },

  // POST request
  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  // PUT request
  put: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  // PATCH request
  patch: <T = unknown>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  // DELETE request
  delete: <T = unknown>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE', ...options });
  },
};

// Auth-specific API methods
export const authApi = {
  login: async (email: string, password: string) => {
    return api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  },

  register: async (data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    userType: string;
    phone?: string;
    referralCode?: string;
  }) => {
    console.log('🔍 DEBUG: Registration API call starting...');
    console.log(
      '📤 Registration URL:',
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`
    );
    console.log('📤 Registration Data:', {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      userType: data.userType,
      phone: data.phone || 'Not provided',
      referralCode: data.referralCode || 'Not provided',
      passwordLength: data.password.length,
      confirmPasswordLength: data.confirmPassword.length,
    });

    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      console.log('✅ Registration Success:', response);
      return response;
    } catch (error) {
      console.error('❌ Registration Failed:', error);
      console.log('🔍 Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as unknown as { status?: number }).status,
        data: (error as unknown as { data?: unknown }).data,
      });
      throw error;
    }
  },

  logout: async (refreshToken: string) => {
    return api.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
  },

  refresh: async (refreshToken: string) => {
    return api.post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken });
  },

  healthCheck: async () => {
    return api.get(API_ENDPOINTS.HEALTH);
  },
};

// Referral code API methods
export const referralApi = {
  generate: async () => {
    return api.post(API_ENDPOINTS.REFERRAL.GENERATE);
  },

  getInfo: async () => {
    return api.get(API_ENDPOINTS.REFERRAL.INFO);
  },
};

// Store API methods
export const storeApi = {
  // Get all stores (public)
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    const query = queryParams.toString();
    return api.get(`/api/stores${query ? `?${query}` : ''}`);
  },

  // Get current user's stores (requires auth)
  getMyStores: async () => {
    return api.get('/api/stores/my-stores');
  },

  // Create new store
  create: async (storeData: {
    StoreName: string;
    Description?: string;
    OpenHours: string; // JSON string for JSONB column
    AcceptedPaymentMethods: string[];
    DeliveryRadiusKm: number;
  }) => {
    console.log('🔍 DEBUG: Store creation API call starting...');
    console.log('📤 Store creation URL:', `${API_CONFIG.BASE_URL}/api/stores`);
    console.log('📤 Store Data:', JSON.stringify(storeData, null, 2));

    try {
      const response = await api.post('/api/stores', storeData);
      console.log('✅ Store creation success:', response);
      return response;
    } catch (error) {
      console.error('❌ Store creation failed:', error);
      console.error(
        '❌ Error details:',
        JSON.stringify(
          {
            message: error instanceof Error ? error.message : 'Unknown error',
            status: (error as any)?.status,
            data: (error as any)?.data,
          },
          null,
          2
        )
      );
      throw error;
    }
  },

  // Get store by ID
  getById: async (storeId: number) => {
    return api.get(`/api/stores/${storeId}`);
  },

  // Check if user can access store
  checkAccess: async (storeId: number) => {
    return api.get(`/api/stores/${storeId}/can-access`);
  },

  // Update store
  update: async (storeId: number, storeData: Record<string, unknown>) => {
    console.log('🔍 DEBUG: Store update API call starting...');
    console.log(
      '📤 Store update URL:',
      `${API_CONFIG.BASE_URL}/api/stores/${storeId}`
    );
    console.log('📤 Update Data:', JSON.stringify(storeData, null, 2));

    try {
      const response = await api.put(`/api/stores/${storeId}`, storeData);
      console.log('✅ Store update success:', response);
      return response;
    } catch (error) {
      console.error('❌ Store update failed:', error);
      console.error(
        '❌ Error details:',
        JSON.stringify(
          {
            message: error instanceof Error ? error.message : 'Unknown error',
            status: (error as any)?.status,
            data: (error as any)?.data,
          },
          null,
          2
        )
      );
      throw error;
    }
  },

  // Delete store (admin only)
  delete: async (storeId: number) => {
    return api.delete(`/api/stores/${storeId}`);
  },

  // Upload store images
  uploadLogo: async (storeId: number, logoFile: File) => {
    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    formData.append('file', logoFile);

    return api.post(`/api/stores/${storeId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadBanner: async (storeId: number, bannerFile: File) => {
    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    formData.append('file', bannerFile);

    return api.post(`/api/stores/${storeId}/upload-banner`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadGalleryImages: async (storeId: number, imageFiles: File[]) => {
    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    return api.post(`/api/stores/${storeId}/upload-gallery`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Error handler utility with context awareness
export const handleApiError = (
  error: unknown,
  context?: 'login' | 'auth' | 'general'
): string => {
  if (error instanceof ApiErrorClass) {
    // First, try to use the specific error message from the API
    if (error.message && error.message !== `HTTP ${error.status}`) {
      return error.message;
    }

    // Fall back to context-aware messages based on status code
    switch (error.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        if (context === 'login') {
          return 'Incorrect username or password. Please try again.';
        }
        return 'Please log in to continue';
      case HTTP_STATUS.FORBIDDEN:
        return 'You do not have permission to perform this action';
      case HTTP_STATUS.NOT_FOUND:
        return 'The requested resource was not found';
      case HTTP_STATUS.CONFLICT:
        return 'This operation conflicts with existing data';
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return 'Please check your input and try again';
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return 'Too many requests. Please try again later';
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return 'Server error. Please try again later';
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return 'Service is temporarily unavailable';
      case 0:
        return 'Network error - please check your connection';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

// Token management utilities
export const tokenUtils = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  removeAccessToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  clearAllTokens: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

// Request interceptor for automatic token refresh
export const setupApiInterceptors = () => {
  // This would be implemented if using axios or similar
  // For now, we handle it manually in the auth context
  console.log('API interceptors configured');
};
