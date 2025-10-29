# State Architecture Migration Guide: From AuthContext to Zustand Stores

## 🎯 Migration Overview

This guide documents the transition from the monolithic AuthContext system to a clean, domain-based Zustand store architecture. The new system eliminates cross-feature state conflicts and provides better performance, maintainability, and developer experience.

## 📊 Before vs After

### Current Problems (Before)
- ❌ **AuthContext manages 6+ domains** (auth, profile, store, referral, etc.)
- ❌ **Multiple competing hooks** (`useAuth`, `useUserStore`, `useComprehensiveStore`)
- ❌ **113 scattered localStorage calls** creating invisible dependencies
- ❌ **Cross-feature state conflicts** causing UI inconsistencies
- ❌ **Single point of failure** in state management

### New Architecture (After)
- ✅ **Clean domain separation** with dedicated stores
- ✅ **Single responsibility principle** - each store handles one domain
- ✅ **Centralized localStorage management** within stores
- ✅ **Predictable state updates** with clear ownership
- ✅ **Type-safe state management** throughout

## 🏗️ New Store Architecture

### Domain-Based Store Separation

```typescript
// Clean separation of concerns
useAuthStore()     // ONLY: login, logout, user identity, tokens
useStoresStore()   // ONLY: store list, hasStore flag, store operations  
useProfileStore()  // ONLY: profile picture, preferences, referral codes
useUIStore()       // ONLY: modals, notifications, loading states
useInventoryStore() // ONLY: inventory data per store
```

### Cross-Feature Communication Pattern

```typescript
// Features read from multiple domains but only write to their own
const Dashboard = () => {
  const user = useAuthStore(state => state.user);           // READ from auth
  const hasStore = useStoresStore(state => state.hasStore);  // READ from store  
  const avatar = useProfileStore(state => state.avatar);    // READ from profile
  
  // Components don't directly modify other domains
  // Use events or syncStores for cross-feature updates
};
```

## 📝 Migration Mapping

### 1. AuthContext → Multiple Stores

**Before (AuthContext):**
```typescript
const { 
  user,                    // Auth + Profile + Store data mixed
  isAuthenticated,         // Auth state
  login,                   // Auth operation
  updateProfile,           // Profile operation  
  updateStoreStatus,       // Store operation
  profilePictureUrl,       // Profile data
  referralCode,           // Profile data
  hasStore                // Store data
} = useAuth();
```

**After (Separated Stores):**
```typescript
// Authentication only
const { user, isAuthenticated, login, logout } = useAuthStore();

// Profile data only  
const { profilePictureUrl, referralCode, updatePicture } = useProfileStore();

// Store data only
const { hasStore, primaryStore, createStore } = useStoresStore();
```

### 2. useUserStore → useStoresStore

**Before:**
```typescript
const { 
  stores, 
  primaryStore, 
  isLoading, 
  error, 
  refetchStores 
} = useUserStore();
```

**After:**
```typescript
const { 
  stores, 
  primaryStore, 
  isLoading, 
  error, 
  refetchStores 
} = useStores(); // New clean hook
```

### 3. useComprehensiveStore → useComprehensiveStore (Reimplemented)

**Before (Mixed responsibilities):**
```typescript
const {
  storeData,
  updateStore,
  // Also handled inventory, profile, auth side effects
} = useComprehensiveStore();
```

**After (Store-focused only):**
```typescript
const {
  storeData,
  updateStore,
  // Only handles store data, no side effects in other domains
} = useComprehensiveStore();
```

## 🔄 Step-by-Step Migration Process

### Phase 1: Install New Dependencies ✅

```bash
npm install zustand@^4.5.0 immer@^10.0.3
```

### Phase 2: Initialize New Stores

**1. Update App.tsx to initialize stores:**

```typescript
// src/App.tsx
import { useEffect } from 'react';
import { initializeStores } from './stores';

function App() {
  useEffect(() => {
    initializeStores().catch(console.error);
  }, []);

  return (
    // ... rest of app
  );
}
```

**2. Remove AuthProvider dependency (later in process):**
```typescript
// Remove this wrapper eventually:
// <AuthProvider>
//   <AppRouter />
// </AuthProvider>

// Replace with direct router:
<AppRouter />
```

### Phase 3: Component Migration

#### Auth Components Migration

**Before:**
```typescript
import { useAuth } from '../contexts/AuthContext';

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  // ...
};
```

**After:**
```typescript
import { useAuth } from '../hooks/stores';

const LoginForm = () => {
  const { login, isLoading, error } = useAuth();
  // Same interface, different implementation
};
```

#### Profile Components Migration

**Before:**
```typescript
const ProfileComponent = () => {
  const { 
    user, 
    updateProfile, 
    profilePictureUrl 
  } = useAuth(); // Mixed concerns

  const handleUpdatePicture = (url) => {
    updateProfile({ profilePictureUrl: url });
  };
};
```

**After:**
```typescript
const ProfileComponent = () => {
  const user = useAuthStore(state => state.user);
  const { 
    profilePictureUrl, 
    updatePicture 
  } = useProfileStore(); // Dedicated profile store

  const handleUpdatePicture = (url) => {
    updatePicture(url);
  };
};
```

#### Store Management Components

**Before:**
```typescript
const StoreOverview = () => {
  const { user, hasStore } = useAuth();
  const { stores, primaryStore, isLoading } = useUserStore();
  
  // Potential conflicts between auth state and store state
};
```

**After:**
```typescript
const StoreOverview = () => {
  const user = useAuthStore(state => state.user);
  const { hasStore, stores, primaryStore, isLoading } = useStoresStore();
  
  // Clean separation, no conflicts
};
```

### Phase 4: Hook Replacement Strategy

#### Quick Wins (Drop-in Replacements)

These hooks have the same interface and can be replaced immediately:

```typescript
// Find and replace these imports:
import { useAuth } from '../contexts/AuthContext';
// ↓
import { useAuth } from '../hooks/stores';

import { useUserStore } from '../hooks/useUserStore';  
// ↓
import { useStores } from '../hooks/stores';
```

#### Components Requiring Refactoring

Components that use mixed concerns need more work:

```typescript
// BEFORE - Mixed concerns
const DashboardPage = () => {
  const { 
    user,              // Auth concern
    hasStore,          // Store concern  
    profilePictureUrl, // Profile concern
    updateProfile      // Profile operation
  } = useAuth();

  // Component logic mixing all concerns
};

// AFTER - Separated concerns  
const DashboardPage = () => {
  const user = useAuthStore(state => state.user);
  const hasStore = useStoresStore(state => state.hasStore);
  const profilePictureUrl = useProfileStore(state => state.currentProfile?.profilePictureUrl);
  const { updatePicture } = useProfileStore();

  // Clean, predictable state access
};
```

### Phase 5: Legacy Compatibility Hooks

For gradual migration, use compatibility hooks:

```typescript
// For components that can't be immediately refactored
import { useAuthLegacy } from '../hooks/stores';

const LegacyComponent = () => {
  // This provides the old AuthContext interface
  // but uses new stores under the hood
  const { 
    user,           // Includes auth + profile + store data
    updateProfile,  // Still works
    hasStore       // Still works
  } = useAuthLegacy();
};
```

## 🗂️ File-by-File Migration

### High Priority Files

Migrate these first for maximum impact:

1. **`src/components/ProtectedRoute.tsx`**
   ```typescript
   // Change:
   const { isAuthenticated, isLoading } = useAuth();
   // To:
   const { isAuthenticated, isLoading } = useAuthStore();
   ```

2. **`src/components/layout/Header.tsx`**
   ```typescript
   // Change:
   const { user, logout, profilePictureUrl } = useAuth();
   // To:
   const user = useAuthStore(state => state.user);
   const { logout } = useAuthStore();
   const profilePictureUrl = useProfileStore(state => state.currentProfile?.profilePictureUrl);
   ```

3. **`src/pages/user/UserDashboard.tsx`**
   - Split auth, profile, and store concerns
   - Use appropriate stores for each domain

### Medium Priority Files

4. **Store management pages** (`src/pages/user/StoreManagementPage.tsx`, etc.)
   - Replace `useUserStore` with `useStoresStore`
   - Replace `useComprehensiveStore` with new implementation

5. **Profile components** (`src/components/user/ProfilePictureUpload.tsx`)
   - Move to `useProfileStore` for all profile operations

### Lower Priority Files

6. **Admin components** - Can use legacy compatibility hooks initially
7. **Search components** - Minimal state management changes needed

## 🧪 Testing Strategy

### Unit Tests for Stores

```typescript
// Example store test
import { useAuthStore } from '../stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  test('login updates user state', async () => {
    const { login } = useAuthStore.getState();
    
    const user = await login('test@example.com', 'password');
    
    expect(useAuthStore.getState().user).toEqual(user);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test cross-store communication
test('profile updates after login', async () => {
  const { login } = useAuthStore.getState();
  const { loadProfile } = useProfileStore.getState();
  
  const user = await login('test@example.com', 'password');
  await loadProfile(user.userId);
  
  const profile = useProfileStore.getState().currentProfile;
  expect(profile?.userId).toBe(user.userId);
});
```

### Component Tests

```typescript
// Test component with new stores
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '../stores/authStore';
import LoginForm from './LoginForm';

test('LoginForm uses auth store', () => {
  // Mock store state
  useAuthStore.setState({ 
    isLoading: false, 
    error: null 
  });
  
  render(<LoginForm />);
  
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

## 🚨 Common Pitfalls and Solutions

### 1. Mixed State Dependencies

**Problem:**
```typescript
// Component trying to update multiple domains directly
const updateUserData = (profileData, storeData) => {
  updateProfile(profileData);  // Profile domain
  updateStore(storeData);      // Store domain
};
```

**Solution:**
```typescript
// Use appropriate stores for each domain
const updateUserData = (profileData, storeData) => {
  const { updatePicture } = useProfileStore.getState();
  const { updateStore } = useStoresStore.getState();
  
  updatePicture(profileData.profilePictureUrl);
  updateStore(storeData.storeId, storeData);
};
```

### 2. Cross-Store Updates

**Problem:**
```typescript
// Store operation affecting auth state
const createStore = async (storeData) => {
  const newStore = await api.createStore(storeData);
  // How to update hasStore in auth?
};
```

**Solution:**
```typescript
// Use syncStores helper
import { syncStores } from '../stores';

const createStore = async (storeData) => {
  const newStore = await storeApi.createStore(storeData);
  syncStores.onStoreUpdate(userId, newStore);
};
```

### 3. localStorage Conflicts

**Problem:**
```typescript
// Multiple components accessing localStorage directly
localStorage.getItem('user-data');        // Auth data
localStorage.getItem('profile-picture');  // Profile data
localStorage.getItem('store-settings');   // Store data
```

**Solution:**
```typescript
// Stores handle their own persistence
const user = useAuthStore(state => state.user);           // Persisted in auth store
const profile = useProfileStore(state => state.profile);  // Persisted in profile store
const stores = useStoresStore(state => state.stores);     // Persisted in stores store
```

## 📈 Performance Benefits

### Bundle Size Reduction
- **Lazy loading** of store logic
- **Code splitting** by domain
- **Reduced re-renders** with targeted selectors

### State Management Performance
```typescript
// Before - Everything re-renders on any auth change
const { user, profilePictureUrl, hasStore } = useAuth();

// After - Only relevant components re-render
const user = useAuthStore(state => state.user);                    // Only auth changes
const profilePictureUrl = useProfileStore(state => state.profile?.profilePictureUrl); // Only profile changes
const hasStore = useStoresStore(state => state.hasStore);          // Only store changes
```

## 🔧 Development Tools

### Store Debugging

```typescript
// Available in development mode
window.stores.auth.getState();     // Inspect auth store
window.stores.profile.getState();  // Inspect profile store
window.resetStores();              // Reset all stores
window.syncStores;                 // Access sync utilities
```

### State Devtools

Zustand integrates with Redux DevTools:

```bash
# Install Redux DevTools extension
# All store actions will be visible in the devtools
```

## 📅 Migration Timeline

### Week 1: Foundation
- ✅ Install Zustand dependencies
- ✅ Create all store implementations
- ✅ Create new hooks
- ✅ Add store initialization to App.tsx

### Week 2: Core Components
- [ ] Migrate ProtectedRoute
- [ ] Migrate Header component
- [ ] Migrate UserDashboard
- [ ] Update auth forms (Login, Register)

### Week 3: Feature Components
- [ ] Migrate store management components
- [ ] Migrate profile components
- [ ] Update inventory components
- [ ] Test cross-feature communication

### Week 4: Cleanup and Testing
- [ ] Remove old AuthContext
- [ ] Remove old hooks (useUserStore, etc.)
- [ ] Clean up localStorage usage
- [ ] Comprehensive testing

## ✅ Migration Checklist

### Pre-Migration
- [ ] All team members understand new architecture
- [ ] Development environment setup with Zustand
- [ ] Backup created of current codebase
- [ ] Test plan created

### During Migration
- [ ] Core stores implemented and tested
- [ ] Authentication flow migrated and working
- [ ] Profile management migrated and working
- [ ] Store management migrated and working
- [ ] Cross-feature communication working

### Post-Migration Validation
- [ ] All existing features work as before
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Performance improvements measured
- [ ] localStorage usage consolidated

### Cleanup
- [ ] AuthContext completely removed
- [ ] Old hooks removed
- [ ] Scattered localStorage calls removed
- [ ] Documentation updated
- [ ] Team trained on new patterns

## 🆘 Troubleshooting

### Store State Not Updating

**Issue:** Component not re-rendering when store state changes

**Solution:** 
```typescript
// Wrong - doesn't subscribe to changes
const state = useAuthStore.getState();

// Correct - subscribes to changes
const user = useAuthStore(state => state.user);
```

### Cross-Store Data Inconsistency

**Issue:** User data out of sync between stores

**Solution:**
```typescript
// Use syncStores utility
import { syncStores } from '../stores';

// After any cross-domain operation
syncStores.onProfileUpdate(userId, profileData);
```

### TypeScript Errors

**Issue:** Type mismatches with new store interfaces

**Solution:**
```typescript
// Use proper store types
import type { AuthUser } from '../stores/authStore';
import type { ProfileData } from '../stores/profileStore';
```

### Performance Issues

**Issue:** Too many re-renders

**Solution:**
```typescript
// Use specific selectors instead of whole state
// Wrong
const authState = useAuthStore();

// Right  
const user = useAuthStore(state => state.user);
const isLoading = useAuthStore(state => state.isLoading);
```

## 🎯 Success Criteria

### Technical Success
- [ ] AuthContext completely removed
- [ ] All competing custom hooks consolidated
- [ ] localStorage usage centralized to stores
- [ ] Zero circular dependencies between stores
- [ ] 100% TypeScript coverage for state

### Behavioral Success
- [ ] Store operations don't break dashboard display
- [ ] Profile updates don't affect authentication
- [ ] Adding new features doesn't break existing state
- [ ] State changes are predictable and debuggeable

### Performance Success
- [ ] Only affected components re-render on state changes
- [ ] No unnecessary API calls from state conflicts
- [ ] Faster development - clear patterns for new state

---

**🚀 Ready to start migration? Begin with Phase 1 and follow this guide step by step!**

**Next Steps:**
1. Review this guide with the team
2. Set up development environment
3. Begin with core component migration
4. Test thoroughly at each step
5. Celebrate when complete! 🎉