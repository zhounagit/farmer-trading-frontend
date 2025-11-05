import { apiClient } from '../../../shared/services/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  Store,
  StoreAddress,
  StoreCategory,
  StoreImage,
  StoreOpenHours,
  StorePaymentMethod,
  PaymentMethod,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreAddressRequest,
  StoreOpenHoursRequest,
  StorePaymentMethodsRequest,
  StoreCategoriesRequest,
  StoreListResponse,
  StoreAccessResponse,
  StoreStatsResponse,
  StoreFilters,
} from '../../../shared/types/store';

interface StoreApplicationDetail {
  submissionId: string;
  storeId: number;
  storeName: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerId?: number;
  reviewNotes?: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  store?: Store;
}

export class StoresApiService {
  private static readonly BASE_PATH = '/api/stores';
  private static readonly PAYMENT_METHODS_PATH = '/api/payment-methods';

  // Store CRUD Operations
  static async createStore(storeData: CreateStoreRequest): Promise<Store> {
    const response = await apiClient.post<Store>(this.BASE_PATH, storeData);
    return response;
  }

  static async getStore(
    storeId: number,
    includeRelations: boolean = true
  ): Promise<Store> {
    const queryParams = includeRelations
      ? '?include=addresses,categories,images,openHours,paymentMethods'
      : '';
    const response = await apiClient.get<ApiResponse<Store>>(
      `${this.BASE_PATH}/${storeId}${queryParams}`
    );
    return response.data || response;
  }

  static async updateStore(
    storeId: number,
    updateData: UpdateStoreRequest
  ): Promise<Store> {
    const response = await apiClient.put<Store>(
      `${this.BASE_PATH}/${storeId}`,
      updateData
    );
    return response;
  }

  static async deleteStore(storeId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${storeId}`);
  }

  static async getEnhancedStoreById(storeId: number): Promise<Store> {
    const response = await apiClient.get<ApiResponse<Store>>(
      `${this.BASE_PATH}/${storeId}/enhanced`
    );
    return response.data || response;
  }

  // Store Listings
  static async getUserStores(userId?: number): Promise<StoreListResponse> {
    const queryParam = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get<any[]>(
      `${this.BASE_PATH}/my-stores${queryParam}`
    );

    // apiClient.get already extracts response.data.data, which is the array
    // Convert array response to StoreListResponse format
    if (Array.isArray(response)) {
      return {
        stores: response,
        totalCount: response.length,
        pageNumber: 1,
        pageSize: response.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    // Fallback for unexpected format
    return {
      stores: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  static async getAllStores(
    filters?: StoreFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<StoreListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item.toString()));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<StoreListResponse>(
      `${this.BASE_PATH}?${params.toString()}`
    );
    return response;
  }

  static async searchStores(): Promise<StoreListResponse> {
    // Note: Search endpoint not implemented in backend, falling back to getAllStores
    return this.getAllStores();
  }

  // Store Access Management
  static async checkStoreAccess(storeId: number): Promise<StoreAccessResponse> {
    const response = await apiClient.get<StoreAccessResponse>(
      `${this.BASE_PATH}/${storeId}/can-access`
    );
    return response;
  }

  static async canAccessStore(storeId: number): Promise<boolean> {
    try {
      const access = await this.checkStoreAccess(storeId);
      return access.canAccess;
    } catch {
      return false;
    }
  }

  // Store Statistics
  static async getStoreStats(
    storeId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StoreStatsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<StoreStatsResponse>(
      `${this.BASE_PATH}/${storeId}/metrics${queryString}`
    );
    return response;
  }

  // Store Addresses
  static async getStoreAddresses(storeId: number): Promise<StoreAddress[]> {
    try {
      const response = await apiClient.get<ApiResponse<StoreAddress[]>>(
        `${this.BASE_PATH}/${storeId}/addresses`
      );
      // Extract data from wrapped response or use response directly
      const addresses = response.data || response;
      // Ensure we always return an array
      return Array.isArray(addresses) ? addresses : [];
    } catch (error) {
      console.error('Failed to get store addresses:', error);
      return [];
    }
  }

  /**
   * Manually trigger geocoding for store addresses without coordinates
   * Note: This endpoint requires admin privileges
   */
  static async geocodeStoreAddresses(): Promise<{
    message: string;
    addressesProcessed: number;
  }> {
    try {
      const response = await apiClient.post<{
        message: string;
        addressesProcessed: number;
      }>('/api/geocoding/geocode-all');
      return response;
    } catch (error) {
      console.error('Failed to trigger geocoding:', error);
      throw error;
    }
  }

  /**
   * Get geocoding statistics
   * Note: This endpoint requires admin privileges
   */
  static async getGeocodingStatistics(): Promise<{
    message: string;
    note: string;
  }> {
    try {
      const response = await apiClient.get<{
        message: string;
        note: string;
      }>('/api/geocoding/statistics');
      return response;
    } catch (error) {
      console.error('Failed to get geocoding statistics:', error);
      throw error;
    }
  }

  static async createStoreAddress(
    storeId: number,
    addressData: StoreAddressRequest
  ): Promise<StoreAddress> {
    const payload = {
      StoreId: storeId,
      ...addressData,
    };

    console.log('=== createStoreAddress DEBUG ===');
    console.log('Store ID:', storeId);
    console.log('Address data:', addressData);
    console.log('Final payload:', JSON.stringify(payload, null, 2));
    console.log('API URL:', `${this.BASE_PATH}/${storeId}/address`);

    const response = await apiClient.post<StoreAddress>(
      `${this.BASE_PATH}/${storeId}/address`,
      payload
    );

    console.log('API Response:', response);
    return response;
  }

  static async updateStoreAddress(
    storeId: number,
    addressId: number,
    addressData: StoreAddressRequest
  ): Promise<void> {
    const payload = {
      AddressId: addressId,
      StoreId: storeId,
      ...addressData,
    };

    console.log('=== updateStoreAddress DEBUG ===');
    console.log('Store ID:', storeId);
    console.log('Address ID:', addressId);
    console.log('Address data:', addressData);
    console.log('Final payload:', JSON.stringify(payload, null, 2));
    console.log(
      'API URL:',
      `${this.BASE_PATH}/${storeId}/addresses/${addressId}`
    );

    await apiClient.put(
      `${this.BASE_PATH}/${storeId}/addresses/${addressId}`,
      payload
    );
  }

  static async deleteStoreAddress(
    storeId: number,
    addressId: number
  ): Promise<void> {
    await apiClient.delete(
      `${this.BASE_PATH}/${storeId}/addresses/${addressId}`
    );
  }

  // Store Categories
  static async getStoreCategories(storeId: number): Promise<StoreCategory[]> {
    const response = await apiClient.get<StoreCategory[]>(
      `${this.BASE_PATH}/${storeId}/categories`
    );
    return response;
  }

  static async updateStoreCategories(
    _storeId: number,
    _categoriesData: StoreCategoriesRequest
  ): Promise<void> {
    // Note: Update categories endpoint not implemented in backend
    throw new Error(
      'Update store categories functionality not implemented in backend'
    );
  }

  static async getAllStoreCategories(): Promise<StoreCategory[]> {
    const response = await apiClient.get<StoreCategory[]>(
      `${this.BASE_PATH}/categories`
    );
    return response;
  }

  // Store Images
  static async getStoreImages(
    storeId: number,
    imageType?: string
  ): Promise<StoreImage[]> {
    const queryParam = imageType ? `?imageType=${imageType}` : '';
    const response = await apiClient.get<ApiResponse<StoreImage[]>>(
      `${this.BASE_PATH}/${storeId}/images${queryParam}`
    );
    return response.data || [];
  }

  // Video management methods
  static async getStoreVideo(storeId: number): Promise<StoreImage | null> {
    try {
      const response = await apiClient.get<ApiResponse<StoreImage>>(
        `${this.BASE_PATH}/${storeId}/video`
      );
      return response.data || null;
    } catch (error) {
      // Return null if no video found (404) or other errors
      return null;
    }
  }

  static async uploadStoreVideo(
    storeId: number,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<StoreImage> {
    const formData = new FormData();
    formData.append('videoFile', file);

    const response = await apiClient.upload<StoreImage>(
      `${this.BASE_PATH}/${storeId}/video/upload`,
      formData,
      onUploadProgress
    );
    return response;
  }

  static async setStoreVideoUrl(
    storeId: number,
    videoUrl: string
  ): Promise<StoreImage> {
    const response = await apiClient.post<StoreImage>(
      `${this.BASE_PATH}/${storeId}/video/url`,
      { videoUrl }
    );
    return response;
  }

  static async deleteStoreVideo(storeId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${storeId}/video`);
  }

  static async uploadStoreImage(
    storeId: number,
    file: File,
    imageType: string,
    onUploadProgress?: (progress: number) => void
  ): Promise<StoreImage> {
    const formData = new FormData();

    // Use specific endpoints based on image type
    let endpoint: string;
    switch (imageType.toLowerCase()) {
      case 'logo':
        endpoint = `${this.BASE_PATH}/${storeId}/upload-logo`;
        formData.append('File', file);
        break;
      case 'banner':
        endpoint = `${this.BASE_PATH}/${storeId}/upload-banner`;
        formData.append('File', file);
        break;
      case 'gallery':
        endpoint = `${this.BASE_PATH}/${storeId}/upload-gallery`;
        // For gallery, backend expects Files array
        formData.append('Files', file);
        break;
      default:
        throw new Error(`Unsupported image type: ${imageType}`);
    }

    // Gallery returns array, others return single image
    if (imageType.toLowerCase() === 'gallery') {
      const response = await apiClient.upload<StoreImage[]>(
        endpoint,
        formData,
        onUploadProgress
      );
      // Return first image from array for consistency
      return response[0];
    } else {
      const response = await apiClient.upload<StoreImage>(
        endpoint,
        formData,
        onUploadProgress
      );
      return response;
    }
  }

  // Store Application Management
  static async getStoreApplicationDetail(
    submissionId: string
  ): Promise<StoreApplicationDetail> {
    const response = await apiClient.get<ApiResponse<StoreApplicationDetail>>(
      `/api/admin/store-applications/${submissionId}`
    );
    return response.data || response;
  }

  static async uploadGalleryImages(
    storeId: number,
    files: File[],
    onUploadProgress?: (progress: number) => void
  ): Promise<StoreImage[]> {
    const formData = new FormData();

    // Append all files to the Files array as expected by backend
    files.forEach((file) => {
      formData.append('Files', file);
    });

    const response = await apiClient.upload<StoreImage[]>(
      `${this.BASE_PATH}/${storeId}/upload-gallery`,
      formData,
      onUploadProgress
    );
    return response;
  }

  static async updateStoreImage(
    _storeId?: number,
    _imageId?: number,
    _updateData?: { sortOrder?: number; isActive?: boolean }
  ): Promise<StoreImage> {
    // Note: Update image endpoint not implemented in backend
    throw new Error('Update image functionality not implemented in backend');
  }

  static async deleteStoreImage(
    storeId: number,
    imageId: number
  ): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${storeId}/images/${imageId}`);
  }

  static async reorderStoreImages(
    _storeId: number,
    _imageOrders: { imageId: number; sortOrder: number }[]
  ): Promise<ApiResponse> {
    // Note: Reorder images endpoint not implemented in backend
    throw new Error('Reorder images functionality not implemented in backend');
  }

  // Store Open Hours
  static async getStoreOpenHours(storeId: number): Promise<StoreOpenHours[]> {
    const response = await apiClient.get<StoreOpenHours[]>(
      `${this.BASE_PATH}/${storeId}/open-hours`
    );
    return response;
  }

  static async updateStoreOpenHours(
    _hoursData: StoreOpenHoursRequest
  ): Promise<void> {
    // Note: Update open hours endpoint not implemented in backend
    throw new Error(
      'Update open hours functionality not implemented in backend'
    );
  }

  // Store Payment Methods
  static async getStorePaymentMethods(
    storeId: number
  ): Promise<StorePaymentMethod[]> {
    const response = await apiClient.get<StorePaymentMethod[]>(
      `${this.BASE_PATH}/${storeId}/payment-methods`
    );
    return response;
  }

  static async updateStorePaymentMethods(
    _paymentData: StorePaymentMethodsRequest
  ): Promise<void> {
    // Note: Update payment methods endpoint not implemented in backend
    throw new Error(
      'Update payment methods functionality not implemented in backend'
    );
  }

  static async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.get<PaymentMethod[]>(
      this.PAYMENT_METHODS_PATH
    );
    return response;
  }

  // Store Configuration
  static async getStoreSellingMethods(storeId: number): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `${this.BASE_PATH}/${storeId}/selling-methods`
    );
    return response;
  }

  static async updateStoreSellingMethods(
    _storeId: number,
    _sellingMethods: string[]
  ): Promise<void> {
    // Note: Update selling methods endpoint not implemented in backend
    throw new Error(
      'Update selling methods functionality not implemented in backend'
    );
  }

  static async getStoreDeliveryRadius(
    storeId: number
  ): Promise<{ deliveryRadiusMi: number }> {
    const response = await apiClient.get<{ deliveryRadiusMi: number }>(
      `${this.BASE_PATH}/${storeId}/delivery-radius`
    );
    return response;
  }

  static async updateStoreDeliveryRadius(
    storeId: number,
    deliveryRadiusMi: number
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `${this.BASE_PATH}/${storeId}/deliverydistance/${deliveryRadiusMi}`,
      {}
    );
    return response;
  }

  // Store Status Management
  static async submitForApproval(): Promise<ApiResponse> {
    // Note: Submit for approval endpoint not implemented in backend
    throw new Error(
      'Submit for approval functionality not implemented in backend'
    );
  }

  static async approveStore(
    _storeId: number,
    _approvalNotes?: string
  ): Promise<void> {
    // Note: Approve store endpoint not implemented in backend
    throw new Error('Approve store functionality not implemented in backend');
  }

  static async rejectStore(
    _storeId: number,
    _rejectionReason: string
  ): Promise<void> {
    // Note: Reject store endpoint not implemented in backend
    throw new Error('Reject store functionality not implemented in backend');
  }

  static async suspendStore(
    _storeId: number,
    _suspensionReason: string
  ): Promise<void> {
    // Note: Suspend store endpoint not implemented in backend
    throw new Error('Suspend store functionality not implemented in backend');
  }

  static async deactivateStore(_storeId: number): Promise<void> {
    // Note: Deactivate store endpoint not implemented in backend
    throw new Error(
      'Deactivate store functionality not implemented in backend'
    );
  }

  // Utility Methods
  static async getStorePreview(storeId: number): Promise<Partial<Store>> {
    // Note: Store preview endpoint not implemented in backend
    // Fall back to regular store data
    return this.getStore(storeId);
  }

  static async duplicateStore(
    _storeId: number,
    _newStoreName: string
  ): Promise<Store> {
    // Note: Duplicate store endpoint not implemented in backend
    throw new Error('Duplicate store functionality not implemented in backend');
  }

  // Bulk Operations
  static async bulkUpdateStores(
    _storeIds: number[],
    _updateData: Partial<UpdateStoreRequest>
  ): Promise<void> {
    // Note: Bulk update stores endpoint not implemented in backend
    throw new Error(
      'Bulk update stores functionality not implemented in backend'
    );
  }

  static async bulkDeleteStores(_storeIds: number[]): Promise<void> {
    // Note: Bulk delete stores endpoint not implemented in backend
    throw new Error(
      'Bulk delete stores functionality not implemented in backend'
    );
  }

  // Analytics and Insights
  static async getStoreAnalytics(
    _storeId: number,
    startDate: string,
    endDate: string,
    _metrics: string[] = ['views', 'orders', 'revenue']
  ): Promise<Record<string, unknown>> {
    // Note: Store analytics endpoint not implemented in backend
    // Return mock analytics data
    return {
      views: 0,
      orders: 0,
      revenue: 0,
      period: { startDate, endDate },
    };
  }

  static async getStoreInsights(_storeId: number): Promise<{
    recommendations: string[];
    optimization: Record<string, unknown>;
    performance: Record<string, unknown>;
  }> {
    // Note: Store insights endpoint not implemented in backend
    // Return mock insights data
    return {
      recommendations: [],
      optimization: {},
      performance: {},
    };
  }
}

export default StoresApiService;
