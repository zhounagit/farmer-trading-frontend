export interface Store {
  storeId?: number;
  storeName: string;
  ownerId?: number;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
  businessAddressId?: number;
  pickupAddressId?: number;
  farmgateAddressId?: number;
  openHours: StoreOpenHours;
  acceptedPaymentMethods: string[];
  deliveryRadiusKm: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  lastReviewedAt?: string;
  createdByUserId?: number;
  updatedByUserId?: number;
  slug?: string;
}

export interface StoreOpenHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // Format: "HH:MM"
  closeTime?: string; // Format: "HH:MM"
  isAllDay?: boolean;
}

export interface StoreAddress {
  addressId?: number;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  addressType: 'business' | 'pickup' | 'farmgate';
  isDefault?: boolean;
}

export interface CreateStoreRequest {
  storeName: string;
  description?: string;
  openHours: StoreOpenHours;
  acceptedPaymentMethods: string[];
  deliveryRadiusKm: number;
  businessAddress?: Omit<StoreAddress, 'addressId' | 'addressType'>;
  pickupAddress?: Omit<StoreAddress, 'addressId' | 'addressType'>;
  farmgateAddress?: Omit<StoreAddress, 'addressId' | 'addressType'>;
}

export interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
  businessAddressId?: number;
  pickupAddressId?: number;
  farmgateAddressId?: number;
}

export interface StoreListResponse {
  stores: Store[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface StoreAccessResponse {
  canAccess: boolean;
  accessLevel: 'owner' | 'manager' | 'employee' | 'none';
  permissions: string[];
}

// Form-specific types
export interface StoreFormData {
  // Basic Information
  storeName: string;
  description: string;
  deliveryRadiusKm: number;
  acceptedPaymentMethods: string[];

  // Operating Hours
  openHours: StoreOpenHours;

  // Addresses
  businessAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  pickupAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    sameAsBusinessAddress: boolean;
  };
  farmgateAddress: {
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    sameAsBusinessAddress: boolean;
  };

  // Images
  logoFile?: File;
  bannerFile?: File;
  featuredImageFiles?: File[];
}

export interface StoreValidationErrors {
  storeName?: string;
  description?: string;
  deliveryRadiusKm?: string;
  acceptedPaymentMethods?: string;
  openHours?: string;
  businessAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  pickupAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  farmgateAddress?: {
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

// Constants
export const PAYMENT_METHODS = [
  'cash',
  'card',
  'bank_transfer',
  'mobile_money',
  'crypto',
  'check',
] as const;

export const STORE_CATEGORIES = [
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Grains & Cereals',
  'Herbs & Spices',
  'Organic Products',
  'Processed Foods',
  'Beverages',
  'Seeds & Plants',
  'Farm Equipment',
  'Baked Goods',
  'Preserved Foods',
  'Honey & Bee Products',
  'Nuts & Dried Fruits',
  'Flowers & Plants',
  'Farm Tours & Experiences',
  'Handmade Crafts',
  'Pet & Animal Feed',
  'Other',
] as const;

export const DELIVERY_RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100+ km' },
] as const;

export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type StoreCategory = (typeof STORE_CATEGORIES)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]['key'];
