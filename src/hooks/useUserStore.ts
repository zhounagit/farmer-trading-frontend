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
      setStores([]);
      setPrimaryStore(null);
      hasInitializedRef.current = true;
      return;
    }

    // Only fetch stores for StoreOwner users
    // Use proper normalization to handle all user type variations

    const normalizedUserType = normalizeToFrontendUserType(user.userType);

    if (normalizedUserType !== 'store_owner') {
      setStores([]);
      setPrimaryStore(null);
      hasInitializedRef.current = true;
      return;
    }

    const authToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (authToken) {
      try {
        // Basic token format validation
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          // Decode payload (without verification)
        }
      } catch (tokenParseError) {
        // Token parsing error - continue with request
      }
    }

    // Prevent duplicate calls
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Check if authentication tokens exist
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!token && !refreshToken) {
        setError('No authentication tokens - please log in again');
        setStores([]);
        setPrimaryStore(null);
        return;
      }

      if (token) {
        try {
          // Decode token to check claims
        } catch (e) {
          // Token decode error - continue with request
        }
      }

      const freshAxios = axios.create({
        baseURL: 'https://localhost:7008',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor to fresh axios
      freshAxios.interceptors.request.use(
        (config) => {
          // Ensure HTTPS is being used
          if (!config.baseURL?.startsWith('https://localhost:7008')) {
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
      }

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
              storeId: store.storeId || store.store_id || 0,
              storeName: store.storeName || store.store_name || 'Unnamed Store',
              description: store.description,
              storeCreatorId:
                store.storeCreatorId || store.store_creator_id || 0,
              approvalStatus:
                store.approvalStatus || store.approval_status || 'pending',
              createdAt:
                store.createdAt || store.created_at || new Date().toISOString(),
              updatedAt:
                store.updatedAt || store.updated_at || new Date().toISOString(),
              contactPhone: store.contactPhone || store.contact_phone || '',
              contactEmail: store.contactEmail || store.contact_email || '',
              storeType: store.storeType || store.store_type || 'general',
              deliveryRadiusMi:
                store.deliveryRadiusMi || store.delivery_radius_mi || 0,
              slug: store.slug || '',
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
        // Check if it's an authentication error
        if (axiosError?.response?.status === 401) {
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

        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });

        if (!fetchResponse.ok) {
          if (fetchResponse.status === 401) {
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
        // Handle wrapped API response format: { data: [...], success: true }
        userStores = fetchResponseData.data;
      }

      if (userStores && Array.isArray(userStores)) {
        // Normalize store data to handle both camelCase and snake_case fields
        userStores = userStores.map((store) => {
          const normalizedStore = {
            storeId: store.storeId || store.store_id || 0,
            storeName: store.storeName || store.store_name || 'Unnamed Store',
            description: store.description,
            storeCreatorId: store.storeCreatorId || store.store_creator_id || 0,
            approvalStatus:
              store.approvalStatus || store.approval_status || 'pending',
            createdAt:
              store.createdAt || store.created_at || new Date().toISOString(),
            updatedAt:
              store.updatedAt || store.updated_at || new Date().toISOString(),
            contactPhone: store.contactPhone || store.contact_phone || '',
            contactEmail: store.contactEmail || store.contact_email || '',
            storeType: store.storeType || store.store_type || 'general',
            deliveryRadiusMi:
              store.deliveryRadiusMi || store.delivery_radius_mi || 0,
            slug: store.slug || '',
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

      setStores(userStores);

      // Set primary store (use first store since there's no is_primary column)
      const primary = userStores[0] || null;

      setPrimaryStore(primary);

      // Update store status in auth context
      const hasStores = userStores.length > 0;
      if (updateStoreStatus && user?.hasStore !== hasStores) {
        updateStoreStatus(hasStores);
      }
    } catch (fetchError) {
      // Check if it's an authentication error and handle it properly
      if (
        (fetchError as any)?.response?.status === 401 ||
        (fetchError instanceof Error &&
          fetchError.message.includes('HTTP error! status: 401'))
      ) {
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
      const normalizedUserType = normalizeToFrontendUserType(user.userType);
      if (normalizedUserType === 'store_owner') {
        const timer = setTimeout(() => {
          fetchStores();
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
      } else {
        // For non-StoreOwner users (Customers, Admins), set empty stores and mark as initialized
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
