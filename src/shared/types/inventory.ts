// Consolidated Inventory Types - Single Source of Truth

export interface InventoryItem {
  itemId: number;
  storeId: number;
  name: string;
  description?: string;
  sku: string;
  category: string;
  subcategory?: string;
  unit?: string;
  unitType?: UnitType;
  price?: number;
  pricePerUnit?: number;
  quantity?: number;
  quantityAvailable?: number;
  cost?: number;
  minStockLevel?: number;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  isOrganic?: boolean;
  harvestDate?: string;
  expirationDate?: string;
  storageInstructions?: string;
  nutritionalInfo?: NutritionalInfo;
  certifications?: string[];
  tags?: string[];
  isActive?: boolean;
  status?: InventoryStatus;
  visibility?: InventoryVisibility;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
  updatedBy?: number;
  allowOffers?: boolean;
  minOfferPrice?: number;

  // Computed properties
  isInStock?: boolean;
  isLowStock?: boolean;
  isExpiringSoon?: boolean;
  totalValue?: number;

  // Related data (optional)
  images?: InventoryImage[];
  variants?: InventoryVariant[];
  pricing?: InventoryPricing[];
  seasonality?: InventorySeason[];
}

export interface InventoryImage {
  imageId: number;
  itemId: number;
  storageProvider: string;
  bucketName: string;
  objectKey: string;
  originalUrl: string;
  originalUrlOverride: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  hasTransparency: boolean;
  versionUuid: string;
  isCurrentVersion: boolean;
  uploadedAt: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
  uploadedBy: number;

  // Computed properties for backwards compatibility
  url?: string;
  thumbnailUrl?: string;
}

export interface InventoryVariant {
  variantId: number;
  itemId: number;
  variantName: string;
  description?: string;
  sku: string;
  pricePerUnit: number;
  quantityAvailable: number;
  attributes: VariantAttribute[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VariantAttribute {
  attributeName: string;
  attributeValue: string;
  displayName?: string;
}

export interface InventoryPricing {
  pricingId: number;
  itemId: number;
  variantId?: number;
  tierName: string;
  minimumQuantity: number;
  pricePerUnit: number;
  discountPercentage?: number;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventorySeason {
  seasonId: number;
  itemId: number;
  season: Season;
  availability: AvailabilityLevel;
  peakMonths: number[];
  notes?: string;
  isActive: boolean;
}

export interface NutritionalInfo {
  servingSize: string;
  servingUnit: string;
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  dietaryFiber?: number;
  totalSugars?: number;
  addedSugars?: number;
  protein?: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  customNutrients?: { [key: string]: number };
}

export interface InventoryCategory {
  categoryId: number;
  categoryName: string;
  parentCategoryId?: number;
  description?: string;
  iconUrl?: string;
  sortOrder: number;
  isActive: boolean;
  itemCount?: number;
}

// Request/Response Types
export interface CreateInventoryItemRequest {
  storeId: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  minStockLevel?: number;
  allowOffers?: boolean;
  minOfferPrice?: number;
  attributes?: string;
  unit?: string;
  category: string;
  itemType?: string;
  serviceCategory?: string;
  processingTimeDays?: number;
  requiresRawMaterial?: boolean;
}

export interface UpdateInventoryItemRequest {
  storeId?: number;
  name?: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  minStockLevel?: number;
  unit?: string;
  category?: string;
  allowOffers?: boolean;
  minOfferPrice?: number;
}

export interface InventoryFilters {
  storeId?: number;
  category?: string;
  subcategory?: string;
  isOrganic?: boolean;
  isActive?: boolean;
  status?: InventoryStatus[];
  visibility?: InventoryVisibility[];
  inStock?: boolean;
  lowStock?: boolean;
  expiringSoon?: boolean;
  min_price?: number;
  max_price?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  certifications?: string[];
  harvestDateRange?: {
    start: string;
    end: string;
  };
  createdDateRange?: {
    start: string;
    end: string;
  };
}

export interface InventorySearchParams extends InventoryFilters {
  query?: string;
  sortBy?: InventorySortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  includeVariants?: boolean;
  includeImages?: boolean;
  includePricing?: boolean;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters?: InventoryFilters;
  summary?: InventorySummary;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  inStockItems: number;
  outOfStockItems: number;
  lowStockItems: number;
  expiringSoonItems: number;
  organicItems: number;
  categoryCounts: Record<string, number>;
}

export interface InventoryStatsResponse {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  topCategories: { category: string; count: number; value: number }[];
  recentActivity: InventoryActivity[];
  lowStockAlerts: InventoryItem[];
  expirationAlerts: InventoryItem[];
  performanceMetrics: {
    turnoverRate: number;
    sellThroughRate: number;
    averageDaysOnShelf: number;
  };
}

export interface InventoryActivity {
  activityId: number;
  itemId: number;
  itemName: string;
  activityType: ActivityType;
  description: string;
  quantityChanged?: number;
  previousQuantity?: number;
  newQuantity?: number;
  userId: number;
  userName: string;
  timestamp: string;
}

export interface BulkInventoryOperation {
  operation: BulkOperation;
  itemIds: number[];
  updateData?: Partial<UpdateInventoryItemRequest>;
  filters?: InventoryFilters;
}

export interface BulkInventoryResult {
  successful: number[];
  failed: { itemId: number; error: string }[];
  successCount?: number;
  failedCount?: number;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
  };
}

// Image Management
export interface InventoryImageUploadRequest {
  itemId: number;
  sortOrder?: number;
  isPrimary?: boolean;
  altText?: string;
  caption?: string;
}

export interface InventoryImageUpdateRequest {
  sortOrder?: number;
  isPrimary?: boolean;
  altText?: string;
  isActive?: boolean;
}

// Import/Export Types
export interface InventoryImportRequest {
  storeId: number;
  format: ImportFormat;
  data: string | File;
  options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
  };
}

export interface InventoryImportResult {
  status: 'success' | 'partial' | 'failed';
  summary: {
    totalRows: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  errors: ImportError[];
  warnings: ImportWarning[];
  createdItems: number[];
  updatedItems: number[];
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  value?: unknown;
}

export interface InventoryExportRequest {
  storeId: number;
  format: ExportFormat;
  filters?: InventoryFilters;
  fields?: string[];
  includeImages?: boolean;
  includeVariants?: boolean;
}

// Form Types (for UI)
export interface InventoryItemFormData {
  // Basic Information
  Name: string;
  description: string;
  Category: string;
  sku: string;

  // Pricing and Inventory
  Unit: string;
  Price: number;
  Quantity: number;
  Cost?: number;
  MinStockLevel?: number;

  // Offers
  AllowOffers?: boolean;
  MinOfferPrice?: number;

  // Images
  imageFiles: File[];
  existingImages: InventoryImage[];

  // Variants
  variants: InventoryVariantFormData[];
}

export interface InventoryVariantFormData {
  variantName: string;
  description: string;
  sku: string;
  pricePerUnit: number;
  quantityAvailable: number;
  attributes: VariantAttribute[];
  isActive: boolean;
  sortOrder: number;
}

// Validation Types
export interface InventoryValidationErrors {
  itemName?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  sku?: string;
  unitType?: string;
  pricePerUnit?: string;
  quantityAvailable?: string;
  minimumOrderQuantity?: string;
  maximumOrderQuantity?: string;
  harvestDate?: string;
  expirationDate?: string;
  storageInstructions?: string;
  certifications?: string;
  tags?: string;
  nutritionalInfo?: Partial<Record<keyof NutritionalInfo, string>>;
  variants?: Record<string, string>[];
}

// Enums and Constants
export type UnitType =
  | 'piece'
  | 'pound'
  | 'ounce'
  | 'kilogram'
  | 'gram'
  | 'liter'
  | 'gallon'
  | 'quart'
  | 'pint'
  | 'cup'
  | 'bunch'
  | 'bag'
  | 'box'
  | 'case'
  | 'dozen'
  | 'bushel'
  | 'peck'
  | 'flat'
  | 'tray'
  | 'container';

export type InventoryStatus =
  | 'active'
  | 'inactive'
  | 'archived'
  | 'out_of_stock'
  | 'discontinued';
export type InventoryVisibility =
  | 'public'
  | 'private'
  | 'partners_only'
  | 'members_only';
export type ImageType =
  | 'primary'
  | 'gallery'
  | 'detail'
  | 'thumbnail'
  | 'packaging';
export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'year_round';
export type AvailabilityLevel = 'high' | 'medium' | 'low' | 'none';
export type ActivityType =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'stock_added'
  | 'stock_removed'
  | 'price_changed'
  | 'status_changed';
export type BulkOperation =
  | 'update'
  | 'delete'
  | 'activate'
  | 'deactivate'
  | 'archive'
  | 'change_visibility';
export type InventorySortBy =
  | 'itemName'
  | 'category'
  | 'pricePerUnit'
  | 'quantityAvailable'
  | 'createdAt'
  | 'updatedAt'
  | 'popularity'
  | 'revenue';
export type ImportFormat = 'csv' | 'json' | 'xlsx';
export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

// Constants
export const UNIT_TYPES: {
  value: UnitType;
  label: string;
  category: string;
}[] = [
  { value: 'piece', label: 'Piece', category: 'Count' },
  { value: 'dozen', label: 'Dozen', category: 'Count' },
  { value: 'bunch', label: 'Bunch', category: 'Count' },
  { value: 'bag', label: 'Bag', category: 'Container' },
  { value: 'box', label: 'Box', category: 'Container' },
  { value: 'case', label: 'Case', category: 'Container' },
  { value: 'container', label: 'Container', category: 'Container' },
  { value: 'pound', label: 'Pound (lb)', category: 'Weight' },
  { value: 'ounce', label: 'Ounce (oz)', category: 'Weight' },
  { value: 'kilogram', label: 'Kilogram (kg)', category: 'Weight' },
  { value: 'gram', label: 'Gram (g)', category: 'Weight' },
  { value: 'gallon', label: 'Gallon', category: 'Volume' },
  { value: 'quart', label: 'Quart', category: 'Volume' },
  { value: 'pint', label: 'Pint', category: 'Volume' },
  { value: 'cup', label: 'Cup', category: 'Volume' },
  { value: 'liter', label: 'Liter (L)', category: 'Volume' },
  { value: 'bushel', label: 'Bushel', category: 'Agricultural' },
  { value: 'peck', label: 'Peck', category: 'Agricultural' },
  { value: 'flat', label: 'Flat', category: 'Agricultural' },
  { value: 'tray', label: 'Tray', category: 'Agricultural' },
];

export const INVENTORY_CATEGORIES = [
  'Fresh Produce',
  'Vegetables',
  'Fruits',
  'Herbs',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Fish & Seafood',
  'Grains & Cereals',
  'Legumes & Beans',
  'Nuts & Seeds',
  'Honey & Bee Products',
  'Baked Goods',
  'Preserved Foods',
  'Beverages',
  'Oils & Vinegars',
  'Spices & Seasonings',
  'Flowers & Plants',
  'Seeds & Seedlings',
  'Farm Supplies',
  'Handmade Crafts',
  'Pet & Animal Feed',
  'Other',
] as const;

export const COMMON_CERTIFICATIONS = [
  'USDA Organic',
  'Non-GMO Project Verified',
  'Fair Trade',
  'Rainforest Alliance',
  'Bird Friendly',
  'Demeter Biodynamic',
  'Certified Naturally Grown',
  'Animal Welfare Approved',
  'Grass Fed',
  'Pasture Raised',
  'Certified Humane',
  'Local',
  'Sustainable',
] as const;

// Default Values
export const DEFAULT_INVENTORY_FORM_DATA: InventoryItemFormData = {
  Name: '',
  description: '',
  Category: 'General',
  sku: '',
  Unit: 'piece',
  Price: 0,
  Quantity: 0,
  Cost: 0,
  MinStockLevel: 0,
  AllowOffers: false,
  MinOfferPrice: 0,
  imageFiles: [],
  existingImages: [],
  variants: [],
};

export const DEFAULT_NUTRITIONAL_INFO: NutritionalInfo = {
  servingSize: '1',
  servingUnit: 'cup',
  calories: undefined,
  totalFat: undefined,
  saturatedFat: undefined,
  transFat: undefined,
  cholesterol: undefined,
  sodium: undefined,
  totalCarbohydrates: undefined,
  dietaryFiber: undefined,
  totalSugars: undefined,
  addedSugars: undefined,
  protein: undefined,
  vitaminD: undefined,
  calcium: undefined,
  iron: undefined,
  potassium: undefined,
  customNutrients: {},
};
