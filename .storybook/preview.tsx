import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React from 'react';
import { performanceMonitor } from '../src/utils/performance';
import { withPerformanceTracking } from '../src/hooks/useAdvancedMemo';

// Create theme for stories
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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

// Dark theme variant
const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
  },
});

// Create React Query client for stories
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Performance tracking decorator
const withPerformanceMonitoring = (Story: any, context: any) => {
  const storyName = `${context.title}/${context.name}`;

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.__STORYBOOK_PERFORMANCE__) {
      window.__STORYBOOK_PERFORMANCE__.startRender();

      // End render on next tick
      setTimeout(() => {
        window.__STORYBOOK_PERFORMANCE__.endRender(storyName);
      }, 0);
    }
  }, [storyName]);

  // Track render performance with our performance utilities
  const TrackedStory = withPerformanceTracking(Story, storyName);

  return <TrackedStory />;
};

// Accessibility decorator
const withA11yTesting = (Story: any, context: any) => {
  React.useEffect(() => {
    // Simple accessibility checks
    const checkA11y = () => {
      const container = document.getElementById('storybook-root');
      if (!container) return;

      const violations = [];

      // Check for images without alt text
      const images = container.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        violations.push(`${images.length} images missing alt text`);
      }

      // Check for inputs without labels
      const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !container.querySelector(`label[for="${id}"]`);
      });

      if (unlabeledInputs.length > 0) {
        violations.push(`${unlabeledInputs.length} inputs missing proper labels`);
      }

      // Check for buttons without accessible text
      const buttons = container.querySelectorAll('button:not([aria-label])');
      const emptyButtons = Array.from(buttons).filter(button => {
        return !button.textContent?.trim() && !button.querySelector('svg[aria-label]');
      });

      if (emptyButtons.length > 0) {
        violations.push(`${emptyButtons.length} buttons missing accessible text`);
      }

      // Display violations
      if (violations.length > 0) {
        console.warn('Accessibility violations in story:', context.title + '/' + context.name);
        violations.forEach(violation => console.warn('  -', violation));

        // Add visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'a11y-indicator error';
        indicator.textContent = `A11y: ${violations.length} issues`;
        indicator.style.position = 'absolute';
        indicator.style.top = '8px';
        indicator.style.right = '8px';
        indicator.style.zIndex = '9999';
        container.appendChild(indicator);
      } else {
        // Add success indicator
        const indicator = document.createElement('div');
        indicator.className = 'a11y-indicator';
        indicator.textContent = 'A11y: OK';
        indicator.style.position = 'absolute';
        indicator.style.top = '8px';
        indicator.style.right = '8px';
        indicator.style.zIndex = '9999';
        container.appendChild(indicator);
      }
    };

    // Check accessibility after render
    const timeoutId = setTimeout(checkA11y, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up indicators
      const indicators = document.querySelectorAll('.a11y-indicator');
      indicators.forEach(indicator => indicator.remove());
    };
  }, [context]);

  return <Story />;
};

// React Query decorator
const withReactQuery = (Story: any) => {
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
};

// Router decorator
const withRouter = (Story: any, context: any) => {
  const initialEntries = context.parameters.router?.initialEntries || ['/'];

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <Story />
    </MemoryRouter>
  );
};

// Theme decorator
const withMuiTheme = (Story: any, context: any) => {
  const selectedTheme = context.globals.theme === 'dark' ? darkTheme : theme;

  return (
    <ThemeProvider theme={selectedTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div style={{ padding: '1rem', minHeight: '100vh', backgroundColor: selectedTheme.palette.background.default }}>
          <Story />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

// Console interceptor for better debugging
const withConsoleInterceptor = (Story: any, context: any) => {
  React.useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      // Filter out common React warnings in development
      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('Warning: ReactDOM.render is no longer supported') ||
            message.includes('Warning: React.createFactory() is deprecated') ||
            message.includes('Warning: componentWillReceiveProps has been renamed')) {
          return;
        }
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      // Filter out common development warnings
      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('Warning: Each child in a list should have a unique "key" prop') ||
            message.includes('Warning: Failed prop type')) {
          return;
        }
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return <Story />;
};

// Error boundary decorator
class StoryErrorBoundary extends React.Component<
  { children: React.ReactNode; storyName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; storyName: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in story "${this.props.storyName}":`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          border: '2px solid #dc3545',
          borderRadius: '8px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          margin: '1rem',
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Story Error</h3>
          <p style={{ margin: '0 0 1rem 0', fontFamily: 'monospace' }}>
            {this.state.error?.message || 'An unknown error occurred'}
          </p>
          <details style={{ fontSize: '0.9em' }}>
            <summary>Stack trace</summary>
            <pre style={{ marginTop: '0.5rem', fontSize: '0.8em', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry Story
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const withErrorBoundary = (Story: any, context: any) => (
  <StoryErrorBoundary storyName={`${context.title}/${context.name}`}>
    <Story />
  </StoryErrorBoundary>
);

// Viewport decorator for responsive testing
const withViewportTesting = (Story: any, context: any) => {
  const viewport = context.globals.viewport;

  React.useEffect(() => {
    if (viewport && viewport !== 'reset') {
      console.log(`📱 Testing story at ${viewport} viewport`);
    }
  }, [viewport]);

  return <Story />;
};

// Mock data decorator
const withMockData = (Story: any, context: any) => {
  const mockData = context.parameters.mockData;

  React.useEffect(() => {
    if (mockData) {
      // Set up mock data in global context
      (window as any).__STORYBOOK_MOCK_DATA__ = mockData;
      console.log('🎭 Mock data loaded for story:', Object.keys(mockData));
    }

    return () => {
      delete (window as any).__STORYBOOK_MOCK_DATA__;
    };
  }, [mockData]);

  return <Story />;
};

const preview: Preview = {
  parameters: {
    // Layout configuration
    layout: 'centered',

    // Actions configuration
    actions: {
      argTypesRegex: '^on[A-Z].*',
      handles: ['mouseover', 'click', 'focus', 'blur']
    },

    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
      hideNoControlsWarning: true,
    },

    // Docs configuration
    docs: {
      extractComponentDescription: (component: any, { notes }: any) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text;
        }
        return null;
      },
      source: {
        type: 'dynamic',
        excludeDecorators: true,
      },
    },

    // Backgrounds
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#333333' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },

    // Viewport options
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        laptop: {
          name: 'Laptop',
          styles: { width: '1024px', height: '768px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },

    // Performance monitoring
    performance: {
      enableMonitoring: true,
      renderTimeThreshold: 100, // ms
      memoryThreshold: 50 * 1024 * 1024, // 50MB
    },

    // Accessibility testing
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: true,
    },
  },

  // Global types for toolbar controls
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light theme' },
          { value: 'dark', icon: 'circle', title: 'Dark theme' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    performance: {
      name: 'Performance Monitoring',
      description: 'Toggle performance monitoring',
      defaultValue: 'enabled',
      toolbar: {
        icon: 'timer',
        items: [
          { value: 'enabled', title: 'Performance monitoring enabled' },
          { value: 'disabled', title: 'Performance monitoring disabled' },
        ],
        showName: true,
      },
    },
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'es', right: '🇪🇸', title: 'Español' },
          { value: 'fr', right: '🇫🇷', title: 'Français' },
        ],
        showName: true,
      },
    },
  },

  // Decorators - order matters (last decorator wraps first)
  decorators: [
    withConsoleInterceptor,
    withErrorBoundary,
    withPerformanceMonitoring,
    withA11yTesting,
    withViewportTesting,
    withMockData,
    withReactQuery,
    withRouter,
    withMuiTheme,
  ],

  // Initial globals
  initialGlobals: {
    theme: 'light',
    performance: 'enabled',
    locale: 'en',
  },

  // Tags configuration
  tags: ['autodocs'],
};

export default preview;

// Global setup for Storybook
if (typeof window !== 'undefined') {
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+P for performance report
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      if (window.__STORYBOOK_PERFORMANCE__) {
        const report = window.__STORYBOOK_PERFORMANCE__.getReport();
        console.group('📊 Storybook Performance Report');
        console.table(report);
        console.groupEnd();
      }
    }

    // Ctrl+Shift+A for accessibility report
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      console.log('♿ Running accessibility check...');
      // Trigger accessibility check manually
      const container = document.getElementById('storybook-root');
      if (container) {
        const event = new CustomEvent('storybook:a11y-check');
        container.dispatchEvent(event);
      }
    }
  });

  // Performance monitoring setup
  if (performanceMonitor && typeof performanceMonitor.setEnabled === 'function') {
    performanceMonitor.setEnabled(true);
  }

  // Add global Storybook utilities
  (window as any).__STORYBOOK_UTILS__ = {
    performanceMonitor,
    getPerformanceReport: () => {
      if (window.__STORYBOOK_PERFORMANCE__) {
        return window.__STORYBOOK_PERFORMANCE__.getReport();
      }
      return null;
    },
    clearPerformanceData: () => {
      if (window.__STORYBOOK_PERFORMANCE__) {
        window.__STORYBOOK_PERFORMANCE__.renderTimes = [];
      }
    },
  };

  console.log('🚀 Storybook enhanced with performance monitoring and accessibility testing');
}
