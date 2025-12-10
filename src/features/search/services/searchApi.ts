import { apiClient } from '../../../shared/services/apiClient';

// Enhanced search interfaces
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

export interface UnifiedSearchRequest {
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
}

export interface UnifiedSearchResponse {
  results: SearchResult[];
  facets: SearchFacets;
  total: number;
  page: number;
  totalPages: number;
  query?: string;
  searchTimeMs: number;
}

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

class SearchApiService {
  private static readonly BASE_PATH = '/api/public/storefronts/search';

  // Unified Search API - Enhanced search across products, stores, and categories
  static async unifiedSearch(
    params: UnifiedSearchRequest
  ): Promise<UnifiedSearchResponse> {
    try {
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

      const response = await apiClient.get<UnifiedSearchResponse>(
        `${this.BASE_PATH}?${queryParams.toString()}`
      );

      return response;
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
  static async getSearchSuggestions(
    params: SearchSuggestionsRequest
  ): Promise<SearchSuggestionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.entityTypes?.length) {
        params.entityTypes.forEach((type) =>
          queryParams.append('entityTypes', type)
        );
      }

      const response = await apiClient.get<SearchSuggestionsResponse>(
        `${this.BASE_PATH}/suggestions?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error('❌ Failed to get search suggestions:', error);
      return { suggestions: [] };
    }
  }

  // Get popular search terms
  static async getPopularSearchTerms(
    limit?: number
  ): Promise<PopularSearchTermsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (limit) queryParams.append('limit', limit.toString());

      const response = await apiClient.get<PopularSearchTermsResponse>(
        `${this.BASE_PATH}/popular-terms?${queryParams.toString()}`
      );

      return response;
    } catch (error) {
      console.error('❌ Failed to get popular search terms:', error);
      return { terms: [] };
    }
  }

  // Record search analytics (for improving search relevance)
  static async recordSearchAnalytics(
    query: string,
    resultsCount: number
  ): Promise<void> {
    try {
      await apiClient.post(`${this.BASE_PATH}/analytics`, {
        query,
        resultsCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Failed to record search analytics:', error);
      // Don't throw - analytics failures shouldn't break the search experience
    }
  }

  // Helper methods for search result processing
  static groupResultsByEntityType(
    results: SearchResult[]
  ): Record<string, SearchResult[]> {
    const grouped: Record<string, SearchResult[]> = {};

    results.forEach((result) => {
      if (!grouped[result.entityType]) {
        grouped[result.entityType] = [];
      }
      grouped[result.entityType].push(result);
    });

    return grouped;
  }

  static filterResultsByEntityType(
    results: SearchResult[],
    entityTypes: string[]
  ): SearchResult[] {
    return results.filter((result) => entityTypes.includes(result.entityType));
  }

  static sortResultsByRelevance(results: SearchResult[]): SearchResult[] {
    return [...results].sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  static getTopResults(results: SearchResult[], limit: number): SearchResult[] {
    return this.sortResultsByRelevance(results).slice(0, limit);
  }

  // Facet helper methods
  static getActiveFacets(
    facets: SearchFacets,
    activeFilters: Record<string, string[]>
  ): Facet[] {
    const activeFacets: Facet[] = [];

    Object.entries(activeFilters).forEach(([facetType, values]) => {
      values.forEach((value) => {
        const facet = this.findFacetByValue(facets, facetType, value);
        if (facet) {
          activeFacets.push(facet);
        }
      });
    });

    return activeFacets;
  }

  static findFacetByValue(
    facets: SearchFacets,
    facetType: string,
    value: string
  ): Facet | null {
    const facetArray = facets[facetType as keyof SearchFacets] as Facet[];
    return facetArray?.find((facet) => facet.value === value) || null;
  }

  // Price range helper methods
  static formatPriceRange(priceRange: PriceRange): string {
    return `$${priceRange.min} - $${priceRange.max}`;
  }

  static isPriceInRange(price: number, priceRange: PriceRange): boolean {
    return price >= priceRange.min && price <= priceRange.max;
  }

  // Search relevance scoring helpers
  static calculateBoostedScore(
    baseScore: number,
    boosts: Record<string, number>
  ): number {
    let boostedScore = baseScore;

    Object.entries(boosts).forEach(([boostType, boostValue]) => {
      // Apply different boost strategies based on boost type
      switch (boostType) {
        case 'exactMatch':
          boostedScore += boostValue;
          break;
        case 'popularity':
          boostedScore *= 1 + boostValue;
          break;
        case 'recentlyAdded':
          boostedScore += boostValue;
          break;
        default:
          boostedScore += boostValue;
      }
    });

    return Math.min(boostedScore, 100); // Cap at 100
  }

  // Search query normalization
  static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, ''); // Remove special characters
  }

  // Search query validation
  static isValidQuery(query: string): boolean {
    const normalized = this.normalizeQuery(query);
    return normalized.length >= 2 && normalized.length <= 100;
  }

  // Search result highlighting
  static highlightText(text: string, query: string): string {
    const normalizedQuery = this.normalizeQuery(query);
    const words = normalizedQuery.split(' ');

    let highlighted = text;
    words.forEach((word) => {
      if (word.length > 2) {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });

    return highlighted;
  }
}

// Export singleton instance
const searchApiService = new SearchApiService();
export default searchApiService;

// Export the class for testing or custom instantiation
export { SearchApiService };
