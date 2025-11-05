import { apiService } from '../../../shared/services/api-service';
import { API_ENDPOINTS } from '../../../shared/types/api-contracts';

export interface ProductCategory {
  categoryId: number;
  name: string;
  description?: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategoryWithCount extends ProductCategory {
  itemCount: number;
}

export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateProductCategoryRequest {
  name: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

class CategoryApiService {
  private readonly baseURL = API_ENDPOINTS.CATEGORIES.BASE;

  // Enhanced logging and error handling
  private logOperation(operation: string, details?: unknown): void {
    console.log(`📂 CategoryAPI: ${operation}`, details || '');
  }

  private logError(operation: string, error: unknown): void {
    console.error(`❌ CategoryAPI: Error in ${operation}:`, error);
  }

  // Get all product categories with enhanced error handling
  async getAllCategories(
    activeOnly: boolean = false
  ): Promise<ProductCategory[]> {
    try {
      this.logOperation('Fetching all categories', { activeOnly });

      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await apiService.get<ProductCategory[]>(
        `${this.baseURL}${params}`
      );

      this.logOperation('Categories fetched successfully', {
        count: response?.length || 0,
        activeOnly,
      });

      return response || [];
    } catch (error: unknown) {
      this.logError('getAllCategories', error);
      // Enhanced fallback with comprehensive error handling
      return [];
    }
  }

  // Get active product categories only with enhanced error handling
  async getActiveCategories(): Promise<ProductCategory[]> {
    try {
      this.logOperation('Fetching active categories only');
      const categories = await this.getAllCategories(true);
      this.logOperation('Active categories fetched successfully', {
        count: categories.length,
      });
      return categories;
    } catch (error: unknown) {
      this.logError('getActiveCategories', error);
      // Enhanced fallback for active categories
      return [];
    }
  }

  // Get product categories with item counts with enhanced error handling
  async getCategoriesWithCounts(): Promise<ProductCategoryWithCount[]> {
    try {
      this.logOperation('Fetching categories with item counts');

      const response = await apiService.get<ProductCategoryWithCount[]>(
        `${this.baseURL}/with-counts`
      );

      this.logOperation('Categories with counts fetched successfully', {
        count: response?.length || 0,
      });

      return response || [];
    } catch (error: unknown) {
      this.logError('getCategoriesWithCounts', error);
      // Enhanced fallback for categories with counts
      return [];
    }
  }

  // Get category by ID with enhanced error handling and fallback mechanisms
  async getCategoryById(categoryId: number): Promise<ProductCategory | null> {
    try {
      this.logOperation('Fetching category by ID', { categoryId });

      const response = await apiService.get<ProductCategory>(
        `${this.baseURL}/${categoryId}`
      );

      this.logOperation('Category fetched successfully by ID', {
        categoryId,
        name: response?.name,
      });

      return response;
    } catch (error: unknown) {
      this.logError('getCategoryById', error);

      // Enhanced error handling with comprehensive status checking
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        this.logOperation('Category not found', { categoryId });
        return null;
      }

      // Enhanced fallback for other errors
      console.warn('⚠️ CategoryAPI: Using fallback for getCategoryById');
      return null;
    }
  }

  // Get category by slug with enhanced error handling and fallback mechanisms
  async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    try {
      this.logOperation('Fetching category by slug', { slug });

      const response = await apiService.get<ProductCategory>(
        `${this.baseURL}/slug/${slug}`
      );

      this.logOperation('Category fetched successfully by slug', {
        slug,
        name: response?.name,
      });

      return response || null;
    } catch (error: unknown) {
      this.logError('getCategoryBySlug', error);

      // Enhanced error handling with comprehensive status checking
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        this.logOperation('Category not found by slug', { slug });
        return null;
      }

      // Enhanced fallback for other errors
      console.warn('⚠️ CategoryAPI: Using fallback for getCategoryBySlug');
      return null;
    }
  }

  // Create new category with enhanced error handling and validation
  async createCategory(
    request: CreateProductCategoryRequest
  ): Promise<ProductCategory> {
    try {
      this.logOperation('Creating new category', {
        name: request.name,
        description: request.description,
      });

      const response = await apiService.post<ProductCategory>(
        this.baseURL,
        request
      );

      this.logOperation('Category created successfully', {
        categoryId: response?.categoryId,
        name: response?.name,
      });

      return response;
    } catch (error: unknown) {
      this.logError('createCategory', error);
      throw error;
    }
  }

  // Update category with enhanced error handling and validation
  async updateCategory(
    categoryId: number,
    request: UpdateProductCategoryRequest
  ): Promise<boolean> {
    try {
      this.logOperation('Updating category', {
        categoryId,
        name: request.name,
      });

      await apiService.put(`${this.baseURL}/${categoryId}`, request);

      this.logOperation('Category updated successfully', {
        categoryId,
        name: request.name,
      });

      return true;
    } catch (error: unknown) {
      this.logError('updateCategory', error);
      throw error;
    }
  }

  // Delete category (soft delete) with enhanced error handling
  async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      this.logOperation('Deleting category', { categoryId });

      await apiService.delete(`${this.baseURL}/${categoryId}`);

      this.logOperation('Category deleted successfully', { categoryId });

      return true;
    } catch (error: unknown) {
      this.logError('deleteCategory', error);
      throw error;
    }
  }

  // Check if category exists with enhanced error handling and fallback
  async categoryExists(categoryId: number): Promise<boolean> {
    try {
      this.logOperation('Checking category existence', { categoryId });

      const response = await apiService.get<{ exists: boolean }>(
        API_ENDPOINTS.CATEGORIES.EXISTS(categoryId)
      );

      const exists = response?.exists || false;
      this.logOperation('Category existence checked', {
        categoryId,
        exists,
      });

      return exists;
    } catch (error: unknown) {
      this.logError('categoryExists', error);
      // Enhanced fallback - assume category doesn't exist on error
      return false;
    }
  }

  // Enhanced helper method to get categories formatted for select dropdown
  async getCategoriesForSelect(): Promise<
    Array<{ value: number; label: string; description?: string }>
  > {
    try {
      this.logOperation('Formatting categories for select dropdown');

      const categories = await this.getActiveCategories();
      const formattedCategories = categories.map((category) => ({
        value: category.categoryId,
        label: category.name,
        description: category.description,
      }));

      this.logOperation('Categories formatted for dropdown successfully', {
        count: formattedCategories.length,
      });

      return formattedCategories;
    } catch (error: unknown) {
      this.logError('getCategoriesForSelect', error);
      // Enhanced fallback with empty array
      return [];
    }
  }
}

// Export singleton instance
const categoryApiService = new CategoryApiService();
export default categoryApiService;

// Export the class for testing or custom instantiation
export { CategoryApiService };
