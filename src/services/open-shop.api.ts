import { apiService } from './api';
import { type StoreImage } from '../types/open-shop.types';

// Define types locally to avoid import issues
interface StoreCreationRequest {
  storeName: string;
  description: string;
  categoryIds: number[];
  storeCreatorEmail: string;
  createdAt: string;
}

interface StoreCreationResponse {
  store_id: number;
}

// Store Submission Types
interface StoreSubmissionRequest {
  storeId: number;
  agreedToTermsAt: string;
  submissionNotes?: string;
  termsVersion: string;
}

interface ApplicationStatusHistory {
  status: string;
  timestamp: string;
  updatedBy: number;
  notes?: string;
}

interface StoreSubmissionResponse {
  submissionId: string;
  storeId: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  estimatedReviewTime: string;
  reviewerAssignedAt?: string;
  reviewerId?: number;
  statusHistory: ApplicationStatusHistory[];
}

interface ApplicationStatusResponse {
  submissionId: string;
  storeId: number;
  currentStatus:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'needs_revision';
  submittedAt?: string;
  reviewStartedAt?: string;
  completedAt?: string;
  estimatedCompletionDate?: string;
  reviewerNotes?: string;
  requiredActions?: string[];
  statusHistory: ApplicationStatusHistory[];
}

interface AddressCreationRequest {
  StoreId: number;
  AddressType: string;
  LocationName: string;
  ContactPhone: string;
  StreetLine: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  IsPrimary: boolean;
  IsActive: boolean;
}

interface AddressCreationResponse {
  address_id: number;
}

interface OpenHoursRequest {
  storeId: number;
  openHours: DaySchedule[];
}

interface DaySchedule {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  openTime: string | null; // "HH:MM:SS" format
  closeTime: string | null; // "HH:MM:SS" format
  isClosed: boolean;
}

interface PaymentMethodsRequest {
  StoreId: number;
  PaymentMethods: string[];
  CreatedAt?: string;
}

export class OpenShopApiService {
  // Step 1: Create initial store
  static async createStore(
    data: StoreCreationRequest
  ): Promise<StoreCreationResponse> {
    return apiService.post<StoreCreationResponse>('/api/stores', data);
  }

  // Step 2: Create store address
  static async createStoreAddress(
    storeId: number,
    data: Omit<AddressCreationRequest, 'StoreId'>
  ): Promise<AddressCreationResponse> {
    const payload = {
      ...data,
      StoreId: storeId,
    };

    console.log('=== OpenShopApiService.createStoreAddress DEBUG ===');
    console.log('Store ID:', storeId);
    console.log('Input data:', JSON.stringify(data, null, 2));
    console.log('Final payload:', JSON.stringify(payload, null, 2));
    console.log('API URL:', `/api/stores/${storeId}/address`);

    return apiService.post<AddressCreationResponse>(
      `/api/stores/${storeId}/address`,
      payload
    );
  }

  // Step 2: Set delivery distance
  static async setDeliveryDistance(
    storeId: number,
    deliveryRadiusMi: number
  ): Promise<void> {
    return apiService.put<void>(
      `/api/stores/${storeId}/deliverydistance/${deliveryRadiusMi}`,
      {}
    );
  }

  // Step 3: Set store open hours
  static async setOpenHours(data: OpenHoursRequest): Promise<void> {
    console.log('=== OpenShopApiService.setOpenHours CALLED ===');
    console.log('Open hours data:', JSON.stringify(data, null, 2));
    console.log('API URL:', `/api/stores/${data.storeId}/openhours`);

    const result = await apiService.post<void>(
      `/api/stores/${data.storeId}/openhours`,
      data
    );
    console.log('✅ setOpenHours completed successfully');
    return result;
  }

  // Step 3: Set payment methods
  static async setPaymentMethods(data: {
    storeId: number;
    paymentMethodNames: string[];
  }): Promise<void> {
    console.log('=== OpenShopApiService.setPaymentMethods CALLED ===');
    console.log('Payment methods data:', JSON.stringify(data, null, 2));
    console.log('API URL:', `/api/stores/${data.storeId}/paymentmethods`);
    console.log('Payment method names:', data.paymentMethodNames);
    console.log('Number of payment methods:', data.paymentMethodNames.length);

    // Transform frontend data structure to match backend StorePaymentMethods model
    const payload: PaymentMethodsRequest = {
      StoreId: data.storeId,
      PaymentMethods: data.paymentMethodNames,
      CreatedAt: new Date().toISOString(),
    };

    console.log('Transformed payload:', JSON.stringify(payload, null, 2));

    const result = await apiService.post<void>(
      `/api/stores/${data.storeId}/paymentmethods`,
      payload
    );
    console.log('✅ setPaymentMethods completed successfully');
    return result;
  }

  // Optional: Upload store logo
  static async uploadLogo(
    storeId: number,
    logoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<StoreImage> {
    console.log('🎨 === OpenShopApiService.uploadLogo CALLED ===');
    console.log('Store ID:', storeId);
    console.log('Logo file:', {
      name: logoFile.name,
      size: logoFile.size,
      type: logoFile.type,
    });

    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    formData.append('file', logoFile);

    console.log('📤 FormData created:');
    console.log('- storeId:', formData.get('storeId'));
    console.log('- file:', formData.get('file'));

    const endpoint = `/api/stores/${storeId}/upload-logo`;
    console.log('🌐 API endpoint:', endpoint);
    console.log('🚀 About to call apiService.upload...');

    try {
      const result = await apiService.upload<StoreImage>(
        endpoint,
        formData,
        onProgress
      );
      console.log('✅ Upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Upload failed in OpenShopApiService:', error);
      throw error;
    }
  }

  // Optional: Upload store banner
  static async uploadBanner(
    storeId: number,
    bannerFile: File,
    onProgress?: (progress: number) => void
  ): Promise<StoreImage> {
    console.log('🖼️ === OpenShopApiService.uploadBanner CALLED ===');
    console.log('Store ID:', storeId);
    console.log('Banner file:', {
      name: bannerFile.name,
      size: bannerFile.size,
      type: bannerFile.type,
    });

    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    formData.append('file', bannerFile);

    const endpoint = `/api/stores/${storeId}/upload-banner`;
    console.log('🌐 API endpoint:', endpoint);

    try {
      const result = await apiService.upload<StoreImage>(
        endpoint,
        formData,
        onProgress
      );
      console.log('✅ Banner upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Banner upload failed in OpenShopApiService:', error);
      throw error;
    }
  }

  // Optional: Upload store gallery images
  static async uploadGalleryImages(
    storeId: number,
    imageFiles: File[],
    onProgress?: (progress: number) => void
  ): Promise<StoreImage[]> {
    console.log('🖼️ === OpenShopApiService.uploadGalleryImages CALLED ===');
    console.log('Store ID:', storeId);
    console.log(
      'Gallery files:',
      imageFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      }))
    );

    const formData = new FormData();
    formData.append('storeId', storeId.toString());
    imageFiles.forEach((file) => {
      formData.append('files', file);
    });

    const endpoint = `/api/stores/${storeId}/upload-gallery`;
    console.log('🌐 API endpoint:', endpoint);

    try {
      const result = await apiService.upload<StoreImage[]>(
        endpoint,
        formData,
        onProgress
      );
      console.log('✅ Gallery upload successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Gallery upload failed in OpenShopApiService:', error);
      throw error;
    }
  }

  // Get store details for review
  static async getStoreDetails(storeId: number): Promise<unknown> {
    return apiService.get(`/api/stores/${storeId}`);
  }

  // Submit store for review
  static async submitStoreForReview(
    request: StoreSubmissionRequest
  ): Promise<StoreSubmissionResponse> {
    console.log('=== SUBMITTING STORE FOR REVIEW ===');
    console.log('Request:', request);

    const result = await apiService.post<StoreSubmissionResponse>(
      `/api/store-submissions/${request.storeId}/submit-for-review`,
      request
    );

    console.log('✅ Store submission completed successfully');
    console.log('Response:', result);
    return result;
  }

  // Get store application status
  static async getApplicationStatus(
    storeId: number
  ): Promise<ApplicationStatusResponse> {
    console.log('=== GETTING APPLICATION STATUS ===');
    console.log('Store ID:', storeId);

    const result = await apiService.get<ApplicationStatusResponse>(
      `/api/store-submissions/${storeId}/submission-status`
    );

    console.log('✅ Application status retrieved successfully');
    console.log('Response:', result);
    return result;
  }
}

export default OpenShopApiService;
