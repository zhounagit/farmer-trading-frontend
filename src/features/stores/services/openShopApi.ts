import { apiClient } from '../../../shared/services/apiClient';
import type {
  StoreCreationRequest,
  StoreCreationResponse,
  AddressCreationRequest,
  AddressCreationResponse,
  StoreImage,
  StoreImageUploadResponse,
  StoreSubmissionRequest,
  StoreSubmissionResponse,
  StoreStatusResponse,
  StoreAddress,
  ApplicationStatusResponse,
} from './open-shop.types';

/**
 * Open Shop API Service
 * Handles store creation, setup, and submission workflows
 */
class OpenShopApiService {
  private static readonly BASE_PATH = '/api/stores';
  private static readonly SUBMISSIONS_PATH = '/api/store-submissions';

  /**
   * Create a new store
   */
  static async createStore(
    data: StoreCreationRequest
  ): Promise<StoreCreationResponse> {
    const response = await apiClient.post<StoreCreationResponse>(
      `${this.BASE_PATH}/setup-flow`,
      data
    );
    return response;
  }

  /**
   * Add address to store
   */
  static async addAddress(
    data: AddressCreationRequest
  ): Promise<AddressCreationResponse> {
    const response = await apiClient.post<AddressCreationResponse>(
      `${this.BASE_PATH}/${data.storeId}/address`,
      data
    );
    return response;
  }

  /**
   * Create store address (alias for addAddress for compatibility)
   */
  static async createStoreAddress(
    storeId: number,
    addressData: Omit<AddressCreationRequest, 'storeId'>
  ): Promise<AddressCreationResponse> {
    const requestData: AddressCreationRequest = {
      storeId,
      ...addressData,
    };
    return await this.addAddress(requestData);
  }

  /**
   * Get store addresses
   */
  static async getStoreAddresses(storeId: number): Promise<StoreAddress[]> {
    const response = await apiClient.get<StoreAddress[]>(
      `${this.BASE_PATH}/${storeId}/addresses`
    );
    return response;
  }

  /**
   * Update store address
   */
  static async updateStoreAddress(
    storeId: number,
    addressId: number,
    addressData: Omit<AddressCreationRequest, 'storeId'>
  ): Promise<void> {
    const requestData = {
      addressId,
      storeId,
      ...addressData,
    };
    await apiClient.put(
      `${this.BASE_PATH}/${storeId}/addresses/${addressId}`,
      requestData
    );
  }

  /**
   * Upload store image (logo, banner, gallery)
   */
  static async uploadImage(
    storeId: number,
    file: File,
    imageType: string,
    onUploadProgress?: (progress: number) => void
  ): Promise<StoreImageUploadResponse> {
    const formData = new FormData();
    formData.append('storeId', storeId.toString());

    // Route to specific image upload endpoint based on type
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
        formData.append('File', file);
        break;
      default:
        throw new Error(`Unsupported image type: ${imageType}`);
    }

    const response = await apiClient.upload<StoreImageUploadResponse>(
      endpoint,
      formData,
      onUploadProgress
    );

    return response;
  }

  /**
   * Set delivery distance for store
   */
  static async setDeliveryDistance(
    storeId: number,
    deliveryRadiusMi: number
  ): Promise<void> {
    await apiClient.put(
      `${this.BASE_PATH}/${storeId}/deliverydistance/${deliveryRadiusMi}`
    );
  }

  /**
   * Update store setup data
   */
  static async updateStoreSetupData(
    storeId: number,
    data: {
      processorLogistics?: unknown;
      sellingMethods?: string[];
      partnershipRadiusMi?: number;
      selectedPartnerIds?: number[];
      categoryResponses?: { [key: string]: string };
      needsPartnerships?: boolean;
      partnershipType?: string;
    }
  ): Promise<void> {
    await apiClient.put(`${this.BASE_PATH}/${storeId}/setup-data`, data);
  }

  /**
   * Set store open hours
   */
  static async setOpenHours(data: {
    storeId: number;
    openHours: Array<{
      dayOfWeek: number;
      openTime: string | null;
      closeTime: string | null;
      isClosed: boolean;
    }>;
  }): Promise<void> {
    await apiClient.post(`${this.BASE_PATH}/${data.storeId}/openhours`, data);
  }

  /**
   * Set store payment methods
   */
  static async setPaymentMethods(data: {
    storeId: number;
    paymentMethodNames: string[];
  }): Promise<void> {
    await apiClient.post(
      `${this.BASE_PATH}/${data.storeId}/paymentmethods`,
      data
    );
  }

  /**
   * Upload multiple gallery images
   */
  static async uploadGalleryImages(
    storeId: number,
    files: File[]
  ): Promise<StoreImage[]> {
    const formData = new FormData();
    formData.append('storeId', storeId.toString());

    // Append all files to the Files array as expected by backend
    files.forEach((file) => {
      formData.append('Files', file);
    });

    const response = await apiClient.upload<StoreImage[]>(
      `${this.BASE_PATH}/${storeId}/upload-gallery`,
      formData
    );

    return response;
  }

  /**
   * Upload store logo
   */
  static async uploadLogo(
    storeId: number,
    file: File
  ): Promise<StoreImageUploadResponse> {
    return this.uploadImage(storeId, file, 'logo');
  }

  /**
   * Upload store banner
   */
  static async uploadBanner(
    storeId: number,
    file: File
  ): Promise<StoreImageUploadResponse> {
    return this.uploadImage(storeId, file, 'banner');
  }

  /**
   * Get store images by type
   */
  static async getStoreImages(
    storeId: number,
    imageType?: string
  ): Promise<StoreImage[]> {
    try {
      const response = await apiClient.get<StoreImage[]>(
        `${this.BASE_PATH}/${storeId}/images${imageType ? `?imageType=${imageType}` : ''}`
      );
      return response;
    } catch {
      return [];
    }
  }

  /**
   * Delete store image
   */
  static async deleteImage(storeId: number, imageId: number): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${storeId}/images/${imageId}`);
  }

  /**
   * Update image order/sort
   */
  static async updateImageOrder(
    _storeId: number,
    _imageUpdates: Array<{ imageId: number; sortOrder: number }>
  ): Promise<void> {
    // Note: Image reorder endpoint not implemented in backend yet
    throw new Error('Image reorder functionality not implemented in backend');
  }

  /**
   * Submit store for review/approval
   */
  static async submitStore(
    data: StoreSubmissionRequest
  ): Promise<StoreSubmissionResponse> {
    const response = await apiClient.post<StoreSubmissionResponse>(
      `${this.SUBMISSIONS_PATH}/${data.storeId}/submit-for-review`,
      data
    );
    return response;
  }

  /**
   * Get store submission status
   */
  static async getStoreStatus(storeId: number): Promise<StoreStatusResponse> {
    try {
      // Note: Store status endpoint maps to submission status
      const response = await apiClient.get<StoreStatusResponse>(
        `${this.SUBMISSIONS_PATH}/${storeId}/status`
      );
      return response;
    } catch {
      // Return default status on error
      return {
        storeId,
        status: 'draft',
        submissionDate: null,
        reviewDate: null,
        approvalDate: null,
        rejectionReason: null,
        canEdit: true,
        canSubmit: false,
        requiredFields: [],
      };
    }
  }

  /**
   * Get store branding data (logo, banner, gallery images)
   */
  static async getBrandingData(storeId: number): Promise<{
    logoUrl?: string;
    logoImage?: StoreImage;
    bannerUrl?: string;
    bannerImage?: StoreImage;
    galleryImages?: StoreImage[];
    lastUpdated?: string;
  }> {
    try {
      const images = await this.getStoreImages(storeId);

      const logoImage = images.find((img) => img.imageType === 'logo');
      const bannerImage = images.find((img) => img.imageType === 'banner');
      const galleryImages = images.filter((img) => img.imageType === 'gallery');

      return {
        logoUrl: logoImage?.fileUrl,
        logoImage,
        bannerUrl: bannerImage?.fileUrl,
        bannerImage,
        galleryImages: galleryImages.sort((a, b) => a.sortOrder - b.sortOrder),
        lastUpdated: images.length > 0 ? new Date().toISOString() : undefined,
      };
    } catch {
      return [];
    }
  }

  /**
   * Save branding data
   */
  static async saveBrandingData(
    storeId: number,
    data: {
      logoFile?: File;
      bannerFile?: File;
      galleryFiles?: File[];
      removeImageIds?: number[];
    },
    onUploadProgress?: (progress: number) => void
  ): Promise<void> {
    // Remove images first
    if (data.removeImageIds?.length) {
      await Promise.all(
        data.removeImageIds.map((imageId) => this.deleteImage(storeId, imageId))
      );
    }

    // Upload new images
    const uploadPromises: Promise<StoreImageUploadResponse>[] = [];

    if (data.logoFile) {
      uploadPromises.push(
        this.uploadImage(storeId, data.logoFile, 'logo', onUploadProgress)
      );
    }

    if (data.bannerFile) {
      uploadPromises.push(
        this.uploadImage(storeId, data.bannerFile, 'banner', onUploadProgress)
      );
    }

    if (data.galleryFiles?.length) {
      data.galleryFiles.forEach((file) => {
        uploadPromises.push(
          this.uploadImage(storeId, file, 'gallery', onUploadProgress)
        );
      });
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }
  }

  /**
   * Validate store for submission
   */
  static async validateStore(_storeId: number): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    requiredFields: string[];
  }> {
    // Note: Store validation endpoint not implemented yet
    return {
      isValid: true,
      errors: [],
      warnings: [],
      requiredFields: [],
    };
  }

  /**
   * Get store setup progress
   */
  static async getSetupProgress(_storeId: number): Promise<{
    overallProgress: number;
    steps: Array<{
      name: string;
      completed: boolean;
      required: boolean;
      progress: number;
    }>;
  }> {
    // Note: Setup progress endpoint not implemented, return mock data
    const response = {
      overallProgress: 75,
      steps: [
        {
          name: 'Basic Information',
          completed: true,
          required: true,
          progress: 100,
        },
        { name: 'Address', completed: true, required: true, progress: 100 },
        { name: 'Branding', completed: false, required: false, progress: 50 },
        { name: 'Products', completed: false, required: true, progress: 0 },
      ],
    };

    return response;
  }

  // Get store application status
  static async getApplicationStatus(
    storeId: number
  ): Promise<ApplicationStatusResponse> {
    const response = await apiClient.get<ApplicationStatusResponse>(
      `${this.SUBMISSIONS_PATH}/${storeId}/submission-status`
    );
    return response;
  }
}

export default OpenShopApiService;

// Named export for compatibility
export { OpenShopApiService };
