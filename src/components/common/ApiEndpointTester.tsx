import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Error as ErrorIcon,
  Send,
  Settings,
} from '@mui/icons-material';
import axios from 'axios';

interface EndpointResult {
  url: string;
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  time: number;
}

const ApiEndpointTester = () => {
  const [baseUrl, setBaseUrl] = useState<string>(
    localStorage.getItem('TEMP_API_BASE_URL') ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:5008'
  );
  const [customEndpoint, setCustomEndpoint] = useState<string>('/health');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<EndpointResult[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Common API endpoints to test
  const commonEndpoints = [
    '/health', // ✅ Confirmed working endpoint for this project
    '/api/health',
    '/api/healthcheck',
    '/healthcheck',
    '/api',
    '/api/status',
    '/status',
    '/api/v1/health',
    '/api/auth',
    '/api/auth/status',
    '/api/ping',
    '/ping',
  ];

  const testEndpoint = async (url: string) => {
    const startTime = performance.now();
    try {
      const response = await axios.get(url, {
        timeout: 5000,
      });
      const endTime = performance.now();
      return {
        url,
        success: true,
        status: response.status,
        data: response.data,
        time: Math.round(endTime - startTime),
      };
    } catch (error: any) {
      const endTime = performance.now();
      return {
        url,
        success: false,
        status: error.response?.status,
        error: error.message,
        time: Math.round(endTime - startTime),
      };
    }
  };

  const testCustomEndpoint = async () => {
    setLoading(true);
    try {
      const fullUrl = `${baseUrl}${customEndpoint}`;
      const result = await testEndpoint(fullUrl);
      setResults([result, ...results]);
    } catch (error) {
      console.error('Error testing endpoint:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAllCommonEndpoints = async () => {
    setLoading(true);
    try {
      // Log the base URL being used
      console.log(`Using base URL for tests: ${baseUrl}`);
      console.log(`Environment variable: ${import.meta.env.VITE_API_BASE_URL}`);
      console.log(
        `localStorage override: ${localStorage.getItem('TEMP_API_BASE_URL')}`
      );

      const allResults = await Promise.all(
        commonEndpoints.map(async (endpoint) => {
          const fullUrl = `${baseUrl}${endpoint}`;
          return await testEndpoint(fullUrl);
        })
      );
      setResults([...allResults, ...results]);
    } catch (error) {
      console.error('Error testing endpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Typography variant='h5' gutterBottom>
        API Endpoint Tester
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        Test different API endpoints to find working ones
        {localStorage.getItem('TEMP_API_BASE_URL') && (
          <Alert severity='success' sx={{ mt: 1 }}>
            Using localStorage override:{' '}
            {localStorage.getItem('TEMP_API_BASE_URL')}
          </Alert>
        )}
      </Typography>

      <Button
        size='small'
        startIcon={<Settings />}
        onClick={() => setShowSettings(!showSettings)}
        sx={{ mb: 2 }}
      >
        {showSettings ? 'Hide Settings' : 'Show Settings'}
      </Button>

      {showSettings && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label='API Base URL'
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            variant='outlined'
            size='small'
            sx={{ mb: 2 }}
            helperText='e.g., http://localhost:5008'
          />
          <Alert severity='info' sx={{ mb: 2 }}>
            Your API may use a different port or URL structure. Try changing the
            base URL if tests fail.
          </Alert>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label='Custom Endpoint'
          value={customEndpoint}
          onChange={(e) => setCustomEndpoint(e.target.value)}
          variant='outlined'
          size='small'
          sx={{ mb: 2 }}
          helperText='e.g., /api/health or /health'
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant='contained'
            color='primary'
            onClick={testCustomEndpoint}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Send />}
          >
            Test Endpoint
          </Button>

          <Button
            variant='outlined'
            onClick={testAllCommonEndpoints}
            disabled={loading}
          >
            Test Common Endpoints
          </Button>

          <Button
            variant='text'
            color='error'
            onClick={clearResults}
            disabled={loading || results.length === 0}
          >
            Clear Results
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {results.length > 0 ? (
        <Box>
          <Typography variant='h6' gutterBottom>
            Test Results
          </Typography>

          {results.map((result, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                  }}
                >
                  {result.success ? (
                    <CheckCircle color='success' fontSize='small' />
                  ) : (
                    <ErrorIcon color='error' fontSize='small' />
                  )}
                  <Typography sx={{ flexGrow: 1 }}>{result.url}</Typography>
                  <Chip
                    label={result.status || 'No status'}
                    color={result.success ? 'success' : 'error'}
                    size='small'
                    variant='outlined'
                  />
                  <Chip
                    label={`${result.time}ms`}
                    color='default'
                    size='small'
                    variant='outlined'
                    sx={{ ml: 1 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {result.success ? (
                  <>
                    <Typography variant='subtitle2'>Response Data:</Typography>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        maxHeight: '200px',
                        overflow: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                      }}
                    >
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </Paper>
                  </>
                ) : (
                  <Alert severity='error'>
                    {result.error || 'Unknown error'}
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Alert severity='info'>
          No tests run yet. Click "Test Endpoint" to try connecting to the API.
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <Alert severity='info'>
          <Typography variant='subtitle2'>Success Tips:</Typography>
          <ul style={{ marginTop: 8, paddingLeft: 16 }}>
            <li>
              ✅ Confirmed health endpoint for this project:{' '}
              <strong>/health</strong>
            </li>
            <li>
              Your .NET backend configures this in Program.cs with{' '}
              <code>app.MapHealthChecks("/health", ...)</code>
            </li>
            <li>Make sure your .NET backend is running on port 5008</li>
            <li>
              Set your API base URL to <strong>http://localhost:5008</strong>{' '}
              (without /api suffix)
            </li>
            <li>Update your .env.local file with the correct URL if needed</li>
          </ul>
        </Alert>
      </Box>
    </Paper>
  );
};

export default ApiEndpointTester;
