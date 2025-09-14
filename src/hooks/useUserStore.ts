import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { api } from '../services/api';
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

  const { isAuthenticated, user } = useAuth();
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
      const token = localStorage.getItem('heartwood_access_token');
      const refreshToken = localStorage.getItem('heartwood_refresh_token');

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
      const authToken = localStorage.getItem('heartwood_access_token');
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
      } catch (axiosError) {
        console.error(
          '❌ Fresh axios failed, trying native fetch:',
          axiosError
        );

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

      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load store information';

      setError(errorMessage);

      // Handle different types of errors
      if (
        errorMessage.includes('Authentication') ||
        errorMessage.includes('log in')
      ) {
        console.log(
          '🔐 Authentication error detected - tokens may be invalid or expired'
        );
        // Clear invalid tokens
        localStorage.removeItem('heartwood_access_token');
        localStorage.removeItem('heartwood_refresh_token');
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        console.log(
          '🔐 401 Unauthorized - may trigger token refresh automatically'
        );
        // Don't clear tokens here, let the axios interceptor handle it
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
  useEffect(() => {
    if (!hasInitializedRef.current && isAuthenticated && user?.email) {
      fetchStores();
    }
  }, [isAuthenticated, user?.email, fetchStores]);

  // Debug logging
  useEffect(() => {
    console.log('🏪 === useUserStore State Update ===');
    console.log('Stores count:', stores.length);
    console.log('Primary store:', primaryStore?.storeId || 'None');
    console.log('Is loading:', isLoading);
    console.log('Error:', error);
    console.log('Is authenticated:', isAuthenticated);
  }, [stores, primaryStore, isLoading, error, isAuthenticated]);

  return {
    stores,
    primaryStore,
    isLoading,
    error,
    refetchStores,
    clearError,
  };
};
