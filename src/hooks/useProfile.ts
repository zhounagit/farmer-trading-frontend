import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { STORAGE_KEYS } from '../utils/api';

export interface ProfileData {
  userId: string;
  profilePictureUrl?: string;
  hasProfilePicture: boolean;
}

interface ProfileState {
  profiles: Record<string, ProfileData>;
  isLoading: boolean;
  error: string | null;
  requestCounts: Record<string, number>; // Track request counts per user to prevent infinite loops
}

interface UseProfileReturn {
  // Profile data access
  getProfile: (userId: string) => ProfileData | undefined;

  // Profile operations
  loadProfile: (userId: string) => Promise<ProfileData | undefined>;
  uploadProfilePicture: (
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
  removeProfilePicture: (userId: string) => Promise<void>;
  clearError: () => void;

  // State
  isLoading: boolean;
  error: string | null;
}

export const useProfile = (): UseProfileReturn => {
  const [state, setState] = useState<ProfileState>({
    profiles: {},
    isLoading: false,
    error: null,
    requestCounts: {},
  });

  // Use refs to track loaded profiles without causing re-renders
  const loadedProfiles = useRef<Set<string>>(new Set());
  const loadingProfiles = useRef<Set<string>>(new Set());

  const getProfile = useCallback(
    (userId: string): ProfileData | undefined => {
      return state.profiles[userId];
    },
    [state.profiles]
  );

  const loadProfile = useCallback(
    async (
      userId: string,
      forceRefresh = false
    ): Promise<ProfileData | undefined> => {
      // Profile loading initiated for user ${userId}

      // If this is not a force refresh and we're currently loading this profile, skip
      // (removed successful loads check to allow profile picture refresh on login)
      if (!forceRefresh && loadingProfiles.current.has(userId)) {
        // Already loading profile for user ${userId}, skipping
        return;
      }

      // Check if we're currently loading this profile (duplicate check removed)
      // This check is now handled above

      // Starting to load profile for user ${userId}

      // Mark as loading to prevent concurrent calls
      loadingProfiles.current.add(userId);

      // Set loading state
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        requestCounts: {
          ...prev.requestCounts,
          [userId]: (prev.requestCounts[userId] || 0) + 1,
        },
      }));

      try {
        // Fetching profile picture
        const profileData = await apiService.getUserProfilePicture(userId);
        // Profile picture API response processed

        // Mark as loaded and remove from loading
        loadedProfiles.current.add(userId);
        loadingProfiles.current.delete(userId);

        // Always create a profile entry to prevent future reloads
        const newProfile = {
          userId,
          profilePictureUrl: profileData?.profilePictureUrl || undefined,
          hasProfilePicture: profileData?.hasProfilePicture || false,
        };

        // Update localStorage if we have a profile picture URL
        if (profileData?.profilePictureUrl) {
          try {
            const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (userData) {
              const user = JSON.parse(userData);
              const updatedUser = {
                ...user,
                profilePictureUrl: profileData.profilePictureUrl,
              };
              localStorage.setItem(
                STORAGE_KEYS.USER_DATA,
                JSON.stringify(updatedUser)
              );
            }
          } catch (error) {
            console.error(
              'Failed to update localStorage with loaded profile picture:',
              error
            );
          }
        }

        setState((prev) => ({
          ...prev,
          profiles: {
            ...prev.profiles,
            [userId]: newProfile,
          },
          isLoading: false,
        }));

        // Return the profile data
        return newProfile;
      } catch (error) {
        console.error(
          `useProfile: Failed to load profile for user ${userId}:`,
          error
        );

        // Mark as loaded to prevent infinite retries
        loadedProfiles.current.add(userId);
        loadingProfiles.current.delete(userId);

        // Even on error, create an empty profile to prevent infinite retries
        const emptyProfile = {
          userId,
          profilePictureUrl: undefined,
          hasProfilePicture: false,
        };

        setState((prev) => ({
          ...prev,
          profiles: {
            ...prev.profiles,
            [userId]: emptyProfile,
          },
          error:
            error instanceof Error ? error.message : 'Failed to load profile',
          isLoading: false,
        }));

        return emptyProfile;
      } finally {
        // Always clean up loading state in case of unexpected errors
        loadingProfiles.current.delete(userId);
      }
    },
    [] // Empty dependencies - refs handle all tracking
  );

  // Clear profile cache when user logs out or changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data' && !e.newValue) {
        // User logged out - clear all caches
        loadedProfiles.current.clear();
        loadingProfiles.current.clear();
        // Cleared all profile caches due to logout
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const uploadProfilePicture = useCallback(
    async (
      userId: string,
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiService.uploadProfilePicture(
          userId,
          file,
          onProgress
        );

        setState((prev) => ({
          ...prev,
          profiles: {
            ...prev.profiles,
            [userId]: {
              userId,
              profilePictureUrl: result.profilePictureUrl,
              hasProfilePicture: true,
            },
          },
          isLoading: false,
        }));

        // Update localStorage to persist the profile picture change
        try {
          const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
          if (userData) {
            const user = JSON.parse(userData);
            const updatedUser = {
              ...user,
              profilePictureUrl: result.profilePictureUrl,
            };
            localStorage.setItem(
              STORAGE_KEYS.USER_DATA,
              JSON.stringify(updatedUser)
            );
            // Profile picture URL saved to localStorage
          }
        } catch (error) {
          console.error(
            'Failed to update localStorage with profile picture:',
            error
          );
        }
      } catch (error) {
        console.warn('Failed to upload profile picture:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to upload profile picture',
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  const removeProfilePicture = useCallback(
    async (userId: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await apiService.delete(`/api/users/${userId}/profile-picture`);

        setState((prev) => ({
          ...prev,
          profiles: {
            ...prev.profiles,
            [userId]: {
              userId,
              profilePictureUrl: undefined,
              hasProfilePicture: false,
            },
          },
          isLoading: false,
        }));

        // Update localStorage to remove the profile picture
        try {
          const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
          if (userData) {
            const user = JSON.parse(userData);
            const updatedUser = {
              ...user,
              profilePictureUrl: undefined,
            };
            localStorage.setItem(
              STORAGE_KEYS.USER_DATA,
              JSON.stringify(updatedUser)
            );
            // Profile picture removed from localStorage
          }
        } catch (error) {
          console.error(
            'Failed to update localStorage after removing profile picture:',
            error
          );
        }
      } catch (error) {
        console.warn('Failed to remove profile picture:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to remove profile picture',
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    getProfile,
    loadProfile,
    uploadProfilePicture,
    removeProfilePicture,
    clearError,
    isLoading: state.isLoading,
    error: state.error,
  };
};

export default useProfile;
