import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const SearchFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName='Search'>{children}</FeatureErrorBoundary>
);

export default SearchFeatureWrapper;
