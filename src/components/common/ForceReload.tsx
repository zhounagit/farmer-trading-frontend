import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Refresh, BugReport, Save } from '@mui/icons-material';

const ForceReload = () => {
  const [apiUrl, setApiUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5008'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [useHttps, setUseHttps] = useState<boolean>(false);
  const [port, setPort] = useState<string>('5008');
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [reloadNeeded, setReloadNeeded] = useState<boolean>(false);

  useEffect(() => {
    // Collect all environment variables
    const vars: Record<string, string> = {};
    Object.keys(import.meta.env).forEach((key) => {
      if (key.startsWith('VITE_')) {
        vars[key] = import.meta.env[key];
      }
    });
    setEnvVars(vars);

    // Check if we're using HTTPS incorrectly
    const currentUrl = import.meta.env.VITE_API_BASE_URL || '';
    setUseHttps(currentUrl.startsWith('https://'));

    // Extract port from URL
    const portMatch = currentUrl.match(/:(\d+)/);
    if (portMatch && portMatch[1]) {
      setPort(portMatch[1]);
    }
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      const protocol = useHttps ? 'https' : 'http';
      const testUrl = `${protocol}://localhost:${port}/health`;
      console.log(`Testing connection to ${testUrl}`);

      const response = await fetch(testUrl);
      const data = await response.json();

      console.log('Connection test result:', {
        url: testUrl,
        status: response.status,
        data
      });

      alert(`Connection ${response.ok ? 'successful' : 'failed'} to ${testUrl}\nStatus: ${response.status}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      alert(`Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateLocalStorage = () => {
    const protocol = useHttps ? 'https' : 'http';
    const newApiUrl = `${protocol}://localhost:${port}`;

    // Store in localStorage so it persists through reloads
    localStorage.setItem('TEMP_API_BASE_URL', newApiUrl);

    // Update state
    setApiUrl(newApiUrl);
    setReloadNeeded(true);

    alert(`Environment updated in localStorage. The page will now use ${newApiUrl}\n\nPlease click "Reload Page" to apply the changes.`);
  };

  const forceReload = () => {
    window.location.reload();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Environment Variable Debug Tool
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">
          The API connection is failing because your app is using incorrect environment variables.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Your .NET backend is running on <strong>http://localhost:5008</strong> but your frontend is
          trying to connect to a different URL.
        </Typography>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Environment Variables
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            maxHeight: '150px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}
        >
          {Object.entries(envVars).map(([key, value]) => (
            <Box key={key} sx={{ mb: 0.5 }}>
              <strong>{key}:</strong> {value}
            </Box>
          ))}
        </Paper>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Fix API Connection
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useHttps}
                onChange={(e) => setUseHttps(e.target.checked)}
              />
            }
            label="Use HTTPS"
          />

          <Typography>
            {useHttps ? 'https' : 'http'}://localhost:
          </Typography>

          <TextField
            value={port}
            onChange={(e) => setPort(e.target.value)}
            size="small"
            sx={{ width: '80px' }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={updateLocalStorage}
          >
            Apply Settings
          </Button>

          <Button
            variant="outlined"
            startIcon={<BugReport />}
            onClick={testConnection}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Test Connection'}
          </Button>
        </Box>

        {reloadNeeded && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Settings have been saved to localStorage. Please reload the page for changes to take effect.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={forceReload}
              sx={{ mt: 1 }}
            >
              Reload Page
            </Button>
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Alert severity="info">
        <Typography variant="subtitle2">Important:</Typography>
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          <li>Your .NET backend is running on HTTP port 5008, not HTTPS port 7008</li>
          <li>Use <strong>http://localhost:5008</strong> as your API base URL</li>
          <li>The health endpoint is at <strong>/health</strong> (not /api/health)</li>
          <li>Environment variables from .env files are loaded only at build time</li>
          <li>This tool uses localStorage to override those values during development</li>
        </ul>
      </Alert>
    </Paper>
  );
};

export default ForceReload;
