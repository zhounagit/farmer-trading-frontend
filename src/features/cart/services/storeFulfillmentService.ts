/**
 * Store Fulfillment Service
 *
 * Service to fetch store selling methods and determine available fulfillment options
 * for stores in a shopping cart.
 */

import { StoresApiService } from '../../stores/services/storesApi';
import type { CartItem } from '../../../types/cart';
import type { GuestCartItem } from '../../../types/guest-cart';

export interface StoreFulfillmentInfo {
  storeId: number;
  storeName?: string;
  sellingMethods: string[];
  supportsPickup: boolean;
  supportsDelivery: boolean;
}

export interface CartFulfillmentAnalysis {
  storeFulfillmentInfo: Map<number, StoreFulfillmentInfo>;
  allStoresSupportPickup: boolean;
  allStoresSupportDelivery: boolean;
  anyStoreSupportsPickup: boolean;
  anyStoreSupportsDelivery: boolean;
  commonFulfillmentMethods: string[];
  requiresSeparateCheckout: boolean;
}

export class StoreFulfillmentService {
  /**
   * Analyze fulfillment options for stores in a cart
   */
  static async analyzeCartFulfillment(
    cartItems: CartItem[] | GuestCartItem[]
  ): Promise<CartFulfillmentAnalysis> {
    if (!cartItems || cartItems.length === 0) {
      return this.createEmptyAnalysis();
    }

    // Get unique store IDs from cart items, filter out undefined
    const storeIds = Array.from(
      new Set(
        cartItems
          .map((item) => item.storeId)
          .filter((storeId): storeId is number => storeId !== undefined)
      )
    );

    // Fetch selling methods for each store
    const storeFulfillmentInfo = new Map<number, StoreFulfillmentInfo>();
    const promises = storeIds.map(async (storeId) => {
      try {
        const sellingMethods =
          await StoresApiService.getStoreSellingMethods(storeId);

        storeFulfillmentInfo.set(storeId, {
          storeId,
          sellingMethods,
          supportsPickup: sellingMethods.includes('pickup'),
          supportsDelivery: sellingMethods.includes('delivery'),
        });
      } catch (error) {
        console.error(
          `Failed to fetch selling methods for store ${storeId}:`,
          error
        );
        // If API fails, we cannot determine store capabilities
        // Set to empty array to indicate we don't know what methods are supported
        storeFulfillmentInfo.set(storeId, {
          storeId,
          sellingMethods: [], // Empty array indicates unknown capabilities
          supportsPickup: false, // Assume false for safety
          supportsDelivery: false, // Assume false for safety
        });
      }
    });

    await Promise.all(promises);

    // Analyze the results
    const storeInfos = Array.from(storeFulfillmentInfo.values());

    const allStoresSupportPickup = storeInfos.every(
      (info) => info.supportsPickup
    );
    const allStoresSupportDelivery = storeInfos.every(
      (info) => info.supportsDelivery
    );
    const anyStoreSupportsPickup = storeInfos.some(
      (info) => info.supportsPickup
    );
    const anyStoreSupportsDelivery = storeInfos.some(
      (info) => info.supportsDelivery
    );

    // Determine common fulfillment methods across all stores
    const commonFulfillmentMethods: string[] = [];

    // Only include methods if we have valid data for all stores
    const hasValidDataForAllStores = storeInfos.every(
      (info) => info.sellingMethods.length > 0
    );

    if (hasValidDataForAllStores) {
      if (allStoresSupportPickup) commonFulfillmentMethods.push('pickup');
      if (allStoresSupportDelivery) commonFulfillmentMethods.push('delivery');
    } else {
      // If we don't have valid data for all stores, we can't determine common methods
      console.warn(
        'Cannot determine common fulfillment methods: missing store capability data'
      );
    }

    // Check if stores have different fulfillment capabilities (requires separate checkout)
    // Only check if we have valid data for all stores
    let requiresSeparateCheckout = false;
    if (
      storeInfos.length > 1 &&
      storeInfos.every((info) => info.sellingMethods.length > 0)
    ) {
      requiresSeparateCheckout =
        !(allStoresSupportPickup && allStoresSupportDelivery) &&
        (anyStoreSupportsPickup !== allStoresSupportPickup ||
          anyStoreSupportsDelivery !== allStoresSupportDelivery);
    }

    return {
      storeFulfillmentInfo,
      allStoresSupportPickup,
      allStoresSupportDelivery,
      anyStoreSupportsPickup,
      anyStoreSupportsDelivery,
      commonFulfillmentMethods,
      requiresSeparateCheckout,
    };
  }

  /**
   * Get recommended fulfillment method based on store capabilities
   */
  static getRecommendedFulfillmentMethod(
    analysis: CartFulfillmentAnalysis
  ): string | null {
    if (analysis.commonFulfillmentMethods.length === 0) {
      return null;
    }

    // Prefer delivery if available, otherwise pickup
    if (analysis.commonFulfillmentMethods.includes('delivery')) {
      return 'delivery';
    }
    if (analysis.commonFulfillmentMethods.includes('pickup')) {
      return 'pickup';
    }

    return null;
  }

  /**
   * Validate if a fulfillment method is valid for all stores in cart
   */
  static validateFulfillmentMethod(
    analysis: CartFulfillmentAnalysis,
    fulfillmentMethod: string
  ): { isValid: boolean; invalidStoreIds: number[] } {
    const invalidStoreIds: number[] = [];

    for (const [storeId, info] of analysis.storeFulfillmentInfo) {
      if (fulfillmentMethod === 'delivery' && !info.supportsDelivery) {
        invalidStoreIds.push(storeId);
      } else if (fulfillmentMethod === 'pickup' && !info.supportsPickup) {
        invalidStoreIds.push(storeId);
      }
    }

    return {
      isValid: invalidStoreIds.length === 0,
      invalidStoreIds,
    };
  }

  /**
   * Create empty analysis for empty cart
   */
  static createEmptyAnalysis(): CartFulfillmentAnalysis {
    return {
      storeFulfillmentInfo: new Map(),
      allStoresSupportPickup: false,
      allStoresSupportDelivery: false,
      anyStoreSupportsPickup: false,
      anyStoreSupportsDelivery: false,
      commonFulfillmentMethods: [],
      requiresSeparateCheckout: false,
    };
  }

  /**
   * Get store names for display (optional enhancement)
   */
  static async getStoreNames(storeIds: number[]): Promise<Map<number, string>> {
    const storeNames = new Map<number, string>();
    const promises = storeIds.map(async (storeId) => {
      try {
        // Note: This would require a new API endpoint or using existing store info
        // For now, we'll return placeholder names
        storeNames.set(storeId, `Store #${storeId}`);
      } catch (error) {
        console.error(`Failed to fetch store name for ${storeId}:`, error);
        storeNames.set(storeId, `Store #${storeId}`);
      }
    });

    await Promise.all(promises);
    return storeNames;
  }
}

export default StoreFulfillmentService;
