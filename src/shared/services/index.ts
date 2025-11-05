// Consolidated API Services - Single Entry Point

export { apiClient } from './apiClient';
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  AxiosRequestConfig,
  AxiosResponse,
} from './apiClient';

// Feature-based API Services
export { AuthApiService } from '../../features/auth/services/authApi';
export { StoresApiService } from '../../features/stores/services/storesApi';
export { InventoryApiService } from '../../features/inventory/services/inventoryApi';
export { StorefrontApiService } from '../../features/storefront/services/storefrontApi';
export { PartnershipsApiService } from '../../features/partnerships/services/partnershipsApi';
export { default as DashboardApiService } from '../../features/dashboard/services/dashboardApi';
export { CategoryApiService } from '../../features/search/services/categoryApi';
export { UserApiService } from '../../features/account-settings/services/userApiService';

// Default exports for backwards compatibility
export { AuthApiService as AuthApi } from '../../features/auth/services/authApi';
export { StoresApiService as StoresApi } from '../../features/stores/services/storesApi';
export { InventoryApiService as InventoryApi } from '../../features/inventory/services/inventoryApi';
export { StorefrontApiService as StorefrontApi } from '../../features/storefront/services/storefrontApi';
export { PartnershipsApiService as PartnershipsApi } from '../../features/partnerships/services/partnershipsApi';
export { default as DashboardApi } from '../../features/dashboard/services/dashboardApi';
export { CategoryApiService as CategoryApi } from '../../features/search/services/categoryApi';
export { UserApiService as UserApi } from '../../features/account-settings/services/userApiService';

// Utility functions
export const createApiInstance = () => {
  // Import the apiClient locally to avoid circular dependency issues
  const { apiClient: client } = require('./apiClient');
  return client;
};

export const getApiHealth = async () => {
  // Import the apiClient locally to avoid circular dependency issues
  const { apiClient: client } = require('./apiClient');
  return await client.healthCheck();
};
