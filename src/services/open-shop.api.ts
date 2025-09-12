import { apiService } from './api';

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

interface AddressCreationRequest {
  storeId: number;
  addressType: string;
  locationName: string;
  contactPhone: string;
  streetLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
  isActive: boolean;
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
  storeId: number;
  paymentMethodNames: string[];
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
    data: Omit<AddressCreationRequest, 'storeId'>
  ): Promise<AddressCreationResponse> {
    const payload = {
      ...data,
      storeId,
    };
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
  static async setPaymentMethods(data: PaymentMethodsRequest): Promise<void> {
    console.log('=== OpenShopApiService.setPaymentMethods CALLED ===');
    console.log('Payment methods data:', JSON.stringify(data, null, 2));
    console.log('API URL:', `/api/stores/${data.storeId}/paymentmethods`);
    console.log('Payment method names:', data.paymentMethodNames);
    console.log('Number of payment methods:', data.paymentMethodNames.length);

    const result = await apiService.post<void>(
      `/api/stores/${data.storeId}/paymentmethods`,
      data
    );
    console.log('✅ setPaymentMethods completed successfully');
    return result;
  }

  // Optional: Upload store logo
  static async uploadLogo(
    storeId: number,
    logoFile: File,
    onProgress?: (progress: number) => void
  ): Promise<{ logoUrl: string }> {
    const formData = new FormData();
    formData.append('logo', logoFile);

    return apiService.upload<{ logoUrl: string }>(
      `/api/stores/${storeId}/logo`,
      formData,
      onProgress
    );
  }

  // Optional: Upload store banner
  static async uploadBanner(
    storeId: number,
    bannerFile: File,
    onProgress?: (progress: number) => void
  ): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('banner', bannerFile);

    return apiService.upload<{ bannerUrl: string }>(
      `/api/stores/${storeId}/banner`,
      formData,
      onProgress
    );
  }

  // Optional: Upload store gallery images
  static async uploadGalleryImages(
    storeId: number,
    imageFiles: File[],
    onProgress?: (progress: number) => void
  ): Promise<{ imageUrls: string[] }> {
    const formData = new FormData();
    imageFiles.forEach((file, index) => {
      formData.append(`gallery_${index}`, file);
    });

    return apiService.upload<{ imageUrls: string[] }>(
      `/api/stores/${storeId}/gallery`,
      formData,
      onProgress
    );
  }

  // Get store details for review
  static async getStoreDetails(storeId: number): Promise<any> {
    return apiService.get(`/api/stores/${storeId}`);
  }
}

export default OpenShopApiService;
