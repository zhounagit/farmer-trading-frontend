import { api } from './api';
import type { AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

// Types for inventory management
export interface InventoryItem {
  itemId: number;
  storeId: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  unit?: string;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attributes?: Record<string, unknown>;
  allowOffers: boolean;
  minOfferPrice?: number;
  productVersion: number;
  versionHash?: string;
  lastMajorChange?: string;
  categoryId?: number;
  isLowStock?: boolean;
  isOutOfStock?: boolean;
  isInStock?: boolean;
  hasCost?: boolean;
  acceptsOffers?: boolean;
  statusDisplay?: string;
  stockStatusDisplay?: string;
}

export interface InventoryImage {
  imageId: number;
  itemId: number;
  storageProvider: 's3' | 'gcs' | 'azure' | 'local';
  bucketName: string;
  objectKey: string;
  region?: string;
  originalUrl: string;
  thumbnailKey?: string;
  mediumSizeKey?: string;
  largeSizeKey?: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  widthPixels?: number;
  heightPixels?: number;
  aspectRatio?: number;
  colorProfile?: string;
  dpi?: number;
  hasTransparency: boolean;
  versionUuid: string;
  previousVersionId?: number;
  isCurrentVersion: boolean;
  uploadedAt: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string;
  caption?: string;
  uploadedBy?: number;
  approvedBy?: number;
  approvedAt?: string;
}

export interface CreateInventoryItemRequest {
  storeId: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  unit?: string;
  minStockLevel?: number;
  categoryId?: number;
  isActive?: boolean;
  attributes?: Record<string, unknown>;
}

export interface UpdateInventoryItemRequest
  extends Partial<CreateInventoryItemRequest> {
  itemId: number;
}

export interface InventoryFilters {
  storeId?: number;
  categoryId?: number;
  isActive?: boolean;
  lowStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  allowOffers?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ImageUploadRequest {
  itemId: number;
  image: File;
  isPrimary?: boolean;
  altText?: string;
  caption?: string;
  displayOrder?: number;
}

export interface ImageUpdateRequest {
  altText?: string;
  caption?: string;
  isPrimary?: boolean;
  displayOrder?: number;
}

export interface BulkInventoryOperation {
  operation:
    | 'activate'
    | 'deactivate'
    | 'delete'
    | 'update_price'
    | 'update_quantity';
  itemIds: number[];
  data?: Record<string, unknown>;
}

class InventoryApiService {
  private baseURL = '/api/inventory';

  // Utility to map PascalCase backend response to camelCase frontend interface
  private mapInventoryItem(
    backendItem: Record<string, unknown>
  ): InventoryItem {
    return {
      itemId: (backendItem.ItemId || backendItem.itemId) as number,
      storeId: (backendItem.StoreId || backendItem.storeId) as number,
      sku: (backendItem.Sku || backendItem.sku) as string,
      name: (backendItem.Name || backendItem.name) as string,
      description: (backendItem.Description || backendItem.description) as
        | string
        | undefined,
      price: (backendItem.Price || backendItem.price) as number,
      cost: (backendItem.Cost || backendItem.cost) as number | undefined,
      quantity: (backendItem.Quantity || backendItem.quantity) as number,
      minStockLevel: (backendItem.MinStockLevel ||
        backendItem.minStockLevel) as number,
      isActive:
        backendItem.IsActive !== undefined
          ? (backendItem.IsActive as boolean)
          : ((backendItem.isActive as boolean) ?? false),
      createdAt: (backendItem.CreatedAt || backendItem.createdAt) as string,
      updatedAt: (backendItem.UpdatedAt || backendItem.updatedAt) as string,
      attributes: (backendItem.Attributes || backendItem.attributes) as
        | Record<string, unknown>
        | undefined,
      allowOffers:
        backendItem.AllowOffers !== undefined
          ? (backendItem.AllowOffers as boolean)
          : (backendItem.allowOffers as boolean | undefined),
      minOfferPrice: (backendItem.MinOfferPrice ||
        backendItem.minOfferPrice) as number | undefined,
      productVersion: (backendItem.ProductVersion ||
        backendItem.productVersion) as number,
      versionHash: (backendItem.VersionHash || backendItem.versionHash) as
        | string
        | undefined,
      lastMajorChange: (backendItem.LastMajorChange ||
        backendItem.lastMajorChange) as string | undefined,
      categoryId: (backendItem.CategoryId || backendItem.categoryId) as
        | number
        | undefined,
      isLowStock:
        backendItem.IsLowStock !== undefined
          ? (backendItem.IsLowStock as boolean)
          : (backendItem.isLowStock as boolean | undefined),
      isOutOfStock:
        backendItem.IsOutOfStock !== undefined
          ? (backendItem.IsOutOfStock as boolean)
          : (backendItem.isOutOfStock as boolean | undefined),
      isInStock:
        backendItem.IsInStock !== undefined
          ? (backendItem.IsInStock as boolean)
          : (backendItem.isInStock as boolean | undefined),
      hasCost:
        backendItem.HasCost !== undefined
          ? (backendItem.HasCost as boolean)
          : (backendItem.hasCost as boolean | undefined),
      acceptsOffers:
        backendItem.AcceptsOffers !== undefined
          ? (backendItem.AcceptsOffers as boolean)
          : (backendItem.acceptsOffers as boolean | undefined),
      statusDisplay: (backendItem.StatusDisplay ||
        backendItem.statusDisplay) as string | undefined,
      stockStatusDisplay: (backendItem.StockStatusDisplay ||
        backendItem.stockStatusDisplay) as string | undefined,
    };
  }

  // Utility to map PascalCase backend image response to camelCase frontend interface
  private mapInventoryImage(
    backendImage: Record<string, unknown>
  ): InventoryImage {
    return {
      imageId: (backendImage.ImageId || backendImage.imageId) as number,
      itemId: (backendImage.ItemId || backendImage.itemId) as number,
      storageProvider: (backendImage.StorageProvider ||
        backendImage.storageProvider) as 's3' | 'gcs' | 'azure' | 'local',
      bucketName: (backendImage.BucketName ||
        backendImage.bucketName) as string,
      objectKey: (backendImage.ObjectKey || backendImage.objectKey) as string,
      region: (backendImage.Region || backendImage.region) as
        | string
        | undefined,
      originalUrl: (backendImage.OriginalUrl ||
        backendImage.originalUrl) as string,
      thumbnailKey: (backendImage.ThumbnailKey || backendImage.thumbnailKey) as
        | string
        | undefined,
      mediumSizeKey: (backendImage.MediumSizeKey ||
        backendImage.mediumSizeKey) as string | undefined,
      largeSizeKey: (backendImage.LargeSizeKey || backendImage.largeSizeKey) as
        | string
        | undefined,
      fileName: (backendImage.FileName || backendImage.fileName) as string,
      fileSizeBytes: (backendImage.FileSizeBytes ||
        backendImage.fileSizeBytes) as number,
      mimeType: (backendImage.MimeType || backendImage.mimeType) as string,
      widthPixels: (backendImage.WidthPixels || backendImage.widthPixels) as
        | number
        | undefined,
      heightPixels: (backendImage.HeightPixels || backendImage.heightPixels) as
        | number
        | undefined,
      aspectRatio: (backendImage.AspectRatio || backendImage.aspectRatio) as
        | number
        | undefined,
      colorProfile: (backendImage.ColorProfile || backendImage.colorProfile) as
        | string
        | undefined,
      dpi: (backendImage.Dpi || backendImage.dpi) as number | undefined,
      hasTransparency: (backendImage.HasTransparency !== undefined
        ? backendImage.HasTransparency
        : backendImage.hasTransparency) as boolean,
      versionUuid: (backendImage.VersionUuid ||
        backendImage.versionUuid) as string,
      previousVersionId: (backendImage.PreviousVersionId ||
        backendImage.previousVersionId) as number | undefined,
      isCurrentVersion: (backendImage.IsCurrentVersion !== undefined
        ? backendImage.IsCurrentVersion
        : backendImage.isCurrentVersion) as boolean,
      uploadedAt: (backendImage.UploadedAt ||
        backendImage.uploadedAt) as string,
      isPrimary: (backendImage.IsPrimary !== undefined
        ? backendImage.IsPrimary
        : backendImage.isPrimary) as boolean,
      displayOrder: (backendImage.DisplayOrder ||
        backendImage.displayOrder) as number,
      altText: (backendImage.AltText || backendImage.altText) as
        | string
        | undefined,
      caption: (backendImage.Caption || backendImage.caption) as
        | string
        | undefined,
      uploadedBy: (backendImage.UploadedBy || backendImage.uploadedBy) as
        | number
        | undefined,
      approvedBy: (backendImage.ApprovedBy || backendImage.approvedBy) as
        | number
        | undefined,
      approvedAt: (backendImage.ApprovedAt || backendImage.approvedAt) as
        | string
        | undefined,
    };
  }

  // Inventory Items Management
  async getInventoryItems(
    filters: InventoryFilters = {}
  ): Promise<PaginatedResponse<InventoryItem>> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]: [string, any]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const fullUrl = `${this.baseURL}?${params.toString()}`;
    console.log('🔍 DEBUG - getInventoryItems - filters:', filters);
    console.log('🔍 DEBUG - getInventoryItems - params:', params.toString());
    console.log('🔍 DEBUG - getInventoryItems - full URL:', fullUrl);

    const response: AxiosResponse<PaginatedResponse<InventoryItem>> =
      await api.get(fullUrl);

    // Handle both wrapped response {data: [...]} and direct array [...]
    let itemsArray: any[] = [];
    let paginationInfo: any = null;

    if (Array.isArray(response.data)) {
      // Direct array response
      itemsArray = response.data;
      paginationInfo = {
        currentPage: 1,
        totalPages: 1,
        pageSize: itemsArray.length,
        totalItems: itemsArray.length,
        hasNext: false,
        hasPrevious: false,
      };
    } else if (response.data.data && Array.isArray(response.data.data)) {
      // Wrapped response
      itemsArray = response.data.data;
      paginationInfo = response.data.pagination;
    } else {
      return {
        success: false,
        data: [],
        message: 'No items found',
        timestamp: new Date().toISOString(),
        pagination: {
          currentPage: 1,
          totalPages: 1,
          pageSize: 0,
          totalItems: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }

    // Map the items to handle case conversion
    const mappedItems = itemsArray.map((item: any) =>
      this.mapInventoryItem(item)
    );

    const mappedData = {
      success: true,
      data: mappedItems,
      pagination: paginationInfo,
      message: 'Inventory items retrieved successfully',
      timestamp: new Date().toISOString(),
    };

    return mappedData;
  }

  async getInventoryItem(
    itemId: number
  ): Promise<ApiResponse<InventoryItem & { images: InventoryImage[] }>> {
    const response: AxiosResponse<
      ApiResponse<InventoryItem & { images: InventoryImage[] }>
    > = await api.get(`${this.baseURL}/${itemId}`);

    // Map the single item response
    const mappedResponse = {
      ...response.data,
      data: {
        ...this.mapInventoryItem(response.data.data as Record<string, unknown>),
        images: response.data.data.images || [],
      },
    };

    return mappedResponse;
  }

  async createInventoryItem(
    data: CreateInventoryItemRequest
  ): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
      await api.post(this.baseURL, data);
    return response.data as any;
  }

  async updateInventoryItem(
    itemId: number,
    data: Partial<UpdateInventoryItemRequest>
  ): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await api.put(
      `${this.baseURL}/${itemId}`,
      data
    );
    return response.data;
  }

  async deleteInventoryItem(itemId: number): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `${this.baseURL}/${itemId}`
    );
    return response.data;
  }

  async bulkInventoryOperation(
    operation: BulkInventoryOperation
  ): Promise<ApiResponse<{ affected_count: number }>> {
    const response: AxiosResponse<ApiResponse<{ affected_count: number }>> =
      await api.post(`${this.baseURL}/bulk`, operation);
    return response.data;
  }

  // Inventory Images Management
  async getInventoryImages(
    itemId: number
  ): Promise<ApiResponse<InventoryImage[]>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>[]>> =
      await api.get(`${this.baseURL}/${itemId}/images`);

    console.log('🔍 DEBUG - getInventoryImages - Raw response:', response.data);
    console.log(
      '🔍 DEBUG - getInventoryImages - Response status:',
      response.status
    );
    console.log(
      '🔍 DEBUG - getInventoryImages - Response data type:',
      typeof response.data
    );
    console.log(
      '🔍 DEBUG - getInventoryImages - Response data keys:',
      Object.keys(response.data)
    );

    // Check if response has expected format
    if (response.data.data !== undefined) {
      console.log(
        '🔍 DEBUG - getInventoryImages - Found data property:',
        response.data.data
      );
      console.log(
        '🔍 DEBUG - getInventoryImages - Data array length:',
        response.data.data?.length || 0
      );
    } else {
      console.log(
        '🔍 DEBUG - getInventoryImages - No data property, checking if response is array:',
        Array.isArray(response.data)
      );
    }

    // Handle both ApiResponse format and direct array format
    let imageArray;
    if (response.data.data !== undefined) {
      // Standard ApiResponse format: { success, data: [...], message }
      imageArray = response.data.data || [];
      console.log(
        '🔍 DEBUG - getInventoryImages - Using ApiResponse format, found',
        imageArray.length,
        'images'
      );
    } else if (Array.isArray(response.data)) {
      // Direct array format: [image1, image2, ...]
      imageArray = response.data;
      console.log(
        '🔍 DEBUG - getInventoryImages - Using direct array format, found',
        imageArray.length,
        'images'
      );
    } else {
      // Unknown format
      console.log(
        '🔍 DEBUG - getInventoryImages - Unknown response format, defaulting to empty array'
      );
      imageArray = [];
    }

    // Map backend PascalCase response to frontend camelCase interface
    const mappedData = imageArray.map((image: Record<string, unknown>) =>
      this.mapInventoryImage(image)
    );

    console.log(
      '🔍 DEBUG - getInventoryImages - Mapped',
      mappedData.length,
      'images'
    );

    return {
      success: true,
      data: mappedData,
      message: 'Images retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  async getInventoryImage(
    itemId: number,
    imageId: number
  ): Promise<ApiResponse<InventoryImage>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
      await api.get(`${this.baseURL}/${itemId}/images/${imageId}`);

    // Map backend PascalCase response to frontend camelCase interface
    const mappedData = response.data.data
      ? this.mapInventoryImage(response.data.data)
      : undefined;

    return {
      ...response.data,
      data: mappedData as InventoryImage,
    };
  }

  async uploadInventoryImage(
    data: ImageUploadRequest
  ): Promise<ApiResponse<InventoryImage>> {
    console.log('🔍 DEBUG - uploadInventoryImage - Starting upload:', {
      itemId: data.itemId,
      fileName: data.image.name,
      fileSize: data.image.size,
      isPrimary: data.isPrimary,
      displayOrder: data.displayOrder,
    });

    const formData = new FormData();
    formData.append('Image', data.image);

    if (data.isPrimary !== undefined) {
      formData.append('IsPrimary', data.isPrimary.toString());
    }
    if (data.altText) {
      formData.append('AltText', data.altText);
    }
    if (data.caption) {
      formData.append('Caption', data.caption);
    }
    if (data.displayOrder !== undefined) {
      formData.append('DisplayOrder', data.displayOrder.toString());
    }

    console.log('🔍 DEBUG - FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const uploadUrl = `${this.baseURL}/${data.itemId}/images`;
    console.log('🔍 DEBUG - Upload URL:', uploadUrl);

    try {
      const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
        await api.post(uploadUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            // This can be used to track upload progress
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              console.log(`Upload Progress: ${percentCompleted}%`);
            }
          },
        });

      console.log('🔍 DEBUG - Upload response status:', response.status);
      console.log('🔍 DEBUG - Upload response headers:', response.headers);

      console.log(
        '🔍 DEBUG - uploadInventoryImage - Raw response:',
        response.data
      );

      // Handle both ApiResponse format and raw image data format
      let finalResponse;

      if (response.data.success !== undefined) {
        // Standard ApiResponse format: { success, data, message, timestamp }
        console.log('🔍 DEBUG - Using standard ApiResponse format');
        console.log(
          '🔍 DEBUG - uploadInventoryImage - Response data:',
          response.data.data
        );
        console.log(
          '🔍 DEBUG - uploadInventoryImage - Response success:',
          response.data.success
        );

        const mappedData = response.data.data
          ? this.mapInventoryImage(response.data.data)
          : undefined;

        finalResponse = {
          ...response.data,
          data: mappedData as InventoryImage,
        };
      } else {
        // Raw image data format (backend returning image data directly)
        console.log(
          '🔍 DEBUG - Backend returned raw image data, wrapping in ApiResponse format'
        );

        const mappedData = this.mapInventoryImage(response.data);

        finalResponse = {
          success: true,
          data: mappedData,
          message: 'Image uploaded successfully',
          timestamp: new Date().toISOString(),
        };
      }

      console.log(
        '🔍 DEBUG - uploadInventoryImage - Mapped data:',
        finalResponse.data
      );
      console.log(
        '🔍 DEBUG - uploadInventoryImage - Final response:',
        finalResponse
      );
      console.log(
        '🔍 DEBUG - uploadInventoryImage - Final response success:',
        finalResponse.success
      );

      return finalResponse;
    } catch (error: any) {
      console.error('🔍 DEBUG - Upload error:', error);
      console.error('🔍 DEBUG - Upload error response:', error.response?.data);
      console.error('🔍 DEBUG - Upload error status:', error.response?.status);

      // Return error response in expected format
      return {
        success: false,
        data: {} as InventoryImage,
        message:
          error.response?.data?.message || error.message || 'Upload failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateInventoryImage(
    itemId: number,
    imageId: number,
    data: ImageUpdateRequest
  ): Promise<ApiResponse<InventoryImage>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
      await api.put(`${this.baseURL}/${itemId}/images/${imageId}`, data);

    // Map backend PascalCase response to frontend camelCase interface
    const mappedData = response.data.data
      ? this.mapInventoryImage(response.data.data)
      : undefined;

    return {
      ...response.data,
      data: mappedData as InventoryImage,
    };
  }

  async deleteInventoryImage(
    itemId: number,
    imageId: number
  ): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(
      `${this.baseURL}/${itemId}/images/${imageId}`
    );
    return response.data;
  }

  async reorderInventoryImages(
    itemId: number,
    imageOrders: { imageId: number; displayOrder: number }[]
  ): Promise<ApiResponse<InventoryImage[]>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>[]>> =
      await api.put(`${this.baseURL}/${itemId}/images/reorder`, {
        imageOrders: imageOrders,
      });

    // Map backend PascalCase response to frontend camelCase interface
    const mappedData =
      response.data.data?.map((image: Record<string, unknown>) =>
        this.mapInventoryImage(image)
      ) || [];

    return {
      ...response.data,
      data: mappedData,
    };
  }

  async setPrimaryImage(
    itemId: number,
    imageId: number
  ): Promise<ApiResponse<InventoryImage>> {
    const response: AxiosResponse<ApiResponse<Record<string, unknown>>> =
      await api.put(`${this.baseURL}/${itemId}/images/${imageId}/primary`);

    // Map backend PascalCase response to frontend camelCase interface
    const mappedData = response.data.data
      ? this.mapInventoryImage(response.data.data)
      : undefined;

    return {
      ...response.data,
      data: mappedData as InventoryImage,
    };
  }

  // Inventory Analytics
  async getInventoryStats(storeId: number): Promise<
    ApiResponse<{
      total_items: number;
      active_items: number;
      low_stock_items: number;
      out_of_stock_items: number;
      total_value: number;
      categories_count: number;
      recent_additions: number;
      items_with_images: number;
    }>
  > {
    const response: AxiosResponse<
      ApiResponse<{
        total_items: number;
        active_items: number;
        low_stock_items: number;
        out_of_stock_items: number;
        total_value: number;
        categories_count: number;
        recent_additions: number;
        items_with_images: number;
      }>
    > = await api.get(`${this.baseURL}/stats?store_id=${storeId}`);

    console.log('🔍 DEBUG - getInventoryStats - raw response:', response.data);

    // Map the stats response to handle potential case conversion
    const mappedStats = {
      ...response.data,
      data: {
        total_items:
          response.data.data.total_items !== undefined
            ? response.data.data.total_items
            : (response.data.data as any).TotalItems || 0,
        active_items:
          response.data.data.active_items !== undefined
            ? response.data.data.active_items
            : (response.data.data as any).ActiveItems || 0,
        low_stock_items:
          response.data.data.low_stock_items !== undefined
            ? response.data.data.low_stock_items
            : (response.data.data as any).LowStockItems || 0,
        out_of_stock_items:
          response.data.data.out_of_stock_items !== undefined
            ? response.data.data.out_of_stock_items
            : (response.data.data as any).OutOfStockItems || 0,
        total_value:
          response.data.data.total_value !== undefined
            ? response.data.data.total_value
            : (response.data.data as any).TotalValue || 0,
        categories_count:
          response.data.data.categories_count !== undefined
            ? response.data.data.categories_count
            : (response.data.data as any).CategoriesCount || 0,
        recent_additions:
          response.data.data.recent_additions !== undefined
            ? response.data.data.recent_additions
            : (response.data.data as any).RecentAdditions || 0,
        items_with_images:
          response.data.data.items_with_images !== undefined
            ? response.data.data.items_with_images
            : (response.data.data as any).ItemsWithImages || 0,
      },
    };

    console.log('🔍 DEBUG - After stats mapping:', mappedStats.data);
    return mappedStats;
  }

  async getLowStockItems(
    storeId: number,
    limit = 10
  ): Promise<ApiResponse<InventoryItem[]>> {
    const response: AxiosResponse<ApiResponse<InventoryItem[]>> = await api.get(
      `${this.baseURL}/low-stock?store_id=${storeId}&limit=${limit}`
    );
    return response.data;
  }

  async getPopularItems(
    storeId: number,
    days = 30,
    limit = 10
  ): Promise<ApiResponse<InventoryItem[]>> {
    const response: AxiosResponse<ApiResponse<InventoryItem[]>> = await api.get(
      `${this.baseURL}/popular?store_id=${storeId}&days=${days}&limit=${limit}`
    );
    return response.data;
  }

  // Inventory Search and Suggestions
  async searchInventory(
    query: string,
    storeId?: number,
    limit = 20
  ): Promise<ApiResponse<InventoryItem[]>> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    if (storeId) {
      params.append('storeId', storeId.toString());
    }

    const response: AxiosResponse<ApiResponse<InventoryItem[]>> = await api.get(
      `${this.baseURL}/search?${params.toString()}`
    );
    return response.data;
  }

  async getInventorySuggestions(
    partial: string,
    storeId?: number,
    limit = 10
  ): Promise<ApiResponse<string[]>> {
    const params = new URLSearchParams({
      partial,
      limit: limit.toString(),
    });

    if (storeId) {
      params.append('storeId', storeId.toString());
    }

    const response: AxiosResponse<ApiResponse<string[]>> = await api.get(
      `${this.baseURL}/suggestions?${params.toString()}`
    );
    return response.data;
  }

  // Inventory Export/Import
  async exportInventory(
    storeId: number,
    format: 'csv' | 'json' | 'xlsx' = 'csv'
  ): Promise<Blob> {
    const response = await api.get(`${this.baseURL}/export`, {
      params: { storeId: storeId, format },
      responseType: 'blob',
    });
    return response.data;
  }

  async importInventory(
    storeId: number,
    file: File,
    options: {
      update_existing?: boolean;
      skip_duplicates?: boolean;
      validate_only?: boolean;
    } = {}
  ): Promise<
    ApiResponse<{
      imported_count: number;
      updated_count: number;
      skipped_count: number;
      errors: Array<{ row: number; error: string; data: unknown }>;
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('storeId', storeId.toString());

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    const response: AxiosResponse<
      ApiResponse<{
        imported_count: number;
        updated_count: number;
        skipped_count: number;
        errors: Array<{ row: number; error: string; data: unknown }>;
      }>
    > = await api.post(`${this.baseURL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Inventory Categories
  async getInventoryCategories(storeId?: number): Promise<
    ApiResponse<
      Array<{
        category_id: number;
        name: string;
        description?: string;
        items_count: number;
      }>
    >
  > {
    const params = storeId ? `?storeId=${storeId}` : '';
    const response: AxiosResponse<
      ApiResponse<
        Array<{
          category_id: number;
          name: string;
          description?: string;
          items_count: number;
        }>
      >
    > = await api.get(`${this.baseURL}/categories${params}`);
    return response.data;
  }

  // SKU Management
  async checkSkuAvailability(
    storeId: number,
    sku: string,
    excludeItemId?: number
  ): Promise<ApiResponse<{ available: boolean }>> {
    const params = new URLSearchParams({
      storeId: storeId.toString(),
      sku,
    });

    if (excludeItemId) {
      params.append('excludeItemId', excludeItemId.toString());
    }

    const response: AxiosResponse<ApiResponse<{ available: boolean }>> =
      await api.get(`${this.baseURL}/check-sku?${params.toString()}`);
    return response.data;
  }

  async generateSku(
    storeId: number,
    name: string,
    categoryId?: number
  ): Promise<ApiResponse<{ suggested_sku: string }>> {
    const params = new URLSearchParams({
      storeId: storeId.toString(),
      name,
    });

    if (categoryId) {
      params.append('categoryId', categoryId.toString());
    }

    const response: AxiosResponse<ApiResponse<{ suggested_sku: string }>> =
      await api.get(`${this.baseURL}/generate-sku?${params.toString()}`);
    return response.data;
  }
}

export default new InventoryApiService();
