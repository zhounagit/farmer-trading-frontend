/**
 * Open Shop Types - Shared contracts for store creation and submission process
 * Matches backend FarmerTrading.Application.Requests.Store namespace
 */

// Step Props for Open Shop wizard
export interface StepProps {
  formState: OpenShopFormState;
  updateFormState: (updates: Partial<OpenShopFormState>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isEditMode?: boolean;
}

// Main form state for Open Shop process
export interface OpenShopFormState {
  currentStep: number;
  storeBasics: StoreBasicsStepData;
  locationLogistics: LocationLogisticsStepData;
  partnerships: PartnershipsStepData;
  storeHours: StoreHoursStepData;
  branding: BrandingStepData;
  agreedToTerms: boolean;
  storeId?: number;
  submissionId?: string;
  submissionStatus?: string;
  submittedAt?: string;
}

// Step-specific data types
export interface StoreBasicsStepData {
  storeName: string;
  description: string;
  categories: string[];
  needsPartnerships?: boolean;
  setupFlow?: {
    selectedCategoryIds: number[];
    categoryResponses: Record<string, string>;
    partnershipRadiusMi?: number;
    selectedPartnerIds: number[];
    derivedStoreType?: string;
    derivedCanProduce: boolean;
    derivedCanProcess: boolean;
    derivedCanRetail: boolean;
    needsPartnerships: boolean;
    partnershipType?: string;
  };
}

export interface LocationLogisticsStepData {
  businessAddress: StoreAddressFormData;
  sellingMethods: SellingMethod[];
  farmgateAddress?: StoreAddressFormData;
  farmgateSameAsBusinessAddress?: boolean;
  deliveryRadiusMi?: number;
  pickupPointAddress?: StoreAddressFormData;
  pickupPointNickname?: string;
}

export interface PartnershipsStepData {
  partnershipRadiusMi: number;
  selectedPartnerIds: number[];
  partnershipType?: string;
  potentialPartners: PotentialPartner[];
}

export interface StoreHoursStepData {
  sunday: DayHours;
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
}

// Payment methods are now platform-controlled and managed centrally
// No store-specific payment method selection needed

export interface BrandingStepData {
  logoFile?: File;
  bannerFile?: File;
  galleryFiles?: File[];
  videoFile?: File;
  logoUrl?: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
}

// Supporting types
export interface StoreAddressFormData {
  locationName: string;
  contactPhone: string;
  contactEmail: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  pickupInstructions: string;
  sameAsBusinessAddress: boolean;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  isAllDay?: boolean;
}

export type SellingMethod = 'pickup' | 'local-delivery';

// Constants
export const STEP_NAMES = [
  'Store Basics',
  'Location & Logistics',
  'Partnerships',
  'Store Policies',
  'Branding & Visuals',
  'Review & Submit',
] as const;

export const SELLING_METHODS: {
  value: SellingMethod;
  label: string;
  description: string;
}[] = [
  {
    value: 'pickup',
    label: 'Pickup',
    description: 'Customers come to pickup locations to get their orders',
  },
  {
    value: 'local-delivery',
    label: 'Local Delivery',
    description: 'You deliver orders to customers within your delivery radius',
  },
];

// Draft data for auto-save functionality
export interface SavedDraftData {
  userId: number;
  storeId?: number;
  formState: OpenShopFormState;
  savedAt: string;
  version: string;
}

import type { Store, StoreType } from '../../../shared/types/store';

// Video Upload Types
export interface StoreVideoUploadRequest {
  videoFile: File;
  storeId?: number;
}

export interface SetVideoUrlRequest {
  videoUrl: string;
  storeId?: number;
}

// Store Submission Request/Response Types
export interface StoreSubmissionRequest {
  storeId: number;
  agreedToTermsAt: string;
  submissionNotes?: string;
  termsVersion: string;
}

export interface StoreSubmissionResponse {
  submissionId: string;
  storeId: number;
  status: string;
  submittedAt: string;
  estimatedReviewTime: string;
  reviewerAssignedAt?: string;
  reviewerId?: number;
}

export interface ApplicationStatusResponse {
  submissionId: string;
  storeId: number;
  currentStatus: string;
  submittedAt?: string;
  reviewStartedAt?: string;
  completedAt?: string;
  estimatedCompletionDate?: string;
  reviewerNotes?: string;
  requiredActions?: string[];
  statusHistory: ApplicationStatusHistoryResponse[];
}

export interface ApplicationStatusHistoryResponse {
  status: string;
  timestamp: string;
  updatedBy: number;
  notes?: string;
  updatedByName?: string;
}

// Store Setup Flow Types
export interface CreateStoreWithSetupFlowRequest {
  storeName: string;
  description?: string;
  categories: string[];
  setupFlow: StoreSetupFlowData;
}

export interface StoreSetupFlowData {
  derivedStoreType?: string;
  derivedCanProduce: boolean;
  derivedCanProcess: boolean;
  derivedCanRetail: boolean;
  partnershipRadiusMi?: number;
  needsPartnerships: boolean;
  partnershipType?: string;
  categoryResponses: Record<string, unknown>;
}

export interface PotentialPartner {
  storeId: number;
  storeName: string;
  storeSlug?: string;
  description?: string;
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  logoUrl?: string;
  address?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
  };
  distanceMiles: number;
  autoAcceptPartnerships: boolean;
  partnershipRadiusMi: number;
  canPartnerWith: boolean;
  existingPartnershipStatus?: string;
}

export interface CreateStoreWithSetupFlowResponse {
  storeId: number;
  message: string;
  storeType: string;
  needsPartnerships: boolean;
  partnershipType: string;
}

// Store Basics Types
export interface StoreBasics {
  storeName: string;
  description?: string;
  categories: string[];
  storeCreatorId: number;
  storeCreatorEmail: string;
  createdAt: string;
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences?: string;
}

export interface CreateStoreResponse {
  storeId: number;
  accessToken: string;
  userType: string;
  expires: string;
}

// Store Access Types
export interface StoreAccessResponse {
  canAccess: boolean;
  reason: string;
  accessLevel: string;
  permissions: string[];
}

// Store Metrics Types
export interface StoreMetrics {
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

// Featured Products Types
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

export interface AddFeaturedProductRequest {
  itemId: number;
  displayOrder: number;
}

export interface SetFeaturedProductsRequest {
  itemIds: number[];
}

// Enhanced Store Types
export interface EnhancedStoreDto {
  storeId: number;
  storeName: string;
  description?: string;
  slug: string;
  storeCreatorId: number;
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  partnershipRadiusMi: number;
  autoAcceptPartnerships: boolean;
  partnershipPreferences?: string;
  images: {
    logoUrl?: string;
    bannerUrl?: string;
    gallery: Array<{
      imageId: number;
      filePath: string;
      imageType: string;
      caption?: string;
      displayOrder: number;
      uploadedAt: string;
    }>;
    video?: {
      imageId: number;
      filePath: string;
      mimeType: string;
      uploadedAt: string;
      isExternalVideo?: boolean;
    };
  };
  addresses: {
    business?: StoreAddress;
    pickupLocations: StoreAddress[];
  };
  contactInfo: {
    phone?: string;
    email?: string;
    whatsApp?: string;
    website?: string;
  };
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youTube?: string;
    tikTok?: string;
    linkedIn?: string;
  };
  operations: {
    deliveryRadiusMiles: number;
    supportsDelivery: boolean;
    supportsPickup: boolean;
    openHours: Array<{
      dayOfWeek: string;
      openTime?: string;
      closeTime?: string;
      isClosed: boolean;
      formattedHours?: string;
    }>;
    isOpenNow: boolean;
    nextOpenTime?: string;
  };
  categories: StoreCategory[];
  featuredProducts: FeaturedProductDto[];
  totalProducts: number;
  storefront: {
    isPublished: boolean;
    publicUrl?: string;
    previewUrl?: string;
    status: string;
    hasCustomization: boolean;
    viewCount: number;
  };
  status: {
    approvalStatus: string;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  submissionStatus?: string; // Status from store_submissions table: submitted, under_review, approved, rejected, needs_revision
  submittedAt?: string;
  reviewStartedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;

  // Computed properties
  isProducer: boolean;
  isProcessor: boolean;
  isHybrid: boolean;
  isIndependent: boolean;
  // Additional properties from backend
  deliveryRadiusMi?: number;
  contactPhone?: string;
  contactEmail?: string;
  logoUrl?: string;
  bannerUrl?: string;
  featuredImages?: string[];
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  lastReviewedAt?: string;
  rejectedAt?: string;
  tierId?: number;
}

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
  latitude?: number;
  longitude?: number;
}

export interface StoreCategory {
  categoryId: number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface StoreImage {
  imageId: number;
  storeId: number;
  imageType: string;
  filePath: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  url?: string;
  thumbnailUrl?: string;

  // Video-specific properties
  isVideo?: boolean;
  videoDuration?: number; // in seconds
  externalVideoUrl?: string; // For YouTube/Vimeo URLs
}

export interface StoreOpenHours {
  storeId: number;
  dayOfWeek: number;
  openTime?: string;
  closeTime?: string;
  isClosed: boolean;
  isAllDay?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment methods are now platform-controlled and managed centrally
// No store-specific payment method configuration needed

// Search and Filter Types
export interface GetEnhancedStoresRequest {
  userId: number;
  searchQuery?: string;
  storeType?: string;
  categoryIds?: number[];
  page?: number;
  pageSize?: number;
}

// User Notification Types
export interface UserNotificationResponse {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

// API Response Types matching backend ApiResponse<T>
export interface ApiResponse<T = unknown> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  meta?: ApiMeta;
}

export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  field?: string;
}

export interface ApiMeta {
  timestamp: string;
  version?: string;
  requestId?: string;
  processingTimeMs?: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  success: boolean;
  message?: string;
  errors?: ApiError[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Error codes matching backend ErrorCodes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;
