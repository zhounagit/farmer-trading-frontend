/**
 * Guest Cart Types
 *
 * Defines types for guest cart functionality that works without authentication.
 * Guest carts are stored in localStorage and can be merged with user carts after login.
 */

export interface GuestCart {
  sessionId: string;
  items: GuestCartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GuestCartItem {
  itemId: number;
  quantity: number;
  addedAt: string;
  // Basic product info for display (fetched when adding to cart)
  productName?: string;
  productPrice?: number;
  productImageUrl?: string;
  storeId?: number;
  storeName?: string;
  availableQuantity?: number;
}

export interface GuestCartOperationResult {
  success: boolean;
  message?: string;
  cart?: GuestCart;
  error?: string;
}

// Guest cart storage keys
export const GUEST_CART_STORAGE_KEY = 'guest-cart';
export const GUEST_SESSION_ID_KEY = 'guest-session-id';

// Guest cart configuration
export const GUEST_CART_CONFIG = {
  maxItems: 50,
  maxQuantityPerItem: 10,
  expirationDays: 7,
} as const;
