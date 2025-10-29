/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking, bundle analysis, and optimization helpers
 */

import React from 'react';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface ComponentMetrics {
  name: string;
  renderTime: number;
  rerenderCount: number;
  propsChanged: string[];
  timestamp: number;
}

export interface BundleAnalytics {
  chunkSize: number;
  loadTime: number;
  route: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: ComponentMetrics[] = [];
  private bundleMetrics: BundleAnalytics[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = localStorage.getItem('perf-monitor') === 'true';

    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Web Vitals observer
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.reportMetric('FCP', entry.startTime);
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.reportMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.reportMetric('CLS', clsValue);
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    }
  }

  /**
   * Track component render performance
   */
  trackComponent(
    name: string,
    renderTime: number,
    propsChanged: string[] = []
  ) {
    if (!this.isEnabled) return;

    const existingMetric = this.metrics.find((m) => m.name === name);

    if (existingMetric) {
      existingMetric.rerenderCount++;
      existingMetric.renderTime = (existingMetric.renderTime + renderTime) / 2; // Average
      existingMetric.propsChanged = [
        ...new Set([...existingMetric.propsChanged, ...propsChanged]),
      ];
      existingMetric.timestamp = Date.now();
    } else {
      this.metrics.push({
        name,
        renderTime,
        rerenderCount: 1,
        propsChanged,
        timestamp: Date.now(),
      });
    }

    // Warn about slow components
    if (renderTime > 16) {
      // > 16ms might cause frame drops
      console.warn(
        `🐌 Slow component detected: ${name} took ${renderTime.toFixed(2)}ms to render`
      );
    }
  }

  /**
   * Track bundle loading performance
   */
  trackBundleLoad(route: string, chunkSize: number, loadTime: number) {
    if (!this.isEnabled) return;

    this.bundleMetrics.push({
      chunkSize,
      loadTime,
      route,
      timestamp: Date.now(),
    });

    // Warn about large bundles
    if (chunkSize > 500000) {
      // > 500KB
      console.warn(
        `📦 Large bundle detected for ${route}: ${(chunkSize / 1024).toFixed(2)}KB`
      );
    }

    // Warn about slow loading
    if (loadTime > 1000) {
      // > 1 second
      console.warn(`⏱️ Slow bundle load for ${route}: ${loadTime}ms`);
    }
  }

  /**
   * Get performance report
   */
  getReport(): {
    components: ComponentMetrics[];
    bundles: BundleAnalytics[];
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Analyze component performance
    const slowComponents = this.metrics.filter((m) => m.renderTime > 10);
    const frequentRerenders = this.metrics.filter((m) => m.rerenderCount > 10);

    if (slowComponents.length > 0) {
      recommendations.push(
        `Consider optimizing these slow components: ${slowComponents.map((c) => c.name).join(', ')}`
      );
    }

    if (frequentRerenders.length > 0) {
      recommendations.push(
        `These components re-render frequently: ${frequentRerenders.map((c) => c.name).join(', ')}. Consider using React.memo or useMemo.`
      );
    }

    // Analyze bundle performance
    const largeBundles = this.bundleMetrics.filter((b) => b.chunkSize > 300000);
    const slowBundles = this.bundleMetrics.filter((b) => b.loadTime > 800);

    if (largeBundles.length > 0) {
      recommendations.push(
        `Consider code splitting for these large bundles: ${largeBundles.map((b) => b.route).join(', ')}`
      );
    }

    if (slowBundles.length > 0) {
      recommendations.push(
        `Consider preloading or optimizing these slow-loading routes: ${slowBundles.map((b) => b.route).join(', ')}`
      );
    }

    return {
      components: this.metrics,
      bundles: this.bundleMetrics,
      recommendations,
    };
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
    this.bundleMetrics = [];
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('perf-monitor', enabled.toString());

    if (!enabled && this.observers.length > 0) {
      this.observers.forEach((observer) => observer.disconnect());
      this.observers = [];
    } else if (enabled && this.observers.length === 0) {
      this.initializeObservers();
    }
  }

  /**
   * Check if performance monitoring is currently enabled
   */
  isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }

  private reportMetric(name: string, value: number) {
    if (this.isEnabled) {
      console.log(`📊 ${name}: ${value.toFixed(2)}ms`);

      // Report to analytics service if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'web_vital', {
          event_category: 'Web Vitals',
          event_label: name,
          value: Math.round(value),
          non_interaction: true,
        });
      }
    }
  }

  /**
   * Dispose of all observers
   */
  dispose() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for component performance tracking
 */
export const usePerformanceTracking = (componentName: string) => {
  const trackRender = React.useCallback(
    (renderTime: number, propsChanged?: string[]) => {
      performanceMonitor.trackComponent(
        componentName,
        renderTime,
        propsChanged
      );
    },
    [componentName]
  );

  return trackRender;
};

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    const name =
      componentName || Component.displayName || Component.name || 'Unknown';
    const renderStartTime = React.useRef<number>(0);
    const prevProps = React.useRef<T>();

    React.useLayoutEffect(() => {
      renderStartTime.current = performance.now();
    });

    React.useLayoutEffect(() => {
      const renderTime = performance.now() - renderStartTime.current;

      // Detect changed props
      const changedProps: string[] = [];
      if (prevProps.current) {
        Object.keys(props).forEach((key) => {
          if (props[key as keyof T] !== prevProps.current![key as keyof T]) {
            changedProps.push(key);
          }
        });
      }

      performanceMonitor.trackComponent(name, renderTime, changedProps);
      prevProps.current = props;
    });

    return React.createElement(Component, { ref, ...props });
  });

  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Bundle analyzer utilities
 */
export const bundleAnalyzer = {
  /**
   * Analyze current bundle size
   */
  async analyzeCurrentBundle(): Promise<{ size: number; gzipSize: number }> {
    if (typeof window === 'undefined') return { size: 0, gzipSize: 0 };

    try {
      const response = await fetch('/stats.json'); // Webpack bundle analyzer output
      const stats = await response.json();

      return {
        size:
          stats.assets?.reduce(
            (total: number, asset: any) => total + asset.size,
            0
          ) || 0,
        gzipSize:
          stats.assets?.reduce(
            (total: number, asset: any) =>
              total + (asset.gzipSize || asset.size * 0.3),
            0
          ) || 0,
      };
    } catch (error) {
      console.warn('Bundle analysis not available:', error);
      return { size: 0, gzipSize: 0 };
    }
  },

  /**
   * Track route-based code splitting
   */
  trackRouteLoad(route: string): () => void {
    const startTime = performance.now();
    const startSize = (performance as any).memory?.usedJSHeapSize || 0;

    return () => {
      const endTime = performance.now();
      const endSize = (performance as any).memory?.usedJSHeapSize || 0;
      const loadTime = endTime - startTime;
      const chunkSize = endSize - startSize;

      performanceMonitor.trackBundleLoad(route, Math.abs(chunkSize), loadTime);
    };
  },
};

/**
 * Core Web Vitals utilities
 */
export const webVitals = {
  /**
   * Get current Core Web Vitals
   */
  async getCurrentVitals(): Promise<Partial<PerformanceMetrics>> {
    const vitals: Partial<PerformanceMetrics> = {};

    // Time to First Byte
    const navigationTiming = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    if (navigationTiming) {
      vitals.ttfb =
        navigationTiming.responseStart - navigationTiming.requestStart;
    }

    // Get paint timings
    const paintTimings = performance.getEntriesByType('paint');
    const fcp = paintTimings.find(
      (entry) => entry.name === 'first-contentful-paint'
    );
    if (fcp) {
      vitals.fcp = fcp.startTime;
    }

    return vitals;
  },

  /**
   * Monitor Core Web Vitals continuously
   */
  startMonitoring(callback: (vitals: Partial<PerformanceMetrics>) => void) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        switch (entry.entryType) {
          case 'paint':
            if (entry.name === 'first-contentful-paint') {
              callback({ fcp: entry.startTime });
            }
            break;
          case 'largest-contentful-paint':
            callback({ lcp: entry.startTime });
            break;
          case 'first-input':
            callback({
              fid:
                (entry as PerformanceEventTiming).processingStart -
                entry.startTime,
            });
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              callback({ cls: (entry as any).value });
            }
            break;
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });

    return () => observer.disconnect();
  },
};

/**
 * Memory usage utilities
 */
export const memoryMonitor = {
  /**
   * Get current memory usage
   */
  getCurrentUsage(): {
    used: number;
    total: number;
    percentage: number;
  } | null {
    if (!(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  },

  /**
   * Monitor memory usage over time
   */
  startMonitoring(interval: number = 5000): () => void {
    const measurements: Array<{
      timestamp: number;
      usage: ReturnType<typeof this.getCurrentUsage>;
    }> = [];

    const monitor = setInterval(() => {
      const usage = this.getCurrentUsage();
      if (usage) {
        measurements.push({ timestamp: Date.now(), usage });

        // Keep only last 100 measurements
        if (measurements.length > 100) {
          measurements.shift();
        }

        // Warn about high memory usage
        if (usage.percentage > 80) {
          console.warn(
            `🧠 High memory usage detected: ${usage.percentage.toFixed(1)}%`
          );
        }
      }
    }, interval);

    return () => {
      clearInterval(monitor);
      console.log('Memory usage history:', measurements);
    };
  },
};

// Export React import for the usePerformanceTracking hook

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Global performance utilities for debugging
  (window as any).__PERF_MONITOR__ = performanceMonitor;
  (window as any).__WEB_VITALS__ = webVitals;
  (window as any).__MEMORY_MONITOR__ = memoryMonitor;
  (window as any).__BUNDLE_ANALYZER__ = bundleAnalyzer;

  // Keyboard shortcut to toggle performance monitoring
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      const isEnabled = performanceMonitor.isMonitoringEnabled();
      if (!isEnabled) {
        performanceMonitor.setEnabled(true);
        console.log(
          '🔔 Performance monitoring enabled. Press Ctrl+Shift+P again for report.'
        );
        return;
      }

      const report = performanceMonitor.getReport();
      console.group('📊 Performance Report');
      console.table(report.components);
      console.table(report.bundles);
      console.log('💡 Recommendations:', report.recommendations);
      console.groupEnd();
    }
  });

  // Log instructions for enabling performance monitoring
  console.log(
    '🔔 Performance monitoring is disabled by default. ' +
      'Press Ctrl+Shift+P to enable monitoring and generate reports.'
  );
}
