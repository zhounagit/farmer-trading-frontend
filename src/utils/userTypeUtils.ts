// User type utility functions for consistent checking across components

export type UserType = 'Customer' | 'Store Owner' | 'Admin';

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
  if (!userType) return 'Customer';

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
    return 'Store Owner';
  }

  // Handle admin variations
  if (
    normalized === 'admin' ||
    normalized === 'administrator' ||
    normalized === 'superuser' ||
    normalized === 'super_user'
  ) {
    return 'Admin';
  }

  // Default to customer for any other value
  return 'Customer';
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
  if (hasStore === true && normalizedType === 'Customer') {
    normalizedType = 'Store Owner';
  }

  return {
    isCustomer: normalizedType === 'Customer',
    isStoreOwner: normalizedType === 'Store Owner',
    isAdmin: normalizedType === 'Admin',
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
    case 'Store Owner':
      return 'Store Owner';
    case 'Admin':
      return 'Admin';
    case 'Customer':
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
    case 'Store Owner':
      return '#2e7d32'; // Green
    case 'Admin':
      return '#d32f2f'; // Red
    case 'Customer':
    default:
      return '#1976d2'; // Blue
  }
};

/**
 * Direct admin check helper (case-insensitive)
 * Use this for direct admin checks without store logic
 */
export const isAdminUser = (userType: string | undefined): boolean => {
  return userType === 'Admin';
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
