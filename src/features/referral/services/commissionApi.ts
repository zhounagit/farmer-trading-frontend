/**
 * Referral Commission API Service
 * Handles all commission-related API operations following the established patterns
 */

import { apiService } from '../../../shared/services/api-service';
import { API_ENDPOINTS } from '../../../shared/types/api-contracts';
import type {
  ReferralCommissionRate,
  UpdateReferralCommissionRateRequest,
} from '../../../shared/types/api-contracts';

export class ReferralCommissionApiService {
  /**
   * Get all referral commission rates
   */
  static async getAllReferralCommissionRates(): Promise<
    ReferralCommissionRate[]
  > {
    try {
      const response = await apiService.get<ReferralCommissionRate[]>(
        API_ENDPOINTS.COMMISSION.REFERRAL.RATES
      );

      // The apiService already extracts data from ApiResponse wrapper
      if (!response) {
        throw new Error('Failed to get referral commission rates');
      }

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching referral commission rates:', error);
      throw error;
    }
  }

  /**
   * Get referral commission rate by level
   */
  static async getReferralCommissionRateByLevel(
    level: number
  ): Promise<ReferralCommissionRate | null> {
    try {
      const response = await apiService.get<ReferralCommissionRate>(
        API_ENDPOINTS.COMMISSION.REFERRAL.RATE_BY_LEVEL(level)
      );

      return response || null;
    } catch (error) {
      console.error(
        `Error fetching referral commission rate for level ${level}:`,
        error
      );
      return null;
    }
  }

  /**
   * Update referral commission rate (admin only)
   */
  static async updateReferralCommissionRate(
    request: UpdateReferralCommissionRateRequest
  ): Promise<boolean> {
    try {
      await apiService.put<void>(
        API_ENDPOINTS.COMMISSION.REFERRAL.RATES,
        request
      );

      return true;
    } catch (error) {
      console.error('Error updating referral commission rate:', error);
      throw error;
    }
  }

  /**
   * Get commission rates formatted for display
   * Returns fallback values if API fails
   */
  static async getCommissionRatesWithFallback(): Promise<
    ReferralCommissionRate[]
  > {
    try {
      return await this.getAllReferralCommissionRates();
    } catch (error) {
      console.warn('Using fallback commission rates due to API error:', error);

      // Fallback values matching the current hardcoded rates
      return [
        {
          level: 1,
          commissionRate: 2.0,
          description: 'Standard first-level referral commission',
          updatedAt: new Date().toISOString(),
        },
        {
          level: 2,
          commissionRate: 1.0,
          description: 'Standard second-level referral commission',
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }
}

// Export default instance
export default ReferralCommissionApiService;

// Export individual methods for convenience
export const {
  getAllReferralCommissionRates,
  getReferralCommissionRateByLevel,
  updateReferralCommissionRate,
  getCommissionRatesWithFallback,
} = ReferralCommissionApiService;
