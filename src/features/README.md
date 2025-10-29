# Feature-Based Route Architecture

This directory contains the feature-based route architecture that replaces the monolithic routing structure in `App.tsx`. Each feature is self-contained with its own routes, lazy loading, and error boundaries.

## Architecture Overview

```
src/features/
├── README.md                    # This file
├── index.ts                     # Central exports
├── auth/
│   └── routes.tsx              # Authentication routes
├── dashboard/
│   └── routes.tsx              # User & admin dashboards
├── stores/
│   └── routes.tsx              # Store management & applications
├── storefront/
│   └── routes.tsx              # Public storefronts & customization
├── inventory/
│   └── routes.tsx              # Inventory management
├── search/
│   └── routes.tsx              # Search & product details
└── core/
    └── routes.tsx              # Landing pages
```

## Key Features

### ✅ Lazy Loading
All page components are lazy loaded using `React.lazy()`, improving initial bundle size and loading performance.

### ✅ Error Boundaries
Each feature has its own error boundary (`FeatureErrorBoundary`) that:
- Isolates errors to prevent app-wide crashes
- Shows user-friendly error messages
- Provides retry functionality
- Logs errors for debugging (can integrate with error reporting services)

### ✅ Protected Routes
Routes that require authentication are wrapped with `ProtectedRoute` component within feature boundaries.

### ✅ Route Organization
Routes are organized by business domain/feature, making it easy to:
- Add new routes without touching central files
- Maintain feature-specific routing logic
- Scale individual features independently

## Feature Breakdown

### 🔐 Auth Feature (`/auth`)
**Routes:**
- `/login` - User login
- `/register` - User registration  
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/admin/auth/:submissionId` - Admin authentication
- `/clear-token` - Clear authentication tokens

**Pages:** All auth-related pages from `src/pages/auth/`

### 📊 Dashboard Feature (`/dashboard`)  
**Routes:**
- `/dashboard` - User dashboard
- `/admin/dashboard` - Admin dashboard

**Pages:** User and admin dashboard pages

### 🏪 Stores Feature (`/stores`)
**Routes:**
- `/open-shop` - Create new store (protected)
- `/my-stores` - List user's stores (protected)
- `/stores/:storeId/dashboard` - Store management (protected)
- `/stores/:storeId/products` - Product management (protected)
- `/stores/:storeId/edit` - Edit store (protected)
- `/stores/:storeId/settings` - Store settings (protected)
- `/admin/store-applications` - Admin store applications
- `/admin/store-applications/:submissionId` - Review applications

**Pages:** Store management and admin application pages

### 🛍️ Storefront Feature (`/storefront`)
**Routes:**
- `/browse` - Browse all stores (public)
- `/store/:slug` - Published store page (public)
- `/shop/:slug` - Alternative store URL (public)  
- `/store/:slug/live` - Live storefront (public)
- `/stores/:storeId/customize` - Customize storefront (protected)
- `/storefront-demo` - Demo page (public)

**Pages:** Public storefront and customization pages

### 📦 Inventory Feature (`/inventory`)
**Routes:**
- `/inventory/:storeId` - Inventory management (protected)

**Pages:** Inventory management pages

### 🔍 Search Feature (`/search`)
**Routes:**
- `/search` - Product search (public)
- `/unified-search` - Unified search (public)
- `/product/:itemId` - Product details (public)

**Pages:** Search and product detail pages

### 🏠 Core Feature (`/core`)
**Routes:**
- `/` - Landing page (public)
- `/how-it-works` - How it works page (public)

**Pages:** Core landing pages

## Usage

### Adding New Routes to Existing Features

1. Add the route to the appropriate feature's `routes.tsx` file:
```typescript
// In src/features/stores/routes.tsx
export const storesRoutes: RouteObject[] = [
  // ... existing routes
  {
    path: '/stores/:storeId/analytics',
    element: (
      <StoresFeatureWrapper>
        <ProtectedRoute>
          <StoreAnalyticsPage />
        </ProtectedRoute>
      </StoresFeatureWrapper>
    ),
  },
];
```

2. Import the page component (lazy load if needed):
```typescript
const StoreAnalyticsPage = lazy(() => import('../../pages/store/StoreAnalyticsPage'));
```

### Creating New Features

1. Create a new feature directory:
```bash
mkdir src/features/analytics
```

2. Create the routes file:
```typescript
// src/features/analytics/routes.tsx
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';

const AnalyticsPage = lazy(() => import('../../pages/analytics/AnalyticsPage'));

const AnalyticsFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName="Analytics">
    {children}
  </FeatureErrorBoundary>
);

export const analyticsRoutes: RouteObject[] = [
  {
    path: '/analytics',
    element: (
      <AnalyticsFeatureWrapper>
        <AnalyticsPage />
      </AnalyticsFeatureWrapper>
    ),
  },
];

export default analyticsRoutes;
```

3. Add to the main router in `src/app/router.tsx`:
```typescript
import { analyticsRoutes } from '../features/analytics/routes';

const router = createBrowserRouter([
  // ... existing routes
  ...analyticsRoutes,
  // ... rest of routes
]);
```

4. Export from features index:
```typescript
// src/features/index.ts
export { analyticsRoutes } from './analytics/routes';
```

## Migration Benefits

### Before (Monolithic)
- ❌ 30+ routes in single App.tsx file
- ❌ Single point of failure for routing
- ❌ No lazy loading
- ❌ No feature-level error handling
- ❌ Hard to maintain and scale

### After (Feature-Based)
- ✅ ~7 feature-level route modules
- ✅ Isolated failure boundaries
- ✅ Lazy loading for all features
- ✅ Feature-level error boundaries
- ✅ Easy to maintain and scale
- ✅ Clear separation of concerns

## Performance Impact

### Bundle Splitting
Each feature is now code-split, meaning:
- Initial bundle size is smaller
- Features are loaded on-demand
- Better caching strategies possible
- Faster initial page load

### Error Isolation
- Errors in one feature don't crash the entire app
- Better user experience with graceful error handling
- Easier debugging and error tracking

## Future Enhancements

### Planned Improvements
- [ ] Route-based state management (per feature)
- [ ] Feature-specific middleware
- [ ] Route-level analytics
- [ ] A/B testing at feature level
- [ ] Progressive Web App (PWA) route caching

### Integration Points
This architecture sets the foundation for:
- Feature-based state management
- Micro-frontend architecture
- Independent feature deployments
- Team-based feature ownership