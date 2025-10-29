# GraphQL Integration Guide

## 🚀 Overview

This guide documents the GraphQL integration that extends your existing unified REST API architecture. The hybrid approach combines the simplicity of REST for CRUD operations with the power of GraphQL for complex queries, providing the best of both worlds.

## 🏗️ Architecture

### Hybrid API Strategy

```
Frontend Application
├── REST APIs (Simple CRUD)
│   ├── Create/Update/Delete operations
│   ├── File uploads
│   └── Simple data fetching
└── GraphQL APIs (Complex Queries)
    ├── Dashboard analytics
    ├── Cross-entity searches
    ├── Relationship queries
    └── Real-time data
```

### Integration Points

```typescript
// Unified import - choose what you need
import { 
  StoresApiService,           // REST for CRUD
  GraphQLServices,            // GraphQL for complex queries
  SmartApiClient,             // Auto-choosing hybrid client
  shouldUseGraphQL            // Decision helper
} from 'shared/services';
```

## 📚 Components

### 1. GraphQL Client (`graphqlClient.ts`)

A robust GraphQL client that integrates seamlessly with your existing API infrastructure:

**Features:**
- **Authentication**: Automatic token management with refresh
- **Error Handling**: Consistent error responses with detailed context
- **Retry Logic**: Smart retry for network and server errors
- **Performance**: Request deduplication and caching
- **Type Safety**: Full TypeScript support with generics

**Usage:**
```typescript
import { graphqlClient } from 'shared/services';

// Simple query
const user = await graphqlClient.query(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`, { id: userId });

// Mutation
const result = await graphqlClient.mutate(`
  mutation UpdateUser($id: ID!, $data: UserInput!) {
    updateUser(id: $id, data: $data) {
      id
      name
      updatedAt
    }
  }
`, { id: userId, data: updateData });
```

### 2. GraphQL-Enhanced Services (`graphqlServices.ts`)

Extended versions of your existing services that add GraphQL capabilities:

#### GraphQLStoresService
- **Complex store queries** with nested data
- **Advanced search** with filters and faceting
- **ML-powered recommendations** based on user behavior

```typescript
// Get store with all related data in one query
const storeData = await GraphQLServices.Stores.getStoreWithAllData(storeId);
// Returns: store + inventory + partnerships + analytics

// Advanced search with multiple filters
const searchResults = await GraphQLServices.Stores.searchStores({
  query: 'organic vegetables',
  categories: ['produce', 'organic'],
  location: { lat: 40.7128, lng: -74.0060, radius: 50 },
  priceRange: { min: 5, max: 25 },
  hasDelivery: true
});
```

#### GraphQLInventoryService
- **Inventory with analytics** in single query
- **Global cross-store search** with location-based results
- **Market insights** with price history and recommendations

```typescript
// Get inventory with comprehensive analytics
const inventoryData = await GraphQLServices.Inventory.getInventoryWithAnalytics(storeId);

// Search across all stores with complex filters
const globalResults = await GraphQLServices.Inventory.searchInventoryGlobal({
  query: 'organic tomatoes',
  location: { lat: 40.7128, lng: -74.0060, radius: 100 },
  inStock: true,
  sortBy: 'distance'
});

// Get market intelligence for pricing decisions
const insights = await GraphQLServices.Inventory.getItemMarketInsights(itemId);
```

#### GraphQLPartnershipsService
- **Partnership network visualization** with graph data
- **Smart recommendations** using machine learning
- **Performance analytics** for existing partnerships

```typescript
// Get partnership network for visualization
const network = await GraphQLServices.Partnerships.getPartnershipNetwork(storeId, 3);
// Returns: nodes, edges, and metrics for network graph

// Get AI-powered partnership recommendations
const recommendations = await GraphQLServices.Partnerships.getPartnershipRecommendations(storeId);
```

#### GraphQLDashboardService
- **Comprehensive dashboard data** in single request
- **Real-time metrics** for live monitoring
- **Market trends and insights** for business intelligence

```typescript
// Load entire dashboard with one query
const dashboardData = await GraphQLServices.Dashboard.getDashboardData(userId);
// Returns: user + stores + analytics + insights + notifications

// Get real-time metrics
const liveMetrics = await GraphQLServices.Dashboard.getRealTimeMetrics(storeIds);
```

### 3. Smart API Client

Automatically chooses the optimal API approach based on operation characteristics:

```typescript
import { SmartApiClient, shouldUseGraphQL } from 'shared/services';

// Automatically uses GraphQL for complex queries with analytics
const storeWithAnalytics = await SmartApiClient.getStore(storeId, true);

// Automatically uses REST for simple CRUD operations
const simpleStore = await SmartApiClient.getStore(storeId, false);

// Manual decision making
const useGraphQL = shouldUseGraphQL({
  complexity: 'complex',
  dataDepth: 'deep',
  realTime: true,
  crossEntity: true
}); // Returns: true
```

## 🎯 When to Use GraphQL vs REST

### ✅ Use GraphQL for:

1. **Dashboard Queries**
   ```typescript
   // Load everything needed for dashboard in one request
   const dashboard = await GraphQLServices.Dashboard.getDashboardData(userId);
   ```

2. **Complex Search Operations**
   ```typescript
   // Cross-entity search with advanced filtering
   const results = await GraphQLServices.Inventory.searchInventoryGlobal({
     query: 'organic',
     categories: ['vegetables'],
     location: { lat: 40.7, lng: -74.0, radius: 50 }
   });
   ```

3. **Analytics and Reporting**
   ```typescript
   // Get comprehensive analytics with trends
   const analytics = await GraphQLServices.Stores.getStoreWithAllData(storeId);
   ```

4. **Relationship Queries**
   ```typescript
   // Partnership network with deep connections
   const network = await GraphQLServices.Partnerships.getPartnershipNetwork(storeId);
   ```

5. **Real-time Data**
   ```typescript
   // Live metrics across multiple stores
   const metrics = await GraphQLServices.Dashboard.getRealTimeMetrics(storeIds);
   ```

### ✅ Use REST for:

1. **Simple CRUD Operations**
   ```typescript
   // Basic store creation
   const store = await StoresApiService.createStore(storeData);
   ```

2. **File Uploads**
   ```typescript
   // Upload store images
   const image = await StoresApiService.uploadStoreImage(storeId, file);
   ```

3. **Simple Data Fetching**
   ```typescript
   // Get basic store info
   const store = await StoresApiService.getStore(storeId);
   ```

## 🔧 Zustand Integration

The GraphQL services integrate seamlessly with Zustand stores:

### Basic Integration

```typescript
import { create } from 'zustand';
import { GraphQLServices } from 'shared/services';

const useDashboardStore = create((set, get) => ({
  dashboardData: null,
  loading: false,

  fetchDashboard: async (userId) => {
    set({ loading: true });
    try {
      const data = await GraphQLServices.Dashboard.getDashboardData(userId);
      set({ dashboardData: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));
```

### Advanced Integration with Performance Tracking

```typescript
import { useGraphQLDashboardStore } from 'stores/examples/graphqlDashboardStore';

// Use specialized hooks for different sections
const { dashboardData, loading, fetchDashboardData } = useGraphQLDashboardData();
const { searchResults, searchInventoryGlobal } = useGlobalSearch();
const { performanceMetrics, compareGraphQLvsREST } = usePerformanceMetrics();
```

## 🧩 Common GraphQL Fragments

Reusable fragments for consistent data fetching:

```typescript
import { COMMON_FRAGMENTS } from 'shared/services';

const query = `
  query GetStoreDetails($storeId: ID!) {
    store(id: $storeId) {
      ...StoreFragment
      inventory(limit: 20) {
        ...InventoryItemFragment
      }
    }
  }
  ${COMMON_FRAGMENTS.STORE_FRAGMENT}
  ${COMMON_FRAGMENTS.INVENTORY_ITEM_FRAGMENT}
`;
```

### Available Fragments

- `USER_FRAGMENT` - Complete user data
- `STORE_FRAGMENT` - Store with addresses, categories
- `INVENTORY_ITEM_FRAGMENT` - Inventory items with images
- `PARTNERSHIP_FRAGMENT` - Partnership details with related stores

## 📊 Performance Benefits

### Bundle Size Reduction
- **GraphQL queries**: Fetch only needed data (no over-fetching)
- **Single requests**: Replace multiple REST calls with one GraphQL query
- **Shared fragments**: Reusable query components

### Network Efficiency
```typescript
// OLD: Multiple REST requests
const store = await fetch('/api/stores/1');
const inventory = await fetch('/api/stores/1/inventory');
const partnerships = await fetch('/api/stores/1/partnerships');
const analytics = await fetch('/api/stores/1/analytics');

// NEW: Single GraphQL request
const allData = await GraphQLServices.Stores.getStoreWithAllData(1);
```

### Caching Advantages
- **Normalized caching**: GraphQL clients can cache by entity ID
- **Query deduplication**: Automatic duplicate request elimination
- **Partial cache updates**: Update specific fields without full refresh

## 🔍 Error Handling

Comprehensive error handling with detailed context:

```typescript
try {
  const data = await graphqlClient.query(myQuery, variables);
} catch (error) {
  // Error structure:
  // {
  //   message: "User-friendly error message",
  //   code: "GRAPHQL_ERROR",
  //   status: 400,
  //   details: {
  //     graphqlErrors: [...],
  //     query: "...",
  //     variables: {...}
  //   }
  // }
  
  console.error('GraphQL Error:', error);
  toast.error(error.message);
}
```

## 🧪 Testing GraphQL Operations

### Unit Testing

```typescript
import { graphqlClient } from 'shared/services';

// Mock GraphQL client for testing
jest.mock('shared/services', () => ({
  graphqlClient: {
    query: jest.fn(),
    mutate: jest.fn()
  }
}));

test('should fetch dashboard data', async () => {
  const mockData = { user: { id: '1', name: 'Test User' } };
  graphqlClient.query.mockResolvedValue(mockData);

  const result = await GraphQLServices.Dashboard.getDashboardData('1');
  expect(result).toEqual(mockData);
});
```

### Integration Testing

```typescript
test('should handle GraphQL errors gracefully', async () => {
  graphqlClient.query.mockRejectedValue(new Error('Network error'));

  await expect(
    GraphQLServices.Dashboard.getDashboardData('1')
  ).rejects.toThrow('Network error');
});
```

## 🔧 Development Tools

### Health Checks

```typescript
import { getGraphQLHealth } from 'shared/services';

// Check GraphQL endpoint health
const health = await getGraphQLHealth();
if (health.isHealthy) {
  console.log('✅ GraphQL ready');
} else {
  console.error('❌ GraphQL issues:', health.error);
}
```

### Performance Monitoring

```typescript
import { usePerformanceMetrics } from 'stores/examples/graphqlDashboardStore';

const { performanceMetrics, compareGraphQLvsREST } = usePerformanceMetrics();

// Compare approaches for specific operations
const comparison = await compareGraphQLvsREST('dashboard-load');
console.log(`GraphQL is ${comparison.improvement}% faster`);
```

### Debug Mode

```typescript
// Development helpers are available in development mode
if (process.env.NODE_ENV === 'development') {
  window.graphqlClient = graphqlClient;
  window.graphqlServices = GraphQLServices;
  
  // Test queries in console
  window.testGraphQL = async () => {
    const result = await graphqlClient.query(`
      query { __schema { queryType { name } } }
    `);
    console.log('GraphQL Schema:', result);
  };
}
```

## 🚀 Advanced Features

### Real-time Subscriptions (Future)

```typescript
// Placeholder for WebSocket-based subscriptions
const unsubscribe = graphqlClient.subscribe(`
  subscription RealTimeMetrics($storeIds: [ID!]!) {
    metricsUpdated(storeIds: $storeIds) {
      storeId
      activeVisitors
      ordersToday
    }
  }
`, 
  { storeIds: ['1', '2'] },
  (data) => console.log('Real-time update:', data),
  (error) => console.error('Subscription error:', error)
);

// Clean up subscription
unsubscribe();
```

### Batch Operations

```typescript
// Execute multiple operations in one request
const results = await graphqlClient.batchQuery([
  {
    query: 'query GetUser($id: ID!) { user(id: $id) { name } }',
    variables: { id: '1' }
  },
  {
    query: 'query GetStore($id: ID!) { store(id: $id) { name } }',
    variables: { id: '1' }
  }
]);
```

## 📋 Best Practices

### 1. Query Organization

```typescript
// Keep queries in separate files
const DASHBOARD_QUERIES = {
  GET_DASHBOARD_DATA: `
    query GetDashboardData($userId: ID!) {
      user(id: $userId) {
        ...UserFragment
        stores { ...StoreFragment }
      }
    }
    ${COMMON_FRAGMENTS.USER_FRAGMENT}
    ${COMMON_FRAGMENTS.STORE_FRAGMENT}
  `
};
```

### 2. Error Boundaries

```typescript
// Wrap GraphQL operations in error boundaries
const DashboardWithErrorBoundary = () => (
  <ErrorBoundary
    fallback={<div>Dashboard temporarily unavailable</div>}
  >
    <Dashboard />
  </ErrorBoundary>
);
```

### 3. Loading States

```typescript
// Always provide loading states for GraphQL operations
const Dashboard = () => {
  const { dashboardData, loading, error, fetchDashboardData } = useGraphQLDashboardData();

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorDisplay error={error} retry={fetchDashboardData} />;
  if (!dashboardData) return <EmptyDashboard />;

  return <DashboardContent data={dashboardData} />;
};
```

### 4. Pagination

```typescript
// Use cursor-based pagination for GraphQL
const PAGINATED_STORES = `
  query GetStores($first: Int!, $after: String) {
    stores(first: $first, after: $after) {
      edges {
        node { ...StoreFragment }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

## 🔄 Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing REST APIs functional
- Add GraphQL endpoints alongside REST
- Use feature flags to control which API is used

### Phase 2: Gradual Adoption
- Start with dashboard and analytics (complex queries)
- Move search and discovery features to GraphQL
- Keep CRUD operations on REST initially

### Phase 3: Optimization
- Identify performance bottlenecks
- Convert high-impact operations to GraphQL
- Maintain REST for simple operations

## 📈 Success Metrics

### Performance Improvements
- **Reduced request count**: Dashboard loads with 1 request instead of 5-10
- **Lower bandwidth usage**: Fetch only required fields
- **Faster page loads**: Combine related data in single query

### Developer Experience
- **Improved debugging**: Better error messages and context
- **Enhanced tooling**: GraphQL playground and introspection
- **Type safety**: Auto-generated TypeScript types from schema

### User Experience
- **Faster interactions**: Reduced loading times
- **Better offline support**: Normalized caching
- **Real-time updates**: WebSocket subscriptions (future)

## 🎉 Conclusion

The GraphQL integration provides a powerful enhancement to your existing unified API architecture. By combining REST for simple operations with GraphQL for complex queries, you get:

- **Best of both worlds**: Simple CRUD with REST, complex queries with GraphQL
- **Seamless integration**: Works with existing Zustand stores and components
- **Performance benefits**: Reduced over-fetching and network requests
- **Developer experience**: Better tooling, error handling, and type safety
- **Future-ready**: Foundation for real-time features and advanced optimizations

The hybrid approach ensures you can adopt GraphQL gradually while maintaining the reliability and simplicity of your existing REST APIs.