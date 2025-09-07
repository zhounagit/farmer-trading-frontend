import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import ApiHealthCheck from './components/common/ApiHealthCheck';
import ApiEndpointTester from './components/common/ApiEndpointTester';
import ForceReload from './components/common/ForceReload';
import CssBaseline from '@mui/material/CssBaseline';
import {
  Agriculture,
  Api,
  CheckCircle,
  Error,
  Refresh,
} from '@mui/icons-material';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green for agricultural theme
      light: '#66BB6A',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FFA726', // Orange for accent
      light: '#FFD54F',
      dark: '#F57C00',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Simple API test function using the correct health endpoint
const testConnection = async () => {
  try {
    // Use localStorage override if available (for development debugging)
    const storedApiUrl = localStorage.getItem('TEMP_API_BASE_URL');
    const apiUrl =
      storedApiUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:5008';
    const response = await fetch(`${apiUrl}/health`);

    if (response.ok) {
      console.log(`✅ Connection successful to ${apiUrl}/health`);
      const data = await response.json();
      console.log('Health data:', data);
      return true;
    } else {
      console.log(
        `❌ Failed connecting to ${apiUrl}/health - Status: ${response.status}`
      );
      return false;
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    setConnectionStatus('testing');

    try {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
        <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              sx={{ mb: 3 }}
            >
              <Agriculture sx={{ fontSize: 48, color: 'primary.main' }} />
              <Box>
                <Typography variant='h4' component='h1' gutterBottom>
                  Farmer Trading
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Frontend Development Environment
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Connection Status */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Typography variant='h6' gutterBottom>
                Backend Connection Status
              </Typography>

              <Chip
                icon={getStatusIcon()}
                label={getStatusText()}
                color={getStatusColor() as any}
                variant='outlined'
                size='medium'
              />

              {connectionStatus === 'success' && (
                <Alert severity='success'>
                  ✅ Successfully connected to .NET backend!
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert severity='error'>
                  ❌ Could not connect to backend. Make sure your .NET API is
                  running on http://localhost:5008 with health check endpoint at
                  /health.
                </Alert>
              )}
            </Stack>

            {/* Environment Info */}
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant='h6' gutterBottom>
                Environment Information
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Frontend URL:</strong> {window.location.origin}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>API Base URL:</strong>{' '}
                {localStorage.getItem('TEMP_API_BASE_URL') ||
                  import.meta.env.VITE_API_BASE_URL ||
                  'http://localhost:5008'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Health Endpoint:</strong> /health
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Environment:</strong> Development
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Button
              variant='contained'
              color='primary'
              onClick={handleTestConnection}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              fullWidth
            >
              {loading ? 'Testing Connection...' : 'Test API Connection'}
            </Button>

            {/* API Testing Components */}
            <Box sx={{ mt: 3 }}>
              <Typography variant='h6' gutterBottom>
                API Connection Testing
              </Typography>
              <ForceReload />
              <ApiEndpointTester />
              <Divider sx={{ my: 2 }} />
              <ApiHealthCheck />
            </Box>

            {/* Instructions */}
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant='h6' gutterBottom>
                🚀 Next Steps
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2'>
                  1. Start your .NET backend: <code>dotnet run</code>
                </Typography>
                <Typography variant='body2'>
                  2. Click "Test API Connection" to verify connectivity
                </Typography>
                <Typography variant='body2'>
                  3. Open VS Code and start building components
                </Typography>
                <Typography variant='body2'>
                  4. Check browser console (F12) for any errors
                </Typography>
              </Stack>
            </Box>

            {/* Success Message */}
            {connectionStatus === 'success' && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'success.light',
                  color: 'success.dark',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body2' fontWeight={600}>
                  🎉 Congratulations! Your React frontend is connected to your
                  .NET backend health endpoint at /health!
                </Typography>
                <Typography variant='body2' sx={{ mt: 1 }}>
                  You're ready to start building your farmer trading platform!
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default App;
