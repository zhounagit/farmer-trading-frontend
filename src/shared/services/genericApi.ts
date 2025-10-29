import { apiClient } from './apiClient';
import type { ApiResponse } from '../types/api';

export interface ProfilePictureResponse {
  profilePictureUrl?: string;
  hasProfilePicture: boolean;
}

class ApiService {
  /**
   * Get user profile picture information
   * @param userId - The user ID to get profile picture for
   * @returns Profile picture data including URL and status
   */
  async getUserProfilePicture(userId: string): Promise<ProfilePictureResponse> {
    try {
      console.log(`📡 api.ts: Fetching profile picture for user ${userId}`);
      const response = await apiClient.get<
        ApiResponse<{
          ProfilePictureUrl: string;
          UploadedAt: string;
          FileName: string;
        }>
      >(`/api/users/${userId}/profile-picture`);

      console.log(`📡 api.ts: Response received for user ${userId}:`, {
        success: response.success,
        hasData: !!response.data,
        profilePictureUrl: response.data?.ProfilePictureUrl,
        hasProfilePicture: !!(
          response.data?.ProfilePictureUrl &&
          response.data?.ProfilePictureUrl !== ''
        ),
      });

      if (response.success && response.data) {
        return {
          profilePictureUrl: response.data.ProfilePictureUrl,
          hasProfilePicture: !!(
            response.data.ProfilePictureUrl &&
            response.data.ProfilePictureUrl !== ''
          ),
        };
      } else {
        console.log(`⚠️ api.ts: No success or data for user ${userId}`);
        // Return default values if no profile picture
        return {
          hasProfilePicture: false,
        };
      }
    } catch (error: any) {
      console.error(
        `❌ api.ts: Error fetching profile picture for user ${userId}:`,
        error
      );

      // Handle 404 errors gracefully - profile picture endpoint might not be implemented
      if (error.response?.status === 404) {
        console.log(
          `🔄 api.ts: Profile picture endpoint returned 404 for user ${userId}, returning default values`
        );
        return {
          hasProfilePicture: false,
        };
      }

      // Failed to fetch profile picture
      // Return default values on error
      return {
        hasProfilePicture: false,
      };
    }
  }

  /**
   * Upload user profile picture
   * @param userId - The user ID
   * @param file - The image file to upload
   * @param onUploadProgress - Optional callback for upload progress
   * @returns Upload response with new profile picture URL
   */
  async uploadProfilePicture(
    userId: number,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<ProfilePictureResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.upload<
        ApiResponse<{
          success: boolean;
          message: string;
          profilePictureUrl: string;
          updatedAt: string;
        }>
      >(`/api/users/${userId}/profile-picture`, formData, onUploadProgress);

      if (response.success && response.data) {
        return {
          profilePictureUrl: response.data.profilePictureUrl,
          hasProfilePicture: !!(
            response.data.profilePictureUrl &&
            response.data.profilePictureUrl !== ''
          ),
        };
      } else {
        throw new Error(response.message || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      // If the error message contains "Profile picture uploaded successfully",
      // it means the backend succeeded but the API client threw an error
      // due to response structure mismatch. Extract the actual success data.
      if (error.message?.includes('Profile picture uploaded successfully')) {
        // Try to extract the actual response data from the error
        const errorData = error.details?.originalError?.response?.data;
        if (errorData?.data) {
          return {
            profilePictureUrl: errorData.data.profilePictureUrl,
            hasProfilePicture: !!(
              errorData.data.profilePictureUrl &&
              errorData.data.profilePictureUrl !== ''
            ),
          };
        }
      }
      throw error;
    }
  }

  /**
   * Delete user profile picture
   * @returns Success response
   */
  async deleteProfilePicture(userId: number): Promise<void> {
    await apiClient.delete(`/api/users/${userId}/profile-picture`);
  }

  /**
   * Get user by ID
   * @param userId - The user ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<unknown> {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response;
  }

  /**
   * Update user profile
   * @param userId - The user ID
   * @param data - Profile data to update
   * @returns Updated user data
   */
  async updateUserProfile(userId: string, data: unknown): Promise<unknown> {
    const response = await apiClient.put(`/api/users/${userId}`, data);
    return response;
  }

  /**
   * Health check for API
   * @returns Health status
   */
  async healthCheck(): Promise<{ isHealthy: boolean; status?: unknown }> {
    return await apiClient.healthCheck();
  }

  /**
   * Generic GET request
   * @param url - The API endpoint URL
   * @returns Response data
   */
  async get<T>(url: string): Promise<T> {
    const response = await apiClient.get<T>(url);
    return response;
  }

  /**
   * Generic POST request
   * @param url - The API endpoint URL
   * @param data - The request body data
   * @returns Response data
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.post<T>(url, data);
    return response;
  }

  /**
   * Generic PUT request
   * @param url - The API endpoint URL
   * @param data - The request body data
   * @returns Response data
   */
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await apiClient.put<T>(url, data);
    return response;
  }

  /**
   * Generic DELETE request
   * @param url - The API endpoint URL
   * @returns Response data
   */
  async delete<T>(url: string): Promise<T> {
    const response = await apiClient.delete<T>(url);
    return response;
  }
}

export const apiService = new ApiService();

// Default export for convenience
export default apiService;
