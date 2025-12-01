/**
 * Guest Service
 *
 * Provides guest session management and guest-specific operations.
 * Follows existing service patterns and uses ApiMapper for type conversion.
 */

import { apiService } from '../../../shared/services/api-service';
import { ApiMapper } from '../../../services/api-mapper';

// Frontend types (camelCase)
export interface GuestSession {
  guestId: number;
  createdAt: string;
  expiresAt: string;
  convertedToUserId?: number;
}

export interface GuestAddress {
  addressId: number;
  guestId: number;
  addressType: 'shipping' | 'billing' | 'both';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface GuestAddressRequest {
  addressType: 'shipping' | 'billing' | 'both';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName: string;
  lastName: string;
  isPrimary?: boolean;
}

export interface GuestCart {
  cartId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  isEmpty: boolean;
  itemCount: number;
  total: number;
  totalDiscount: number;
  subtotal: number;
  hasSelectedFulfillment: boolean;
  cartItems: GuestCartItem[];
}

export interface GuestCartItem {
  cartItemId: number;
  cartId: number;
  itemId: number;
  quantity: number;
  addedAt: string;
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

export interface AddToGuestCartRequest {
  itemId: number;
  quantity: number;
}

// Backend types (PascalCase)
interface BackendGuestSession {
  GuestId: number;
  CreatedAt: string;
  ExpiresAt: string;
  ConvertedToUserId?: number;
}

interface BackendGuestAddress {
  AddressId: number;
  GuestId: number;
  AddressType: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  IsPrimary: boolean;
  CreatedAt: string;
}

interface BackendGuestAddressRequest {
  AddressType: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  FirstName: string;
  LastName: string;
  IsPrimary?: boolean;
}

interface BackendGuestCart {
  CartId: number;
  UserId: number;
  CreatedAt: string;
  UpdatedAt: string;
  IsEmpty: boolean;
  ItemCount: number;
  Total: number;
  TotalDiscount: number;
  Subtotal: number;
  HasSelectedFulfillment: boolean;
  CartItems: BackendGuestCartItem[];
}

interface BackendGuestCartItem {
  CartItemId: number;
  CartId: number;
  ItemId: number;
  Quantity: number;
  AddedAt: string;
  ItemPrice: number;
  ItemName: string;
  ItemSku: string;
  ItemImageUrl?: string;
  StoreId: number;
  OriginalPrice?: number;
  DiscountAmount: number;
  IsActive: boolean;
  InStock: boolean;
  AvailableQuantity: number;
  LineTotal: number;
  EffectivePrice: number;
  LineTotalWithDiscount: number;
  HasDiscount: boolean;
  TotalSavings: number;
  DiscountPercentage: number;
  IsQuantityAvailable: boolean;
  NeedsQuantityAdjustment: boolean;
  IsOutOfStock: boolean;
  StatusDisplay: string;
}

interface BackendAddToGuestCartRequest {
  ItemId: number;
  Quantity: number;
}

export class GuestService {
  private sessionKey = 'guestId';
  private expiresKey = 'guestExpiresAt';

  /**
   * Create a new guest customer session
   */
  async createGuest(): Promise<GuestSession> {
    const response = await apiService.post<BackendGuestSession>('/api/guest');

    const guestSession = ApiMapper.toCamelCase<GuestSession>(response);

    // Store session data
    this.setGuestSession(guestSession);

    return guestSession;
  }

  /**
   * Get guest details
   */
  async getGuest(guestId: number): Promise<GuestSession> {
    const response = await apiService.get<BackendGuestSession>(
      `/api/guest/${guestId}`
    );
    return ApiMapper.toCamelCase<GuestSession>(response);
  }

  /**
   * Create guest address
   */
  async createAddress(
    guestId: number,
    addressData: GuestAddressRequest
  ): Promise<GuestAddress> {
    const backendRequest: BackendGuestAddressRequest =
      ApiMapper.toPascalCase(addressData);

    const response = await apiService.post<BackendGuestAddress>(
      `/api/guest/${guestId}/addresses`,
      backendRequest
    );

    return ApiMapper.toCamelCase<GuestAddress>(response);
  }

  /**
   * Update guest contact information
   */
  async updateContactInfo(
    guestId: number,
    contactInfo: { email?: string; phone?: string }
  ): Promise<void> {
    const backendRequest = ApiMapper.toPascalCase(contactInfo);
    await apiService.put(`/api/guest/${guestId}/contact-info`, backendRequest);
  }

  /**
   * Find guest by email address
   */
  async findGuestByEmail(email: string): Promise<GuestSession | null> {
    try {
      const response = await apiService.get<BackendGuestSession>(
        `/api/guest/by-email/${encodeURIComponent(email)}`
      );
      return ApiMapper.toCamelCase<GuestSession>(response);
    } catch {
      // Guest not found
      return null;
    }
  }

  /**
   * Create guest with contact information
   */
  async createGuestWithContactInfo(contactInfo: {
    email?: string;
    phone?: string;
  }): Promise<GuestSession> {
    const backendRequest = ApiMapper.toPascalCase(contactInfo);
    const response = await apiService.post<BackendGuestSession>(
      '/api/guest',
      backendRequest
    );
    const guestSession = ApiMapper.toCamelCase<GuestSession>(response);
    this.setGuestSession(guestSession);
    return guestSession;
  }

  /**
   * Get guest addresses
   */
  async getAddresses(
    guestId: number,
    addressType?: 'shipping' | 'billing'
  ): Promise<GuestAddress[]> {
    const params = new URLSearchParams();
    if (addressType) {
      params.append('addressType', addressType);
    }

    const response = await apiService.get<BackendGuestAddress[]>(
      `/api/guest/${guestId}/addresses?${params.toString()}`
    );

    return ApiMapper.toCamelCase<GuestAddress[]>(response);
  }

  /**
   * Get primary address for guest
   */
  async getPrimaryAddress(guestId: number): Promise<GuestAddress | null> {
    try {
      const response = await apiService.get<BackendGuestAddress>(
        `/api/guest/${guestId}/addresses/primary`
      );
      return ApiMapper.toCamelCase<GuestAddress>(response);
    } catch {
      // No primary address found
      return null;
    }
  }

  /**
   * Set address as primary for guest
   */
  async setPrimaryAddress(guestId: number, addressId: number): Promise<void> {
    await apiService.put(
      `/api/guest/${guestId}/addresses/${addressId}/set-primary`
    );
  }

  /**
   * Get guest cart
   */
  async getCart(guestId: number): Promise<GuestCart> {
    const response = await apiService.get<BackendGuestCart>(
      `/api/carts/guest/${guestId}`
    );
    return ApiMapper.toCamelCase<GuestCart>(response);
  }

  /**
   * Add item to guest cart
   */
  async addToCart(
    guestId: number,
    itemId: number,
    quantity: number
  ): Promise<GuestCartItem> {
    const backendRequest: BackendAddToGuestCartRequest = {
      ItemId: itemId,
      Quantity: quantity,
    };

    const response = await apiService.post<BackendGuestCartItem>(
      `/api/carts/guest/${guestId}/items`,
      backendRequest
    );

    return ApiMapper.toCamelCase<GuestCartItem>(response);
  }

  /**
   * Update guest cart item
   */
  async updateCartItem(
    guestId: number,
    itemId: number,
    quantity: number
  ): Promise<GuestCartItem> {
    const backendRequest: BackendAddToGuestCartRequest = {
      ItemId: itemId,
      Quantity: quantity,
    };

    const response = await apiService.put<BackendGuestCartItem>(
      `/api/carts/guest/${guestId}/items/${itemId}`,
      backendRequest
    );

    return ApiMapper.toCamelCase<GuestCartItem>(response);
  }

  /**
   * Remove item from guest cart
   */
  async removeCartItem(guestId: number, itemId: number): Promise<void> {
    await apiService.delete(`/api/carts/guest/${guestId}/items/${itemId}`);
  }

  /**
   * Clear guest cart
   */
  async clearCart(guestId: number): Promise<void> {
    await apiService.delete(`/api/carts/guest/${guestId}`);
  }

  /**
   * Validate guest checkout prerequisites
   */
  async validateCheckout(
    guestId: number,
    cartId?: number,
    shippingAddressId?: number,
    billingAddressId?: number
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const params = new URLSearchParams();
    if (cartId) params.append('cartId', cartId.toString());
    if (shippingAddressId)
      params.append('shippingAddressId', shippingAddressId.toString());
    if (billingAddressId)
      params.append('billingAddressId', billingAddressId.toString());

    let response;
    try {
      response = await apiService.post<{
        success: boolean;
        message: string;
      }>(`/api/guest/${guestId}/validate-checkout?${params.toString()}`);
    } catch (error) {
      console.error('validateCheckout API call failed:', error);
      return {
        isValid: false,
        errors: ['Unable to validate checkout. Please try again.'],
      };
    }

    // Handle undefined response
    if (!response) {
      console.error('validateCheckout: API response is undefined');
      return {
        isValid: false,
        errors: ['Validation service unavailable'],
      };
    }

    // Convert backend response to expected frontend format
    let camelCaseResponse;
    try {
      camelCaseResponse = ApiMapper.toCamelCase<{
        success: boolean;
        message: string;
      }>(response);
    } catch (error) {
      console.error('validateCheckout: Failed to convert response:', error);
      return {
        isValid: false,
        errors: ['Invalid validation response format'],
      };
    }

    // Handle undefined or null response
    if (!camelCaseResponse) {
      console.error('validateCheckout: camelCaseResponse is undefined or null');
      return {
        isValid: false,
        errors: ['Validation service unavailable'],
      };
    }

    // Handle missing success property
    if (typeof camelCaseResponse.success === 'undefined') {
      console.error(
        'validateCheckout: success property is undefined',
        camelCaseResponse
      );
      return {
        isValid: false,
        errors: ['Invalid validation response format'],
      };
    }

    return {
      isValid: camelCaseResponse.success,
      errors: camelCaseResponse.success
        ? []
        : [camelCaseResponse.message || 'Validation failed'],
    };
  }

  /**
   * Convert guest to registered user
   */
  async convertToUser(guestId: number, userId: number): Promise<void> {
    await apiService.post(`/api/guest/${guestId}/convert-to-user/${userId}`);
  }

  // Session Management

  /**
   * Get current guest session
   */
  getCurrentGuest(): GuestSession | null {
    const guestId = sessionStorage.getItem(this.sessionKey);
    const expiresAt = sessionStorage.getItem(this.expiresKey);

    if (!guestId || !expiresAt) {
      return null;
    }

    // Check if session is still valid
    if (new Date() > new Date(expiresAt)) {
      this.clearGuestSession();
      return null;
    }

    return {
      guestId: parseInt(guestId),
      createdAt: '',
      expiresAt,
    };
  }

  /**
   * Set guest session in storage
   */
  setGuestSession(guestSession: GuestSession): void {
    sessionStorage.setItem(this.sessionKey, guestSession.guestId.toString());
    sessionStorage.setItem(this.expiresKey, guestSession.expiresAt);
  }

  /**
   * Clear guest session
   */
  clearGuestSession(): void {
    sessionStorage.removeItem(this.sessionKey);
    sessionStorage.removeItem(this.expiresKey);
  }

  /**
   * Check if guest session is valid
   */
  isSessionValid(): boolean {
    const guestSession = this.getCurrentGuest();
    return guestSession !== null;
  }

  /**
   * Initialize or retrieve guest session
   */
  async initializeGuest(): Promise<GuestSession> {
    const currentGuest = this.getCurrentGuest();

    if (currentGuest) {
      try {
        // Verify the guest session is still valid on the server
        await this.getGuest(currentGuest.guestId);
        return currentGuest;
      } catch {
        // Session is invalid, create a new one
        this.clearGuestSession();
      }
    }

    // Create new guest session
    return await this.createGuest();
  }
}

// Export singleton instance
export const guestService = new GuestService();

// Default export for convenience
export default guestService;
