// Re-export from the main StorefrontApiService to maintain compatibility
export { StorefrontApiService as default } from '../../storefront/services/storefrontApi';
export { StorefrontApiService } from '../../storefront/services/storefrontApi';

// Re-export types that components expect
export interface SearchSuggestion {
  id: string;
  text: string;
  type: string;
  description?: string;
  entityType?: string;
  category?: string;
  store?: string;
  matchCount?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
  description: string;
  imageUrl?: string;
  price?: number;
  rating?: number;
}

export interface SearchFacets {
  categories: Array<{ value: string; label: string; count: number }>;
  locations: Array<{ value: string; label: string; count: number }>;
  stores: Array<{ value: string; label: string; count: number }>;
  priceRange: { min: number; max: number; avgPrice: number };
}

// New API interfaces for modern signatures
export interface SearchSuggestionsRequest {
  query: string;
  limit?: number;
  entityTypes?: string[];
}

export interface SearchSuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface PopularSearchTermsResponse {
  terms: string[];
}

// Use shared PublicStorefront interface from storefront types
export type { PublicStorefront } from '../../storefront/types/public-storefront';

export interface StorefrontCustomizationDto {
  storeId: number;
  themeId?: string;
  themeName?: string;
  modules: StorefrontModule[];
  globalSettings: Record<string, unknown>;
  customCss?: string;
  isPublished: boolean;
  publishedAt?: string;
  publishVersion: number;
  publicUrl?: string;
  updatedAt?: string;
}

export interface PublicStoreInfo {
  storeId: number;
  storeName: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  categories?: Array<{
    categoryId: string | number;
    categoryName: string;
    id?: string;
    name?: string;
    icon?: any;
    description?: string;
  }>;
  contactEmail?: string;
  contactPhone?: string;
  addresses?: Array<{
    addressType?: string;
    locationName?: string;
    contactPhone?: string;
    contactEmail?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }>;
}

export interface PublicProduct {
  productId: number;
  itemId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
}

// Define StorefrontModule type for compatibility
export interface StorefrontModule {
  id: string;
  type: string;
  title: string;
  content?: unknown;
  settings?: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}
