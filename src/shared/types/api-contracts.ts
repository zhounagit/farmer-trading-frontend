/**
 * Shared API Contracts for Frontend-Backend Coordination
 *
 * This file defines the API contracts that both frontend and backend must follow.
 * Any changes to API endpoints or response formats should be reflected here first.
 */

// Base API Response Interface
export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

export interface ApiMeta {
  timestamp?: string;
  version?: string;
  requestId?: string;
  processingTimeMs?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  errors?: ApiError[];
  message?: string;
  success: boolean;
  meta?: ApiMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface RegisterResponse {
  user: {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    userType: 'customer' | 'store_owner' | 'admin';
  };
  token: string;
  expiresIn: number;
}

// Product Categories API Contracts
export interface ProductCategory {
  categoryId: number;
  name: string;
  description?: string;
  iconUrl?: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductCategoryCreateRequest {
  name: string;
  description?: string;
  iconUrl?: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductCategoryUpdateRequest {
  name?: string;
  description?: string;
  iconUrl?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ProductCategoryWithCount extends ProductCategory {
  itemCount: number;
}

// Store API Contracts
export interface Store {
  storeId: number;
  storeName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  ownerId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreBasics {
  storeName: string;
  description?: string;
  categories: string[];
}

export interface StoreCategoryMapping {
  storeId: number;
  categoryId: number;
  category: ProductCategory;
}

export interface StoreOpenHour {
  storeId: number;
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
}

export interface StorePaymentMethod {
  storePaymentMethodsId: number;
  storeId: number;
  methodId: number;
  paymentMethod: {
    methodId: number;
    methodName: string;
  };
}

// Inventory API Contracts
export interface InventoryItem {
  itemId: number;
  storeId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  categoryId?: number;
  category?: ProductCategory;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCreateRequest {
  storeId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  categoryId?: number;
  images?: string[];
}

export interface InventoryItemUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  quantity?: number;
  categoryId?: number;
  images?: string[];
  isActive?: boolean;
}

// Orders API Contracts
export interface Order {
  orderId: number;
  customerId: number;
  storeId: number;
  totalAmount: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready'
    | 'completed'
    | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  itemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  inventoryItem: InventoryItem;
}

export interface CreateOrderRequest {
  storeId: number;
  items: Array<{
    itemId: number;
    quantity: number;
  }>;
  paymentMethodId: number;
}

// User Management API Contracts
export interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  profilePictureUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  referredAt?: string;
  profilePictureUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

// Admin API Contracts
export interface StoreApplication {
  submissionId: string;
  storeName: string;
  description?: string;
  applicantName: string;
  applicantEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: number;
  reviewNotes?: string;
}

export interface AdminDashboardStats {
  gmv: number;
  revenue: number;
  orders: number;
  customers: number;
  stores: number;
  aov: number;
}

// User Management API Contracts
export interface UserProfile {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  profilePictureUrl?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  display: {
    theme: 'auto' | 'light' | 'dark';
    language: string;
    timezone: string;
  };
  referralCredits: {
    handling: string;
  };
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteStores: number;
  accountAgeDays: number;
  lastActive: string;
}

export interface UpdateUserPreferencesRequest {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    marketing?: boolean;
  };
  privacy?: {
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
  };
  display?: {
    theme?: 'auto' | 'light' | 'dark';
    language?: string;
    timezone?: string;
  };
}

export interface ReferralInfo {
  myReferralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  referralCredits: number;
  referralLink: string;
}

// Commission-related interfaces
export interface ReferralCommissionRate {
  level: number;
  commissionRate: number;
  description?: string;
  updatedAt: string;
  updatedBy?: number;
  updatedByName?: string;
}

export interface UpdateReferralCommissionRateRequest {
  level: number;
  commissionRate: number;
  description?: string;
}

// Referral History interfaces
export interface ReferralHistoryItem {
  id: number;
  referredUserId: number;
  referredEmail: string;
  referredFirstName: string;
  referredLastName: string;
  dateReferred: string;
  status: 'active' | 'inactive';
  totalPurchases: number;
  totalEarnings: number;
}

export interface UpdateReferrerRequest {
  targetUserEmail?: string;
  targetUserPhone?: string;
  newReferrerCode: string;
}

export interface ReferralCodeUsageInfo {
  usedReferralCode?: string;
  referrerName?: string;
  referredAt?: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// Search and Filter Contracts
export interface SearchRequest {
  query?: string;
  category?: string;
  location?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'distance' | 'rating';
  page?: number;
  pageSize?: number;
}

// Store Management Contracts
export interface CreateStoreRequest {
  storeName: string;
  description?: string;
  categories: string[];
  openHours?: StoreOpenHour[];
  paymentMethods?: number[];
  deliveryRadiusKm?: number;
}

export interface UpdateStoreRequest {
  storeName?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  isActive?: boolean;
}

export interface StoreFilters {
  search?: string;
  category?: string;
  location?: string;
  radius?: number;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  items: InventoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Inventory Management Contracts
export interface InventoryItem {
  itemId: number;
  storeId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  categoryId?: number;
  category?: ProductCategory;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCreateRequest {
  storeId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  categoryId?: number;
  images?: string[];
}

export interface InventoryItemUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  quantity?: number;
  categoryId?: number;
  images?: string[];
  isActive?: boolean;
}

export interface InventoryFilters {
  query?: string;
  categoryId?: number;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  pageSize?: number;
}

// Error Response Contracts
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  timestamp: string;
}

// API Endpoint Constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },

  // Users
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: number) => `/api/users/${id}`,
    PREFERENCES: (id: number) => `/api/users/${id}/preferences`,
    PREFERENCES_UPDATE: (id: number) => `/api/users/${id}/preferences`,
    STATS: (id: number) => `/api/users/${id}/stats`,
    REFERRAL_INFO: (id: number) => `/api/users/${id}/referral-info`,
    PROFILE_PICTURE: (id: number) => `/api/users/${id}/profile-picture`,
    CHANGE_PASSWORD: (id: number) => `/api/users/${id}/change-password`,
    ACTIVITY: (id: number) => `/api/users/${id}/activity`,
    SEARCH: '/api/users/search',
    CHECK_EMAIL: '/api/users/check-email',
  },

  // Product Categories
  CATEGORIES: {
    BASE: '/api/product-categories',
    WITH_COUNTS: '/api/product-categories/with-counts',
    BY_SLUG: (slug: string) => `/api/product-categories/slug/${slug}`,
    EXISTS: (id: number) => `/api/product-categories/${id}/exists`,
  },

  // Stores
  STORES: {
    BASE: '/api/stores',
    BY_ID: (id: number) => `/api/stores/${id}`,
    CATEGORIES: (id: number) => `/api/stores/${id}/categories`,
    OPEN_HOURS: (id: number) => `/api/stores/${id}/open-hours`,
    PAYMENT_METHODS: (id: number) => `/api/stores/${id}/payment-methods`,
    CREATE_BASICS: '/api/stores/basics',
    LOGO: (id: number) => `/api/stores/${id}/logo`,
    BANNER: (id: number) => `/api/stores/${id}/banner`,
    ACCESS_CHECK: (id: number) => `/api/stores/${id}/access-check`,
  },

  // Inventory
  INVENTORY: {
    BASE: '/api/inventory',
    BY_STORE: (storeId: number) => `/api/inventory/store/${storeId}`,
    BY_ID: (id: number) => `/api/inventory/${id}`,
    IMAGES: (itemId: number) => `/api/inventory/${itemId}/images`,
  },

  // Orders
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id: number) => `/api/orders/${id}`,
    BY_CUSTOMER: (customerId: number) => `/api/orders/customer/${customerId}`,
    BY_STORE: (storeId: number) => `/api/orders/store/${storeId}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    STORE_APPLICATIONS: {
      BASE: '/api/admin/store-applications',
      PENDING: '/api/admin/store-applications/pending',
      BY_ID: (id: string) => `/api/admin/store-applications/${id}`,
      APPROVE: (id: string) => `/api/admin/store-applications/${id}/approve`,
      REJECT: (id: string) => `/api/admin/store-applications/${id}/reject`,
      ASSIGN_REVIEWER: (id: string) =>
        `/api/admin/store-applications/${id}/assign-reviewer`,
      STATUS_HISTORY: (id: string) =>
        `/api/admin/store-applications/${id}/status-history`,
    },
  },

  // Search
  SEARCH: {
    BASE: '/api/search',
    STORES: '/api/search/stores',
    PRODUCTS: '/api/search/products',
  },

  // Commission
  COMMISSION: {
    BASE: '/api/commission',
    REFERRAL: {
      RATES: '/api/commission/referral/rates',
      RATE_BY_LEVEL: (level: number) =>
        `/api/commission/referral/rates/${level}`,
    },
  },

  // Referral Management
  REFERRAL: {
    BASE: '/api/referral',
    HISTORY: (userId: number) => `/api/users/${userId}/referral-history`,
    UPDATE_REFERRER: '/api/referral/update-referrer',
    USAGE_INFO: (userId: number) => `/api/users/${userId}/referral-usage`,
  },
} as const;

// Type Guards for Runtime Validation
export const isApiResponse = (obj: unknown): obj is ApiResponse => {
  if (!obj || typeof obj !== 'object') return false;

  const apiObj = obj as Record<string, unknown>;
  return 'success' in apiObj && typeof apiObj.success === 'boolean';
};

export const isErrorResponse = (obj: unknown): obj is ErrorResponse => {
  return (
    !!obj && typeof obj === 'object' && 'error' in obj && 'timestamp' in obj
  );
};

export const isPaginatedResponse = (
  obj: unknown
): obj is PaginatedResponse<unknown> => {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'data' in obj &&
    'pagination' in obj &&
    typeof obj.pagination === 'object' &&
    obj.pagination !== null &&
    'page' in obj.pagination &&
    'pageSize' in obj.pagination
  );
};
