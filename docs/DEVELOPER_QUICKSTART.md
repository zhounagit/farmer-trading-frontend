# Developer Quick-Start Guide: Feature-Based Route Architecture

## 🚀 Quick Start

Welcome to the new feature-based route architecture! This guide will get you up to speed quickly on how to work with the new system.

## 📋 TL;DR - What Changed

**Before:** All 30+ routes lived in `App.tsx` (single point of failure)  
**After:** Routes organized in 7 feature modules with lazy loading and error boundaries

```bash
# Old way - modify App.tsx every time
src/App.tsx (30+ routes) ❌

# New way - feature-based modules
src/features/
├── auth/routes.tsx        # 6 auth routes
├── stores/routes.tsx      # 8 store routes  
├── storefront/routes.tsx  # 6 storefront routes
└── ...                    # + 4 more features
```

## 🎯 Common Tasks

### Adding a New Route to Existing Feature

**Example: Add analytics to stores feature**

1. **Find the right feature** (stores = `src/features/stores/routes.tsx`)
2. **Add lazy import:**
```typescript
const StoreAnalyticsPage = lazy(() => import('../../pages/store/StoreAnalyticsPage'));
```
3. **Add route to array:**
```typescript
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

**That's it! No changes to App.tsx or other files needed.**

### Creating a New Feature Module

**Example: Add reporting feature**

1. **Create directory:**
```bash
mkdir src/features/reporting
```

2. **Create routes file:** `src/features/reporting/routes.tsx`
```typescript
import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import FeatureErrorBoundary from '../../components/FeatureErrorBoundary';

const ReportsPage = lazy(() => import('../../pages/reports/ReportsPage'));

const ReportingFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName="Reporting">
    {children}
  </FeatureErrorBoundary>
);

export const reportingRoutes: RouteObject[] = [
  {
    path: '/reports',
    element: (
      <ReportingFeatureWrapper>
        <ReportsPage />
      </ReportingFeatureWrapper>
    ),
  },
];

export default reportingRoutes;
```

3. **Add to main router:** `src/app/router.tsx`
```typescript
import { reportingRoutes } from '../features/reporting/routes';

const router = createBrowserRouter([
  // ... existing routes
  ...reportingRoutes,
  // ...
]);
```

4. **Export from index:** `src/features/index.ts`
```typescript
export { reportingRoutes } from './reporting/routes';
```

## 🗂️ Feature Organization Guide

### Which Feature Should My Route Go In?

| Route Pattern | Feature | Examples |
|---------------|---------|----------|
| `/login`, `/register`, `/reset-*` | `auth` | Authentication flows |
| `/dashboard`, `/admin/dashboard` | `dashboard` | Main dashboards |
| `/stores/*`, `/my-stores`, `/open-shop` | `stores` | Store management |
| `/browse`, `/store/:slug`, `/shop/:slug` | `storefront` | Public storefronts |
| `/inventory/*` | `inventory` | Inventory management |
| `/search`, `/product/:id` | `search` | Search & products |
| `/`, `/how-it-works` | `core` | Landing pages |

### Protected vs Public Routes

**Protected Route (requires auth):**
```typescript
{
  path: '/my-stores',
  element: (
    <StoresFeatureWrapper>
      <ProtectedRoute>          {/* ← Add this wrapper */}
        <MyStoresPage />
      </ProtectedRoute>
    </StoresFeatureWrapper>
  ),
}
```

**Public Route:**
```typescript
{
  path: '/browse',
  element: (
    <StorefrontFeatureWrapper>
      <SimpleBrowsePage />      {/* ← No ProtectedRoute wrapper */}
    </StorefrontFeatureWrapper>
  ),
}
```

## 🔧 Development Workflow

### 1. Starting Development
```bash
npm run dev
```
The app now uses lazy loading, so routes load as you navigate to them.

### 2. Adding New Pages
```bash
# 1. Create your page component (existing pattern)
touch src/pages/store/StoreAnalyticsPage.tsx

# 2. Add to appropriate feature routes
# Edit: src/features/stores/routes.tsx
```

### 3. Testing Your Changes
- Navigate to your new route in the browser
- Check browser dev tools for lazy loading behavior
- Verify error boundary works (temporarily break your component)

## 🐛 Debugging & Troubleshooting

### Common Issues

**❌ "Cannot resolve module" Error**
```bash
Error: Cannot resolve './pages/missing/Page'
```
**✅ Solution:** Check the lazy import path is correct
```typescript
// Wrong
const Page = lazy(() => import('./pages/missing/Page'));

// Correct  
const Page = lazy(() => import('../../pages/existing/Page'));
```

**❌ "Fast refresh only works when..." Warning**
```bash
Fast refresh only works when a file only exports components
```
**✅ Solution:** This is expected for route files (they export route configs, not just components). Safe to ignore.

**❌ Route Not Loading**
```bash
Route shows 404 but path looks correct
```
**✅ Solution:** 
1. Check route is added to feature routes array
2. Verify feature routes are imported in `src/app/router.tsx`
3. Check for typos in path pattern

**❌ Error Boundary Not Catching Errors**
```bash
Component error crashes whole app instead of showing error boundary
```
**✅ Solution:** Error boundaries only catch render errors, not:
- Event handler errors
- Async errors  
- Errors in useEffect

### Development Tools

**Route Validation:**
```typescript
// In browser console or component
import { validateRoutes } from '../features/test-routes';
validateRoutes(); // Shows route statistics
```

**React Dev Tools:**
- Install browser extension
- Check component tree for lazy loading
- Use Profiler tab to monitor performance

## 📊 Performance Tips

### Bundle Analysis
```bash
# Build and analyze bundle sizes
npm run build
# Check dist/ folder for chunk sizes
```

### Optimization Patterns

**✅ Good - Lazy loading:**
```typescript
const HeavyPage = lazy(() => import('./HeavyPage'));
```

**❌ Avoid - Eager loading:**
```typescript
import HeavyPage from './HeavyPage'; // Loaded immediately
```

**✅ Good - Feature-specific imports:**
```typescript
const StoreUtils = lazy(() => import('./store/utils'));
```

**❌ Avoid - Cross-feature dependencies:**
```typescript
// Don't import auth components in stores feature
import LoginForm from '../auth/LoginForm'; // ❌
```

## 🧪 Testing Patterns

### Testing Feature Routes

```typescript
// src/features/auth/routes.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authRoutes } from './routes';

test('auth routes render login page', async () => {
  const router = createBrowserRouter(authRoutes);
  render(<RouterProvider router={router} />);
  
  // Test route loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for lazy component
  await screen.findByText(/login/i);
});
```

### Testing Error Boundaries

```typescript
test('shows error boundary when component throws', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  render(
    <FeatureErrorBoundary featureName="Test">
      <ThrowError />
    </FeatureErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## 📚 Architecture Deep Dive

### File Structure Overview
```
src/
├── features/              # Feature-based routes
│   ├── [feature]/
│   │   └── routes.tsx     # Feature route definitions
│   ├── index.ts          # Central exports
│   └── README.md         # Architecture docs
├── app/
│   └── router.tsx        # Main router configuration  
├── components/
│   └── FeatureErrorBoundary.tsx # Shared error boundary
├── pages/                # Page components (unchanged)
└── App.tsx              # Simplified app entry point
```

### Route Flow
```
1. User visits /stores/123/dashboard
2. Router matches route in stores feature
3. StoresFeatureWrapper provides error boundary  
4. ProtectedRoute checks authentication
5. StoreManagementPage lazy loads
6. Page renders with error isolation
```

### Error Handling Flow
```
1. Component throws error during render
2. FeatureErrorBoundary catches error
3. Error logged to console (can integrate monitoring)
4. User sees friendly error message with retry button
5. Other features continue working normally
```

## 🎯 Best Practices

### ✅ Do's
- **Add routes to appropriate feature modules**
- **Use lazy loading for all page components**
- **Wrap routes with feature error boundaries**
- **Follow existing naming patterns**
- **Keep features independent**

### ❌ Don'ts
- **Don't modify App.tsx for new routes**
- **Don't create direct dependencies between features**
- **Don't skip error boundaries for new features**
- **Don't mix feature concerns in single route file**
- **Don't forget to export new features from index.ts**

## 🚀 Migration from Old System

### If You Have Old Routes to Migrate

1. **Find the route** in old App.tsx
2. **Identify the feature** it belongs to
3. **Move to appropriate** feature routes file
4. **Add lazy loading** and error boundary
5. **Test the migration**

### Example Migration

**Before (App.tsx):**
```typescript
<Route path="/my-profile" element={<ProfilePage />} />
```

**After (features/user/routes.tsx):**
```typescript
const ProfilePage = lazy(() => import('../../pages/user/ProfilePage'));

{
  path: '/my-profile',
  element: (
    <UserFeatureWrapper>
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    </UserFeatureWrapper>
  ),
}
```

## 🆘 Getting Help

### Quick Reference
- **📖 Full Documentation:** `src/features/README.md`
- **🔄 Migration Guide:** `docs/ROUTE_MIGRATION_GUIDE.md`
- **✅ Implementation Summary:** `docs/PHASE_1_IMPLEMENTATION_SUMMARY.md`

### Common Commands
```bash
# Find all route files
find src/features -name "routes.tsx"

# Check route validation
npm run dev # Then check browser console

# Build to check for errors
npm run build
```

### When to Ask for Help
- Creating your first new feature module
- Complex route patterns or authentication flows
- Performance issues with lazy loading
- Error boundary integration questions

---

**Happy coding with the new feature-based architecture! 🎉**

*This architecture scales with your team and features - enjoy the improved developer experience!*