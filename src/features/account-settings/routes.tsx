import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load the entire protected route to avoid early evaluation
const ProtectedAccountSettings = lazy(async () => {
  const { default: ProtectedRoute } = await import(
    '@/components/auth/ProtectedRoute'
  );
  const { default: AccountSettingsPage } = await import(
    './components/AccountSettingsPage'
  );

  return {
    default: () => (
      <ProtectedRoute>
        <AccountSettingsPage />
      </ProtectedRoute>
    ),
  };
});

export const accountSettingsRoutes: RouteObject[] = [
  {
    path: '/account-settings',
    element: <ProtectedAccountSettings />,
  },
];

export default accountSettingsRoutes;
