import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const ReferralFeatureWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FeatureErrorBoundary featureName='Referral'>{children}</FeatureErrorBoundary>
);

export default ReferralFeatureWrapper;
