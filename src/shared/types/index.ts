// Consolidated Types - Single Entry Point

// Core API Types
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
  FileUploadRequest,
  FileUploadResponse,
  ImageUploadResponse,
  BaseEntity,
  Address,
  ContactInfo,
  BusinessHours,
  MediaItem,
  QueryOptions,
  ValidationError,
  ValidationErrorResponse,
  ApiConfig,
  RequestContext,
  HealthCheckResponse
} from './api';

export type {
  ApprovalStatus,
  ActiveStatus
} from './api';

// Auth Types
export type {
  User,
  UserProfile,
  UserAddress,
  UserPreferences,
  NotificationPreferences,
  PrivacyPreferences,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse,
  EmailVerificationRequest,
  PhoneVerificationRequest,
  ResendVerificationRequest,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ProfilePictureUploadResponse,
  Session,
  DeviceInfo,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  TwoFactorLoginRequest,
  DeactivateAccountRequest,
  DeleteAccountRequest,
  AuthState,
  JWTPayload,
  AuthEvent,
  AuthEventData,
  LoginFormData,
  RegisterFormData,
  ProfileFormData,
  AuthValidationErrors
} from './auth';

export type {
  UserRole,
  UserStatus
} from './auth';

export { USER_ROLES, DEFAULT_USER_PREFERENCES } from './auth';

// Store Types
export type {
  Store,
  BaseStoreData,
  StoreAddress,
  StoreCategory,
  StoreCategoryAssignment,
  StoreImage,
  StoreOpenHours,
  PaymentMethod,
  StorePaymentMethod,
  CreateStoreRequest,
  UpdateStoreRequest,
  StoreAddressRequest,
  StoreOpenHoursRequest,
  StorePaymentMethodsRequest,
  StoreCategoriesRequest,
  StoreListResponse,
  StoreAccessResponse,
  StoreStatsResponse,
  StoreSearchParams,
  StoreFilters,
  StoreFormData,
  StoreAddressFormData,
  StoreValidationErrors
} from './store';

export type {
  StoreType,
  AddressType,
  ImageType
} from './store';

export {
  STORE_TYPES,
  ADDRESS_TYPES,
  IMAGE_TYPES,
  DAYS_OF_WEEK,
  DEFAULT_STORE_FORM_DATA
} from './store';

// Inventory Types
export type {
  InventoryItem,
  InventoryImage,
  InventoryVariant,
  VariantAttribute,
  InventoryPricing,
  InventorySeason,
  NutritionalInfo,
  InventoryCategory,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryFilters,
  InventorySearchParams,
  InventoryListResponse,
  InventorySummary,
  InventoryStatsResponse,
  InventoryActivity,
  BulkInventoryOperation,
  BulkInventoryResult,
  InventoryImageUploadRequest,
  InventoryImageUpdateRequest,
  InventoryImportRequest,
  InventoryImportResult,
  InventoryExportRequest,
  ImportError,
  ImportWarning,
  InventoryItemFormData,
  InventoryVariantFormData,
  InventoryValidationErrors
} from './inventory';

export type {
  UnitType,
  InventoryStatus,
  InventoryVisibility,
  Season,
  AvailabilityLevel,
  ActivityType,
  BulkOperation,
  InventorySortBy,
  ImportFormat,
  ExportFormat
} from './inventory';

export {
  UNIT_TYPES,
  INVENTORY_CATEGORIES,
  COMMON_CERTIFICATIONS,
  DEFAULT_INVENTORY_FORM_DATA,
  DEFAULT_NUTRITIONAL_INFO
} from './inventory';

// Storefront Types
export type {
  Storefront,
  StorefrontCustomization,
  StorefrontTheme,
  ColorScheme,
  TypographySettings,
  HeaderSettings,
  NavigationSettings,
  MenuItem,
  HeroSectionSettings,
  HeroContent,
  HeroImage,
  BackgroundSettings,
  ProductDisplaySettings,
  ProductSortOption,
  ProductFilterOption,
  FooterSettings,
  FooterSection,
  SEOSettings,
  SocialMediaSettings,
  StorefrontAnalytics,
  StorefrontProduct,
  ProductBadge,
  ProductVariant,
  StorefrontCategory,
  StorefrontReview,
  StorefrontSearchParams,
  StorefrontSearchResult,
  SearchFilter,
  FilterValue,
  CreateStorefrontRequest,
  UpdateStorefrontRequest,
  StorefrontPublishRequest,
  StorefrontListResponse,
  StorefrontStatsResponse,
  StorefrontActivity,
  StorefrontValidationErrors
} from './storefront';

export type {
  LayoutType,
  StorefrontStatus
} from './storefront';

export {
  STOREFRONT_THEMES,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_STOREFRONT_CUSTOMIZATION
} from './storefront';
