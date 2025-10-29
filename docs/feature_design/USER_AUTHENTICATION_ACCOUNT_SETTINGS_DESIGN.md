# User Authentication & Account Settings Design Document

## Overview

This document outlines the architecture and design principles for the Farmer Trading platform's user authentication and account management systems. The system is built with **feature isolation** and **modular design** as core principles, ensuring that changes in one feature domain (e.g., store creation) do not impact authentication or account settings functionality.

## Architecture Principles

### 1. Feature Isolation
- **Domain Separation**: Authentication, account settings, and store management are treated as separate domains
- **Independent Development**: Teams can work on different features without coordination overhead
- **Risk Containment**: Bugs or changes in one feature cannot cascade to others

### 2. Modular Design
- **Self-contained Features**: Each feature manages its own state, API calls, and UI components
- **Clear Boundaries**: Well-defined interfaces between features
- **Reusable Components**: Shared utilities without tight coupling

### 3. Backend-Frontend Coordination
- **Contract-First Development**: API contracts defined before implementation
- **Type Safety**: Shared TypeScript interfaces between frontend and backend
- **Error Handling**: Consistent error response formats across all endpoints

## System Architecture

### Backend Layer Structure
```
FarmerTrading/
├── API/
│   ├── Controllers/
│   │   ├── AuthController.cs          # Authentication endpoints
│   │   └── UsersController.cs         # User management endpoints
│   └── Models/
│       └── ApiResponse.cs             # Standardized response format
├── Application/
│   ├── Requests/
│   │   └── Authentication/            # Auth-specific request models
│   ├── Services/
│   │   ├── UserService.cs             # User business logic
│   │   └── JwtService.cs              # Token management
│   └── Interfaces/
│       └── IUserService.cs            # User service contract
└── Domain/
    └── Models/
        └── User-Address/
            └── User.cs                # Core user entity
```

### Frontend Layer Structure
```
src/
├── contexts/
│   └── AuthContext.tsx                # Global authentication state
├── features/
│   ├── auth/                          # Authentication feature
│   │   ├── components/                # Auth-specific components
│   │   ├── routes.tsx                 # Auth routing
│   │   └── services/                  # Auth API services
│   └── account-settings/              # Account management feature
│       ├── components/                # Settings components
│       ├── routes.tsx                 # Settings routing
│       └── services/                  # Settings API services
├── shared/
│   ├── services/
│   │   └── api-service.ts             # Generic API client
│   └── types/
│       └── api-contracts.ts           # Shared API contracts
└── components/
    └── auth/
        ├── ProtectedRoute.tsx         # Route protection
        └── ActiveUserGuard.tsx        # User status validation
```

## Database Schema

### Core User Tables
```sql
-- Users table with authentication and profile data
CREATE TABLE public.users (
    user_id integer PRIMARY KEY,
    title character varying(10),
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    suffix character varying(10),
    phone character varying(20) NOT NULL,
    email character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    referrer_id integer,
    shipping_address_id integer,
    billing_address_id integer,
    user_type character varying(20) DEFAULT 'customer' NOT NULL,
    work_phone character varying(20),
    is_active boolean DEFAULT true,
    used_referral_code character varying(50),
    password_hash character varying(512),
    refresh_token text,
    profile_picture_url character varying,
    password_reset_token character varying(256),
    password_reset_token_expires timestamp with time zone,
    referred_at timestamp with time zone,
    my_referral_code character varying(50)
);

-- User preferences for customization
CREATE TABLE public.user_preferences (
    user_id integer PRIMARY KEY,
    show_email boolean DEFAULT false,
    show_phone boolean DEFAULT false,
    allow_messages boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    marketing_emails boolean DEFAULT false,
    theme character varying(20) DEFAULT 'auto',
    language character varying(10) DEFAULT 'en',
    timezone character varying(50) DEFAULT 'UTC',
    referral_credits_handling character varying(20) DEFAULT 'platform_purchases'
);

-- User addresses for shipping and billing
CREATE TABLE public.user_addresses (
    address_id integer PRIMARY KEY,
    user_id integer NOT NULL,
    address_type character varying(20) NOT NULL,
    street_address character varying(255) NOT NULL,
    city character varying(100) NOT NULL,
    state character varying(100) NOT NULL,
    postal_code character varying(20) NOT NULL,
    country character varying(100) NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);
```

## Authentication System

### Core Components

#### 1. AuthContext (Global State Management)
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: (message?: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateReferralCode: (referralCode: string) => void;
  updateStoreStatus: (hasStore: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
  handleAuthenticationError: (error: unknown, navigate?: (path: string) => void) => boolean;
  triggerProfilePictureLoad: () => Promise<void>;
  refreshProfilePicture: () => Promise<void>;
}
```

**Responsibilities:**
- Maintains global authentication state
- Provides authentication methods to entire application
- Handles token storage and refresh
- Manages cross-tab session synchronization
- Profile picture synchronization with profile store

#### 2. ProtectedRoute Component
```typescript
<ProtectedRoute requireAuth={true} requiredRole="store_owner">
  <StoreManagementPage />
</ProtectedRoute>
```

**Features:**
- Route-level authentication
- Role-based access control
- Automatic redirect to login
- Loading states during auth checks

#### 3. ActiveUserGuard Component
```typescript
<ActiveUserGuard fallbackPath="/">
  <Dashboard />
</ActiveUserGuard>
```

**Features:**
- Validates user account status (isActive)
- Automatic logout for deactivated accounts
- User-friendly deactivation messages
- Cross-tab synchronization

### Authentication Flow

#### Login Process
1. **Frontend**: User submits credentials via AuthContext.login()
2. **Backend**: AuthController validates credentials and user status
3. **Token Generation**: JWT tokens created with user claims
4. **Response**: User data and tokens returned to frontend
5. **State Update**: AuthContext updates global state
6. **Storage**: Tokens persisted in localStorage
7. **Profile Sync**: Profile picture loaded and synchronized
8. **Navigation**: User redirected to appropriate page

#### Account Status Validation
```typescript
// Backend - AuthController.cs
if (user is not { IsActive: true }) {
    throw new InvalidOperationException("Account is inactive");
}

// Frontend - ActiveUserGuard.tsx
useEffect(() => {
  if (user && user.isActive === false) {
    logout('Your account has been deactivated');
    navigate(fallbackPath, { replace: true });
  }
}, [user, isAuthenticated]);
```

## Account Management System

### Core Components

#### 1. AccountSettingsPage Component
**Features:**
- Tab-based navigation for different settings sections
- Profile information management
- Password change functionality
- Notification preferences
- Privacy settings
- Theme customization

#### 2. AccountInfo Component
**Responsibilities:**
- Display user profile information
- Handle profile updates
- Profile picture upload and management
- Account deletion functionality
- Data export functionality

#### 3. User Profile Management
```typescript
interface UserProfileResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone?: string;
  usedReferralCode?: string;
  myReferralCode?: string;
  profilePictureUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  referredAt?: string;
}

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profilePictureUrl?: string;
}
```

### Account Operations

#### Profile Updates
1. **Frontend**: User edits profile in AccountInfo component
2. **Validation**: Client-side validation of input fields
3. **API Call**: PUT request to `/api/users/{userId}`
4. **Backend**: UserService validates and updates user data
5. **Response**: Updated user profile returned
6. **State Sync**: AuthContext and local state updated

#### Profile Picture Management
1. **Upload**: User selects image file via file input
2. **Validation**: Frontend validates file type and size
3. **API Call**: POST to `/api/users/{userId}/profile-picture`
4. **Processing**: Backend resizes and stores image
5. **URL Update**: Profile picture URL returned
6. **Sync**: AuthContext syncs with profile store

#### Account Deletion
1. **Confirmation**: User confirms deletion intent
2. **Authorization**: DELETE request to `/api/users/{userId}`
3. **Backend**: Soft delete (sets isActive = false)
4. **Cleanup**: Frontend logs out user immediately
5. **Redirect**: User redirected to home page

## API Contracts & Coordination

### Standardized Response Format
```typescript
// Backend - ApiResponse.cs
public class ApiResponse<T> {
    public T? Data { get; set; }
    public bool Success { get; set; }
    public string? Message { get; set; }
    public List<ApiError>? Errors { get; set; }
}

// Frontend - api-contracts.ts
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}
```

### Error Handling System
```typescript
// Backend Error Codes
public static class ErrorCodes {
    public const string ACCOUNT_INACTIVE = "ACCOUNT_INACTIVE";
    public const string UNAUTHORIZED = "UNAUTHORIZED";
    public const string VALIDATION_ERROR = "VALIDATION_ERROR";
    public const string NOT_FOUND = "NOT_FOUND";
    public const string INTERNAL_ERROR = "INTERNAL_ERROR";
    // ... other codes
}

// Frontend Error Mapping
export const handleApiError = (error: unknown, context?: string): string => {
  // Specific handling for ACCOUNT_INACTIVE, etc.
};
```

## Feature Isolation Mechanisms

### 1. Independent Route Configuration
```typescript
// auth/routes.tsx - Authentication routes
export const authRoutes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
];

// account-settings/routes.tsx - Settings routes  
export const accountSettingsRoutes: RouteObject[] = [
  { path: '/account-settings', element: <AccountSettingsPage /> },
];

// stores/routes.tsx - Store management routes
export const storesRoutes: RouteObject[] = [
  { path: '/open-shop', element: <OpenShopPage /> },
];
```

### 2. Separate API Services
```typescript
// features/auth/services/authApi.ts
export class AuthApiService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> { ... }
  static async register(data: RegisterData): Promise<void> { ... }
}

// features/account-settings/services/settingsApi.ts  
export class SettingsApiService {
  static async updateProfile(userId: string, updates: UpdateProfileRequest): Promise<User> { ... }
  static async deleteAccount(userId: string): Promise<void> { ... }
}
```

### 3. Isolated State Management
```typescript
// Auth state managed globally
const { user, login, logout } = useAuth();

// Account settings state managed locally
const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
const [loading, setLoading] = useState(true);
```

## Security Considerations

### 1. Token Management
- JWT access tokens with short expiration (15 minutes)
- Refresh token rotation with longer expiration (7 days)
- Secure storage in localStorage with encryption considerations
- Automatic token refresh on 401 responses
- Cross-tab token synchronization

### 2. Account Protection
- Password hashing with bcrypt (work factor 12)
- Account lockout after 5 failed login attempts
- Session timeout handling (24 hours)
- Cross-tab logout synchronization
- Password reset token expiration (1 hour)

### 3. Data Validation
- Backend-first validation principle
- Input sanitization for XSS prevention
- SQL injection prevention through parameterized queries
- File upload validation (type, size, content)

### 4. Profile Picture Security
- File type validation (JPEG, PNG, WebP)
- Size limits (max 5MB)
- Content scanning for malicious files
- Secure storage with access controls

## Testing Strategy

### Unit Tests
- AuthContext state management
- API service error handling
- Component rendering with different auth states
- Profile picture upload validation
- Password strength validation

### Integration Tests
- Login/register flow with referral codes
- Protected route access with different roles
- Account status validation scenarios
- Cross-tab synchronization
- Profile picture upload and display

### E2E Tests
- Complete user journey from registration to account deletion
- Error scenarios (invalid credentials, deactivated accounts)
- Role-based access control flows
- Profile management workflows
- Password reset functionality

## Deployment & Monitoring

### Health Checks
- Authentication service availability
- Token service responsiveness
- Database connectivity for user data
- File storage accessibility for profile pictures

### Monitoring
- Failed login attempts and patterns
- Account deletion rates and reasons
- Token refresh failures and causes
- User session duration and activity
- Profile picture upload success rates

### Performance
- JWT token generation and validation latency
- User profile loading times
- Profile picture upload and processing times
- Database query performance for user operations

## Future Enhancements

### 1. Multi-factor Authentication
- SMS/Email verification codes
- Authenticator app integration (TOTP)
- Backup code generation
- Biometric authentication support

### 2. Enhanced Security
- Password strength requirements with zxcvbn
- Session management dashboard
- Suspicious activity detection and alerts
- Device fingerprinting for session validation

### 3. User Experience
- Social login integration (Google, Apple, Facebook)
- Passwordless authentication (magic links)
- Progressive profile completion
- Dark/light theme persistence

### 4. Advanced Features
- Account merging for duplicate accounts
- Data portability and export
- Advanced privacy controls
- Activity logging and audit trails

## Conclusion

The Farmer Trading authentication and account management system demonstrates a robust, modular architecture that successfully isolates features while maintaining seamless user experiences. The clear separation between authentication, account settings, and other business domains enables independent development, reduces regression risks, and provides a solid foundation for future enhancements.

The system's design principles of feature isolation, contract-first development, and consistent error handling ensure that changes in store creation or other business features will not impact the core authentication and account management functionality. The integration with referral programs and profile picture management showcases the system's extensibility and adaptability to new requirements.