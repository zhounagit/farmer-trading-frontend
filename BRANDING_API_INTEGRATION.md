# Branding API Integration - Frontend Updates

## Overview

This document summarizes the frontend updates made to integrate with the backend branding and visuals API endpoints for Step 4 of the shop setup process.

## API Endpoints Integrated

### 1. Logo Upload
- **Endpoint**: `POST /api/stores/{storeId}/upload-logo`
- **Request Body**: 
  - `storeId` (int): Store identifier
  - `file` (IFormFile): Logo image file
- **Response**: `StoreImage` object with `fileUrl` for display

### 2. Banner Upload
- **Endpoint**: `POST /api/stores/{storeId}/upload-banner`
- **Request Body**: 
  - `storeId` (int): Store identifier
  - `file` (IFormFile): Banner image file
- **Response**: `StoreImage` object with `fileUrl` for display

### 3. Gallery Upload
- **Endpoint**: `POST /api/stores/{storeId}/upload-gallery`
- **Request Body**: 
  - `storeId` (int): Store identifier
  - `files` (List<IFormFile>): Array of image files (max 6)
- **Response**: Array of `StoreImage` objects

## Files Modified

### Type Definitions
- **`src/types/open-shop.types.ts`**
  - Added `StoreImage` interface matching backend response structure
  - Includes properties: `imageId`, `storeId`, `imageType`, `filePath`, `fileUrl`, `fileName`, etc.

### API Service Layer
- **`src/services/open-shop.api.ts`**
  - Updated `uploadLogo()` method to use correct endpoint and FormData structure
  - Updated `uploadBanner()` method to use correct endpoint and FormData structure
  - Updated `uploadGalleryImages()` method to use correct endpoint and FormData structure
  - Fixed return types to use `StoreImage` and `StoreImage[]`
  - Added proper TypeScript imports

- **`src/utils/api.ts`**
  - Updated utility functions to match new API requirements
  - Fixed FormData field names (`file` and `files` instead of `logo`/`banner`)
  - Added `storeId` to FormData for all upload requests

### UI Components
- **`src/pages/shop/steps/BrandingStep.tsx`**
  - Fixed TypeScript errors with Grid component by replacing with Box layout
  - Updated async file validation for logo aspect ratio checking
  - Fixed ref type casting issues
  - Component already properly uses `formState.storeId` from Step 3

- **`src/components/dashboard/BrandingVisualsSection.tsx`**
  - Updated upload methods to work with new `StoreImage` response structure
  - Fixed TypeScript errors for async operations
  - Removed unused imports to clean up warnings

## Key Integration Points

### StoreId Flow
- The `storeId` is properly passed from Step 3 (Store Policies & Setup) through the `formState`
- All upload methods receive and use the correct `storeId` from `formState.storeId`
- Backend validation ensures uploaded images are associated with the correct store

### FormData Structure
```typescript
// Logo/Banner uploads
const formData = new FormData();
formData.append('storeId', storeId.toString());
formData.append('file', selectedFile);

// Gallery uploads
const formData = new FormData();
formData.append('storeId', storeId.toString());
imageFiles.forEach(file => {
  formData.append('files', file);
});
```

### Response Handling
All upload endpoints now return `StoreImage` objects with the following structure:
```typescript
interface StoreImage {
  imageId: number;
  storeId: number;
  imageType: string;
  filePath: string;
  fileUrl: string; // Use this for frontend display
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Testing

### Manual Testing Steps
1. Complete Steps 1-3 of shop setup to get a valid `storeId`
2. Navigate to Step 4 (Branding & Visuals)
3. Test logo upload with square image (JPG/PNG/WebP, under 5MB)
4. Test banner upload with rectangular image
5. Test gallery upload with multiple images (up to 6)
6. Verify progress indicators work correctly
7. Check browser console for API responses
8. Verify images display correctly after upload

### Test Component
A test component `TestApiIntegration.tsx` has been created to test the API integration independently:
- Creates programmatic test images
- Tests all three upload endpoints
- Provides detailed console logging
- Can be used for debugging API integration issues

### Error Handling
- File size validation (max 5MB)
- File type validation (JPEG, PNG, WebP only)
- Logo aspect ratio validation (approximately square)
- Gallery image limit (max 6 images)
- Network error handling with user-friendly messages
- Progress indication during uploads

## Production Considerations

### Security
- File uploads use proper FormData encoding
- Backend should validate file types and sizes server-side
- Consider implementing file scanning for security

### Performance
- Image compression could be added before upload
- Progress callbacks provide user feedback during large uploads
- Consider implementing retry logic for failed uploads

### User Experience
- Drag-and-drop interface implemented
- Image previews before upload
- Progress indicators during upload
- Clear error messages for validation failures
- Gallery management (add/remove images)

## Troubleshooting

### Common Issues
1. **"Store ID not found"**: Ensure Steps 1-3 are completed successfully
2. **Upload failures**: Check network connectivity and backend API status
3. **File validation errors**: Verify file size (<5MB) and format (JPG/PNG/WebP)
4. **TypeScript errors**: Ensure all type definitions are properly imported

### Debug Information
- All API calls log detailed information to browser console
- Upload progress is tracked and displayed
- Error responses include specific error messages
- Form state includes storeId validation

## Next Steps
1. Test integration with actual backend API
2. Implement image compression for large files
3. Add bulk upload functionality for gallery
4. Consider implementing image cropping/editing tools
5. Add image optimization and CDN integration