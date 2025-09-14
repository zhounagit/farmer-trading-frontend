# Environment Setup Guide

This document provides instructions for setting up the environment variables and configuration for the Farmer Trading frontend application.

## Quick Setup

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure API Base URL

Add the following to your `.env` file:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5008

# Development Settings
NODE_ENV=development
```

### 3. Development vs Production URLs

**Development (Local):**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5008`
- Backend Swagger: `http://localhost:5008/swagger`

**Production:**
- Update `VITE_API_BASE_URL` to your production API domain
- Example: `VITE_API_BASE_URL=https://api.farmertrading.com`

## Port Configuration Issues

### Problem: HTTPS Certificate Errors

If you encounter SSL certificate errors with `https://localhost:7008`, the backend is configured for both HTTP and HTTPS. For development, use HTTP to avoid certificate issues.

**Solution:**
1. Set `VITE_API_BASE_URL=http://localhost:5008` (HTTP, not HTTPS)
2. The application will automatically normalize HTTPS URLs to HTTP in development

### Backend Port Configuration

The backend is configured to run on:
- **HTTP**: `http://localhost:5008`
- **HTTPS**: `https://localhost:7008`

For local development, always use the HTTP port (5008) to avoid certificate issues.

## Authentication Configuration

### Token Storage

The application stores authentication tokens in localStorage:
- `accessToken`: JWT access token
- `refreshToken`: Token for refreshing expired access tokens
- `heartwood_user_data`: User profile information

### API Endpoints

Authentication endpoints:
- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Refresh: `POST /api/auth/refresh`
- Logout: `POST /api/auth/logout`

## Store Configuration

### Store Management

The application automatically fetches user stores on login:
- Primary store is determined by the first active store
- If no active stores, uses the first available store
- Store ID is used for image uploads and branding operations

### Store Endpoints

Store-related endpoints:
- Get user stores: `GET /api/stores/my`
- Upload logo: `POST /api/stores/{storeId}/upload-logo`
- Upload banner: `POST /api/stores/{storeId}/upload-banner`
- Upload gallery: `POST /api/stores/{storeId}/upload-gallery`

## Debugging Configuration

### Enable Debug Mode

For development debugging, you can temporarily override the API URL:

```javascript
// In browser console:
localStorage.setItem('TEMP_API_BASE_URL', 'http://localhost:5008');
```

This will override the environment variable for testing purposes.

### Debug Logging

The application includes comprehensive debug logging:
- API requests and responses
- Authentication state changes
- File upload progress
- Store data fetching

Check browser console for detailed logs prefixed with:
- `🌐` - API calls
- `🔐` - Authentication
- `🎨` - File uploads
- `🏪` - Store operations

## Common Issues and Solutions

### Issue 1: 404 on API Calls

**Symptoms:**
- API calls return 404 Not Found
- Backend appears to be running

**Solutions:**
1. Verify backend is running: `http://localhost:5008/swagger`
2. Check `VITE_API_BASE_URL` in `.env` file
3. Ensure no trailing slash in API URL
4. Clear browser cache and restart dev server

### Issue 2: CORS Errors

**Symptoms:**
- CORS policy errors in browser console
- API calls blocked by browser

**Solutions:**
1. Verify frontend URL is in backend CORS configuration
2. Backend should allow `http://localhost:5173` in development
3. Check backend `appsettings.Development.json` CORS settings

### Issue 3: Authentication Failures

**Symptoms:**
- 401 Unauthorized errors
- Token refresh fails with 404
- Automatic logout during normal usage

**Solutions:**
1. Check API endpoint format: `/api/auth/refresh` (not `/auth/refresh`)
2. Verify token storage in localStorage
3. Ensure backend auth endpoints are properly configured
4. Clear localStorage and log in again

### Issue 4: Store ID Issues

**Symptoms:**
- Uploads fail with "store not found" errors
- Hard-coded store ID (storeId=1) in components

**Solutions:**
1. Ensure user has created at least one store
2. Use `useUserStore()` hook to get real store ID
3. Check store ownership via `/api/stores/my` endpoint
4. Verify store is active and accessible

## Environment Variables Reference

### Required Variables

```env
# API Configuration (Required)
VITE_API_BASE_URL=http://localhost:5008

# Build Configuration (Automatic)
NODE_ENV=development
```

### Optional Variables

```env
# Feature Flags (Optional)
VITE_ENABLE_DEBUG_TOOLS=true
VITE_ENABLE_MOCK_AUTH=false

# API Configuration (Optional)
VITE_API_TIMEOUT=30000
VITE_ENABLE_API_LOGS=true
```

## Development Workflow

### 1. Start Backend

```bash
cd dev/farmer-trading/FarmerTrading
dotnet run
```

Verify backend is running: `http://localhost:5008/swagger`

### 2. Start Frontend

```bash
cd dev/farmer-trading-frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 3. Verify Configuration

1. Open browser developer tools
2. Check console for API configuration logs
3. Verify API base URL is correct
4. Test login functionality
5. Check store data loading

## Production Deployment

### Environment Variables

For production, update these variables:

```env
# Production API
VITE_API_BASE_URL=https://api.your-domain.com

# Production Build
NODE_ENV=production
```

### Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build (optional)
npm run preview
```

### Deployment Checklist

- [ ] API URL updated to production domain
- [ ] Backend CORS includes production frontend URL
- [ ] SSL certificates configured for production backend
- [ ] Authentication endpoints tested in production
- [ ] File upload functionality verified
- [ ] Store management features working

## Support

For additional help:
1. Check browser console for error messages
2. Verify backend API documentation at `/swagger`
3. Review network tab for failed requests
4. Check backend logs for server-side errors
5. Refer to `DASHBOARD_DEBUGGING_GUIDE.md` for specific troubleshooting

## Quick Test Commands

### Test API Connection

```bash
# Test backend health
curl http://localhost:5008/health

# Test API endpoint
curl http://localhost:5008/api/stores/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reset Local Environment

```bash
# Clear environment override
localStorage.removeItem('TEMP_API_BASE_URL');

# Clear authentication
localStorage.clear();

# Restart development server
npm run dev
```
