// Simple test file to validate feature-based route architecture
// This file can be used to quickly verify all routes are properly configured

import { authRoutes } from './auth/routes';
import { dashboardRoutes } from './dashboard/routes';
import { storesRoutes } from './stores/routes';
import { storefrontRoutes } from './storefront/routes';
import { inventoryRoutes } from './inventory/routes';
import { searchRoutes } from './search/routes';
import { coreRoutes } from './core/routes';

// Collect all routes for validation
const allFeatureRoutes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...storesRoutes,
  ...storefrontRoutes,
  ...inventoryRoutes,
  ...searchRoutes,
  ...coreRoutes,
];

// Route validation function
export const validateRoutes = () => {
  const routePaths = allFeatureRoutes
    .map((route) => route.path)
    .filter(Boolean);
  const uniquePaths = new Set(routePaths);

  // Check for duplicates
  if (routePaths.length !== uniquePaths.size) {
    const duplicates = routePaths.filter(
      (path, index) => routePaths.indexOf(path) !== index
    );
    throw new Error(`Found duplicate route paths: ${duplicates.join(', ')}`);
  }

  // Feature breakdown - return data instead of logging

  return {
    totalRoutes: allFeatureRoutes.length,
    uniquePaths: uniquePaths.size,
    hasDuplicates: routePaths.length !== uniquePaths.size,
    features: {
      auth: authRoutes.length,
      dashboard: dashboardRoutes.length,
      stores: storesRoutes.length,
      storefront: storefrontRoutes.length,
      inventory: inventoryRoutes.length,
      search: searchRoutes.length,
      core: coreRoutes.length,
    },
    paths: Array.from(uniquePaths).sort(),
  };
};

// Auto-run validation in development
if (process.env.NODE_ENV === 'development') {
  validateRoutes();
}

export { allFeatureRoutes };
export default validateRoutes;
