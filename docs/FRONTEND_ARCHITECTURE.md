# Frontend Architecture Documentation
**Farmer Trading E-Commerce Platform**

## Overview

The Farmer Trading frontend is a modern React-based web application built with TypeScript, Material-UI, and a robust state management architecture. It provides a comprehensive e-commerce platform for farmers to manage their stores, products, and orders.

## Technology Stack

### Core Technologies
- **React 19.1.1** - Component-based UI library
- **TypeScript 5.8.3** - Static type checking
- **Vite 7.1.2** - Fast build tool and dev server
- **React Router DOM 7.8.2** - Client-side routing

### UI Framework
- **Material-UI (MUI) 7.3.2** - Component library
  - `@mui/material` - Core components
  - `@mui/icons-material` - Icon library
  - `@mui/lab` - Experimental components
  - `@mui/x-date-pickers` - Date/time pickers

### State Management
- **TanStack Query 5.87.1** - Server state management
  - Data fetching and caching
  - Background updates
  - Optimistic updates
  - DevTools integration
- **React Context** - Client state management
  - Authentication state
  - User preferences

### Form Management
- **React Hook Form 7.62.0** - Form state management
- **Yup 1.7.0** - Schema validation
- **@hookform/resolvers 5.2.1** - Validation integration

### HTTP Client
- **Axios 1.11.0** - HTTP requests with interceptors
- **React Hot Toast 2.6.0** - Toast notifications

### Animation & Motion
- **Framer Motion 12.23.12** - Animation library

### Utilities
- **clsx 2.1.1** - Conditional className utility
- **date-fns 4.1.0** - Date manipulation

## Project Structure

```
src/
├── assets/                 # Static assets (images, icons)
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared/common components
│   ├── dashboard/        # Dashboard-specific components
│   ├── debug/           # Development/debugging components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── product/         # Product-related components
│   └── user/            # User-related components
├── contexts/             # React contexts
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
├── pages/              # Page components (route components)
│   ├── auth/           # Authentication pages
│   ├── shop/           # Shop/store pages
│   └── user/           # User dashboard pages
├── services/           # API services
│   ├── api.ts          # Main API configuration
│   ├── open-shop.api.ts # Store creation API
│   └── store.api.ts    # Store management API
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Architecture Patterns

### Component Architecture

#### 1. Atomic Design Principles
- **Atoms**: Basic UI elements (buttons, inputs, icons)
- **Molecules**: Simple component groups (form fields, card headers)
- **Organisms**: Complex components (forms, data tables)
- **Templates**: Page layouts
- **Pages**: Specific instances with real data

#### 2. Container/Presentation Pattern
- **Container Components**: Handle data fetching and business logic
- **Presentation Components**: Focus on UI rendering and user interactions

### State Management Strategy

#### 1. Server State (TanStack Query)
```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Usage example
const { data: stores, isLoading, error } = useQuery({
  queryKey: ['stores', userId],
  queryFn: () => storeApi.getUserStores(userId),
});
```

#### 2. Client State (React Context)
```typescript
// AuthContext pattern
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

### API Layer Architecture

#### 1. Axios Configuration
```typescript
// Centralized API configuration
export const api = axios.create({
  baseURL: 'https://localhost:7008',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});
```

#### 2. Request/Response Interceptors
- **Request Interceptor**: Adds authentication tokens
- **Response Interceptor**: Handles token refresh and error standardization

#### 3. Service Layer Pattern
```typescript
// Abstracted API methods
export const apiService = {
  get: async <T>(url: string, params?: any): Promise<T>,
  post: async <T>(url: string, data?: any): Promise<T>,
  put: async <T>(url: string, data?: any): Promise<T>,
  delete: async <T>(url: string): Promise<T>,
  upload: async <T>(url: string, formData: FormData): Promise<T>,
};
```

## Key Features & Components

### Authentication System
- JWT-based authentication
- Token refresh mechanism
- Protected route handling
- Role-based access control

### Store Management
- **Store Overview**: Dashboard with setup progress
- **Store Creation**: Multi-step form with validation
- **Store Settings**: Configuration and branding
- **Product Management**: Inventory and pricing

### Dashboard Components
- **StoreOverviewSection**: Main store dashboard
- **StoreSetupProgress**: Setup completion tracking
- **ApplicationStatusTracker**: Store approval status

### Form Management
- **React Hook Form Integration**: Type-safe forms
- **Yup Validation**: Schema-based validation
- **File Upload**: Image handling with progress

## Routing Structure

```typescript
// Main route configuration
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/how-it-works" element={<HowItWorksPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/dashboard" element={<UserDashboard />} />
  <Route path="/open-shop" element={<OpenShopPage />} />
  <Route path="/my-stores" element={<StoreManagementPage />} />
  <Route path="/stores/:storeId/dashboard" element={<StoreManagementPage />} />
  <Route path="/stores/:storeId/products" element={<StoreManagementPage />} />
  <Route path="/stores/:storeId/edit" element={<StoreManagementPage />} />
  <Route path="/stores/:storeId/settings" element={<StoreManagementPage />} />
</Routes>
```

## Theme & Styling

### Material-UI Theme Configuration
```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Agricultural green
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FFA726', // Orange accent
      light: '#FFD54F',
      dark: '#F57C00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
```

### Component Styling Strategy
- **Material-UI sx prop**: Component-specific styling
- **Theme-based spacing**: Consistent spacing system
- **Responsive design**: Grid2 system for layouts
- **Custom components**: Styled Material-UI components

## Performance Optimizations

### React Query Optimizations
- **Query caching**: 5-minute stale time
- **Background refetching**: Disabled on window focus
- **Optimistic updates**: Immediate UI feedback
- **Error retry**: Single retry on failure

### Code Splitting
- **Route-based splitting**: Automatic with React Router
- **Component lazy loading**: Dynamic imports for large components

### Bundle Optimization
- **Vite build optimization**: Tree shaking and minification
- **Asset optimization**: Image compression and lazy loading

## Development Tools

### Code Quality
- **ESLint**: Code linting with custom rules
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **React DevTools**: Component debugging

### Development Features
- **Hot Module Replacement**: Instant updates during development
- **React Query DevTools**: Query state inspection
- **Source maps**: Debugging support

## Security Considerations

### Authentication Security
- **JWT tokens**: Secure token storage in localStorage
- **Token refresh**: Automatic token renewal
- **HTTPS enforcement**: All API calls over HTTPS
- **CORS configuration**: Restricted origins

### Data Validation
- **Client-side validation**: Yup schemas
- **Type safety**: TypeScript interfaces
- **Sanitization**: Input cleaning before API calls

## API Integration

### Backend Communication
- **Base URL**: `https://localhost:7008`
- **Content Type**: JSON for most requests
- **File uploads**: multipart/form-data
- **Error handling**: Standardized error responses

### Authentication Flow
1. Login with credentials
2. Receive JWT access/refresh tokens
3. Store tokens in localStorage
4. Include access token in API requests
5. Automatic token refresh on 401 responses

## Deployment Configuration

### Build Configuration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### Environment Variables
- `VITE_API_BASE_URL`: Backend API URL
- Development/production environment detection

## Future Considerations

### Planned Enhancements
- **Progressive Web App**: Service worker implementation
- **Real-time updates**: WebSocket integration
- **Advanced caching**: Service worker caching strategies
- **Mobile responsiveness**: Enhanced mobile experience

### Scalability Considerations
- **Micro-frontend architecture**: Module federation for large teams
- **State management**: Consider Redux Toolkit for complex state
- **Testing strategy**: Unit and integration test implementation
- **Performance monitoring**: Analytics and error tracking