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
import type { User, AuthContextType, RegisterData } from '../types/auth';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
} from '../types/auth';
import { handleAuthError, isAuthError } from '../utils/authErrorHandler';
import { useProfile } from '../hooks/useProfile';
import { normalizeToFrontendUserType } from '../utils/typeMapping';
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

  // Use the profile hook for profile picture management
  const { loadProfile, getProfile } = useProfile();

  // Controlled profile picture sync - only update user when explicitly needed
  const syncProfilePicture = useCallback(
    async (userId: string): Promise<void> => {
      try {
        // Force reload the profile to ensure we have the latest data
        await loadProfile(userId);

        // Give the profile hook a moment to update
        await new Promise((resolve) => setTimeout(resolve, 100));

        const profile = getProfile(userId);

        if (profile?.profilePictureUrl) {
          // Only update user if profile picture URL actually changed
          setUser((prevUser) => {
            if (!prevUser) {
              return prevUser;
            }

            // Always update when we have a valid profile picture URL
            // This ensures components get the latest data even if URL appears unchanged
            // (URLs might be the same but components need refresh)

            const updatedUser = {
              ...prevUser,
              profilePictureUrl: profile.profilePictureUrl,
              profilePictureUpdatedAt: Date.now(), // Add timestamp to force re-renders
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
        console.warn('AuthContext: Failed to sync profile picture:', error);
      }
    },
    [loadProfile, getProfile]
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
      const loginRequest: LoginRequest = { email, password };
      const data = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginRequest
      );

      const userData: User = {
        userId: data.userId.toString(),
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        userType: normalizeToFrontendUserType(data.userType),
        myReferralCode: '', // Will be updated from profile
        hasStore: data.hasStore || false,
        profilePictureUrl: data.profilePictureUrl, // Use from login response
        isActive: true, // Assume active on login
      };

      // Store token and user data (previous tokens already cleared above)
      tokenUtils.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenUtils.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      setUser(userData);

      // Load profile data and sync profile picture
      try {
        // Syncing profile picture after login for user ${userData.userId}
        await syncProfilePicture(userData.userId.toString());
      } catch (error) {
        console.warn(
          'AuthContext: Failed to sync profile picture after login:',
          error
        );
      }

      toast.success('Welcome back!');

      return userData;
    } catch (err) {
      const errorMessage = handleApiError(err, 'login');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const registerRequest: RegisterRequest = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: data.userType,
        referralCode: data.referralCode,
      };
      const responseData = await apiService.post<LoginResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerRequest
      );

      const userData: User = {
        userId: responseData.userId.toString(),
        email: responseData.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: responseData.userType.toLowerCase() as
          | 'customer'
          | 'store_owner'
          | 'admin',
        myReferralCode: '', // Will be updated from profile
        hasStore: responseData.hasStore || false,
        profilePictureUrl: undefined, // Will be updated from profile
        isActive: true, // Assume active on login
      };

      // Store token and user data
      tokenUtils.setAccessToken(responseData.accessToken);
      if (responseData.refreshToken) {
        tokenUtils.setRefreshToken(responseData.refreshToken);
      }
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      setUser(userData);
      toast.success('Account created successfully!');
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

      tokenUtils.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenUtils.setRefreshToken(data.refreshToken);
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
      } else {
      }
    },
    [user, userVersion]
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

      setUserPreferences(preferences);
      setPreferencesError(null);
    } catch (error: unknown) {
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
    } catch (error) {}
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
