# Zustand Store Migration: Step-by-Step Guide

This guide provides a practical, incremental approach to migrating your existing Zustand stores to use the unified API layer architecture.

## 🎯 Migration Overview

### Migration Phases
1. **Phase 1**: API Service Integration (2-3 days)
2. **Phase 2**: Enhanced Error Handling (1-2 days)
3. **Phase 3**: Caching and Performance (2-3 days)
4. **Phase 4**: Cross-Store Synchronization (1-2 days)
5. **Phase 5**: Testing and Optimization (2-3 days)

**Total Estimated Time: 8-13 days**

## 📋 Pre-Migration Checklist

- [ ] Unified API services are implemented and tested
- [ ] Shared types are defined and exported
- [ ] API client is configured with proper interceptors
- [ ] Development environment is set up for testing
- [ ] Backup of current stores is created

## 🔄 Phase 1: API Service Integration

### Step 1.1: Update Imports

**Before:**
```typescript
import { api } from '../services/api';
import { storeApi } from '../utils/api';
```

**After:**
```typescript
import { StoresApiService } from '../features/stores/services/storesApi';
import { InventoryApiService } from '../features/inventory/services/inventoryApi';
import type { Store, CreateStoreRequest } from '../shared/types/store';
```

### Step 1.2: Replace Direct API Calls

**Before:**
```typescript
fetchUserStores: async (userId: string) => {
  try {
    const response = await api.get<StoreData[]>(`/stores/user/${userId}`);
    // Handle response...
  } catch (error) {
    // Handle error...
  }
}
```

**After:**
```typescript
fetchUserStores: async (userId: string) => {
  try {
    const response = await StoresApiService.getUserStores(parseInt(userId));
    const stores = response.data || [];
    // Handle response...
  } catch (error) {
    // Enhanced error handling coming in Phase 2
  }
}
```

### Step 1.3: Update All Store Operations

For each store, update the following operations:

#### Auth Store Updates
```typescript
// Before
login: async (email: string, password: string) => {
  const data = await authApi.login(email, password);
  // Process data...
}

// After
login: async (email: string, password: string) => {
  const response = await AuthApiService.login({ email, password });
  // Process response.user, response.tokens, etc.
}
```

#### Stores Store Updates
```typescript
// Before
createStore: async (storeData: any) => {
  const newStore = await storeApi.createStore(storeData);
  // Process newStore...
}

// After  
createStore: async (storeData: CreateStoreRequest) => {
  const newStore = await StoresApiService.createStore(storeData);
  // Process newStore with better typing...
}
```

#### Inventory Store Updates
```typescript
// Before
fetchInventory: async (storeId: number) => {
  const items = await api.get<InventoryItem[]>(`/stores/${storeId}/inventory`);
  // Process items...
}

// After
fetchInventory: async (storeId: number) => {
  const response = await InventoryApiService.getStoreInventory(storeId);
  const items = response.data || [];
  // Process items...
}
```

### Step 1.4: Test Basic Functionality

```bash
# Run specific tests for updated operations
npm test -- --testPathPattern="stores.*test"

# Test API integration
npm run test:integration
```

## 🛡️ Phase 2: Enhanced Error Handling

### Step 2.1: Create Error Handler Utility

Create `src/stores/utils/errorHandler.ts`:

```typescript
export class StoreErrorHandler {
  static handleApiError(error: unknown, operation: string): string {
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('unauthorized')) {
        return 'Your session has expired. Please log in again.';
      }
      
      if (error.message.includes('validation')) {
        return `Please check your input for ${operation}.`;
      }
      
      if (error.message.includes('network')) {
        return 'Network error. Please check your connection.';
      }
      
      return error.message;
    }
    
    return `Failed to ${operation}. Please try again.`;
  }
  
  static shouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('network') || 
             error.message.includes('timeout');
    }
    return false;
  }
}
```

### Step 2.2: Update Error Handling in Stores

**Before:**
```typescript
} catch (error) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Failed to fetch stores';
  
  set((draft) => {
    draft.error = errorMessage;
    draft.isLoading = false;
  });
  
  toast.error(errorMessage);
  throw error;
}
```

**After:**
```typescript
} catch (error) {
  const errorMessage = StoreErrorHandler.handleApiError(error, 'fetch stores');
  
  set((draft) => {
    draft.error = errorMessage;
    draft.isLoading = false;
  });
  
  toast.error(errorMessage);
  
  // Retry logic for network errors
  if (StoreErrorHandler.shouldRetry(error)) {
    console.log('Retrying operation after network error...');
    // Could implement retry logic here
  }
  
  throw error;
}
```

### Step 2.3: Add Structured Error States

```typescript
interface ErrorState {
  error: string | null;
  errorCode?: string;
  errorDetails?: Record<string, unknown>;
  retryCount?: number;
}

// Update store interface to include enhanced error state
interface StoresState extends ErrorState {
  // ... other properties
}
```

## ⚡ Phase 3: Caching and Performance

### Step 3.1: Add Cache State Properties

```typescript
interface StoresState {
  // Existing properties...
  
  // Cache management
  lastFetchTime: Record<string, number>;
  cacheTimeout: number;
  
  // Performance tracking
  operationTimings: Record<string, number>;
}
```

### Step 3.2: Implement Smart Caching

```typescript
fetchUserStores: async (userId: string, forceRefresh = false) => {
  const state = get();
  const now = Date.now();
  const lastFetch = state.lastFetchTime[userId] || 0;
  const isCacheValid = (now - lastFetch) < state.cacheTimeout;

  // Step 1: Check cache validity
  if (!forceRefresh && state.storesByUserId[userId] && isCacheValid) {
    console.log(`🎯 Using cached stores for user ${userId}`);
    
    set((draft) => {
      draft.stores = draft.storesByUserId[userId];
      draft.hasStore = draft.storesByUserId[userId].length > 0;
    });
    return;
  }

  // Step 2: Fetch fresh data
  const startTime = Date.now();
  set((draft) => {
    draft.isLoading = true;
    draft.error = null;
  });

  try {
    console.log(`🔄 Fetching fresh stores for user ${userId}`);
    const response = await StoresApiService.getUserStores(parseInt(userId));
    const stores = response.data || [];

    set((draft) => {
      draft.stores = stores;
      draft.storesByUserId[userId] = stores;
      draft.hasStore = stores.length > 0;
      draft.isLoading = false;
      draft.lastFetchTime[userId] = now;
      draft.operationTimings[`fetchUserStores-${userId}`] = Date.now() - startTime;
    });

    console.log(`✅ Fetched ${stores.length} stores in ${Date.now() - startTime}ms`);
  } catch (error) {
    // Error handling...
  }
}
```

### Step 3.3: Add Cache Management Methods

```typescript
// Add to store actions
invalidateCache: (userId?: string) => {
  set((draft) => {
    if (userId) {
      delete draft.lastFetchTime[userId];
      delete draft.storesByUserId[userId];
    } else {
      draft.lastFetchTime = {};
      draft.storesByUserId = {};
    }
  });
},

getCacheStats: () => {
  const state = get();
  const now = Date.now();
  
  return {
    cachedUsers: Object.keys(state.storesByUserId).length,
    cacheHitRate: Object.entries(state.lastFetchTime)
      .filter(([_, time]) => (now - time) < state.cacheTimeout).length,
    averageOperationTime: Object.values(state.operationTimings)
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0),
  };
},
```

### Step 3.4: Implement Optimistic Updates

```typescript
updateStore: async (storeId: number, updates: UpdateStoreRequest) => {
  // Step 1: Store original state for rollback
  const originalStores = get().stores;
  const originalStore = originalStores.find(s => s.storeId === storeId);
  
  if (!originalStore) {
    throw new Error('Store not found');
  }

  // Step 2: Apply optimistic update
  set((draft) => {
    const updateStoreInArray = (stores: Store[]) => {
      const index = stores.findIndex(s => s.storeId === storeId);
      if (index !== -1) {
        stores[index] = { ...stores[index], ...updates };
      }
    };

    updateStoreInArray(draft.stores);
    
    // Update in all caches
    Object.values(draft.storesByUserId).forEach(updateStoreInArray);

    if (draft.primaryStore?.storeId === storeId) {
      draft.primaryStore = { ...draft.primaryStore, ...updates };
    }

    draft.isLoading = true;
  });

  // Step 3: Attempt server update
  try {
    console.log(`🔄 Optimistically updating store ${storeId}...`);
    const updatedStore = await StoresApiService.updateStore(storeId, updates);

    // Step 4: Confirm update with server response
    set((draft) => {
      const confirmStoreInArray = (stores: Store[]) => {
        const index = stores.findIndex(s => s.storeId === storeId);
        if (index !== -1) {
          stores[index] = updatedStore;
        }
      };

      confirmStoreInArray(draft.stores);
      Object.values(draft.storesByUserId).forEach(confirmStoreInArray);

      if (draft.primaryStore?.storeId === storeId) {
        draft.primaryStore = updatedStore;
      }

      draft.isLoading = false;
    });

    console.log(`✅ Store ${storeId} updated successfully`);
    toast.success('Store updated successfully!');
    
  } catch (error) {
    // Step 5: Rollback optimistic update on failure
    console.log(`❌ Rolling back optimistic update for store ${storeId}`);
    
    set((draft) => {
      const rollbackStoreInArray = (stores: Store[]) => {
        const index = stores.findIndex(s => s.storeId === storeId);
        if (index !== -1) {
          stores[index] = originalStore;
        }
      };

      rollbackStoreInArray(draft.stores);
      Object.values(draft.storesByUserId).forEach(rollbackStoreInArray);

      if (draft.primaryStore?.storeId === storeId) {
        draft.primaryStore = originalStore;
      }

      draft.error = StoreErrorHandler.handleApiError(error, 'update store');
      draft.isLoading = false;
    });

    toast.error('Failed to update store');
    throw error;
  }
},
```

## 🔗 Phase 4: Cross-Store Synchronization

### Step 4.1: Create Sync Manager

Create `src/stores/utils/syncManager.ts`:

```typescript
import { useAuthStore } from '../authStore';
import { useStoresStore } from '../storesStore';
import { useInventoryStore } from '../inventoryStore';

export class StoreSyncManager {
  // Store creation sync
  static async onStoreCreated(userId: string, newStore: Store) {
    console.log(`🏪 Syncing store creation: ${newStore.storeName}`);
    
    const storesStore = useStoresStore.getState();
    
    // Invalidate user's store cache to trigger refresh
    storesStore.invalidateCache(userId);
    
    // Update hasStore flags
    if (useAuthStore.getState().user?.userId === userId) {
      console.log('✅ User created their first store - updating hasStore flag');
    }
    
    // Could trigger welcome flow, analytics, etc.
    this.trackEvent('store_created', {
      userId,
      storeId: newStore.storeId,
      storeName: newStore.storeName,
    });
  }

  // Store update sync
  static async onStoreUpdated(storeId: number, updates: Partial<Store>) {
    console.log(`🔄 Syncing store update: ${storeId}`);
    
    const storesStore = useStoresStore.getState();
    const inventoryStore = useInventoryStore.getState();
    
    // Refresh store data across all caches
    try {
      await storesStore.getStore(storeId);
    } catch (error) {
      console.error('Failed to sync store data:', error);
    }
    
    // If store was deactivated, clear inventory cache
    if (updates.isActive === false) {
      console.log('🧹 Clearing inventory cache for deactivated store');
      inventoryStore.clearStore(storeId);
    }
  }

  // User logout sync
  static onUserLoggedOut() {
    console.log('🚪 Syncing user logout - clearing all stores');
    
    // Clear all user-specific data
    useStoresStore.setState({
      stores: [],
      primaryStore: null,
      storesByUserId: {},
      hasStore: false,
      lastFetchTime: {},
    });
    
    useInventoryStore.setState({
      inventoryByStore: {},
      loadingStores: new Set(),
      errorsByStore: {},
      lastFetchByStore: {},
    });
  }

  // Event tracking helper
  private static trackEvent(eventName: string, data: Record<string, unknown>) {
    // Integrate with your analytics service
    console.log(`📊 Event: ${eventName}`, data);
  }
}
```

### Step 4.2: Integrate Sync Manager

Update store operations to use sync manager:

```typescript
// In stores store
createStore: async (storeData: CreateStoreRequest) => {
  // ... existing create logic ...
  
  try {
    const newStore = await StoresApiService.createStore(storeData);
    
    // ... update store state ...
    
    // Trigger sync
    await StoreSyncManager.onStoreCreated(
      storeData.ownerId?.toString() || '', 
      newStore
    );
    
    return newStore;
  } catch (error) {
    // ... error handling ...
  }
},

// In auth store  
logout: async () => {
  try {
    await AuthApiService.logout();
  } finally {
    set((state) => {
      state.user = null;
      state.isAuthenticated = false;
    });
    
    // Trigger cross-store sync
    StoreSyncManager.onUserLoggedOut();
    
    toast.success('Logged out successfully');
  }
},
```

## 🧪 Phase 5: Testing and Optimization

### Step 5.1: Create Migration Tests

Create `src/stores/__tests__/migration.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useStoresStore } from '../storesStore';
import { StoresApiService } from '../features/stores/services/storesApi';
import { StoreSyncManager } from '../utils/syncManager';

jest.mock('../features/stores/services/storesApi');
const mockStoresApi = StoresApiService as jest.Mocked<typeof StoresApiService>;

describe('Store Migration Tests', () => {
  beforeEach(() => {
    useStoresStore.setState({
      stores: [],
      storesByUserId: {},
      lastFetchTime: {},
    });
  });

  test('should use cached data when available and valid', async () => {
    const userId = '123';
    const mockStores = [{ storeId: 1, storeName: 'Test Store' }];
    
    // Setup cache
    useStoresStore.setState({
      storesByUserId: { [userId]: mockStores },
      lastFetchTime: { [userId]: Date.now() },
    });

    const { result } = renderHook(() => useStoresStore());

    await act(async () => {
      await result.current.fetchUserStores(userId);
    });

    // Should not call API when cache is valid
    expect(mockStoresApi.getUserStores).not.toHaveBeenCalled();
    expect(result.current.stores).toEqual(mockStores);
  });

  test('should rollback optimistic updates on failure', async () => {
    const storeId = 1;
    const originalStore = { storeId, storeName: 'Original', isActive: true };
    const updates = { storeName: 'Updated', isActive: false };

    // Setup initial state
    useStoresStore.setState({
      stores: [originalStore],
    });

    // Mock API failure
    mockStoresApi.updateStore.mockRejectedValue(new Error('Update failed'));

    const { result } = renderHook(() => useStoresStore());

    // Attempt update
    await act(async () => {
      try {
        await result.current.updateStore(storeId, updates);
      } catch (error) {
        // Expected to fail
      }
    });

    // Verify rollback occurred
    expect(result.current.stores[0]).toEqual(originalStore);
    expect(result.current.error).toContain('update store');
  });

  test('should sync store creation across stores', async () => {
    const userId = '123';
    const newStore = { storeId: 1, storeName: 'New Store' };

    const syncSpy = jest.spyOn(StoreSyncManager, 'onStoreCreated');

    const { result } = renderHook(() => useStoresStore());

    await act(async () => {
      mockStoresApi.createStore.mockResolvedValue(newStore);
      await result.current.createStore({ ownerId: 123, storeName: 'New Store' });
    });

    expect(syncSpy).toHaveBeenCalledWith(userId, newStore);
  });
});
```

### Step 5.2: Performance Testing

Create `src/stores/__tests__/performance.test.ts`:

```typescript
describe('Store Performance Tests', () => {
  test('should complete cache operations within performance thresholds', async () => {
    const userId = '123';
    const { result } = renderHook(() => useStoresStore());

    // Test cache performance
    const startTime = Date.now();
    
    await act(async () => {
      await result.current.fetchUserStores(userId);
    });

    const cacheTime = Date.now() - startTime;
    expect(cacheTime).toBeLessThan(50); // Should be very fast for cached data
  });

  test('should handle large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      storeId: i,
      storeName: `Store ${i}`,
    }));

    mockStoresApi.getUserStores.mockResolvedValue({ data: largeDataset });

    const { result } = renderHook(() => useStoresStore());

    const startTime = Date.now();
    
    await act(async () => {
      await result.current.fetchUserStores('123');
    });

    const processTime = Date.now() - startTime;
    expect(processTime).toBeLessThan(1000); // Should handle 1000 items in under 1 second
    expect(result.current.stores).toHaveLength(1000);
  });
});
```

### Step 5.3: Create Migration Checklist

```typescript
// Create migration verification script
export const verifyMigration = () => {
  const checks = {
    apiServicesIntegrated: false,
    errorHandlingEnhanced: false,
    cachingImplemented: false,
    optimisticUpdatesWorking: false,
    crossStoreSyncWorking: false,
  };

  // Check API service integration
  try {
    const storesStore = useStoresStore.getState();
    if (typeof storesStore.getStore === 'function') {
      checks.apiServicesIntegrated = true;
    }
  } catch (error) {
    console.error('API services check failed:', error);
  }

  // Check caching
  try {
    const storesStore = useStoresStore.getState();
    if (storesStore.lastFetchTime && storesStore.cacheTimeout) {
      checks.cachingImplemented = true;
    }
  } catch (error) {
    console.error('Caching check failed:', error);
  }

  // Add more checks...

  console.log('Migration Verification Results:', checks);
  
  const allPassed = Object.values(checks).every(Boolean);
  if (allPassed) {
    console.log('✅ All migration checks passed!');
  } else {
    console.log('❌ Some migration checks failed');
  }

  return checks;
};
```

## 📊 Migration Tracking

### Daily Progress Tracking

Create a simple progress tracker:

```typescript
// Track migration progress
export const migrationProgress = {
  day1: {
    completed: ['API service imports', 'Basic API calls replaced'],
    remaining: ['Error handling', 'Type updates'],
    blockers: [],
  },
  day2: {
    completed: ['Error handling enhanced', 'Type safety improved'],
    remaining: ['Caching implementation'],
    blockers: ['Type conflicts in inventory store'],
  },
  // ... continue for each day
};
```

### Performance Metrics

Track before/after metrics:

```typescript
export const performanceMetrics = {
  before: {
    averageApiResponseTime: 800,
    cacheHitRate: 0,
    errorRecoveryTime: 'Manual',
    typeScriptCoverage: 60,
  },
  after: {
    averageApiResponseTime: 400,
    cacheHitRate: 85,
    errorRecoveryTime: 'Automatic',
    typeScriptCoverage: 95,
  },
  improvement: {
    responseTime: '50% faster',
    caching: '85% hit rate',
    errorHandling: '100% automatic',
    typeSafety: '35% improvement',
  },
};
```

## 🚨 Common Migration Issues

### Issue 1: Type Conflicts
```typescript
// Problem: Old API returns different structure
// Before: { id: number, name: string }  
// After: { storeId: number, storeName: string }

// Solution: Create adapter functions
const adaptOldStoreFormat = (oldStore: OldStore): Store => ({
  storeId: oldStore.id,
  storeName: oldStore.name,
  // ... map other fields
});
```

### Issue 2: Cache Invalidation
```typescript
// Problem: Stale cache data after updates
// Solution: Strategic cache invalidation

updateStore: async (storeId: number, updates: UpdateStoreRequest) => {
  // ... update logic ...
  
  // Invalidate related caches
  const userId = get().stores.find(s => s.storeId === storeId)?.ownerId;
  if (userId) {
    get().invalidateCache(userId.toString());
  }
}
```

### Issue 3: Optimistic Update Rollbacks
```typescript
// Problem: Complex state rollbacks
// Solution: Deep copy original state

const createStateSnapshot = (state: StoresState) => ({
  stores: state.stores.map(store => ({ ...store })),
  storesByUserId: Object.fromEntries(
    Object.entries(state.storesByUserId).map(([key, stores]) => [
      key, 
      stores.map(store => ({ ...store }))
    ])
  ),
  primaryStore: state.primaryStore ? { ...state.primaryStore } : null,
});
```

## ✅ Post-Migration Verification

### Verification Checklist

- [ ] All API calls use unified services
- [ ] Error handling is consistent and user-friendly
- [ ] Caching reduces unnecessary API calls
- [ ] Optimistic updates work with proper rollback
- [ ] Cross-store synchronization maintains consistency
- [ ] Performance metrics show improvement
- [ ] All tests pass
- [ ] TypeScript coverage is >90%
- [ ] No console errors in development
- [ ] Production deployment is successful

### Success Criteria

1. **Performance**: 50%+ improvement in response times
2. **Reliability**: 95%+ cache hit rate for repeated operations  
3. **User Experience**: Automatic error recovery
4. **Developer Experience**: Enhanced TypeScript support
5. **Maintainability**: Consistent patterns across all stores

---

**Migration Complete! 🎉**

Your Zustand stores are now using the unified API layer with enhanced caching, error handling, and cross-store synchronization. The improved architecture will provide better performance, reliability, and developer experience going forward.