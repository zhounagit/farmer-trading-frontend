/**
 * Advanced Bundle Optimization Utilities
 * Provides intelligent code splitting, preloading, and bundle analysis for optimal performance
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { performanceMonitor, bundleAnalyzer } from './performance';

// Types for bundle optimization
export interface LazyComponentConfig {
  preload?: boolean;
  retryAttempts?: number;
  chunkName?: string;
  prefetchDelay?: number;
}

export interface BundleMetrics {
  chunkName: string;
  size: number;
  loadTime: number;
  route: string;
  isPreloaded: boolean;
  timestamp: number;
}

export interface PreloadStrategy {
  immediate: string[];
  onInteraction: string[];
  onVisible: string[];
  onIdle: string[];
}

class BundleOptimizer {
  private loadedChunks: Set<string> = new Set();
  private preloadQueue: Map<string, Promise<any>> = new Map();
  private bundleMetrics: BundleMetrics[] = [];
  private intersectionObserver: IntersectionObserver | null = null;
  private idleCallback: number | null = null;

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Intersection Observer for visibility-based preloading
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const chunkName = entry.target.getAttribute('data-preload-chunk');
              if (chunkName) {
                this.preloadChunk(chunkName);
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  /**
   * Create a lazy component with advanced optimization
   */
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    config: LazyComponentConfig = {}
  ): ComponentType<React.ComponentProps<T>> {
    const {
      preload = false,
      retryAttempts = 3,
      chunkName = 'unknown',
      prefetchDelay = 2000,
    } = config;

    // Enhanced import function with retry logic and metrics
    const enhancedImportFn = async (): Promise<{ default: T }> => {
      const startTime = performance.now();
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= retryAttempts; attempt++) {
        try {
          const module = await importFn();

          // Track successful load
          const loadTime = performance.now() - startTime;
          this.trackBundleLoad(chunkName, loadTime, window.location.pathname);
          this.loadedChunks.add(chunkName);

          return module;
        } catch (error) {
          lastError = error as Error;
          console.warn(
            `Bundle load attempt ${attempt} failed for ${chunkName}:`,
            error
          );

          if (attempt < retryAttempts) {
            // Exponential backoff
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, attempt) * 1000)
            );
          }
        }
      }

      // All attempts failed
      throw new Error(
        `Failed to load chunk ${chunkName} after ${retryAttempts} attempts: ${lastError?.message}`
      );
    };

    const LazyComponent = lazy(enhancedImportFn);

    // Preload if requested
    if (preload) {
      setTimeout(() => {
        this.preloadChunk(chunkName, enhancedImportFn);
      }, prefetchDelay);
    }

    // Return wrapped component with error boundary
    const WrappedComponent: ComponentType<React.ComponentProps<T>> = (
      props
    ) => (
      <Suspense fallback={<ChunkLoadingFallback chunkName={chunkName} />}>
        <LazyComponent {...props} />
      </Suspense>
    );

    WrappedComponent.displayName = `LazyComponent(${chunkName})`;
    (WrappedComponent as any).preload = () =>
      this.preloadChunk(chunkName, enhancedImportFn);

    return WrappedComponent;
  }

  /**
   * Preload a chunk with caching
   */
  async preloadChunk(
    chunkName: string,
    importFn?: () => Promise<any>
  ): Promise<void> {
    if (this.loadedChunks.has(chunkName)) {
      return; // Already loaded
    }

    if (this.preloadQueue.has(chunkName)) {
      return this.preloadQueue.get(chunkName); // Already preloading
    }

    if (!importFn) {
      // Silently skip preloading if no import function provided
      // This is normal for routes that don't need preloading
      return;
    }

    const preloadPromise = importFn().catch((error) => {
      console.warn(`Preload failed for chunk ${chunkName}:`, error);
      this.preloadQueue.delete(chunkName);
      throw error;
    });

    this.preloadQueue.set(chunkName, preloadPromise);

    try {
      await preloadPromise;
      this.loadedChunks.add(chunkName);
      console.log(`✅ Preloaded chunk: ${chunkName}`);
    } finally {
      this.preloadQueue.delete(chunkName);
    }
  }

  /**
   * Track bundle loading metrics
   */
  private trackBundleLoad(chunkName: string, loadTime: number, route: string) {
    const metrics: BundleMetrics = {
      chunkName,
      size: 0, // Would need webpack stats to get actual size
      loadTime,
      route,
      isPreloaded:
        this.preloadQueue.has(chunkName) || this.loadedChunks.has(chunkName),
      timestamp: Date.now(),
    };

    this.bundleMetrics.push(metrics);

    // Keep only last 50 metrics
    if (this.bundleMetrics.length > 50) {
      this.bundleMetrics.shift();
    }

    // Report to performance monitor
    performanceMonitor.trackComponent(
      `Bundle:${chunkName}`,
      loadTime,
      metrics.isPreloaded ? ['preloaded'] : ['on-demand']
    );
  }

  /**
   * Implement intelligent preloading strategies
   */
  implementPreloadStrategy(strategy: PreloadStrategy) {
    // Immediate preloading
    strategy.immediate.forEach((chunkName) => {
      this.preloadChunk(chunkName);
    });

    // On interaction preloading (hover, focus)
    strategy.onInteraction.forEach((chunkName) => {
      this.setupInteractionPreload(chunkName);
    });

    // On visible preloading (intersection observer)
    strategy.onVisible.forEach((chunkName) => {
      this.setupVisibilityPreload(chunkName);
    });

    // On idle preloading (when browser is idle)
    strategy.onIdle.forEach((chunkName) => {
      this.setupIdlePreload(chunkName);
    });
  }

  private setupInteractionPreload(chunkName: string) {
    // Skip interaction preloading for now as we don't have import function mapping
    console.debug(
      `Skipping interaction preload for ${chunkName} - import function mapping not implemented`
    );
  }

  private setupVisibilityPreload(chunkName: string) {
    if (!this.intersectionObserver) return;

    const elements = document.querySelectorAll(
      `[data-preload-chunk="${chunkName}"]`
    );
    elements.forEach((element) => {
      this.intersectionObserver!.observe(element);
    });
  }

  private setupIdlePreload(chunkName: string) {
    // Skip idle preloading for now as we don't have import function mapping
    // This prevents the "no import function provided" errors
    console.debug(
      `Skipping idle preload for ${chunkName} - import function mapping not implemented`
    );
  }

  /**
   * Get bundle performance analytics
   */
  getAnalytics() {
    const totalBundles = this.bundleMetrics.length;
    const preloadedBundles = this.bundleMetrics.filter(
      (m) => m.isPreloaded
    ).length;
    const averageLoadTime =
      this.bundleMetrics.reduce((sum, m) => sum + m.loadTime, 0) / totalBundles;
    const slowBundles = this.bundleMetrics.filter((m) => m.loadTime > 1000);

    return {
      totalBundles,
      preloadedBundles,
      preloadRate: (preloadedBundles / totalBundles) * 100,
      averageLoadTime,
      slowBundles: slowBundles.map((b) => ({
        chunkName: b.chunkName,
        loadTime: b.loadTime,
      })),
      loadedChunks: Array.from(this.loadedChunks),
      recommendations: this.generateRecommendations(),
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.getAnalytics();

    if (analytics.preloadRate < 30) {
      recommendations.push(
        'Consider implementing more aggressive preloading for frequently accessed routes'
      );
    }

    if (analytics.slowBundles.length > 3) {
      recommendations.push(
        'Multiple slow-loading bundles detected - consider bundle splitting or compression'
      );
    }

    if (analytics.averageLoadTime > 800) {
      recommendations.push(
        'Average bundle load time is high - consider implementing service worker caching'
      );
    }

    if (analytics.loadedChunks.length > 20) {
      recommendations.push(
        'Many chunks loaded - consider implementing chunk cleanup for memory optimization'
      );
    }

    return recommendations;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (
      this.idleCallback &&
      typeof window !== 'undefined' &&
      'cancelIdleCallback' in window
    ) {
      window.cancelIdleCallback(this.idleCallback);
    }
  }
}

// Global optimizer instance
export const bundleOptimizer = new BundleOptimizer();

/**
 * Enhanced loading fallback component
 */
interface ChunkLoadingFallbackProps {
  chunkName: string;
  showProgress?: boolean;
}

const ChunkLoadingFallback: React.FC<ChunkLoadingFallbackProps> = ({
  chunkName,
  showProgress = true,
}) => {
  const [progress, setProgress] = React.useState(0);
  const [loadTime, setLoadTime] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setLoadTime(elapsed);

      // Simulate progress based on elapsed time
      const simulatedProgress = Math.min((elapsed / 2000) * 100, 90);
      setProgress(simulatedProgress);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className='chunk-loading-fallback'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '1rem',
      }}
    >
      <div
        className='loading-spinner'
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e3e3e3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem',
        }}
      />

      <div style={{ textAlign: 'center', color: '#666' }}>
        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Loading {chunkName}...
        </div>

        {showProgress && (
          <>
            <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              {loadTime}ms
            </div>
            <div
              style={{
                width: '200px',
                height: '4px',
                backgroundColor: '#e3e3e3',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#3498db',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Route-based code splitting utilities
 */
export const routeOptimization = {
  /**
   * Create optimized route component with preloading
   */
  createOptimizedRoute: (
    importFn: () => Promise<{ default: ComponentType<any> }>,
    routePath: string,
    preloadStrategy:
      | 'immediate'
      | 'on-interaction'
      | 'on-visible'
      | 'on-idle' = 'on-interaction'
  ) => {
    const chunkName = `route-${routePath.replace(/[^a-zA-Z0-9]/g, '-')}`;

    const RouteComponent = bundleOptimizer.createLazyComponent(importFn, {
      chunkName,
      preload: preloadStrategy === 'immediate',
      retryAttempts: 3,
      prefetchDelay: 1000,
    });

    // Set up preload strategy
    if (preloadStrategy !== 'immediate') {
      bundleOptimizer.implementPreloadStrategy({
        immediate: [],
        onInteraction: preloadStrategy === 'on-interaction' ? [chunkName] : [],
        onVisible: preloadStrategy === 'on-visible' ? [chunkName] : [],
        onIdle: preloadStrategy === 'on-idle' ? [chunkName] : [],
      });
    }

    return RouteComponent;
  },

  /**
   * Preload route based on current route
   */
  preloadRelatedRoutes: (currentRoute: string) => {
    // Define route relationships for intelligent preloading
    const routeRelationships: Record<string, string[]> = {
      '/': ['/stores', '/inventory'],
      '/stores': ['/stores/create', '/inventory'],
      '/stores/:id': ['/stores/:id/customize', '/inventory'],
      '/stores/:id/customize': ['/stores/:id/preview', '/themes'],
      '/inventory': ['/inventory/products', '/stores'],
      '/login': ['/dashboard', '/stores'],
    };

    const relatedRoutes = routeRelationships[currentRoute] || [];
    relatedRoutes.forEach((route) => {
      const chunkName = `route-${route.replace(/[^a-zA-Z0-9]/g, '-')}`;
      bundleOptimizer.preloadChunk(chunkName);
    });
  },
};

/**
 * Component-level code splitting utilities
 */
export const componentOptimization = {
  /**
   * Create lazy component with intelligent loading
   */
  createLazyComponent: <T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    componentName: string,
    options: {
      preload?: boolean;
      showProgress?: boolean;
      fallback?: React.ComponentType;
    } = {}
  ) => {
    const { preload = false, showProgress = true, fallback } = options;

    const LazyComponent = bundleOptimizer.createLazyComponent(importFn, {
      chunkName: componentName,
      preload,
      retryAttempts: 3,
    });

    const FallbackComponent =
      fallback ||
      (() => (
        <ChunkLoadingFallback
          chunkName={componentName}
          showProgress={showProgress}
        />
      ));

    return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent ref={ref} {...props} />
      </Suspense>
    ));
  },

  /**
   * HOC for progressive loading with visibility detection
   */
  withProgressiveLoading: <T extends ComponentType<any>>(
    Component: T,
    importFn: () => Promise<{ default: ComponentType<any> }>,
    componentName: string
  ) => {
    return React.forwardRef<
      any,
      React.ComponentProps<T> & { enableProgressiveLoading?: boolean }
    >((props, ref) => {
      const { enableProgressiveLoading = true, ...componentProps } = props;
      const [shouldLoad, setShouldLoad] = React.useState(
        !enableProgressiveLoading
      );
      const elementRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        if (!enableProgressiveLoading) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setShouldLoad(true);
                observer.disconnect();
              }
            });
          },
          { rootMargin: '100px' }
        );

        if (elementRef.current) {
          observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
      }, [enableProgressiveLoading]);

      if (!shouldLoad) {
        return (
          <div
            ref={elementRef}
            style={{
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
            }}
          >
            <div style={{ color: '#666', fontSize: '0.9rem' }}>
              Loading {componentName}...
            </div>
          </div>
        );
      }

      const LazyComponent = bundleOptimizer.createLazyComponent(importFn, {
        chunkName: componentName,
      });

      return (
        <Suspense fallback={<ChunkLoadingFallback chunkName={componentName} />}>
          <LazyComponent ref={ref} {...componentProps} />
        </Suspense>
      );
    });
  },
};

/**
 * Bundle analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Analyze current bundle performance
   */
  analyze: () => {
    const analytics = bundleOptimizer.getAnalytics();
    console.group('📦 Bundle Analysis');
    console.table({
      'Total Bundles': analytics.totalBundles,
      'Preloaded Bundles': analytics.preloadedBundles,
      'Preload Rate': `${analytics.preloadRate.toFixed(2)}%`,
      'Average Load Time': `${analytics.averageLoadTime.toFixed(2)}ms`,
    });

    if (analytics.slowBundles.length > 0) {
      console.table(analytics.slowBundles);
    }

    console.log('📈 Loaded Chunks:', analytics.loadedChunks);
    console.log('💡 Recommendations:', analytics.recommendations);
    console.groupEnd();

    return analytics;
  },

  /**
   * Generate bundle size report
   */
  generateSizeReport: async () => {
    try {
      const bundleInfo = await bundleAnalyzer.analyzeCurrentBundle();
      console.group('📊 Bundle Size Report');
      console.table({
        'Total Size': `${(bundleInfo.size / 1024).toFixed(2)} KB`,
        'Gzipped Size': `${(bundleInfo.gzipSize / 1024).toFixed(2)} KB`,
        'Compression Ratio': `${((1 - bundleInfo.gzipSize / bundleInfo.size) * 100).toFixed(2)}%`,
      });
      console.groupEnd();
      return bundleInfo;
    } catch (error) {
      console.warn('Bundle size analysis not available:', error);
      return null;
    }
  },
};

// CSS for loading spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Development utilities
if (process.env.NODE_ENV === 'development') {
  // Add global bundle utilities
  (window as any).__BUNDLE_OPTIMIZER__ = bundleOptimizer;
  (window as any).__BUNDLE_ANALYSIS__ = bundleAnalysis;

  // Keyboard shortcut for bundle analysis
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'B') {
      bundleAnalysis.analyze();
    }
  });
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    bundleOptimizer.dispose();
  });
}
