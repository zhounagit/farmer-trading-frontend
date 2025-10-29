import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const DashboardFeatureWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FeatureErrorBoundary featureName='Dashboard'>
    {children}
  </FeatureErrorBoundary>
);

export default DashboardFeatureWrapper;
