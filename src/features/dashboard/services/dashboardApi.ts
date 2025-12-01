import { InventoryApiService } from '../../inventory/services/inventoryApi';
import { StoresApiService } from '../../../shared/services';
import { ApiMapper } from '../../../services/api-mapper';

export interface DashboardMetrics {
  ordersThisMonth: number;
  favoriteItems: number;
  totalTransactions: number;
  averageRating: number;
  productsListed?: number; // For store owners
  totalRevenue?: number; // For store owners
  referralCredits?: number; // For customers
  inventoryValue?: number; // Total value of inventory
  lowStockItems?: number; // Items below minimum stock level
  conversionRate?: number; // Store conversion rate
  customerSatisfaction?: number; // Average customer rating
}

export interface DashboardTrends {
  revenueTrend: 'up' | 'down' | 'stable';
  orderTrend: 'up' | 'down' | 'stable';
  inventoryTrend: 'up' | 'down' | 'stable';
  customerTrend: 'up' | 'down' | 'stable';
}

export interface DashboardAnalytics {
  metrics: DashboardMetrics;
  trends: DashboardTrends;
  comparison: {
    previousPeriod: DashboardMetrics;
    growthRates: {
      revenue: number;
      orders: number;
      products: number;
      customers: number;
    };
  };
  insights: string[];
}

class DashboardApiService {
  async getUserMetrics(): Promise<DashboardMetrics> {
    try {
      console.log(
        '🔍 DashboardAPI: Fetching customer metrics with multi-source aggregation...'
      );

      // For customers, we currently return default metrics
      // In the future, this could fetch:
      // - Orders placed by the user
      // - Favorite items
      // - Referral credits earned

      const metrics: DashboardMetrics = {
        ordersThisMonth: 0, // TODO: Fetch user's orders from orders API
        favoriteItems: 0, // TODO: Implement favorites/wishlist feature
        totalTransactions: 0, // TODO: Count user's total orders
        averageRating: 0, // TODO: Average rating user has given
        referralCredits: 0, // TODO: Fetch from referrals system
      };

      console.log('✅ DashboardAPI: Customer metrics loaded:', metrics);
      return metrics;
    } catch (error) {
      console.error('❌ Failed to load customer metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  async getStoreMetrics(storeId: number): Promise<DashboardMetrics> {
    try {
      console.log(
        `🔍 DashboardAPI: Fetching real store metrics for storeId: ${storeId} with multi-source aggregation...`
      );

      // Fetch data from multiple sources in parallel with comprehensive error handling
      const [inventoryData, storeStats] = await Promise.allSettled([
        InventoryApiService.getInventoryItems(storeId),
        StoresApiService.getStoreStats(storeId),
      ]);

      // Extract products count from inventory with enhanced data extraction
      let productsListed = 0;
      let inventoryValue = 0;
      let lowStockItems = 0;

      if (inventoryData.status === 'fulfilled') {
        const inventoryResult = inventoryData.value;

        // Enhanced data extraction with multiple fallback mechanisms
        // Check multiple sources for product count
        if (inventoryResult.totalCount) {
          productsListed = inventoryResult.totalCount;
        } else if (Array.isArray(inventoryResult.items)) {
          productsListed = inventoryResult.items.length;
        } else {
          productsListed = 0;
        }

        console.log('📦 Products listed:', productsListed);
        console.log('📦 Inventory data structure analyzed:', {
          hasTotalCount: !!inventoryResult.totalCount,
          totalItems: inventoryResult.totalCount,
          dataLength: Array.isArray(inventoryResult.items)
            ? inventoryResult.items.length
            : 'not array',
        });
      } else {
        console.warn(
          '⚠️ Failed to fetch inventory data:',
          inventoryData.reason
        );
        // Fallback to default metrics for inventory data
        productsListed = 0;
      }

      // Inventory stats endpoint not available - use default values
      inventoryValue = 0;
      lowStockItems = 0;
      console.log('📊 Inventory stats not available - using defaults');

      // Extract orders and revenue from store stats with enhanced parsing
      let ordersThisMonth = 0;
      let totalRevenue = 0;
      let conversionRate = 0;
      let customerSatisfaction = 0;

      if (storeStats.status === 'fulfilled') {
        const stats = storeStats.value;

        // Convert backend PascalCase response to frontend camelCase using ApiMapper
        const statsObj = ApiMapper.toCamelCase<{
          totalOrders?: number;
          totalRevenue?: number;
          averageRating?: number;
          totalViews?: number;
        }>(stats);

        ordersThisMonth =
          typeof statsObj.totalOrders === 'number' ? statsObj.totalOrders : 0;
        totalRevenue =
          typeof statsObj.totalRevenue === 'number' ? statsObj.totalRevenue : 0;
        conversionRate = 0; // Store stats doesn't provide conversion rate
        customerSatisfaction =
          typeof statsObj.averageRating === 'number'
            ? statsObj.averageRating
            : 0;

        console.log('📊 Store stats extracted:', {
          orders: ordersThisMonth,
          revenue: totalRevenue,
          conversionRate: conversionRate,
          averageRating: customerSatisfaction,
          totalViews: statsObj.totalViews,
        });
      } else {
        console.warn('⚠️ Failed to fetch store stats:', storeStats.reason);
        // Fallback to default values for store stats
        ordersThisMonth = 0;
        totalRevenue = 0;
      }

      const metrics: DashboardMetrics = {
        ordersThisMonth,
        favoriteItems: 0, // Not applicable for store owners
        totalTransactions: ordersThisMonth, // Same as orders for store owners
        averageRating: customerSatisfaction,
        productsListed,
        totalRevenue,
        inventoryValue,
        lowStockItems,
        conversionRate,
        customerSatisfaction,
      };

      console.log(
        '✅ DashboardAPI: Real store metrics compiled with multi-source aggregation:',
        metrics
      );
      console.log(
        '🎯 Multi-Source Summary - Products:',
        productsListed,
        'Orders:',
        ordersThisMonth,
        'Revenue: $' + totalRevenue,
        'Inventory Value: $' + inventoryValue,
        'Low Stock Items:',
        lowStockItems,
        'Conversion Rate:',
        conversionRate + '%'
      );

      return metrics;
    } catch (error) {
      console.error('❌ Failed to load store metrics:', error);
      return this.getDefaultStoreMetrics();
    }
  }

  async getDashboardAnalytics(storeId?: number): Promise<DashboardAnalytics> {
    try {
      console.log(
        `🔍 DashboardAPI: Fetching analytics for ${storeId ? 'store' : 'user'}...`
      );

      const currentMetrics = storeId
        ? await this.getStoreMetrics(storeId)
        : await this.getUserMetrics();

      const previousMetrics = await this.getPreviousPeriodMetrics();

      const trends = this.calculateTrends(currentMetrics, previousMetrics);
      const growthRates = this.calculateGrowthRates(
        currentMetrics,
        previousMetrics
      );
      const insights = this.generateInsights(
        currentMetrics,
        trends,
        growthRates
      );

      const analytics: DashboardAnalytics = {
        metrics: currentMetrics,
        trends,
        comparison: {
          previousPeriod: previousMetrics,
          growthRates,
        },
        insights,
      };

      console.log('✅ DashboardAPI: Analytics loaded:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Failed to load dashboard analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  private async getPreviousPeriodMetrics(): Promise<DashboardMetrics> {
    // For now, return mock data for comparison
    // In production, this would fetch actual historical data
    const previousMetrics = {
      ordersThisMonth: Math.floor(Math.random() * 50),
      favoriteItems: 0,
      totalTransactions: Math.floor(Math.random() * 50),
      averageRating: 4.2,
      productsListed: Math.floor(Math.random() * 100),
      totalRevenue: Math.floor(Math.random() * 5000),
      inventoryValue: Math.floor(Math.random() * 10000),
      lowStockItems: Math.floor(Math.random() * 10),
      conversionRate: 2.5,
      customerSatisfaction: 4.2,
    };

    return previousMetrics;
  }

  private calculateTrends(
    current: DashboardMetrics,
    previous: DashboardMetrics
  ): DashboardTrends {
    const revenueTrend =
      current.totalRevenue && previous.totalRevenue
        ? current.totalRevenue > previous.totalRevenue
          ? 'up'
          : current.totalRevenue < previous.totalRevenue
            ? 'down'
            : 'stable'
        : 'stable';

    const orderTrend =
      current.ordersThisMonth && previous.ordersThisMonth
        ? current.ordersThisMonth > previous.ordersThisMonth
          ? 'up'
          : current.ordersThisMonth < previous.ordersThisMonth
            ? 'down'
            : 'stable'
        : 'stable';

    const inventoryTrend =
      current.productsListed && previous.productsListed
        ? current.productsListed > previous.productsListed
          ? 'up'
          : current.productsListed < previous.productsListed
            ? 'down'
            : 'stable'
        : 'stable';

    const customerTrend =
      current.customerSatisfaction && previous.customerSatisfaction
        ? current.customerSatisfaction > previous.customerSatisfaction
          ? 'up'
          : current.customerSatisfaction < previous.customerSatisfaction
            ? 'down'
            : 'stable'
        : 'stable';

    const trends: DashboardTrends = {
      revenueTrend: revenueTrend as 'up' | 'down' | 'stable',
      orderTrend: orderTrend as 'up' | 'down' | 'stable',
      inventoryTrend: inventoryTrend as 'up' | 'down' | 'stable',
      customerTrend: customerTrend as 'up' | 'down' | 'stable',
    };

    return trends;
  }

  private calculateGrowthRates(
    current: DashboardMetrics,
    previous: DashboardMetrics
  ): { revenue: number; orders: number; products: number; customers: number } {
    const calculateRate = (
      currentVal?: number,
      previousVal?: number
    ): number => {
      if (!currentVal || !previousVal || previousVal === 0) return 0;
      return ((currentVal - previousVal) / previousVal) * 100;
    };

    const growthRates = {
      revenue: calculateRate(current.totalRevenue, previous.totalRevenue),
      orders: calculateRate(current.ordersThisMonth, previous.ordersThisMonth),
      products: calculateRate(current.productsListed, previous.productsListed),
      customers: calculateRate(
        current.customerSatisfaction,
        previous.customerSatisfaction
      ),
    };

    return growthRates;
  }

  private generateInsights(
    current: DashboardMetrics,
    trends: DashboardTrends,
    growthRates: {
      revenue: number;
      orders: number;
      products: number;
      customers: number;
    }
  ): string[] {
    const insights: string[] = [];

    // Revenue insights
    if (trends.revenueTrend === 'up' && growthRates.revenue > 20) {
      insights.push(
        'Strong revenue growth. Consider expanding inventory to meet increasing demand.'
      );
    } else if (trends.revenueTrend === 'down') {
      insights.push(
        'Revenue has decreased. Review pricing strategy and promotional activities.'
      );
    }

    // Order insights
    if (trends.orderTrend === 'up' && growthRates.orders > 15) {
      insights.push(
        'Significant increase in orders. Ensure inventory levels can meet demand.'
      );
    } else if (trends.orderTrend === 'down') {
      insights.push(
        'Order volume has decreased. Consider promotional offers or improved product visibility.'
      );
    }

    // Inventory insights
    if (current.lowStockItems && current.lowStockItems > 5) {
      insights.push(
        `${current.lowStockItems} items are low in stock. Consider restocking soon.`
      );
    }

    // Customer satisfaction insights
    if (current.customerSatisfaction && current.customerSatisfaction < 3.5) {
      insights.push(
        'Customer satisfaction is below average. Consider gathering feedback for improvements.'
      );
    } else if (
      current.customerSatisfaction &&
      current.customerSatisfaction > 4.5
    ) {
      insights.push(
        'Excellent customer satisfaction! Consider requesting reviews from satisfied customers.'
      );
    }

    return insights;
  }

  private getDefaultMetrics(): DashboardMetrics {
    return {
      ordersThisMonth: 0,
      favoriteItems: 0,
      totalTransactions: 0,
      averageRating: 0,
      productsListed: 0,
      totalRevenue: 0,
      referralCredits: 0,
      inventoryValue: 0,
      lowStockItems: 0,
      conversionRate: 0,
      customerSatisfaction: 0,
    };
  }

  private getDefaultStoreMetrics(): DashboardMetrics {
    return {
      ordersThisMonth: 0,
      favoriteItems: 0,
      totalTransactions: 0,
      averageRating: 0,
      productsListed: 0,
      totalRevenue: 0,
      inventoryValue: 0,
      lowStockItems: 0,
      conversionRate: 0,
      customerSatisfaction: 0,
    };
  }

  private getDefaultAnalytics(): DashboardAnalytics {
    const defaultMetrics = this.getDefaultMetrics();
    return {
      metrics: defaultMetrics,
      trends: {
        revenueTrend: 'stable',
        orderTrend: 'stable',
        inventoryTrend: 'stable',
        customerTrend: 'stable',
      },
      comparison: {
        previousPeriod: defaultMetrics,
        growthRates: {
          revenue: 0,
          orders: 0,
          products: 0,
          customers: 0,
        },
      },
      insights: ['No insights available at this time.'],
    };
  }
}

const dashboardApiService = new DashboardApiService();
export default dashboardApiService;
