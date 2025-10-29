import React from 'react';
import FeatureErrorBoundary from '@components/common/FeatureErrorBoundary';

const InventoryFeatureWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <FeatureErrorBoundary featureName='Inventory'>
    {children}
  </FeatureErrorBoundary>
);

export default InventoryFeatureWrapper;
