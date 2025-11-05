// Profile Picture Cache Service
// Prevents multiple API calls and handles rate limiting

interface CachedProfilePicture {
  profilePictureUrl: string | null;
  hasProfilePicture: boolean;
  timestamp: number;
  loading: boolean;
}

interface ProfilePictureRequest {
  userId: string;
  promise: Promise<CachedProfilePicture>;
}

class ProfilePictureCacheService {
  private cache: Map<string, CachedProfilePicture> = new Map();
  private activeRequests: Map<string, ProfilePictureRequest> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get profile picture with caching and deduplication
   */
  async getProfilePicture(
    userId: string,
    apiCall: () => Promise<{
      profilePictureUrl: string | null;
      hasProfilePicture: boolean;
    }>
  ): Promise<CachedProfilePicture> {
    const userIdStr = userId.toString();

    // Check if we have a fresh cached result
    const cached = this.cache.get(userIdStr);
    if (cached && this.isCacheValid(cached) && !cached.loading) {
      return cached;
    }

    // Check if there's already an active request for this user
    const activeRequest = this.activeRequests.get(userIdStr);
    if (activeRequest) {
      return activeRequest.promise;
    }

    // Create new request
    const promise = this.makeRequest(userIdStr, apiCall);
    this.activeRequests.set(userIdStr, { userId: userIdStr, promise });

    try {
      const result = await promise;
      return result;
    } finally {
      // Clean up active request
      this.activeRequests.delete(userIdStr);
    }
  }

  /**
   * Make the actual API request with error handling
   */
  private async makeRequest(
    userId: string,
    apiCall: () => Promise<{
      profilePictureUrl: string | null;
      hasProfilePicture: boolean;
    }>
  ): Promise<CachedProfilePicture> {
    // Set loading state
    const loadingEntry: CachedProfilePicture = {
      profilePictureUrl: null,
      hasProfilePicture: false,
      timestamp: Date.now(),
      loading: true,
    };
    this.cache.set(userId, loadingEntry);

    try {
      const result = await apiCall();

      const cacheEntry: CachedProfilePicture = {
        profilePictureUrl: result.profilePictureUrl,
        hasProfilePicture: result.hasProfilePicture,
        timestamp: Date.now(),
        loading: false,
      };

      this.cache.set(userId, cacheEntry);
      return cacheEntry;
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        const fallbackResult = await this.getFallbackResult(userId);

        const cacheEntry: CachedProfilePicture = {
          profilePictureUrl: fallbackResult.profilePictureUrl,
          hasProfilePicture: fallbackResult.hasProfilePicture,
          timestamp: Date.now(),
          loading: false,
        };

        this.cache.set(userId, cacheEntry);
        return cacheEntry;
      }

      // For other errors, cache a null result briefly to prevent immediate retries
      const errorEntry: CachedProfilePicture = {
        profilePictureUrl: null,
        hasProfilePicture: false,
        timestamp: Date.now(),
        loading: false,
      };

      this.cache.set(userId, errorEntry);
      return errorEntry;
    }
  }

  /**
   * Get fallback result from localStorage
   */
  private async getFallbackResult(
    userId: string
  ): Promise<{ profilePictureUrl: string | null; hasProfilePicture: boolean }> {
    try {
      // Try localStorage fallback
      const { getProfilePictureFromStorage } = await import(
        '../utils/profilePictureStorage'
      );
      const localImageData = getProfilePictureFromStorage(userId);

      if (localImageData) {
        return {
          profilePictureUrl: localImageData,
          hasProfilePicture: true,
        };
      }
    } catch (storageError) {
      // Silently handle storage errors
    }

    return {
      profilePictureUrl: null,
      hasProfilePicture: false,
    };
  }

  /**
   * Check if cached entry is still valid
   */
  private isCacheValid(entry: CachedProfilePicture): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Invalidate cache for a specific user (e.g., after upload)
   */
  invalidateUser(userId: string): void {
    const userIdStr = userId.toString();
    this.cache.delete(userIdStr);
    this.activeRequests.delete(userIdStr);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getStats(): {
    cacheSize: number;
    activeRequests: number;
    entries: Array<{
      userId: string;
      hasProfilePicture: boolean;
      age: number;
      loading: boolean;
    }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([userId, entry]) => ({
      userId,
      hasProfilePicture: entry.hasProfilePicture,
      age: Date.now() - entry.timestamp,
      loading: entry.loading,
    }));

    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      entries,
    };
  }

  /**
   * Check if user is currently being loaded
   */
  isLoading(userId: string): boolean {
    const cached = this.cache.get(userId.toString());
    return cached?.loading || this.activeRequests.has(userId.toString());
  }

  /**
   * Get cached result without triggering API call
   */
  getCached(userId: string): CachedProfilePicture | null {
    const cached = this.cache.get(userId.toString());
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    return null;
  }
}

// Export singleton instance
export const profilePictureCache = new ProfilePictureCacheService();

// Export type for consumers
export type { CachedProfilePicture };
