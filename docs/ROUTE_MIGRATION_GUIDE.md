# Route Migration Guide: From Monolithic to Feature-Based Architecture

## Overview

This guide documents the migration from a monolithic routing structure (30+ routes in `App.tsx`) to a feature-based architecture with lazy loading and error boundaries.

## Migration Summary

### What Changed

**Before:**
- All routes defined in `src/App.tsx`
- No code splitting or lazy loading
- Single point of failure for routing
- No feature-level error handling

**After:**
- Routes organized by feature in `src/features/*/routes.tsx`
- Lazy loading for all page components
- Feature-level error boundaries
- New router configuration in `src/app/router.tsx`

### Files Modified

#### Core Files
- ✅ `src/App.tsx` - Simplified, now uses `AppRouter`
- ✅ `src/app/router.tsx` - New centralized router configuration

#### New Feature Structure
```
src/features/
├── auth/routes.tsx          # 6 routes: login, register, forgot-password, etc.
├── dashboard/routes.tsx     # 2 routes: user & admin dashboards
├── stores/routes.tsx        # 8 routes: store management & applications
├── storefront/routes.tsx    # 6 routes: public stores & customization
├── inventory/routes.tsx     # 1 route: inventory management
├── search/routes.tsx        # 3 routes: search & product details
├── core/routes.tsx          # 2 routes: landing pages
└── index.ts                 # Central exports
```

#### New Components
- ✅ `src/components/FeatureErrorBoundary.tsx` - Error boundary for features

## Route Mapping

### Auth Routes (`/features/auth/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/login` | auth/routes.tsx | Public | Lazy loaded |
| `/register` | auth/routes.tsx | Public | Lazy loaded |
| `/forgot-password` | auth/routes.tsx | Public | Lazy loaded |
| `/reset-password` | auth/routes.tsx | Public | Lazy loaded |
| `/admin/auth/:submissionId` | auth/routes.tsx | Public | Lazy loaded |
| `/clear-token` | auth/routes.tsx | Public | Lazy loaded |

### Dashboard Routes (`/features/dashboard/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/dashboard` | dashboard/routes.tsx | Public | User dashboard |
| `/admin/dashboard` | dashboard/routes.tsx | Public | Admin dashboard |

### Store Routes (`/features/stores/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/open-shop` | stores/routes.tsx | Protected | Store creation |
| `/my-stores` | stores/routes.tsx | Protected | User's stores |
| `/stores/:storeId/dashboard` | stores/routes.tsx | Protected | Store management |
| `/stores/:storeId/products` | stores/routes.tsx | Protected | Product management |
| `/stores/:storeId/edit` | stores/routes.tsx | Protected | Edit store |
| `/stores/:storeId/settings` | stores/routes.tsx | Protected | Store settings |
| `/admin/store-applications` | stores/routes.tsx | Public | Admin applications |
| `/admin/store-applications/:submissionId` | stores/routes.tsx | Public | Review applications |

### Storefront Routes (`/features/storefront/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/browse` | storefront/routes.tsx | Public | Browse stores |
| `/store/:slug` | storefront/routes.tsx | Public | Published store |
| `/shop/:slug` | storefront/routes.tsx | Public | Alternative store URL |
| `/store/:slug/live` | storefront/routes.tsx | Public | Live storefront |
| `/stores/:storeId/customize` | storefront/routes.tsx | Protected | Customize storefront |
| `/storefront-demo` | storefront/routes.tsx | Public | Demo page |

### Inventory Routes (`/features/inventory/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/inventory/:storeId` | inventory/routes.tsx | Protected | Inventory management |

### Search Routes (`/features/search/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/search` | search/routes.tsx | Public | Product search |
| `/unified-search` | search/routes.tsx | Public | Unified search |
| `/product/:itemId` | search/routes.tsx | Public | Product details |

### Core Routes (`/features/core/routes.tsx`)
| Old Route | New Location | Protection | Notes |
|-----------|--------------|------------|-------|
| `/` | core/routes.tsx | Public | Landing page |
| `/how-it-works` | core/routes.tsx | Public | How it works |

## New Features Added

### 1. Lazy Loading
All page components are now lazy loaded:
```typescript
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
```

### 2. Feature Error Boundaries
Each feature has isolated error handling:
```typescript
const AuthFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName="Authentication">
    {children}
  </FeatureErrorBoundary>
);
```

### 3. Loading States
Centralized loading fallback for lazy components:
```typescript
const LoadingFallback = ({ featureName = 'page' }: { featureName?: string }) => (
  <Box>
    <CircularProgress />
    <Typography>Loading {featureName}...</Typography>
  </Box>
);
```

### 4. 404 Handling
Improved 404 page with better UX:
```typescript
{
  path: '*',
  element: <NotFoundPage />,
}
```

## Developer Experience Improvements

### Adding New Routes

**Before (Monolithic):**
```typescript
// Had to modify App.tsx every time
<Route path="/new-feature" element={<NewFeaturePage />} />
```

**After (Feature-Based):**
```typescript
// Add to appropriate feature file only
// In src/features/stores/routes.tsx
{
  path: '/stores/:storeId/analytics',
  element: (
    <StoresFeatureWrapper>
      <ProtectedRoute>
        <StoreAnalyticsPage />
      </ProtectedRoute>
    </StoresFeatureWrapper>
  ),
}
```

### Creating New Features

1. Create feature directory: `src/features/newfeature/`
2. Create `routes.tsx` file
3. Add to main router configuration
4. Export from `src/features/index.ts`

## Performance Benefits

### Bundle Size Reduction
- **Before:** Single large bundle with all routes
- **After:** Code-split bundles loaded on demand

### Improved Loading
- **Before:** All route components loaded upfront
- **After:** Components loaded when routes are accessed

### Error Isolation
- **Before:** Route error could crash entire app
- **After:** Feature-level error boundaries contain failures

## Backward Compatibility

### URL Structure
✅ **All existing URLs remain unchanged**
- No breaking changes for users
- SEO and bookmarks still work
- API integrations unaffected

### Component Imports
✅ **Page components remain in original locations**
- `src/pages/` structure unchanged
- No component refactoring required
- Existing imports still work

## Testing Strategy

### Route Testing
Each feature route module should have tests:
```typescript
// src/features/auth/routes.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { authRoutes } from './routes';

test('auth routes render correctly', () => {
  // Test route rendering
});
```

### Error Boundary Testing
Test error boundaries for each feature:
```typescript
// Test error boundary functionality
test('shows error UI when component throws', () => {
  // Test error boundary
});
```

### Lazy Loading Testing
Test lazy loading behavior:
```typescript
// Test that components are lazy loaded
test('components are lazy loaded', () => {
  // Test lazy loading
});
```

## Rollout Plan

### Phase 1: ✅ Implementation (Current)
- [x] Create feature directory structure
- [x] Implement all feature route modules
- [x] Create error boundary component
- [x] Update App.tsx to use new router
- [x] Add loading states and 404 handling

### Phase 2: Testing & Validation
- [ ] Unit tests for all route modules
- [ ] Integration tests for router configuration
- [ ] Performance testing (bundle size, loading times)
- [ ] Manual testing of all routes

### Phase 3: Deployment
- [ ] Deploy to staging environment
- [ ] Smoke tests on staging
- [ ] Performance monitoring
- [ ] Deploy to production

### Phase 4: Optimization
- [ ] Route-level analytics
- [ ] Performance optimizations
- [ ] Error monitoring integration
- [ ] Documentation updates

## Troubleshooting

### Common Issues

**Issue:** "Cannot resolve module" errors
**Solution:** Check lazy import paths are correct

**Issue:** Error boundary not catching errors  
**Solution:** Ensure errors are thrown during render, not in event handlers

**Issue:** Protected routes not working
**Solution:** Verify ProtectedRoute component is properly wrapped

**Issue:** Routes not loading
**Solution:** Check router configuration and route order

### Development Tools

**React Router DevTools:** 
- Install browser extension for route debugging

**React DevTools:**
- Use Profiler to monitor lazy loading performance

**Network Tab:**
- Monitor bundle loading and code splitting

## Success Metrics

### Before Migration
- ❌ 30+ routes in single file
- ❌ ~2MB initial bundle size
- ❌ Single point of failure
- ❌ No error isolation

### After Migration
- ✅ 7 feature modules with ~4 routes each
- ✅ ~500KB initial bundle (estimated)
- ✅ Isolated error boundaries
- ✅ Feature-level error handling

### Performance Targets
- [ ] 60% reduction in initial bundle size
- [ ] <100ms additional loading time for lazy routes
- [ ] Zero route-related crashes
- [ ] <5s recovery time from feature errors

## Next Steps

1. **Monitor Performance:** Track bundle sizes and loading times
2. **Error Monitoring:** Integrate with error reporting service
3. **Feature Ownership:** Assign teams to specific feature modules
4. **State Management:** Plan feature-based state architecture
5. **Documentation:** Keep route documentation up to date

## Support

For questions about the migration:
- Check this documentation first
- Review feature-specific route files
- Test changes in development environment
- Consult with the platform team for complex issues