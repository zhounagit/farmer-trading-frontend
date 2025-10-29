import { graphqlClient, COMMON_QUERIES, COMMON_FRAGMENTS, hybridApiClient } from './graphqlClient';
import { StoresApiService } from '../../features/stores/services/storesApi';
import { InventoryApiService } from '../../features/inventory/services/inventoryApi';
import { AuthApiService } from '../../features/auth/services/authApi';
import { PartnershipsApiService } from '../../features/partnerships/services/partnershipsApi';
import type {
  Store,
  InventoryItem,
  User,
  Partnership
} from '../types';

// GraphQL-enhanced services that extend existing REST APIs
// These services use GraphQL for complex queries and REST for simple CRUD operations

export class GraphQLStoresService extends StoresApiService {
  /**
   * Get store with all nested data using GraphQL
   * Use this for dashboard/detail views that need comprehensive data
   */
  static async getStoreWithAllData(storeId: number): Promise<{
    store: Store;
    inventory: InventoryItem[];
    partnerships: Partnership[];
    analytics: any;
  }> {
    const query = `
      query GetStoreWithAllData($storeId: ID!) {
        store(id: $storeId) {
          ...StoreFragment
          inventory(limit: 50) {
            ...InventoryItemFragment
          }
          partnerships {
            ...PartnershipFragment
          }
          analytics(timeRange: LAST_30_DAYS) {
            totalRevenue
            totalOrders
            averageOrderValue
            topProducts {
              ...InventoryItemFragment
              salesCount
              revenue
            }
            revenueByDay {
              date
              revenue
              orderCount
            }
          }
        }
      }
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
      ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
      ${COMMON_FRAGMENTS.PARTNERSHIP_FRAGMENT}
    `;

    return graphqlClient.query(query, { storeId: storeId.toString() });
  }

  /**
   * Search stores with complex filters using GraphQL
   */
  static async searchStores(searchParams: {
    query: string;
    categories?: string[];
    storeTypes?: string[];
    location?: { lat: number; lng: number; radius: number };
    minRating?: number;
    hasDelivery?: boolean;
    priceRange?: { min: number; max: number };
    limit?: number;
  }): Promise<{
    stores: Store[];
    totalCount: number;
    facets: {
      categories: Array<{ name: string; count: number }>;
      storeTypes: Array<{ name: string; count: number }>;
      priceRanges: Array<{ range: string; count: number }>;
    };
  }> {
    const query = `
      query SearchStores(
        $query: String!
        $categories: [String!]
        $storeTypes: [StoreType!]
        $location: LocationFilter
        $minRating: Float
        $hasDelivery: Boolean
        $priceRange: PriceRangeFilter
        $limit: Int
      ) {
        searchStores(
          query: $query
          categories: $categories
          storeTypes: $storeTypes
          location: $location
          minRating: $minRating
          hasDelivery: $hasDelivery
          priceRange: $priceRange
          limit: $limit
        ) {
          stores {
            ...StoreFragment
            rating
            reviewCount
            deliveryOptions
            avgProductPrice
          }
          totalCount
          facets {
            categories {
              name
              count
            }
            storeTypes {
              name
              count
            }
            priceRanges {
              range
              count
            }
          }
        }
      }
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    `;

    return graphqlClient.query(query, searchParams);
  }

  /**
   * Get store recommendations based on user preferences and behavior
   */
  static async getStoreRecommendations(userId: string, limit: number = 10): Promise<{
    recommendations: Array<Store & {
      recommendationScore: number;
      reason: string;
      similarUsers: number;
    }>;
  }> {
    const query = `
      query GetStoreRecommendations($userId: ID!, $limit: Int!) {
        user(id: $userId) {
          storeRecommendations(limit: $limit) {
            ...StoreFragment
            recommendationScore
            reason
            similarUsers
          }
        }
      }
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    `;

    const result = await graphqlClient.query(query, { userId, limit });
    return {
      recommendations: result.user.storeRecommendations,
    };
  }
}

export class GraphQLInventoryService extends InventoryApiService {
  /**
   * Get inventory with advanced analytics using GraphQL
   */
  static async getInventoryWithAnalytics(storeId: number, timeRange: string = 'LAST_30_DAYS'): Promise<{
    inventory: InventoryItem[];
    analytics: {
      totalItems: number;
      totalValue: number;
      lowStockItems: number;
      topSellingItems: Array<InventoryItem & {
        salesCount: number;
        revenue: number;
        trend: 'up' | 'down' | 'stable';
      }>;
      categoryBreakdown: Array<{
        category: string;
        itemCount: number;
        totalValue: number;
        avgPrice: number;
      }>;
    };
  }> {
    const query = `
      query GetInventoryWithAnalytics($storeId: ID!, $timeRange: TimeRange!) {
        store(id: $storeId) {
          inventory {
            ...InventoryItemFragment
          }
          inventoryAnalytics(timeRange: $timeRange) {
            totalItems
            totalValue
            lowStockItems
            topSellingItems {
              ...InventoryItemFragment
              salesCount
              revenue
              trend
            }
            categoryBreakdown {
              category
              itemCount
              totalValue
              avgPrice
            }
          }
        }
      }
      ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
    `;

    const result = await graphqlClient.query(query, { storeId: storeId.toString(), timeRange });
    return {
      inventory: result.store.inventory,
      analytics: result.store.inventoryAnalytics,
    };
  }

  /**
   * Search inventory across multiple stores with advanced filters
   */
  static async searchInventoryGlobal(searchParams: {
    query: string;
    categories?: string[];
    priceRange?: { min: number; max: number };
    inStock?: boolean;
    organic?: boolean;
    location?: { lat: number; lng: number; radius: number };
    sortBy?: 'price' | 'popularity' | 'rating' | 'distance';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
  }): Promise<{
    items: Array<InventoryItem & {
      store: Store;
      distance?: number;
      rating: number;
      reviewCount: number;
    }>;
    totalCount: number;
    facets: {
      categories: Array<{ name: string; count: number }>;
      priceRanges: Array<{ range: string; count: number }>;
      locations: Array<{ city: string; state: string; count: number }>;
    };
  }> {
    const query = `
      query SearchInventoryGlobal(
        $query: String!
        $categories: [String!]
        $priceRange: PriceRangeFilter
        $inStock: Boolean
        $organic: Boolean
        $location: LocationFilter
        $sortBy: InventorySortField
        $sortOrder: SortOrder
        $limit: Int
      ) {
        searchInventory(
          query: $query
          categories: $categories
          priceRange: $priceRange
          inStock: $inStock
          organic: $organic
          location: $location
          sortBy: $sortBy
          sortOrder: $sortOrder
          limit: $limit
        ) {
          items {
            ...InventoryItemFragment
            store {
              ...StoreFragment
            }
            distance
            rating
            reviewCount
          }
          totalCount
          facets {
            categories { name count }
            priceRanges { range count }
            locations { city state count }
          }
        }
      }
      ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    `;

    return graphqlClient.query(query, searchParams);
  }

  /**
   * Get price history and market insights for an item
   */
  static async getItemMarketInsights(itemId: number, timeRange: string = 'LAST_90_DAYS'): Promise<{
    priceHistory: Array<{
      date: string;
      price: number;
      storeId: number;
      storeName: string;
    }>;
    marketStats: {
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      priceVariance: number;
      competitorCount: number;
    };
    recommendations: {
      suggestedPrice: number;
      reason: string;
    };
  }> {
    const query = `
      query GetItemMarketInsights($itemId: ID!, $timeRange: TimeRange!) {
        inventoryItem(id: $itemId) {
          marketInsights(timeRange: $timeRange) {
            priceHistory {
              date
              price
              storeId
              storeName
            }
            marketStats {
              avgPrice
              minPrice
              maxPrice
              priceVariance
              competitorCount
            }
            recommendations {
              suggestedPrice
              reason
            }
          }
        }
      }
    `;

    const result = await graphqlClient.query(query, { itemId: itemId.toString(), timeRange });
    return result.inventoryItem.marketInsights;
  }
}

export class GraphQLPartnershipsService extends PartnershipsApiService {
  /**
   * Get partnership network visualization data
   */
  static async getPartnershipNetwork(storeId: number, maxDepth: number = 3): Promise<{
    nodes: Array<{
      id: string;
      name: string;
      type: 'store' | 'user';
      storeType?: string;
      categories: string[];
      isDirectPartner: boolean;
      connectionDepth: number;
    }>;
    edges: Array<{
      source: string;
      target: string;
      partnershipType: string;
      status: string;
      weight: number;
    }>;
    metrics: {
      totalPartners: number;
      directPartners: number;
      indirectConnections: number;
      networkReach: number;
    };
  }> {
    const query = `
      query GetPartnershipNetwork($storeId: ID!, $maxDepth: Int!) {
        store(id: $storeId) {
          partnershipNetwork(maxDepth: $maxDepth) {
            nodes {
              id
              name
              type
              storeType
              categories
              isDirectPartner
              connectionDepth
            }
            edges {
              source
              target
              partnershipType
              status
              weight
            }
            metrics {
              totalPartners
              directPartners
              indirectConnections
              networkReach
            }
          }
        }
      }
    `;

    const result = await graphqlClient.query(query, { storeId: storeId.toString(), maxDepth });
    return result.store.partnershipNetwork;
  }

  /**
   * Get smart partnership recommendations using ML
   */
  static async getPartnershipRecommendations(storeId: number): Promise<{
    recommendations: Array<{
      store: Store;
      compatibilityScore: number;
      reasons: string[];
      sharedCategories: string[];
      complementaryCategories: string[];
      potentialRevenue: number;
      riskLevel: 'low' | 'medium' | 'high';
    }>;
  }> {
    const query = `
      query GetPartnershipRecommendations($storeId: ID!) {
        store(id: $storeId) {
          partnershipRecommendations {
            store {
              ...StoreFragment
            }
            compatibilityScore
            reasons
            sharedCategories
            complementaryCategories
            potentialRevenue
            riskLevel
          }
        }
      }
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    `;

    const result = await graphqlClient.query(query, { storeId: storeId.toString() });
    return {
      recommendations: result.store.partnershipRecommendations,
    };
  }

  /**
   * Get partnership performance analytics
   */
  static async getPartnershipAnalytics(partnershipId: number, timeRange: string = 'LAST_30_DAYS'): Promise<{
    performance: {
      totalRevenue: number;
      totalOrders: number;
      avgOrderValue: number;
      customerSatisfaction: number;
    };
    trends: Array<{
      date: string;
      revenue: number;
      orders: number;
      customerSatisfaction: number;
    }>;
    insights: {
      topProducts: Array<{
        item: InventoryItem;
        revenue: number;
        orderCount: number;
      }>;
      customerSegments: Array<{
        segment: string;
        percentage: number;
        avgOrderValue: number;
      }>;
    };
  }> {
    const query = `
      query GetPartnershipAnalytics($partnershipId: ID!, $timeRange: TimeRange!) {
        partnership(id: $partnershipId) {
          analytics(timeRange: $timeRange) {
            performance {
              totalRevenue
              totalOrders
              avgOrderValue
              customerSatisfaction
            }
            trends {
              date
              revenue
              orders
              customerSatisfaction
            }
            insights {
              topProducts {
                item { ...InventoryItemFragment }
                revenue
                orderCount
              }
              customerSegments {
                segment
                percentage
                avgOrderValue
              }
            }
          }
        }
      }
      ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
    `;

    const result = await graphqlClient.query(query, { partnershipId: partnershipId.toString(), timeRange });
    return result.partnership.analytics;
  }
}

export class GraphQLDashboardService {
  /**
   * Get comprehensive dashboard data in a single query
   */
  static async getDashboardData(userId: string, timeRange: string = 'LAST_30_DAYS'): Promise<{
    user: User;
    stores: Array<Store & {
      analytics: any;
      recentOrders: any[];
      lowStockAlerts: number;
    }>;
    globalInsights: {
      marketTrends: any[];
      competitorAnalysis: any[];
      opportunities: any[];
    };
    notifications: any[];
  }> {
    const query = `
      query GetDashboardData($userId: ID!, $timeRange: TimeRange!) {
        user(id: $userId) {
          ...UserFragment
          stores {
            ...StoreFragment
            analytics(timeRange: $timeRange) {
              totalRevenue
              totalOrders
              averageOrderValue
              revenueChange
              orderChange
            }
            recentOrders(limit: 5) {
              orderId
              customerName
              total
              status
              createdAt
            }
            lowStockAlerts
          }
          globalInsights(timeRange: $timeRange) {
            marketTrends {
              category
              trend
              changePercent
              insight
            }
            competitorAnalysis {
              competitorName
              marketShare
              strengths
              weaknesses
            }
            opportunities {
              type
              description
              potentialImpact
              difficulty
            }
          }
          notifications(unreadOnly: true) {
            id
            type
            title
            message
            createdAt
            isRead
          }
        }
      }
      ${COMMON_FRAGMENTS.USER_FRAGMENT}
      ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    `;

    const result = await graphqlClient.query(query, { userId, timeRange });
    return result.user;
  }

  /**
   * Get real-time dashboard metrics
   */
  static async getRealTimeMetrics(storeIds: number[]): Promise<{
    stores: Array<{
      storeId: number;
      activeVisitors: number;
      ordersToday: number;
      revenueToday: number;
      avgResponseTime: number;
      inventoryAlerts: number;
    }>;
    systemHealth: {
      apiResponseTime: number;
      uptime: number;
      errorRate: number;
    };
  }> {
    const query = `
      query GetRealTimeMetrics($storeIds: [ID!]!) {
        realTimeMetrics(storeIds: $storeIds) {
          stores {
            storeId
            activeVisitors
            ordersToday
            revenueToday
            avgResponseTime
            inventoryAlerts
          }
          systemHealth {
            apiResponseTime
            uptime
            errorRate
          }
        }
      }
    `;

    const result = await graphqlClient.query(query, {
      storeIds: storeIds.map(id => id.toString())
    });
    return result.realTimeMetrics;
  }
}

// Export all GraphQL-enhanced services
export const GraphQLServices = {
  Stores: GraphQLStoresService,
  Inventory: GraphQLInventoryService,
  Partnerships: GraphQLPartnershipsService,
  Dashboard: GraphQLDashboardService,
};

// Helper function to determine when to use GraphQL vs REST
export const shouldUseGraphQL = (operation: {
  complexity: 'simple' | 'complex';
  dataDepth: 'shallow' | 'deep';
  realTime: boolean;
  crossEntity: boolean;
}): boolean => {
  // Use GraphQL for:
  // - Complex queries with deep data requirements
  // - Cross-entity searches
  // - Real-time data needs
  // - Analytics and reporting

  if (operation.complexity === 'complex') return true;
  if (operation.dataDepth === 'deep') return true;
  if (operation.realTime) return true;
  if (operation.crossEntity) return true;

  // Use REST for simple CRUD operations
  return false;
};

// Smart API client that automatically chooses GraphQL or REST
export class SmartApiClient {
  static async getStore(storeId: number, includeAnalytics: boolean = false) {
    if (includeAnalytics) {
      // Complex query with analytics - use GraphQL
      return GraphQLServices.Stores.getStoreWithAllData(storeId);
    } else {
      // Simple query - use REST
      return StoresApiService.getStore(storeId);
    }
  }

  static async searchInventory(query: string, filters: any = {}) {
    if (Object.keys(filters).length > 2 || filters.location) {
      // Complex search with multiple filters - use GraphQL
      return GraphQLServices.Inventory.searchInventoryGlobal({ query, ...filters });
    } else {
      // Simple search - use REST
      return InventoryApiService.searchInventory({ query, ...filters });
    }
  }

  static async createStore(storeData: any) {
    // Simple CRUD operation - always use REST
    return StoresApiService.createStore(storeData);
  }

  static async getDashboard(userId: string) {
    // Complex nested query - always use GraphQL
    return GraphQLServices.Dashboard.getDashboardData(userId);
  }
}

export default GraphQLServices;
