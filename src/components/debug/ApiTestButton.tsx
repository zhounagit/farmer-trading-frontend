import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  BugReport,
  CheckCircle,
  Error,
  NetworkCheck,
} from '@mui/icons-material';
import { testApiConnection, getApiHealth } from '../../services/api';
import { authApi, API_CONFIG } from '../../utils/api';

interface ApiTestResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
  timestamp: string;
}

export const ApiTestButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: ApiTestResult) => {
    setTestResults(prev => [result, ...prev]);
  };

  const runHealthCheck = async () => {
    console.log('🩺 Running health check...');
    addResult({
      endpoint: '/health',
      status: 'loading',
      message: 'Testing health endpoint...',
      timestamp: new Date().toISOString(),
    });

    try {
      const isHealthy = await testApiConnection();
      const healthData = await getApiHealth();

      addResult({
        endpoint: '/health',
        status: isHealthy ? 'success' : 'error',
        message: isHealthy ? 'Backend is healthy!' : 'Backend is not responding',
        data: healthData,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      addResult({
        endpoint: '/health',
        status: 'error',
        message: `Health check failed: ${error.message}`,
        data: error,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const testRegistrationEndpoint = async () => {
    console.log('📝 Testing registration endpoint...');
    addResult({
      endpoint: '/api/auth/register',
      status: 'loading',
      message: 'Testing registration endpoint with dummy data...',
      timestamp: new Date().toISOString(),
    });

    try {
      // This will likely fail due to validation, but we can see the error structure
      await authApi.register({
        email: 'test@example.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890',
      });

      addResult({
        endpoint: '/api/auth/register',
        status: 'success',
        message: 'Registration endpoint is responding (this was a test)',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      const status = error.status >= 400 && error.status < 500 ? 'success' : 'error';
      addResult({
        endpoint: '/api/auth/register',
        status,
        message: status === 'success'
          ? `Endpoint working (got expected ${error.status} response)`
          : `Registration endpoint failed: ${error.message}`,
        data: error,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    console.log('🚀 Starting API debugging tests...');
    console.log('📋 Configuration:', {
      baseUrl: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      environment: import.meta.env.MODE,
    });

    await runHealthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    await testRegistrationEndpoint();

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" fontSize="small" />;
      case 'error':
        return <Error color="error" fontSize="small" />;
      case 'loading':
        return <CircularProgress size={16} />;
      default:
        return <NetworkCheck fontSize="small" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'info' | 'warning' => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'loading':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Only show in development */}
      {import.meta.env.DEV && (
        <>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<BugReport />}
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              mb: isOpen ? 2 : 0,
              minWidth: 160,
              fontWeight: 600,
            }}
          >
            API Debug
          </Button>

          {isOpen && (
            <Box
              sx={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: 2,
                width: 400,
                maxHeight: 500,
                overflow: 'auto',
                boxShadow: 3,
                p: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                API Debug Console
              </Typography>

              <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                Backend URL: {API_CONFIG.BASE_URL}
              </Alert>

              <Button
                variant="outlined"
                fullWidth
                onClick={runAllTests}
                disabled={isRunning}
                startIcon={isRunning ? <CircularProgress size={16} /> : <NetworkCheck />}
                sx={{ mb: 2 }}
              >
                {isRunning ? 'Testing APIs...' : 'Test All Endpoints'}
              </Button>

              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {testResults.map((result, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        minHeight: 48,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          gap: 1,
                        }
                      }}
                    >
                      {getStatusIcon(result.status)}
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {result.endpoint}
                      </Typography>
                      <Chip
                        label={result.status}
                        size="small"
                        color={getStatusColor(result.status)}
                        sx={{ ml: 'auto' }}
                      />
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {result.message}
                      </Typography>
                      {result.data && (
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.75rem',
                            maxHeight: 150,
                          }}
                        >
                          {JSON.stringify(result.data, null, 2)}
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}

                {testResults.length === 0 && !isRunning && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Click "Test All Endpoints" to start debugging
                  </Typography>
                )}
              </Box>

              <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center' }}>
                Debug mode - only visible in development
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ApiTestButton;
