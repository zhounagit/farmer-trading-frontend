// Consolidated Auth Types - Single Source of Truth

export interface User {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;

  // Preferences
  preferences?: UserPreferences;

  // Profile completion
  profileCompletionPercentage?: number;
  requiredFields?: string[];
}

export interface UserProfile extends User {
  // Extended profile information
  bio?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Address information
  addresses?: UserAddress[];

  // Business information
  businessName?: string;
  businessType?: string;
  taxId?: string;
}

export interface UserAddress {
  addressId: number;
  userId: number;
  addressType: 'home' | 'business' | 'billing' | 'shipping';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
    partnershipRequests: boolean;
    inventoryAlerts: boolean;
  };
  push: {
    orderUpdates: boolean;
    partnershipRequests: boolean;
    inventoryAlerts: boolean;
    messages: boolean;
  };
  sms: {
    orderUpdates: boolean;
    emergencyAlerts: boolean;
  };
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'contacts_only';
  showEmailInProfile: boolean;
  showPhoneInProfile: boolean;
  allowDirectMessages: boolean;
  allowPartnershipRequests: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  accessToken: string;
  refreshToken: string;
  expires: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'customer' | 'store_owner' | 'admin';
  referralCode?: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  accessToken: string;
  refreshToken: string;
  expires: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  refreshExpiresAt?: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAllDevices?: boolean;
}

// Password Management
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  requiresLogin: boolean;
}

// Email/Phone Verification
export interface EmailVerificationRequest {
  token: string;
}

export interface PhoneVerificationRequest {
  code: string;
  phoneNumber: string;
}

export interface ResendVerificationRequest {
  type: 'email' | 'phone';
  contact: string;
}

// Profile Management
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  phoneNumber?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UpdatePreferencesRequest {
  preferences: Partial<UserPreferences>;
}

export interface ProfilePictureUploadResponse {
  profilePictureUrl: string;
  thumbnailUrl?: string;
}

// Session Management
export interface Session {
  sessionId: string;
  userId: number;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  isCurrent: boolean;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
}

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

// Two-Factor Authentication
export interface TwoFactorSetupRequest {
  method: '2fa_app' | 'sms' | 'email';
  phoneNumber?: string;
}

export interface TwoFactorSetupResponse {
  secret?: string;
  qrCodeUrl?: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
  method: '2fa_app' | 'sms' | 'email';
}

export interface TwoFactorLoginRequest {
  token: string; // Temporary token from initial login
  code: string;
  method: '2fa_app' | 'sms' | 'email';
  rememberDevice?: boolean;
}

// Account Management
export interface DeactivateAccountRequest {
  password: string;
  reason: string;
  feedback?: string;
}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // Must match "DELETE MY ACCOUNT"
  reason: string;
  feedback?: string;
}

// Enums and Constants
export type UserRole =
  | 'user'
  | 'farmer'
  | 'processor'
  | 'retailer'
  | 'admin'
  | 'moderator';
export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending_verification'
  | 'deactivated';

export const USER_ROLES: {
  value: UserRole;
  label: string;
  description: string;
}[] = [
  { value: 'user', label: 'User', description: 'Basic user account' },
  { value: 'farmer', label: 'Farmer', description: 'Agricultural producer' },
  {
    value: 'processor',
    label: 'Processor',
    description: 'Food processor/manufacturer',
  },
  { value: 'retailer', label: 'Retailer', description: 'Retail seller' },
  {
    value: 'admin',
    label: 'Administrator',
    description: 'System administrator',
  },
  { value: 'moderator', label: 'Moderator', description: 'Content moderator' },
];

// Auth State Types (for stores)
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: string | null;
  tokenExpiresAt: string | null;
  requiresTwoFactor: boolean;
  twoFactorToken: string | null;
}

// JWT Token Payload
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  username: string;
  role: UserRole;
  iat: number; // issued at
  exp: number; // expires at
  aud: string; // audience
  iss: string; // issuer
}

// Auth Events (for event system)
export type AuthEvent =
  | 'auth:login'
  | 'auth:logout'
  | 'auth:register'
  | 'auth:token_refresh'
  | 'auth:session_expired'
  | 'auth:profile_updated'
  | 'auth:password_changed'
  | 'auth:email_verified'
  | 'auth:phone_verified'
  | 'auth:two_factor_enabled'
  | 'auth:two_factor_disabled';

export interface AuthEventData {
  type: AuthEvent;
  userId?: number;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Form Validation Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent: boolean;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  website: string;
  businessName: string;
  businessType: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

// Validation Errors
export interface AuthValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  acceptPrivacy?: string;
  currentPassword?: string;
  newPassword?: string;
  bio?: string;
  website?: string;
}

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  language: 'en',
  timezone: 'America/New_York',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  theme: 'light',
  notifications: {
    email: {
      orderUpdates: true,
      promotions: false,
      newsletter: false,
      partnershipRequests: true,
      inventoryAlerts: true,
    },
    push: {
      orderUpdates: true,
      partnershipRequests: true,
      inventoryAlerts: true,
      messages: true,
    },
    sms: {
      orderUpdates: false,
      emergencyAlerts: true,
    },
  },
  privacy: {
    profileVisibility: 'public',
    showEmailInProfile: false,
    showPhoneInProfile: false,
    allowDirectMessages: true,
    allowPartnershipRequests: true,
  },
};
