import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi, handleApiError, tokenUtils } from '../utils/api';
import type { User, AuthContextType, RegisterData } from '../types/auth';
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
        setUser(parsedUser);
      } catch (error) {
        // If parsing fails, clear the invalid data
        tokenUtils.clearAllTokens();
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

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
      };

      // Store token and user data
      tokenUtils.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenUtils.setRefreshToken(data.refreshToken);
      }
      localStorage.setItem('heartwood_user_data', JSON.stringify(userData));

      setUser(userData);
      toast.success('Welcome back!');
    } catch (err) {
      const errorMessage = handleApiError(err);
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
      };

      // Store token and user data
      tokenUtils.setAccessToken(responseData.accessToken);
      localStorage.setItem('heartwood_user_data', JSON.stringify(userData));

      setUser(userData);
      toast.success('Account created successfully!');
    } catch (err) {
      const errorMessage = handleApiError(err);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
