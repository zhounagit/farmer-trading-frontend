import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const CoreFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName='Core'>{children}</FeatureErrorBoundary>
);

export default CoreFeatureWrapper;
