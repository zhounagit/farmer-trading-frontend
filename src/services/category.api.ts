import { api } from '../utils/api';

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
  private readonly baseURL = '/api/product-categories';

  // Get all product categories
  async getAllCategories(activeOnly: boolean = false): Promise<ProductCategory[]> {
    try {
      const params = activeOnly ? '?activeOnly=true' : '';
      const response = await api.get(`${this.baseURL}${params}`);
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw error;
    }
  }

  // Get active product categories only
  async getActiveCategories(): Promise<ProductCategory[]> {
    return this.getAllCategories(true);
  }

  // Get product categories with item counts
  async getCategoriesWithCounts(): Promise<ProductCategoryWithCount[]> {
    try {
      const response = await api.get(`${this.baseURL}/with-counts`);
      return response.data || response || [];
    } catch (error) {
      console.error('❌ Failed to fetch categories with counts:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(categoryId: number): Promise<ProductCategory | null> {
    try {
      const response = await api.get(`${this.baseURL}/${categoryId}`);
      return response.data || response || null;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error('❌ Failed to fetch category:', error);
      throw error;
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    try {
      const response = await api.get(`${this.baseURL}/slug/${slug}`);
      return response.data || response || null;
    } catch (error) {
      if ((error as any)?.response?.status === 404) {
        return null;
      }
      console.error('❌ Failed to fetch category by slug:', error);
      throw error;
    }
  }

  // Create new category
  async createCategory(request: CreateProductCategoryRequest): Promise<ProductCategory> {
    try {
      const response = await api.post(this.baseURL, request);
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      throw error;
    }
  }

  // Update category
  async updateCategory(
    categoryId: number,
    request: UpdateProductCategoryRequest
  ): Promise<boolean> {
    try {
      await api.put(`${this.baseURL}/${categoryId}`, request);
      return true;
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      throw error;
    }
  }

  // Delete category (soft delete)
  async deleteCategory(categoryId: number): Promise<boolean> {
    try {
      await api.delete(`${this.baseURL}/${categoryId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      throw error;
    }
  }

  // Check if category exists
  async categoryExists(categoryId: number): Promise<boolean> {
    try {
      const response = await api.get(`${this.baseURL}/${categoryId}/exists`);
      return response.data?.exists || response?.exists || false;
    } catch (error) {
      console.error('❌ Failed to check category existence:', error);
      return false;
    }
  }

  // Helper method to map backend category data to frontend interface
  private mapCategoryData(backendData: any): ProductCategory {
    return {
      categoryId: backendData.categoryId || backendData.CategoryId,
      name: backendData.name || backendData.Name || '',
      description: backendData.description || backendData.Description,
      slug: backendData.slug || backendData.Slug || '',
      sortOrder: backendData.sortOrder || backendData.SortOrder || 0,
      isActive: backendData.isActive !== undefined
        ? backendData.isActive
        : (backendData.IsActive !== undefined ? backendData.IsActive : true),
      createdAt: backendData.createdAt || backendData.CreatedAt || new Date().toISOString(),
      updatedAt: backendData.updatedAt || backendData.UpdatedAt || new Date().toISOString(),
    };
  }

  // Helper method to get categories formatted for select dropdown
  async getCategoriesForSelect(): Promise<Array<{ value: number; label: string; description?: string }>> {
    try {
      const categories = await this.getActiveCategories();
      return categories.map(category => ({
        value: category.categoryId,
        label: category.name,
        description: category.description
      }));
    } catch (error) {
      console.error('❌ Failed to get categories for select:', error);
      return [];
    }
  }
}

// Export singleton instance
const categoryApiService = new CategoryApiService();
export default categoryApiService;

// Export the class for testing or custom instantiation
export { CategoryApiService };
