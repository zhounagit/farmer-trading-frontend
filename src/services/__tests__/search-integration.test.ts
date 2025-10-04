/**
 * Integration test for the search functionality
 * Tests the complete search workflow from frontend to backend
 */

import StorefrontApiService from '../storefront.api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Search Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Unified Search', () => {
    test('should perform basic search successfully', async () => {
      const mockResponse = {
        results: [
          {
            entityType: 'product',
            entityId: 123,
            primaryName: 'Organic Tomatoes',
            description: 'Fresh organic tomatoes from local farm',
            storeName: 'Green Valley Farm',
            storeId: 1,
            categoryName: 'Vegetables',
            price: 4.99,
            quantity: 50,
            isActive: true,
            relevanceScore: 95.5,
            highlightedFields: ['name', 'description']
          }
        ],
        facets: {
          categories: [
            { value: 'vegetables', label: 'Vegetables', count: 25 }
          ],
          stores: [
            { value: 'green-valley', label: 'Green Valley Farm', count: 12 }
          ],
          locations: [
            { value: 'austin-tx', label: 'Austin, TX', count: 8 }
          ],
          priceRange: {
            min: 0,
            max: 50,
            avgPrice: 15.75
          }
        },
        total: 1,
        page: 1,
        totalPages: 1,
        query: 'organic tomatoes',
        searchTimeMs: 45.2
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await StorefrontApiService.unifiedSearch({
        query: 'organic tomatoes',
        page: 1,
        limit: 20
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/storefronts/search'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          })
        })
      );

      expect(result.results).toHaveLength(1);
      expect(result.results[0].primaryName).toBe('Organic Tomatoes');
      expect(result.total).toBe(1);
      expect(result.searchTimeMs).toBeGreaterThan(0);
    });

    test('should handle search with filters', async () => {
      const mockResponse = {
        results: [],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 100, avgPrice: 0 }
        },
        total: 0,
        page: 1,
        totalPages: 0,
        query: 'vegetables',
        searchTimeMs: 12.3
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await StorefrontApiService.unifiedSearch({
        query: 'vegetables',
        category: 'Vegetables',
        location: 'Austin, TX',
        priceMin: 5,
        priceMax: 20,
        inStock: true,
        sortBy: 'price-low',
        entityTypes: ['product'],
        page: 1,
        limit: 10
      });

      const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const url = fetchCall[0] as string;

      expect(url).toContain('query=vegetables');
      expect(url).toContain('category=Vegetables');
      expect(url).toContain('location=Austin%2C%20TX');
      expect(url).toContain('priceMin=5');
      expect(url).toContain('priceMax=20');
      expect(url).toContain('inStock=true');
      expect(url).toContain('sortBy=price-low');
      expect(url).toContain('entityTypes=product');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    test('should handle search errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await StorefrontApiService.unifiedSearch({
        query: 'test'
      });

      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.facets).toEqual({
        categories: [],
        stores: [],
        locations: [],
        priceRange: { min: 0, max: 1000, avgPrice: 0 }
      });
    });
  });

  describe('Search Suggestions', () => {
    test('should get search suggestions successfully', async () => {
      const mockResponse = {
        suggestions: [
          {
            text: 'organic tomatoes',
            entityType: 'product',
            entityId: 123,
            imageUrl: '/tomato.jpg',
            category: 'Vegetables',
            store: 'Green Valley Farm',
            matchCount: 15
          },
          {
            text: 'tomato sauce',
            entityType: 'product',
            entityId: 124,
            category: 'Processed Foods',
            store: 'Farm Kitchen',
            matchCount: 8
          }
        ]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await StorefrontApiService.getSearchSuggestions({
        query: 'tom',
        limit: 5,
        entityTypes: ['product']
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/storefronts/search/suggestions'),
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0].text).toBe('organic tomatoes');
      expect(result.suggestions[0].matchCount).toBe(15);
    });

    test('should handle suggestion errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('API error')
      );

      const result = await StorefrontApiService.getSearchSuggestions({
        query: 'test'
      });

      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe('Popular Search Terms', () => {
    test('should get popular search terms successfully', async () => {
      const mockResponse = {
        terms: [
          'organic vegetables',
          'fresh fruits',
          'local honey',
          'grass-fed beef',
          'artisan bread'
        ]
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await StorefrontApiService.getPopularSearchTerms(5);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/public/storefronts/search/popular-terms'),
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result.terms).toHaveLength(5);
      expect(result.terms[0]).toBe('organic vegetables');
    });

    test('should handle popular terms errors gracefully', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Service unavailable')
      );

      const result = await StorefrontApiService.getPopularSearchTerms();

      expect(result.terms).toHaveLength(0);
    });
  });

  describe('Search Parameter Validation', () => {
    test('should handle empty search query', async () => {
      const mockResponse = {
        results: [],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 }
        },
        total: 0,
        page: 1,
        totalPages: 0,
        searchTimeMs: 5.1
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await StorefrontApiService.unifiedSearch({
        query: '',
        entityTypes: ['product']
      });

      // Should still make the API call but with empty query
      expect(fetch).toHaveBeenCalled();
    });

    test('should handle undefined/null parameters', async () => {
      const mockResponse = {
        results: [],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 }
        },
        total: 0,
        page: 1,
        totalPages: 0,
        searchTimeMs: 3.2
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await StorefrontApiService.unifiedSearch({
        query: undefined,
        category: undefined,
        priceMin: undefined
      });

      const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const url = fetchCall[0] as string;

      // Undefined parameters should not appear in URL
      expect(url).not.toContain('query=');
      expect(url).not.toContain('category=');
      expect(url).not.toContain('priceMin=');
    });

    test('should handle special characters in search query', async () => {
      const mockResponse = {
        results: [],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 1000, avgPrice: 0 }
        },
        total: 0,
        page: 1,
        totalPages: 0,
        searchTimeMs: 8.7
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await StorefrontApiService.unifiedSearch({
        query: 'café & bakery items (organic)'
      });

      const fetchCall = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0];
      const url = fetchCall[0] as string;

      // Special characters should be properly encoded
      expect(url).toContain('caf%C3%A9');
      expect(url).toContain('%26'); // &
      expect(url).toContain('%28'); // (
      expect(url).toContain('%29'); // )
    });
  });

  describe('Response Data Validation', () => {
    test('should handle malformed API response', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ malformed: 'response' }),
      } as Response);

      const result = await StorefrontApiService.unifiedSearch({
        query: 'test'
      });

      // Should return fallback structure
      expect(result.results).toBeDefined();
      expect(result.facets).toBeDefined();
      expect(result.total).toBeDefined();
    });

    test('should handle HTTP error responses', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' }),
      } as Response);

      const result = await StorefrontApiService.unifiedSearch({
        query: 'test'
      });

      expect(result.results).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('Performance Tests', () => {
    test('should complete search within reasonable time', async () => {
      const mockResponse = {
        results: [
          {
            entityType: 'product',
            entityId: 1,
            primaryName: 'Test Product',
            isActive: true,
            relevanceScore: 50,
            highlightedFields: []
          }
        ],
        facets: {
          categories: [],
          stores: [],
          locations: [],
          priceRange: { min: 0, max: 100, avgPrice: 25 }
        },
        total: 1,
        page: 1,
        totalPages: 1,
        searchTimeMs: 25.5
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const startTime = Date.now();
      await StorefrontApiService.unifiedSearch({ query: 'test' });
      const endTime = Date.now();

      const clientTime = endTime - startTime;
      expect(clientTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });
});
