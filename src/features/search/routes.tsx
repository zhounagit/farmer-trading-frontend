import { lazy } from 'react';
import { type RouteObject, Navigate } from 'react-router-dom';
import SearchFeatureWrapper from './components/SearchFeatureWrapper';

// Lazy load search components from local feature directory
const ProductSearchPage = lazy(() => import('./components/ProductSearchPage'));
const UnifiedSearchPage = lazy(() => import('./components/UnifiedSearchPage'));
const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));

export const searchRoutes: RouteObject[] = [
  {
    path: '/search',
    element: (
      <SearchFeatureWrapper>
        <ProductSearchPage />
      </SearchFeatureWrapper>
    ),
  },
  {
    path: '/unified-search',
    element: (
      <SearchFeatureWrapper>
        <UnifiedSearchPage />
      </SearchFeatureWrapper>
    ),
  },
  {
    path: '/product/:itemId',
    element: (
      <SearchFeatureWrapper>
        <ProductDetailPage />
      </SearchFeatureWrapper>
    ),
  },
  // Redirect /products to /unified-search for backward compatibility
  {
    path: '/products',
    element: <Navigate to='/unified-search' replace />,
  },
];

export default searchRoutes;
