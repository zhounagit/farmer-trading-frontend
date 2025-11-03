// Consolidated Store Types - Single Source of Truth

export interface Store extends BaseStoreData {
  // Computed properties
  isProducer: boolean;
  isProcessor: boolean;
  isHybrid: boolean;
  isIndependent: boolean;

  // Related data (optional for basic operations)
  addresses?: StoreAddress[];
  categories?: StoreCategory[];
  images?: StoreImage[];
  openHours?: StoreOpenHours[];
  paymentMethods?: StorePaymentMethod[];
  setupFlowData?: Record<string, unknown>;
}

// Base store data without relations
export interface BaseStoreData {
  storeId: number;
  storeName: string;
  storeCreatorId: number;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
  deliveryRadiusMi?: number;
  approvalStatus: ApprovalStatus;
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
  storeType: StoreType;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences?: string;
}

// Store Address
export interface StoreAddress {
  addressId: number;
  storeId: number;
  addressType: AddressType;
  locationName?: string;
  contactPhone: string;
  contactEmail?: string;
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

  // Computed coordinates (optional)
  latitude?: number;
  longitude?: number;
}

// Store Category
export interface StoreCategory {
  categoryId: number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// Store Category Assignment
export interface StoreCategoryAssignment {
  storeId: number;
  categoryId: number;
  category: StoreCategory;
  assignedAt: string;
}

// Store Image
export interface StoreImage {
  imageId: number;
  storeId: number;
  imageType: ImageType;
  filePath: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Optional computed properties
  url?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  fullUrl?: string;

  // Video-specific properties
  isVideo?: boolean;
  videoDuration?: number; // in seconds
  externalVideoUrl?: string; // For YouTube/Vimeo URLs
}

// Store Open Hours
export interface StoreOpenHours {
  storeId: number;
  dayOfWeek: number; // 0-6, Sunday to Saturday
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  isClosed: boolean;
  isAllDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment Method
export interface PaymentMethod {
  methodId: number;
  methodName: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder?: number;
}

// Store Payment Method Assignment
export interface StorePaymentMethod {
  storeId: number;
  methodId: number;
  paymentMethod: PaymentMethod;
  isActive: boolean;
  acceptsOnline?: boolean;
  instructions?: string;
  assignedAt: string;
}

// Enums and Constants
export type StoreType = 'producer' | 'processor' | 'retailer' | 'hybrid';
export type ApprovalStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'suspended';
export type AddressType =
  | 'business'
  | 'pickup'
  | 'farmgate'
  | 'delivery'
  | 'billing';
export type ImageType = 'logo' | 'banner' | 'gallery' | 'hero' | 'thumbnail';

// Request/Response Types
export interface CreateStoreRequest {
  storeName: string;
  description?: string;
  storeType: StoreType;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  contactPhone?: string;
  contactEmail?: string;
  deliveryRadiusMi?: number;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences?: string;

  // Optional initial setup data
  categoryIds?: number[];
  paymentMethodIds?: number[];
  setupFlowData?: Record<string, unknown>;
}

export interface UpdateStoreRequest {
  storeName?: string;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  deliveryRadiusMi?: number;
  partnershipRadiusMi?: number;
  autoAcceptPartnerships?: boolean;
  partnershipPreferences?: string;
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
}

export interface StoreAddressRequest {
  AddressType: AddressType;
  LocationName: string;
  ContactPhone: string;
  ContactEmail: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country?: string;
  IsPrimary?: boolean;
  PickupInstructions?: string;
}

export interface StoreOpenHoursRequest {
  storeId: number;
  hours: {
    dayOfWeek: number;
    openTime?: string;
    closeTime?: string;
    isClosed: boolean;
    isAllDay?: boolean;
  }[];
}

export interface StorePaymentMethodsRequest {
  storeId: number;
  methodIds: number[];
}

export interface StoreCategoriesRequest {
  storeId: number;
  categoryIds: number[];
}

// Response Types
export interface StoreListResponse {
  stores: Store[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface StoreAccessResponse {
  canAccess: boolean;
  accessLevel: 'owner' | 'manager' | 'employee' | 'viewer' | 'none';
  permissions: string[];
  role?: string;
}

export interface StoreStatsResponse {
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  inventoryCount: number;
  period: {
    startDate: string;
    endDate: string;
  };
}

// Search and Filter Types
export interface StoreSearchParams {
  query?: string;
  categoryIds?: number[];
  storeType?: StoreType;
  location?: {
    latitude: number;
    longitude: number;
    radiusMi?: number;
  };
  deliveryAvailable?: boolean;
  pickupAvailable?: boolean;
  minRating?: number;
  paymentMethods?: number[];
  sortBy?: 'name' | 'rating' | 'distance' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface StoreFilters {
  approvalStatus?: ApprovalStatus[];
  storeType?: StoreType[];
  categoryIds?: number[];
  hasLogo?: boolean;
  hasBanner?: boolean;
  hasInventory?: boolean;
  createdAfter?: string;
  createdBefore?: string;
}

// Form Types (for UI components)
export interface StoreFormData {
  // Basic Information
  storeName: string;
  description: string;
  storeType: StoreType;
  contactPhone: string;
  contactEmail: string;

  // Capabilities
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;

  // Partnership Settings
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences: string;

  // Delivery Settings
  deliveryRadiusMi: number;

  // Categories and Payment Methods
  selectedCategoryIds: number[];
  selectedPaymentMethodIds: number[];

  // Operating Hours
  openHours: {
    [day: number]: {
      isClosed: boolean;
      openTime: string;
      closeTime: string;
      isAllDay: boolean;
    };
  };

  // Addresses
  businessAddress: StoreAddressFormData;
  pickupAddress: StoreAddressFormData;
  farmgateAddress: StoreAddressFormData;

  // Images
  logoFile?: File;
  bannerFile?: File;
  galleryFiles?: File[];
}

export interface StoreAddressFormData {
  locationName: string;
  contactPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  pickupInstructions: string;
  sameAsBusinessAddress: boolean;
}

// Validation Types
export interface StoreValidationErrors {
  storeName?: string;
  description?: string;
  storeType?: string;
  contactPhone?: string;
  contactEmail?: string;
  deliveryRadiusMi?: string;
  partnershipRadiusMi?: string;
  selectedCategoryIds?: string;
  selectedPaymentMethodIds?: string;
  openHours?: Record<string, string>;
  businessAddress?: Partial<Record<keyof StoreAddressFormData, string>>;
  pickupAddress?: Partial<Record<keyof StoreAddressFormData, string>>;
  farmgateAddress?: Partial<Record<keyof StoreAddressFormData, string>>;
}

// Constants
export const STORE_TYPES: {
  value: StoreType;
  label: string;
  description: string;
}[] = [
  {
    value: 'producer',
    label: 'Producer',
    description: 'Grows/raises products directly',
  },
  {
    value: 'processor',
    label: 'Processor',
    description: 'Transforms raw products into finished goods',
  },
  {
    value: 'retailer',
    label: 'Retailer',
    description: 'Sells products to end customers',
  },
  {
    value: 'hybrid',
    label: 'Hybrid',
    description: 'Combination of producer/processor/retailer',
  },
];

export const ADDRESS_TYPES: { value: AddressType; label: string }[] = [
  { value: 'business', label: 'Business Address' },
  { value: 'pickup', label: 'Pickup Location' },
  { value: 'farmgate', label: 'Farm Gate Sales' },
  { value: 'delivery', label: 'Delivery Hub' },
  { value: 'billing', label: 'Billing Address' },
];

export const IMAGE_TYPES: { value: ImageType; label: string }[] = [
  { value: 'logo', label: 'Logo' },
  { value: 'banner', label: 'Banner' },
  { value: 'hero', label: 'Hero Image' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'thumbnail', label: 'Thumbnail' },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

// Default values
export const DEFAULT_STORE_FORM_DATA: StoreFormData = {
  storeName: '',
  description: '',
  storeType: 'producer',
  contactPhone: '',
  contactEmail: '',
  canProduce: true,
  canProcess: false,
  canRetail: true,
  partnershipRadiusMi: 25,
  autoAcceptPartnerships: false,
  partnershipPreferences: '',
  deliveryRadiusMi: 10,
  selectedCategoryIds: [],
  selectedPaymentMethodIds: [],
  openHours: {},
  businessAddress: {
    locationName: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    pickupInstructions: '',
    sameAsBusinessAddress: false,
  },
  pickupAddress: {
    locationName: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    pickupInstructions: '',
    sameAsBusinessAddress: true,
  },
  farmgateAddress: {
    locationName: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    pickupInstructions: '',
    sameAsBusinessAddress: true,
  },
};

// Featured Products Type for Backend Response
export interface FeaturedProductDto {
  itemId: number;
  itemName: string;
  description?: string;
  price: number;
  unit: string;
  quantityAvailable: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  categoryName?: string;
}
