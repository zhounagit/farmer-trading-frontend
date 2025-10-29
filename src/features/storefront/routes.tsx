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
const LiveStorefrontPage = lazy(
  () => import('./components/LiveStorefrontPage')
);
const PublishedStorePage = lazy(
  () => import('./components/SimplePublishedStorePage')
);
const SimpleBrowsePage = lazy(() => import('./components/SimpleBrowsePage'));
const StorefrontTestPage = lazy(
  () => import('./components/StorefrontTestPage')
);

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
  {
    path: '/store/:slug/live',
    element: (
      <StorefrontFeatureWrapper>
        <LiveStorefrontPage />
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
  {
    path: '/storefront-demo',
    element: (
      <StorefrontFeatureWrapper>
        <StorefrontTestPage />
      </StorefrontFeatureWrapper>
    ),
  },
];

export default storefrontRoutes;
