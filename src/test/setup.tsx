/**
 * Comprehensive Test Setup
 * Configures React Testing Library, performance testing, and global test utilities
 */

import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, beforeAll, afterAll, vi } from 'vitest'
import { performanceMonitor } from '../utils/performance'

// Global test performance tracking
let testStartTime: number
let currentTestName: string

// Setup performance monitoring for tests
beforeEach((context) => {
  testStartTime = performance.now()
  currentTestName = context.task?.name || 'Unknown Test'

  // Reset performance monitor for each test
  if (performanceMonitor) {
    performanceMonitor.clear()
  }
})

afterEach((context) => {
  // Clean up React Testing Library
  cleanup()

  // Track test performance
  const testDuration = performance.now() - testStartTime

  if (testDuration > 1000) {
    console.warn(`🐌 Slow test detected: "${currentTestName}" took ${testDuration.toFixed(2)}ms`)
  }

  // Log test performance metrics in development
  if (process.env.NODE_ENV === 'test' && process.env.VITEST_PERF_LOG === 'true') {
    console.log(`⏱️ Test "${currentTestName}" completed in ${testDuration.toFixed(2)}ms`)
  }
})

// Global setup
beforeAll(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
  }))

  // Mock requestIdleCallback
  global.requestIdleCallback = vi.fn().mockImplementation((callback) => {
    return setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 50 }), 0)
  })
  global.cancelIdleCallback = vi.fn().mockImplementation((id) => clearTimeout(id))

  // Mock performance API enhancements
  if (!global.performance.mark) {
    global.performance.mark = vi.fn()
  }
  if (!global.performance.measure) {
    global.performance.measure = vi.fn()
  }

  // Mock Web APIs
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => null),
      removeItem: vi.fn(() => null),
      clear: vi.fn(() => null),
    },
    writable: true,
  })

  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => null),
      removeItem: vi.fn(() => null),
      clear: vi.fn(() => null),
    },
    writable: true,
  })

  // Mock fetch
  global.fetch = vi.fn()

  // Mock console methods for test environment
  if (process.env.NODE_ENV === 'test') {
    // Suppress console.log in tests unless explicitly enabled
    if (!process.env.VITEST_CONSOLE_LOG) {
      vi.spyOn(console, 'log').mockImplementation(() => {})
    }

    // Keep console.warn and console.error for debugging
    const originalWarn = console.warn
    const originalError = console.error

    vi.spyOn(console, 'warn').mockImplementation((...args) => {
      if (process.env.VITEST_CONSOLE_WARN !== 'false') {
        originalWarn(...args)
      }
    })

    vi.spyOn(console, 'error').mockImplementation((...args) => {
      if (process.env.VITEST_CONSOLE_ERROR !== 'false') {
        originalError(...args)
      }
    })
  }

  // Mock Chart.js
  vi.mock('chart.js', () => ({
    Chart: {
      register: vi.fn(),
      defaults: {
        plugins: {
          legend: {
            display: true
          }
        }
      }
    },
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    PointElement: vi.fn(),
    LineElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    BarElement: vi.fn(),
    ArcElement: vi.fn(),
  }))

  // Mock React Query devtools
  vi.mock('@tanstack/react-query-devtools', () => ({
    ReactQueryDevtools: () => null,
  }))

  // Mock framer-motion for tests
  vi.mock('framer-motion', () => ({
    motion: {
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
      section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
      article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    },
    AnimatePresence: ({ children }: any) => children,
    useAnimation: () => ({
      start: vi.fn(),
      stop: vi.fn(),
      set: vi.fn(),
    }),
    useInView: () => [vi.fn(), true],
  }))

  // Setup test environment variables
  process.env.NODE_ENV = 'test'
  process.env.VITE_API_URL = 'http://localhost:3001/api'

  console.log('🧪 Test environment initialized')
})

// Global cleanup
afterAll(() => {
  vi.restoreAllMocks()
  console.log('🧹 Test environment cleaned up')
})

// Custom matchers for performance testing
expect.extend({
  toRenderWithin(received: number, expected: number) {
    const pass = received <= expected
    return {
      message: () => pass
        ? `Expected render time ${received}ms not to be within ${expected}ms`
        : `Expected render time ${received}ms to be within ${expected}ms`,
      pass,
    }
  },

  toHaveNoMemoryLeaks(received: () => void) {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    received()
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory

    const pass = memoryIncrease < 1000000 // Less than 1MB increase
    return {
      message: () => pass
        ? `Expected memory increase ${memoryIncrease} bytes to exceed 1MB`
        : `Expected memory increase ${memoryIncrease} bytes not to exceed 1MB`,
      pass,
    }
  },
})

// Performance testing utilities
export const performanceHelpers = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now()
    renderFn()
    await new Promise(resolve => setTimeout(resolve, 0)) // Wait for next tick
    return performance.now() - start
  },

  /**
   * Test component for memory leaks
   */
  testMemoryLeak: (renderFn: () => void, iterations: number = 10) => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

    for (let i = 0; i < iterations; i++) {
      renderFn()
      cleanup()
    }

    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    return finalMemory - initialMemory
  },

  /**
   * Wait for next render cycle
   */
  waitForRender: () => new Promise(resolve => setTimeout(resolve, 0)),

  /**
   * Simulate slow network conditions
   */
  simulateSlowNetwork: (delay: number = 1000) => {
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((...args) =>
      new Promise(resolve =>
        setTimeout(() => resolve(originalFetch(...args)), delay)
      )
    )
  },
}

// Test data factories
export const testDataFactory = {
  /**
   * Create test user data
   */
  createUser: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Create test store data
   */
  createStore: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Store',
    description: 'A test store for testing purposes',
    isActive: true,
    theme: 'default',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  /**
   * Create test product data
   */
  createProduct: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test Product',
    description: 'A test product',
    price: 19.99,
    category: 'test',
    inStock: true,
    ...overrides,
  }),
}

// Mock API responses
export const mockApiResponses = {
  /**
   * Mock successful API response
   */
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data }),
  }),

  /**
   * Mock error API response
   */
  error: (message: string, status: number = 400) => ({
    ok: false,
    status,
    json: async () => ({ success: false, error: message }),
  }),

  /**
   * Mock loading response (delayed)
   */
  loading: (data: any, delay: number = 1000) =>
    new Promise(resolve =>
      setTimeout(() => resolve(mockApiResponses.success(data)), delay)
    ),
}

// Component testing utilities
export const componentHelpers = {
  /**
   * Create wrapper with common providers
   */
  createWrapper: (initialEntries: string[] = ['/']) => {
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
    const { MemoryRouter } = require('react-router-dom')
    const { ThemeProvider, createTheme } = require('@mui/material/styles')
    const { CssBaseline } = require('@mui/material')

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, cacheTime: 0 },
        mutations: { retry: false },
      },
    })

    const theme = createTheme()

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  },

  /**
   * Render component with performance tracking
   */
  renderWithPerformance: async (component: React.ReactElement) => {
    const { render } = await import('@testing-library/react')
    const startTime = performance.now()
    const result = render(component)
    const renderTime = performance.now() - startTime

    return {
      ...result,
      renderTime,
      rerender: (ui: React.ReactElement) => {
        const rerenderStart = performance.now()
        const rerenderResult = result.rerender(ui)
        const rerenderTime = performance.now() - rerenderStart
        return { ...rerenderResult, rerenderTime }
      },
    }
  },
}

// Accessibility testing helpers
export const a11yHelpers = {
  /**
   * Test component for accessibility violations
   */
  testA11y: async (container: HTMLElement) => {
    // This would typically use axe-core, but for now we'll do basic checks
    const violations = []

    // Check for missing alt text on images
    const images = container.querySelectorAll('img:not([alt])')
    if (images.length > 0) {
      violations.push(`Found ${images.length} images without alt text`)
    }

    // Check for missing form labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id')
      return !id || !container.querySelector(`label[for="${id}"]`)
    })

    if (inputsWithoutLabels.length > 0) {
      violations.push(`Found ${inputsWithoutLabels.length} inputs without proper labels`)
    }

    return violations
  },
}

// Export all utilities for use in tests
export {
  performanceHelpers,
  testDataFactory,
  mockApiResponses,
  componentHelpers,
  a11yHelpers,
}

// Global types for test environment
declare global {
  interface CustomMatchers<R = unknown> {
    toRenderWithin(time: number): R
    toHaveNoMemoryLeaks(): R
  }
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
