import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, Chip, Collapse, IconButton } from '@mui/material';
import { Speed, ExpandMore, ExpandLess, Close } from '@mui/icons-material';

interface PerformanceMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  mountTime: number;
  props: Record<string, any>;
  propsChanges: number;
}

interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
  showDebugPanel?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  children: React.ReactNode;
}

const performanceStore = new Map<string, PerformanceMetrics>();

// Hook for tracking component performance
export const usePerformanceMonitor = (componentName: string, props?: Record<string, any>) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(performance.now());
  const lastPropsRef = useRef(props);
  const renderTimesRef = useRef<number[]>([]);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      renderCountRef.current += 1;
      renderTimesRef.current.push(renderTime);

      // Keep only last 10 render times for average calculation
      if (renderTimesRef.current.length > 10) {
        renderTimesRef.current.shift();
      }

      const averageRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length;
      const totalRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0);

      // Calculate props changes
      let propsChanges = 0;
      if (props && lastPropsRef.current) {
        const currentKeys = Object.keys(props);
        const lastKeys = Object.keys(lastPropsRef.current);

        if (currentKeys.length !== lastKeys.length) {
          propsChanges += 1;
        } else {
          currentKeys.forEach(key => {
            if (props[key] !== lastPropsRef.current![key]) {
              propsChanges += 1;
            }
          });
        }
      }

      const metrics: PerformanceMetrics = {
        componentName,
        renderCount: renderCountRef.current,
        lastRenderTime: renderTime,
        averageRenderTime,
        totalRenderTime,
        mountTime: mountTimeRef.current,
        props: props || {},
        propsChanges,
      };

      performanceStore.set(componentName, metrics);
      lastPropsRef.current = props;
    };
  });

  return {
    renderCount: renderCountRef.current,
    averageRenderTime: renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length || 0,
  };
};

// Performance Debug Panel Component
export const PerformanceDebugPanel: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setMetrics(Array.from(performanceStore.values()));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open]);

  const toggleExpanded = (componentName: string) => {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(componentName)) {
      newExpanded.delete(componentName);
    } else {
      newExpanded.add(componentName);
    }
    setExpandedMetrics(newExpanded);
  };

  const getPerformanceColor = (renderTime: number) => {
    if (renderTime < 16) return 'success'; // Under 60fps
    if (renderTime < 33) return 'warning'; // Under 30fps
    return 'error'; // Over 30fps
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxHeight: 500,
        overflow: 'auto',
        zIndex: 1500,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        borderRadius: 2,
        p: 2,
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Speed />
          Performance Monitor
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {metrics.length === 0 ? (
        <Typography variant="body2" color="grey.400">
          No performance data available
        </Typography>
      ) : (
        metrics.map((metric) => (
          <Paper
            key={metric.componentName}
            sx={{
              mb: 1,
              p: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => toggleExpanded(metric.componentName)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {metric.componentName}
                </Typography>
                <Chip
                  size="small"
                  label={`${metric.renderCount} renders`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`${metric.lastRenderTime.toFixed(2)}ms`}
                  color={getPerformanceColor(metric.lastRenderTime)}
                  variant="outlined"
                />
              </Box>
              <IconButton size="small" sx={{ color: 'white' }}>
                {expandedMetrics.has(metric.componentName) ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedMetrics.has(metric.componentName)}>
              <Box sx={{ mt: 1, pl: 1 }}>
                <Typography variant="caption" display="block">
                  Average Render Time: {metric.averageRenderTime.toFixed(2)}ms
                </Typography>
                <Typography variant="caption" display="block">
                  Total Render Time: {metric.totalRenderTime.toFixed(2)}ms
                </Typography>
                <Typography variant="caption" display="block">
                  Props Changes: {metric.propsChanges}
                </Typography>
                <Typography variant="caption" display="block">
                  Mount Time: {new Date(metric.mountTime).toLocaleTimeString()}
                </Typography>

                {Object.keys(metric.props).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" fontWeight={600}>
                      Current Props:
                    </Typography>
                    <Box sx={{ maxHeight: 100, overflow: 'auto', fontSize: '0.7rem', fontFamily: 'monospace' }}>
                      {Object.entries(metric.props).map(([key, value]) => (
                        <div key={key}>
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        ))
      )}
    </Box>
  );
};

// Higher-Order Component for automatic performance monitoring
export const withPerformanceMonitor = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) => {
  const PerformanceMonitoredComponent = React.forwardRef<any, P>((props, ref) => {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    usePerformanceMonitor(displayName, props as Record<string, any>);

    return <WrappedComponent {...props} ref={ref} />;
  });

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitor(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return PerformanceMonitoredComponent;
};

// Main PerformanceMonitor component wrapper
export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
  showDebugPanel = false,
  onMetricsUpdate,
  children,
}) => {
  const [debugPanelOpen, setDebugPanelOpen] = useState(showDebugPanel);
  const metrics = usePerformanceMonitor(componentName);

  useEffect(() => {
    if (enabled && onMetricsUpdate) {
      const currentMetrics = performanceStore.get(componentName);
      if (currentMetrics) {
        onMetricsUpdate(currentMetrics);
      }
    }
  }, [enabled, onMetricsUpdate, componentName, metrics.renderCount]);

  // Keyboard shortcut to toggle debug panel (Ctrl/Cmd + Shift + P)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setDebugPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <PerformanceDebugPanel
        open={debugPanelOpen}
        onClose={() => setDebugPanelOpen(false)}
      />
    </>
  );
};

// Utility functions
export const clearPerformanceData = () => {
  performanceStore.clear();
};

export const getPerformanceData = (componentName?: string) => {
  if (componentName) {
    return performanceStore.get(componentName);
  }
  return Array.from(performanceStore.values());
};

export const exportPerformanceData = () => {
  const data = Array.from(performanceStore.values());
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `performance-data-${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export default PerformanceMonitor;
