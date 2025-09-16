import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, handleApiError, tokenUtils, userApi } from '../utils/api';
import { apiService } from '../services/api';
import type { User, AuthContextType, RegisterData } from '../types/auth';
import { handleAuthError, isAuthError } from '../utils/authErrorHandler';
import { initializeProfilePicture } from '../utils/profilePictureStorage';

import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProfilePicture, setIsLoadingProfilePicture] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = tokenUtils.getAccessToken();
    const userData = localStorage.getItem('heartwood_user_data');

    if (token && userData) {
      try {
        // Check if token is expired
        if (tokenUtils.isTokenExpired(token)) {
          tokenUtils.clearAllTokens();
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Always initialize profile picture from localStorage if available
        const storedProfilePicture = initializeProfilePicture(
          parsedUser.userId
        );
        if (storedProfilePicture) {
          parsedUser.profilePictureUrl = storedProfilePicture;
        }

        setUser(parsedUser);

        // Try to load profile picture from backend API
        loadProfilePictureFromBackend(parsedUser);
      } catch (error) {
        // If parsing fails, clear the invalid data
        tokenUtils.clearAllTokens();
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  // Helper function to load profile picture from backend
  const loadProfilePictureFromBackend = async (userData: User) => {
    // Prevent multiple concurrent calls
    if (isLoadingProfilePicture) {
      console.log('🔄 AuthContext: Profile picture already loading, skipping');
      return;
    }

    setIsLoadingProfilePicture(true);
    try {
      const result = await apiService.getUserProfilePicture(
        userData.userId.toString()
      );

      if (result.profilePictureUrl && result.hasProfilePicture) {
        // Update user data if we got a different profile picture URL from backend
        if (result.profilePictureUrl !== userData.profilePictureUrl) {
          const updatedUser = {
            ...userData,
            profilePictureUrl: result.profilePictureUrl,
          };
          setUser(updatedUser);
          localStorage.setItem(
            'heartwood_user_data',
            JSON.stringify(updatedUser)
          );
        }
      }
    } catch (error) {
      // Don't throw error - just log it, we don't want to break the initialization
    } finally {
      setIsLoadingProfilePicture(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authApi.login(email, password);

      const userData: User = {
        userId: data.userId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        referralCode: data.referralCode,
        hasStore: data.hasStore,
      };

      // Always initialize profile picture from localStorage if available
      const storedProfilePicture = initializeProfilePicture(userData.userId);
      if (storedProfilePicture) {
        userData.profilePictureUrl = storedProfilePicture;
      }

      // Store token and user data
      tokenUtils.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenUtils.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem('heartwood_user_data', JSON.stringify(userData));

      setUser(userData);

      // Try to load profile picture from backend API after login
      loadProfilePictureFromBackend(userData);

      toast.success('Welcome back!');
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
      const responseData = await authApi.register(data);

      const userData: User = {
        userId: responseData.userId,
        email: responseData.email,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: 'User', // Default user type
        referralCode: responseData.referralCode,
        hasStore: false,
      };

      // Store token and user data
      tokenUtils.setAccessToken(responseData.accessToken);
      localStorage.setItem('heartwood_user_data', JSON.stringify(userData));

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

  const logout = async () => {
    try {
      const refreshToken = tokenUtils.getRefreshToken();

      // Call backend logout endpoint if refresh token exists
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch (error) {
          // Ignore errors on logout - we're clearing local state regardless
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local state regardless of API call result
      tokenUtils.clearAllTokens();
      setUser(null);
      setError(null);
      toast.success('Logged out successfully');
    }
  };

  const refreshToken = async (): Promise<void> => {
    const refreshTokenValue = tokenUtils.getRefreshToken();

    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const data = await authApi.refresh(refreshTokenValue);

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
      const updatedUser = { ...user, referralCode };
      setUser(updatedUser);
      localStorage.setItem('heartwood_user_data', JSON.stringify(updatedUser));
    }
  };

  const updateStoreStatus = (hasStore: boolean) => {
    if (user) {
      const updatedUser = { ...user, hasStore };
      setUser(updatedUser);
      localStorage.setItem('heartwood_user_data', JSON.stringify(updatedUser));
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('heartwood_user_data', JSON.stringify(updatedUser));
    }
  };

  const refreshUserProfile = async () => {
    if (!user) return;

    try {
      // First try to get profile picture from backend API
      const result = await apiService.getUserProfilePicture(
        user.userId.toString()
      );

      let updatedProfilePictureUrl = user.profilePictureUrl;

      if (result.profilePictureUrl && result.hasProfilePicture) {
        updatedProfilePictureUrl = result.profilePictureUrl;
      } else {
        // Fallback to localStorage if backend doesn't have profile picture
        const storedProfilePicture = initializeProfilePicture(user.userId);
        if (storedProfilePicture) {
          updatedProfilePictureUrl = storedProfilePicture;
        }
      }

      // Only update if the profile picture URL has changed
      if (updatedProfilePictureUrl !== user.profilePictureUrl) {
        const refreshedUser: User = {
          ...user,
          profilePictureUrl: updatedProfilePictureUrl,
        };

        // Update both context and localStorage
        setUser(refreshedUser);
        localStorage.setItem(
          'heartwood_user_data',
          JSON.stringify(refreshedUser)
        );
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);

      // Fallback to localStorage if API call fails
      try {
        const storedProfilePicture = initializeProfilePicture(user.userId);
        if (
          storedProfilePicture &&
          storedProfilePicture !== user.profilePictureUrl
        ) {
          const refreshedUser: User = {
            ...user,
            profilePictureUrl: storedProfilePicture,
          };

          setUser(refreshedUser);
          localStorage.setItem(
            'heartwood_user_data',
            JSON.stringify(refreshedUser)
          );
        }
      } catch (storageError) {
        console.warn(
          'Failed to load profile picture from storage:',
          storageError
        );
      }

      // Don't throw error - just log it, we don't want to break the UI
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
    if (user && !isLoadingProfilePicture) {
      await loadProfilePictureFromBackend(user);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
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
    handleAuthenticationError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
