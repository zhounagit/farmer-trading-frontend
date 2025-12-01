/**
 * API Mapper Service
 *
 * Handles conversion between frontend (camelCase) and backend (PascalCase) naming conventions.
 * This ensures TypeScript interfaces use camelCase while maintaining compatibility with C# backend.
 */

import type {
  Cart,
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types/cart';

import type {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
} from '../shared/types/inventory';

import type {
  ProductCategory,
  Store,
  Order,
  OrderItem,
  UserProfile,
} from '../shared/types/api-contracts';

import type {
  StoreAddress,
  StoreAddressRequest,
  AddressType,
} from '../shared/types/store';

// Backend response types (PascalCase)
export interface BackendInventoryItem {
  ItemId: number;
  StoreId: number;
  Sku: string;
  Name: string;
  Description?: string;
  Price: number;
  Cost?: number;
  Quantity: number;
  MinStockLevel?: number;
  AllowOffers?: boolean;
  MinOfferPrice?: number;
  Attributes?: string;
  Unit?: string;
  Category: string;
  ItemType?: string;
  ServiceCategory?: string;
  ProcessingTimeDays?: number;
  RequiresRawMaterial?: boolean;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedBy?: number;
  UpdatedBy?: number;
}

interface BackendCreateInventoryItemRequest {
  StoreId: number;
  Sku: string;
  Name: string;
  Description?: string;
  Price: number;
  Cost?: number;
  Quantity: number;
  MinStockLevel?: number;
  AllowOffers?: boolean;
  MinOfferPrice?: number;
  Attributes?: string;
  Unit?: string;
  Category: string;
  ItemType?: string;
  ServiceCategory?: string;
  ProcessingTimeDays?: number;
  RequiresRawMaterial?: boolean;
}

interface BackendUpdateInventoryItemRequest {
  StoreId?: number;
  Name?: string;
  Description?: string;
  Sku?: string;
  Price?: number;
  Cost?: number;
  Quantity?: number;
  MinStockLevel?: number;
  Unit?: string;
  Category?: string;
  AllowOffers?: boolean;
  MinOfferPrice?: number;
  ItemType?: string;
  ServiceCategory?: string;
  ProcessingTimeDays?: number;
  RequiresRawMaterial?: boolean;
}

// Backend Cart types (PascalCase)
interface BackendCart {
  CartId: number;
  UserId: number;
  CreatedAt: string;
  UpdatedAt: string;
  SelectedFulfillment?: string;
  IsEmpty: boolean;
  ItemCount: number;
  Total: number;
  TotalDiscount: number;
  Subtotal: number;
  HasSelectedFulfillment: boolean;
  CartItems: BackendCartItem[];
}

interface BackendCartItem {
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

interface BackendAddToCartRequest {
  ItemId: number;
  Quantity: number;
}

interface BackendUpdateCartItemRequest {
  Quantity: number;
}

// Backend StoreAddress types (PascalCase)
interface BackendStoreAddress {
  AddressId: number;
  StoreId: number;
  AddressType: string;
  LocationName?: string;
  ContactPhone: string;
  ContactEmail?: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  IsPrimary: boolean;
  PickupInstructions?: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface BackendStoreAddressRequest {
  AddressType: string;
  LocationName: string;
  ContactPhone: string;
  ContactEmail: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country?: string;
  IsPrimary?: boolean;
  PickupInstructions?: string;
}

export class ApiMapper {
  /**
   * Convert frontend CreateInventoryItemRequest (camelCase) to backend format (PascalCase)
   */
  static toBackendCreateInventoryItem(
    request: CreateInventoryItemRequest
  ): BackendCreateInventoryItemRequest {
    return {
      StoreId: request.storeId,
      Sku: request.sku,
      Name: request.name,
      Description: request.description,
      Price: request.price,
      Cost: request.cost,
      Quantity: request.quantity,
      MinStockLevel: request.minStockLevel,
      AllowOffers: request.allowOffers,
      MinOfferPrice: request.minOfferPrice,
      Attributes: request.attributes,
      Unit: request.unit,
      Category: request.category,
      ItemType: request.itemType,
      ServiceCategory: request.serviceCategory,
      ProcessingTimeDays: request.processingTimeDays,
      RequiresRawMaterial: request.requiresRawMaterial,
    };
  }

  /**
   * Convert frontend UpdateInventoryItemRequest (camelCase) to backend format (PascalCase)
   */
  static toBackendUpdateInventoryItem(
    request: UpdateInventoryItemRequest
  ): BackendUpdateInventoryItemRequest {
    return {
      StoreId: request.storeId,
      Name: request.name,
      Description: request.description,
      Sku: request.sku,
      Price: request.price,
      Cost: request.cost,
      Quantity: request.quantity,
      MinStockLevel: request.minStockLevel,
      Unit: request.unit,
      Category: request.category,
      AllowOffers: request.allowOffers,
      MinOfferPrice: request.minOfferPrice,
    };
  }

  /**
   * Convert backend ProductCategory (PascalCase) to frontend format (camelCase)
   */
  static toFrontendProductCategory(backendCategory: {
    CategoryId: number;
    Name: string;
    Description?: string;
    IconUrl?: string;
    Slug?: string;
    SortOrder?: number;
    IsActive?: boolean;
    CreatedAt?: string;
  }): ProductCategory {
    return {
      categoryId: backendCategory.CategoryId,
      name: backendCategory.Name,
      description: backendCategory.Description,
      iconUrl: backendCategory.IconUrl,
      slug: backendCategory.Slug || '',
      sortOrder: backendCategory.SortOrder || 0,
      isActive: backendCategory.IsActive || false,
      createdAt: backendCategory.CreatedAt || new Date().toISOString(),
    };
  }

  /**
   * Convert backend Store (PascalCase) to frontend format (camelCase)
   */
  static toFrontendStore(backendStore: {
    StoreId: number;
    StoreName: string;
    Description?: string;
    LogoUrl?: string;
    BannerUrl?: string;
    OwnerId: number;
    IsActive: boolean;
    CreatedAt: string;
    UpdatedAt: string;
  }): Store {
    return {
      storeId: backendStore.StoreId,
      storeName: backendStore.StoreName,
      description: backendStore.Description,
      logoUrl: backendStore.LogoUrl,
      bannerUrl: backendStore.BannerUrl,
      ownerId: backendStore.OwnerId,
      isActive: backendStore.IsActive,
      createdAt: backendStore.CreatedAt,
      updatedAt: backendStore.UpdatedAt,
    };
  }

  /**
   * Convert backend Order (PascalCase) to frontend format (camelCase)
   */
  static toFrontendOrder(backendOrder: {
    OrderId: number;
    CustomerId: number;
    StoreId: number;
    TotalAmount: number;
    Status: string;
    PaymentStatus: string;
    CreatedAt: string;
    UpdatedAt: string;
  }): Order {
    return {
      orderId: backendOrder.OrderId,
      customerId: backendOrder.CustomerId,
      storeId: backendOrder.StoreId,
      totalAmount: backendOrder.TotalAmount,
      status: backendOrder.Status as
        | 'pending'
        | 'confirmed'
        | 'preparing'
        | 'ready'
        | 'completed'
        | 'cancelled',
      paymentStatus: backendOrder.PaymentStatus as
        | 'pending'
        | 'paid'
        | 'failed'
        | 'refunded',
      createdAt: backendOrder.CreatedAt,
      updatedAt: backendOrder.UpdatedAt,
    };
  }

  /**
   * Convert backend OrderItem (PascalCase) to frontend format (camelCase)
   */
  static toFrontendOrderItem(backendOrderItem: {
    OrderItemId: number;
    OrderId: number;
    ItemId: number;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    InventoryItem?: BackendInventoryItem;
  }): OrderItem {
    return {
      orderItemId: backendOrderItem.OrderItemId,
      orderId: backendOrderItem.OrderId,
      itemId: backendOrderItem.ItemId,
      quantity: backendOrderItem.Quantity,
      unitPrice: backendOrderItem.UnitPrice,
      totalPrice: backendOrderItem.TotalPrice,
      inventoryItem: backendOrderItem.InventoryItem
        ? this.toCamelCase<InventoryItem>(backendOrderItem.InventoryItem)
        : undefined,
    };
  }

  /**
   * Convert backend UserProfile (PascalCase) to frontend format (camelCase)
   */
  static toFrontendUserProfile(backendProfile: {
    UserId: number;
    Email: string;
    FirstName?: string;
    LastName?: string;
    UserType: string;
    ProfilePictureUrl?: string;
    PhoneNumber?: string;
    CreatedAt: string;
    UpdatedAt: string;
  }): UserProfile {
    return {
      userId: backendProfile.UserId,
      email: backendProfile.Email,
      firstName: backendProfile.FirstName || '',
      lastName: backendProfile.LastName || '',
      userType: backendProfile.UserType as 'customer' | 'store_owner' | 'admin',
      profilePictureUrl: backendProfile.ProfilePictureUrl,
      phoneNumber: backendProfile.PhoneNumber,
      createdAt: backendProfile.CreatedAt,
      updatedAt: backendProfile.UpdatedAt,
    };
  }

  /**
   * Generic method to convert any backend object from PascalCase to camelCase
   * Useful for objects that don't have specific mapping methods
   */
  static toCamelCase<T>(backendObject: unknown): T {
    if (!backendObject || typeof backendObject !== 'object') {
      return backendObject as T;
    }

    if (Array.isArray(backendObject)) {
      return backendObject.map((item) =>
        this.toCamelCase(item)
      ) as unknown as T;
    }

    const result: any = {};
    for (const [key, value] of Object.entries(backendObject)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = this.toCamelCase(value);
    }
    return result as T;
  }

  /**
   * Convert backend StoreAddress (PascalCase) to frontend format (camelCase)
   */
  static toFrontendStoreAddress(
    backendAddress: BackendStoreAddress
  ): StoreAddress {
    return {
      addressId: backendAddress.AddressId,
      storeId: backendAddress.StoreId,
      addressType: backendAddress.AddressType as AddressType,
      locationName: backendAddress.LocationName,
      contactPhone: backendAddress.ContactPhone,
      contactEmail: backendAddress.ContactEmail,
      streetAddress: backendAddress.StreetAddress,
      city: backendAddress.City,
      state: backendAddress.State,
      zipCode: backendAddress.ZipCode,
      country: backendAddress.Country,
      isPrimary: backendAddress.IsPrimary,
      pickupInstructions: backendAddress.PickupInstructions,
      isActive: backendAddress.IsActive,
      createdAt: backendAddress.CreatedAt,
      updatedAt: backendAddress.UpdatedAt,
    };
  }

  /**
   * Convert frontend StoreAddressRequest (camelCase) to backend format (PascalCase)
   */
  static toBackendStoreAddressRequest(
    request: StoreAddressRequest
  ): BackendStoreAddressRequest {
    return {
      AddressType: request.AddressType,
      LocationName: request.LocationName,
      ContactPhone: request.ContactPhone,
      ContactEmail: request.ContactEmail,
      StreetAddress: request.StreetAddress,
      City: request.City,
      State: request.State,
      ZipCode: request.ZipCode,
      Country: request.Country,
      IsPrimary: request.IsPrimary,
      PickupInstructions: request.PickupInstructions,
    };
  }

  /**
   * Generic method to convert any frontend object from camelCase to PascalCase
   * Useful for objects that don't have specific mapping methods
   */
  static toPascalCase<T>(frontendObject: unknown): T {
    if (!frontendObject || typeof frontendObject !== 'object') {
      return frontendObject as T;
    }

    if (Array.isArray(frontendObject)) {
      return frontendObject.map((item) =>
        this.toPascalCase(item)
      ) as unknown as T;
    }

    const result: any = {};
    for (const [key, value] of Object.entries(frontendObject)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      result[pascalKey] = this.toPascalCase(value);
    }
    return result as T;
  }

  /**
   * Convert backend Cart (PascalCase) to frontend format (camelCase)
   */
  static toFrontendCart(backendCart: BackendCart): Cart {
    return {
      cartId: backendCart.CartId,
      userId: backendCart.UserId,
      createdAt: backendCart.CreatedAt,
      updatedAt: backendCart.UpdatedAt,
      selectedFulfillment: backendCart.SelectedFulfillment,
      isEmpty: backendCart.IsEmpty,
      itemCount: backendCart.ItemCount,
      total: backendCart.Total,
      totalDiscount: backendCart.TotalDiscount,
      subtotal: backendCart.Subtotal,
      hasSelectedFulfillment: backendCart.HasSelectedFulfillment,
      cartItems: backendCart.CartItems.map((item) =>
        this.toFrontendCartItem(item)
      ),
    };
  }

  /**
   * Convert backend CartItem (PascalCase) to frontend format (camelCase)
   */
  static toFrontendCartItem(backendCartItem: BackendCartItem): CartItem {
    return {
      cartItemId: backendCartItem.CartItemId,
      cartId: backendCartItem.CartId,
      itemId: backendCartItem.ItemId,
      quantity: backendCartItem.Quantity,
      addedAt: backendCartItem.AddedAt,
      itemPrice: backendCartItem.ItemPrice,
      itemName: backendCartItem.ItemName,
      itemSku: backendCartItem.ItemSku,
      itemImageUrl: backendCartItem.ItemImageUrl,
      storeId: backendCartItem.StoreId,
      originalPrice: backendCartItem.OriginalPrice,
      discountAmount: backendCartItem.DiscountAmount,
      isActive: backendCartItem.IsActive,
      inStock: backendCartItem.InStock,
      availableQuantity: backendCartItem.AvailableQuantity,
      lineTotal: backendCartItem.LineTotal,
      effectivePrice: backendCartItem.EffectivePrice,
      lineTotalWithDiscount: backendCartItem.LineTotalWithDiscount,
      hasDiscount: backendCartItem.HasDiscount,
      totalSavings: backendCartItem.TotalSavings,
      discountPercentage: backendCartItem.DiscountPercentage,
      isQuantityAvailable: backendCartItem.IsQuantityAvailable,
      needsQuantityAdjustment: backendCartItem.NeedsQuantityAdjustment,
      isOutOfStock: backendCartItem.IsOutOfStock,
      statusDisplay: backendCartItem.StatusDisplay,
    };
  }

  /**
   * Convert frontend AddToCartRequest (camelCase) to backend format (PascalCase)
   */
  static toBackendAddToCartRequest(
    request: AddToCartRequest
  ): BackendAddToCartRequest {
    return {
      ItemId: request.itemId,
      Quantity: request.quantity,
    };
  }

  /**
   * Convert frontend UpdateCartItemRequest (camelCase) to backend format (PascalCase)
   */
  static toBackendUpdateCartItemRequest(
    request: UpdateCartItemRequest
  ): BackendUpdateCartItemRequest {
    return {
      Quantity: request.quantity,
    };
  }
}
