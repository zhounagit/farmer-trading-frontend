/**
 * Referral API Service
 * Handles all referral-related operations including history, code management, and referrer updates
 */

import { apiService } from '../../../shared/services/api-service';
import { API_ENDPOINTS } from '../../../shared/types/api-contracts';
import type {
  ReferralHistoryItem,
  UpdateReferrerRequest,
  ReferralCodeUsageInfo,
  ReferralInfo,
} from '../../../shared/types/api-contracts';

export class ReferralApiService {
  /**
   * Get referral history for a user (who registered using their code)
   */
  static async getReferralHistory(userId: number): Promise<ReferralHistoryItem[]> {
    try {
      const response = await apiService.get<ReferralHistoryItem[]>(
        API_ENDPOINTS.REFERRAL.HISTORY(userId)
      );

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching referral history:', error);
      return [];
    }
  }

  /**
   * Get referral code usage info for current user (what code they used when registering)
   */
  static async getReferralCodeUsage(userId: number): Promise<ReferralCodeUsageInfo | null> {
    try {
      const response = await apiService.get<ReferralCodeUsageInfo>(
        API_ENDPOINTS.REFERRAL.USAGE_INFO(userId)
      );

      return response || null;
    } catch (error) {
      console.error('Error fetching referral code usage info:', error);
      return null;
    }
  }

  /**
   * Update referrer for a user (admin/user can assign referral code to someone who forgot)
   */
  static async updateReferrer(request: UpdateReferrerRequest): Promise<boolean> {
    try {
      await apiService.post<void>(
        API_ENDPOINTS.REFERRAL.UPDATE_REFERRER,
        request
      );

      return true;
    } catch (error) {
      console.error('Error updating referrer:', error);
      throw error;
    }
  }

  /**
   * Generate sharing links for a referral code
   */
  static generateSharingLinks(referralCode: string) {
    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/register?ref=${referralCode}`;

    return {
      referralUrl,
      emailSubject: encodeURIComponent('Join Farmer Trading with my referral!'),
      emailBody: encodeURIComponent(
        `Hi! I'd like to invite you to join Farmer Trading, a great platform for fresh produce. Use my referral link to get started: ${referralUrl}`
      ),
      smsText: encodeURIComponent(
        `Check out Farmer Trading for fresh produce! Use my referral link: ${referralUrl}`
      ),
      socialText: encodeURIComponent(
        `Join me on Farmer Trading for the best fresh produce! Use my referral link: ${referralUrl}`
      ),
      whatsappText: encodeURIComponent(
        `Hey! Join Farmer Trading with my referral link and discover amazing fresh produce: ${referralUrl}`
      )
    };
  }

  /**
   * Get comprehensive referral data including stats, history, and usage info
   */
  static async getCompleteReferralData(userId: number): Promise<{
    referralInfo: ReferralInfo;
    history: ReferralHistoryItem[];
    usageInfo: ReferralCodeUsageInfo | null;
  }> {
    try {
      const [referralInfoResponse, historyResponse, usageInfoResponse] = await Promise.allSettled([
        apiService.get<ReferralInfo>(API_ENDPOINTS.USERS.REFERRAL_INFO(userId)),
        this.getReferralHistory(userId),
        this.getReferralCodeUsage(userId)
      ]);

      const referralInfo = referralInfoResponse.status === 'fulfilled'
        ? referralInfoResponse.value
        : {
            referralCode: '',
            totalReferrals: 0,
            activeReferrals: 0,
            referralCredits: 0,
            referralLink: ''
          };

      const history = historyResponse.status === 'fulfilled'
        ? historyResponse.value
        : [];

      const usageInfo = usageInfoResponse.status === 'fulfilled'
        ? usageInfoResponse.value
        : null;

      return {
        referralInfo,
        history,
        usageInfo
      };
    } catch (error) {
      console.error('Error fetching complete referral data:', error);
      throw error;
    }
  }

  /**
   * Validate referral code format
   */
  static validateReferralCode(code: string): boolean {
    return /^[A-Z0-9]{6,12}$/.test(code);
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Failed to copy to clipboard:', fallbackError);
        return false;
      }
    }
  }
}

// Export default instance
export default ReferralApiService;

// Export individual methods for convenience
export const {
  getReferralHistory,
  getReferralCodeUsage,
  updateReferrer,
  generateSharingLinks,
  getCompleteReferralData,
  validateReferralCode,
  copyToClipboard,
} = ReferralApiService;
