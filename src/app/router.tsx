import React, { Suspense, useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  bundleOptimizer,
  routeOptimization,
} from '../utils/bundleOptimization';

// Use compatible loader function typing
type LoaderArgs = {
  request: Request;
  params?: Record<string, string | undefined>;
  context?: unknown;
};

// Import all feature routes
import { authRoutes } from '../features/auth/routes';
import { dashboardRoutes } from '../features/dashboard/routes';
import { storesRoutes } from '../features/stores/routes';
import { storefrontRoutes } from '../features/storefront/routes';
import { inventoryRoutes } from '../features/inventory/routes';
import { searchRoutes } from '../features/search/routes';
import { coreRoutes } from '../features/core/routes';
import { referralRoutes } from '../features/referral/routes';
import { accountSettingsRoutes } from '../features/account-settings/routes';
import { cartRoutes } from '../features/cart/routes';

// Performance tracking for route transitions
const RoutePerformanceTracker = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const [routeLoadTime, setRouteLoadTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();

    // Track route load completion
    const trackRouteLoad = () => {
      const loadTime = performance.now() - startTime;
      setRouteLoadTime(loadTime);

      // Performance monitoring disabled

      // Preload related routes
      routeOptimization.preloadRelatedRoutes(location.pathname);

      // Warn about slow routes
      if (loadTime > 2000) {
        console.warn(
          `🐌 Slow route detected: ${location.pathname} took ${loadTime.toFixed(2)}ms`
        );
      }
    };

    // Track on next frame to allow for render completion
    const timeoutId = setTimeout(trackRouteLoad, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && routeLoadTime > 1000 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: '#ff9800',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 9999,
            boxShadow: 2,
          }}
        >
          Route loaded in {routeLoadTime.toFixed(2)}ms
        </Box>
      )}
    </>
  );
};

// Enhanced loading fallback with progress indication
const LoadingFallback = ({
  featureName = 'page',
  showProgress = true,
}: {
  featureName?: string;
  showProgress?: boolean;
}) => {
  const [progress, setProgress] = useState(0);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLoadTime(elapsed);

      // Simulate progress based on elapsed time
      const simulatedProgress = Math.min((elapsed / 3000) * 100, 90);
      setProgress(simulatedProgress);

      // Complete progress after 3 seconds max
      if (elapsed > 3000) {
        setProgress(100);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        gap: 3,
        padding: 4,
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <CircularProgress size={48} thickness={3.6} />
        <Typography
          variant='h6'
          sx={{ mt: 2, fontWeight: 500 }}
          color='text.primary'
        >
          Loading {featureName}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
          {loadTime}ms elapsed
        </Typography>
      </Box>

      {showProgress && (
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              },
            }}
          />
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 1, display: 'block', textAlign: 'center' }}
          >
            {Math.round(progress)}% complete
          </Typography>
        </Box>
      )}

      {loadTime > 5000 && (
        <Typography
          variant='body2'
          color='warning.main'
          sx={{ mt: 1, textAlign: 'center' }}
        >
          This is taking longer than usual. Please check your connection.
        </Typography>
      )}
    </Box>
  );
};

// Enhanced 404 Not Found component with navigation suggestions
const NotFoundPage = () => {
  const navigate = useNavigate();
  const [suggestions] = useState([
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/stores', label: 'My Stores' },
    { path: '/inventory', label: 'Inventory' },
  ]);

  // Track 404 occurrences
  useEffect(() => {
    // Performance monitoring disabled
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: 4,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Typography
        variant='h1'
        color='primary'
        sx={{
          fontSize: { xs: '6rem', md: '8rem' },
          fontWeight: 800,
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </Typography>

      <Typography variant='h4' gutterBottom sx={{ fontWeight: 600 }}>
        Page Not Found
      </Typography>

      <Typography
        variant='body1'
        color='text.secondary'
        paragraph
        sx={{ maxWidth: 500 }}
      >
        The page you're looking for doesn't exist or has been moved. Here are
        some suggestions to help you find what you need:
      </Typography>

      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
        }}
      >
        {suggestions.map((suggestion) => (
          <Box
            key={suggestion.path}
            onClick={() => navigate(suggestion.path)}
            sx={{
              padding: '12px 24px',
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '2px solid transparent',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)',
                borderColor: 'primary.main',
              },
            }}
          >
            <Typography
              variant='body2'
              color='primary'
              sx={{ fontWeight: 500 }}
            >
              Go to {suggestion.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(-1)}
        >
          ← Go back to previous page
        </Typography>
      </Box>
    </Box>
  );
};

// Error boundary for route-level errors
class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ComponentType<any>;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route Error:', error, errorInfo);

    // Performance monitoring disabled
  }

  render() {
    if (this.state.hasError) {
      const Fallback =
        this.props.fallback ||
        (() => (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
              padding: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant='h5' color='error' gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Box
              onClick={() => window.location.reload()}
              sx={{
                mt: 2,
                padding: '12px 24px',
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <Typography variant='button'>Reload Page</Typography>
            </Box>
          </Box>
        ));

      return <Fallback />;
    }

    return this.props.children;
  }
}

// Enhanced router configuration with performance optimizations
const createOptimizedRoutes = () => {
  return [
    // Core routes (landing pages) with immediate preloading
    ...coreRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled
        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Authentication routes with user-specific preloading
    ...authRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled

        // Preload dashboard for successful login
        if (route.path === '/login') {
          // Bundle preloading disabled
        }

        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Dashboard routes with intelligent preloading
    ...dashboardRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled

        // Preload commonly accessed routes from dashboard
        setTimeout(() => {
          // Bundle preloading disabled
          // Bundle preloading disabled
        }, 1000);

        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Store management routes with context-aware preloading
    ...storesRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled

        // Preload storefront customization for store pages
        if (params?.storeId) {
          setTimeout(() => {
            routeOptimization.preloadRelatedRoutes(
              `/stores/${params.storeId}/customize`
            );
          }, 1500);
        }

        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;
        // Bundle analysis disabled
        return result;
      },
    })),

    // Storefront routes with theme and module preloading
    ...storefrontRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled

        // Preload themes and modules data
        if (route.path?.includes('customize')) {
          setTimeout(() => {
            // Preload theme and module APIs
            routeOptimization.preloadRelatedRoutes('/themes');
            routeOptimization.preloadRelatedRoutes('/modules');
          }, 1000);
        }

        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;
        // Bundle analysis disabled
        return result;
      },
    })),

    // Inventory routes with product data preloading
    ...inventoryRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled

        // Preload product-related routes
        setTimeout(() => {
          // Bundle preloading disabled
          // Bundle preloading disabled
        }, 500);

        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Account settings routes
    ...accountSettingsRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled
        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Search and product routes
    ...searchRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled
        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Referral program routes
    ...referralRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled
        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Cart routes
    ...cartRoutes.map((route) => ({
      ...route,
      loader: async ({ request, params, context }: LoaderArgs) => {
        // Bundle analysis disabled
        const result =
          route.loader && typeof route.loader === 'function'
            ? await route.loader({ request, params: params ?? {}, context })
            : null;

        return result;
      },
    })),

    // Catch-all route for 404
    {
      path: '*',
      element: (
        <RouteErrorBoundary>
          <NotFoundPage />
        </RouteErrorBoundary>
      ),
    },
  ];
};

// Create router with optimized configuration
const router = createBrowserRouter(createOptimizedRoutes(), {
  // Future flags for performance
  future: {
    v7_normalizeFormMethod: true,
  },
});

// Router analytics and monitoring component to be used within route components
const RouterAnalytics = () => {
  useEffect(() => {
    // Track route performance metrics without using useLocation
    const routeMetrics = {
      path: window.location.pathname,
      timestamp: Date.now(),
      referrer: document.referrer,
    };

    // Store in session for analysis
    const existingMetrics = JSON.parse(
      sessionStorage.getItem('route-metrics') || '[]'
    );
    existingMetrics.push(routeMetrics);
    sessionStorage.setItem('route-metrics', JSON.stringify(existingMetrics));

    // Performance monitoring disabled

    // Track page views
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: window.location.pathname,
      });
    }
  }, []);

  return null;
};

// Main router component with all enhancements
const AppRouter = () => {
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    // Initialize router optimizations
    const preloadStrategy = {
      immediate: ['/dashboard', '/my-stores'],
      onInteraction: ['/inventory', '/search'],
      onVisible: ['/open-shop', '/admin/dashboard'],
      onIdle: [],
    };

    bundleOptimizer.implementPreloadStrategy(preloadStrategy);

    // Mark router as ready
    setIsRouterReady(true);

    // Cleanup on unmount
    return () => {
      bundleOptimizer.dispose();
    };
  }, []);

  if (!isRouterReady) {
    return <LoadingFallback featureName='application' />;
  }

  return (
    <RouteErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
        <RouterAnalytics />
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default AppRouter;

// Export utilities for external use
export { RoutePerformanceTracker, LoadingFallback, RouteErrorBoundary };

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Add global router utilities
  (window as any).__ROUTER_UTILS__ = {
    getRouteMetrics: () =>
      JSON.parse(sessionStorage.getItem('route-metrics') || '[]') as any[],
    clearRouteMetrics: () => sessionStorage.removeItem('route-metrics'),
    preloadRoute: (path: string) =>
      routeOptimization.preloadRelatedRoutes(path),
  };

  // Keyboard shortcuts for development
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R for router analytics
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      const metrics = JSON.parse(
        sessionStorage.getItem('route-metrics') || '[]'
      );
      console.group('🚦 Router Analytics');
      console.table(metrics);
      console.groupEnd();
    }
  });
}
