export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'customer' | 'store_owner' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  suffix?: string;
  workPhone?: string;
  referralCode?: string;
  shippingAddressId?: number;
  billingAddressId?: number;
  profilePictureUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'store_owner';
  title?: string;
  suffix?: string;
  workPhone?: string;
  referralCode?: string;
  agreeToTerms: boolean;
  agreeToMarketing?: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  suffix?: string;
  workPhone?: string;
  profilePictureUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
}

export interface TokenPayload {
  userId: number;
  email: string;
  userType: string;
  exp: number;
  iat: number;
  jti: string;
}

// Permission and role types
export type Permission =
  | 'read:users'
  | 'write:users'
  | 'read:stores'
  | 'write:stores'
  | 'read:inventory'
  | 'write:inventory'
  | 'read:orders'
  | 'write:orders'
  | 'read:reviews'
  | 'write:reviews'
  | 'admin:all';

export type UserRole = 'customer' | 'store_owner' | 'admin';

export interface RolePermissions {
  [key: string]: Permission[];
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// Login form validation
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

// Registration form validation
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'store_owner';
  title: string;
  suffix: string;
  workPhone: string;
  referralCode: string;
  agreeToTerms: boolean;
  agreeToMarketing: boolean;
}

// Password reset form validation
export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Profile update form validation
export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  title: string;
  suffix: string;
  workPhone: string;
  profilePictureUrl: string;
}

// Two-factor authentication types (for future use)
export interface TwoFactorSetupRequest {
  password: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  backupCodes: string[];
  secret: string;
}

export interface TwoFactorVerifyRequest {
  code: string;
  password: string;
}

export interface TwoFactorLoginRequest extends LoginRequest {
  twoFactorCode?: string;
}

// Session management
export interface SessionInfo {
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  location?: string;
  lastActive: string;
  isCurrentSession: boolean;
}

// Account verification
export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}
