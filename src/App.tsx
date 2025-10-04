import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import StoreManagementPage from './pages/user/StoreManagementPage';
import MyStoresPage from './pages/user/MyStoresPage';
import OpenShopPage from './pages/shop/OpenShopPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StorefrontCustomizationPage from './pages/storefront/StorefrontCustomizationPage';
import LiveStorefrontPage from './pages/storefront/LiveStorefrontPage';
import PublishedStorePage from './pages/storefront/PublishedStorePage';
import SimpleBrowsePage from './pages/storefront/SimpleBrowsePage';
import ProductSearchPage from './pages/search/ProductSearchPage';
import UnifiedSearchPage from './pages/search/UnifiedSearchPage';
import ProductDetailPage from './pages/product/ProductDetailPage';
import SimpleInventoryPage from './pages/inventory/SimpleInventoryPage';
import StorefrontTestPage from './pages/StorefrontTestPage';
import {
  StoreApplicationReview,
  StoreApplicationsList,
} from './pages/admin/store-applications';
import AdminAuthPage from './pages/auth/AdminAuthPage';
import ClearTokenPage from './pages/auth/ClearTokenPage';
import ProtectedRoute from './components/ProtectedRoute';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green for agricultural theme
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FFA726', // Orange for accent
      light: '#FFD54F',
      dark: '#F57C00',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              width: '100%',
              margin: 0,
              padding: 0,
              overflowX: 'hidden',
            }}
          >
            <AuthProvider>
              <Routes>
                <Route path='/' element={<LandingPage />} />
                <Route path='/how-it-works' element={<HowItWorksPage />} />
                <Route path='/login' element={<LoginPage />} />
                <Route path='/register' element={<RegisterPage />} />
                <Route
                  path='/forgot-password'
                  element={<ForgotPasswordPage />}
                />
                <Route path='/reset-password' element={<ResetPasswordPage />} />
                <Route path='/dashboard' element={<UserDashboard />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route
                  path='/admin/store-applications'
                  element={<StoreApplicationsList />}
                />
                <Route
                  path='/admin/store-applications/:submissionId'
                  element={<StoreApplicationReview />}
                />
                <Route
                  path='/admin/auth/:submissionId'
                  element={<AdminAuthPage />}
                />
                <Route path='/clear-token' element={<ClearTokenPage />} />

                {/* Public storefront routes */}
                <Route path='/browse' element={<SimpleBrowsePage />} />
                <Route path='/search' element={<ProductSearchPage />} />
                <Route path='/unified-search' element={<UnifiedSearchPage />} />
                <Route
                  path='/product/:itemId'
                  element={<ProductDetailPage />}
                />
                <Route path='/store/:slug' element={<PublishedStorePage />} />
                <Route path='/shop/:slug' element={<PublishedStorePage />} />
                <Route
                  path='/store/:slug/live'
                  element={<LiveStorefrontPage />}
                />

                {/* Test and demo page */}
                <Route
                  path='/storefront-demo'
                  element={<StorefrontTestPage />}
                />
                <Route
                  path='/open-shop'
                  element={
                    <ProtectedRoute>
                      <OpenShopPage />
                    </ProtectedRoute>
                  }
                />
                {/* /open-shop?edit=true - Edit existing store mode */}
                <Route
                  path='/my-stores'
                  element={
                    <ProtectedRoute>
                      <MyStoresPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/stores/:storeId/dashboard'
                  element={
                    <ProtectedRoute>
                      <StoreManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/stores/:storeId/products'
                  element={
                    <ProtectedRoute>
                      <StoreManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/stores/:storeId/edit'
                  element={
                    <ProtectedRoute>
                      <StoreManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/stores/:storeId/settings'
                  element={
                    <ProtectedRoute>
                      <StoreManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/stores/:storeId/customize'
                  element={
                    <ProtectedRoute>
                      <StorefrontCustomizationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/inventory/:storeId'
                  element={
                    <ProtectedRoute>
                      <SimpleInventoryPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>

              {/* Toast notifications */}
              <Toaster
                position='top-right'
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#2E7D32',
                    },
                  },
                  error: {
                    style: {
                      background: '#d32f2f',
                    },
                  },
                }}
              />
            </AuthProvider>
          </Box>
        </Router>

        {/* React Query DevTools (only in development) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
