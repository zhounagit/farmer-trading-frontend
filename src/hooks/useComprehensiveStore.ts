import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApiMapper } from '../services/api-mapper';
import OpenShopApiService from '../features/stores/services/open-shop.api';
import { StoresApiService } from '../shared/services';
import type { EnhancedStoreDto } from '../features/stores/services/open-shop.types';
import type {
  StoreAddress,
  StoreAddressRequest,
  UpdateStoreRequest,
  StoreType,
} from '../shared/types/store';
import toast from 'react-hot-toast';

interface UseComprehensiveStoreOptions {
  storeId?: number;
  autoFetch?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
}

interface UseComprehensiveStoreReturn {
  storeData: EnhancedStoreDto | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;

  // Data fetching
  fetchStoreData: (storeId?: number) => Promise<void>;
  refetchStoreData: () => Promise<void>;

  // Store updates
  updateStore: (updateData: Partial<EnhancedStoreDto>) => Promise<void>;
  updateStoreAddress: (
    addressId: number,
    addressData: Partial<StoreAddress>
  ) => Promise<void>;
  createStoreAddress: (addressData: StoreAddress) => Promise<void>;
  // updateStoreOpenHours: () => Promise<void>;
  // updateStorePaymentMethods: () => Promise<void>;

  // Utility functions
  clearError: () => void;
  getCompletionPercentage: () => number;
  hasRequiredData: () => boolean;
  getFormattedBusinessHours: () => Record<string, string>;
}

export const useComprehensiveStore = (
  options: UseComprehensiveStoreOptions = {}
): UseComprehensiveStoreReturn => {
  const {
    storeId,
    autoFetch = true,
    enablePolling = false,
    pollingInterval = 30000, // 30 seconds
  } = options;

  const { isAuthenticated } = useAuth();
  const [storeData, setStoreData] = useState<EnhancedStoreDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchStoreData = useCallback(
    async (targetStoreId?: number) => {
      const currentStoreId = targetStoreId || storeId;

      if (!currentStoreId) {
        console.log('⚠️ useComprehensiveStore: No store ID provided');
        return;
      }

      if (!isAuthenticated) {
        console.log('⚠️ useComprehensiveStore: User not authenticated');
        return;
      }

      if (isFetchingRef.current) {
        console.log('⚠️ useComprehensiveStore: Already fetching, skipping...');
        return;
      }

      console.log(
        '🏪 === useComprehensiveStore: Fetching comprehensive store data ==='
      );
      console.log('Store ID:', currentStoreId);

      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const comprehensiveData =
          await OpenShopApiService.getComprehensiveStoreDetails(currentStoreId);

        console.log(
          '✅ Comprehensive store data fetched successfully:',
          comprehensiveData
        );
        setStoreData(comprehensiveData);
        setError(null);
      } catch (error: unknown) {
        console.error('❌ Failed to fetch comprehensive store data:', error);

        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error as Error)?.message ||
          'Failed to load store data';
        setError(errorMessage);

        // Don't clear store data on error, keep showing last known good data
        if (!storeData) {
          toast.error(`Failed to load store data: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [storeId, isAuthenticated, storeData]
  );

  const refetchStoreData = useCallback(async () => {
    await fetchStoreData();
  }, [fetchStoreData]);

  const updateStore = useCallback(
    async (updateData: Partial<EnhancedStoreDto>) => {
      if (!storeData) {
        toast.error('No store data available to update');
        return;
      }

      console.log('🔄 === useComprehensiveStore: Updating store ===');
      console.log('Update data:', updateData);

      setIsUpdating(true);
      setError(null);

      try {
        // Cast updateData to UpdateStoreRequest, ensuring storeType is properly typed
        const updatePayload: Partial<UpdateStoreRequest> = {
          ...updateData,
          storeType: updateData.storeType as StoreType | undefined,
        };
        await StoresApiService.updateStore(storeData.storeId, updatePayload);

        // Update local state optimistically
        setStoreData((prev: EnhancedStoreDto | null) =>
          prev
            ? {
                ...prev,
                ...updateData,
              }
            : null
        );

        toast.success('Store updated successfully!');

        // Refetch to get latest data
        setTimeout(() => {
          fetchStoreData();
        }, 1000);
      } catch (error: unknown) {
        console.error('❌ Failed to update store:', error);
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error as Error)?.message ||
          'Failed to update store';
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [storeData, fetchStoreData]
  );

  const createStoreAddress = useCallback(
    async (addressData: Partial<StoreAddress>) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('📍 === useComprehensiveStore: Creating store address ===');

      setIsUpdating(true);
      setError(null);

      try {
        // Convert StoreAddress to backend format using ApiMapper
        const backendRequest =
          ApiMapper.toPascalCase<StoreAddressRequest>(addressData);

        await StoresApiService.createStoreAddress(
          storeData.storeId,
          backendRequest
        );
        toast.success('Address added successfully!');

        // Refetch to get updated address data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to create address:', error);
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error as Error)?.message ||
          'Failed to add address';
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [storeData, fetchStoreData]
  );

  const updateStoreAddress = useCallback(
    async (addressId: number, addressData: Partial<StoreAddress>) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('📍 === useComprehensiveStore: Updating store address ===');

      setIsUpdating(true);
      setError(null);

      try {
        // Convert StoreAddress to StoreAddressRequest
        // Convert StoreAddress to backend format using ApiMapper
        const backendRequest =
          ApiMapper.toPascalCase<StoreAddressRequest>(addressData);

        await StoresApiService.updateStoreAddress(
          storeData.storeId,
          addressId,
          backendRequest
        );
        toast.success('Address updated successfully!');

        // Refetch to get updated address data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to update address:', error);
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (error as Error)?.message ||
          'Failed to update address';
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [storeData, fetchStoreData]
  );

  // const updateStoreOpenHours = useCallback(async () => {
  //   if (!storeData) {
  //     toast.error('No store data available');
  //     return;
  //   }

  //   console.log('🕒 === useComprehensiveStore: Updating open hours ===');

  //   setIsUpdating(true);
  //   setError(null);

  //   try {
  //     await StoresApiService.updateStoreOpenHours(storeData.storeId);
  //     toast.success('Business hours updated successfully!');

  //     // Refetch to get updated hours data
  //     await fetchStoreData();
  //   } catch (error: unknown) {
  //     console.error('❌ Failed to update hours:', error);
  //     const errorMessage =
  //       (error as { response?: { data?: { message?: string } } })?.response
  //         ?.data?.message ||
  //       (error as Error)?.message ||
  //       'Failed to update business hours';
  //     setError(errorMessage);
  //     toast.error(errorMessage);
  //     throw error;
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // }, [storeData, fetchStoreData]);

  // const updateStorePaymentMethods = useCallback(async () => {
  //   if (!storeData) {
  //     toast.error('No store data available');
  //     return;
  //   }

  //   console.log('💳 === useComprehensiveStore: Updating payment methods ===');

  //   setIsUpdating(true);
  //   setError(null);

  //   try {
  //     await StoresApiService.updateStorePaymentMethods(storeData.storeId);
  //     toast.success('Payment methods updated successfully!');

  //     // Refetch to get updated payment method data
  //     await fetchStoreData();
  //   } catch (error: unknown) {
  //     console.error('❌ Failed to update payment methods:', error);
  //     const errorMessage =
  //       (error as { response?: { data?: { message?: string } } })?.response
  //         ?.data?.message ||
  //       (error as Error)?.message ||
  //       'Failed to update payment methods';
  //     setError(errorMessage);
  //     toast.error(errorMessage);
  //     throw error;
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // }, [storeData, fetchStoreData]);

  const getCompletionPercentage = useCallback(() => {
    if (!storeData) return 0;

    // Debug: Log the raw store data to understand structure
    console.log('🔍 Raw Store Data for Completion Check:', {
      storeId: storeData.storeId,
      storeName: storeData.storeName,
      description: storeData.description,
      contactPhone: storeData.contactPhone,
      contactEmail: storeData.contactEmail,
      logoUrl: storeData.logoUrl,
      bannerUrl: storeData.bannerUrl,
      addresses: (storeData.addresses?.pickupLocations?.length || 0) > 0,
      categories: storeData.categories?.length,
      openHours: (storeData.operations?.openHours?.length || 0) > 0,
      paymentMethods: false,
      imagesTotal: (storeData.images?.gallery?.length || 0) > 0,
      imagesBreakdown:
        storeData.images?.gallery && Array.isArray(storeData.images.gallery)
          ? storeData.images.gallery.map(
              (img: {
                imageId: number;
                imageType: string;
                filePath?: string;
                isActive?: boolean;
              }) => ({
                imageId: img.imageId,
                imageType: img.imageType,
                fileName: img.filePath,
                isActive: img.isActive,
              })
            )
          : [],
    });

    const logoImages =
      storeData.images?.gallery && Array.isArray(storeData.images.gallery)
        ? storeData.images.gallery.filter(
            (img: { imageType: string; isActive?: boolean }) =>
              img.imageType === 'logo' && img.isActive
          )
        : [];
    const galleryImages =
      storeData.images?.gallery && Array.isArray(storeData.images.gallery)
        ? storeData.images.gallery.filter(
            (img: { imageType: string; isActive?: boolean }) =>
              img.imageType === 'gallery' && img.isActive
          )
        : [];

    // Also check for any gallery images regardless of isActive status
    const allGalleryImages =
      storeData.images?.gallery && Array.isArray(storeData.images.gallery)
        ? storeData.images.gallery.filter(
            (img: { imageType: string }) => img.imageType === 'gallery'
          )
        : [];

    // Get contact info from store data or primary address fallback
    const primaryAddress =
      storeData.addresses?.pickupLocations &&
      Array.isArray(storeData.addresses.pickupLocations)
        ? storeData.addresses.pickupLocations[0]
        : undefined;
    const hasContactPhone = !!(
      storeData.contactPhone || primaryAddress?.contactPhone
    );
    const hasContactEmail = !!(storeData.contactInfo?.email || '');

    const checks = {
      storeName: !!storeData.storeName,
      description: !!storeData.description,
      contactPhone: hasContactPhone,
      contactEmail: hasContactEmail,
      addresses: (storeData.addresses?.pickupLocations?.length || 0) > 0,
      categories: (storeData.categories?.length || 0) > 0,
      openHours: (storeData.operations?.openHours?.length || 0) > 0,
      paymentMethods: false,
      logoUrl: !!storeData.logoUrl || logoImages.length > 0,
      galleryImages: galleryImages.length > 0 || allGalleryImages.length > 0,
    };

    const completed = Object.values(checks).filter(Boolean).length;
    const percentage = Math.round(
      (completed / Object.keys(checks).length) * 100
    );

    // Debug logging to understand completion status
    console.log('🏪 Store Completion Check:', {
      checks,
      completed,
      total: Object.keys(checks).length,
      percentage,
      contactDebug: {
        storeContactPhone: storeData.contactPhone,
        storeContactEmail: storeData.contactEmail,
        primaryAddressPhone: primaryAddress?.contactPhone,
        primaryAddressEmail: storeData.contactInfo?.email || '',
        hasContactPhone,
        hasContactEmail,
      },
      missingItems: Object.entries(checks)
        .filter(([, value]) => !value)
        .map(([key]) => key),
      completedItems: Object.entries(checks)
        .filter(([, value]) => value)
        .map(([key]) => key),
    });

    return percentage;
  }, [storeData]);

  const hasRequiredData = useCallback(() => {
    if (!storeData) return false;

    return !!(
      storeData.storeName &&
      storeData.description &&
      storeData.addresses?.pickupLocations?.length > 0 &&
      storeData.categories.length > 0
    );
  }, [storeData]);

  const getFormattedBusinessHours = useCallback(() => {
    if (!storeData || !storeData.operations?.openHours?.length) {
      return {};
    }

    const hoursMap: Record<string, string> = {};

    storeData.operations?.openHours?.forEach(
      (hour: {
        dayOfWeek: string;
        openTime?: string;
        closeTime?: string;
        isClosed: boolean;
      }) => {
        const dayName = hour.dayOfWeek.toLowerCase();
        if (hour.isClosed) {
          hoursMap[dayName] = 'Closed';
        } else if (hour.openTime && hour.closeTime) {
          hoursMap[dayName] = `${hour.openTime} - ${hour.closeTime}`;
        } else {
          hoursMap[dayName] = 'Hours not set';
        }
      }
    );

    return hoursMap;
  }, [storeData]);

  // Setup polling if enabled
  useEffect(() => {
    if (enablePolling && storeData && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Polling for store data updates...');
        fetchStoreData();
      }, pollingInterval);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [enablePolling, storeData, pollingInterval, fetchStoreData]);

  // Initial fetch with delay to prevent rate limiting during login
  useEffect(() => {
    if (autoFetch && storeId && isAuthenticated && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const timer = setTimeout(() => {
        fetchStoreData();
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [autoFetch, storeId, isAuthenticated, fetchStoreData]);

  // Removed debug logging to reduce console output and improve performance

  return {
    storeData,
    isLoading,
    error,
    isUpdating,
    fetchStoreData,
    refetchStoreData,
    updateStore,
    updateStoreAddress,
    createStoreAddress,
    // updateStoreOpenHours,
    // updateStorePaymentMethods,
    clearError,
    getCompletionPercentage,
    hasRequiredData,
    getFormattedBusinessHours,
  };
};

export default useComprehensiveStore;
