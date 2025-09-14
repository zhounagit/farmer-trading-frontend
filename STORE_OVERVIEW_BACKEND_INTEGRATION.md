# Store Overview Backend Integration

## Overview

The Store Overview component has been updated to fetch real data from backend APIs instead of using mock data. This document outlines the implementation, API endpoints used, and key features.

## Implementation Details

### Updated Component: `StoreOverviewSection.tsx`

The component now:
- Uses `useUserStore` hook to get user's store information
- Fetches comprehensive store data using `StoreApiService.getComprehensiveStoreDetails()`
- Displays real data from multiple backend tables
- Shows proper loading and error states
- Provides fallback handling for missing data

### Key Changes Made

1. **Removed Mock Data**: Eliminated hardcoded store information
2. **Added Real API Integration**: Integrated with comprehensive store API
3. **Enhanced Error Handling**: Added proper loading states and error messages
4. **Updated Type Safety**: Added proper TypeScript types from API service
5. **Fixed MUI v7 Compatibility**: Updated Grid components to use new `size` prop syntax

## Backend API Endpoints Used

The Store Overview fetches data from the following endpoints:

### Primary Store Data
- **`/api/stores/my-stores`** - Gets user's stores (via useUserStore hook)
- **`/api/stores/{storeId}`** - Gets basic store information

### Store Details (from multiple tables)
- **`/api/stores/{storeId}/addresses`** - Store addresses table
- **`/api/stores/{storeId}/images`** - Store images table  
- **`/api/stores/{storeId}/categories`** - Store categories mapping table
- **`/api/stores/{storeId}/open-hours`** - Store open hours table
- **`/api/stores/{storeId}/payment-methods`** - Store payment methods table

## Data Display Sections

### 1. Store Basics
- **Store name** (from stores table)
- **Description** (from stores table)
- **Approval status** (from stores table)
- **Setup completion progress** (calculated from all sections)

### 2. Location & Contact
- **Primary address** (from store addresses table)
  - Prioritizes: business address > pickup address > primary address > first address
- **Contact phone** (from address or store table)
- **Contact email** (from stores table)

### 3. Products
- **Categories** (from store categories mapping table)

### 4. Business Hours
- **Operating hours** (from store open hours table)
- Displays all days of the week
- Shows "Closed" for non-operating days

### 5. Payment Methods
- **Payment methods** (from store payment methods table)

### 6. Delivery Options
- **Delivery availability** based on delivery radius from stores table
- Shows "Delivery Available" with radius if `deliveryRadiusMi` has value
- Shows "No delivery service - Pickup only" if no delivery radius set

### 7. Branding
- **Branding assets status**:
  - Logo status (from store images table, type='logo')
  - Banner status (from store images table, type='banner') 
  - Gallery image count (from store images table, type='gallery')



## Setup Progress Calculation

The component calculates completion percentage based on:

1. **Store Basics** (Required): Name, description, categories
2. **Location & Logistics** (Required): Address, selling methods
3. **Store Policies** (Required): Business hours, payment methods  
4. **Branding & Visuals** (Medium Priority): Logo, banner, gallery images

**Completion Message**: When all steps are complete, shows "Store setup complete! Ready to submit for approval" instead of "ready to go live" since stores require approval before going live.

## Component Features

### Loading States
- Shows loading indicator while fetching stores
- Shows loading indicator while fetching comprehensive store data
- Displays appropriate loading messages

### Error Handling
- Displays error alerts for API failures
- Provides retry functionality
- Graceful degradation when endpoints are unavailable

### No Store State
- Shows informative message when user has no stores
- Provides "Open Your Shop" button to start store creation

### Navigation
- **Edit Store** button navigates to `/open-shop`
- **Setup Steps** navigate to appropriate configuration pages
- **Branding & Visuals** triggers callback to parent component

## Data Processing Functions

### `formatBusinessHours(openHours: StoreOpenHours[])`
Converts API response format to display format:
- Maps day numbers (0-6) to day names
- Handles closed days
- Formats time strings

### `getPrimaryAddress(addresses: StoreAddress[])`
Determines which address to display:
- Business address (highest priority)
- Pickup address
- Primary flagged address  
- First available address (fallback)

### `getImageCounts(images: StoreImage[])`
Calculates branding completion:
- Checks for active logo images
- Checks for active banner images
- Counts active gallery images

## Status Mapping

### Approval Status Display
- `approved` → "Live & Active" (green)
- `pending` → "Pending Review" (orange)
- `under_review` → "Under Review" (orange)
- `rejected` → "Rejected" (red)
- `suspended` → "Suspended" (red)
- Default → "Draft" (gray)

## Integration Points

### With User Dashboard
```tsx
<StoreOverviewSection onNavigateToBranding={() => setTabValue(2)} />
```

### With useUserStore Hook
- Automatically fetches user's stores on authentication
- Provides primary store for comprehensive data fetching
- Handles authentication state changes

## Testing Checklist

### API Integration
- [ ] Store Overview loads with real store data
- [ ] Displays correct store name and description
- [ ] Shows proper approval status with correct colors
- [ ] Displays primary address information
- [ ] Shows contact phone and email if available
- [ ] Lists all store categories in Products section
- [ ] Shows delivery options correctly (available with radius or pickup only)
- [ ] Shows business hours for all 7 days of the week
- [ ] Lists all payment methods in separate Payment Methods section
- [ ] Shows correct branding status (logo, banner, images) in separate Branding section

### Loading & Error States
- [ ] Shows loading indicator during data fetch
- [ ] Displays error message when API fails
- [ ] Retry button works when errors occur
- [ ] Handles missing store gracefully
- [ ] Shows "Open Your Shop" for users without stores

### Navigation
- [ ] "Edit Store" button navigates to /open-shop
- [ ] Setup step buttons navigate to correct pages
- [ ] Branding button triggers parent callback

### Setup Progress
- [ ] Completion percentage calculated correctly
- [ ] Required steps marked appropriately
- [ ] Completed steps show checkmarks
- [ ] Progress bar reflects actual completion
- [ ] Completion message shows "Ready to submit for approval" not "ready to go live"

## Future Enhancements

1. **Real-time Updates**: Consider WebSocket integration for live status updates
2. **Store Performance Metrics**: Add sales data, customer reviews
3. **Quick Actions**: Add inline editing capabilities for basic information
4. **Store Analytics**: Integrate with analytics dashboard
5. **Bulk Operations**: Support for managing multiple stores

## Troubleshooting

### Common Issues

1. **Store Not Loading**
   - Check user authentication
   - Verify store exists in database
   - Check API endpoint availability

2. **Missing Data Sections**
   - Some endpoints may not be implemented yet
   - Check browser console for API errors
   - Verify database relationships

3. **Incorrect Completion Status**
   - Verify all required data is present
   - Check step completion logic
   - Ensure database constraints are met

### Debug Logging

The component includes comprehensive console logging:
- Store fetching progress
- API response data
- Error details
- State transitions

Enable browser console to see detailed debugging information.

## Edit Mode Feature

### Overview

The Store Overview now supports editing existing stores. When users click "Edit Store", they are taken to the "Open Your Shop" flow with all existing store data pre-populated.

### How It Works

1. **Edit Store Button**: In Store Overview, clicking "Edit Store" navigates to `/open-shop?edit=true`
2. **Data Loading**: OpenShopPage detects the `edit=true` parameter and loads existing store data
3. **Form Pre-population**: All form fields are filled with current store information
4. **Modification Flow**: Users can modify any information and save changes

### Technical Implementation

#### URL Navigation
```tsx
// From Store Overview
const handleEditStore = () => {
  navigate('/open-shop?edit=true');
};
```

#### Edit Mode Detection
```tsx
// In OpenShopPage
const [searchParams] = useSearchParams();
const editStoreId = searchParams.get('edit') ? primaryStore?.storeId || null : null;
const isEditMode = !!editStoreId;
```

#### Data Loading Process
1. Fetch comprehensive store data using `StoreApiService.getComprehensiveStoreDetails()`
2. Convert API response format to form state format
3. Pre-populate all form fields with existing data
4. Set `agreedToTerms: true` since store already exists

#### Data Conversion Mapping

**Store Basics**:
- `storeName` → `storeBasics.storeName`
- `description` → `storeBasics.description`
- `categories[].categoryId` → `storeBasics.categories[]` (converted to strings)

**Location & Logistics**:
- Primary address (business > pickup > primary > first) → `locationLogistics.businessAddress`
- Contact information from address or store table

**Business Hours**:
- `openHours[]` → `storeHours` object with day-of-week mapping
- Handles closed days and time formatting

**Payment Methods**:
- `paymentMethods[].methodId` → `paymentMethods.selectedMethods[]` (converted to strings)

### User Experience

#### Loading States
- Shows loading spinner while fetching store data
- "Loading store data for editing..." message
- Error handling with retry option

#### Visual Indicators
- Page title changes to "Edit Your Store"
- Exit dialog mentions "store editing" instead of "store setup"
- Appropriate messaging for existing vs. new stores

#### Form Behavior
- All steps accessible for editing
- Changes trigger auto-save functionality
- Existing validation rules apply

### Testing Edit Mode

#### Pre-requisites
- User must have an existing store
- Store must be accessible via `useUserStore` hook
- Comprehensive store data must be available

#### Test Cases
- [ ] Edit Store button navigates to correct URL with edit parameter
- [ ] Store data loads and populates all form fields correctly
- [ ] Page title shows "Edit Your Store"
- [ ] All existing data displays accurately in forms
- [ ] User can modify any field and save changes
- [ ] Loading states show during data fetch
- [ ] Error handling works if store data fails to load
- [ ] Exit dialog shows appropriate messaging for edit mode

#### Error Scenarios
- [ ] Store data fails to load - shows error with retry option
- [ ] Invalid store ID - handles gracefully
- [ ] Network errors during data fetch - shows appropriate message

### Integration Points

#### With Store Overview
- "Edit Store" button triggers edit mode navigation
- Uses primary store from `useUserStore` hook

#### With OpenShopPage
- Detects edit mode via URL parameters
- Loads existing store data automatically
- Pre-populates all form sections

#### With API Layer
- Uses existing `StoreApiService.getComprehensiveStoreDetails()`
- Converts API format to form state format
- Maintains compatibility with existing save operations