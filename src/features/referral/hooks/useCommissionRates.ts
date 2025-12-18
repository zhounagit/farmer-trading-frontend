import { useState, useEffect, useCallback } from 'react';
import ReferralCommissionApiService from '../services/commissionApi';
import type { ReferralCommissionRate } from '@/shared/types/api-contracts';

/**
 * Return type for the useCommissionRates hook
 */
export interface UseCommissionRatesReturn {
  commissionRates: ReferralCommissionRate[];
  isLoading: boolean;
  error: Error | null;
  refreshRates: () => Promise<void>;
  directRate: number | null;
  indirectRate: number | null;
  maxRate: number | null;
}

/**
 * Custom hook for fetching and managing referral commission rates
 *
 * @returns {UseCommissionRatesReturn} Hook state and methods
 * @property {ReferralCommissionRate[]} commissionRates - Array of commission rates
 * @property {boolean} isLoading - Loading state
 * @property {Error | null} error - Error state
 * @property {Function} refreshRates - Function to refresh commission rates
 * @property {number | null} directRate - Direct referral commission rate (level 1)
 * @property {number | null} indirectRate - Indirect referral commission rate (level 2)
 * @property {number | null} maxRate - Maximum possible commission rate (sum of direct and indirect)
 */
export const useCommissionRates = (): UseCommissionRatesReturn => {
  const [commissionRates, setCommissionRates] = useState<
    ReferralCommissionRate[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Extract direct (level 1) and indirect (level 2) rates
  const directRate =
    commissionRates.find((rate) => rate.level === 1)?.commissionRate || null;
  const indirectRate =
    commissionRates.find((rate) => rate.level === 2)?.commissionRate || null;
  const maxRate = directRate && indirectRate ? directRate + indirectRate : null;

  /**
   * Fetch commission rates from API
   */
  const fetchCommissionRates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rates =
        await ReferralCommissionApiService.getCommissionRatesWithFallback();
      setCommissionRates(rates);
    } catch (err) {
      console.error('Failed to load commission rates:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load commission rates')
      );
      // Note: getCommissionRatesWithFallback already provides fallback values,
      // so we should still have some rates even if API fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh commission rates
   */
  const refreshRates = useCallback(() => {
    return fetchCommissionRates();
  }, [fetchCommissionRates]);

  // Load commission rates on mount
  useEffect(() => {
    fetchCommissionRates();
  }, [fetchCommissionRates]);

  return {
    commissionRates,
    isLoading,
    error,
    refreshRates,
    directRate,
    indirectRate,
    maxRate,
  };
};

export default useCommissionRates;
