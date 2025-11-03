import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import StorefrontFeatureWrapper from './components/StorefrontFeatureWrapper';

// Lazy load the entire protected route to avoid early evaluation
const ProtectedStorefrontCustomization = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: StorefrontCustomizationPage } = await import(
    './components/StorefrontCustomizationPage'
  );

  return {
    default: () => (
      <ProtectedRoute>
        <StorefrontCustomizationPage />
      </ProtectedRoute>
    ),
  };
});

// Lazy load storefront components from local feature directory

const PublishedStorePage = lazy(
  () => import('./components/PublishedStorePage')
);
const SimpleBrowsePage = lazy(() => import('./components/SimpleBrowsePage'));

export const storefrontRoutes: RouteObject[] = [
  // Public storefront routes
  {
    path: '/browse',
    element: (
      <StorefrontFeatureWrapper>
        <SimpleBrowsePage />
      </StorefrontFeatureWrapper>
    ),
  },
  {
    path: '/store/:slug',
    element: (
      <StorefrontFeatureWrapper>
        <PublishedStorePage />
      </StorefrontFeatureWrapper>
    ),
  },
  {
    path: '/shop/:slug',
    element: (
      <StorefrontFeatureWrapper>
        <PublishedStorePage />
      </StorefrontFeatureWrapper>
    ),
  },

  // Protected storefront customization
  {
    path: '/stores/:storeId/customize',
    element: (
      <StorefrontFeatureWrapper>
        <ProtectedStorefrontCustomization />
      </StorefrontFeatureWrapper>
    ),
  },
  // Test and demo page
];

export default storefrontRoutes;
