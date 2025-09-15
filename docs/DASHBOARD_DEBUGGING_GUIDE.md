# Dashboard Authentication & Error Debugging Guide

## Overview

This guide helps troubleshoot authentication issues and crashes in the dashboard, particularly when uploading images or navigating between tabs.

## 🚨 Common Issues & Solutions

### Issue 1: App Crashes After Logo Upload & Returns to Login

**Symptoms:**
- User clicks "My Orders" tab but "Branding & Visuals" is selected instead
- After uploading one logo image, the system crashes
- User is automatically redirected to login page

**Root Cause:**
Authentication token expires or becomes invalid during the upload process, triggering a hard redirect that crashes the React app state.

**Solution Applied:**
✅ **Fixed API Interceptor** - Replaced hard redirects with proper error handling
✅ **Added Authentication Error Handler** - Centralized auth error management  
✅ **Updated BrandingVisualsSection** - Graceful error handling with user feedback
✅ **Added Error Boundary** - Catches React errors to prevent crashes

### Issue 2: Tab Navigation Problems

**Symptoms:**
- Clicking one tab shows a different tab's content
- Tab state not syncing correctly

**Debugging Steps:**
1. Check browser console for JavaScript errors
2. Verify tab indices match the component structure
3. Check if any component is forcing tab changes programmatically

### Issue 3: Authentication Token Issues

**Symptoms:**
- Random logouts during normal usage
- API calls failing with 401 errors
- User redirected to login unexpectedly

**Debugging Steps:**
1. Check localStorage for token validity:
   ```javascript
   console.log('Access Token:', localStorage.getItem('accessToken'));
   console.log('Refresh Token:', localStorage.getItem('refreshToken'));
   ```

2. Monitor network tab for failed API calls
3. Check if token refresh is working properly

## 🔧 Technical Implementation

### Authentication Error Handler

Located in: `src/utils/authErrorHandler.ts`

**Features:**
- Detects authentication errors by error type
- Shows user-friendly error messages
- Gracefully navigates to login page
- Clears invalid tokens

**Usage:**
```typescript
import { handleAuthError, isAuthError } from '../utils/authErrorHandler';

try {
  await apiCall();
} catch (error) {
  if (isAuthError(error)) {
    handleAuthError(error, navigate);
    return;
  }
  // Handle other errors
}
```

### Error Boundary

Located in: `src/components/ErrorBoundary.tsx`

**Features:**
- Catches React component errors
- Shows user-friendly error page
- Provides recovery options
- Logs errors for debugging

**Usage:**
```typescript
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Updated API Interceptor

Located in: `src/services/api.ts`

**Changes Made:**
- Replaced `window.location.href` redirects with proper error throwing
- Creates custom AuthenticationError types
- Lets React components handle navigation
- Prevents hard page reloads that crash app state

## 🐛 Debugging Steps

### Step 1: Check Browser Console

Always check the browser developer console for:
- JavaScript errors
- Failed network requests
- Authentication warnings
- React error boundaries

### Step 2: Monitor Network Traffic

In browser DevTools Network tab, look for:
- 401 Unauthorized responses
- Failed token refresh attempts
- Upload request failures
- Malformed request payloads

### Step 3: Check Authentication State

In browser console, run:
```javascript
// Check current auth state
console.log('User:', localStorage.getItem('heartwood_user_data'));
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Check if tokens are expired
const token = localStorage.getItem('accessToken');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Token expires:', new Date(payload.exp * 1000));
  console.log('Current time:', new Date());
}
```

### Step 4: Test Upload Functionality

To isolate upload issues:
1. Use test components: `TestApiIntegration.tsx` or `TestStoreSubmission.tsx`
2. Monitor console logs during upload
3. Check if specific file types/sizes cause issues
4. Verify backend API endpoints are accessible

## 🔍 Monitoring & Logging

### Console Logging Levels

The app includes comprehensive logging:

**API Calls:**
- Request payloads and URLs
- Response data and status codes
- Error details and stack traces

**Authentication:**
- Login/logout events
- Token refresh attempts
- Auth error handling

**File Uploads:**
- Upload progress tracking
- File validation results
- Success/failure notifications

### Error Reporting

In production, consider implementing:
- Error tracking service (e.g., Sentry)
- User session recording
- API performance monitoring
- Authentication audit logs

## 🛠️ Development Tools

### Test Components

**TestApiIntegration.tsx:**
- Tests branding API endpoints
- Simulates file uploads
- Provides detailed console logging

**TestStoreSubmission.tsx:**
- Tests store submission workflow
- Monitors application status
- Validates API integration

### Debug Mode Features

In development mode, you get:
- Detailed error boundaries with stack traces
- Extended console logging
- Component debug information
- API request/response logging

## 🚀 Production Deployment

### Environment Variables

Ensure these are set correctly:
```
VITE_API_BASE_URL=https://your-api-domain.com
NODE_ENV=production
```

### Performance Considerations

- File upload timeouts (default: 30 seconds)
- Token refresh intervals
- Error boundary fallbacks
- Network retry logic

### Security Considerations

- Token storage security
- API endpoint validation
- File upload restrictions
- CORS configuration

## 📞 Troubleshooting Checklist

When issues occur:

- [ ] Check browser console for errors
- [ ] Verify network connectivity
- [ ] Confirm API endpoints are accessible
- [ ] Check authentication token validity
- [ ] Test with different browsers
- [ ] Clear browser cache/localStorage
- [ ] Try incognito/private browsing mode
- [ ] Check file size/type restrictions
- [ ] Verify backend API is running
- [ ] Monitor server logs for errors

## 🔄 Recovery Procedures

### For Users Experiencing Issues:

1. **Clear Browser Data:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Then refresh the page
   ```

2. **Force Logout/Login:**
   - Navigate to `/login`
   - Clear any cached credentials
   - Log in with fresh credentials

3. **Hard Refresh:**
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Clears cached JavaScript/CSS files

### For Developers:

1. **Reset Development Environment:**
   ```bash
   npm run clean
   npm install
   npm run dev
   ```

2. **Check Backend Connection:**
   ```bash
   curl -X GET http://localhost:5008/health
   ```

3. **Verify API Endpoints:**
   Test authentication and upload endpoints directly

## 📋 Known Issues & Workarounds

### Issue: Material-UI Grid Compatibility
**Status:** ✅ Fixed
**Solution:** Replaced Grid components with Box layouts

### Issue: TypeScript Strict Mode Errors
**Status:** ✅ Fixed  
**Solution:** Added proper error type handling

### Issue: Hard Redirects Crashing React State
**Status:** ✅ Fixed
**Solution:** Implemented proper React Router navigation

## 📈 Monitoring Success

Signs the fixes are working:
- No more sudden logouts during uploads
- Smooth navigation between dashboard tabs
- Graceful error handling with user feedback
- Console shows proper error logs (not crashes)
- Upload progress indicators work correctly

## 🎯 Prevention

To prevent similar issues:
- Always handle authentication errors gracefully
- Use React Router for navigation, never `window.location`
- Implement error boundaries for critical components  
- Test file uploads with various file types/sizes
- Monitor API response codes and handle appropriately
- Use TypeScript for better error catching
- Implement comprehensive logging for debugging

## 📚 Related Files

Key files involved in the fix:
- `src/services/api.ts` - API interceptor fixes
- `src/utils/authErrorHandler.ts` - Authentication error handling
- `src/components/ErrorBoundary.tsx` - React error boundary
- `src/components/dashboard/BrandingVisualsSection.tsx` - Upload component fixes
- `src/contexts/AuthContext.tsx` - Authentication context updates
- `src/pages/user/UserDashboard.tsx` - Dashboard error handling

For additional support, check the browser console logs and refer to the comprehensive error messages provided by the updated error handling system.