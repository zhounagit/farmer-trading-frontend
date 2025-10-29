import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load the entire protected routes to avoid early evaluation
const ProtectedUserDashboard = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@/components/auth/ProtectedRoute'
  );
  const { default: DashboardFeatureWrapper } = await import(
    './components/DashboardFeatureWrapper'
  );
  const { default: UserDashboard } = await import('./components/UserDashboard');

  return {
    default: () => (
      <ProtectedRoute>
        <DashboardFeatureWrapper>
          <UserDashboard />
        </DashboardFeatureWrapper>
      </ProtectedRoute>
    ),
  };
});

const ProtectedAdminDashboard = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@/components/auth/ProtectedRoute'
  );
  const { default: DashboardFeatureWrapper } = await import(
    './components/DashboardFeatureWrapper'
  );
  const { default: AdminDashboard } = await import(
    './components/AdminDashboard'
  );

  return {
    default: () => (
      <ProtectedRoute>
        <DashboardFeatureWrapper>
          <AdminDashboard />
        </DashboardFeatureWrapper>
      </ProtectedRoute>
    ),
  };
});

export const dashboardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <ProtectedUserDashboard />,
  },
  {
    path: '/admin/dashboard',
    element: <ProtectedAdminDashboard />,
  },
];

export default dashboardRoutes;
