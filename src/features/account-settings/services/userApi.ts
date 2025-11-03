/**
 * User API Service for standardized user management endpoints
 * Handles user profile, addresses, profile pictures, and user-related operations
 */

import { apiService } from '../../shared/services/api-service';
import { API_ENDPOINTS } from '../../shared/types/api-contracts';
import {
  apiTypeConverter,
  normalizeToBackendUserType,
  normalizeToFrontendUserType,
} from '../../utils/typeMapping';
import type {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserPreferences,
  UserProfile,
  SessionInfo,
} from '../../types/auth-standardized';

// Standardized API response types
interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: Array<{
    code?: string;
    message: string;
    field?: string;
  }>;
}

// Backend user profile response
interface BackendUserProfileResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// User address model
interface UserAddress {
  addressId: number;
  userId: number;
  addressType: 'shipping' | 'billing' | 'both';
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class UserApiService {
  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await apiService.get<
        ApiResponse<BackendUserProfileResponse>
      >(API_ENDPOINTS.USERS.BY_ID(parseInt(userId)));

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user profile');
      }

      const backendData = response.data;

      // Convert to frontend format
      return {
        userId: backendData.userId.toString(),
        email: backendData.email,
        firstName: backendData.firstName,
        lastName: backendData.lastName,
        userType: normalizeToFrontendUserType(backendData.userType),
        phone: backendData.phone,
        usedReferralCode: backendData.usedReferralCode,
        myReferralCode: backendData.myReferralCode,
        hasStore: backendData.hasStore,
        profilePictureUrl: backendData.profilePictureUrl,
        isActive: backendData.isActive,
        createdAt: backendData.createdAt,
        updatedAt: backendData.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updates: UpdateProfileRequest
  ): Promise<User> {
    try {
      const response = await apiService.put<
        ApiResponse<BackendUserProfileResponse>
      >(API_ENDPOINTS.USERS.BY_ID(parseInt(userId)), updates);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update user profile');
      }

      const backendData = response.data;

      // Convert to frontend format
      return {
        userId: backendData.userId.toString(),
        email: backendData.email,
        firstName: backendData.firstName,
        lastName: backendData.lastName,
        userType: normalizeToFrontendUserType(backendData.userType),
        phone: backendData.phone,
        usedReferralCode: backendData.usedReferralCode,
        myReferralCode: backendData.myReferralCode,
        hasStore: backendData.hasStore,
        profilePictureUrl: backendData.profilePictureUrl,
        isActive: backendData.isActive,
        createdAt: backendData.createdAt,
        updatedAt: backendData.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user account (admin only)
   */
  static async deleteUser(userId: string): Promise<void> {
    try {
      const response = await apiService.delete<ApiResponse<void>>(
        API_ENDPOINTS.USERS.BY_ID(parseInt(userId))
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all addresses for a user
   */
  static async getUserAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress[]>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user addresses');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get specific address for a user
   */
  static async getUserAddress(
    userId: string,
    addressId: number
  ): Promise<UserAddress> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/${addressId}`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user address');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add a new address for a user
   */
  static async addUserAddress(
    userId: string,
    address: Omit<UserAddress, 'addressId' | 'userId'>
  ): Promise<UserAddress> {
    try {
      const response = await apiService.post<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses`,
        address
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to add user address');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing address for a user
   */
  static async updateUserAddress(
    userId: string,
    addressId: number,
    address: Partial<UserAddress>
  ): Promise<UserAddress> {
    try {
      const response = await apiService.put<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/${addressId}`,
        address
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update user address');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete an address for a user
   */
  static async deleteUserAddress(
    userId: string,
    addressId: number
  ): Promise<void> {
    try {
      const response = await apiService.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/${addressId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user address');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set default shipping address for a user
   */
  static async setDefaultShippingAddress(
    userId: string,
    addressId: number
  ): Promise<void> {
    try {
      const response = await apiService.post<ApiResponse<void>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/${addressId}/set-default-shipping`,
        {}
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to set default shipping address'
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Set default billing address for a user
   */
  static async setDefaultBillingAddress(
    userId: string,
    addressId: number
  ): Promise<void> {
    try {
      const response = await apiService.post<ApiResponse<void>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/${addressId}/set-default-billing`,
        {}
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to set default billing address'
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default shipping address for a user
   */
  static async getDefaultShippingAddress(userId: string): Promise<UserAddress> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/default-shipping`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to get default shipping address'
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get default billing address for a user
   */
  static async getDefaultBillingAddress(userId: string): Promise<UserAddress> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/default-billing`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to get default billing address'
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all shipping addresses for a user
   */
  static async getShippingAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress[]>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/shipping`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get shipping addresses');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all billing addresses for a user
   */
  static async getBillingAddresses(userId: string): Promise<UserAddress[]> {
    try {
      const response = await apiService.get<ApiResponse<UserAddress[]>>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/addresses/billing`
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get billing addresses');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const response = await apiService.get<ApiResponse<UserPreferences>>(
        API_ENDPOINTS.USERS.PREFERENCES(parseInt(userId))
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user preferences');
      }

      return response.data;
    } catch (error: any) {
      // Handle 404 specifically - endpoint doesn't exist yet
      if (error?.response?.status === 404) {
        console.log(
          'Preferences endpoint not implemented, returning default preferences'
        );
        // Return default preferences structure
        return {
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
          },
          privacy: {
            showEmail: false,
            showPhone: false,
            allowMessages: true,
          },
          display: {
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
          },
          referralCredits: {
            handling: 'bank_transfer',
          },
        };
      }
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const response = await apiService.put<ApiResponse<UserPreferences>>(
        API_ENDPOINTS.USERS.PREFERENCES(parseInt(userId)),
        preferences
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to update user preferences'
        );
      }

      return response.data;
    } catch (error: any) {
      // Handle 404 specifically - endpoint doesn't exist yet
      if (error?.response?.status === 404) {
        console.log(
          'Preferences endpoint not implemented, returning mock success'
        );
        // Return mock response with merged preferences
        const defaultPrefs: UserPreferences = {
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
          },
          privacy: {
            showEmail: false,
            showPhone: false,
            allowMessages: true,
          },
          display: {
            theme: 'auto',
            language: 'en',
            timezone: 'UTC',
          },
          referralCredits: {
            handling: 'bank_transfer',
          },
        };
        return { ...defaultPrefs, ...preferences };
      }
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    request: ChangePasswordRequest
  ): Promise<void> {
    try {
      const response = await apiService.post<ApiResponse<void>>(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD(parseInt(userId)),
        request
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user activity
   */
  static async getUserActivity(userId: string): Promise<any[]> {
    try {
      const response = await apiService.get<ApiResponse<any[]>>(
        API_ENDPOINTS.USERS.ACTIVITY(parseInt(userId))
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user activity');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get referral information
   */
  static async getReferralInfo(userId: string): Promise<any> {
    try {
      const response = await apiService.get<any>(
        API_ENDPOINTS.USERS.REFERRAL_INFO(parseInt(userId))
      );

      // The apiService already extracts data from ApiResponse wrapper
      if (!response) {
        throw new Error('Failed to get referral information');
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate referral code for user
   */
  static async generateReferralCode(userId: string): Promise<string> {
    try {
      const response = await apiService.post<{
        userId: number;
        myReferralCode: string;
        email: string;
        firstName: string;
        lastName: string;
      }>(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/generate-referral-code`,
        {}
      );

      if (!response || !response.myReferralCode) {
        throw new Error('Failed to generate referral code');
      }

      return response.myReferralCode;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user stats
   */
  static async getUserStats(userId: string): Promise<any> {
    try {
      const response = await apiService.get<ApiResponse<any>>(
        API_ENDPOINTS.USERS.STATS(parseInt(userId))
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user stats');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(
    userId: string,
    file: File
  ): Promise<{ profilePictureUrl: string }> {
    try {
      const response = await apiService.uploadFile<
        ApiResponse<{ profilePictureUrl: string }>
      >(
        `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/profile-picture`,
        file,
        'file'
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to upload profile picture');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get profile picture information
   */
  static async getProfilePicture(userId: string): Promise<{
    userId: string;
    profilePictureUrl: string;
    hasProfilePicture: boolean;
    message: string;
  }> {
    try {
      const response = await apiService.get<
        ApiResponse<{
          userId: string;
          profilePictureUrl: string;
          hasProfilePicture: boolean;
          message: string;
        }>
      >(`${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/profile-picture`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get profile picture');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export default instance
export default UserApiService;

// Export individual methods for convenience
export const {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserAddresses,
  getUserAddress,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
  getDefaultShippingAddress,
  getDefaultBillingAddress,
  getShippingAddresses,
  getBillingAddresses,
  getUserPreferences,
  updateUserPreferences,
  changePassword,
  uploadProfilePicture,
  getUserActivity,
  getReferralInfo,
  generateReferralCode,
  getUserStats,

  getProfilePicture,
} = UserApiService;
