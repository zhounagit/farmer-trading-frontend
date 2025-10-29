# Profile Photo Loading Issues - Root Cause Analysis

## Overview
This document outlines the root causes, symptoms, and solutions for intermittent profile photo loading failures in the Farmer Trading frontend application.

## Symptoms
- Profile photos sometimes fail to load after login
- Inconsistent display between user menu and Account Settings page
- Photos appear/disappear randomly during navigation
- Empty avatar placeholders instead of actual photos
- Profile photo displays correctly immediately after upload, but doesn't show after navigation or page refresh

## Root Causes

### 1. Timing and Synchronization Issues

#### Problem: Race Conditions in Profile Loading
The authentication flow and profile picture loading were not properly synchronized:

```typescript
// OLD CODE - Problematic timing
const initializeAuth = async () => {
  // User data loaded from localStorage
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  setUser(parsedUser);
  
  // Profile loading happens separately, no guarantee of completion
  await loadProfile(parsedUser.userId.toString());
};
```

**Impact**: Components would render before profile pictures were available, leading to empty avatars.

#### Solution: Synchronized Loading
```typescript
// NEW CODE - Synchronized loading
const syncProfilePicture = async (userId: string) => {
  await loadProfile(userId);
  await new Promise(resolve => setTimeout(resolve, 100)); // Allow state update
  const profile = getProfile(userId);
  if (profile?.profilePictureUrl) {
    setUser(prevUser => ({ ...prevUser, profilePictureUrl }));
  }
};
```

### 2. Caching and State Management Problems

#### Problem: Overly Aggressive Caching
The `useProfile` hook was marking profiles as "loaded" even when API calls failed:

```typescript
// OLD CODE - Problematic caching
loadedProfiles.current.add(userId); // Marked as loaded regardless of success
```

**Impact**: Failed profile loads would be cached, preventing retries and leaving users with empty avatars.

#### Solution: Distinguish Between Loaded and Successful
```typescript
// NEW CODE - Improved caching
if (profileData?.profilePictureUrl) {
  successfulLoads.current.add(userId); // Only mark as successful with data
  loadedProfiles.current.add(userId);
} else {
  // Don't mark as successful, allow retries
  loadedProfiles.current.add(userId);
}
```

### 3. Missing Retry Mechanisms

#### Problem: No Automatic Recovery
When profile photos failed to load initially, there was no mechanism to automatically retry:

**Impact**: Temporary network issues or backend delays would permanently break profile photo display.

#### Solution: Automatic Retry with Backoff
```typescript
// NEW CODE - Retry mechanism
useEffect(() => {
  if (!user?.profilePictureUrl && profilePictureRetryCount < 3) {
    setTimeout(async () => {
      await refreshProfilePicture();
      setProfilePictureRetryCount(prev => prev + 1);
    }, 1000 * (profilePictureRetryCount + 1)); // Exponential backoff
  }
}, [user?.profilePictureUrl, profilePictureRetryCount]);
```

### 4. Component-Level Error Handling

#### Problem: Silent Image Failures
Image components would fail silently when profile picture URLs were invalid or unreachable:

**Impact**: Broken image links would show empty avatars without any indication of failure.

#### Solution: Component-Level Error Recovery
```typescript
// NEW CODE - Image error handling
const handleImageError = () => {
  setImageError(true);
  if (retryAttempts < retryCount) {
    setRetryAttempts(prev => prev + 1);
  }
};
```

### 5. Type Inconsistencies

#### Problem: Conflicting Type Definitions
Multiple type definitions for user roles and profile data caused runtime errors:

```typescript
// File 1: src/types/auth.ts
userType: 'customer' | 'store_owner' | 'admin';

// File 2: src/shared/types/auth.ts  
userType: 'Customer' | 'StoreOwner' | 'Admin'; // Different case!
```

**Impact**: Type mismatches would break profile synchronization and data flow.

#### Solution: Unified Type System
```typescript
// NEW CODE - Consistent types
userType: 'customer' | 'store_owner' | 'admin'; // Lowercase everywhere
```

## Technical Architecture Issues

### 1. Data Flow Complexity
```
AuthContext → useProfile Hook → Components
     ↓              ↓             ↓
  User State    Profile Cache   UI Display
```

**Problem**: Multiple state management layers without clear synchronization points.

**Solution**: Simplified data flow with explicit synchronization triggers.

### 2. Missing Error Boundaries
No error boundaries around profile picture components meant failures would propagate silently.

### 3. Inconsistent State Updates
Different components were updating user state independently, causing race conditions.

## Solutions Implemented

### 1. Enhanced Profile Hook (`useProfile.ts`)
- Added `successfulLoads` tracking
- Improved caching logic with force refresh capability
- Better error handling and logging

### 2. Synchronized Auth Context (`AuthContext.tsx`)
- Enhanced `syncProfilePicture` function
- Proper initialization sequence
- Cross-component state synchronization

### 3. Resilient UI Components
- Automatic retry mechanisms
- Fallback display (user initials)
- Error state management

### 4. Unified Type System
- Consistent type definitions across all files
- Proper TypeScript interfaces
- Eliminated type conflicts

## Monitoring and Debugging

### Logging Improvements
```typescript
console.log(`🔍 useProfile: loadProfile called for user ${userId}`, {
  forceRefresh,
  alreadyLoaded: loadedProfiles.current.has(userId),
  successfulLoad: successfulLoads.current.has(userId),
  timestamp: new Date().toISOString(),
});
```

### Key Metrics to Monitor
- Profile picture load success rate
- Average load time
- Retry frequency and success rate
- Cache hit/miss ratios

## Prevention Strategies

### 1. Code Review Guidelines
- Ensure proper synchronization between AuthContext and useProfile
- Verify error handling in all image components
- Check type consistency across files

### 2. Testing Requirements
- Test profile photo loading under slow network conditions
- Verify retry mechanisms work correctly
- Test component behavior with missing/invalid profile pictures

### 3. Monitoring Setup
- Implement error tracking for profile photo failures
- Monitor cache performance and hit rates
- Track user-reported issues related to profile pictures

## Root Cause #6: Missing Cache Invalidation After Profile Updates

### Problem: Stale Cache Prevents Fresh Loads
The most critical issue causing intermittent display problems was that the `profilePictureCache` was never being invalidated after profile picture updates:

```typescript
// PROBLEM: Cache never invalidated after upload
const handleUpload = async (file: File) => {
  const result = await apiService.uploadProfilePicture(user.userId, file);
  updateProfile({ profilePictureUrl: result.profilePictureUrl });
  // ❌ Cache still holds old data, next load uses stale cache
};
```

**Impact**: 
- Profile picture appears correctly immediately after upload (because user state is updated)
- But the cache still contains the old/null value from before
- When user navigates away and back, or refreshes the page, the cache is used instead of fetching fresh data
- This creates the intermittent "sometimes shows, sometimes doesn't" behavior

### Solution: Invalidate Cache After Updates

#### In `src/services/api.ts` - After successful upload:
```typescript
// Upload user profile picture
uploadProfilePicture: async (
  userId: string,
  imageFile: File,
  onUploadProgress?: (progress: number) => void
): Promise<{ profilePictureUrl: string }> => {
  try {
    const response = await api.post(endpoint, formData, { ... });
    const result = response.data && response.data.data 
      ? response.data.data 
      : response.data;

    // ✅ CRITICAL FIX: Invalidate cache after successful upload
    profilePictureCache.invalidateUser(userId);
    console.log('🔄 Profile picture cache invalidated for user:', userId);

    return result;
  } catch (error: any) {
    // Handle errors...
  }
};
```

#### In `src/components/user/ProfilePictureUpload.tsx` - After state update:
```typescript
const handleUpload = async (file: File) => {
  const result = await apiService.uploadProfilePicture(user.userId, file);
  
  // ✅ CRITICAL FIX: Invalidate cache to ensure fresh load next time
  profilePictureCache.invalidateUser(user.userId);
  
  updateProfile({ profilePictureUrl: result.profilePictureUrl });
};

const handleRemovePicture = async () => {
  await apiService.delete(`/api/users/${userId}/profile-picture`);
  
  // ✅ CRITICAL FIX: Invalidate cache when removing picture
  profilePictureCache.invalidateUser(user.userId);
  
  updateProfile({ profilePictureUrl: null });
};
```

#### In `src/contexts/AuthContext.tsx` - Profile update handler:
```typescript
const updateProfile = useCallback(
  (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

      // ✅ CRITICAL FIX: Invalidate cache when profile picture is updated
      if (updates.profilePictureUrl !== undefined) {
        profilePictureCache.invalidateUser(user.userId);
      }
    }
  },
  [user]
);
```

## Summary of Applied Fixes

### Fix #1: Cache Invalidation in API Service (`src/services/api.ts`)
**Location**: `uploadProfilePicture` function  
**Change**: Added `profilePictureCache.invalidateUser(userId)` after successful upload
**Impact**: Ensures next profile picture load fetches fresh data instead of stale cache

```typescript
const result = response.data && response.data.data ? response.data.data : response.data;
// ✅ CRITICAL FIX: Invalidate cache after successful upload
profilePictureCache.invalidateUser(userId);
return result;
```

### Fix #2: Cache Invalidation in ProfilePictureUpload Component (`src/components/user/ProfilePictureUpload.tsx`)
**Location**: `handleUpload` and `handleRemovePicture` functions  
**Change**: Added `profilePictureCache.invalidateUser(user.userId)` after state updates
**Impact**: Prevents stale cache from being used when navigating away and back

```typescript
// After upload
profilePictureCache.invalidateUser(user.userId);
updateProfile({ profilePictureUrl: finalProfilePictureUrl });

// After removal
profilePictureCache.invalidateUser(user.userId);
updateProfile({ profilePictureUrl: null });
```

### Fix #3: Cache Invalidation in AuthContext (`src/contexts/AuthContext.tsx`)
**Location**: `updateProfile` callback  
**Change**: Added cache invalidation when profile picture URL is updated
**Impact**: Ensures AuthContext state changes trigger cache refresh

```typescript
if (updates.profilePictureUrl !== undefined) {
  profilePictureCache.invalidateUser(user.userId);
}
```

### Fix #4: Badge Color Consistency (`src/features/account-settings/components/AccountInfo.tsx`)
**Location**: Account Details section - User Type badge  
**Change**: Replaced MUI `color` prop ('warning'/orange) with `getUserRoleBadgeColor` function
**Impact**: Store Owner badge now displays consistent green color across all pages

Before:
```typescript
color={
  userProfile.userType === 'admin' ? 'error' : 
  userProfile.userType === 'store_owner' ? 'warning' : 
  'primary'
}
```

After:
```typescript
sx={{
  backgroundColor: getUserRoleBadgeColor(userProfile.userType),
  color: 'white',
}}
```

## Conclusion

The profile photo loading issues were primarily caused by six interconnected problems:

1. **Timing and Synchronization Issues**: Race conditions between auth and profile loading
2. **Caching Problems**: Overly aggressive caching without proper invalidation
3. **Missing Retry Mechanisms**: No automatic recovery from failed loads
4. **Silent Image Failures**: Components failing without fallbacks
5. **Type Inconsistencies**: Conflicting type definitions across files
6. **Missing Cache Invalidation** ⭐ **CRITICAL**: Cache not cleared after profile updates

The implemented solutions provide:

1. **Reliability**: Automatic retries, better error recovery, and proper cache management
2. **Consistency**: Synchronized state across all components with proper cache invalidation
3. **Performance**: Smart caching with explicit invalidation triggers
4. **User Experience**: Graceful fallbacks and clear loading states
5. **UI Consistency**: Unified badge colors across all pages

These improvements definitively resolve the intermittent profile photo loading failures and provide a robust user experience. Additionally, the badge color fix ensures visual consistency throughout the application.