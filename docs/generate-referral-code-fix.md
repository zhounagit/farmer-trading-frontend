# Generate Referral Code - 401 Unauthorized Error Fix

## Issue Summary

Users were experiencing a **401 Unauthorized** error when clicking the "Generate Referral Code" button in the Dashboard Referral Program page.

**Error Details:**
```
Request URL: https://localhost:7008/api/users/23/generate-referral-code
Request Method: POST
Status Code: 401 Unauthorized
```

## Root Cause Analysis

The issue was caused by **authentication token storage key mismatch** between different parts of the application:

### 1. Token Storage Inconsistency
- **API Service** (`shared/services/api-service.ts`) was looking for tokens under the key `'auth_token'`
- **Rest of Application** was storing tokens under `STORAGE_KEYS.ACCESS_TOKEN` (which equals `'helloneighbors_access_token'`)

### 2. API Endpoint Usage Issues
- **Old Implementation**: Used incorrect `referralApi.getInfo()` and `referralApi.generate()` methods
- **Problem**: These methods used wrong endpoints without `userId` parameter
  - ❌ `/api/users/referral-info` (missing userId)
  - ❌ `/api/users/generate-referral-code` (missing userId)
- **Correct Endpoints**: Should include userId in path
  - ✅ `/api/users/{userId}/referral-info`
  - ✅ `/api/users/{userId}/generate-referral-code`

### 3. Timing Issues
- `useEffect` was calling API methods before the `user` object was available from AuthContext
- This caused calls with undefined or empty `userId` values

### 4. Response Parsing Issues
- Backend returns: `ApiResponse<{ userId, referralCode, email, firstName, lastName }>`
- Frontend expected: Direct access to `referralCode` string
- The api-service correctly extracts `data.data` but the method signature was incorrect

## Solution Implementation

### 1. Fixed Token Storage Key Mismatch

**File:** `shared/services/api-service.ts`

```typescript
// Before
private getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// After
import { STORAGE_KEYS } from '../../utils/api';

private getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}
```

### 2. Updated API Method Calls

**File:** `features/referral/components/ReferralProgramPage.tsx`

```typescript
// Before
const data = await referralApi.getInfo();

// After  
const data = await UserApiService.getReferralInfo(user.userId.toString());
```

### 3. Fixed Timing Issues

```typescript
// Before
useEffect(() => {
  loadReferralData();
}, []);

// After
useEffect(() => {
  if (user?.userId) {
    loadReferralData();
  }
}, [user?.userId]);
```

### 4. Corrected Response Type Handling

**File:** `services/userApiService.ts`

```typescript
// Updated method to handle correct response structure
static async generateReferralCode(userId: string): Promise<string> {
  try {
    const response = await apiService.post<{
      userId: number;
      referralCode: string;
      email: string;
      firstName: string;
      lastName: string;
    }>(
      `${API_ENDPOINTS.USERS.BY_ID(parseInt(userId))}/generate-referral-code`,
      {}
    );

    if (!response || !response.referralCode) {
      throw new Error('Failed to generate referral code');
    }

    return response.referralCode;
  } catch (error) {
    throw error;
  }
}
```

## Backend API Structure

The backend correctly implements the endpoint with this structure:

**Endpoint:** `POST /api/users/{userId}/generate-referral-code`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "referralCode": "ABC123XYZ",
    "email": "user@example.com", 
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Referral code generated successfully"
}
```

## Files Modified

1. `/shared/services/api-service.ts` - Fixed token storage key
2. `/features/referral/components/ReferralProgramPage.tsx` - Updated API calls and timing
3. `/services/userApiService.ts` - Corrected response handling
4. Removed debugging logs from various auth and referral files

## Prevention Measures

1. **Standardize Token Storage**: Ensure all services use `STORAGE_KEYS` constants
2. **API Method Consistency**: Use centralized API services instead of multiple implementations  
3. **Type Safety**: Define proper TypeScript interfaces for API responses
4. **Authentication Checks**: Always verify user context before making authenticated API calls

## Testing Verification

After the fix:
1. ✅ Authentication token is properly included in requests
2. ✅ Correct API endpoint with userId is called
3. ✅ Response is correctly parsed to extract referral code
4. ✅ New referral code is displayed in the UI
5. ✅ No more 401 Unauthorized errors

## Lessons Learned

- **Consistent Token Management**: All parts of the application must use the same token storage keys
- **Centralized API Services**: Avoid duplicate API method implementations
- **Proper Error Handling**: Authentication errors should be caught and handled appropriately
- **Type Safety**: Strong typing helps prevent response parsing issues