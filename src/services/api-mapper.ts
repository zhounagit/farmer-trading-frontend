/**
 * API Mapper Service
 *
 * Handles conversion between frontend (camelCase) and backend (PascalCase) naming conventions.
 * This ensures TypeScript interfaces use camelCase while maintaining compatibility with C# backend.
 */

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
  static toFrontendProductCategory(backendCategory: any): ProductCategory {
    return {
      categoryId: backendCategory.CategoryId,
      name: backendCategory.Name,
      description: backendCategory.Description,
      iconUrl: backendCategory.IconUrl,
      slug: backendCategory.Slug,
      sortOrder: backendCategory.SortOrder,
      isActive: backendCategory.IsActive,
      createdAt: backendCategory.CreatedAt,
    };
  }

  /**
   * Convert backend Store (PascalCase) to frontend format (camelCase)
   */
  static toFrontendStore(backendStore: any): Store {
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
  static toFrontendOrder(backendOrder: any): Order {
    return {
      orderId: backendOrder.OrderId,
      customerId: backendOrder.CustomerId,
      storeId: backendOrder.StoreId,
      totalAmount: backendOrder.TotalAmount,
      status: backendOrder.Status,
      paymentStatus: backendOrder.PaymentStatus,
      createdAt: backendOrder.CreatedAt,
      updatedAt: backendOrder.UpdatedAt,
    };
  }

  /**
   * Convert backend OrderItem (PascalCase) to frontend format (camelCase)
   */
  static toFrontendOrderItem(backendOrderItem: any): OrderItem {
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
  static toFrontendUserProfile(backendProfile: any): UserProfile {
    return {
      userId: backendProfile.UserId,
      email: backendProfile.Email,
      firstName: backendProfile.FirstName,
      lastName: backendProfile.LastName,
      userType: backendProfile.UserType,
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
  static toCamelCase<T>(backendObject: any): T {
    if (!backendObject || typeof backendObject !== 'object') {
      return backendObject;
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
    return result;
  }

  /**
   * Generic method to convert any frontend object from camelCase to PascalCase
   * Useful for objects that don't have specific mapping methods
   */
  static toPascalCase<T>(frontendObject: any): T {
    if (!frontendObject || typeof frontendObject !== 'object') {
      return frontendObject;
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
    return result;
  }
}
