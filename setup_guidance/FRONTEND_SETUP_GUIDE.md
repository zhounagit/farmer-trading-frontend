# Frontend Setup Guide - Farmer Trading Platform

## 🚀 Quick Start Options

### React + TypeScript (Recommended)
```bash
# Create React app with Vite
npm create vite@latest farmer-trading-frontend -- --template react-ts
cd farmer-trading-frontend
npm install

# Install essential dependencies
npm install axios react-query @tanstack/react-query-devtools
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers
npm install react-router-dom react-hook-form
npm install @hookform/resolvers yup
npm install react-hot-toast
```


## 📁 Recommended Project Structure (React)

```
farmer-trading-frontend/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── forms/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AddressForm.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductDetails.tsx
│   │   └── store/
│   │       ├── StoreCard.tsx
│   │       └── StoreProfile.tsx
│   ├── pages/               # Page components
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── customer/
│   │   │   ├── Home.tsx
│   │   │   ├── Browse.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   └── OrderHistory.tsx
│   │   ├── farmer/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StoreSetup.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Orders.tsx
│   │   │   └── Analytics.tsx
│   │   └── shared/
│   │       ├── Profile.tsx
│   │       └── NotFound.tsx
│   ├── services/            # API service layer
│   │   ├── api.ts          # Axios configuration
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── store.service.ts
│   │   ├── inventory.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── store/              # State management
│   │   ├── index.ts        # Store configuration
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   └── userSlice.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── store.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── api.types.ts
│   ├── utils/              # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── styles/             # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components.css
│   ├── assets/             # Static assets
│   │   ├── images/
│   │   └── icons/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔧 Essential Configuration Files

### 1. API Configuration (`src/services/api.ts`)
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7008/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh', { refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          // Retry original request
          return api.request(error.config);
        } catch (refreshError) {
          // Redirect to login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. Environment Variables (`.env.local`)
```env
VITE_API_BASE_URL=https://localhost:7008/api
VITE_APP_NAME=Farmer Trading
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Type Definitions (`src/types/api.types.ts`)
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

### 4. Authentication Types (`src/types/auth.types.ts`)
```typescript
export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userType: 'customer' | 'store_owner' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'customer' | 'store_owner';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
```

## 🛠️ Core Services Implementation

### Authentication Service (`src/services/auth.service.ts`)
```typescript
import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.clear();
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }
};
```

### Custom Authentication Hook (`src/hooks/useAuth.ts`)
```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Validate token and get user info
          const response = await api.get('/users/profile');
          setUser(response.data.data);
        } catch (error) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const authData = await authService.login({ email, password });
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    setUser(authData.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 🎨 UI Component Examples

### Product Card Component (`src/components/product/ProductCard.tsx`)
```typescript
import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card sx={{ maxWidth: 345, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || '/placeholder-product.jpg'}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => onAddToCart(product.itemId)}
            disabled={product.quantity === 0}
          >
            {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
```

## 📱 Mobile-First Responsive Design

### Material-UI Theme Configuration (`src/theme.ts`)
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green for agricultural theme
    },
    secondary: {
      main: '#FFA726', // Orange for accent
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

## 🚀 Development Scripts

### Updated `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext ts,tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit"
  }
}
```

## 📋 Development Checklist

### Week 1-2: Project Setup & Core Pages
- [ ] Initialize React/Vue project with TypeScript
- [ ] Set up API service layer with authentication
- [ ] Create routing structure
- [ ] Implement authentication pages (Login, Register)
- [ ] Create responsive layout components
- [ ] Set up state management (React Query + Context or Pinia)

### Week 3-4: Core Features
- [ ] Implement store browsing pages
- [ ] Create product listing and details pages
- [ ] Build shopping cart functionality
- [ ] Implement user profile management
- [ ] Add address management
- [ ] Create farmer dashboard layout

### Week 5-6: Advanced Features
- [ ] Implement checkout process
- [ ] Add order management pages
- [ ] Create inventory management for farmers
- [ ] Implement search and filtering
- [ ] Add review and rating system
- [ ] Implement real-time notifications

## 🔧 Testing Strategy

### Testing Tools:
- **Unit Testing:** Vitest + Testing Library
- **E2E Testing:** Playwright or Cypress
- **API Testing:** Mock Service Worker (MSW)

### Essential Tests:
- Authentication flows
- Cart functionality
- Checkout process
- API error handling
- Responsive design

## 📱 Mobile App Preparation

### Design Considerations:
- Use responsive design patterns
- Implement touch-friendly interactions
- Optimize images for different screen sizes
- Consider offline functionality
- Plan for push notifications

### Code Reusability:
- Extract business logic into custom hooks/composables
- Create a shared TypeScript types package
- Design API-first architecture
- Use consistent naming conventions

## 🚀 Deployment Strategy

### Development Environment:
- Frontend: Netlify, Vercel, or AWS Amplify
- Backend: Keep running on localhost:7008
- Database: Development PostgreSQL instance

### Production Considerations:
- CDN for static assets
- Environment-specific API endpoints
- Error monitoring (Sentry)
- Analytics (Google Analytics 4)
- Performance monitoring

## 📊 Performance Targets

### Web Vitals Goals:
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Bundle Size:** < 500KB gzipped
- **API Response Time:** < 200ms (95th percentile)

This setup provides a solid foundation for your MVP while keeping mobile app development in mind. The API-first approach ensures you can easily extend to iOS and Android apps later.