/**
 * Open Shop API Service - Standardized API service for store creation and submission
 * Uses shared API contracts and follows the same pattern as UsersController
 */

import { apiService } from '../../../shared/services/api-service';

import type {
  StoreSubmissionRequest,
  StoreSubmissionResponse,
  ApplicationStatusResponse,
  CreateStoreWithSetupFlowRequest,
  CreateStoreWithSetupFlowResponse,
  StoreBasics,
  CreateStoreResponse,
  StoreAccessResponse,
  EnhancedStoreDto,
  UserNotificationResponse,
  ApiResponse,
  StoreMetrics,
  FeaturedProductDto,
  StoreImage,
} from './open-shop.types';

export class OpenShopApiService {
  private static readonly BASE_PATH = '/api/stores';
  private static readonly SUBMISSIONS_PATH = '/api/store-submissions';

  /**
   * Upload store video
   */
  static async uploadStoreVideo(
    storeId: number,
    videoFile: File
  ): Promise<StoreImage> {
    try {
      const formData = new FormData();
      formData.append('VideoFile', videoFile);

      // Use upload method which properly handles FormData with multipart/form-data
      const response = await apiService.upload<StoreImage>(
        `${this.BASE_PATH}/${storeId}/video/upload`,
        formData
      );

      if (!response) {
        throw new Error('Failed to upload video - no response');
      }

      return response;
    } catch (error) {
      console.error('❌ Error uploading store video:', error);
      throw error;
    }
  }

  /**
   * Set store video URL
   */
  static async setStoreVideoUrl(
    storeId: number,
    videoUrl: string
  ): Promise<ApiResponse<StoreImage>> {
    try {
      const request = {
        videoUrl,
      };

      const response = await apiService.post<ApiResponse<StoreImage>>(
        `${this.BASE_PATH}/${storeId}/video/url`,
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to set video URL');
      }

      return response;
    } catch (error) {
      console.error('Error setting store video URL:', error);
      throw error;
    }
  }

  /**
   * Get store video
   */
  static async getStoreVideo(storeId: number): Promise<StoreImage | null> {
    try {
      const response = await apiService.get<StoreImage | null>(
        `${this.BASE_PATH}/${storeId}/video`
      );

      return response;
    } catch (error) {
      console.error('Error getting store video:', error);
      throw error;
    }
  }

  /**
   * Delete store video
   */
  static async deleteStoreVideo(storeId: number): Promise<ApiResponse> {
    try {
      const response = await apiService.delete<ApiResponse>(
        `${this.BASE_PATH}/${storeId}/video`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete store video');
      }

      return response;
    } catch (error) {
      console.error('Error deleting store video:', error);
      throw error;
    }
  }

  /**
   * Create store with setup flow
   */
  static async createStoreWithSetupFlow(
    request: CreateStoreWithSetupFlowRequest
  ): Promise<CreateStoreWithSetupFlowResponse> {
    try {
      const response = await apiService.post<
        ApiResponse<CreateStoreWithSetupFlowResponse>
      >(`${this.BASE_PATH}/setup-flow`, request);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create store');
      }

      return response.data!;
    } catch (error) {
      console.error('Error creating store with setup flow:', error);
      throw error;
    }
  }

  /**
   * Create store basics
   */
  static async createStoreBasics(
    storeData: StoreBasics
  ): Promise<CreateStoreResponse> {
    try {
      const response = await apiService.post<ApiResponse<CreateStoreResponse>>(
        `${this.BASE_PATH}/basics`,
        storeData
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create store basics');
      }

      return response.data!;
    } catch (error) {
      console.error('Error creating store basics:', error);
      throw error;
    }
  }

  /**
   * Submit store for review
   */
  static async submitStore(
    request: StoreSubmissionRequest
  ): Promise<StoreSubmissionResponse> {
    try {
      const result = await apiService.post<StoreSubmissionResponse>(
        `${this.SUBMISSIONS_PATH}/${request.storeId}/submit-for-review`,
        request
      );
      return result;
    } catch (error) {
      console.error('❌ Error submitting store for review:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Get store application status
   */
  static async getApplicationStatus(
    storeId: number
  ): Promise<ApplicationStatusResponse> {
    try {
      const response = await apiService.get<
        ApiResponse<ApplicationStatusResponse>
      >(`${this.SUBMISSIONS_PATH}/${storeId}/submission-status`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get application status');
      }

      return response.data!;
    } catch (error) {
      console.error('Error getting application status:', error);
      throw error;
    }
  }

  /**
   * Get application status by submission ID
   */
  static async getApplicationStatusBySubmissionId(
    submissionId: string
  ): Promise<ApplicationStatusResponse> {
    try {
      const response = await apiService.get<
        ApiResponse<ApplicationStatusResponse>
      >(`${this.SUBMISSIONS_PATH}/submissions/${submissionId}/status`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to get application status');
      }

      return response.data!;
    } catch (error) {
      console.error(
        'Error getting application status by submission ID:',
        error
      );
      throw error;
    }
  }

  /**
   * Get enhanced store details
   */
  static async getEnhancedStoreById(
    storeId: number
  ): Promise<EnhancedStoreDto> {
    try {
      // apiService.get already handles ApiResponse format and returns just the data
      // So we expect to get EnhancedStoreDto directly
      const enhancedStore = await apiService.get<EnhancedStoreDto>(
        `${this.BASE_PATH}/${storeId}/enhanced`
      );

      if (!enhancedStore) {
        throw new Error('No store data received');
      }

      return enhancedStore;
    } catch (error) {
      console.error('Error getting enhanced store details:', error);
      throw error;
    }
  }

  /**
   * Check if user can access store
   */
  static async canAccessStore(storeId: number): Promise<StoreAccessResponse> {
    try {
      const accessData = await apiService.get<StoreAccessResponse>(
        `${this.BASE_PATH}/${storeId}/access-check`
      );

      return accessData;
    } catch (error) {
      console.error('Error checking store access:', error);
      throw error;
    }
  }

  /**
   * Get user notifications for store submissions
   */
  static async getUserNotifications(
    storeId: number,
    unreadOnly: boolean = false
  ): Promise<UserNotificationResponse[]> {
    try {
      const response = await apiService.get<
        ApiResponse<UserNotificationResponse[]>
      >(
        `${this.SUBMISSIONS_PATH}/${storeId}/notifications?unreadOnly=${unreadOnly}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to get user notifications');
      }

      return response.data!;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      const response = await apiService.put<ApiResponse>(
        `${this.SUBMISSIONS_PATH}/notifications/${notificationId}/mark-read`
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to mark notification as read'
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get store metrics
   */
  static async getStoreMetrics(
    storeId: number,
    period: string = 'month'
  ): Promise<StoreMetrics> {
    try {
      const metrics = await apiService.get<StoreMetrics>(
        `${this.BASE_PATH}/${storeId}/metrics?period=${period}`
      );

      return metrics;
    } catch (error) {
      console.error('Error getting store metrics:', error);
      throw error;
    }
  }

  /**
   * Get store featured products
   */
  static async getStoreFeaturedProducts(
    storeId: number,
    limit: number = 8
  ): Promise<FeaturedProductDto[]> {
    try {
      const featuredProducts = await apiService.get<FeaturedProductDto[]>(
        `${this.BASE_PATH}/${storeId}/featured-products?limit=${limit}`
      );

      return featuredProducts;
    } catch (error) {
      console.error('Error getting featured products:', error);
      throw error;
    }
  }

  /**
   * Add product to featured products
   */
  static async addToFeaturedProducts(
    storeId: number,
    itemId: number,
    displayOrder: number
  ): Promise<void> {
    try {
      const request = { itemId, displayOrder };
      const response = await apiService.post<ApiResponse>(
        `${this.BASE_PATH}/${storeId}/featured-products`,
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to add featured product');
      }
    } catch (error) {
      console.error('Error adding featured product:', error);
      throw error;
    }
  }

  /**
   * Remove product from featured products
   */
  static async removeFromFeaturedProducts(
    storeId: number,
    itemId: number
  ): Promise<void> {
    try {
      const response = await apiService.delete<ApiResponse>(
        `${this.BASE_PATH}/${storeId}/featured-products/${itemId}`
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to remove featured product'
        );
      }
    } catch (error) {
      console.error('Error removing featured product:', error);
      throw error;
    }
  }

  /**
   * Set featured products for store
   */
  static async setFeaturedProducts(
    storeId: number,
    itemIds: number[]
  ): Promise<void> {
    try {
      const request = { itemIds };
      const response = await apiService.put<ApiResponse>(
        `${this.BASE_PATH}/${storeId}/featured-products`,
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to set featured products');
      }
    } catch (error) {
      console.error('Error setting featured products:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive store details (alias for getEnhancedStoreById)
   */
  static async getComprehensiveStoreDetails(
    storeId: number
  ): Promise<EnhancedStoreDto> {
    return this.getEnhancedStoreById(storeId);
  }

  /**
   * Set store open hours
   */
  static async setOpenHours(request: {
    storeId: number;
    openHours: {
      dayOfWeek: number;
      openTime?: string | null;
      closeTime?: string | null;
      isClosed: boolean;
    }[];
  }): Promise<void> {
    try {
      // Convert frontend format to backend format
      // TimeSpan format: "HH:mm:ss" or null for closed days
      const backendRequest = {
        StoreId: request.storeId,
        OpenHours: request.openHours.map((hour) => {
          let openTime: string | null = null;
          let closeTime: string | null = null;

          // Only set times if day is open
          if (!hour.isClosed) {
            if (hour.openTime) {
              // Ensure format is HH:mm:ss
              const parts = hour.openTime.split(':');
              openTime =
                parts.length === 2 ? `${hour.openTime}:00` : hour.openTime;
            }
            if (hour.closeTime) {
              // Ensure format is HH:mm:ss
              const parts = hour.closeTime.split(':');
              closeTime =
                parts.length === 2 ? `${hour.closeTime}:00` : hour.closeTime;
            }
          }

          return {
            DayOfWeek: hour.dayOfWeek,
            OpenTime: openTime,
            CloseTime: closeTime,
            IsClosed: hour.isClosed,
          };
        }),
      };

      await apiService.put(
        `${this.BASE_PATH}/${request.storeId}/open-hours`,
        backendRequest
      );
    } catch (error) {
      console.error('Error setting store open hours:', error);
      throw error;
    }
  }

  /**
   * Upload store logo
   */
  static async uploadLogo(
    storeId: number,
    logoFile: File
  ): Promise<StoreImage> {
    console.log('🎨 === OpenShopApiService.uploadLogo CALLED ===');
    console.log('Store ID:', storeId);
    console.log('Logo file:', {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
    });

    const formData = new FormData();
    formData.append('File', logoFile);

    console.log('📤 FormData created:');
    console.log('- File:', formData.get('File'));

    const endpoint = `/api/stores/${storeId}/upload-logo`;
    console.log('🌐 API endpoint:', endpoint);
    console.log('🚀 About to call apiService.upload...');

    try {
      const result = await apiService.upload<StoreImage>(endpoint, formData);
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload failed in OpenShopApiService:', error);
      throw error;
    }
  }

  /**
   * Upload store banner
   */
  static async uploadBanner(
    storeId: number,
    bannerFile: File
  ): Promise<StoreImage> {
    const formData = new FormData();
    formData.append('File', bannerFile);

    const endpoint = `/api/stores/${storeId}/upload-banner`;
    console.log('🌐 API endpoint:', endpoint);

    try {
      const result = await apiService.upload<StoreImage>(endpoint, formData);
      console.log('✅ Banner upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Banner upload failed in OpenShopApiService:', error);
      throw error;
    }
  }

  /**
   * Upload store gallery images
   */
  static async uploadGalleryImages(
    storeId: number,
    imageFiles: File[]
  ): Promise<StoreImage[]> {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('Files', file);
    });

    const endpoint = `/api/stores/${storeId}/upload-gallery`;
    console.log('🌐 API endpoint:', endpoint);

    try {
      const result = await apiService.upload<StoreImage[]>(endpoint, formData);

      return result;
    } catch (error) {
      console.error('❌ Gallery upload failed in OpenShopApiService:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const openShopApiService = new OpenShopApiService();

// Default export for convenience
export default OpenShopApiService;
