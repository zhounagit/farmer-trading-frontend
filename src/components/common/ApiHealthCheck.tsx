import { useState, useEffect } from 'react';
import {
  Button,
  Alert,
  Typography,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import api, { getApiHealth, testApiConnection } from '../../services/api';

interface HealthStatus {
  isHealthy: boolean;
  status?: any;
  error?: string;
  timestamp: string;
  baseUrl?: string;
}

const ApiHealthCheck = () => {
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [expanded, setExpanded] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const connected = await testApiConnection();
      if (connected) {
        const status = await getApiHealth();
        setHealth(status);
      } else {
        setHealth({
          isHealthy: false,
          error:
            'Could not connect to backend. Make sure your .NET API is running at http://localhost:5008/health.',
          timestamp: new Date().toISOString(),
          baseUrl:
            localStorage.getItem('TEMP_API_BASE_URL') ||
            import.meta.env.VITE_API_BASE_URL ||
            'http://localhost:5008',
        });
      }
    } catch (error) {
      setHealth({
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        baseUrl:
          localStorage.getItem('TEMP_API_BASE_URL') ||
          import.meta.env.VITE_API_BASE_URL ||
          'http://localhost:5008',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Typography variant='h6' gutterBottom>
        API Connection Status
      </Typography>

      {loading ? (
        <Box display='flex' alignItems='center' gap={2}>
          <CircularProgress size={20} />
          <Typography>Checking API connection...</Typography>
        </Box>
      ) : health ? (
        <>
          <Box display='flex' alignItems='center' gap={2} mb={1}>
            <Chip
              label={health.isHealthy ? 'Connected' : 'Not Connected'}
              color={health.isHealthy ? 'success' : 'error'}
              variant='outlined'
            />
            <Typography variant='body2' color='text.secondary'>
              Last checked: {new Date(health.timestamp).toLocaleTimeString()}
              {localStorage.getItem('TEMP_API_BASE_URL') && (
                <Alert severity='info' size='small' sx={{ mt: 1, py: 0 }}>
                  Using localStorage override
                </Alert>
              )}
            </Typography>
          </Box>

          {health.isHealthy ? (
            <Alert severity='success' sx={{ mb: 1 }}>
              Successfully connected to backend API health endpoint at /health
            </Alert>
          ) : (
            <Alert severity='error' sx={{ mb: 1 }}>
              {health.error}
            </Alert>
          )}

          <Box mt={1}>
            <Button
              size='small'
              variant='text'
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Hide Details' : 'Show Details'}
            </Button>
          </Box>

          {expanded && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                bgcolor: 'grey.100',
                borderRadius: 1,
                fontSize: '0.875rem',
                fontFamily: 'monospace',
              }}
            >
              <Typography variant='body2' component='div'>
                <strong>API Base URL:</strong> {health.baseUrl}
              </Typography>
              <Typography variant='body2' component='div'>
                <strong>Health Endpoint:</strong> /health
              </Typography>
              {health.status && (
                <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
                  {JSON.stringify(health.status, null, 2)}
                </pre>
              )}
            </Box>
          )}
        </>
      ) : (
        <Alert severity='info'>Checking API connection status...</Alert>
      )}

      <Box mt={2}>
        <Button
          variant='contained'
          size='small'
          onClick={checkHealth}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </Box>
    </Box>
  );
};

export default ApiHealthCheck;
