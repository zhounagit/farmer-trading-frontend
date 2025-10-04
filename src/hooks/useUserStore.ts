import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { STORAGE_KEYS } from '../utils/api';
import axios from 'axios';

// Define types inline to avoid import issues
interface Store {
  storeId: number;
  storeName: string;
  description?: string;
  ownerId: number;
  logoUrl?: string;
  bannerUrl?: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseUserStoreReturn {
  stores: Store[];
  primaryStore: Store | null;
  isLoading: boolean;
  error: string | null;
  refetchStores: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook to manage user store data
 * Automatically fetches stores when user is authenticated
 */
export const useUserStore = (): UseUserStoreReturn => {
  const [stores, setStores] = useState<Store[]>([]);
  const [primaryStore, setPrimaryStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user, handleAuthenticationError } = useAuth();
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchStores = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('👤 User not authenticated, skipping store fetch');
      setStores([]);
      setPrimaryStore(null);
      hasInitializedRef.current = true;
      return;
    }

    // Debug token validation
    const authToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('🔍 Token Debug - Token exists:', !!authToken);
    console.log('🔍 Token Debug - Token length:', authToken?.length || 0);
    console.log('🔍 Token Debug - User ID:', user?.userId);

    if (authToken) {
      try {
        // Basic token format validation
        const tokenParts = authToken.split('.');
        console.log('🔍 Token Debug - Token parts count:', tokenParts.length);

        if (tokenParts.length === 3) {
          // Decode payload (without verification)
          const payload = JSON.parse(atob(tokenParts[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          console.log(
            '🔍 Token Debug - Token expires at:',
            new Date(payload.exp * 1000).toISOString()
          );
          console.log(
            '🔍 Token Debug - Current time:',
            new Date(currentTime * 1000).toISOString()
          );
          console.log(
            '🔍 Token Debug - Token expired:',
            payload.exp < currentTime
          );
        }
      } catch (tokenParseError) {
        console.error(
          '❌ Token Debug - Failed to parse token:',
          tokenParseError
        );
      }
    }

    // Add comprehensive debugging utility to window object for troubleshooting
    if (typeof window !== 'undefined') {
      (window as any).debugAuth = () => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        console.log('🔍 AUTH DEBUG UTILITY');
        console.log('====================');
        console.log('Access Token exists:', !!token);
        console.log('Refresh Token exists:', !!refreshToken);
        console.log('User authenticated:', !!user);
        console.log('User ID:', user?.userId);
        console.log('User email:', user?.email);

        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              const exp = new Date(payload.exp * 1000);
              const now = new Date();
              console.log('Token expires:', exp.toISOString());
              console.log('Current time:', now.toISOString());
              console.log('Token expired:', exp < now);
              console.log(
                'Time until expiry:',
                Math.round((exp.getTime() - now.getTime()) / 1000 / 60),
                'minutes'
              );
            }
          } catch (e) {
            console.error('Failed to parse token:', e);
          }
        }

        console.log('====================');
        console.log('Run window.debugAuth() anytime to check auth status');
      };

      // Add API testing utility
      (window as any).testStoreApi = async () => {
        console.log('🧪 TESTING STORE API ENDPOINT');
        console.log('=============================');

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!token) {
          console.error('❌ No auth token found. Please login first.');
          return;
        }

        try {
          const response = await fetch(
            'https://localhost:7008/api/stores/my-stores',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log('Response status:', response.status);
          console.log(
            'Response headers:',
            Object.fromEntries(response.headers.entries())
          );

          if (response.ok) {
            const data = await response.json();
            console.log('✅ SUCCESS - Store data:', data);
          } else {
            const errorText = await response.text();
            console.error('❌ API ERROR:', {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
            });

            if (response.status === 401) {
              console.error(
                '🚨 401 UNAUTHORIZED - Token may be expired or invalid'
              );
              console.log(
                '💡 Try logging out and back in to refresh your session'
              );
            }
          }
        } catch (error) {
          console.error('❌ NETWORK ERROR:', error);
        }

        console.log('=============================');
        console.log('Run window.testStoreApi() to test the API endpoint');
      };

      // Add token refresh utility
      (window as any).refreshAuthToken = async () => {
        console.log('🔄 ATTEMPTING TOKEN REFRESH');
        console.log('===========================');

        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          console.error('❌ No refresh token found. Please login again.');
          return;
        }

        try {
          const response = await fetch(
            'https://localhost:7008/api/auth/refresh',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refreshToken: refreshToken,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem(
                STORAGE_KEYS.REFRESH_TOKEN,
                data.refreshToken
              );
            }
            console.log('✅ Token refreshed successfully');
            console.log('💡 Try your request again now');
          } else {
            const errorText = await response.text();
            console.error('❌ Token refresh failed:', {
              status: response.status,
              body: errorText,
            });
            console.log('💡 Please login again');
          }
        } catch (error) {
          console.error('❌ Token refresh error:', error);
        }

        console.log('===========================');
      };

      console.log('🔧 Debug utilities loaded:');
      console.log('- window.debugAuth() - Check authentication status');
      console.log('- window.testStoreApi() - Test store API endpoint');
      console.log('- window.refreshAuthToken() - Refresh expired token');
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log('🔄 Already fetching stores, skipping duplicate call');
      return;
    }

    console.log('🏪 === useUserStore: Fetching user stores ===');
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Check if authentication tokens exist
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      console.log('🔐 Auth Debug - Token exists:', !!token);
      console.log('🔐 Auth Debug - Refresh token exists:', !!refreshToken);
      console.log('🔐 Auth Debug - User from context:', user?.email);

      if (!token && !refreshToken) {
        console.log('❌ No authentication tokens found');
        setError('No authentication tokens - please log in again');

        // Don't show toast for missing tokens, just log it
        console.log('ℹ️ User appears logged in via context but has no tokens');
        setStores([]);
        setPrimaryStore(null);
        return;
      }

      if (token) {
        try {
          // Decode token to check claims
          const payload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          console.log('🔐 Auth Debug - Token payload:', {
            sub: payload.sub,
            nameid: payload.nameid,
            role: payload.role,
            exp: new Date(payload.exp * 1000),
            expired: isExpired,
          });

          if (isExpired) {
            console.log(
              '⚠️ Token is expired, API call may fail and trigger refresh'
            );
          }
        } catch (e) {
          console.log('🔐 Auth Debug - Token decode error:', e);
        }
      }

      // EXTREME DEBUG: Check what axios instance we're actually using
      console.log('🔍 useUserStore - About to make API call');
      console.log('🔍 api.defaults.baseURL:', api.defaults.baseURL);
      console.log('🔍 window.location.origin:', window.location.origin);
      console.log('🔍 ALL localStorage keys:', Object.keys(localStorage));

      // Check all potential sources of the wrong URL
      console.log('🔍 Environment checks:');
      console.log(
        '  - import.meta.env.VITE_API_BASE_URL:',
        import.meta.env.VITE_API_BASE_URL
      );
      console.log(
        '  - localStorage TEMP_API_BASE_URL:',
        localStorage.getItem('TEMP_API_BASE_URL')
      );
      console.log('  - process.env.NODE_ENV:', import.meta.env.NODE_ENV);

      // EMERGENCY: Create fresh axios instance with EXTREME debugging
      console.log('🆘 CREATING COMPLETELY FRESH AXIOS INSTANCE...');

      const freshAxios = axios.create({
        baseURL: 'https://localhost:7008',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🆘 FRESH AXIOS CREATED WITH CONFIG:', {
        baseURL: freshAxios.defaults.baseURL,
        timeout: freshAxios.defaults.timeout,
        headers: freshAxios.defaults.headers,
      });

      // Add request interceptor to fresh axios to see what URL it actually uses
      freshAxios.interceptors.request.use(
        (config) => {
          console.log('🚨 FRESH AXIOS REQUEST INTERCEPTOR - ACTUAL CONFIG:', {
            baseURL: config.baseURL,
            url: config.url,
            fullUrl: `${config.baseURL}${config.url}`,
            method: config.method,
            headers: config.headers,
          });

          // Ensure HTTPS is being used
          if (!config.baseURL?.startsWith('https://localhost:7008')) {
            console.log(
              '🔧 Ensuring HTTPS URL for fresh axios:',
              config.baseURL
            );
            config.baseURL = 'https://localhost:7008';
          }

          return config;
        },
        (error) => Promise.reject(error)
      );

      // Add token to fresh instance
      const authToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (authToken) {
        freshAxios.defaults.headers.Authorization = `Bearer ${authToken}`;
        console.log('🔐 Fresh axios - Token added:', !!authToken);
      }

      console.log('🆘 ABOUT TO MAKE REQUEST WITH FRESH AXIOS');
      console.log('🆘 Final baseURL check:', freshAxios.defaults.baseURL);

      // Fetch all user stores using fresh axios instance
      let response;
      let userStores: Store[] = [];

      try {
        response = await freshAxios.get('/api/stores/my-stores');
        userStores = response.data;
        console.log('✅ Fresh axios worked:', userStores);
      } catch (axiosError: any) {
        console.error(
          '❌ Fresh axios failed, trying native fetch:',
          axiosError
        );

        // Check if it's an authentication error
        if (axiosError?.response?.status === 401) {
          console.error(
            '❌ Axios authentication failed - token expired or invalid'
          );
          if (
            handleAuthenticationError &&
            handleAuthenticationError(axiosError, navigate)
          ) {
            setError('Your session has expired. Please log in again.');
            setIsLoading(false);
            return; // Exit early if it's an auth error
          }
        }

        // LAST RESORT: Use native fetch API to completely bypass axios
        const fetchUrl = 'https://localhost:7008/api/stores/my-stores';
        console.log('🆘 NATIVE FETCH - Making request to:', fetchUrl);

        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });

        console.log('🆘 NATIVE FETCH - Response status:', fetchResponse.status);
        console.log('🆘 NATIVE FETCH - Response URL:', fetchResponse.url);

        if (!fetchResponse.ok) {
          if (fetchResponse.status === 401) {
            console.error(
              '❌ Authentication failed - token expired or invalid'
            );
            const authError = new Error('Authentication failed');
            (authError as any).response = { status: 401 };

            // Use AuthContext's authentication error handler
            if (
              handleAuthenticationError &&
              handleAuthenticationError(authError, navigate)
            ) {
              setError('Your session has expired. Please log in again.');
              setIsLoading(false);
              return; // Exit early if it's an auth error
            }
          }
          throw new Error(`HTTP error! status: ${fetchResponse.status}`);
        }

        userStores = await fetchResponse.json();
        console.log('✅ Native fetch worked:', userStores);
      }
      console.log('✅ Stores fetched:', userStores);

      setStores(userStores);

      // Set primary store (first active store or first store)
      const activeStore = userStores.find((store) => store.isActive);
      const primary = activeStore || userStores[0] || null;

      setPrimaryStore(primary);
      console.log('🎯 Primary store set:', primary);

      if (userStores.length === 0) {
        console.log('ℹ️ No stores found for user');
      }
    } catch (fetchError) {
      console.error('❌ Failed to fetch user stores:', fetchError);

      // Check if it's an authentication error and handle it properly
      if (
        (fetchError as any)?.response?.status === 401 ||
        (fetchError instanceof Error &&
          fetchError.message.includes('HTTP error! status: 401'))
      ) {
        console.error(
          '❌ Main catch: Authentication failed - token expired or invalid'
        );

        if (
          handleAuthenticationError &&
          handleAuthenticationError(fetchError, navigate)
        ) {
          setError('Your session has expired. Please log in again.');
          setStores([]);
          setPrimaryStore(null);
          setIsLoading(false);
          isFetchingRef.current = false;
          hasInitializedRef.current = true;
          return; // Exit early if it's handled as auth error
        }
      }

      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load store information';

      setError(errorMessage);

      // Handle different types of errors
      if (
        errorMessage.includes('Authentication') ||
        errorMessage.includes('log in') ||
        errorMessage.includes('401')
      ) {
        console.log(
          '🔐 Authentication error detected - tokens may be invalid or expired'
        );
        // Don't show error toast for auth errors, user will be redirected to login
      } else {
        // Only show toast for non-auth errors
        toast.error(`Store Error: ${errorMessage}`);
      }

      // Reset store data on error
      setStores([]);
      setPrimaryStore(null);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      hasInitializedRef.current = true;
    }
  }, [isAuthenticated, user?.email]); // Only depend on specific user property to reduce re-renders

  const refetchStores = useCallback(async () => {
    console.log('🔄 Manual store refetch requested');
    await fetchStores();
  }, [fetchStores]);

  // Auto-fetch stores when authentication state changes (only once per auth state)
  // Add delay to prevent rate limiting during login
  useEffect(() => {
    if (!hasInitializedRef.current && isAuthenticated && user?.email) {
      const timer = setTimeout(() => {
        fetchStores();
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.email, fetchStores]);

  // Removed debug logging to reduce console output and improve performance

  return {
    stores,
    primaryStore,
    isLoading,
    error,
    refetchStores,
    clearError,
  };
};
