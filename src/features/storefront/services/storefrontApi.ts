import { apiClient } from '../../../shared/services/apiClient';
import type {
  Storefront,
  StorefrontCustomization,
  StorefrontProduct,
  StorefrontCategory,
  StorefrontReview,
  StorefrontSearchParams,
  StorefrontSearchResult,
  CreateStorefrontRequest,
  UpdateStorefrontRequest,
  StorefrontPublishRequest,
  StorefrontStatsResponse,
  StorefrontActivity,
  SEOSettings,
  SocialMediaSettings,
} from '../../../shared/types/storefront';
import type { ApiResponse, PaginatedResponse } from '../../../shared/types/api';

export class StorefrontApiService {
  private static readonly BASE_PATH = '/api/storefronts';
  private static readonly PUBLIC_PATH = '/api/public/storefronts';

  // Storefront Management
  static async createStorefront(
    storefrontData: CreateStorefrontRequest
  ): Promise<Storefront> {
    const response = await apiClient.post<Storefront>(
      this.BASE_PATH,
      storefrontData
    );
    return response;
  }

  static async getStorefront(storefrontId: number): Promise<Storefront> {
    const response = await apiClient.get<Storefront>(
      `${this.BASE_PATH}/${storefrontId}`
    );
    return response;
  }

  static async updateStorefront(
    storefrontId: number,
    updateData: UpdateStorefrontRequest
  ): Promise<Storefront> {
    const response = await apiClient.put<Storefront>(
      `${this.BASE_PATH}/${storefrontId}`,
      updateData
    );
    return response;
  }

  static async deleteStorefront(storefrontId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}`
    );
    return response;
  }

  static async duplicateStorefront(
    storefrontId: number,
    newTitle: string
  ): Promise<Storefront> {
    const response = await apiClient.post<Storefront>(
      `${this.BASE_PATH}/${storefrontId}/duplicate`,
      {
        newTitle,
      }
    );
    return response;
  }

  // Storefront Publishing
  static async publishStorefront(
    storefrontId: number,
    publishData: StorefrontPublishRequest
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/publish`,
      publishData
    );
    return response;
  }

  static async unpublishStorefront(storefrontId: number): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/unpublish`
    );
    return response;
  }

  static async getStorefrontStatus(storefrontId: number): Promise<{
    isPublished: boolean;
    publishedAt?: string;
    isActive: boolean;
    canPublish: boolean;
    validationErrors?: string[];
  }> {
    const response = await apiClient.get<{
      isPublished: boolean;
      publishedAt?: string;
      isActive: boolean;
      canPublish: boolean;
      validationErrors?: string[];
    }>(`${this.BASE_PATH}/${storefrontId}/status`);
    return response;
  }

  // Customization Management
  static async getStorefrontCustomization(
    storefrontId: number
  ): Promise<StorefrontCustomization> {
    const response = await apiClient.get<StorefrontCustomization>(
      `${this.BASE_PATH}/${storefrontId}/customization`
    );
    return response;
  }

  static async updateStorefrontCustomization(
    storefrontId: number,
    customization: Partial<StorefrontCustomization>
  ): Promise<StorefrontCustomization> {
    const response = await apiClient.put<StorefrontCustomization>(
      `${this.BASE_PATH}/${storefrontId}/customization`,
      customization
    );
    return response;
  }

  static async saveStorefrontCustomization(
    customizationData: any
  ): Promise<StorefrontCustomization> {
    const response = await apiClient.put<StorefrontCustomization>(
      `${this.BASE_PATH}/${customizationData.storeId}/customization`,
      customizationData
    );
    return response;
  }

  static async resetStorefrontCustomization(
    storefrontId: number
  ): Promise<StorefrontCustomization> {
    const response = await apiClient.post<StorefrontCustomization>(
      `${this.BASE_PATH}/${storefrontId}/customization/reset`
    );
    return response;
  }

  // SEO Settings
  static async updateSEOSettings(
    storefrontId: number,
    seoSettings: Partial<SEOSettings>
  ): Promise<SEOSettings> {
    const response = await apiClient.put<SEOSettings>(
      `${this.BASE_PATH}/${storefrontId}/seo`,
      seoSettings
    );
    return response;
  }

  static async generateSEOSettings(storefrontId: number): Promise<SEOSettings> {
    const response = await apiClient.post<SEOSettings>(
      `${this.BASE_PATH}/${storefrontId}/seo/generate`
    );
    return response;
  }

  // Social Media Settings
  static async updateSocialMediaSettings(
    storefrontId: number,
    socialMedia: Partial<SocialMediaSettings>
  ): Promise<SocialMediaSettings> {
    const response = await apiClient.put<SocialMediaSettings>(
      `${this.BASE_PATH}/${storefrontId}/social-media`,
      socialMedia
    );
    return response;
  }

  // Product Management for Storefront
  static async getStorefrontProducts(
    storefrontId: number,
    searchParams?: StorefrontSearchParams
  ): Promise<StorefrontSearchResult> {
    const params = new URLSearchParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item.toString()));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<StorefrontSearchResult>(
      `${this.BASE_PATH}/${storefrontId}/products${queryString}`
    );
    return response;
  }

  static async getFeaturedProducts(
    storefrontId: number,
    limit: number = 6
  ): Promise<StorefrontProduct[]> {
    const response = await apiClient.get<StorefrontProduct[]>(
      `/api/stores/${storefrontId}/featured-products?limit=${limit}`
    );
    return response;
  }

  static async addToFeaturedProducts(
    storeId: number,
    itemId: number,
    displayOrder: number = 0
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `/api/stores/${storeId}/featured-products`,
      { itemId, displayOrder }
    );
    return response;
  }

  static async removeFromFeaturedProducts(
    storeId: number,
    itemId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `/api/stores/${storeId}/featured-products/${itemId}`
    );
    return response;
  }

  static async setFeaturedProducts(
    storeId: number,
    itemIds: number[]
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `/api/stores/${storeId}/featured-products`,
      { itemIds }
    );
    return response;
  }

  static async getStorefrontProduct(
    storefrontId: number,
    productId: number
  ): Promise<StorefrontProduct> {
    const response = await apiClient.get<StorefrontProduct>(
      `${this.BASE_PATH}/${storefrontId}/products/${productId}`
    );
    return response;
  }

  // Category Management
  static async getStorefrontCategories(
    storefrontId: number
  ): Promise<StorefrontCategory[]> {
    const response = await apiClient.get<StorefrontCategory[]>(
      `${this.BASE_PATH}/${storefrontId}/categories`
    );
    return response;
  }

  static async updateCategoryVisibility(
    storefrontId: number,
    categoryUpdates: {
      categoryId: number;
      isVisible: boolean;
      sortOrder?: number;
    }[]
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/categories/visibility`,
      { categoryUpdates }
    );
    return response;
  }

  // Image and Media Management
  static async uploadHeroBannerImage(
    storefrontId: number,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<{ imageUrl: string; thumbnailUrl?: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.upload<{
      imageUrl: string;
      thumbnailUrl?: string;
    }>(
      `${this.BASE_PATH}/${storefrontId}/hero-banner`,
      formData,
      onUploadProgress
    );
    return response;
  }

  static async deleteHeroBannerImage(
    storefrontId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/hero-banner`
    );
    return response;
  }

  static async uploadCustomImages(
    storefrontId: number,
    files: File[],
    imageType: 'logo' | 'background' | 'gallery' | 'custom',
    onUploadProgress?: (progress: number) => void
  ): Promise<{ imageUrls: string[] }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`files`, file);
    });
    formData.append('imageType', imageType);

    const response = await apiClient.upload<{ imageUrls: string[] }>(
      `${this.BASE_PATH}/${storefrontId}/images`,
      formData,
      onUploadProgress
    );
    return response;
  }

  // Analytics and Statistics
  static async getStorefrontStats(
    storefrontId: number,
    startDate?: string,
    endDate?: string
  ): Promise<StorefrontStatsResponse> {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<StorefrontStatsResponse>(
      `${this.BASE_PATH}/${storefrontId}/stats${queryString}`
    );
    return response;
  }

  static async getStorefrontActivity(
    storefrontId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<StorefrontActivity[]> {
    const response = await apiClient.get<StorefrontActivity[]>(
      `${this.BASE_PATH}/${storefrontId}/activity?limit=${limit}&offset=${offset}`
    );
    return response;
  }

  static async recordStorefrontView(
    storefrontId: number,
    metadata?: { source?: string; userAgent?: string; referrer?: string }
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/view`,
      metadata || {}
    );
    return response;
  }

  // Search and Discovery
  static async searchStorefrontProducts(
    storefrontId: number,
    searchParams: StorefrontSearchParams
  ): Promise<StorefrontSearchResult> {
    const response = await apiClient.post<StorefrontSearchResult>(
      `${this.BASE_PATH}/${storefrontId}/search`,
      searchParams
    );
    return response;
  }

  // Overload signatures
  static async getSearchSuggestions(params: {
    query: string;
    limit?: number;
    entityTypes?: string[];
  }): Promise<{
    suggestions: Array<{
      id: string;
      text: string;
      type: string;
      description?: string;
    }>;
  }>;
  static async getSearchSuggestions(
    storefrontId: number,
    query: string,
    limit?: number
  ): Promise<string[]>;

  static async getSearchSuggestions(
    storefrontIdOrParams:
      | number
      | { query: string; limit?: number; entityTypes?: string[] },
    query?: string,
    limit: number = 5
  ): Promise<
    | string[]
    | {
        suggestions: Array<{
          id: string;
          text: string;
          type: string;
          description?: string;
        }>;
      }
  > {
    try {
      console.log('🔍 StorefrontAPI: Fetching search suggestions...');

      // Handle both old and new API signatures
      let actualQuery: string;
      let actualLimit: number;
      let entityTypes: string[] | undefined;

      if (typeof storefrontIdOrParams === 'object') {
        // New signature: object parameter
        actualQuery = storefrontIdOrParams.query;
        actualLimit = storefrontIdOrParams.limit || 5;
        entityTypes = storefrontIdOrParams.entityTypes;

        console.log('🔍 Search suggestions request:', {
          query: actualQuery,
          limit: actualLimit,
          entityTypes,
        });

        const response = await apiClient.get<
          ApiResponse<
            Array<{ text: string; entityType?: string; matchCount?: number }>
          >
        >(
          `/api/public/storefronts/search/suggestions?query=${encodeURIComponent(actualQuery)}&limit=${actualLimit}${entityTypes ? `&entityTypes=${entityTypes.join(',')}` : ''}`
        );

        console.log('✅ Search suggestions fetched successfully:', {
          count: response.data?.length || 0,
        });

        // Return new format for new signature with enhanced data
        return {
          suggestions: (response.data || []).map((s, index) => ({
            id: `suggestion-${index}`,
            text: s.text,
            type: s.entityType || 'product',
            description: s.matchCount
              ? `${s.matchCount} results`
              : `Search for "${s.text}"`,
          })),
        };
      } else {
        // Old signature: storefrontId, query, limit
        actualQuery = query || '';
        actualLimit = limit;

        console.log('🔍 Legacy search suggestions request:', {
          query: actualQuery,
          limit: actualLimit,
        });

        const response = await apiClient.get<
          ApiResponse<Array<{ text: string }>>
        >(
          `/api/public/storefronts/search/suggestions?query=${encodeURIComponent(actualQuery)}&limit=${actualLimit}`
        );

        console.log('✅ Legacy search suggestions fetched successfully:', {
          count: response.data?.length || 0,
        });

        // Return old format for old signature
        return (response.data || []).map((s) => s.text);
      }
    } catch (error: unknown) {
      console.error(
        '❌ StorefrontAPI: Error fetching search suggestions:',
        error
      );

      // Enhanced error handling with fallback suggestions
      if (typeof storefrontIdOrParams === 'object') {
        return {
          suggestions: [],
        };
      } else {
        return [];
      }
    }
  }

  // Overload signatures
  static async getPopularSearchTerms(
    limit: number
  ): Promise<{ terms: string[] }>;
  static async getPopularSearchTerms(
    storefrontId: number,
    limit: number
  ): Promise<{ term: string; count: number }[]>;

  static async getPopularSearchTerms(
    storefrontIdOrLimit: number,
    limit?: number
  ): Promise<{ term: string; count: number }[] | { terms: string[] }> {
    try {
      console.log('🔍 StorefrontAPI: Fetching popular search terms...');

      let actualLimit: number;

      if (limit !== undefined) {
        // Old signature: storefrontId, limit
        actualLimit = limit;
      } else {
        // New signature: just limit (storefrontIdOrLimit is actually the limit)
        actualLimit = storefrontIdOrLimit;
      }

      console.log('🔍 Popular search terms request:', {
        limit: actualLimit,
      });

      const response = await apiClient.get<ApiResponse<string[]>>(
        `/api/public/storefronts/search/popular-terms?limit=${actualLimit}`
      );

      console.log('✅ Popular search terms fetched successfully:', {
        count: response.data?.length || 0,
      });

      if (limit !== undefined) {
        // Old signature return format
        return response.data?.map((term) => ({ term, count: 1 })) || [];
      } else {
        // New signature return format
        return { terms: response.data || [] };
      }
    } catch (error: unknown) {
      console.error(
        '❌ StorefrontAPI: Error fetching popular search terms:',
        error
      );

      // Enhanced error handling with fallback terms
      const fallbackTerms = [
        'organic vegetables',
        'fresh fruits',
        'local honey',
        'grass-fed beef',
        'artisan bread',
      ];

      if (limit !== undefined) {
        return fallbackTerms.map((term) => ({ term, count: 1 }));
      } else {
        return { terms: fallbackTerms };
      }
    }
  }

  // Unified Search
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
    results: Array<{
      id: string;
      title: string;
      type: string;
      description: string;
      imageUrl?: string;
      price?: number;
      rating?: number;
    }>;
    facets: {
      categories: Array<{ value: string; label: string; count: number }>;
      locations: Array<{ value: string; label: string; count: number }>;
      stores: Array<{ value: string; label: string; count: number }>;
      priceRange: { min: number; max: number; avgPrice: number };
    };
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
    searchTimeMs: number;
  }> {
    try {
      console.log('🔍 StorefrontAPI: Performing unified search...', {
        query: params.query,
        category: params.category,
        location: params.location,
        store: params.store,
        entityTypes: params.entityTypes,
        page: params.page,
        limit: params.limit,
      });

      const searchParams = new URLSearchParams();

      if (params.query) searchParams.append('query', params.query);
      if (params.category) searchParams.append('category', params.category);
      if (params.location) searchParams.append('location', params.location);
      if (params.store) searchParams.append('store', params.store);
      if (params.priceMin !== undefined)
        searchParams.append('priceMin', params.priceMin.toString());
      if (params.priceMax !== undefined)
        searchParams.append('priceMax', params.priceMax.toString());
      if (params.inStock !== undefined)
        searchParams.append('inStock', params.inStock.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.entityTypes?.length) {
        params.entityTypes.forEach((type) =>
          searchParams.append('entityTypes', type)
        );
      }
      if (params.page !== undefined)
        searchParams.append('page', params.page.toString());
      if (params.limit !== undefined)
        searchParams.append('limit', params.limit.toString());

      const startTime = Date.now();
      const searchData = await apiClient.get<{
        results: Array<{
          entityType: string;
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
          isActive?: boolean;
          relevanceScore?: number;
          highlightedFields?: string[];
        }>;
        facets: {
          categories: Array<{ value: string; label: string; count: number }>;
          locations: Array<{ value: string; label: string; count: number }>;
          stores: Array<{ value: string; label: string; count: number }>;
          priceRange: { min: number; max: number; avgPrice: number };
        };
        total: number;
        page: number;
        totalPages: number;
        query?: string;
        searchTimeMs: number;
      }>(`/api/public/storefronts/search?${searchParams.toString()}`);
      const clientTime = Date.now() - startTime;

      console.log('✅ Unified search completed successfully:', {
        resultsCount: searchData.results?.length || 0,
        totalResults: searchData.total,
        searchTimeMs: searchData.searchTimeMs,
        clientTimeMs: clientTime,
        facets: {
          categories: searchData.facets?.categories?.length || 0,
          locations: searchData.facets?.locations?.length || 0,
          stores: searchData.facets?.stores?.length || 0,
        },
      });

      // Transform API response to expected format
      const transformedResults = (searchData.results || []).map(
        (result: any) => ({
          id: `${result.entityType}-${result.entityId}`,
          title: result.primaryName,
          type: result.entityType,
          description: result.description || '',
          imageUrl: result.imageUrl,
          price: result.price || result.unitPrice,
          rating: undefined, // Not provided by API
        })
      );

      return {
        results: transformedResults,
        facets: searchData.facets || {
          categories: [],
          locations: [],
          stores: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 },
        },
        total: searchData.total,
        page: searchData.page,
        totalPages: searchData.totalPages,
        hasMore: searchData.page < searchData.totalPages,
        searchTimeMs: searchData.searchTimeMs || 0,
      };
    } catch (error: unknown) {
      console.error(
        '❌ StorefrontAPI: Error performing unified search:',
        error
      );

      // Enhanced error handling with comprehensive fallback
      return {
        results: [],
        facets: {
          categories: [],
          locations: [],
          stores: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 },
        },
        total: 0,
        page: 1,
        totalPages: 1,
        hasMore: false,
        searchTimeMs: 0,
      };
    }
  }

  // Reviews and Ratings
  static async getStorefrontReviews(
    storefrontId: number,
    productId?: number,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<StorefrontReview>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (productId) params.set('productId', productId.toString());

    const response = await apiClient.get<PaginatedResponse<StorefrontReview>>(
      `${this.BASE_PATH}/${storefrontId}/reviews?${params.toString()}`
    );
    return response;
  }

  static async moderateReview(
    storefrontId: number,
    reviewId: number,
    action: 'approve' | 'reject' | 'hide' | 'feature'
  ): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/reviews/${reviewId}/moderate`,
      { action }
    );
    return response;
  }

  // Slug and URL Management
  static async checkSlugAvailability(
    slug: string,
    excludeStorefrontId?: number
  ): Promise<{ available: boolean; suggestions?: string[] }> {
    const params = new URLSearchParams({ slug });
    if (excludeStorefrontId)
      params.set('excludeStorefrontId', excludeStorefrontId.toString());

    const response = await apiClient.get<{
      available: boolean;
      suggestions?: string[];
    }>(`${this.BASE_PATH}/check-slug?${params.toString()}`);
    return response;
  }

  static async generateSlug(title: string): Promise<{ slug: string }> {
    const response = await apiClient.post<{ slug: string }>(
      `${this.BASE_PATH}/generate-slug`,
      {
        title,
      }
    );
    return response;
  }

  // Public Storefront Access (no authentication required)
  static async getPublicStorefront(slug: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(
      `${this.PUBLIC_PATH}/${slug}`
    );
    return response;
  }

  static async getPublicStorefrontById(storefrontId: number): Promise<unknown> {
    const response = await apiClient.get<unknown>(
      `${this.PUBLIC_PATH}/by-id/${storefrontId}`
    );
    return response;
  }

  static async getPublicStorefrontProducts(
    slug: string,
    searchParams?: StorefrontSearchParams
  ): Promise<StorefrontSearchResult> {
    const params = new URLSearchParams();

    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item.toString()));
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<StorefrontSearchResult>(
      `${this.PUBLIC_PATH}/${slug}/products${queryString}`
    );
    return response;
  }

  static async getPublicStorefrontProduct(
    slug: string,
    productId: number
  ): Promise<StorefrontProduct> {
    const response = await apiClient.get<StorefrontProduct>(
      `${this.PUBLIC_PATH}/${slug}/products/${productId}`
    );
    return response;
  }

  static async browseStorefronts(params?: {
    category?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    storefronts: unknown[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.category) queryParams.append('category', params.category);
      if (params.location) queryParams.append('location', params.location);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : '';
    const response = await apiClient.get<{
      storefronts: unknown[];
      totalCount: number;
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrevious: boolean;
    }>(`${this.PUBLIC_PATH}${queryString}`);

    return response;
  }

  // Record a storefront view for analytics
  static async recordView(
    storeIdOrSlug: string
  ): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `${this.PUBLIC_PATH}/${storeIdOrSlug}/view`
    );
    return response;
  }

  // Bulk Operations
  static async bulkUpdateProducts(
    storefrontId: number,
    updates: {
      productId: number;
      isFeatured?: boolean;
      sortOrder?: number;
      isVisible?: boolean;
    }[]
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `${this.BASE_PATH}/${storefrontId}/products/bulk-update`,
      { updates }
    );
    return response;
  }

  // Performance and Optimization
  static async getStorefrontPerformance(storefrontId: number): Promise<{
    loadTime: number;
    mobileScore: number;
    seoScore: number;
    recommendations: string[];
  }> {
    const response = await apiClient.get<{
      loadTime: number;
      mobileScore: number;
      seoScore: number;
      recommendations: string[];
    }>(`${this.BASE_PATH}/${storefrontId}/performance`);
    return response;
  }

  static async optimizeStorefront(storefrontId: number): Promise<{
    optimizations: string[];
    estimatedImprovements: Record<string, number>;
  }> {
    const response = await apiClient.post<{
      optimizations: string[];
      estimatedImprovements: Record<string, number>;
    }>(`${this.BASE_PATH}/${storefrontId}/optimize`);
    return response;
  }

  // Template and Theme Management
  static async getAvailableThemes(): Promise<unknown[]> {
    const response = await apiClient.get<unknown[]>(`${this.BASE_PATH}/themes`);
    return response;
  }

  static async applyTheme(
    storefrontId: number,
    themeId: string
  ): Promise<StorefrontCustomization> {
    const response = await apiClient.post<StorefrontCustomization>(
      `${this.BASE_PATH}/${storefrontId}/apply-theme`,
      { themeId }
    );
    return response;
  }

  // Validation and Preview
  static async validateStorefront(storefrontId: number): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completionPercentage: number;
  }> {
    const response = await apiClient.get<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
      completionPercentage: number;
    }>(`${this.BASE_PATH}/${storefrontId}/validate`);
    return response;
  }

  static async getStorefrontPreview(
    storefrontId: number
  ): Promise<{ previewUrl: string; expiresAt: string }> {
    const response = await apiClient.get<{
      previewUrl: string;
      expiresAt: string;
    }>(`${this.BASE_PATH}/${storefrontId}/preview`);
    return response;
  }

  // Utility Methods
  static buildStorefrontUrl(slug: string, subdomain?: string): string {
    if (subdomain) {
      return `https://${subdomain}.${window.location.hostname}`;
    }
    return `${window.location.origin}/store/${slug}`;
  }

  static generateStorefrontSitemap(storefrontId: number): Promise<string> {
    return apiClient.get<string>(`${this.BASE_PATH}/${storefrontId}/sitemap`);
  }

  static generateStorefrontRobotsTxt(storefrontId: number): Promise<string> {
    return apiClient.get<string>(
      `${this.BASE_PATH}/${storefrontId}/robots.txt`
    );
  }
}

export default StorefrontApiService;
