/**
 * User API Service using Shared Contracts
 * Provides type-safe user management operations
 */

import { apiService } from '../../../shared/services/api-service';
import { API_ENDPOINTS } from '../../../shared/types/api-contracts';
import type {
  UserProfile,
  UpdateProfileRequest,
} from '../../../shared/types/api-contracts';

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  timezone: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteStores: number;
  accountAgeDays: number;
  lastActive: string;
}

export interface ReferralInfo {
  myReferralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  referralCredits: number;
  referralLink: string;
}

export class UserApiService {
  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>(API_ENDPOINTS.AUTH.PROFILE);
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: number): Promise<UserProfile> {
    return apiService.get<UserProfile>(`${API_ENDPOINTS.USERS.BASE}/${userId}`);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: number,
    profileData: UpdateProfileRequest
  ): Promise<UserProfile> {
    return apiService.put<UserProfile>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}`,
      profileData
    );
  }

  /**
   * Update current user profile
   */
  async updateCurrentUserProfile(
    profileData: UpdateProfileRequest
  ): Promise<UserProfile> {
    return apiService.put<UserProfile>(API_ENDPOINTS.AUTH.PROFILE, profileData);
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: number): Promise<UserPreferences> {
    return apiService.get<UserPreferences>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/preferences`
    );
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    userId: number,
    preferences: UserPreferences
  ): Promise<UserPreferences> {
    return apiService.put<UserPreferences>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/preferences`,
      preferences
    );
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: number): Promise<UserStats> {
    return apiService.get<UserStats>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/stats`
    );
  }

  /**
   * Get referral information
   */
  async getReferralInfo(userId: number): Promise<ReferralInfo> {
    return apiService.get<ReferralInfo>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/referral-info`
    );
  }

  /**
   * Generate referral code
   */
  async generateReferralCode(
    userId: number
  ): Promise<{ referralCode: string }> {
    return apiService.post<{ referralCode: string }>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/generate-referral-code`
    );
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(
    userId: number,
    file: File
  ): Promise<{ profilePictureUrl: string }> {
    return apiService.uploadFile<{ profilePictureUrl: string }>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/profile-picture`,
      file,
      'file'
    );
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(userId: number): Promise<void> {
    await apiService.delete(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/profile-picture`
    );
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/change-password`,
      { currentPassword, newPassword }
    );
  }

  /**
   * Deactivate user account
   */
  async deactivateAccount(
    userId: number,
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/deactivate`,
      { reason }
    );
  }

  /**
   * Reactivate user account
   */
  async reactivateAccount(
    userId: number
  ): Promise<{ success: boolean; message: string }> {
    return apiService.post<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/reactivate`
    );
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    return apiService.get<{ exists: boolean }>(
      `${API_ENDPOINTS.USERS.BASE}/check-email?email=${encodeURIComponent(email)}`
    );
  }

  /**
   * Get user activity log
   */
  async getUserActivity(
    userId: number,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<UserActivity>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return apiService.get<PaginatedResponse<UserActivity>>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/activity?${params.toString()}`
    );
  }

  /**
   * Search users (admin only)
   */
  async searchUsers(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<UserProfile>> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    return apiService.get<PaginatedResponse<UserProfile>>(
      `${API_ENDPOINTS.USERS.BASE}/search?${params.toString()}`
    );
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: number, role: string): Promise<UserProfile> {
    return apiService.put<UserProfile>(
      `${API_ENDPOINTS.USERS.BASE}/${userId}/role`,
      { role }
    );
  }
}

// Additional types
export interface UserActivity {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Export singleton instance
export const userApiService = new UserApiService();

// Default export for convenience
export default userApiService;
