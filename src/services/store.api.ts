import { apiService } from './api';

// Store data interfaces based on the database schema
export interface StoreAddress {
  addressId: number;
  storeId: number;
  addressType: string;
  locationName?: string;
  contactPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  pickupInstructions?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCategory {
  categoryId: number;
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface StoreImage {
  imageId: number;
  storeId: number;
  imageType: 'logo' | 'banner' | 'gallery';
  filePath: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreOpenHours {
  storeId: number;
  dayOfWeek: number; // 0-6, Sunday to Saturday
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  methodId: number;
  methodName: string;
}

export interface StorePaymentMethod {
  storeId: number;
  methodId: number;
  paymentMethod: PaymentMethod;
}

export interface ComprehensiveStoreData {
  storeId: number;
  storeName: string;
  storeCreatorId: number;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
  businessAddressId?: number;
  pickupAddressId?: number;
  farmgateAddressId?: number;
  deliveryRadiusMi?: number;
  approvalStatus:
    | 'pending'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'suspended';
  approvalNotes?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  lastReviewedAt?: string;
  rejectedAt?: string;
  contactPhone?: string;
  contactEmail?: string;
  slug?: string;
  tierId?: number;

  // Store type and capabilities
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences?: string;

  // Computed properties
  isProducer: boolean;
  isProcessor: boolean;
  isHybrid: boolean;
  isIndependent: boolean;

  // Related data
  addresses: StoreAddress[];
  categories: StoreCategory[];
  images: StoreImage[];
  openHours: StoreOpenHours[];
  paymentMethods: StorePaymentMethod[];
  setupFlowData?: string; // JSON string containing setup flow data
}

export interface StoreUpdateRequest {
  storeName?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  deliveryRadiusMi?: number;
}

export interface StoreAddressRequest {
  addressType: string;
  locationName?: string;
  contactPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isPrimary?: boolean;
  pickupInstructions?: string;
}

export interface StoreOpenHoursRequest {
  storeId: number;
  hours: {
    dayOfWeek: number;
    openTime?: string;
    closeTime?: string;
    isClosed: boolean;
  }[];
}

export interface StorePaymentMethodsRequest {
  storeId: number;
  methodIds: number[];
}

class StoreApiService {
  // Get comprehensive store details
  static async getComprehensiveStoreDetails(
    storeId: number
  ): Promise<ComprehensiveStoreData> {
    try {
      // Get basic store information
      const store = await apiService.get(`/api/stores/${storeId}`);

      // Get store addresses
      const addresses = await apiService.get(
        `/api/stores/${storeId}/addresses`
      );

      // Get store images
      const images = await apiService.get(`/api/stores/${storeId}/images`);

      // Get store categories (we'll need to implement this endpoint)
      let categories: StoreCategory[] = [];
      try {
        const categoriesResponse = await apiService.get(
          `/api/stores/${storeId}/categories`
        );

        // Handle the actual API response structure: array of objects with nested category
        if (Array.isArray(categoriesResponse)) {
          // Each item has structure: { storeId, categoryId, category: { categoryId, name, description } }
          categories = categoriesResponse
            .map((item) => {
              if (item.category) {
                // Extract the nested category object
                return {
                  categoryId: item.category.categoryId,
                  name: item.category.name,
                  description: item.category.description,
                  iconUrl: item.category.iconUrl,
                };
              } else if (item.categoryId && item.name) {
                // Fallback for direct category structure
                return {
                  categoryId: item.categoryId,
                  name: item.name,
                  description: item.description,
                  iconUrl: item.iconUrl,
                };
              } else {
                return null;
              }
            })
            .filter(Boolean) as StoreCategory[];
        } else if (
          categoriesResponse &&
          (categoriesResponse as any).categories
        ) {
          categories = (categoriesResponse as any).categories;
        } else if (
          categoriesResponse &&
          Array.isArray((categoriesResponse as any).data)
        ) {
          categories = (categoriesResponse as any).data;
        } else {
          categories = [];
        }
      } catch {}

      // Get store open hours
      let openHours: StoreOpenHours[] = [];
      try {
        openHours = await apiService.get(`/api/stores/${storeId}/open-hours`);
      } catch {}

      // Get store payment methods
      let paymentMethods: StorePaymentMethod[] = [];
      try {
        paymentMethods = await apiService.get(
          `/api/stores/${storeId}/payment-methods`
        );
      } catch {}

      const comprehensiveData: ComprehensiveStoreData = {
        ...(store as any),
        // Map backend field names to frontend interface (now properly aligned)
        contactPhone:
          (store as any).contactPhone || (store as any).ContactPhone,
        contactEmail:
          (store as any).contactEmail || (store as any).ContactEmail,
        addresses: addresses || [],
        categories: categories || [],
        images: images || [],
        openHours: openHours || [],
        paymentMethods: paymentMethods || [],
      };

      return comprehensiveData;
    } catch (error) {
      console.error('❌ Failed to fetch comprehensive store details:', error);
      throw error;
    }
  }

  // Update store categories
  static async updateStoreCategories(
    storeId: number,
    categoryIds: number[]
  ): Promise<void> {
    try {
      await apiService.put(`/api/stores/${storeId}/categories`, {
        categoryIds,
      });
    } catch (error) {
      console.error('❌ Failed to update store categories:', error);
      throw error;
    }
  }

  // Delete store image
  static async deleteStoreImage(
    storeId: number,
    imageId: number
  ): Promise<void> {
    try {
      await apiService.delete(`/api/stores/${storeId}/images/${imageId}`);
    } catch (error) {
      console.error('❌ Failed to delete store image:', error);
      throw error;
    }
  }

  // Update store basic information
  static async updateStore(
    storeId: number,
    updateData: StoreUpdateRequest
  ): Promise<any> {
    console.log('🔄 === UPDATING STORE ===');
    console.log('Store ID:', storeId);
    console.log('Update data:', updateData);

    try {
      const result = await apiService.put(`/api/stores/${storeId}`, updateData);
      console.log('✅ Store updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update store:', error);
      throw error;
    }
  }

  // Create or update store address
  static async createStoreAddress(
    storeId: number,
    addressData: StoreAddressRequest
  ): Promise<any> {
    console.log('📍 === CREATING STORE ADDRESS ===');
    console.log('Store ID:', storeId);
    console.log('Address data:', addressData);

    try {
      const result = await apiService.post(`/api/stores/${storeId}/address`, {
        storeId,
        ...addressData,
      });
      console.log('✅ Store address created successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to create store address:', error);
      throw error;
    }
  }

  // Update store address
  static async updateStoreAddress(
    storeId: number,
    addressId: number,
    addressData: Partial<StoreAddressRequest>
  ): Promise<any> {
    console.log('📍 === UPDATING STORE ADDRESS ===');
    console.log('Store ID:', storeId);
    console.log('Address ID:', addressId);
    console.log('Address data:', addressData);

    try {
      const result = await apiService.put(
        `/api/stores/${storeId}/addresses/${addressId}`,
        addressData
      );
      console.log('✅ Store address updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update store address:', error);
      throw error;
    }
  }

  // Update store open hours
  static async updateStoreOpenHours(
    hoursData: StoreOpenHoursRequest
  ): Promise<any> {
    console.log('🕒 === UPDATING STORE OPEN HOURS ===');
    console.log('Hours data:', hoursData);

    try {
      const result = await apiService.post(
        `/api/stores/${hoursData.storeId}/openhours`,
        hoursData
      );
      console.log('✅ Store open hours updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update store open hours:', error);
      throw error;
    }
  }

  // Update store payment methods
  static async updateStorePaymentMethods(
    paymentData: StorePaymentMethodsRequest
  ): Promise<any> {
    console.log('💳 === UPDATING STORE PAYMENT METHODS ===');
    console.log('Payment data:', paymentData);

    try {
      const result = await apiService.post(
        `/api/stores/${paymentData.storeId}/paymentmethods`,
        paymentData
      );
      console.log('✅ Store payment methods updated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to update store payment methods:', error);
      throw error;
    }
  }

  // Get all available payment methods
  static async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    console.log('💳 === FETCHING ALL PAYMENT METHODS ===');

    try {
      const result = await apiService.get('/api/payment-methods');
      console.log('✅ Payment methods fetched:', result);
      return result as PaymentMethod[];
    } catch (error) {
      console.error('❌ Failed to fetch payment methods:', error);
      // Return default payment methods if API fails
      return [
        { methodId: 1, methodName: 'Cash' },
        { methodId: 2, methodName: 'Credit Card' },
        { methodId: 3, methodName: 'Debit Card' },
        { methodId: 4, methodName: 'Venmo' },
        { methodId: 5, methodName: 'PayPal' },
        { methodId: 6, methodName: 'Check' },
      ];
    }
  }

  // Get all available store categories
  static async getAllStoreCategories(): Promise<StoreCategory[]> {
    try {
      const result = await apiService.get('/api/store-categories');
      return result as StoreCategory[];
    } catch (error) {
      console.error('❌ Failed to fetch store categories:', error);
      // Return default categories if API fails
      return [
        { categoryId: 1, name: 'Vegetables' },
        { categoryId: 2, name: 'Fruits' },
        { categoryId: 3, name: 'Herbs' },
        { categoryId: 4, name: 'Dairy' },
        { categoryId: 5, name: 'Meat & Poultry' },
        { categoryId: 6, name: 'Baked Goods' },
        { categoryId: 7, name: 'Preserved Foods' },
        { categoryId: 8, name: 'Honey & Syrup' },
      ];
    }
  }

  // Check if user can access store
  static async canAccessStore(storeId: number): Promise<boolean> {
    try {
      const result = await apiService.get(`/api/stores/${storeId}/can-access`);
      return (result as any).canAccess || false;
    } catch (error) {
      console.error('❌ Failed to check store access:', error);
      return false;
    }
  }

  // Get store open hours
  static async getStoreOpenHours(storeId: number): Promise<StoreOpenHours[]> {
    try {
      const result = await apiService.get(`/api/stores/${storeId}/open-hours`);
      return result as StoreOpenHours[];
    } catch (error) {
      console.error('❌ Failed to fetch store open hours:', error);
      throw error;
    }
  }

  // Get store payment methods
  static async getStorePaymentMethods(
    storeId: number
  ): Promise<StorePaymentMethod[]> {
    try {
      const result = await apiService.get(
        `/api/stores/${storeId}/payment-methods`
      );
      return result as StorePaymentMethod[];
    } catch (error) {
      console.error('❌ Failed to fetch store payment methods:', error);
      throw error;
    }
  }

  // Get store selling methods
  static async getStoreSellingMethods(storeId: number): Promise<string[]> {
    console.log('📦 === FETCHING STORE SELLING METHODS ===');
    console.log('Store ID:', storeId);

    try {
      const result = await apiService.get(
        `/api/stores/${storeId}/selling-methods`
      );
      console.log('✅ Store selling methods fetched:', result);
      return result as string[];
    } catch (error) {
      console.error('❌ Failed to fetch store selling methods:', error);
      // Return default methods as fallback
      console.log('📦 Using default selling methods as fallback');
      return ['on-farm-pickup', 'local-delivery'];
    }
  }

  // Get store delivery radius
  static async getStoreDeliveryRadius(storeId: number): Promise<number> {
    console.log('🚚 === FETCHING STORE DELIVERY RADIUS ===');
    console.log('Store ID:', storeId);

    try {
      const result = await apiService.get(
        `/api/stores/${storeId}/delivery-radius`
      );
      console.log('✅ Store delivery radius fetched:', result);
      return (result as any).deliveryRadiusMi || 0;
    } catch (error) {
      console.error('❌ Failed to fetch store delivery radius:', error);
      return 0;
    }
  }

  // Get store images
  static async getStoreImages(
    storeId: number,
    imageType?: string
  ): Promise<StoreImage[]> {
    console.log('🖼️ === FETCHING STORE IMAGES ===');
    console.log('Store ID:', storeId);
    console.log('Image Type:', imageType);

    try {
      const queryParam = imageType ? `?imageType=${imageType}` : '';
      const result = await apiService.get(
        `/api/stores/${storeId}/images${queryParam}`
      );
      console.log('✅ Store images fetched:', result);
      return result as StoreImage[];
    } catch (error) {
      console.error('❌ Failed to fetch store images:', error);
      return [];
    }
  }
}

export default StoreApiService;
