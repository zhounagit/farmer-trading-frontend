/**
 * Standardized auth types that use consistent conventions
 * Uses frontend format internally and converts to backend format when needed
 */

import type { BackendUserType, FrontendUserType } from '../utils/typeMapping';

// Standard user type format for frontend use (snake_case)
export type UserType = FrontendUserType;

// Base user interface using frontend conventions
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Login request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

// Register request/response types (for frontend use)
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

// Backend API types (what gets sent to/from the server)
export interface BackendRegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: BackendUserType;
  phone?: string;
  referralCode?: string;
}

export interface BackendLoginResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: BackendUserType;
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

export interface BackendUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: BackendUserType;
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Form data interfaces
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  referralCode?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
}

// Auth context interface
export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing?: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;

  // User management
  updateProfile: (updates: Partial<User>) => void;
  updateReferralCode: (referralCode: string) => void;
  updateStoreStatus: (hasStore: boolean) => void;
  refreshUserProfile: () => Promise<void>;
  triggerProfilePictureLoad?: () => Promise<void>;
  refreshProfilePicture?: () => Promise<void>;

  // Error handling
  handleAuthenticationError: (
    error: unknown,
    navigate?: (path: string) => void
  ) => boolean;
}

// Auth validation errors
export interface AuthValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  general?: string;
}

// Auth events for analytics/tracking
export type AuthEvent =
  | 'auth:login:success'
  | 'auth:login:failed'
  | 'auth:register:success'
  | 'auth:register:failed'
  | 'auth:logout'
  | 'auth:token:refreshed'
  | 'auth:token:expired'
  | 'auth:session:restored';

export interface AuthEventData {
  event: AuthEvent;
  userType?: UserType;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Token management
export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expires: string;
}

// Password management
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Profile management
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}

export interface UserProfile extends User {
  // Extended profile fields
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  display: DisplayPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
}

// Permission and role checking
export interface UserPermissions {
  canCreateStore: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canAccessAdmin: boolean;
  canModerateContent: boolean;
}

// Session management
export interface SessionInfo {
  userId: string;
  sessionId: string;
  expiresAt: string;
  lastActivity: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    location?: string;
  };
}

// Export commonly used type guards and utilities
export const isValidUserType = (userType: string): userType is UserType => {
  return ['customer', 'store_owner', 'admin'].includes(userType as UserType);
};

export const isValidBackendUserType = (
  userType: string
): userType is BackendUserType => {
  return ['Customer', 'StoreOwner', 'Admin'].includes(
    userType as BackendUserType
  );
};

// Default values
export const DEFAULT_USER_TYPE: UserType = 'customer';
export const DEFAULT_BACKEND_USER_TYPE: BackendUserType = 'Customer';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
  marketing: false,
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferences = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: 'auto',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};
