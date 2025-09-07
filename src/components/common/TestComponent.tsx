import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  Agriculture,
  Api,
  CheckCircle,
  Error,
  Refresh,
} from '@mui/icons-material';
import { testApiConnection, getApiHealth } from '../../services/api';

interface HealthStatus {
  isHealthy: boolean;
  status?: any;
  error?: string;
  timestamp: string;
}

const TestComponent: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setConnectionStatus('testing');

    try {
      const isConnected = await testApiConnection();
      const health = await getApiHealth();

      setHealthStatus(health);

      if (isConnected) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
      setHealthStatus({
        isHealthy: false,
        error: error.message || 'Connection failed',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'testing':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'testing':
        return <CircularProgress size={20} />;
      default:
        return <Api />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      case 'testing':
        return 'Testing...';
      default:
        return 'Not Tested';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Agriculture
              sx={{
                fontSize: 48,
                color: 'primary.main',
              }}
            />
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Farmer Trading
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frontend Development Environment
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Connection Status */}
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Backend Connection Status
            </Typography>

            <Chip
              icon={getStatusIcon()}
              label={getStatusText()}
              color={getStatusColor() as any}
              variant="outlined"
              size="medium"
            />

            {/* Health Status Details */}
            {healthStatus && (
              <Alert
                severity={healthStatus.isHealthy ? 'success' : 'error'}
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  <strong>API Health:</strong>{' '}
                  {healthStatus.isHealthy ? 'Healthy' : 'Unhealthy'}
                </Typography>
                {healthStatus.error && (
                  <Typography variant="body2">
                    <strong>Error:</strong> {healthStatus.error}
                  </Typography>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                </Typography>
              </Alert>
            )}
          </Stack>

          {/* Environment Info */}
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Environment Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Frontend URL:</strong> {window.location.origin}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Environment:</strong> {import.meta.env.MODE}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Node Version:</strong> {import.meta.env.VITE_NODE_VERSION || 'Unknown'}
            </Typography>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTestConnection}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              sx={{ flex: 1 }}
            >
              {loading ? 'Testing Connection...' : 'Test API Connection'}
            </Button>
          </Stack>

          {/* Quick Start Instructions */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Quick Start
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                1. Make sure your .NET backend is running on port 7008
              </Typography>
              <Typography variant="body2">
                2. Click "Test API Connection" to verify connectivity
              </Typography>
              <Typography variant="body2">
                3. Open VS Code and start building your components
              </Typography>
              <Typography variant="body2">
                4. Check the browser console for additional debugging info
              </Typography>
            </Stack>
          </Box>

          {/* Development Notes */}
          {import.meta.env.DEV && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="caption" color="info.dark">
                🛠️ <strong>Development Mode:</strong> React Query DevTools are available.
                Hot reloading is enabled. Check the browser console for detailed logs.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TestComponent;
