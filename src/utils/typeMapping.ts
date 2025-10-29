/**
 * Type mapping utilities for converting between frontend and backend data formats
 * This helps maintain consistency when dealing with different naming conventions
 */

// Define the different userType formats used across the application
export type BackendUserType = 'Customer' | 'StoreOwner' | 'Admin';
export type FrontendUserType = 'customer' | 'store_owner' | 'admin';
export type DisplayUserType = 'Customer' | 'Store Owner' | 'Admin';

// Mapping objects for conversions
const BACKEND_TO_FRONTEND_USER_TYPE: Record<BackendUserType, FrontendUserType> = {
  'Customer': 'customer',
  'StoreOwner': 'store_owner',
  'Admin': 'admin'
};

const FRONTEND_TO_BACKEND_USER_TYPE: Record<FrontendUserType, BackendUserType> = {
  'customer': 'Customer',
  'store_owner': 'StoreOwner',
  'admin': 'Admin'
};

const BACKEND_TO_DISPLAY_USER_TYPE: Record<BackendUserType, DisplayUserType> = {
  'Customer': 'Customer',
  'StoreOwner': 'Store Owner',
  'Admin': 'Admin'
};

const FRONTEND_TO_DISPLAY_USER_TYPE: Record<FrontendUserType, DisplayUserType> = {
  'customer': 'Customer',
  'store_owner': 'Store Owner',
  'admin': 'Admin'
};

const DISPLAY_TO_BACKEND_USER_TYPE: Record<DisplayUserType, BackendUserType> = {
  'Customer': 'Customer',
  'Store Owner': 'StoreOwner',
  'Admin': 'Admin'
};

const DISPLAY_TO_FRONTEND_USER_TYPE: Record<DisplayUserType, FrontendUserType> = {
  'Customer': 'customer',
  'Store Owner': 'store_owner',
  'Admin': 'admin'
};

/**
 * Convert backend userType format to frontend format
 * Backend: 'Customer' | 'StoreOwner' | 'Admin'
 * Frontend: 'customer' | 'store_owner' | 'admin'
 */
export const toFrontendUserType = (backendType: BackendUserType): FrontendUserType => {
  return BACKEND_TO_FRONTEND_USER_TYPE[backendType];
};

/**
 * Convert frontend userType format to backend format
 * Frontend: 'customer' | 'store_owner' | 'admin'
 * Backend: 'Customer' | 'StoreOwner' | 'Admin'
 */
export const toBackendUserType = (frontendType: FrontendUserType): BackendUserType => {
  return FRONTEND_TO_BACKEND_USER_TYPE[frontendType];
};

/**
 * Convert backend userType format to display format
 * Backend: 'Customer' | 'StoreOwner' | 'Admin'
 * Display: 'Customer' | 'Store Owner' | 'Admin'
 */
export const toDisplayUserType = (backendType: BackendUserType): DisplayUserType => {
  return BACKEND_TO_DISPLAY_USER_TYPE[backendType];
};

/**
 * Convert frontend userType format to display format
 * Frontend: 'customer' | 'store_owner' | 'admin'
 * Display: 'Customer' | 'Store Owner' | 'Admin'
 */
export const frontendToDisplayUserType = (frontendType: FrontendUserType): DisplayUserType => {
  return FRONTEND_TO_DISPLAY_USER_TYPE[frontendType];
};

/**
 * Convert display userType format to backend format
 * Display: 'Customer' | 'Store Owner' | 'Admin'
 * Backend: 'Customer' | 'StoreOwner' | 'Admin'
 */
export const displayToBackendUserType = (displayType: DisplayUserType): BackendUserType => {
  return DISPLAY_TO_BACKEND_USER_TYPE[displayType];
};

/**
 * Convert display userType format to frontend format
 * Display: 'Customer' | 'Store Owner' | 'Admin'
 * Frontend: 'customer' | 'store_owner' | 'admin'
 */
export const displayToFrontendUserType = (displayType: DisplayUserType): FrontendUserType => {
  return DISPLAY_TO_FRONTEND_USER_TYPE[displayType];
};

/**
 * Auto-detect and convert any userType format to backend format
 * Useful when you're unsure of the input format
 */
export const normalizeToBackendUserType = (userType: string): BackendUserType => {
  const normalized = userType.toLowerCase().trim();

  // Check if it's already in backend format
  if (userType in BACKEND_TO_FRONTEND_USER_TYPE) {
    return userType as BackendUserType;
  }

  // Check if it's in frontend format
  if (normalized in FRONTEND_TO_BACKEND_USER_TYPE) {
    return FRONTEND_TO_BACKEND_USER_TYPE[normalized as FrontendUserType];
  }

  // Handle common variations
  switch (normalized) {
    case 'customer':
      return 'Customer';
    case 'store_owner':
    case 'storeowner':
    case 'store owner':
    case 'shop_owner':
    case 'shop owner':
      return 'StoreOwner';
    case 'admin':
    case 'administrator':
      return 'Admin';
    default:
      // Default to Customer if unrecognized
      console.warn(`Unrecognized userType: ${userType}, defaulting to 'Customer'`);
      return 'Customer';
  }
};

/**
 * Auto-detect and convert any userType format to frontend format
 * Useful when you're unsure of the input format
 */
export const normalizeToFrontendUserType = (userType: string): FrontendUserType => {
  const backendType = normalizeToBackendUserType(userType);
  return toFrontendUserType(backendType);
};

/**
 * Auto-detect and convert any userType format to display format
 * Useful when you're unsure of the input format
 */
export const normalizeToDisplayUserType = (userType: string): DisplayUserType => {
  const backendType = normalizeToBackendUserType(userType);
  return toDisplayUserType(backendType);
};

/**
 * Check if a user has a specific permission level
 * This uses backend format internally for consistency
 */
export const hasPermission = (
  userType: string,
  requiredLevel: 'customer' | 'store_owner' | 'admin'
): boolean => {
  const normalizedUserType = normalizeToFrontendUserType(userType);

  // Define permission hierarchy (higher index = more permissions)
  const hierarchy: FrontendUserType[] = ['customer', 'store_owner', 'admin'];

  const userIndex = hierarchy.indexOf(normalizedUserType);
  const requiredIndex = hierarchy.indexOf(requiredLevel);

  return userIndex >= requiredIndex;
};

/**
 * Get user type display label for UI
 */
export const getUserTypeLabel = (userType: string): string => {
  return normalizeToDisplayUserType(userType);
};

/**
 * Check if user is of specific type (case-insensitive)
 */
export const isUserType = (userType: string, checkType: 'customer' | 'store_owner' | 'admin'): boolean => {
  const normalizedUserType = normalizeToFrontendUserType(userType);
  return normalizedUserType === checkType;
};

// Export commonly used type checkers
export const isCustomer = (userType: string): boolean => isUserType(userType, 'customer');
export const isStoreOwner = (userType: string): boolean => isUserType(userType, 'store_owner');
export const isAdmin = (userType: string): boolean => isUserType(userType, 'admin');

// Type conversion utilities for API requests/responses
export interface ApiTypeConverter {
  /**
   * Convert a request object from frontend format to backend format
   */
  requestToBackend<T extends Record<string, any>>(obj: T): T;

  /**
   * Convert a response object from backend format to frontend format
   */
  responseToFrontend<T extends Record<string, any>>(obj: T): T;
}

/**
 * Create a type converter that automatically handles userType conversion
 * in API requests and responses
 */
export const createApiTypeConverter = (): ApiTypeConverter => ({
  requestToBackend: <T extends Record<string, any>>(obj: T): T => {
    const converted = { ...obj };

    if ('userType' in converted && typeof converted.userType === 'string') {
      converted.userType = normalizeToBackendUserType(converted.userType);
    }

    return converted;
  },

  responseToFrontend: <T extends Record<string, any>>(obj: T): T => {
    const converted = { ...obj };

    if ('userType' in converted && typeof converted.userType === 'string') {
      converted.userType = normalizeToFrontendUserType(converted.userType);
    }

    return converted;
  }
});

// Default converter instance
export const apiTypeConverter = createApiTypeConverter();
