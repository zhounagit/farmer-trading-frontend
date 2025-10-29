import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const StorefrontFeatureWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FeatureErrorBoundary featureName='Storefront'>
    {children}
  </FeatureErrorBoundary>
);

export default StorefrontFeatureWrapper;
