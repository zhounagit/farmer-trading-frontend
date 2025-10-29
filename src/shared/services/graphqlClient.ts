import { GraphQLClient } from 'graphql-request';
import { apiClient } from './apiClient';
import { STORAGE_KEYS } from '../../utils/api';
import type { ApiError } from '../types/api';

// GraphQL endpoint configuration
const GRAPHQL_CONFIG = {
  endpoint: 'https://localhost:7008/graphql',
  timeout: 30000,
  retries: 3,
};

// GraphQL operation types
export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, any>;
  }>;
}

export interface GraphQLVariables {
  [key: string]: any;
}

// GraphQL client class that integrates with our unified API architecture
class GraphQLApiClient {
  private client: GraphQLClient;
  private isInitialized = false;

  constructor() {
    this.client = new GraphQLClient(GRAPHQL_CONFIG.endpoint, {
      timeout: GRAPHQL_CONFIG.timeout,
      headers: this.getHeaders(),
    });
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication token if available
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private updateHeaders(): void {
    this.client.setHeaders(this.getHeaders());
  }

  private createApiError(error: any): ApiError {
    // Handle GraphQL errors
    if (error.response?.errors) {
      const graphqlErrors = error.response.errors;
      const mainError = graphqlErrors[0];

      return {
        message: mainError.message || 'GraphQL query failed',
        code: mainError.extensions?.code || 'GRAPHQL_ERROR',
        status: error.response.status,
        details: {
          graphqlErrors,
          query: error.request?.query,
          variables: error.request?.variables,
        },
      };
    }

    // Handle network errors
    if (error.request && !error.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        details: { originalError: error.message },
      };
    }

    // Handle other errors
    return {
      message: error.message || 'An unexpected GraphQL error occurred',
      code: 'UNKNOWN_GRAPHQL_ERROR',
      details: { originalError: String(error) },
    };
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = GRAPHQL_CONFIG.retries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      // Retry on network errors or 5xx server errors
      if (retries > 0 && this.shouldRetry(error)) {
        console.warn(`GraphQL operation failed, retrying... (${retries} attempts left)`);
        await this.delay(1000 * (GRAPHQL_CONFIG.retries - retries + 1)); // Exponential backoff
        return this.executeWithRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors
    if (error.request && !error.response) return true;

    // Retry on 5xx server errors
    if (error.response?.status >= 500) return true;

    // Don't retry on client errors (4xx)
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods

  /**
   * Execute a GraphQL query
   */
  async query<T = any>(
    query: string,
    variables?: GraphQLVariables
  ): Promise<T> {
    this.updateHeaders();

    return this.executeWithRetry(async () => {
      try {
        const result = await this.client.request<T>(query, variables);
        return result;
      } catch (error) {
        throw this.createApiError(error);
      }
    });
  }

  /**
   * Execute a GraphQL mutation
   */
  async mutate<T = any>(
    mutation: string,
    variables?: GraphQLVariables
  ): Promise<T> {
    this.updateHeaders();

    return this.executeWithRetry(async () => {
      try {
        const result = await this.client.request<T>(mutation, variables);
        return result;
      } catch (error) {
        throw this.createApiError(error);
      }
    });
  }

  /**
   * Execute multiple operations in a batch
   */
  async batchQuery<T = any>(
    operations: Array<{
      query: string;
      variables?: GraphQLVariables;
      operationName?: string;
    }>
  ): Promise<T[]> {
    this.updateHeaders();

    const batchQuery = `
      query BatchQuery {
        ${operations.map((op, index) => `
          operation${index}: ${op.query}
        `).join('\n')}
      }
    `;

    return this.executeWithRetry(async () => {
      try {
        const result = await this.client.request<T[]>(batchQuery);
        return Array.isArray(result) ? result : [result];
      } catch (error) {
        throw this.createApiError(error);
      }
    });
  }

  /**
   * Subscribe to real-time updates (WebSocket-based)
   * Note: Requires WebSocket support on the GraphQL server
   */
  subscribe<T = any>(
    subscription: string,
    variables?: GraphQLVariables,
    onData?: (data: T) => void,
    onError?: (error: ApiError) => void
  ): () => void {
    console.warn('GraphQL subscriptions not yet implemented. Consider using WebSocket directly.');
    return () => {}; // Unsubscribe function
  }

  /**
   * Check GraphQL endpoint health
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    schema?: any;
    error?: string;
  }> {
    try {
      const introspectionQuery = `
        query IntrospectionQuery {
          __schema {
            queryType {
              name
            }
            mutationType {
              name
            }
            subscriptionType {
              name
            }
          }
        }
      `;

      const result = await this.query(introspectionQuery);
      return {
        isHealthy: true,
        schema: result,
      };
    } catch (error: any) {
      return {
        isHealthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Get the underlying GraphQL client for advanced usage
   */
  getGraphQLClient(): GraphQLClient {
    return this.client;
  }

  /**
   * Update endpoint configuration (useful for environment switching)
   */
  updateEndpoint(endpoint: string): void {
    this.client = new GraphQLClient(endpoint, {
      timeout: GRAPHQL_CONFIG.timeout,
      headers: this.getHeaders(),
    });
  }
}

// Export singleton instance
export const graphqlClient = new GraphQLApiClient();

// Common GraphQL fragments for reuse
export const COMMON_FRAGMENTS = {
  // User fragment
  USER_FRAGMENT: `
    fragment UserFragment on User {
      userId
      email
      firstName
      lastName
      userType
      isActive
      profilePictureUrl
      createdAt
      updatedAt
    }
  `,

  // Store fragment
  STORE_FRAGMENT: `
    fragment StoreFragment on Store {
      id
      name
      description
      storeType
      approvalStatus
      isActive
      createdAt
      updatedAt
      addresses {
        id
        addressType
        locationName
        streetAddress
        city
        state
        zipCode
        country
      }
      categories {
        id
        categoryName
        description
      }
    }
  `,

  // Inventory item fragment
  INVENTORY_ITEM_FRAGMENT: `
    fragment InventoryItemFragment on InventoryItem {
      itemId
      storeId
      itemName
      description
      category
      price
      unit
      quantityAvailable
      lowStockThreshold
      sku
      isActive
      createdAt
      updatedAt
      images {
        id
        imageUrl
        altText
        sortOrder
      }
    }
  `,

  // Partnership fragment
  PARTNERSHIP_FRAGMENT: `
    fragment PartnershipFragment on Partnership {
      partnershipId
      requestorStoreId
      recipientStoreId
      partnershipType
      status
      title
      description
      terms
      createdAt
      updatedAt
      requestorStore {
        ...StoreFragment
      }
      recipientStore {
        ...StoreFragment
      }
    }
  `,
};

// Common GraphQL queries for complex data fetching
export const COMMON_QUERIES = {
  // Get user with all related data
  GET_USER_WITH_STORES: `
    query GetUserWithStores($userId: ID!) {
      user(id: $userId) {
        ...UserFragment
        stores {
          ...StoreFragment
          inventory(limit: 10) {
            ...InventoryItemFragment
          }
          partnerships {
            ...PartnershipFragment
          }
        }
      }
    }
    ${COMMON_FRAGMENTS.USER_FRAGMENT}
    ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
    ${COMMON_FRAGMENTS.PARTNERSHIP_FRAGMENT}
  `,

  // Search across multiple entities
  GLOBAL_SEARCH: `
    query GlobalSearch($query: String!, $limit: Int = 20) {
      search(query: $query, limit: $limit) {
        stores {
          ...StoreFragment
        }
        products {
          ...InventoryItemFragment
          store {
            ...StoreFragment
          }
        }
        users {
          ...UserFragment
        }
      }
    }
    ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
    ${COMMON_FRAGMENTS.USER_FRAGMENT}
  `,

  // Dashboard analytics query
  DASHBOARD_ANALYTICS: `
    query DashboardAnalytics($storeId: ID!, $timeRange: TimeRange!) {
      store(id: $storeId) {
        ...StoreFragment
        analytics(timeRange: $timeRange) {
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
          customerInsights {
            totalCustomers
            returningCustomers
            newCustomers
          }
        }
      }
    }
    ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
  `,

  // Complex partnership network query
  PARTNERSHIP_NETWORK: `
    query PartnershipNetwork($storeId: ID!, $maxDepth: Int = 3) {
      store(id: $storeId) {
        ...StoreFragment
        partnershipNetwork(maxDepth: $maxDepth) {
          directPartners {
            ...StoreFragment
            partnershipDetails {
              ...PartnershipFragment
            }
          }
          indirectConnections {
            ...StoreFragment
            connectionPath {
              ...StoreFragment
            }
          }
          recommendedPartners {
            ...StoreFragment
            compatibilityScore
            sharedCategories
          }
        }
      }
    }
    ${COMMON_FRAGMENTS.STORE_FRAGMENT}
    ${COMMON_FRAGMENTS.PARTNERSHIP_FRAGMENT}
  `,
};

// Helper functions for common GraphQL operations
export const GraphQLHelpers = {
  /**
   * Create a paginated query wrapper
   */
  createPaginatedQuery: (
    baseQuery: string,
    entityName: string
  ) => `
    query Paginated${entityName}($first: Int, $after: String, $orderBy: OrderBy) {
      ${entityName.toLowerCase()}s(first: $first, after: $after, orderBy: $orderBy) {
        edges {
          node {
            ${baseQuery}
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  `,

  /**
   * Create a search query with filters
   */
  createSearchQuery: (
    entityName: string,
    fragment: string,
    filters: string[]
  ) => `
    query Search${entityName}($query: String!, $filters: ${entityName}Filters) {
      search${entityName}s(query: $query, filters: $filters) {
        ${fragment}
      }
    }
  `,

  /**
   * Build dynamic query based on requested fields
   */
  buildDynamicQuery: (
    entityName: string,
    requestedFields: string[]
  ): string => {
    const fieldList = requestedFields.join('\n        ');
    return `
      query Dynamic${entityName}($id: ID!) {
        ${entityName.toLowerCase()}(id: $id) {
          ${fieldList}
        }
      }
    `;
  },
};

// Integration with existing API client
export const createHybridApiClient = () => {
  return {
    // REST API methods (existing)
    rest: apiClient,

    // GraphQL API methods (new)
    graphql: graphqlClient,

    // Hybrid methods that choose optimal approach
    async fetchUserDashboard(userId: string) {
      // Use GraphQL for complex nested data
      return graphqlClient.query(COMMON_QUERIES.GET_USER_WITH_STORES, { userId });
    },

    async searchGlobal(query: string, limit: number = 20) {
      // Use GraphQL for cross-entity search
      return graphqlClient.query(COMMON_QUERIES.GLOBAL_SEARCH, { query, limit });
    },

    async createStore(storeData: any) {
      // Use REST for simple CRUD operations
      return apiClient.post('/api/stores', storeData);
    },

    async getAnalytics(storeId: string, timeRange: string) {
      // Use GraphQL for complex analytics
      return graphqlClient.query(COMMON_QUERIES.DASHBOARD_ANALYTICS, { storeId, timeRange });
    },
  };
};

// Export hybrid client instance
export const hybridApiClient = createHybridApiClient();

// Type definitions for common GraphQL operations
export interface UserWithStores {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    stores: Array<{
      id: number;
      name: string;
      inventory: any[];
      partnerships: any[];
    }>;
  };
}

export interface GlobalSearchResults {
  search: {
    stores: any[];
    products: any[];
    users: any[];
  };
}

export interface DashboardAnalytics {
  store: {
    id: number;
    name: string;
    analytics: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
      topProducts: any[];
      revenueByDay: Array<{
        date: string;
        revenue: number;
        orderCount: number;
      }>;
    };
  };
}
