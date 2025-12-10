/**
 * User Address Service
 *
 * Provides user address management operations for registered users.
 * Follows existing service patterns and uses ApiMapper for type conversion.
 */

import { apiService } from '../../../shared/services/api-service';
import { ApiMapper } from '../../../services/api-mapper';

// Frontend types (camelCase)
export interface UserAddress {
  addressId: number;
  userId: number;
  addressType: 'shipping' | 'billing' | 'both';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddressRequest {
  addressType: 'shipping' | 'billing' | 'both';
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}

// Backend types (PascalCase)
interface BackendUserAddress {
  AddressId: number;
  UserId: number;
  AddressType: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
  Email?: string;
  IsPrimary: boolean;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface BackendUserAddressRequest {
  AddressType: string;
  StreetAddress: string;
  City: string;
  State: string;
  ZipCode: string;
  Country: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
  Email?: string;
  IsPrimary?: boolean;
}

export class UserAddressService {
  /**
   * Create a new user address
   */
  async createAddress(
    userId: number,
    addressData: UserAddressRequest
  ): Promise<UserAddress> {
    const backendRequest: BackendUserAddressRequest =
      ApiMapper.toPascalCase(addressData);

    const response = await apiService.post<BackendUserAddress>(
      `/api/users/${userId}/addresses`,
      backendRequest
    );

    return ApiMapper.toCamelCase<UserAddress>(response);
  }

  /**
   * Get user addresses
   */
  async getAddresses(
    userId: number,
    addressType?: 'shipping' | 'billing'
  ): Promise<UserAddress[]> {
    const params = new URLSearchParams();
    if (addressType) {
      params.append('addressType', addressType);
    }

    const response = await apiService.get<BackendUserAddress[]>(
      `/api/users/${userId}/addresses?${params.toString()}`
    );

    return ApiMapper.toCamelCase<UserAddress[]>(response);
  }

  /**
   * Get primary address for user
   */
  async getPrimaryAddress(userId: number): Promise<UserAddress | null> {
    try {
      const response = await apiService.get<BackendUserAddress>(
        `/api/users/${userId}/addresses/primary`
      );
      return ApiMapper.toCamelCase<UserAddress>(response);
    } catch {
      // No primary address found
      return null;
    }
  }

  /**
   * Get address by ID
   */
  async getAddress(userId: number, addressId: number): Promise<UserAddress> {
    const response = await apiService.get<BackendUserAddress>(
      `/api/users/${userId}/addresses/${addressId}`
    );
    return ApiMapper.toCamelCase<UserAddress>(response);
  }

  /**
   * Update user address
   */
  async updateAddress(
    userId: number,
    addressId: number,
    addressData: Partial<UserAddressRequest>
  ): Promise<UserAddress> {
    const backendRequest: Partial<BackendUserAddressRequest> =
      ApiMapper.toPascalCase(addressData);

    const response = await apiService.put<BackendUserAddress>(
      `/api/users/${userId}/addresses/${addressId}`,
      backendRequest
    );

    return ApiMapper.toCamelCase<UserAddress>(response);
  }

  /**
   * Delete user address
   */
  async deleteAddress(userId: number, addressId: number): Promise<void> {
    await apiService.delete(`/api/users/${userId}/addresses/${addressId}`);
  }

  /**
   * Set address as default shipping for user
   */
  async setDefaultShippingAddress(
    userId: number,
    addressId: number
  ): Promise<void> {
    await apiService.post(
      `/api/users/${userId}/addresses/${addressId}/set-default-shipping`
    );
  }

  /**
   * Set address as default billing for user
   */
  async setDefaultBillingAddress(
    userId: number,
    addressId: number
  ): Promise<void> {
    await apiService.post(
      `/api/users/${userId}/addresses/${addressId}/set-default-billing`
    );
  }

  /**
   * Set address as primary for user
   * @deprecated Use setDefaultShippingAddress or setDefaultBillingAddress instead
   */
  async setPrimaryAddress(userId: number, addressId: number): Promise<void> {
    await apiService.put(
      `/api/users/${userId}/addresses/${addressId}/set-primary`
    );
  }

  /**
   * Validate user address
   */
  async validateAddress(
    userId: number,
    addressData: Partial<UserAddressRequest>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const backendRequest = ApiMapper.toPascalCase(addressData);

    try {
      const response = await apiService.post<{
        success: boolean;
        message: string;
        errors?: string[];
      }>(`/api/users/${userId}/addresses/validate`, backendRequest);

      const camelCaseResponse = ApiMapper.toCamelCase<{
        success: boolean;
        message: string;
        errors?: string[];
      }>(response);

      return {
        isValid: camelCaseResponse.success,
        errors: camelCaseResponse.errors || [],
      };
    } catch (error) {
      console.error('validateAddress API call failed:', error);
      return {
        isValid: false,
        errors: ['Unable to validate address. Please try again.'],
      };
    }
  }
}

// Export singleton instance
export const userAddressService = new UserAddressService();

// Default export for convenience
export default userAddressService;
