import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';

// Lazy load the entire protected route to avoid early evaluation
const ProtectedReferralRoute = lazy(async () => {
  const { default: ReferralFeatureWrapper } = await import(
    './components/ReferralFeatureWrapper'
  );
  const { default: ProtectedRoute } = await import(
    '@components/auth/ProtectedRoute'
  );
  const { default: ReferralProgramPage } = await import(
    './components/ReferralProgramPage'
  );

  return {
    default: () => (
      <ReferralFeatureWrapper>
        <ProtectedRoute>
          <ReferralProgramPage />
        </ProtectedRoute>
      </ReferralFeatureWrapper>
    ),
  };
});

export const referralRoutes: RouteObject[] = [
  {
    path: '/referral-program',
    element: <ProtectedReferralRoute />,
  },
];

export default referralRoutes;
