/**
 * Store Address Service
 *
 * Service to fetch store pickup addresses for checkout when fulfillment method is pickup.
 * Handles both guest and registered user checkout flows.
 */

import { StoresApiService } from '../../stores/services/storesApi';
import type { StoreAddress } from '../../../shared/types/store';
import type { CartItem } from '../../../types/cart';
import type { GuestCartItem } from '../../../types/guest-cart';

export interface StorePickupInfo {
  storeId: number;
  storeName?: string;
  pickupAddresses: StoreAddress[];
  primaryPickupAddress?: StoreAddress;
}

export interface CartStoreAddresses {
  storePickupInfo: Map<number, StorePickupInfo>;
  hasPickupAddresses: boolean;
  totalStores: number;
}

export class StoreAddressService {
  /**
   * Fetch pickup addresses for all stores in the cart
   */
  static async getCartStoreAddresses(
    cartItems: CartItem[] | GuestCartItem[]
  ): Promise<CartStoreAddresses> {
    if (!cartItems || cartItems.length === 0) {
      return this.createEmptyResult();
    }

    // Get unique store IDs from cart items, filter out undefined
    const storeIds = Array.from(
      new Set(
        cartItems
          .map((item) => item.storeId)
          .filter((storeId): storeId is number => storeId !== undefined)
      )
    );

    // Fetch addresses for each store
    const storePickupInfo = new Map<number, StorePickupInfo>();
    const promises = storeIds.map(async (storeId) => {
      try {
        const addresses = await StoresApiService.getStoreAddresses(storeId);

        // Filter for pickup addresses (business, pickup)
        const pickupAddresses = addresses.filter(
          (addr) =>
            addr.isActive &&
            (addr.addressType === 'business' || addr.addressType === 'pickup')
        );

        // Find primary pickup address
        let primaryPickupAddress = pickupAddresses.find(
          (addr) => addr.isPrimary
        );

        // If no primary found, use the first business address, then first pickup address
        if (!primaryPickupAddress && pickupAddresses.length > 0) {
          primaryPickupAddress =
            pickupAddresses.find((addr) => addr.addressType === 'business') ||
            pickupAddresses.find((addr) => addr.addressType === 'pickup') ||
            pickupAddresses[0];
        }

        storePickupInfo.set(storeId, {
          storeId,
          storeName: this.getStoreNameFromCart(cartItems, storeId),
          pickupAddresses,
          primaryPickupAddress,
        });
      } catch (error) {
        console.error(
          `Failed to fetch pickup addresses for store ${storeId}:`,
          error
        );
        // Set empty info if API fails
        storePickupInfo.set(storeId, {
          storeId,
          storeName: this.getStoreNameFromCart(cartItems, storeId),
          pickupAddresses: [],
          primaryPickupAddress: undefined,
        });
      }
    });

    await Promise.all(promises);

    const hasPickupAddresses = Array.from(storePickupInfo.values()).some(
      (info) => info.pickupAddresses.length > 0
    );

    return {
      storePickupInfo,
      hasPickupAddresses,
      totalStores: storeIds.length,
    };
  }

  /**
   * Get primary pickup address for a specific store
   */
  static async getStorePrimaryPickupAddress(
    storeId: number
  ): Promise<StoreAddress | null> {
    try {
      const addresses = await StoresApiService.getStoreAddresses(storeId);

      // Filter for pickup addresses
      const pickupAddresses = addresses.filter(
        (addr) =>
          addr.isActive &&
          (addr.addressType === 'business' || addr.addressType === 'pickup')
      );

      if (pickupAddresses.length === 0) {
        return null;
      }

      // Find primary pickup address
      let primaryAddress = pickupAddresses.find((addr) => addr.isPrimary);

      // If no primary found, use the first business address, then first pickup address
      if (!primaryAddress) {
        primaryAddress =
          pickupAddresses.find((addr) => addr.addressType === 'business') ||
          pickupAddresses.find((addr) => addr.addressType === 'pickup') ||
          pickupAddresses[0];
      }

      return primaryAddress || null;
    } catch (error) {
      console.error(
        `Failed to fetch primary pickup address for store ${storeId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Format store address for display
   */
  static formatStoreAddress(address: StoreAddress): string {
    const parts = [];

    if (address.locationName) {
      parts.push(address.locationName);
    }

    parts.push(address.streetAddress);
    parts.push(`${address.city}, ${address.state} ${address.zipCode}`);

    if (address.country && address.country !== 'United States') {
      parts.push(address.country);
    }

    return parts.join('\n');
  }

  /**
   * Format store address as single line
   */
  static formatStoreAddressOneLine(address: StoreAddress): string {
    const parts = [];

    if (address.locationName) {
      parts.push(address.locationName + ' - ');
    }

    parts.push(address.streetAddress);
    parts.push(`${address.city}, ${address.state} ${address.zipCode}`);

    return parts.join(' ');
  }

  /**
   * Get pickup instructions for an address
   */
  static getPickupInstructions(address: StoreAddress): string {
    if (address.pickupInstructions) {
      return address.pickupInstructions;
    }

    // Default instructions based on address type
    switch (address.addressType) {
      case 'pickup':
        return 'Please arrive during business hours for pickup.';
      case 'business':
        return 'Pick up at main business location.';
      default:
        return 'Contact store for pickup instructions.';
    }
  }

  /**
   * Extract store name from cart items
   */
  private static getStoreNameFromCart(
    cartItems: CartItem[] | GuestCartItem[],
    storeId: number
  ): string | undefined {
    const item = cartItems.find((item) => item.storeId === storeId);
    return item && 'storeName' in item && item.storeName
      ? item.storeName
      : undefined;
  }

  /**
   * Create empty result for empty cart
   */
  private static createEmptyResult(): CartStoreAddresses {
    return {
      storePickupInfo: new Map(),
      hasPickupAddresses: false,
      totalStores: 0,
    };
  }

  /**
   * Get contact information for a store address
   */
  static getStoreContactInfo(address: StoreAddress): {
    phone?: string;
    email?: string;
  } {
    return {
      phone: address.contactPhone || undefined,
      email: address.contactEmail || undefined,
    };
  }

  /**
   * Validate if store has pickup capability
   */
  static validateStorePickupCapability(storeInfo: StorePickupInfo): {
    canPickup: boolean;
    reason?: string;
  } {
    if (storeInfo.pickupAddresses.length === 0) {
      return {
        canPickup: false,
        reason: 'Store has no pickup addresses configured',
      };
    }

    if (!storeInfo.primaryPickupAddress) {
      return {
        canPickup: false,
        reason: 'Store has no primary pickup address',
      };
    }

    return {
      canPickup: true,
    };
  }
}

export default StoreAddressService;
