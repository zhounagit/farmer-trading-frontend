import React from 'react';
import { StoreProvider } from '../contexts/StoreContext';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const StoresFeatureWrapper = ({ children }: { children: React.ReactNode }) => (
  <FeatureErrorBoundary featureName='Stores'>
    <StoreProvider>{children}</StoreProvider>
  </FeatureErrorBoundary>
);

export default StoresFeatureWrapper;
