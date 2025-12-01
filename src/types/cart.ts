/**
 * Cart Management Types
 *
 * Frontend interfaces using camelCase naming convention.
 * These types will be mapped to/from backend PascalCase using ApiMapper.
 */

import type { GuestCart } from './guest-cart';

import type { ApiResponse } from './api.types';

// Cart-related types
export interface Cart {
  cartId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  selectedFulfillment?: string;
  isEmpty: boolean;
  itemCount: number;
  total: number;
  totalDiscount: number;
  subtotal: number;
  hasSelectedFulfillment: boolean;
  cartItems: CartItem[];
}

export interface CartItem {
  cartItemId: number;
  cartId: number;
  itemId: number;
  quantity: number;
  addedAt: string;

  // Computed properties from backend
  itemPrice: number;
  itemName: string;
  itemSku: string;
  itemImageUrl?: string;
  storeId: number;
  originalPrice?: number;
  discountAmount: number;
  isActive: boolean;
  inStock: boolean;
  availableQuantity: number;
  lineTotal: number;
  effectivePrice: number;
  lineTotalWithDiscount: number;
  hasDiscount: boolean;
  totalSavings: number;
  discountPercentage: number;
  isQuantityAvailable: boolean;
  needsQuantityAdjustment: boolean;
  isOutOfStock: boolean;
  statusDisplay: string;
}

// Request types
export interface AddToCartRequest {
  itemId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// API Response types
export type CartResponse = ApiResponse<Cart>;
export type CartItemResponse = ApiResponse<CartItem>;
export type CartValidationResponse = ApiResponse<boolean>;
export type CartCountResponse = ApiResponse<number>;

// Store grouping for cart items
export interface StoreCartGroup {
  storeId: number;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Cart operation results
export interface CartOperationResult {
  success: boolean;
  message?: string;
  cart?: Cart;
  error?: string;
}

// Cart validation errors
export interface CartValidationError {
  field: string;
  message: string;
  code?: string;
}

// Cart state for UI
export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Hook return types
export interface UseCartReturn {
  cart: Cart | null;
  guestCart: GuestCart | null;
  isLoading: boolean;
  error: string | null;
  addItem: (
    itemId: number,
    quantity: number,
    productInfo?: {
      name?: string;
      price?: number;
      imageUrl?: string;
      storeId?: number;
      storeName?: string;
      availableQuantity?: number;
    }
  ) => Promise<CartOperationResult>;
  updateItem: (
    itemId: number,
    quantity: number
  ) => Promise<CartOperationResult>;
  removeItem: (itemId: number) => Promise<CartOperationResult>;
  clearCart: () => Promise<CartOperationResult>;
  refetchCart: () => Promise<void>;
  validateCart: () => Promise<boolean>;
  itemCount: number;
}

export interface UseCartItemCountReturn {
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCartValidationReturn {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  validate: () => Promise<boolean>;
}
