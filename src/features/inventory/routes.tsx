import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load the entire protected route to avoid early evaluation
const ProtectedInventoryRoute = lazy(async () => {
  const { default: InventoryFeatureWrapper } = await import(
    './components/InventoryFeatureWrapper'
  );
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: SimpleInventoryPage } = await import(
    './components/SimpleInventoryPage'
  );

  return {
    default: () => (
      <InventoryFeatureWrapper>
        <ProtectedRoute>
          <SimpleInventoryPage />
        </ProtectedRoute>
      </InventoryFeatureWrapper>
    ),
  };
});

export const inventoryRoutes: RouteObject[] = [
  {
    path: '/inventory/:storeId',
    element: <ProtectedInventoryRoute />,
  },
];

export default inventoryRoutes;
