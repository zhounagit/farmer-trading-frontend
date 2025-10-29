import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { normalizeToFrontendUserType } from '../utils/typeMapping';

import { STORAGE_KEYS } from '../utils/api';
import axios from 'axios';

// Define types inline to avoid import issues
interface Store {
  storeId: number;
  store_id?: number; // Handle snake_case from backend
  storeName: string;
  store_name?: string; // Handle snake_case from backend
  description?: string;
  storeCreatorId: number;
  store_creator_id?: number; // Handle snake_case from backend
  approvalStatus: string;
  approval_status?: string; // Handle snake_case from backend
  createdAt: string;
  created_at?: string; // Handle snake_case from backend
  updatedAt: string;
  updated_at?: string; // Handle snake_case from backend
  contactPhone?: string;
  contact_phone?: string; // Handle snake_case from backend
  contactEmail?: string;
  contact_email?: string; // Handle snake_case from backend
  storeType: string;
  store_type?: string; // Handle snake_case from backend
  deliveryRadiusMi?: number;
  delivery_radius_mi?: number; // Handle snake_case from backend
  slug?: string;
  canProduce: boolean;
  can_produce?: boolean;
  canProcess: boolean;
  can_process?: boolean;
  canRetail: boolean;
  can_retail?: boolean;
  partnershipRadiusMi: number;
  partnership_radius_mi?: number;
  autoAcceptPartnerships: boolean;
  auto_accept_partnerships?: boolean;
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

  const {
    isAuthenticated,
    user,
    handleAuthenticationError,
    updateStoreStatus,
  } = useAuth();
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

    // Only fetch stores for StoreOwner users
    // Use proper normalization to handle all user type variations

    const normalizedUserType = normalizeToFrontendUserType(user.userType);

    if (normalizedUserType !== 'store_owner') {
      console.log(
        `👤 User type "${user.userType}" (normalized: "${normalizedUserType}") - skipping store fetch`
      );
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

        // Handle different API response formats
        // Format 1: { data: [...], success: true } (wrapped response)
        // Format 2: [...] (direct array response)
        if (response.data && Array.isArray(response.data)) {
          userStores = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          userStores = response.data.data;
        } else if (response.data && response.data.success !== undefined) {
          // Look for stores array in various possible locations
          userStores = response.data.stores || response.data.data || [];
        } else {
          userStores = [];
        }

        // Normalize store data to handle both camelCase and snake_case fields
        if (userStores && Array.isArray(userStores)) {
          userStores = userStores.map((store) => {
            const normalizedStore = {
              storeId: store.storeId || store.store_id,
              storeName: store.storeName || store.store_name,
              description: store.description,
              storeCreatorId: store.storeCreatorId || store.store_creator_id,
              approvalStatus: store.approvalStatus || store.approval_status,
              createdAt: store.createdAt || store.created_at,
              updatedAt: store.updatedAt || store.updated_at,
              contactPhone: store.contactPhone || store.contact_phone,
              contactEmail: store.contactEmail || store.contact_email,
              storeType: store.storeType || store.store_type,
              deliveryRadiusMi:
                store.deliveryRadiusMi || store.delivery_radius_mi,
              slug: store.slug,
              canProduce: store.canProduce || store.can_produce || false,
              canProcess: store.canProcess || store.can_process || false,
              canRetail: store.canRetail || store.can_retail || true,
              partnershipRadiusMi:
                store.partnershipRadiusMi || store.partnership_radius_mi || 50,
              autoAcceptPartnerships:
                store.autoAcceptPartnerships ||
                store.auto_accept_partnerships ||
                false,
            };

            return normalizedStore;
          });
        }
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

        const fetchResponseData = await fetchResponse.json();
        console.log('✅ Native fetch worked - Response:', {
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          url: fetchResponse.url,
          data: fetchResponseData,
        });
        // Handle wrapped API response format: { data: [...], success: true }
        userStores = fetchResponseData.data;
        console.log('✅ Native fetch worked - userStores:', userStores);
        console.log(
          '✅ Native fetch worked - userStores type:',
          typeof userStores
        );
        console.log(
          '✅ Native fetch worked - userStores length:',
          userStores?.length
        );
        console.log(
          '✅ Native fetch worked - userStores is array:',
          Array.isArray(userStores)
        );
      }

      if (userStores && Array.isArray(userStores)) {
      } else {
        console.log('❌ userStores is not an array:', userStores);
      }

      setStores(userStores);

      // Set primary store (use first store since there's no is_primary column)
      const primary = userStores[0] || null;

      setPrimaryStore(primary);
      console.log('🎯 Primary store set:', primary);

      // Update store status in auth context
      const hasStores = userStores.length > 0;
      if (updateStoreStatus && user?.hasStore !== hasStores) {
        console.log(`🔄 Updating store status: ${hasStores}`);
        updateStoreStatus(hasStores);
      }

      if (userStores.length === 0) {
        console.log('ℹ️ No stores found for user');
      } else {
        console.log(`📊 Found ${userStores.length} stores for user`);
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
  }, [isAuthenticated, user, handleAuthenticationError, navigate]); // Include all dependencies used in fetchStores

  const refetchStores = useCallback(async () => {
    console.log('🔄 Manual store refetch requested');
    await fetchStores();
  }, [fetchStores]);

  // Auto-fetch stores when authentication state changes (only once per auth state)
  // Only fetch stores for StoreOwner users - customers don't have stores
  useEffect(() => {
    if (!hasInitializedRef.current && isAuthenticated && user?.email) {
      // Only fetch stores for StoreOwner users
      if (normalizeToFrontendUserType(user.userType) === 'store_owner') {
        const timer = setTimeout(() => {
          fetchStores();
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
      } else {
        // For non-StoreOwner users (Customers, Admins), set empty stores and mark as initialized
        console.log(`👤 User type "${user.userType}" - skipping store fetch`);
        setStores([]);
        setPrimaryStore(null);
        hasInitializedRef.current = true;
      }
    }
  }, [isAuthenticated, user?.email, user?.userType, fetchStores]);

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
