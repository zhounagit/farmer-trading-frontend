// API Configuration and utilities

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7008',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN:
    import.meta.env.VITE_JWT_STORAGE_KEY || 'helloneighbors_access_token',
  REFRESH_TOKEN:
    import.meta.env.VITE_REFRESH_TOKEN_KEY || 'helloneighbors_refresh_token',
  USER_DATA: 'helloneighbors_user_data',
  SESSION_ID: 'helloneighbors_session_id',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VALIDATE_RESET_TOKEN: '/api/auth/validate-reset-token',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  HEALTH: '/health',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  REFERRAL: {
    GENERATE: '/api/users/generate-referral-code',
    INFO: '/api/users/referral-info',
  },
  USER: {
    PROFILE: '/api/users',
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

  // Debug JWT token details
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT Token Debug:', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 50) + '...',
        payload: payload,
        exp: new Date(payload.exp * 1000),
        isExpired: payload.exp < Date.now() / 1000,
        role: payload.role,
        sub: payload.sub,
      });
    } catch (e) {
      console.error('Failed to decode JWT token:', e);
    }
  } else {
    console.warn('❌ No JWT token found in localStorage');
  }

  // Default headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add auth header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
    console.log(
      '🔐 Authorization header added:',
      `Bearer ${token.substring(0, 20)}...`
    );
  } else {
    console.warn('❌ No Authorization header added - no token');
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

      // Enhanced debugging for failed requests
      console.error('🔴 HTTP Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        method: options.method || 'GET',
        headers: Object.fromEntries(response.headers.entries()),
        errorData: errorData,
        requestHeaders: config.headers,
        hasAuthHeader: !!config.headers?.Authorization,
        authHeaderPrefix: config.headers?.Authorization
          ? String(config.headers.Authorization).substring(0, 20) + '...'
          : 'None',
      });

      // Special handling for 403 Forbidden
      if (response.status === 403) {
        const token = localStorage.getItem('access_token');
        console.error('🚫 403 Forbidden - Detailed Authorization Analysis:', {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPrefix: token ? token.substring(0, 20) + '...' : 'No token',
          endpoint: endpoint,
          authHeader: config.headers?.Authorization || 'Missing',
          requestMethod: options.method || 'GET',
          fullUrl: url,
          responseHeaders: Object.fromEntries(response.headers.entries()),
        });

        // Try to decode JWT for debugging
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.error('🔍 JWT Claims Analysis in 403 Error:', {
              role: payload.role,
              roleType: typeof payload.role,
              roleValue: Array.isArray(payload.role)
                ? payload.role
                : [payload.role],
              sub: payload.sub,
              email: payload.email,
              exp: new Date(payload.exp * 1000),
              isExpired: payload.exp < Date.now() / 1000,
              timeUntilExpiry: payload.exp - Date.now() / 1000,
              allClaims: payload,
            });

            // Check if this looks like a backend authentication vs authorization issue
            if (payload.exp < Date.now() / 1000) {
              console.error(
                '❌ JWT Token is EXPIRED - this is likely the cause of 403'
              );
            } else if (
              !payload.role ||
              (Array.isArray(payload.role) && payload.role.length === 0)
            ) {
              console.error(
                '❌ JWT Token has NO ROLE claim - authorization will fail'
              );
            } else if (
              payload.role !== 'Admin' &&
              !payload.role.includes('Admin')
            ) {
              console.error(
                '❌ JWT Token role is not Admin - authorization will fail for admin endpoints'
              );
            } else {
              console.error(
                '⚠️ JWT Token looks valid - this might be a backend configuration issue'
              );
            }
          } catch (decodeError) {
            console.error(
              '❌ Failed to decode JWT during 403 error - token may be malformed:',
              decodeError
            );
          }
        } else {
          console.error(
            '❌ 403 with no token - user is not authenticated at all'
          );
        }
      }

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
      // Add debugging for API errors
      console.error('🚨 API Error Details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        endpoint: endpoint,
        method: options.method || 'GET',
        headers: config.headers,
        url: url,
      });
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Network Error:', {
        error: error.message,
        endpoint: endpoint,
        url: url,
      });
      throw new ApiErrorClass(
        'Network error - please check your connection',
        0
      );
    }

    // Handle other errors
    console.error('❌ Unknown API Error:', {
      error: error,
      endpoint: endpoint,
      url: url,
      method: options.method || 'GET',
    });
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

  forgotPassword: async (email: string) => {
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  validateResetToken: async (token: string) => {
    return api.get(
      `${API_ENDPOINTS.AUTH.VALIDATE_RESET_TOKEN}?token=${encodeURIComponent(token)}`
    );
  },

  resetPassword: async (
    token: string,
    password: string,
    confirmPassword: string
  ) => {
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      password,
      confirmPassword,
    });
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

// User API methods
export const userApi = {
  // Get current user profile from localStorage
  getCurrentUserProfile: async () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) {
      throw new Error('No authenticated user found');
    }

    const user = JSON.parse(userData);
    if (!user?.userId) {
      throw new Error('No user ID found in stored user data');
    }

    return api.get(`${API_ENDPOINTS.USER.PROFILE}/${user.userId}`);
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

  // Get stores by user ID (explicit user filtering)
  getUserStores: async (userId: number) => {
    return api.get(`/api/users/${userId}/stores`);
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

  // Get enhanced store data for current user
  getMyStoresEnhanced: async (params?: {
    includeMetrics?: boolean;
    includeFeaturedProducts?: boolean;
    includeImages?: boolean;
    includeAddresses?: boolean;
    includeOperations?: boolean;
    includeStorefront?: boolean;
    sortBy?: string;
    sortDescending?: boolean;
    page?: number;
    pageSize?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.includeMetrics !== undefined)
      queryParams.append('includeMetrics', params.includeMetrics.toString());
    if (params?.includeFeaturedProducts !== undefined)
      queryParams.append(
        'includeFeaturedProducts',
        params.includeFeaturedProducts.toString()
      );
    if (params?.includeImages !== undefined)
      queryParams.append('includeImages', params.includeImages.toString());
    if (params?.includeAddresses !== undefined)
      queryParams.append(
        'includeAddresses',
        params.includeAddresses.toString()
      );
    if (params?.includeOperations !== undefined)
      queryParams.append(
        'includeOperations',
        params.includeOperations.toString()
      );
    if (params?.includeStorefront !== undefined)
      queryParams.append(
        'includeStorefront',
        params.includeStorefront.toString()
      );
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined)
      queryParams.append('sortDescending', params.sortDescending.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize)
      queryParams.append('pageSize', params.pageSize.toString());

    const query = queryParams.toString();
    return api.get(`/api/stores/my-stores-enhanced${query ? `?${query}` : ''}`);
  },

  // Get enhanced store by ID
  getEnhancedById: async (storeId: number) => {
    return api.get(`/api/stores/${storeId}/enhanced`);
  },

  // Get store metrics
  getMetrics: async (storeId: number, period: string = 'month') => {
    return api.get(`/api/stores/${storeId}/metrics?period=${period}`);
  },

  // Get featured products for a store
  getFeaturedProducts: async (storeId: number, limit: number = 8) => {
    return api.get(`/api/stores/${storeId}/featured-products?limit=${limit}`);
  },

  // Delete store
  deleteStore: async (storeId: number) => {
    return api.delete(`/api/stores/${storeId}`);
  },
};

// Error handler utility with context awareness
export const handleApiError = (
  error: unknown,
  context?: 'login' | 'auth' | 'general'
): string => {
  // Handle ApiError from api-service.ts
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'error' in error
  ) {
    const apiError = error as any;

    // First, try to use the specific error message from the API
    if (apiError.message && apiError.message !== `HTTP ${apiError.status}`) {
      return apiError.message;
    }

    // Check for specific error codes from backend
    if (apiError.details && typeof apiError.details === 'object') {
      const errorDetails = apiError.details as any;
      if (
        errorDetails.errors &&
        Array.isArray(errorDetails.errors) &&
        errorDetails.errors.length > 0
      ) {
        const firstError = errorDetails.errors[0];
        if (firstError.code === 'ACCOUNT_INACTIVE') {
          return 'Your account has been deactivated. Please contact support if you believe this is an error.';
        }
      }
    }

    // Check for ACCOUNT_INACTIVE in the error field directly
    if (apiError.error === 'ACCOUNT_INACTIVE') {
      return 'Your account has been deactivated. Please contact support if you believe this is an error.';
    }

    // Fall back to context-aware messages based on status code
    switch (apiError.status) {
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
        return apiError.message || 'An unexpected error occurred';
    }
  }

  // Handle legacy ApiErrorClass for backward compatibility
  if (error instanceof ApiErrorClass) {
    // First, try to use the specific error message from the API
    if (error.message && error.message !== `HTTP ${error.status}`) {
      return error.message;
    }

    // Check for specific error codes from backend
    if (error.data && typeof error.data === 'object') {
      const apiError = error.data as any;
      if (
        apiError.errors &&
        Array.isArray(apiError.errors) &&
        apiError.errors.length > 0
      ) {
        const firstError = apiError.errors[0];
        if (firstError.code === 'ACCOUNT_INACTIVE') {
          return 'Your account has been deactivated. Please contact support if you believe this is an error.';
        }
      }
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
    const sessionId =
      tokenUtils.getSessionId() || tokenUtils.generateSessionId();
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    tokenUtils.setSessionId(sessionId);
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
    localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  },

  generateSessionId: (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  setSessionId: (sessionId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  },

  getSessionId: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
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

// Image URL utility functions
export const imageUtils = {
  /**
   * Constructs a full image URL from a relative path
   * @param imagePath - The image path from the API (e.g., "/uploads/stores/33/image.jpg")
   * @param fallbackUrl - Fallback URL if imagePath is invalid (default: "/placeholder-product.jpg")
   * @returns Full image URL
   */
  getImageUrl: (
    imagePath: string | null | undefined,
    fallbackUrl: string = '/placeholder-product.jpg'
  ): string => {
    if (!imagePath) {
      return fallbackUrl;
    }

    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // If it's a relative path, construct full URL using API base
    if (imagePath.startsWith('/')) {
      return `${API_CONFIG.BASE_URL}${imagePath}`;
    }

    // If it doesn't start with /, add it
    return `${API_CONFIG.BASE_URL}/${imagePath}`;
  },

  /**
   * Gets the primary image URL from an array of images
   * @param images - Array of image objects with imageUrl and isPrimary properties
   * @param fallbackUrl - Fallback URL if no images available
   * @returns Primary image URL or first available image URL
   */
  getPrimaryImageUrl: (
    images: Array<{ imageUrl: string; isPrimary?: boolean }> | null | undefined,
    fallbackUrl: string = '/placeholder-product.jpg'
  ): string => {
    if (!images || images.length === 0) {
      return fallbackUrl;
    }

    // Find primary image first
    const primaryImage = images.find((img) => img.isPrimary);
    if (primaryImage) {
      return imageUtils.getImageUrl(primaryImage.imageUrl, fallbackUrl);
    }

    // Fall back to first image
    const firstImage = images[0];
    return imageUtils.getImageUrl(firstImage.imageUrl, fallbackUrl);
  },

  /**
   * Checks if an image URL is accessible
   * @param imageUrl - The image URL to check
   * @returns Promise that resolves to true if image is accessible
   */
  isImageAccessible: async (imageUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Preloads an image for better performance
   * @param imageUrl - The image URL to preload
   * @returns Promise that resolves when image is loaded
   */
  preloadImage: (imageUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageUrl;
    });
  },
};
