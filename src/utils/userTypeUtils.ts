// User type utility functions for consistent checking across components

export type UserType = 'customer' | 'store_owner' | 'admin';

export interface UserTypeCheckResult {
  isCustomer: boolean;
  isStoreOwner: boolean;
  isAdmin: boolean;
  normalizedType: UserType;
  rawType: string | undefined;
}

/**
 * Normalize user type string to standard format
 * Handles various possible formats from backend
 */
export const normalizeUserType = (userType: string | undefined): UserType => {
  if (!userType) return 'customer';

  const normalized = userType.toLowerCase().trim();

  // Handle store owner variations
  if (
    normalized === 'store_owner' ||
    normalized === 'storeowner' ||
    normalized === 'store owner' ||
    normalized === 'shop_owner' ||
    normalized === 'shopowner' ||
    normalized === 'seller' ||
    normalized === 'merchant'
  ) {
    return 'store_owner';
  }

  // Handle admin variations
  if (
    normalized === 'admin' ||
    normalized === 'administrator' ||
    normalized === 'superuser' ||
    normalized === 'super_user'
  ) {
    return 'admin';
  }

  // Default to customer for any other value
  return 'customer';
};

/**
 * Check user type with comprehensive analysis
 * Considers both userType field and hasStore flag
 */
export const checkUserType = (
  userType: string | undefined,
  hasStore?: boolean
): UserTypeCheckResult => {
  const rawType = userType;
  let normalizedType = normalizeUserType(userType);

  // If user has a store but type says customer, override to store_owner
  if (hasStore === true && normalizedType === 'customer') {
    normalizedType = 'store_owner';
  }

  return {
    isCustomer: normalizedType === 'customer',
    isStoreOwner: normalizedType === 'store_owner',
    isAdmin: normalizedType === 'admin',
    normalizedType,
    rawType,
  };
};

/**
 * Check if user should see store management features
 */
export const canAccessStoreFeatures = (
  userType: string | undefined,
  hasStore?: boolean
): boolean => {
  const typeCheck = checkUserType(userType, hasStore);
  return typeCheck.isStoreOwner || typeCheck.isAdmin;
};

/**
 * Check if user should see admin features
 */
export const canAccessAdminFeatures = (
  userType: string | undefined
): boolean => {
  const typeCheck = checkUserType(userType);
  return typeCheck.isAdmin;
};

/**
 * Get user role display name for badges and UI
 */
export const getUserRoleDisplayName = (
  userType: string | undefined,
  hasStore?: boolean
): string => {
  const typeCheck = checkUserType(userType, hasStore);

  switch (typeCheck.normalizedType) {
    case 'store_owner':
      return 'Store Owner';
    case 'admin':
      return 'Admin';
    case 'customer':
    default:
      return 'Customer';
  }
};

/**
 * Get user role badge color for consistent UI styling
 */
export const getUserRoleBadgeColor = (
  userType: string | undefined,
  hasStore?: boolean
): string => {
  const typeCheck = checkUserType(userType, hasStore);

  switch (typeCheck.normalizedType) {
    case 'store_owner':
      return '#2e7d32'; // Green
    case 'admin':
      return '#d32f2f'; // Red
    case 'customer':
    default:
      return '#1976d2'; // Blue
  }
};

/**
 * Debug user type information
 * Use this for troubleshooting user type issues
 */
export const debugUserType = (
  userType: string | undefined,
  hasStore?: boolean,
  context?: string
): void => {
  const typeCheck = checkUserType(userType, hasStore);

  console.log(`🔍 User type debug${context ? ` (${context})` : ''}:`, {
    rawType: typeCheck.rawType,
    normalizedType: typeCheck.normalizedType,
    hasStore,
    isCustomer: typeCheck.isCustomer,
    isStoreOwner: typeCheck.isStoreOwner,
    isAdmin: typeCheck.isAdmin,
    canAccessStoreFeatures: canAccessStoreFeatures(userType, hasStore),
    displayName: getUserRoleDisplayName(userType, hasStore),
    badgeColor: getUserRoleBadgeColor(userType, hasStore),
  });
};

/**
 * Direct admin check helper (case-insensitive)
 * Use this for direct admin checks without store logic
 */
export const isAdminUser = (userType: string | undefined): boolean => {
  return userType?.toLowerCase() === 'admin';
};

/**
 * Get dashboard metric labels based on user type
 * Returns different labels for different user types
 */
export const getDashboardMetricLabels = (
  userType: string | undefined,
  hasStore?: boolean
) => {
  const typeCheck = checkUserType(userType, hasStore);

  if (typeCheck.isStoreOwner) {
    return {
      spentLabel: 'Total Transactions',
      spentDescription: 'Total transaction volume from your store',
    };
  } else if (typeCheck.isCustomer) {
    return {
      spentLabel: 'Total Referral Credit',
      spentDescription: 'Credits earned from referrals',
    };
  } else {
    // Default for admin or other types
    return {
      spentLabel: 'Total Spent',
      spentDescription: 'Total amount spent on platform',
    };
  }
};
