import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StoreApiService, {
  type ComprehensiveStoreData,
  type StoreUpdateRequest,
  type StoreAddressRequest,
  type StoreOpenHoursRequest,
} from '../services/store.api';
import toast from 'react-hot-toast';

interface UseComprehensiveStoreOptions {
  storeId?: number;
  autoFetch?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
}

interface UseComprehensiveStoreReturn {
  storeData: ComprehensiveStoreData | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;

  // Data fetching
  fetchStoreData: (storeId?: number) => Promise<void>;
  refetchStoreData: () => Promise<void>;

  // Store updates
  updateStore: (updateData: StoreUpdateRequest) => Promise<void>;
  updateStoreAddress: (
    addressId: number,
    addressData: Partial<StoreAddressRequest>
  ) => Promise<void>;
  createStoreAddress: (addressData: StoreAddressRequest) => Promise<void>;
  updateOpenHours: (
    hoursData: Omit<StoreOpenHoursRequest, 'storeId'>
  ) => Promise<void>;
  updatePaymentMethods: (methodIds: number[]) => Promise<void>;

  // Utility functions
  clearError: () => void;
  getCompletionPercentage: () => number;
  hasRequiredData: () => boolean;
  getFormattedBusinessHours: () => Record<string, string>;
}

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

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
  const [storeData, setStoreData] = useState<ComprehensiveStoreData | null>(
    null
  );
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
          await StoreApiService.getComprehensiveStoreDetails(currentStoreId);

        console.log(
          '✅ Comprehensive store data fetched successfully:',
          comprehensiveData
        );
        setStoreData(comprehensiveData);
        setError(null);
      } catch (error: unknown) {
        console.error('❌ Failed to fetch comprehensive store data:', error);

        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
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
    async (updateData: StoreUpdateRequest) => {
      if (!storeData) {
        toast.error('No store data available to update');
        return;
      }

      console.log('🔄 === useComprehensiveStore: Updating store ===');
      console.log('Update data:', updateData);

      setIsUpdating(true);
      setError(null);

      try {
        await StoreApiService.updateStore(storeData.storeId, updateData);

        // Update local state optimistically
        setStoreData((prev) =>
          prev
            ? {
                ...prev,
                ...updateData,
                updatedAt: new Date().toISOString(),
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
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
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
    async (addressData: StoreAddressRequest) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('📍 === useComprehensiveStore: Creating store address ===');

      setIsUpdating(true);
      setError(null);

      try {
        await StoreApiService.createStoreAddress(
          storeData.storeId,
          addressData
        );
        toast.success('Address added successfully!');

        // Refetch to get updated address data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to create address:', error);
        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
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
    async (addressId: number, addressData: Partial<StoreAddressRequest>) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('📍 === useComprehensiveStore: Updating store address ===');

      setIsUpdating(true);
      setError(null);

      try {
        await StoreApiService.updateStoreAddress(
          storeData.storeId,
          addressId,
          addressData
        );
        toast.success('Address updated successfully!');

        // Refetch to get updated address data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to update address:', error);
        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
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

  const updateOpenHours = useCallback(
    async (hoursData: Omit<StoreOpenHoursRequest, 'storeId'>) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('🕒 === useComprehensiveStore: Updating open hours ===');

      setIsUpdating(true);
      setError(null);

      try {
        await StoreApiService.updateStoreOpenHours({
          storeId: storeData.storeId,
          ...hoursData,
        });
        toast.success('Business hours updated successfully!');

        // Refetch to get updated hours data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to update hours:', error);
        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          'Failed to update business hours';
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [storeData, fetchStoreData]
  );

  const updatePaymentMethods = useCallback(
    async (methodIds: number[]) => {
      if (!storeData) {
        toast.error('No store data available');
        return;
      }

      console.log('💳 === useComprehensiveStore: Updating payment methods ===');

      setIsUpdating(true);
      setError(null);

      try {
        await StoreApiService.updateStorePaymentMethods({
          storeId: storeData.storeId,
          methodIds,
        });
        toast.success('Payment methods updated successfully!');

        // Refetch to get updated payment method data
        await fetchStoreData();
      } catch (error: unknown) {
        console.error('❌ Failed to update payment methods:', error);
        const errorMessage =
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          'Failed to update payment methods';
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [storeData, fetchStoreData]
  );

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
      addresses: storeData.addresses?.length,
      categories: storeData.categories?.length,
      openHours: storeData.openHours?.length,
      paymentMethods: storeData.paymentMethods?.length,
      imagesTotal: storeData.images?.length,
      imagesBreakdown: storeData.images?.map((img) => ({
        imageId: img.imageId,
        imageType: img.imageType,
        fileName: img.fileName,
        isActive: img.isActive,
      })),
    });

    const logoImages =
      storeData.images?.filter(
        (img) => img.imageType === 'logo' && img.isActive
      ) || [];
    const galleryImages =
      storeData.images?.filter(
        (img) => img.imageType === 'gallery' && img.isActive
      ) || [];

    // Also check for any gallery images regardless of isActive status
    const allGalleryImages =
      storeData.images?.filter((img) => img.imageType === 'gallery') || [];

    console.log('🖼️ Image Analysis:', {
      logoImages: logoImages.length,
      logoImageDetails: logoImages,
      galleryImages: galleryImages.length,
      galleryImageDetails: galleryImages,
      allGalleryImages: allGalleryImages.length,
      allGalleryImageDetails: allGalleryImages,
      logoUrlExists: !!storeData.logoUrl,
      logoUrlValue: storeData.logoUrl,
      totalImages: storeData.images?.length || 0,
      allImagesBreakdown:
        storeData.images?.map((img) => ({
          imageId: img.imageId,
          imageType: img.imageType,
          fileName: img.fileName,
          isActive: img.isActive,
        })) || [],
    });

    // Get contact info from store data or primary address fallback
    const primaryAddress =
      storeData.addresses?.find((addr) => addr.isPrimary) ||
      storeData.addresses?.[0];
    const hasContactPhone = !!(
      storeData.contactPhone || primaryAddress?.contactPhone
    );
    const hasContactEmail = !!(
      storeData.contactEmail || primaryAddress?.contactEmail
    );

    const checks = {
      storeName: !!storeData.storeName,
      description: !!storeData.description,
      contactPhone: hasContactPhone,
      contactEmail: hasContactEmail,
      addresses: (storeData.addresses?.length || 0) > 0,
      categories: (storeData.categories?.length || 0) > 0,
      openHours: (storeData.openHours?.length || 0) > 0,
      paymentMethods: (storeData.paymentMethods?.length || 0) > 0,
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
        primaryAddressEmail: primaryAddress?.contactEmail,
        hasContactPhone,
        hasContactEmail,
      },
      missingItems: Object.entries(checks)
        .filter(([key, value]) => !value)
        .map(([key]) => key),
      completedItems: Object.entries(checks)
        .filter(([key, value]) => value)
        .map(([key]) => key),
    });

    return percentage;
  }, [storeData]);

  const hasRequiredData = useCallback(() => {
    if (!storeData) return false;

    return !!(
      storeData.storeName &&
      storeData.description &&
      storeData.addresses.length > 0 &&
      storeData.categories.length > 0
    );
  }, [storeData]);

  const getFormattedBusinessHours = useCallback(() => {
    if (!storeData || !storeData.openHours.length) {
      return {};
    }

    const hoursMap: Record<string, string> = {};

    storeData.openHours.forEach((hour) => {
      const dayName = DAY_NAMES[hour.dayOfWeek];
      if (hour.isClosed) {
        hoursMap[dayName] = 'Closed';
      } else if (hour.openTime && hour.closeTime) {
        hoursMap[dayName] = `${hour.openTime} - ${hour.closeTime}`;
      } else {
        hoursMap[dayName] = 'Hours not set';
      }
    });

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

  // Initial fetch
  useEffect(() => {
    if (autoFetch && storeId && isAuthenticated && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchStoreData();
    }
  }, [autoFetch, storeId, isAuthenticated, fetchStoreData]);

  // Debug logging
  useEffect(() => {
    console.log('🏪 === useComprehensiveStore State Update ===');
    console.log('Store ID:', storeId);
    console.log('Store data available:', !!storeData);
    console.log('Is loading:', isLoading);
    console.log('Is updating:', isUpdating);
    console.log('Error:', error);
    console.log('Completion percentage:', getCompletionPercentage());
  }, [
    storeData,
    isLoading,
    isUpdating,
    error,
    storeId,
    getCompletionPercentage,
  ]);

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
    updateOpenHours,
    updatePaymentMethods,
    clearError,
    getCompletionPercentage,
    hasRequiredData,
    getFormattedBusinessHours,
  };
};

export default useComprehensiveStore;
