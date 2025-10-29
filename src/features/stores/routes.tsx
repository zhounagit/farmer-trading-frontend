import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import StoresFeatureWrapper from './components/StoresFeatureWrapper';

// Lazy load admin components
const StoreApplicationsList = lazy(
  () => import('./components/StoreApplicationsList')
);
const StoreApplicationReview = lazy(
  () => import('./components/StoreApplicationReview')
);

// Lazy load the entire protected routes to avoid early evaluation
const ProtectedOpenShop = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: OpenShopPage } = await import('./components/OpenShopPage');

  return {
    default: () => (
      <ProtectedRoute>
        <OpenShopPage />
      </ProtectedRoute>
    ),
  };
});

const ProtectedMyStores = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: MyStoresPage } = await import('./components/MyStoresPage');

  return {
    default: () => (
      <ProtectedRoute>
        <MyStoresPage />
      </ProtectedRoute>
    ),
  };
});

const ProtectedStoreManagement = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: StoreManagementPage } = await import(
    './components/StoreManagementPage'
  );

  return {
    default: () => (
      <ProtectedRoute>
        <StoreManagementPage />
      </ProtectedRoute>
    ),
  };
});

export const storesRoutes: RouteObject[] = [
  {
    path: '/open-shop',
    element: (
      <StoresFeatureWrapper>
        <ProtectedOpenShop />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/my-stores',
    element: (
      <StoresFeatureWrapper>
        <ProtectedMyStores />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/stores/:storeId/dashboard',
    element: (
      <StoresFeatureWrapper>
        <ProtectedStoreManagement />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/stores/:storeId/products',
    element: (
      <StoresFeatureWrapper>
        <ProtectedStoreManagement />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/stores/:storeId/edit',
    element: (
      <StoresFeatureWrapper>
        <ProtectedStoreManagement />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/stores/:storeId/settings',
    element: (
      <StoresFeatureWrapper>
        <ProtectedStoreManagement />
      </StoresFeatureWrapper>
    ),
  },
  // Admin store application routes
  {
    path: '/admin/store-applications',
    element: (
      <StoresFeatureWrapper>
        <StoreApplicationsList />
      </StoresFeatureWrapper>
    ),
  },
  {
    path: '/admin/store-applications/:submissionId',
    element: (
      <StoresFeatureWrapper>
        <StoreApplicationReview />
      </StoresFeatureWrapper>
    ),
  },
];

export default storesRoutes;
