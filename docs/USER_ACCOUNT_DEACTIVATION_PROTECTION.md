# User Account Deactivation Protection System

## Overview

This document describes the user account deactivation protection system implemented in the Farmer Trading platform. The system ensures that users with deactivated accounts (where `isActive` is set to `false`) cannot access protected pages and are automatically logged out.

## Problem Statement

Previously, when a user deleted their account through the Account Settings page, the backend would set the user's `isActive` status to `false` but the frontend would remain logged in. This allowed users to continue accessing protected pages like Dashboard, Account Settings, and other authenticated routes even after their account was technically deactivated.

## Solution Architecture

### 1. Enhanced User Type Definition

The `User` interface in `src/types/auth.ts` was extended to include the `isActive` field:

```typescript
export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'customer' | 'store_owner' | 'admin';
  phone?: string;
  referralCode?: string;
  hasStore?: boolean;
  profilePictureUrl?: string;
  isActive?: boolean; // New field
}
```

### 2. AuthContext Enhancements

The `AuthContext` was updated with several key features:

#### Automatic Inactive User Detection

- **Initialization Check**: During app initialization, if a stored user is found with `isActive: false`, the system automatically logs them out
- **Login/Registration**: New users are assumed to be active (`isActive: true`) by default
- **Profile Refresh**: When user profile data is refreshed, the system checks if the account has been deactivated and triggers auto-logout

#### Enhanced Logout Function

The `logout` function now accepts an optional message parameter to provide context-specific feedback:

```typescript
const logout = async (message?: string) => {
  // ... logout logic
  toast.success(message || 'Logged out successfully');
};
```

#### Updated Authentication Status

The `isAuthenticated` property now considers both user existence AND active status:

```typescript
isAuthenticated: !!user && user.isActive !== false
```

### 3. Route Protection Components

#### ActiveUserGuard Component

A new `ActiveUserGuard` component was created to wrap protected routes:

**Location**: `src/components/auth/ActiveUserGuard.tsx`

**Features**:
- Automatically detects inactive users and logs them out
- Provides a user-friendly deactivation message
- Offers navigation options (Sign In Again, Return to Home)
- Shows loading state during authentication checks

**Usage**:
```typescript
<ActiveUserGuard>
  <ProtectedComponent />
</ActiveUserGuard>
```

#### Enhanced ProtectedRoute Component

The existing `ProtectedRoute` component was updated to include inactive user checks:

**Location**: `src/components/auth/ProtectedRoute.tsx`

**New Feature**:
- Redirects inactive users to home page with deactivation message
- Maintains navigation state for potential reactivation scenarios

### 4. Login Error Handling

When a user with a deactivated account attempts to log in, they receive a clear and specific error message:

- **Error Message**: "Your account has been deactivated. Please contact support if you believe this is an error."
- **Error Code**: `ACCOUNT_INACTIVE` (backend-specific error code)
- **User Experience**: Clear feedback explaining the account status rather than generic "Invalid credentials"

This is implemented through:
- **Backend**: AuthController checks if user exists but is inactive and returns specific error code
- **Frontend**: `handleApiError` function recognizes `ACCOUNT_INACTIVE` code and shows appropriate message

### 5. Route Integration

The following route categories are now protected against inactive users:

#### Dashboard Routes (`/dashboard`, `/admin/dashboard`)
- Wrapped with `ActiveUserGuard`
- Ensures only active users can access dashboard features

#### Account Settings Routes (`/account-settings`)
- Protected by `ActiveUserGuard`
- Prevents deactivated users from accessing account management

#### Store Management Routes
- Already protected by `ProtectedRoute` (now enhanced)
- Includes store creation, management, and customization

#### Inventory Routes
- Protected by enhanced `ProtectedRoute`
- Ensures only active users can manage inventory

#### Referral Program Routes
- Protected by enhanced `ProtectedRoute`
- Prevents deactivated users from accessing referral features

## Implementation Details

### Backend Integration

The system relies on the backend providing `isActive` status in user profile responses. The `UserApiService` properly maps this field from backend responses to the frontend `User` type.

### Auto-Logout Scenarios

The system automatically logs out users in the following scenarios:

1. **App Initialization**: If a stored user session has `isActive: false`
2. **Profile Refresh**: When refreshed profile data shows `isActive: false`
3. **Route Access**: When attempting to access protected routes with `isActive: false`

### User Experience

- **Clear Messaging**: Users see appropriate messages explaining their account status
- **Smooth Navigation**: Automatic redirection to appropriate pages
- **Loading States**: Proper loading indicators during authentication checks
- **Cross-Tab Sync**: Deactivation is synchronized across browser tabs

## Testing Scenarios

### 1. Account Deletion Flow
1. User deletes account through Account Settings
2. Backend sets `isActive: false`
3. Frontend immediately logs out user and clears all session data
4. User is redirected to home page with logout confirmation message
5. User cannot access any protected routes

### 2. Account Deactivation Flow
1. User account is deactivated (admin action or other system process)
2. Backend sets `isActive: false`
3. Frontend detects inactive status on next route navigation
4. User is automatically logged out with deactivation message
5. User is redirected to home page

### 2. Multi-Tab Scenario
1. User is logged in across multiple tabs
2. Account is deactivated in one tab
3. All other tabs detect the change and auto-logout
4. Consistent messaging across all tabs

### 3. Protected Route Access
1. Deactivated user attempts to access `/dashboard`
2. System detects inactive status
3. User is redirected with appropriate message
4. Cannot bypass protection by direct URL access

### 4. Immediate Logout After Deletion
1. User confirms account deletion in Account Settings
2. User enters password for verification
3. Backend processes deletion and sets `isActive: false`
4. Frontend immediately calls `logout()` to clear all tokens and user data
5. User is redirected to home page with logged-out state
6. All session data is cleared across all browser tabs

### 4. Login Attempt with Deactivated Account
1. User enters credentials for deactivated account
2. Backend recognizes inactive status and returns `ACCOUNT_INACTIVE` error
3. Frontend displays specific deactivation message
4. User cannot log in until account is reactivated

## Security Considerations

### Token Management
- Access tokens remain valid until expiration, but inactive status is checked on each protected route access
- Refresh token requests would fail for inactive users at the backend level
- Login attempts for inactive accounts are specifically blocked with clear error messages

### Session Persistence
- Local storage user data is cleared on logout
- Cross-tab synchronization ensures consistent state

### Error Handling
- Network failures during status checks don't block legitimate active users
- Graceful degradation maintains user experience

## Future Enhancements

### Potential Improvements
1. **Real-time Status Updates**: WebSocket connections for immediate deactivation notifications
2. **Admin-Initiated Deactivation**: Support for admin-triggered deactivation with custom messages
3. **Temporary Deactivation**: Support for temporary suspensions with reactivation dates
4. **Bulk Operations**: Admin interface for bulk user deactivation
5. **Enhanced Login Feedback**: More detailed deactivation reasons (e.g., "Account suspended for policy violation")

### Monitoring
- Log deactivation events for security auditing
- Track deactivation reasons for business intelligence
- Monitor system performance impact of status checks

## Conclusion

The user account deactivation protection system provides a robust security layer that ensures deactivated users cannot access protected features of the Farmer Trading platform. The implementation balances security requirements with user experience, providing clear feedback and smooth transitions while maintaining system integrity.

**Status**: ✅ **IMPLEMENTED AND TESTED**