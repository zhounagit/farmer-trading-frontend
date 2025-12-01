/**
 * Cart Service
 *
 * Handles all cart-related API operations with proper type conversion
 * between frontend (camelCase) and backend (PascalCase) using ApiMapper.
 */

import { apiService } from '../../../shared/services/api-service';
import { ApiMapper } from '../../../services/api-mapper';
import type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../../../types/cart';

export class CartService {
  private static readonly BASE_PATH = '/api/carts';

  /**
   * Get user's cart with all items
   */
  static async getCart(userId: number): Promise<Cart> {
    try {
      const cart = await apiService.get<Cart>(`${this.BASE_PATH}/${userId}`);

      if (cart) {
        // Use ApiMapper to convert backend PascalCase to frontend camelCase
        return ApiMapper.toCamelCase<Cart>(cart);
      }

      // If no cart exists for user, return an empty cart structure
      return {
        cartId: 0,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmpty: true,
        itemCount: 0,
        total: 0,
        totalDiscount: 0,
        subtotal: 0,
        hasSelectedFulfillment: false,
        cartItems: [],
      };
    } catch (error) {
      console.error('CartService.getCart error:', error);

      // If it's a 404 error, return an empty cart for new users
      if ((error as { status?: number })?.status === 404) {
        return {
          cartId: 0,
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isEmpty: true,
          itemCount: 0,
          total: 0,
          totalDiscount: 0,
          subtotal: 0,
          hasSelectedFulfillment: false,
          cartItems: [],
        };
      }

      throw error;
    }
  }

  /**
   * Add item to cart
   */
  static async addItem(
    userId: number,
    request: AddToCartRequest
  ): Promise<CartItem> {
    try {
      // Convert frontend request to backend format
      const backendRequest = ApiMapper.toBackendAddToCartRequest(request);

      const cartItem = await apiService.post<CartItem>(
        `${this.BASE_PATH}/${userId}/items`,
        backendRequest
      );

      if (cartItem) {
        // Convert backend response to frontend format
        return ApiMapper.toCamelCase<CartItem>(cartItem);
      }

      throw new Error('Failed to add item to cart');
    } catch (error) {
      console.error('CartService.addItem error:', error);
      throw error;
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItem(
    userId: number,
    itemId: number,
    request: UpdateCartItemRequest
  ): Promise<CartItem> {
    try {
      // Convert frontend request to backend format
      const backendRequest = ApiMapper.toBackendUpdateCartItemRequest(request);

      const cartItem = await apiService.put<CartItem>(
        `${this.BASE_PATH}/${userId}/items/${itemId}`,
        backendRequest
      );

      if (cartItem) {
        // Convert backend response to frontend format
        return ApiMapper.toCamelCase<CartItem>(cartItem);
      }

      throw new Error('Failed to update cart item');
    } catch (error) {
      console.error('CartService.updateItem error:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId: number, itemId: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_PATH}/${userId}/items/${itemId}`);
    } catch (error) {
      console.error('CartService.removeItem error:', error);
      throw error;
    }
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId: number): Promise<void> {
    try {
      await apiService.delete(`${this.BASE_PATH}/${userId}`);
    } catch (error) {
      console.error('CartService.clearCart error:', error);
      throw error;
    }
  }

  /**
   * Get specific cart item
   */
  static async getItem(userId: number, itemId: number): Promise<CartItem> {
    try {
      const cartItem = await apiService.get<CartItem>(
        `${this.BASE_PATH}/${userId}/items/${itemId}`
      );

      if (cartItem) {
        // Convert backend response to frontend format
        return ApiMapper.toCamelCase<CartItem>(cartItem);
      }

      throw new Error('Failed to get cart item');
    } catch (error) {
      console.error('CartService.getItem error:', error);
      throw error;
    }
  }

  /**
   * Validate cart for checkout
   */
  static async validateCart(userId: number): Promise<boolean> {
    try {
      const isValid = await apiService.get<boolean>(
        `${this.BASE_PATH}/${userId}/validate`
      );

      if (isValid !== undefined) {
        return isValid;
      }

      throw new Error('Failed to validate cart');
    } catch (error) {
      console.error('CartService.validateCart error:', error);
      throw error;
    }
  }

  /**
   * Get cart item count
   */
  static async getItemCount(userId: number): Promise<number> {
    try {
      const count = await apiService.get<number>(
        `${this.BASE_PATH}/${userId}/count`
      );

      if (count !== undefined) {
        return count;
      }

      throw new Error('Failed to get cart item count');
    } catch (error) {
      console.error('CartService.getItemCount error:', error);
      throw error;
    }
  }
}
