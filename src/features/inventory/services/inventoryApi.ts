import { apiClient } from '../../../shared/services/apiClient';
import { API_ENDPOINTS } from '../../../shared/types/api-contracts';
import { ApiMapper } from '../../../services/api-mapper';
import type { BackendInventoryItem } from '../../../services/api-mapper';
import type {
  InventoryItem,
  InventoryImage,
  InventoryCategory,
  InventoryVariant,
  InventoryPricing,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  InventoryFilters,
  InventorySearchParams,
  InventoryListResponse,
  InventoryStatsResponse,
  InventorySummary,
  InventoryActivity,
  InventoryImageUploadRequest,
  InventoryImageUpdateRequest,
  InventoryImportRequest,
  InventoryImportResult,
  InventoryExportRequest,
  BulkInventoryOperation,
  BulkInventoryResult,
} from '../../../shared/types/inventory';

// Interface for pagination response from backend
interface PaginationResponse {
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Interface for backend inventory list response
interface BackendInventoryListResponse {
  items?: BackendInventoryItem[];
  data?: BackendInventoryItem[];
  success?: boolean;
  message?: string;
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  pagination?: PaginationResponse;
}

import type { ApiResponse } from '../../../shared/types/api';

export class InventoryApiService {
  private static readonly BASE_PATH = API_ENDPOINTS.INVENTORY.BASE;
  private static readonly CATEGORIES_PATH = '/api/inventory-categories';

  // Enhanced error handling and logging
  private static logOperation(operation: string, details?: unknown): void {
    console.log(`📦 InventoryAPI: ${operation}`, details || '');
  }

  private static logDebug(operation: string, details?: unknown): void {
    console.debug(`🔍 InventoryAPI DEBUG: ${operation}`, details || '');
  }

  private static logError(operation: string, error: unknown): void {
    console.error(`❌ InventoryAPI: Error in ${operation}:`, error);
  }

  // Inventory Item CRUD Operations
  static async getInventoryItems(
    storeId: number,
    searchParams?: InventorySearchParams
  ): Promise<InventoryListResponse> {
    try {
      this.logOperation('Fetching inventory items', { storeId, searchParams });

      // Enhanced validation to catch [object Object] issues
      if (typeof storeId !== 'number' || isNaN(storeId)) {
        throw new Error(
          `Invalid storeId parameter: expected number, got ${typeof storeId}`
        );
      }

      const params = new URLSearchParams({
        storeId: storeId.toString(),
      });

      if (searchParams) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach((item) =>
                params.append(`${key}[]`, item.toString())
              );
            } else if (typeof value === 'object' && value !== null) {
              Object.entries(value).forEach(([subKey, subValue]) => {
                if (subValue !== undefined && subValue !== null) {
                  params.set(`${key}.${subKey}`, subValue.toString());
                }
              });
            } else {
              params.set(key, value.toString());
            }
          }
        });
      }

      const response = await apiClient.get<
        BackendInventoryListResponse | BackendInventoryItem[]
      >(`${this.BASE_PATH}?${params.toString()}`);

      this.logDebug('Raw API response received', { response });

      // Handle both array and object response formats
      let backendItems: BackendInventoryItem[] = [];
      let pagination: PaginationResponse | null | undefined = null;

      if (Array.isArray(response)) {
        // Response is directly an array
        this.logDebug('Response is direct array');
        backendItems = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Response has data property with array (new format)
        this.logDebug('Response has data property with array', {
          dataLength: response.data.length,
          hasPagination: !!response.pagination,
        });
        backendItems = response.data;
        pagination = response.pagination;
      } else if (response.items && Array.isArray(response.items)) {
        // Response has items property
        this.logDebug('Response has items property');
        backendItems = response.items;
        pagination = response.pagination || response;
      } else {
        // Unknown response format
        this.logDebug('Unknown response format', {
          keys: Object.keys(response || {}),
          responseType: typeof response,
          isArray: Array.isArray(response),
        });
      }

      this.logDebug('Backend items extracted', {
        count: backendItems.length,
        firstItem: backendItems[0],
      });

      // Convert backend items to frontend format using ApiMapper
      // Handle both PascalCase and camelCase backend responses
      let items: InventoryItem[];

      // Check if backend items are already in camelCase format
      if (backendItems.length > 0 && 'itemId' in backendItems[0]) {
        // Items are already in camelCase, use them directly
        this.logDebug('Items are already in camelCase format');
        items = backendItems as unknown as InventoryItem[];
      } else {
        // Items are in PascalCase, convert them
        this.logDebug('Converting items from PascalCase to camelCase');
        items = ApiMapper.toCamelCase<InventoryItem[]>(backendItems);
      }

      this.logDebug('Final items after processing', {
        count: items.length,
        firstItem: items[0],
      });

      // Map backend response to InventoryListResponse format
      const mappedResponse: InventoryListResponse = {
        items: items,
        totalCount:
          pagination?.totalCount ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.totalCount
            : undefined) ||
          items.length,
        pageNumber:
          pagination?.page ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.pageNumber
            : undefined) ||
          1,
        pageSize:
          pagination?.pageSize ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.pageSize
            : undefined) ||
          items.length,
        totalPages:
          pagination?.totalPages ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.totalPages
            : undefined) ||
          1,
        hasNextPage:
          pagination?.hasNext ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.hasNextPage
            : undefined) ||
          false,
        hasPreviousPage:
          pagination?.hasPrevious ||
          (typeof response === 'object' &&
          response !== null &&
          !Array.isArray(response)
            ? response.hasPreviousPage
            : undefined) ||
          false,
      };

      this.logOperation('Inventory items fetched successfully', {
        count: mappedResponse.items?.length || 0,
        totalItems: mappedResponse.totalCount,
      });

      return mappedResponse;
    } catch (error: unknown) {
      this.logError('getInventoryItems', error);
      // Enhanced fallback response with comprehensive structure
      return {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 20,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  static async getInventoryItem(
    itemId: number,
    includeRelations: boolean = true
  ): Promise<InventoryItem> {
    const queryParams = includeRelations
      ? '?include=images,variants,pricing,seasonality'
      : '';
    const response = await apiClient.get<any>(
      `${this.BASE_PATH}/${itemId}${queryParams}`
    );
    return ApiMapper.toCamelCase<InventoryItem>(response);
  }

  static async createInventoryItem(
    itemData: CreateInventoryItemRequest
  ): Promise<InventoryItem> {
    const backendRequest = ApiMapper.toBackendCreateInventoryItem(itemData);
    const response = await apiClient.post<any>(this.BASE_PATH, backendRequest);
    return ApiMapper.toCamelCase<InventoryItem>(response);
  }

  static async updateInventoryItem(
    itemId: number,
    updateData: UpdateInventoryItemRequest
  ): Promise<InventoryItem> {
    const backendRequest = ApiMapper.toBackendUpdateInventoryItem(updateData);
    const response = await apiClient.put<any>(
      `${this.BASE_PATH}/${itemId}`,
      backendRequest
    );
    return ApiMapper.toCamelCase<InventoryItem>(response);
  }

  static async deleteInventoryItem(itemId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${itemId}`
    );
    return response;
  }

  static async duplicateInventoryItem(
    itemId: number,
    newItemName: string
  ): Promise<InventoryItem> {
    const response = await apiClient.post<InventoryItem>(
      `${this.BASE_PATH}/${itemId}/duplicate`,
      {
        newItemName,
      }
    );
    return response;
  }

  // Inventory Search and Filtering
  static async searchInventory(
    searchParams: InventorySearchParams
  ): Promise<InventoryListResponse> {
    const response = await apiClient.post<
      BackendInventoryListResponse | BackendInventoryItem[]
    >(`${this.BASE_PATH}/search`, searchParams);

    // Handle both array and object response formats
    let backendItems: BackendInventoryItem[] = [];
    let pagination: PaginationResponse | null | undefined = null;

    if (Array.isArray(response)) {
      // Response is directly an array
      backendItems = response;
    } else if (response.data && Array.isArray(response.data)) {
      // Response has data property with array
      backendItems = response.data;
      pagination = response.pagination;
    } else if (response.items && Array.isArray(response.items)) {
      // Response has items property
      backendItems = response.items;
      pagination = response.pagination || response;
    }

    // Convert backend items to frontend format using ApiMapper
    // Handle both PascalCase and camelCase backend responses
    const items = ApiMapper.toCamelCase<InventoryItem[]>(backendItems);

    // Map backend response to InventoryListResponse format
    const mappedResponse: InventoryListResponse = {
      items: items,
      totalCount:
        pagination?.totalCount ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.totalCount
          : undefined) ||
        items.length,
      pageNumber:
        pagination?.page ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.pageNumber
          : undefined) ||
        1,
      pageSize:
        pagination?.pageSize ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.pageSize
          : undefined) ||
        items.length,
      totalPages:
        pagination?.totalPages ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.totalPages
          : undefined) ||
        1,
      hasNextPage:
        pagination?.hasNext ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.hasNextPage
          : undefined) ||
        false,
      hasPreviousPage:
        pagination?.hasPrevious ||
        (typeof response === 'object' &&
        response !== null &&
        !Array.isArray(response)
          ? response.hasPreviousPage
          : undefined) ||
        false,
    };

    return mappedResponse;
  }

  static async getInventorySuggestions(
    query: string,
    storeId: number,
    limit: number = 10
  ): Promise<string[]> {
    const response = await apiClient.get<string[]>(
      `${this.BASE_PATH}/suggestions?query=${encodeURIComponent(query)}&storeId=${storeId}&limit=${limit}`
    );
    return response;
  }

  static async getPopularItems(
    storeId: number,
    limit: number = 20
  ): Promise<InventoryItem[]> {
    const response = await apiClient.get<any[]>(
      `${this.BASE_PATH}/popular?storeId=${storeId}&limit=${limit}`
    );
    return ApiMapper.toCamelCase<InventoryItem[]>(response);
  }

  static async getLowStockItems(
    storeId: number,
    threshold: number = 10
  ): Promise<InventoryItem[]> {
    const response = await apiClient.get<any[]>(
      `${this.BASE_PATH}/low-stock?storeId=${storeId}&threshold=${threshold}`
    );
    return ApiMapper.toCamelCase<InventoryItem[]>(response);
  }

  static async getExpiringSoonItems(
    storeId: number,
    daysAhead: number = 7
  ): Promise<InventoryItem[]> {
    const response = await apiClient.get<any[]>(
      `${this.BASE_PATH}/expiring-soon?storeId=${storeId}&daysAhead=${daysAhead}`
    );
    return ApiMapper.toCamelCase<InventoryItem[]>(response);
  }

  // Inventory Statistics and Analytics
  static async getInventoryStats(
    storeId: number,
    startDate?: string,
    endDate?: string
  ): Promise<InventoryStatsResponse> {
    const params = new URLSearchParams({ storeId: storeId.toString() });
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);

    const response = await apiClient.get<InventoryStatsResponse>(
      `${this.BASE_PATH}/stats?${params.toString()}`
    );
    return response;
  }

  static async getInventorySummary(
    storeId: number,
    filters?: InventoryFilters
  ): Promise<InventorySummary> {
    const params = new URLSearchParams({ storeId: storeId.toString() });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => params.append(`${key}[]`, item.toString()));
          } else if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              if (subValue !== undefined && subValue !== null) {
                params.set(`${key}.${subKey}`, subValue.toString());
              }
            });
          } else {
            params.set(key, value.toString());
          }
        }
      });
    }

    const response = await apiClient.get<InventorySummary>(
      `${this.BASE_PATH}/summary?${params.toString()}`
    );
    return response;
  }

  static async getInventoryActivity(
    storeId: number,
    itemId?: number,
    limit: number = 50
  ): Promise<InventoryActivity[]> {
    const params = new URLSearchParams({
      storeId: storeId.toString(),
      limit: limit.toString(),
    });
    if (itemId) params.set('itemId', itemId.toString());

    const response = await apiClient.get<InventoryActivity[]>(
      `${this.BASE_PATH}/activity?${params.toString()}`
    );
    return response;
  }

  // Image Management
  static async getInventoryItemImages(
    itemId: number
  ): Promise<InventoryImage[]> {
    const response = await apiClient.get<InventoryImage[]>(
      API_ENDPOINTS.INVENTORY.IMAGES(itemId)
    );
    // Map originalUrl to url for compatibility with frontend
    const baseURL = 'https://localhost:7008';
    return response.map((img) => {
      const urlPath = img.originalUrlOverride || img.originalUrl;
      const fullUrl = urlPath.startsWith('http')
        ? urlPath
        : `${baseURL}${urlPath}`;
      return {
        ...img,
        url: fullUrl,
        thumbnailUrl: fullUrl,
      };
    });
  }

  static async uploadInventoryImage(
    itemId: number,
    file: File,
    uploadRequest: InventoryImageUploadRequest,
    onUploadProgress?: (progress: number) => void
  ): Promise<InventoryImage> {
    const formData = new FormData();
    formData.append('Image', file);
    if (uploadRequest.isPrimary !== undefined) {
      formData.append('IsPrimary', uploadRequest.isPrimary.toString());
    }
    if (uploadRequest.altText) {
      formData.append('AltText', uploadRequest.altText);
    }
    if (uploadRequest.caption) {
      formData.append('Caption', uploadRequest.caption);
    }
    if (uploadRequest.sortOrder !== undefined) {
      formData.append('DisplayOrder', uploadRequest.sortOrder.toString());
    }

    const response = await apiClient.upload<InventoryImage>(
      `${this.BASE_PATH}/${itemId}/images`,
      formData,
      onUploadProgress
    );
    return response;
  }

  static async updateInventoryImage(
    itemId: number,
    imageId: number,
    updateData: InventoryImageUpdateRequest
  ): Promise<InventoryImage> {
    const response = await apiClient.put<InventoryImage>(
      `${this.BASE_PATH}/${itemId}/images/${imageId}`,
      updateData
    );
    return response;
  }

  static async deleteInventoryImage(
    itemId: number,
    imageId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${itemId}/images/${imageId}`
    );
    return response;
  }

  static async reorderInventoryImages(
    itemId: number,
    imageOrders: { imageId: number; sortOrder: number }[]
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `${this.BASE_PATH}/${itemId}/images/reorder`,
      {
        imageOrders,
      }
    );
    return response;
  }

  static async setPrimaryImage(
    itemId: number,
    imageId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      `${this.BASE_PATH}/${itemId}/images/${imageId}/primary`
    );
    return response;
  }

  // Variants Management
  static async getInventoryVariants(
    itemId: number
  ): Promise<InventoryVariant[]> {
    const response = await apiClient.get<InventoryVariant[]>(
      `${this.BASE_PATH}/${itemId}/variants`
    );
    return response;
  }

  static async createInventoryVariant(
    itemId: number,
    variantData: Partial<InventoryVariant>
  ): Promise<InventoryVariant> {
    const response = await apiClient.post<InventoryVariant>(
      `${this.BASE_PATH}/${itemId}/variants`,
      variantData
    );
    return response;
  }

  static async updateInventoryVariant(
    itemId: number,
    variantId: number,
    updateData: Partial<InventoryVariant>
  ): Promise<InventoryVariant> {
    const response = await apiClient.put<InventoryVariant>(
      `${this.BASE_PATH}/${itemId}/variants/${variantId}`,
      updateData
    );
    return response;
  }

  static async deleteInventoryVariant(
    itemId: number,
    variantId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${itemId}/variants/${variantId}`
    );
    return response;
  }

  // Pricing Management
  static async getInventoryPricing(
    itemId: number,
    variantId?: number
  ): Promise<InventoryPricing[]> {
    const queryParam = variantId ? `?variantId=${variantId}` : '';
    const response = await apiClient.get<InventoryPricing[]>(
      `${this.BASE_PATH}/${itemId}/pricing${queryParam}`
    );
    return response;
  }

  static async createInventoryPricing(
    itemId: number,
    pricingData: Partial<InventoryPricing>
  ): Promise<InventoryPricing> {
    const response = await apiClient.post<InventoryPricing>(
      `${this.BASE_PATH}/${itemId}/pricing`,
      pricingData
    );
    return response;
  }

  static async updateInventoryPricing(
    itemId: number,
    pricingId: number,
    updateData: Partial<InventoryPricing>
  ): Promise<InventoryPricing> {
    const response = await apiClient.put<InventoryPricing>(
      `${this.BASE_PATH}/${itemId}/pricing/${pricingId}`,
      updateData
    );
    return response;
  }

  static async deleteInventoryPricing(
    itemId: number,
    pricingId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.BASE_PATH}/${itemId}/pricing/${pricingId}`
    );
    return response;
  }

  // Categories Management
  static async getInventoryCategories(): Promise<InventoryCategory[]> {
    const response = await apiClient.get<InventoryCategory[]>(
      this.CATEGORIES_PATH
    );
    return response;
  }

  static async createInventoryCategory(
    categoryData: Partial<InventoryCategory>
  ): Promise<InventoryCategory> {
    const response = await apiClient.post<InventoryCategory>(
      this.CATEGORIES_PATH,
      categoryData
    );
    return response;
  }

  static async updateInventoryCategory(
    categoryId: number,
    updateData: Partial<InventoryCategory>
  ): Promise<InventoryCategory> {
    const response = await apiClient.put<InventoryCategory>(
      `${this.CATEGORIES_PATH}/${categoryId}`,
      updateData
    );
    return response;
  }

  static async deleteInventoryCategory(
    categoryId: number
  ): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `${this.CATEGORIES_PATH}/${categoryId}`
    );
    return response;
  }

  // SKU Management
  static async checkSkuAvailability(
    sku: string,
    storeId: number,
    excludeItemId?: number
  ): Promise<{ available: boolean }> {
    const params = new URLSearchParams({
      sku,
      storeId: storeId.toString(),
    });
    if (excludeItemId) params.set('excludeItemId', excludeItemId.toString());

    const response = await apiClient.get<{ available: boolean }>(
      `${this.BASE_PATH}/check-sku?${params.toString()}`
    );
    return response;
  }

  static async generateSku(
    storeId: number,
    itemName: string,
    category: string
  ): Promise<{ sku: string }> {
    const response = await apiClient.post<{ sku: string }>(
      `${this.BASE_PATH}/generate-sku`,
      {
        storeId,
        itemName,
        category,
      }
    );
    return response;
  }

  // Bulk Operations
  static async bulkInventoryOperation(
    operation: BulkInventoryOperation
  ): Promise<BulkInventoryResult> {
    try {
      this.logOperation('Performing bulk inventory operation', {
        operation: operation.operation,
        itemCount: operation.itemIds?.length || 0,
      });

      const response = await apiClient.post<BulkInventoryResult>(
        `${this.BASE_PATH}/bulk`,
        operation
      );

      this.logOperation('Bulk operation completed successfully', {
        successCount: response.successCount || 0,
        failedCount: response.failedCount || 0,
      });

      return response;
    } catch (error: unknown) {
      this.logError('bulkInventoryOperation', error);
      // Enhanced fallback for bulk operations
      return {
        successful: [],
        failed:
          operation.itemIds?.map((id) => ({
            itemId: id,
            error: 'Bulk operation failed due to network error',
          })) || [],
        summary: {
          totalProcessed: operation.itemIds?.length || 0,
          successful: 0,
          failed: operation.itemIds?.length || 0,
        },
      };
    }
  }

  static async bulkUpdateQuantities(
    updates: {
      itemId: number;
      quantityChange: number;
      operation: 'add' | 'subtract' | 'set';
    }[]
  ): Promise<BulkInventoryResult> {
    const response = await apiClient.post<BulkInventoryResult>(
      `${this.BASE_PATH}/bulk-update-quantities`,
      {
        updates,
      }
    );
    return response;
  }

  static async bulkUpdatePrices(
    updates: { itemId: number; newPrice: number }[]
  ): Promise<BulkInventoryResult> {
    const response = await apiClient.post<BulkInventoryResult>(
      `${this.BASE_PATH}/bulk-update-prices`,
      {
        updates,
      }
    );
    return response;
  }

  // Import/Export
  static async importInventory(
    importRequest: InventoryImportRequest
  ): Promise<InventoryImportResult> {
    const formData = new FormData();
    formData.append('storeId', importRequest.storeId.toString());
    formData.append('format', importRequest.format);

    if (importRequest.data instanceof File) {
      formData.append('file', importRequest.data);
    } else {
      formData.append('data', importRequest.data);
    }

    if (importRequest.options) {
      Object.entries(importRequest.options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(`options.${key}`, value.toString());
        }
      });
    }

    const response = await apiClient.post<InventoryImportResult>(
      `${this.BASE_PATH}/import`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response;
  }

  static async exportInventory(
    exportRequest: InventoryExportRequest
  ): Promise<Blob> {
    const response = await apiClient.post(
      `${this.BASE_PATH}/export`,
      exportRequest,
      {
        responseType: 'blob',
      }
    );
    return response as unknown as Blob;
  }

  // Inventory Alerts and Notifications
  static async getInventoryAlerts(storeId: number): Promise<{
    lowStock: InventoryItem[];
    expiringSoon: InventoryItem[];
    outOfStock: InventoryItem[];
  }> {
    const response = await apiClient.get<{
      lowStock: InventoryItem[];
      expiringSoon: InventoryItem[];
      outOfStock: InventoryItem[];
    }>(`${this.BASE_PATH}/alerts?storeId=${storeId}`);
    return response;
  }

  static async updateStockLevel(
    itemId: number,
    operation: 'add' | 'subtract' | 'set',
    quantity: number,
    reason?: string
  ): Promise<InventoryItem> {
    const response = await apiClient.post<InventoryItem>(
      `${this.BASE_PATH}/${itemId}/stock`,
      {
        operation,
        quantity,
        reason,
      }
    );
    return response;
  }

  // Validation Helpers
  static async validateInventoryData(
    itemData: CreateInventoryItemRequest | UpdateInventoryItemRequest
  ): Promise<{
    valid: boolean;
    errors: Record<string, string[]>;
  }> {
    const response = await apiClient.post<{
      valid: boolean;
      errors: Record<string, string[]>;
    }>(`${this.BASE_PATH}/validate`, itemData);
    return response;
  }

  // Utility Methods
  static formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }

  static calculateTotalValue(items: InventoryItem[]): number {
    return items.reduce(
      (total, item) =>
        total + (item.pricePerUnit || 0) * (item.quantityAvailable || 0),
      0
    );
  }

  static isLowStock(item: InventoryItem, threshold: number = 10): boolean {
    return (
      (item.quantityAvailable || 0) <= threshold &&
      (item.quantityAvailable || 0) > 0
    );
  }

  static isOutOfStock(item: InventoryItem): boolean {
    return (item.quantityAvailable || 0) <= 0;
  }

  static isExpiringSoon(item: InventoryItem, daysAhead: number = 7): boolean {
    if (!item.expirationDate) return false;
    const expirationDate = new Date(item.expirationDate);
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + daysAhead);
    return expirationDate <= alertDate;
  }
}

export default InventoryApiService;
