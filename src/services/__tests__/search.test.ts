/**
 * Test file to verify search interfaces and API methods are properly exported
 * This helps catch import/export issues during development
 */

import StorefrontApiService, {
  type SearchResult,
  type SearchFacets,
  type SearchSuggestion,
  type Facet,
  type PriceRange,
} from '../storefront.api';

describe('Search Interface Exports', () => {
  test('SearchResult interface should be properly typed', () => {
    const mockSearchResult: SearchResult = {
      entityType: 'product',
      entityId: 1,
      primaryName: 'Test Product',
      description: 'Test description',
      sku: 'TEST-001',
      storeName: 'Test Store',
      storeId: 1,
      storeSlug: 'test-store',
      location: 'Austin, TX',
      categoryName: 'Vegetables',
      price: 10.99,
      unitPrice: 10.99,
      unit: 'lb',
      quantity: 50,
      imageUrl: '/test-image.jpg',
      isActive: true,
      relevanceScore: 85.5,
      highlightedFields: ['name', 'description'],
    };

    expect(mockSearchResult.entityType).toBe('product');
    expect(mockSearchResult.relevanceScore).toBe(85.5);
  });

  test('SearchSuggestion interface should be properly typed', () => {
    const mockSuggestion: SearchSuggestion = {
      text: 'organic tomatoes',
      entityType: 'product',
      entityId: 123,
      imageUrl: '/tomato.jpg',
      category: 'Vegetables',
      store: 'Fresh Farm Co',
      matchCount: 42,
    };

    expect(mockSuggestion.text).toBe('organic tomatoes');
    expect(mockSuggestion.matchCount).toBe(42);
  });

  test('SearchFacets interface should be properly typed', () => {
    const mockFacets: SearchFacets = {
      categories: [
        { value: 'vegetables', label: 'Vegetables', count: 25 },
        { value: 'fruits', label: 'Fruits', count: 18 },
      ],
      stores: [
        { value: 'fresh-farm', label: 'Fresh Farm Co', count: 12 },
      ],
      locations: [
        { value: 'austin-tx', label: 'Austin, TX', count: 8 },
      ],
      priceRange: {
        min: 0,
        max: 100,
        avgPrice: 15.50,
      },
    };

    expect(mockFacets.categories).toHaveLength(2);
    expect(mockFacets.priceRange.avgPrice).toBe(15.50);
  });

  test('StorefrontApiService should have unified search methods', () => {
    expect(typeof StorefrontApiService.unifiedSearch).toBe('function');
    expect(typeof StorefrontApiService.getSearchSuggestions).toBe('function');
    expect(typeof StorefrontApiService.getPopularSearchTerms).toBe('function');
  });

  test('Facet interface should be properly typed', () => {
    const mockFacet: Facet = {
      value: 'vegetables',
      label: 'Fresh Vegetables',
      count: 42,
    };

    expect(mockFacet.count).toBe(42);
  });

  test('PriceRange interface should be properly typed', () => {
    const mockPriceRange: PriceRange = {
      min: 5.00,
      max: 50.00,
      avgPrice: 22.50,
    };

    expect(mockPriceRange.min).toBe(5.00);
    expect(mockPriceRange.avgPrice).toBe(22.50);
  });
});

// Mock test for API methods (would need proper mocking in real tests)
describe('Search API Methods', () => {
  test('unifiedSearch method signature should be correct', () => {
    // This test just verifies the method exists and can be called
    // In a real test environment, you'd mock the API responses
    expect(() => {
      StorefrontApiService.unifiedSearch({
        query: 'test',
        page: 1,
        limit: 10,
      });
    }).not.toThrow();
  });

  test('getSearchSuggestions method signature should be correct', () => {
    expect(() => {
      StorefrontApiService.getSearchSuggestions({
        query: 'test',
        limit: 5,
      });
    }).not.toThrow();
  });

  test('getPopularSearchTerms method signature should be correct', () => {
    expect(() => {
      StorefrontApiService.getPopularSearchTerms(10);
    }).not.toThrow();
  });
});
