/**
 * Guest Cart Service
 *
 * Handles guest cart operations using localStorage for immediate UX and backend API for persistence.
 * Provides seamless cart functionality without requiring login/registration.
 * Syncs with backend for order processing and shipment label generation.
 */

import { guestService } from './guestService';
import type {
  GuestCart,
  GuestCartItem,
  GuestCartOperationResult,
} from '../../../types/guest-cart';

export class GuestCartService {
  private static readonly STORAGE_KEY = 'guest-cart';
  private static readonly SESSION_KEY = 'guest-session-id';
  private static readonly CONFIG = {
    maxItems: 50,
    maxQuantityPerItem: 10,
    expirationDays: 7,
  };

  /**
   * Generate or retrieve guest session ID
   */
  private static getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);

    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }

    return sessionId;
  }

  /**
   * Get current guest cart from localStorage
   */
  static getCart(): GuestCart {
    const sessionId = this.getSessionId();
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      try {
        const cart = JSON.parse(stored) as GuestCart;
        // Validate cart structure and remove expired items
        return this.validateCart(cart);
      } catch {
        console.warn('Invalid guest cart data, creating new cart');
      }
    }

    // Create new guest cart
    const newCart: GuestCart = {
      sessionId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.saveCart(newCart);
    return newCart;
  }

  /**
   * Save guest cart to localStorage
   */
  private static saveCart(cart: GuestCart): void {
    cart.updatedAt = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));

    // Dispatch custom event to notify other components of cart update
    window.dispatchEvent(new Event('cartUpdated'));
  }

  /**
   * Validate and clean guest cart
   */
  private static validateCart(cart: GuestCart): GuestCart {
    // Ensure required fields exist
    if (!cart.items || !Array.isArray(cart.items)) {
      cart.items = [];
    }

    if (!cart.sessionId) {
      cart.sessionId = this.getSessionId();
    }

    if (!cart.createdAt) {
      cart.createdAt = new Date().toISOString();
    }

    // Remove items that exceed max quantity
    cart.items = cart.items.filter(
      (item: GuestCartItem) =>
        item.quantity > 0 && item.quantity <= this.CONFIG.maxQuantityPerItem
    );

    // Limit total items
    if (cart.items.length > this.CONFIG.maxItems) {
      cart.items = cart.items.slice(0, this.CONFIG.maxItems);
    }

    return cart;
  }

  /**
   * Add item to guest cart
   */
  static async addItem(
    itemId: number,
    quantity: number = 1,
    productInfo?: {
      name?: string;
      price?: number;
      imageUrl?: string;
      storeId?: number;
      storeName?: string;
      availableQuantity?: number;
    }
  ): Promise<GuestCartOperationResult> {
    try {
      const cart = this.getCart();

      // Initialize or get guest session for backend persistence
      const guestSession = await guestService.initializeGuest();

      // Sync with backend guest cart (skip getCart API as it's not found)
      try {
        await guestService.addToCart(guestSession.guestId, itemId, quantity);
      } catch (backendError) {
        console.warn(
          'Backend guest cart sync failed, continuing with localStorage:',
          backendError
        );
        // Continue with localStorage even if backend fails
      }

      // Validate quantity
      if (quantity <= 0 || quantity > this.CONFIG.maxQuantityPerItem) {
        return {
          success: false,
          error: `Quantity must be between 1 and ${this.CONFIG.maxQuantityPerItem}`,
        };
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item: GuestCartItem) => item.itemId === itemId
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;

        if (newQuantity > this.CONFIG.maxQuantityPerItem) {
          return {
            success: false,
            error: `Maximum quantity per item is ${this.CONFIG.maxQuantityPerItem}`,
          };
        }

        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].addedAt = new Date().toISOString();

        // Update product info if provided with mapped property names
        if (productInfo) {
          cart.items[existingItemIndex] = {
            ...cart.items[existingItemIndex],
            productName:
              productInfo.name ?? cart.items[existingItemIndex].productName,
            productPrice:
              productInfo.price ?? cart.items[existingItemIndex].productPrice,
            productImageUrl:
              productInfo.imageUrl ??
              cart.items[existingItemIndex].productImageUrl,
            storeId:
              productInfo.storeId ?? cart.items[existingItemIndex].storeId,
            storeName:
              productInfo.storeName ?? cart.items[existingItemIndex].storeName,
            availableQuantity:
              productInfo.availableQuantity ??
              cart.items[existingItemIndex].availableQuantity,
          };
        }
      } else {
        // Check if we've reached the maximum number of items
        if (cart.items.length >= this.CONFIG.maxItems) {
          return {
            success: false,
            error: `Cart can only contain ${this.CONFIG.maxItems} different items`,
          };
        }

        // Add new item with mapped property names
        const newItem: GuestCartItem = {
          itemId,
          quantity,
          addedAt: new Date().toISOString(),
          productName: productInfo?.name,
          productPrice: productInfo?.price,
          productImageUrl: productInfo?.imageUrl,
          storeId: productInfo?.storeId,
          storeName: productInfo?.storeName,
          availableQuantity: productInfo?.availableQuantity,
        };

        cart.items.push(newItem);
      }

      this.saveCart(cart);

      return {
        success: true,
        message: 'Item added to cart',
        cart,
      };
    } catch (error) {
      console.error('GuestCartService.addItem error:', error);
      return {
        success: false,
        error: 'Failed to add item to cart',
      };
    }
  }

  /**
   * Update item quantity in guest cart
   */
  static async updateItemQuantity(
    itemId: number,
    quantity: number
  ): Promise<GuestCartOperationResult> {
    try {
      const cart = this.getCart();

      // Sync with backend guest cart if guest session exists (skip getCart API as it's not found)
      const guestSession = guestService.getCurrentGuest();
      if (guestSession) {
        try {
          if (quantity <= 0) {
            await guestService.removeCartItem(guestSession.guestId, itemId);
          } else {
            await guestService.updateCartItem(
              guestSession.guestId,
              itemId,
              quantity
            );
          }
        } catch (backendError) {
          console.warn(
            'Backend guest cart sync failed, continuing with localStorage:',
            backendError
          );
        }
      }

      const itemIndex = cart.items.findIndex(
        (item: GuestCartItem) => item.itemId === itemId
      );

      if (itemIndex === -1) {
        return {
          success: false,
          error: 'Item not found in cart',
        };
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else if (quantity > this.CONFIG.maxQuantityPerItem) {
        return {
          success: false,
          error: `Maximum quantity per item is ${this.CONFIG.maxQuantityPerItem}`,
        };
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].addedAt = new Date().toISOString();
      }

      this.saveCart(cart);

      return {
        success: true,
        message:
          quantity <= 0 ? 'Item removed from cart' : 'Item quantity updated',
        cart,
      };
    } catch (error) {
      console.error('GuestCartService.updateItemQuantity error:', error);
      return {
        success: false,
        error: 'Failed to update item quantity',
      };
    }
  }

  /**
   * Remove item from guest cart
   */
  static async removeItem(itemId: number): Promise<GuestCartOperationResult> {
    try {
      const cart = this.getCart();

      // Sync with backend guest cart if guest session exists
      const guestSession = guestService.getCurrentGuest();
      if (guestSession) {
        try {
          await guestService.removeCartItem(guestSession.guestId, itemId);
        } catch (backendError) {
          console.warn(
            'Backend guest cart sync failed, continuing with localStorage:',
            backendError
          );
        }
      }

      const initialLength = cart.items.length;

      cart.items = cart.items.filter(
        (item: GuestCartItem) => item.itemId !== itemId
      );

      if (cart.items.length === initialLength) {
        return {
          success: false,
          error: 'Item not found in cart',
        };
      }

      this.saveCart(cart);

      return {
        success: true,
        message: 'Item removed from cart',
        cart,
      };
    } catch (error) {
      console.error('GuestCartService.removeItem error:', error);
      return {
        success: false,
        error: 'Failed to remove item from cart',
      };
    }
  }

  /**
   * Clear entire guest cart
   */
  static async clearCart(): Promise<GuestCartOperationResult> {
    try {
      const sessionId = this.getSessionId();

      // Sync with backend guest cart if guest session exists
      const guestSession = guestService.getCurrentGuest();
      if (guestSession) {
        try {
          await guestService.clearCart(guestSession.guestId);
        } catch (backendError) {
          console.warn(
            'Backend guest cart sync failed, continuing with localStorage:',
            backendError
          );
        }
      }

      const newCart: GuestCart = {
        sessionId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.saveCart(newCart);

      return {
        success: true,
        message: 'Cart cleared',
        cart: newCart,
      };
    } catch (error) {
      console.error('GuestCartService.clearCart error:', error);
      return {
        success: false,
        error: 'Failed to clear cart',
      };
    }
  }

  /**
   * Get guest cart item count (sum of quantities)
   */
  static async getItemCount(): Promise<number> {
    try {
      const cart = this.getCart();
      return cart.items.reduce(
        (total: number, item: GuestCartItem) => total + item.quantity,
        0
      );
    } catch (error) {
      console.error('GuestCartService.getItemCount error:', error);
      return 0;
    }
  }

  /**
   * Check if guest cart is empty
   */
  static async isEmpty(): Promise<boolean> {
    const count = await this.getItemCount();
    return count === 0;
  }

  /**
   * Get guest cart items for display
   */
  static async getItems(): Promise<GuestCartItem[]> {
    const cart = this.getCart();

    // Skip getCart API call as it's returning "Endpoint not found"
    // Only use localStorage items for now
    return cart.items;
  }

  /**
   * Get guest session ID
   */
  static getGuestSessionId(): string {
    return this.getSessionId();
  }

  /**
   * Clear guest session (logout equivalent for guests)
   */
  static clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);

    // Clear backend guest session
    guestService.clearGuestSession();
  }
}
