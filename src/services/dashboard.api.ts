import InventoryApiService from './inventory.api';
import StorefrontApiService from './storefront.api';

export interface DashboardMetrics {
  ordersThisMonth: number;
  favoriteItems: number;
  totalTransactions: number;
  averageRating: number;
  productsListed?: number; // For store owners
  totalRevenue?: number; // For store owners
  referralCredits?: number; // For customers
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

class DashboardApiService {
  /**
   * Fetch dashboard metrics for the current user (customer)
   */
  async getUserMetrics(): Promise<DashboardMetrics> {
    try {
      console.log('🔍 DashboardAPI: Fetching customer metrics...');

      // For customers, we currently return default metrics
      // In the future, this could fetch:
      // - Orders placed by the user
      // - Favorite items
      // - Referral credits earned

      return {
        ordersThisMonth: 0, // TODO: Fetch user's orders from orders API
        favoriteItems: 0, // TODO: Implement favorites/wishlist feature
        totalTransactions: 0, // TODO: Count user's total orders
        averageRating: 0, // TODO: Average rating user has given
        referralCredits: 0, // TODO: Fetch from referrals system
      };
    } catch (error: unknown) {
      console.error('❌ DashboardAPI: Error fetching user metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Fetch store-specific metrics for store owners using real data
   */
  async getStoreMetrics(storeId: number): Promise<DashboardMetrics> {
    try {
      console.log(
        `🔍 DashboardAPI: Fetching real store metrics for storeId: ${storeId}...`
      );

      // Fetch data from multiple sources in parallel
      const [inventoryData, storefrontStats] = await Promise.allSettled([
        InventoryApiService.getInventoryItems({ storeId }),
        StorefrontApiService.getStorefrontStats(storeId),
      ]);

      // Extract products count from inventory
      let productsListed = 0;
      if (inventoryData.status === 'fulfilled') {
        const inventoryResult = inventoryData.value;

        // Check multiple sources for product count
        if (inventoryResult.pagination?.totalItems) {
          productsListed = inventoryResult.pagination.totalItems;
        } else if (Array.isArray(inventoryResult.data)) {
          productsListed = inventoryResult.data.length;
        } else {
          productsListed = 0;
        }

        console.log('📦 Products listed:', productsListed);
        console.log('📦 Inventory data structure:', {
          hasPagination: !!inventoryResult.pagination,
          totalItems: inventoryResult.pagination?.totalItems,
          dataLength: Array.isArray(inventoryResult.data)
            ? inventoryResult.data.length
            : 'not array',
        });
      } else {
        console.warn(
          '⚠️ Failed to fetch inventory data:',
          inventoryData.reason
        );
      }

      // Extract orders and revenue from storefront stats
      let ordersThisMonth = 0;
      let totalRevenue = 0;
      if (storefrontStats.status === 'fulfilled') {
        const stats = storefrontStats.value;
        ordersThisMonth = typeof stats.orders === 'number' ? stats.orders : 0;
        totalRevenue = typeof stats.revenue === 'number' ? stats.revenue : 0;

        console.log('📊 Total orders:', ordersThisMonth);
        console.log('💰 Total revenue:', totalRevenue);
        console.log('📊 Storefront stats structure:', {
          orders: stats.orders,
          revenue: stats.revenue,
          views: stats.views,
          uniqueVisitors: stats.uniqueVisitors,
        });
      } else {
        console.warn(
          '⚠️ Failed to fetch storefront stats:',
          storefrontStats.reason
        );
      }

      const metrics: DashboardMetrics = {
        ordersThisMonth,
        favoriteItems: 0, // Not applicable for store owners
        totalTransactions: ordersThisMonth, // Same as orders for store owners
        averageRating: 0, // TODO: Calculate from reviews API
        productsListed,
        totalRevenue,
      };

      console.log('✅ DashboardAPI: Real store metrics compiled:', metrics);
      console.log(
        '🎯 Summary - Products:',
        productsListed,
        'Orders:',
        ordersThisMonth,
        'Revenue: $' + totalRevenue
      );
      return metrics;
    } catch (error: unknown) {
      console.error('❌ DashboardAPI: Error fetching store metrics:', error);
      return this.getDefaultStoreMetrics();
    }
  }

  /**
   * Get default metrics for fallback scenarios
   */
  private getDefaultMetrics(): DashboardMetrics {
    return {
      ordersThisMonth: 0,
      favoriteItems: 0,
      totalTransactions: 0,
      averageRating: 0,
      productsListed: 0,
      totalRevenue: 0,
      referralCredits: 0,
    };
  }

  /**
   * Get default store metrics for fallback scenarios
   */
  private getDefaultStoreMetrics(): DashboardMetrics {
    return {
      ordersThisMonth: 0,
      favoriteItems: 0,
      totalTransactions: 0,
      averageRating: 0,
      productsListed: 0,
      totalRevenue: 0,
    };
  }
}

const dashboardApiService = new DashboardApiService();
export default dashboardApiService;
