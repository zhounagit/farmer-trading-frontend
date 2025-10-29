# Profile Picture Infinite Loop Troubleshooting Guide

## Issue Description
The profile picture API endpoint (`/api/users/{userId}/profile-picture`) is being called repeatedly in an infinite loop, causing performance issues, API rate limiting, and degraded user experience.

## Complete Root Cause Analysis

### Primary Root Cause: Header Component Trigger Loop
**Location**: `src/components/layout/Header.tsx`

**Problem**: Multiple useEffect hooks were calling `triggerProfilePictureLoad` with dependencies that created feedback loops:

```typescript
// Problematic code that caused infinite loops:
useEffect(() => {
  if (isAuthenticated && user && triggerProfilePictureLoad) {
    triggerProfilePictureLoad().catch(() => {});
  }
}, [isAuthenticated, user?.userId, triggerProfilePictureLoad]);

useEffect(() => {
  if (isAuthenticated && user) {
    const timer = setTimeout(() => {
      if (triggerProfilePictureLoad) {
        triggerProfilePictureLoad().catch(() => {});
      }
    }, 100);
    return () => clearTimeout(timer);
  }
}, [user?.profilePictureUrl, triggerProfilePictureLoad, isAuthenticated, user]);
```

**Impact**: These effects triggered profile loading on every render cycle when dependencies changed, creating an infinite loop.

### Secondary Root Cause: Stale State in useProfile Hook
**Location**: `src/hooks/useProfile.ts`

**Problem**: The `loadProfile` function was using stale state from React closures:

```typescript
// Problematic - using state from closure
const loadProfile = useCallback(async (userId: string): Promise<void> => {
  const existingProfile = state.profiles[userId]; // Stale state!
  if (existingProfile) {
    return;
  }
  // ... rest of function
}, [state.profiles]); // Dependency causes recreation
```

**Impact**: The function was recreated when state changed, but used outdated state values, causing repeated API calls.

### Tertiary Root Cause: Missing 404 Error Handling
**Location**: `src/services/api.ts`

**Problem**: Backend profile picture endpoints were returning 404 errors, but the frontend didn't handle them gracefully:

```typescript
// Problematic - no 404 handling
async getUserProfilePicture(userId: string): Promise<ProfilePictureResponse> {
  const response = await apiClient.get<ProfilePictureResponse>(
    `/api/users/${userId}/profile-picture`
  );
  return response;
}
```

**Impact**: 404 errors caused the profile to never be marked as loaded, triggering infinite retries.

## Complete Solution Implementation

### Solution 1: Fix Header Component (Critical)
**File**: `src/components/layout/Header.tsx`

**Action**: Remove problematic useEffect hooks that were causing infinite loops:

```typescript
// Remove these useEffect hooks entirely:
// - useEffect with [isAuthenticated, user?.userId, triggerProfilePictureLoad]
// - useEffect with [user?.profilePictureUrl, triggerProfilePictureLoad, isAuthenticated, user]

// Replace with comment:
// Profile picture loading is now handled in AuthContext during login
// Removed useEffects that were causing infinite loops
```

### Solution 2: Implement Proper State Tracking with Refs
**File**: `src/hooks/useProfile.ts`

**Action**: Use React refs for tracking loaded/loading states without causing re-renders:

```typescript
// Use refs to track loaded profiles without causing re-renders
const loadedProfiles = useRef<Set<string>>(new Set());
const loadingProfiles = useRef<Set<string>>(new Set());

const loadProfile = useCallback(async (userId: string): Promise<void> => {
  // Check if already loaded or loading using refs
  if (loadedProfiles.current.has(userId)) {
    console.log(`🔄 useProfile: Already loaded profile for user ${userId}, skipping`);
    return;
  }

  if (loadingProfiles.current.has(userId)) {
    console.log(`🔄 useProfile: Already loading profile for user ${userId}, skipping`);
    return;
  }

  // Mark as loading and proceed with API call
  loadingProfiles.current.add(userId);
  
  try {
    const profileData = await apiService.getUserProfilePicture(userId);
    
    // Mark as loaded on success
    loadedProfiles.current.add(userId);
    loadingProfiles.current.delete(userId);
    
    // Update state with profile data
    // ... state update logic
  } catch (error) {
    // Mark as loaded even on error to prevent infinite retries
    loadedProfiles.current.add(userId);
    loadingProfiles.current.delete(userId);
    
    // Create empty profile to prevent future reloads
    setState(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [userId]: {
          userId,
          profilePictureUrl: undefined,
          hasProfilePicture: false,
        },
      },
    }));
  }
}, []); // Empty dependencies - refs handle all tracking
```

### Solution 3: Add Graceful 404 Error Handling
**File**: `src/services/api.ts`

**Action**: Handle 404 errors gracefully and return default values:

```typescript
async getUserProfilePicture(userId: string): Promise<ProfilePictureResponse> {
  try {
    const response = await apiClient.get<
      ApiResponse<{
        userId: number;
        profilePictureUrl: string;
        hasProfilePicture: boolean;
        message: string;
      }>
    >(`/api/users/${userId}/profile-picture`);

    if (response.success && response.data) {
      return {
        profilePictureUrl: response.data.profilePictureUrl,
        hasProfilePicture: response.data.hasProfilePicture,
      };
    } else {
      return {
        hasProfilePicture: false,
      };
    }
  } catch (error: any) {
    // Handle 404 errors gracefully
    if (error.response?.status === 404) {
      console.log(`🔄 api.ts: Profile picture endpoint returned 404, returning default values`);
      return {
        hasProfilePicture: false,
      };
    }
    
    // Return default values for other errors
    return {
      hasProfilePicture: false,
    };
  }
}
```

### Solution 4: Stabilize AuthContext Dependencies
**File**: `src/contexts/AuthContext.tsx`

**Action**: Use empty dependencies for initialization effects and ensure stable function references:

```typescript
// Use empty dependencies for one-time initialization
useEffect(() => {
  initializeAuth();
}, []); // Empty dependencies - only run once on mount

// Ensure syncProfilePicture has stable dependencies
const syncProfilePicture = useCallback(
  async (userId: string): Promise<void> => {
    // Direct implementation without external dependencies
    try {
      await loadProfile(userId);
      await new Promise((resolve) => setTimeout(resolve, 50));
      const profile = getProfile(userId);
      // ... sync logic
    } catch (error) {
      console.error('Failed to sync profile picture:', error);
    }
  },
  [loadProfile, getProfile] // Only include stable dependencies
);
```

## Prevention Strategies

### 1. Use Refs for Tracking State
Always use refs for tracking loading states and request counts to avoid dependency issues and re-renders.

### 2. Implement Proper Error Boundaries
Handle all possible API response scenarios (200, 404, 500) gracefully with appropriate fallbacks.

### 3. Avoid Complex Dependency Chains
Keep useEffect dependencies simple and avoid including functions that change frequently.

### 4. Add Comprehensive Logging
Include detailed logging in development to track profile loading behavior:

```typescript
console.log(`🔍 useProfile: loadProfile called for user ${userId}`, {
  alreadyLoaded: loadedProfiles.current.has(userId),
  currentlyLoading: loadingProfiles.current.has(userId),
  loadedProfilesList: Array.from(loadedProfiles.current),
  loadingProfilesList: Array.from(loadingProfiles.current),
  timestamp: new Date().toISOString(),
});
```

## Verification Steps

After implementing fixes, verify:

1. **Network Requests**: Only 1-2 profile picture calls per user session
2. **Console Logs**: No repeated "loading profile" messages
3. **Error Handling**: 404 errors are handled gracefully without retries
4. **Performance**: No excessive API calls in network tab

## Expected Behavior

- ✅ Profile loads once after user login
- ✅ 404 errors are handled gracefully
- ✅ No infinite API calls
- ✅ Proper loading state management
- ✅ Stable component behavior across re-renders

## Related Files Modified

- `src/hooks/useProfile.ts` - Core profile management with ref-based tracking
- `src/services/api.ts` - API service with 404 error handling
- `src/contexts/AuthContext.tsx` - Stable dependency management
- `src/components/layout/Header.tsx` - Removed problematic useEffects

This comprehensive solution addresses all root causes of the profile picture infinite loop issue and provides robust prevention strategies for future development.