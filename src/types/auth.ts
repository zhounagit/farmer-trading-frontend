import type { UserPreferences } from '../shared/types/api-contracts';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  accessToken: string;
  refreshToken?: string;
  expires: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  phone?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  accessToken: string;
  expires: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  phone?: string;
  referralCode?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userVersion: number;
  userPreferences: UserPreferences | null;
  isLoadingPreferences: boolean;
  preferencesError: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  updateReferralCode: (referralCode: string) => void;
  updateStoreStatus: (hasStore: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
  triggerProfilePictureLoad: () => Promise<void>;
  refreshProfilePicture: () => Promise<void>;
  loadUserPreferences: () => Promise<void>;
  updateUserPreferences: (preferences: UserPreferences) => void;
  handleAuthenticationError: (
    error: unknown,
    navigate?: (path: string) => void
  ) => boolean;
}
