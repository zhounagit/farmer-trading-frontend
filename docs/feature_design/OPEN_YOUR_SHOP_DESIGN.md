# Open Your Shop Feature Design

## Overview

The "Open Your Shop" feature enables users to create and manage their online stores on the Farmer Trading platform. This multi-step wizard guides users through store setup, including basic information, location & logistics, media uploads, and final review before submission.

## Architecture Alignment

### Feature Structure
```
src/features/stores/
├── components/
│   ├── OpenShopPage.tsx           # Main wizard container
│   ├── MyStoresPage.tsx           # Store dashboard
│   ├── StoreManagementPage.tsx    # Store management interface
│   ├── steps/                     # Wizard steps
│   │   ├── StoreBasicsStep.tsx
│   │   ├── LocationLogisticsStep.tsx
│   │   ├── StorePoliciesStep.tsx
│   │   ├── BrandingStep.tsx
│   │   ├── ReviewSubmitStep.tsx
│   │   └── SuccessStep.tsx
│   └── forms/                     # Reusable form components
│       ├── BusinessAddressForm.tsx
│       ├── FarmgateAddressForm.tsx
│       ├── PickupPointAddressForm.tsx
│       ├── ProcessorLogisticsForm.tsx
│       ├── SellingMethodsForm.tsx
│       └── ShippingOptionsForm.tsx
├── services/
│   ├── open-shop.api.ts           # Main API service for store creation
│   ├── storesApi.ts               # Legacy API service
│   ├── businessHours.ts           # Utility functions
│   └── open-shop.types.ts         # Feature-specific types
├── hooks/
│   └── useStoreErrorHandler.ts    # Centralized error handling
├── contexts/
│   └── StoreContext.tsx           # Global state management
├── __tests__/                     # Test files
│   ├── StoreContext.test.tsx
│   ├── useStoreErrorHandler.test.ts
│   └── StorePoliciesStep.test.tsx
└── routes.tsx                     # Store routes configuration
```

## Core Components

### 1. Store Creation Wizard

#### OpenShopPage Component
- **Purpose**: Main container for the multi-step store creation wizard
- **State Management**: 
  - Manages form state across all steps
  - Handles step navigation and validation
  - Persists partial data to prevent loss
- **Integration Points**:
  - AuthContext for user authentication
  - StoresApiService for API operations
  - Navigation between steps

#### Step Components

**StoreBasicsStep**
- Store name and description
- Store type selection (Producer/Processor/Both)
- Product categories selection
- Business type configuration

**LocationLogisticsStep**
- Business address management
- Farmgate address (optional)
- Selling methods configuration
- Processor logistics (for livestock)
- Shipping services setup

**StorePoliciesStep**
- Store operating hours configuration for all 7 days of the week
- Day-by-day schedule setup with open/close time validation
- Time validation ensures close time is after open time
- Payment methods selection (Cash, Credit Card, Bank Transfer, Mobile Payment)
- Business policy enforcement requiring at least one open day and one payment method
- Real-time form validation with user-friendly error messages
- Integration with OpenShopApiService for saving store hours and payment methods
- Support for both open/closed status per day with default time settings
- Graceful fallback handling for unimplemented backend endpoints

**SuccessStep**
- Display store creation success message
- Show submission details and next steps
- Provide navigation to store dashboard

**BrandingStep**
- Store logo upload
- Store banner upload
- Additional images gallery
- Image optimization and validation

**ReviewSubmitStep**
- Summary of all information
- Terms and conditions acceptance
- Final submission to backend

### 2. Store Management & State Management

#### StoreContext Component
- **Purpose**: Global state management for stores feature
- **Features**:
  - Centralized store data management
  - Loading state management across components
  - Error state handling and recovery
  - Optimistic updates for better UX
- **Integration Points**:
  - AuthContext for user authentication
  - React Query for server state
  - Navigation for store routing

#### useStoreErrorHandler Hook
- **Purpose**: Centralized error handling following established patterns
- **Features**:
  - API error mapping and user-friendly messages
  - Authentication error handling with redirects
  - Network error detection and recovery
  - Form validation error aggregation
  - Store-specific error handling (creation, update, media upload)

### 3. Store Management

#### MyStoresPage Component
- **Purpose**: Dashboard for viewing all user stores
- **Features**:
  - List of owned stores
  - Store status indicators
  - Quick actions (Edit, View, Delete)
  - Store analytics summary

#### StoreManagementPage Component
- **Purpose**: Individual store management interface
- **Features**:
  - Store settings configuration
  - Product management
  - Order management
  - Analytics and reporting

## API Integration

### Open Shop API Service (open-shop.api.ts)

```typescript
interface OpenShopApiService {
  // Store Creation
  createStoreWithSetupFlow(data: CreateStoreWithSetupFlowRequest): Promise<CreateStoreWithSetupFlowResponse>
  createStoreBasics(data: StoreBasics): Promise<CreateStoreResponse>
  
  // Store Policies
  setOpenHours(data: OpenHoursRequest): Promise<void>
  setPaymentMethods(data: PaymentMethodsRequest): Promise<void>
  
  // Store Submission
  submitStore(data: StoreSubmissionRequest): Promise<StoreSubmissionResponse>
  getApplicationStatus(storeId: number): Promise<ApplicationStatusResponse>
  
  // Store Management
  getEnhancedStoreById(storeId: number): Promise<EnhancedStoreDto>
  canAccessStore(storeId: number): Promise<StoreAccessResponse>
  
  // Store Media & Features
  getStoreMetrics(storeId: number): Promise<StoreMetrics>
  getStoreFeaturedProducts(storeId: number): Promise<FeaturedProductDto[]>
  setFeaturedProducts(storeId: number, itemIds: number[]): Promise<void>
}
```

### Legacy Store API Service (storesApi.ts)

```typescript
interface StoresApiService {
  // Store CRUD
  createStore(data: CreateStoreRequest): Promise<Store>;
  getStore(storeId: number): Promise<Store>;
  updateStore(storeId: number, data: UpdateStoreRequest): Promise<Store>;
  deleteStore(storeId: number): Promise<void>;
  getUserStores(): Promise<Store[]>;
  
  // Store Configuration
  getStoreAddresses(storeId: number): Promise<StoreAddress[]>;
  createStoreAddress(storeId: number, data: StoreAddressRequest): Promise<StoreAddress>;
  updateStoreAddress(storeId: number, addressId: number, data: StoreAddressRequest): Promise<void>;
  
  // Store Media
  uploadStoreImage(storeId: number, file: File, imageType: string): Promise<StoreImage>;
  deleteStoreImage(storeId: number, imageId: number): Promise<void>;
  
  // Store Submission
  submitStoreForReview(storeId: number, data: SubmissionRequest): Promise<void>;
  getStoreStatus(storeId: number): Promise<StoreStatus>;
}
```

## State Management

### Form State Structure
```typescript
interface StoreFormState {
  storeId?: number;
  currentStep: number;
  
  storeBasics: {
    storeName: string;
    storeDescription: string;
    storeType: 'producer' | 'processor' | 'both';
    categories: string[];
    businessType: string;
    setupFlow?: {
      derivedStoreType: string;
      hasLiveAnimals: boolean;
    };
  };
  
  locationLogistics: {
    businessAddress: Address;
    farmgateAddress?: Address;
    farmgateSameAsBusinessAddress: boolean;
    sellingMethods: string[];
    processorLogistics?: ProcessorInfo;
    shippingServices?: ShippingService[];
  };
  
  storeHours: {
    sunday: DayHours;
    monday: DayHours;
    tuesday: DayHours;
    wednesday: DayHours;
    thursday: DayHours;
    friday: DayHours;
    saturday: DayHours;
  };
  
  paymentMethods: {
    selectedMethods: string[];
  };
  
  branding: {
    logoFile?: File;
    bannerFile?: File;
    galleryFiles?: File[];
    logoUrl?: string;
    bannerUrl?: string;
    galleryUrls?: string[];
  };
  
  submission: {
    agreedToTerms: boolean;
    termsVersion: string;
    submissionNotes?: string;
  };
}
```

## Data Flow

### Store Creation Flow
1. **Step 1: Store Basics**
   - User enters basic information
   - Store type determines subsequent flow
   - Create draft store in backend
   - Receive storeId for subsequent operations

2. **Step 2: Location & Logistics**
   - Configure addresses based on store type
   - Set up selling methods
   - Configure processor partnerships (if applicable)
   - Create/update store addresses via API

3. **Step 3: Store Policies**
   - Configure operating hours for all days of the week
   - Set open/close times with time validation (close time after open time)
   - Select accepted payment methods (Cash, Credit Card, Bank Transfer, Mobile Payment)
   - Validate at least one open day and one payment method
   - Save store hours and payment methods via API
   - Real-time form validation with error feedback
   - Graceful fallback for unimplemented backend endpoints

4. **Step 4: Branding & Visuals**
   - Upload logo and banner images
   - Add gallery images
   - Images linked to storeId
   - Progressive upload with feedback

5. **Step 5: Review & Submit**
   - Display summary of all information
   - User agrees to terms
   - Submit store for approval
   - Redirect to store dashboard

### Error Handling

#### Centralized Error Handler

```typescript
interface StoreError {
  code?: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

const useStoreErrorHandler = () => {
  // Handle API errors with user-friendly messages
  handleStoreApiError(error: unknown, options?: StoreErrorHandlerOptions): StoreError
  
  // Handle form validation errors
  handleValidationError(errors: Record<string, string>, options?: { showToast?: boolean })
  
  // Store-specific error handlers
  handleStoreCreationError(error: unknown, step?: string): StoreError
  handleStoreUpdateError(error: unknown, operation?: string): StoreError
  handleMediaUploadError(error: unknown, fileType?: string): StoreError
}
```

#### Error Types Handled
- **Authentication Errors**: Redirect to login with appropriate messaging
- **Network Errors**: Connection failure detection and recovery suggestions
- **API Response Errors**: Backend error code mapping to user-friendly messages
- **Validation Errors**: Form field validation with aggregated error display
- **Store-specific Errors**: Store creation, update, and media upload error handling

## Security Considerations

### Authentication & Authorization
- All store operations require authenticated user
- Store ownership validation on updates
- Role-based access for store management

### Data Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Input sanitization for all text fields
- File type and size validation for uploads

### API Security
- JWT token required for all endpoints
- Rate limiting on store creation
- File upload size limits
- XSS prevention in store descriptions

## Testing Implementation

### Unit Tests
- **StoreContext**: State management, action creators, and reducer logic
- **useStoreErrorHandler**: Error type detection, message mapping, and toast handling
- **StorePoliciesStep**: Form validation, time logic, and API integration
- **Form validation logic**: Step-specific validation rules and error messages
- **API service methods**: Request/response handling and error scenarios

### Integration Tests
- **Multi-step form flow**: Complete wizard navigation and data persistence
- **API integration**: End-to-end API calls with mock responses
- **Error recovery scenarios**: Network failures and backend error handling
- **State management**: Context integration with component behavior

### E2E Tests
- **Complete store creation journey**: From start to successful submission
- **Store management operations**: CRUD operations and dashboard interactions
- **Error recovery flows**: Handling of various error conditions
- **Cross-browser compatibility**: Testing across different browser environments

### Test Coverage
- **Component rendering**: All step components and form elements
- **User interactions**: Button clicks, form inputs, and navigation
- **API mocking**: Simulated backend responses and error conditions
- **State transitions**: Form state changes and validation updates

## Known Issues & Fixes

### Issue 1: LocationLogisticsStep TypeError
**Problem**: `existingAddresses.find is not a function`
**Root Cause**: API response not guaranteed to be array
**Fix**: Ensure array type in StoresApiService:

```typescript
// In storesApi.ts
static async getStoreAddresses(storeId: number): Promise<StoreAddress[]> {
  const response = await apiService.get<ApiResponse<StoreAddress[]>>(
    `${this.BASE_PATH}/${storeId}/addresses`
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to get store addresses');
  }

  // Ensure we always return an array
  const addresses = response.data;
  return Array.isArray(addresses) ? addresses : [];
}
```

## Performance Optimizations

### Lazy Loading
- Load step components only when needed
- Defer image loading until media step
- Paginate store lists

### Caching
- Cache store categories
- Cache payment methods
- Cache user's stores list

### Progressive Enhancement
- Save draft data periodically
- Allow resuming incomplete applications
- Offline support for basic operations

## Future Enhancements

### Phase 2 Features
- Store templates for quick setup
- Bulk product import
- Advanced analytics dashboard
- Store customization themes

### Phase 3 Features
- Multi-language store support
- Store collaboration features
- Advanced SEO optimization
- Mobile app integration

## Migration Considerations

### From Old Architecture
- Migrate existing store data
- Update API endpoints gradually
- Maintain backward compatibility
- Provide migration guides

### Database Schema
```sql
-- Core store tables
stores (
  store_id,
  user_id,
  store_name,
  store_type,
  status,
  created_at,
  updated_at
)

store_addresses (
  address_id,
  store_id,
  address_type,
  street_address,
  city,
  state,
  zip_code
)

store_images (
  image_id,
  store_id,
  image_type,
  image_url,
  sort_order
)

store_categories (
  store_id,
  category_id
)
```

## Monitoring & Analytics

### Key Metrics
- Store creation completion rate
- Step abandonment rates
- Time to complete each step
- Error frequency by step

### Logging
- API call failures
- Validation errors
- User flow tracking
- Performance metrics

## Conclusion

The "Open Your Shop" feature follows the established architecture patterns with clear separation of concerns, modular design, and comprehensive error handling. The multi-step wizard approach ensures a smooth user experience while maintaining data integrity and security throughout the store creation process.