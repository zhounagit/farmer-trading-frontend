import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const AuthFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName='Authentication'>
    {children}
  </FeatureErrorBoundary>
);

export default AuthFeatureWrapper;
