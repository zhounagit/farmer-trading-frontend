import { useState, useEffect } from 'react';
import { API_CONFIG } from '@/utils/api';
import { ApiMapper } from '@/services/api-mapper';

/**
 * Frontend Types (camelCase)
 */
export interface ProductImage {
  imageUrl: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductCategory {
  categoryId: number;
  categoryName: string;
}

export interface Store {
  storeId: number;
  storeName: string;
}

export interface ApiProduct {
  itemId: number;
  itemName: string;
  productName: string;
  description?: string;
  price: number;
  unitPrice: number;
  unit: string;
  quantity: number;
  isActive: boolean;
  images?: ProductImage[];
  categories?: ProductCategory[];
  store?: Store;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: PaginationInfo;
}

export interface ApiCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

/**
 * Helper function to extract data and pagination from response
 * Handles both PascalCase and camelCase response formats
 */
const parseApiResponse = (response: any) => {
  const success = response?.Success ?? response?.success ?? false;
  const data = response?.Data ?? response?.data ?? [];
  const message = response?.Message ?? response?.message ?? '';
  const pagination = response?.Pagination ?? response?.pagination;

  return { success, data, message, pagination };
};

/**
 * Convert pagination object to frontend format
 */
const mapPagination = (pagination: any): PaginationInfo | null => {
  if (!pagination) return null;

  const mapped = ApiMapper.toCamelCase<PaginationInfo>(pagination);
  return mapped;
};

/**
 * Hook to fetch products by IDs (batch fetch)
 * Used for Featured Products module
 */
export const useProductsByIds = (
  storeId: number | null | undefined,
  productIds: (string | number)[]
) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId || !productIds || productIds.length === 0) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const ids = productIds.join(',');
        const url = `${API_CONFIG.BASE_URL || ''}/api/public/storefronts/stores/${storeId}/products?ids=${ids}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponse = await response.json();
        const { success, data, message } = parseApiResponse(rawResponse);

        if (success) {
          // Use ApiMapper to convert all data to camelCase
          const mappedProducts = ApiMapper.toCamelCase<ApiProduct[]>(
            data || []
          );
          setProducts(mappedProducts);
        } else {
          setError(message || 'Failed to fetch products');
          setProducts([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setProducts([]);
        console.error('Error fetching products by IDs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, productIds]);

  return { products, loading, error };
};

/**
 * Hook to fetch paginated products
 * Used for All Products module
 */
export const useProductsPaginated = (
  storeId: number | null | undefined,
  page: number = 1,
  limit: number = 24
) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setProducts([]);
      setPagination(null);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.BASE_URL || ''}/api/public/storefronts/stores/${storeId}/products/paginated?page=${page}&limit=${limit}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponse = await response.json();
        const {
          success,
          data,
          message,
          pagination: paginationData,
        } = parseApiResponse(rawResponse);

        if (success) {
          // Use ApiMapper to convert all data to camelCase
          const mappedProducts = ApiMapper.toCamelCase<ApiProduct[]>(
            data || []
          );
          setProducts(mappedProducts);
          setPagination(paginationData ? mapPagination(paginationData) : null);
        } else {
          setError(message || 'Failed to fetch products');
          setProducts([]);
          setPagination(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setProducts([]);
        setPagination(null);
        console.error('Error fetching paginated products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId, page, limit]);

  const goToPage = () => {
    // This will trigger the useEffect to fetch new data
    // The caller should use state to manage the page number
  };

  return { products, pagination, loading, error, goToPage };
};

/**
 * Hook to fetch product categories
 * Used for Product Categories module
 */
export const useProductCategories = (storeId: number | null | undefined) => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setCategories([]);
      return;
    }

    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = `${API_CONFIG.BASE_URL || ''}/api/public/storefronts/stores/${storeId}/categories`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponse = await response.json();
        const { success, data, message } = parseApiResponse(rawResponse);

        if (success) {
          // Use ApiMapper to convert all data to camelCase
          const mappedCategories = ApiMapper.toCamelCase<ApiCategory[]>(
            data || []
          );
          setCategories(mappedCategories);
        } else {
          setError(message || 'Failed to fetch categories');
          setCategories([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        setCategories([]);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [storeId]);

  return { categories, loading, error };
};

/**
 * Utility function to map ApiProduct to StorefrontProduct
 * Used by modules to convert to their internal format
 */
export const mapApiProductToStorefrontProduct = (apiProduct: ApiProduct) => {
  const primaryImage = apiProduct.images?.find((img) => img.isPrimary);
  const imageUrl =
    primaryImage?.imageUrl || apiProduct.images?.[0]?.imageUrl || '';

  return {
    productId: apiProduct.itemId,
    itemId: apiProduct.itemId,
    name: apiProduct.productName || apiProduct.itemName,
    description: apiProduct.description,
    price: apiProduct.price,
    currency: 'USD',
    unit: apiProduct.unit,
    imageUrl: imageUrl,
    images: apiProduct.images?.map((img) => img.imageUrl) || [],
    category: apiProduct.categories?.[0]?.categoryName || 'Uncategorized',
    tags: [],
    isOrganic: false,
    isInStock: apiProduct.quantity > 0 && apiProduct.isActive,
    quantityAvailable: apiProduct.quantity,
    isFeatured: false,
    sortOrder: 0,
  };
};
