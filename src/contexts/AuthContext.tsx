import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { handleApiError, tokenUtils, STORAGE_KEYS } from '../utils/api';
import { apiService } from '../shared/services/api-service';
import {
  API_ENDPOINTS,
  type UserPreferences,
} from '../shared/types/api-contracts';
import type {
  User,
  AuthContextType,
  RegisterData,
  LoginResponse,
} from '../types/auth';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import { handleAuthError, isAuthError } from '../utils/authErrorHandler';
import { useProfile } from '../hooks/useProfile';
import { normalizeToFrontendUserType } from '../utils/typeMapping';
import { profilePictureCache } from '../services/profilePictureCache';
import { GuestCartService } from '../features/cart/services/guestCartStorageService';
import { CartService } from '../features/cart/services/userCartService';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVersion, setUserVersion] = useState(0); // Force re-renders when user data changes

  // User preferences state
  const [userPreferences, setUserPreferences] =
    useState<UserPreferences | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);

  // Note: useProfile hook is not used during login due to state closure issues
  // Profile pictures are fetched directly from API during login

  // Sync profile picture from useProfile hook (for non-login scenarios)
  const { loadProfile, getProfile } = useProfile();

  const syncProfilePicture = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Force reload the profile and get the returned data directly

        const profile = await loadProfile(userId);

        if (profile?.profilePictureUrl) {
          console.log(
            `✅ syncProfilePicture: Got profile picture for user ${userId}: ${profile.profilePictureUrl}`
          );

          // Update user state with the profile picture URL
          setUser((prevUser) => {
            if (!prevUser) {
              return prevUser;
            }

            const updatedUser = {
              ...prevUser,
              profilePictureUrl: profile.profilePictureUrl,
              profilePictureUpdatedAt: Date.now(),
            };

            // Update localStorage to persist the change
            localStorage.setItem(
              STORAGE_KEYS.USER_DATA,
              JSON.stringify(updatedUser)
            );

            return updatedUser;
          });
        }
      } catch (error) {
        console.error('❌ AuthContext: Failed to sync profile picture:', error);
      }
    },
    [loadProfile]
  );

  // Cross-tab login detection
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER_DATA && e.newValue !== e.oldValue) {
        // Another tab has logged in/out, sync our state
        if (e.newValue) {
          try {
            const newUserData = JSON.parse(e.newValue);
            setUser(newUserData);
            toast('Session updated from another tab');
          } catch {
            // Silently handle parsing errors
          }
        } else {
          // User data was cleared (logout)
          setUser(null);
          setError(null);
          toast('Logged out from another tab');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenUtils.getAccessToken();
        const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          // Check if token is expired
          if (tokenUtils.isTokenExpired(token)) {
            tokenUtils.clearAllTokens();
            return;
          }

          const parsedUser = JSON.parse(userData);

          // Normalize user type to handle any variations from localStorage
          const normalizedUser = {
            ...parsedUser,
            userType: normalizeToFrontendUserType(parsedUser.userType),
          };

          // Check if user is active - if not, auto-logout
          if (normalizedUser.isActive === false) {
            console.warn('User account is inactive, auto-logging out');
            tokenUtils.clearAllTokens();
            setUser(null);
            toast.error('Your account has been deactivated');
            return;
          }

          setUser(normalizedUser);

          // Skip profile picture sync - it overrides correct data with stale backend data
        }
      } catch {
        // If parsing fails, clear the invalid data
        tokenUtils.clearAllTokens();
      } finally {
        // Mark initialization as complete
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependencies - only run once on mount

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear all existing tokens and user data before login
      // This prevents issues when users switch accounts in duplicated tabs
      tokenUtils.clearAllTokens();
      setUser(null);
      setError(null);

      // ✅ CRITICAL FIX: Clear profile picture cache before new user login
      // This ensures a clean cache for the new user and prevents stale data from previous users
      profilePictureCache.clearAll();

      const loginRequest: LoginRequest = { email, password };
      const data = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginRequest
      );

      const loginData = data as LoginResponse;
      const userData: User = {
        userId: loginData.userId.toString(),
        email: loginData.email,
        firstName: loginData.firstName || '',
        lastName: loginData.lastName || '',
        userType: normalizeToFrontendUserType(loginData.userType),
        myReferralCode: '', // Will be updated from profile
        hasStore: loginData.hasStore || false,
        profilePictureUrl: loginData.profilePictureUrl, // Use from login response
        isActive: true, // Assume active on login
      };

      // Store token and user data (previous tokens already cleared above)
      tokenUtils.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenUtils.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      // Note: profilePictureUrl comes from login response
      // If null/undefined, it will be synced later by syncProfilePicture

      setUser(userData);

      // Sync profile picture after user is set
      try {
        console.log(
          `🔄 login: Syncing profile picture for user ${userData.userId}`
        );
        await syncProfilePicture(userData.userId.toString());
      } catch (error) {
        console.error(
          '❌ AuthContext: Failed to sync profile picture after login:',
          error
        );
      }

      // Migrate guest cart to authenticated cart if guest cart exists
      await migrateGuestCartToUserCart(parseInt(userData.userId));

      toast.success('Welcome back!');

      return userData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'login');
      setError(errorMessage);

      // Don't show toast for rate limit errors - handled by LoginPage UI
      if ((err as { status?: number })?.status !== 429) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ CRITICAL FIX: Clear profile picture cache for new user registration
      // This ensures a clean cache for the newly registered user
      profilePictureCache.clearAll();
      console.log('🔄 Profile picture cache cleared for new registration');

      const registerRequest: RegisterRequest = {
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        phone: registerData.phone,
        userType: registerData.userType,
        referralCode: registerData.referralCode,
      };
      const responseData = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerRequest
      );

      const registerData_ = responseData as LoginResponse;
      const userData: User = {
        userId: registerData_.userId.toString(),
        email: registerData_.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        userType: registerData_.userType.toLowerCase() as
          | 'customer'
          | 'store_owner'
          | 'admin',
        myReferralCode: '', // Will be updated from profile
        hasStore: registerData_.hasStore || false,
        profilePictureUrl: undefined, // Will be updated from profile
        isActive: true, // Assume active on login
      };

      // Store token and user data
      tokenUtils.setAccessToken(registerData_.accessToken);
      if (registerData_.refreshToken) {
        tokenUtils.setRefreshToken(registerData_.refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      setUser(userData);

      // Migrate guest cart to authenticated cart if guest cart exists
      await migrateGuestCartToUserCart(parseInt(userData.userId));

      toast.success('Account created successfully!');

      return userData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'general');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (message?: string) => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();

      // Call backend logout endpoint if refresh token exists
      if (refreshToken) {
        try {
          await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken });
        } catch {
          // Ignore errors on logout - we're clearing local state regardless
        }
      }
    } finally {
      // ✅ CRITICAL FIX: Clear profile picture cache to prevent stale data when next user logs in
      // This ensures no cross-user cache pollution from previous sessions
      profilePictureCache.clearAll();
      console.log('🔄 Profile picture cache cleared on logout');

      // Always clear local state regardless of API call result
      tokenUtils.clearAllTokens();
      setUser(null);
      setError(null);
      // Profile tracking is now handled internally by useProfile hook
      toast.success(message || 'Logged out successfully');
    }
  };

  const refreshToken = async (): Promise<void> => {
    const refreshTokenValue = tokenUtils.getRefreshToken();

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const data = await apiService.post<{
        accessToken: string;
        refreshToken?: string;
      }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken: refreshTokenValue });

      const refreshData = data as {
        accessToken: string;
        refreshToken?: string;
      };
      tokenUtils.setAccessToken(refreshData.accessToken);
      if (refreshData.refreshToken) {
        tokenUtils.setRefreshToken(refreshData.refreshToken);
      }
    } catch (err) {
      // If refresh fails, logout user
      tokenUtils.clearAllTokens();
      setUser(null);
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateReferralCode = (referralCode: string) => {
    if (user) {
      const updatedUser = { ...user, myReferralCode: referralCode };
      setUser(updatedUser);
    }
  };

  const updateStoreStatus = (hasStore: boolean) => {
    if (user) {
      const updatedUser = { ...user, hasStore };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
    }
  };

  const updateProfile = useCallback(
    (updates: Partial<User>) => {
      if (user) {
        const updatedUser = {
          ...user,
          ...updates,
          // Add a timestamp to force re-renders in all components
          _lastUpdated: Date.now(),
        };

        setUser(updatedUser);
        setUserVersion((prev) => prev + 1); // Force all components to re-render
        localStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(updatedUser)
        );

        // ✅ CRITICAL FIX: Invalidate profile picture cache when profile is updated
        // This ensures the next profile picture load fetches fresh data from the backend
        // instead of using stale cached data, fixing intermittent display issues
        if (updates.profilePictureUrl !== undefined) {
          profilePictureCache.invalidateUser(user.userId);
        }
      }
    },
    [user]
  );

  // Load user preferences function
  const loadUserPreferences = useCallback(async (): Promise<void> => {
    if (!user || isLoadingPreferences) {
      return;
    }

    setIsLoadingPreferences(true);
    setPreferencesError(null);

    try {
      const preferences = await apiService.get<UserPreferences>(
        API_ENDPOINTS.USERS.PREFERENCES(parseInt(user.userId))
      );

      setUserPreferences(preferences as UserPreferences);
      setPreferencesError(null);
    } catch {
      setPreferencesError('Failed to load preferences');
      // Set default preferences on error
      setUserPreferences({
        privacy: {
          showEmail: false,
          showPhone: false,
          allowMessages: true,
        },
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        display: {
          theme: 'auto' as const,
          language: 'en',
          timezone: 'UTC',
        },
        referralCredits: {
          handling: 'bank_transfer',
        },
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [user, isLoadingPreferences]);

  // Update user preferences function
  const updateUserPreferences = useCallback((preferences: UserPreferences) => {
    setUserPreferences(preferences);
  }, []);

  // Load preferences when user changes
  useEffect(() => {
    if (user && !userPreferences && !isLoadingPreferences) {
      loadUserPreferences();
    }
  }, [user, userPreferences, isLoadingPreferences, loadUserPreferences]);

  const refreshUserProfile = async () => {
    if (!user) return;

    const userId = user.userId.toString();

    // Delegate to profile store for data refresh
    try {
      // Force refresh profile data to get updated profile picture
      await loadProfile(userId);

      // Check if user is still active after profile refresh
      // Profile is loaded but not used for isActive check
      getProfile(userId);
      if (user?.isActive === false) {
        console.warn(
          'User account is inactive after profile refresh, auto-logging out'
        );
        await logout('Your account has been deactivated');
        return;
      }

      // Skip profile picture sync - it overrides correct data
    } catch {
      // Silently handle profile refresh errors
    }
  };

  const handleAuthenticationError = (
    error: unknown,
    navigate?: (path: string) => void
  ) => {
    if (isAuthError(error)) {
      // Clear user state
      setUser(null);
      setError('Your session has expired. Please log in again.');

      // Use centralized auth error handler
      handleAuthError(error, navigate);
      return true;
    }
    return false;
  };

  const triggerProfilePictureLoad = async () => {
    if (user) {
      const userId = user.userId.toString();
      await loadProfile(userId);
    }
  };

  const refreshProfilePicture = async (): Promise<void> => {
    if (!user) {
      return;
    }

    const userId = user.userId.toString();

    try {
      // Force reload the profile data
      await loadProfile(userId);

      // Skip profile picture sync - it overrides correct data
    } catch {
      // Silently handle profile refresh errors
    }
  };

  /**
   * Migrate guest cart items to authenticated user cart
   */
  const migrateGuestCartToUserCart = async (userId: number): Promise<void> => {
    try {
      const guestCart = GuestCartService.getCart();

      if (guestCart.items.length === 0) {
        return; // No items to migrate
      }

      // Migrate each item from guest cart to user cart
      let migratedCount = 0;
      for (const guestItem of guestCart.items) {
        try {
          await CartService.addItem(userId, {
            itemId: guestItem.itemId,
            quantity: guestItem.quantity,
          });
          migratedCount++;
        } catch (error) {
          console.warn(
            `🛒 Failed to migrate item ${guestItem.itemId} to user cart:`,
            error
          );
          // Continue with other items even if one fails
        }
      }

      // Clear guest cart after successful migration
      GuestCartService.clearCart();

      if (migratedCount > 0) {
        toast.success(`Your guest cart items have been added to your account`);
      } else {
        console.warn('🛒 No items were successfully migrated');
      }
    } catch (error) {
      console.error('🛒 Guest cart migration failed:', error);
      // Don't show error toast - migration failure shouldn't block login
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && user.isActive !== false,
    isLoading: isLoading || isInitializing,
    userVersion, // Expose version to force component re-renders
    userPreferences,
    isLoadingPreferences,
    preferencesError,
    login,
    register,
    logout,
    refreshToken,
    error,
    clearError,
    updateReferralCode,
    updateStoreStatus,
    updateProfile,
    refreshUserProfile,
    triggerProfilePictureLoad,
    refreshProfilePicture,
    loadUserPreferences,
    updateUserPreferences,
    handleAuthenticationError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
