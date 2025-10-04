import { apiService } from './api';
import axios from 'axios';
import { STORAGE_KEYS } from '../utils/api';

// Enhanced search interfaces - explicitly exported
export interface SearchResult {
  entityType: string; // product, store, category
  entityId: number;
  primaryName: string;
  description?: string;
  sku?: string;
  storeName?: string;
  storeId?: number;
  storeSlug?: string;
  location?: string;
  categoryName?: string;
  price?: number;
  unitPrice?: number;
  unit?: string;
  quantity?: number;
  imageUrl?: string;
  isActive: boolean;
  relevanceScore: number;
  highlightedFields: string[];
}

export interface SearchFacets {
  categories: Facet[];
  stores: Facet[];
  locations: Facet[];
  priceRange: PriceRange;
}

export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
  avgPrice: number;
}

export interface SearchSuggestion {
  text: string;
  entityType: string;
  entityId: number;
  imageUrl?: string;
  category?: string;
  store?: string;
  matchCount: number;
}

// Storefront data interfaces
export interface StorefrontModule {
  id: string;
  type: string;
  title: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  order: number;
  isVisible: boolean;
}

export interface StorefrontCustomization {
  storeId: number;
  themeId?: string;
  modules: StorefrontModule[];
  globalSettings: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    headerStyle?: string;
    footerText?: string;
  };
  customCss?: string;
  isPublished: boolean;
  publishedAt?: string;
  lastModified: string;
}

export interface StorefrontPublishRequest {
  storeId: number;
  customization: StorefrontCustomization;
  publishNow: boolean;
}

export interface StorefrontPublishResponse {
  success: boolean;
  storeId: number;
  publicUrl: string;
  slug: string;
  publishedAt: string;
  status: 'draft' | 'published' | 'live';
}

export interface PublicStorefront {
  storeId: number;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  customization: StorefrontCustomization;
  store: {
    storeId: number;
    storeName: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
    addresses: Record<string, unknown>[];
    openHours: Record<string, unknown>[];
    paymentMethods: Record<string, unknown>[];
    categories: Record<string, unknown>[];
  };
  products: Record<string, unknown>[];
  isActive: boolean;
  lastUpdated: string;
}

export interface StorefrontStats {
  storeId: number;
  views: number;
  uniqueVisitors: number;
  orders: number;
  revenue: number;
  lastViewed?: string;
}

class StorefrontApiService {
  // Get storefront customization for editing
  static async getStorefrontCustomization(
    storeId: number
  ): Promise<StorefrontCustomization> {
    try {
      console.log('🎨 === FETCHING STOREFRONT CUSTOMIZATION ===');
      console.log('Store ID:', storeId);

      const response = await apiService.get(
        `/api/storefronts/${storeId}/customization`
      );
      console.log('✅ Storefront customization fetched:', response);

      return response as StorefrontCustomization;
    } catch (error) {
      console.error('❌ Failed to fetch storefront customization:', error);

      // Return default customization if not found
      return {
        storeId,
        modules: [],
        globalSettings: {},
        isPublished: false,
        lastModified: new Date().toISOString(),
      };
    }
  }

  // Save storefront customization (draft)
  static async saveStorefrontCustomization(
    customization: StorefrontCustomization
  ): Promise<void> {
    try {
      console.log('💾 === SAVING STOREFRONT CUSTOMIZATION ===');
      console.log('Customization data:', customization);

      await apiService.put(
        `/api/storefronts/${customization.storeId}/customization`,
        {
          ...customization,
          lastModified: new Date().toISOString(),
        }
      );

      console.log('✅ Storefront customization saved successfully');
    } catch (error) {
      console.error('❌ Failed to save storefront customization:', error);
      throw error;
    }
  }

  // Publish storefront (make it live)
  static async publishStorefront(
    request: StorefrontPublishRequest
  ): Promise<StorefrontPublishResponse> {
    try {
      console.log('🚀 === PUBLISHING STOREFRONT ===');
      console.log('Publish request:', request);

      const response = await apiService.post(
        `/api/storefronts/${request.storeId}/publish`,
        request
      );
      console.log('✅ Storefront published successfully:', response);

      return response as StorefrontPublishResponse;
    } catch (error) {
      console.error('❌ Failed to publish storefront:', error);
      throw error;
    }
  }

  // Unpublish storefront (take it offline)
  static async unpublishStorefront(storeId: number): Promise<void> {
    try {
      console.log('📴 === UNPUBLISHING STOREFRONT ===');
      console.log('Store ID:', storeId);

      await apiService.post(`/api/storefronts/${storeId}/unpublish`);
      console.log('✅ Storefront unpublished successfully');
    } catch (error) {
      console.error('❌ Failed to unpublish storefront:', error);
      throw error;
    }
  }

  // Get public storefront data for customer viewing
  static async getPublicStorefront(slug: string): Promise<PublicStorefront> {
    try {
      console.log('👀 === FETCHING PUBLIC STOREFRONT ===');
      console.log('Store slug:', slug);
      console.log('Full URL:', `/api/public/storefronts/${slug}`);
      console.log('API Base URL:', apiService.baseURL || 'default');

      const response = await apiService.get(`/api/public/storefronts/${slug}`);
      console.log('✅ Public storefront fetched:', response);

      return response as PublicStorefront;
    } catch (error) {
      console.error('❌ Failed to fetch public storefront:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Get public storefront by store ID (alternative access)
  static async getPublicStorefrontById(
    storeId: number
  ): Promise<PublicStorefront> {
    try {
      console.log('👀 === FETCHING PUBLIC STOREFRONT BY ID ===');
      console.log('Store ID:', storeId);

      const response = await apiService.get(
        `/api/public/storefronts/by-id/${storeId}`
      );
      console.log('✅ Public storefront fetched by ID:', response);

      return response as PublicStorefront;
    } catch (error) {
      console.error('❌ Failed to fetch public storefront by ID:', error);
      throw error;
    }
  }

  // Get storefront status and URLs
  static async getStorefrontStatus(storeId: number): Promise<{
    status: 'draft' | 'published' | 'live';
    isPublished: boolean;
    publicUrl?: string;
    slug?: string;
    publishedAt?: string;
    lastModified?: string;
  }> {
    try {
      console.log('📊 === FETCHING STOREFRONT STATUS ===');
      console.log('Store ID:', storeId);

      const response = await apiService.get(
        `/api/storefronts/${storeId}/status`
      );
      console.log('✅ Storefront status fetched:', response);

      return response as {
        status: 'draft' | 'published' | 'live';
        isPublished: boolean;
        publicUrl?: string;
        slug?: string;
        publishedAt?: string;
        lastModified?: string;
      };
    } catch (error) {
      console.error('❌ Failed to fetch storefront status:', error);

      // Return default status
      return {
        status: 'draft',
        isPublished: false,
      };
    }
  }

  // Get storefront analytics/stats
  static async getStorefrontStats(storeId: number): Promise<StorefrontStats> {
    try {
      console.log('📈 === FETCHING STOREFRONT STATS ===');
      console.log('Store ID:', storeId);

      const response = await apiService.get(
        `/api/storefronts/${storeId}/stats`
      );
      console.log('✅ Storefront stats fetched:', response);

      return response as StorefrontStats;
    } catch (error) {
      console.error('❌ Failed to fetch storefront stats:', error);

      // Return default stats
      return {
        storeId,
        views: 0,
        uniqueVisitors: 0,
        orders: 0,
        revenue: 0,
      };
    }
  }

  // Generate or update store slug
  static async generateSlug(
    storeId: number,
    preferredSlug?: string
  ): Promise<{ slug: string; available: boolean }> {
    try {
      console.log('🔗 === GENERATING STORE SLUG ===');
      console.log('Store ID:', storeId);
      console.log('Preferred slug:', preferredSlug);

      const response = await apiService.post(
        `/api/storefronts/${storeId}/generate-slug`,
        {
          preferredSlug,
        }
      );
      console.log('✅ Store slug generated:', response);

      return response as { slug: string; available: boolean };
    } catch (error) {
      console.error('❌ Failed to generate store slug:', error);
      throw error;
    }
  }

  // Check slug availability
  static async checkSlugAvailability(
    slug: string,
    excludeStoreId?: number
  ): Promise<{ available: boolean; suggestions?: string[] }> {
    try {
      console.log('🔍 === CHECKING SLUG AVAILABILITY ===');
      console.log('Slug:', slug);
      console.log('Exclude store ID:', excludeStoreId);

      const params = new URLSearchParams();
      if (excludeStoreId) {
        params.append('excludeStoreId', excludeStoreId.toString());
      }

      const response = await apiService.get(
        `/api/public/slugs/${slug}/availability?${params.toString()}`
      );
      console.log('✅ Slug availability checked:', response);

      return response as { available: boolean; suggestions?: string[] };
    } catch (error) {
      console.error('❌ Failed to check slug availability:', error);
      return { available: false };
    }
  }

  // Unified Search API - Enhanced search across products, stores, and categories
  static async unifiedSearch(params: {
    query?: string;
    category?: string;
    location?: string;
    store?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    sortBy?: string;
    entityTypes?: string[];
    page?: number;
    limit?: number;
  }): Promise<{
    results: SearchResult[];
    facets: SearchFacets;
    total: number;
    page: number;
    totalPages: number;
    query?: string;
    searchTimeMs: number;
  }> {
    try {
      console.log('🔍 === UNIFIED SEARCH ===');
      console.log('Search params:', params);

      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.category) queryParams.append('category', params.category);
      if (params.location) queryParams.append('location', params.location);
      if (params.store) queryParams.append('store', params.store);
      if (params.priceMin)
        queryParams.append('priceMin', params.priceMin.toString());
      if (params.priceMax)
        queryParams.append('priceMax', params.priceMax.toString());
      if (params.inStock !== undefined)
        queryParams.append('inStock', params.inStock.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.entityTypes?.length) {
        params.entityTypes.forEach((type) =>
          queryParams.append('entityTypes', type)
        );
      }
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiService.get(
        `/api/public/storefronts/search?${queryParams.toString()}`
      );
      console.log('✅ Unified search results:', response);

      return response as {
        results: SearchResult[];
        facets: SearchFacets;
        total: number;
        page: number;
        totalPages: number;
        query?: string;
        searchTimeMs: number;
      };
    } catch (error) {
      console.error('❌ Failed to perform unified search:', error);
      return {
        results: [],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 },
        },
        total: 0,
        page: 1,
        totalPages: 0,
        searchTimeMs: 0,
      };
    }
  }

  // Get search suggestions for autocomplete
  static async getSearchSuggestions(params: {
    query: string;
    limit?: number;
    entityTypes?: string[];
  }): Promise<{
    suggestions: SearchSuggestion[];
  }> {
    try {
      console.log('🔍 === SEARCH SUGGESTIONS ===');
      console.log('Suggestion params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.entityTypes?.length) {
        params.entityTypes.forEach((type) =>
          queryParams.append('entityTypes', type)
        );
      }

      const response = await apiService.get(
        `/api/public/storefronts/search/suggestions?${queryParams.toString()}`
      );
      console.log('✅ Search suggestions:', response);

      return response as { suggestions: SearchSuggestion[] };
    } catch (error) {
      console.error('❌ Failed to get search suggestions:', error);
      return { suggestions: [] };
    }
  }

  // Get popular search terms
  static async getPopularSearchTerms(limit?: number): Promise<{
    terms: string[];
  }> {
    try {
      console.log('🔍 === POPULAR SEARCH TERMS ===');

      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());

      const response = await apiService.get(
        `/api/public/storefronts/search/popular-terms?${queryParams.toString()}`
      );
      console.log('✅ Popular search terms:', response);

      return response as { terms: string[] };
    } catch (error) {
      console.error('❌ Failed to get popular search terms:', error);
      return { terms: [] };
    }
  }

  // Browse all published storefronts (for discovery)
  static async browseStorefronts(params?: {
    category?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    storefronts: PublicStorefront[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log('🌐 === BROWSING PUBLISHED STOREFRONTS ===');
      console.log('Browse params:', params);

      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiService.get(
        `/api/public/storefronts?${queryParams.toString()}`
      );
      console.log('✅ Storefronts browsed:', response);

      return response as {
        storefronts: PublicStorefront[];
        total: number;
        page: number;
        totalPages: number;
      };
    } catch (error) {
      console.error('❌ Failed to browse storefronts:', error);
      return {
        storefronts: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };
    }
  }

  // Record storefront view (for analytics)
  static async recordView(storeIdOrSlug: string | number): Promise<void> {
    try {
      console.log('👁️ === RECORDING STOREFRONT VIEW ===');
      console.log('Store ID/Slug:', storeIdOrSlug);

      await apiService.post(`/api/public/storefronts/${storeIdOrSlug}/view`);
      console.log('✅ Storefront view recorded');
    } catch (error) {
      console.error('❌ Failed to record storefront view:', error);
      // Don't throw error for analytics - it's not critical
    }
  }

  // Upload hero banner image
  static async uploadHeroBannerImage(
    storeId: number,
    imageFile: File
  ): Promise<{
    success: boolean;
    imageUrl: string;
    fileName: string;
    message: string;
  }> {
    try {
      console.log('🖼️ === UPLOADING HERO BANNER IMAGE ===');
      console.log('Store ID:', storeId);
      console.log('Image file:', {
        name: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
      });

      const formData = new FormData();
      formData.append('Image', imageFile);

      // Get auth token
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use raw axios to avoid Content-Type conflicts
      const response = await axios.post(
        `https://localhost:7008/api/storefronts/${storeId}/hero-banner/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let browser set it automatically for FormData
          },
        }
      );

      console.log('✅ Hero banner image uploaded:', response.data);
      console.log('🖼️ Image URL returned:', response.data.imageUrl);

      return response.data as {
        success: boolean;
        imageUrl: string;
        fileName: string;
        message: string;
      };
    } catch (error) {
      console.error('❌ Failed to upload hero banner image:', error);
      throw error;
    }
  }

  // Get detailed product information
  static async getProductDetail(itemId: number): Promise<{
    itemId: number;
    sku: string;
    name: string;
    description?: string;
    price: number;
    unitPrice?: number;
    unit?: string;
    quantity: number;
    minStockLevel: number;
    isActive: boolean;
    allowOffers: boolean;
    minOfferPrice?: number;
    createdAt: string;
    lastUpdated: string;
    categoryName?: string;
    categoryId?: number;
    storeId: number;
    storeName: string;
    storeSlug?: string;
    storeDescription?: string;
    storeLogoUrl?: string;
    storeLocation?: string;
    storePhone?: string;
    storeEmail?: string;
    storeApprovalStatus: string;
    images: Array<{
      imageId: number;
      originalUrl: string;
      thumbnailUrl?: string;
      altText?: string;
      displayOrder: number;
      isDefault: boolean;
    }>;
    inStock: boolean;
    lowStock: boolean;
    outOfStock: boolean;
    stockStatus: string;
    relatedProducts: Array<{
      itemId: number;
      name: string;
      sku?: string;
      price: number;
      imageUrl?: string;
      storeName: string;
      storeSlug?: string;
      inStock: boolean;
    }>;
  } | null> {
    try {
      console.log('📦 === GETTING PRODUCT DETAIL ===');
      console.log('Item ID:', itemId);

      const response = await apiService.get(
        `/api/public/storefronts/products/${itemId}`
      );
      console.log('✅ Product detail fetched:', response);

      return response;
    } catch (error) {
      console.error('❌ Failed to get product detail:', error);
      return null;
    }
  }
  // Debug method to test product detail data
  static async debugProductDetail(itemId: number): Promise<any> {
    try {
      console.log('🔍 DEBUG: Fetching product detail debug info for item:', itemId);

      const response = await apiService.get(
        `/api/public/storefronts/debug/products/${itemId}`
      );

      console.log('🔍 DEBUG: Product detail debug response:', response);
      return response;
    } catch (error) {
      console.error('🔍 DEBUG: Failed to get product detail debug info:', error);
      return null;
    }
  }
}

export default StorefrontApiService;
