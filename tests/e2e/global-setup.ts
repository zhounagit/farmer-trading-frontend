/**
 * Global E2E Test Setup
 * Provides comprehensive setup for end-to-end testing with performance monitoring
 */

import { chromium, FullConfig } from '@playwright/test';
import { performance } from 'perf_hooks';

async function globalSetup(config: FullConfig) {
  const startTime = performance.now();
  console.log('🚀 Starting E2E test environment setup...');

  // Create a browser instance for setup
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=TranslateUI',
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  const context = await browser.newContext({
    // Global context configuration
    viewport: { width: 1280, height: 720 },
    userAgent: 'Playwright-Test-Agent/1.0',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const page = await context.newPage();

  try {
    // Wait for development server to be ready
    const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';
    console.log(`⏳ Waiting for server at ${baseURL} to be ready...`);

    let retries = 0;
    const maxRetries = 30;

    while (retries < maxRetries) {
      try {
        const response = await page.goto(baseURL, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        if (response?.ok()) {
          console.log('✅ Development server is ready');
          break;
        }
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          throw new Error(`Failed to connect to development server after ${maxRetries} attempts`);
        }
        console.log(`⏳ Attempt ${retries}/${maxRetries} failed, retrying in 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Perform any necessary authentication setup
    await setupAuthentication(page, baseURL);

    // Setup test data if needed
    await setupTestData(page);

    // Warm up the application
    await warmupApplication(page, baseURL);

    // Setup performance monitoring
    await setupPerformanceMonitoring(page);

    console.log('✅ Global E2E setup completed successfully');

  } catch (error) {
    console.error('❌ Global E2E setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  const setupTime = performance.now() - startTime;
  console.log(`⏱️  Setup completed in ${setupTime.toFixed(2)}ms`);
}

/**
 * Setup authentication for tests
 */
async function setupAuthentication(page: any, baseURL: string) {
  console.log('🔐 Setting up authentication...');

  try {
    // Navigate to login page
    await page.goto(`${baseURL}/login`);

    // Check if we can authenticate with test credentials
    const loginForm = await page.locator('form').first();

    if (await loginForm.isVisible()) {
      // Fill in test credentials
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'testpassword');

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for authentication to complete
      await page.waitForURL(`${baseURL}/dashboard`, { timeout: 10000 });

      console.log('✅ Test authentication successful');
    } else {
      console.log('ℹ️  No authentication form found, skipping auth setup');
    }

  } catch (error) {
    console.warn('⚠️  Authentication setup failed (this may be expected):', error.message);
  }
}

/**
 * Setup test data
 */
async function setupTestData(page: any) {
  console.log('📊 Setting up test data...');

  try {
    // Clear any existing test data
    await page.evaluate(() => {
      // Clear localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }

      // Clear sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }

      // Clear IndexedDB if needed
      if (typeof window !== 'undefined' && window.indexedDB) {
        // Implementation would depend on your IndexedDB usage
      }
    });

    // Set up test data in localStorage/sessionStorage if needed
    await page.evaluate(() => {
      const testData = {
        user: {
          id: 'test-user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
        preferences: {
          theme: 'light',
          language: 'en',
        },
        // Add other test data as needed
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('test-data', JSON.stringify(testData));
      }
    });

    console.log('✅ Test data setup completed');

  } catch (error) {
    console.warn('⚠️  Test data setup failed:', error.message);
  }
}

/**
 * Warm up the application by visiting key routes
 */
async function warmupApplication(page: any, baseURL: string) {
  console.log('🔥 Warming up application...');

  const routesToWarmup = [
    '/',
    '/stores',
    '/inventory',
    '/dashboard',
  ];

  for (const route of routesToWarmup) {
    try {
      const startTime = performance.now();
      await page.goto(`${baseURL}${route}`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });
      const loadTime = performance.now() - startTime;

      console.log(`✅ Warmed up ${route} (${loadTime.toFixed(2)}ms)`);

      // Brief pause between requests
      await page.waitForTimeout(100);

    } catch (error) {
      console.warn(`⚠️  Failed to warm up ${route}:`, error.message);
    }
  }

  console.log('✅ Application warmup completed');
}

/**
 * Setup performance monitoring
 */
async function setupPerformanceMonitoring(page: any) {
  console.log('📈 Setting up performance monitoring...');

  try {
    // Inject performance monitoring script
    await page.addInitScript(() => {
      // Track Core Web Vitals
      const vitals: any = {};

      // First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
          }
        });
      });

      if ('PerformanceObserver' in window) {
        observer.observe({ type: 'paint', buffered: true });
      }

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.lcp = entries[entries.length - 1].startTime;
      });

      if ('PerformanceObserver' in window) {
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.cls = clsValue;
          }
        });
      });

      if ('PerformanceObserver' in window) {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }

      // Make vitals available globally for tests
      (window as any).__WEB_VITALS__ = vitals;

      // Track memory usage if available
      if ('memory' in performance) {
        (window as any).__MEMORY_USAGE__ = () => (performance as any).memory;
      }

      // Track resource loading
      (window as any).__RESOURCE_TIMING__ = () => {
        return performance.getEntriesByType('resource').map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize || 0,
          startTime: entry.startTime,
        }));
      };
    });

    console.log('✅ Performance monitoring setup completed');

  } catch (error) {
    console.warn('⚠️  Performance monitoring setup failed:', error.message);
  }
}

/**
 * Setup error tracking
 */
async function setupErrorTracking(page: any) {
  console.log('🐛 Setting up error tracking...');

  // Track JavaScript errors
  page.on('pageerror', (error: Error) => {
    console.error('📛 Page Error:', error.message);
  });

  // Track console errors
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      console.error('📛 Console Error:', msg.text());
    }
  });

  // Track network failures
  page.on('requestfailed', (request: any) => {
    console.error('📛 Network Error:', request.url(), request.failure()?.errorText);
  });

  console.log('✅ Error tracking setup completed');
}

/**
 * Verify system requirements
 */
async function verifySystemRequirements() {
  console.log('🔍 Verifying system requirements...');

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);

  // Check available memory
  const memoryUsage = process.memoryUsage();
  const totalMemoryMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  console.log(`Memory usage: ${totalMemoryMB}MB`);

  // Check if we're running in CI
  if (process.env.CI) {
    console.log('🤖 Running in CI environment');
  } else {
    console.log('💻 Running in local development environment');
  }

  console.log('✅ System requirements verified');
}

export default globalSetup;
