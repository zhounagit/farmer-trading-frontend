import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  TextField,
  Divider,
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const TestAuthHelper: React.FC = () => {
  const [testToken, setTestToken] = useState('');

  const createMockToken = () => {
    // Create a simple mock JWT token for testing
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        sub: 'test-user-123',
        nameid: '123', // Backend uses ClaimTypes.NameIdentifier which maps to 'nameid'
        email: 'test@example.com',
        role: 'farmer', // Add role claim
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
      })
    );
    const signature = 'mock-signature-for-testing';

    return `${header}.${payload}.${signature}`;
  };

  const createMockUser = () => {
    return {
      userId: 123,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      userType: 'farmer',
      hasStore: true,
      isActive: true,
    };
  };

  const handleSetMockAuth = () => {
    const mockToken = createMockToken();
    const mockRefreshToken = 'mock-refresh-token-for-testing';
    const mockUser = createMockUser();

    // Set tokens in localStorage
    localStorage.setItem('heartwood_access_token', mockToken);
    localStorage.setItem('heartwood_refresh_token', mockRefreshToken);
    localStorage.setItem('heartwood_user_data', JSON.stringify(mockUser));

    console.log('=== MOCK AUTH TOKENS SET ===');
    console.log('Access Token:', mockToken);
    console.log('Refresh Token:', mockRefreshToken);
    console.log('User Data:', mockUser);

    toast.success(
      'Mock authentication tokens set! Refresh the page to see effect.'
    );
  };

  const handleSetCustomToken = () => {
    if (!testToken.trim()) {
      toast.error('Please enter a token');
      return;
    }

    localStorage.setItem('heartwood_access_token', testToken);
    localStorage.setItem('heartwood_refresh_token', 'custom-refresh-token');

    const mockUser = createMockUser();
    localStorage.setItem('heartwood_user_data', JSON.stringify(mockUser));

    console.log('=== CUSTOM AUTH TOKEN SET ===');
    console.log('Access Token:', testToken);
    console.log('User Data:', mockUser);

    toast.success('Custom authentication token set!');
  };

  const handleClearAuth = () => {
    localStorage.removeItem('heartwood_access_token');
    localStorage.removeItem('heartwood_refresh_token');
    localStorage.removeItem('heartwood_user_data');
    localStorage.removeItem('user');

    console.log('=== AUTH TOKENS CLEARED ===');
    toast.success('All authentication tokens cleared! Refresh to see effect.');
  };

  const handleDebugAuth = () => {
    const accessToken = localStorage.getItem('heartwood_access_token');
    const refreshToken = localStorage.getItem('heartwood_refresh_token');
    const userData = localStorage.getItem('heartwood_user_data');

    console.log('=== CURRENT AUTH STATE ===');
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('User Data:', userData);

    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Token Payload:', payload);
          console.log('Token Expires:', new Date(payload.exp * 1000));
          console.log('Current Time:', new Date());
          console.log('Token Valid:', payload.exp * 1000 > Date.now());
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }

    toast.info('Check console for detailed auth state');
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography
        variant='h6'
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <BugIcon color='warning' />
        Authentication Test Helper
      </Typography>

      <Alert severity='warning' sx={{ mb: 3 }}>
        <strong>Development Tool Only!</strong> This component helps test upload
        functionality by setting mock authentication tokens. Remove from
        production!
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant='contained'
          startIcon={<LoginIcon />}
          onClick={handleSetMockAuth}
          color='success'
        >
          Set Mock Authentication
        </Button>

        <Divider>OR</Divider>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            label='Custom Token'
            value={testToken}
            onChange={(e) => setTestToken(e.target.value)}
            size='small'
            sx={{ flex: 1 }}
            placeholder='Paste a real JWT token here'
          />
          <Button
            variant='outlined'
            onClick={handleSetCustomToken}
            disabled={!testToken.trim()}
          >
            Set Custom Token
          </Button>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant='outlined'
            startIcon={<BugIcon />}
            onClick={handleDebugAuth}
            color='info'
          >
            Debug Auth State
          </Button>

          <Button
            variant='outlined'
            startIcon={<LogoutIcon />}
            onClick={handleClearAuth}
            color='error'
          >
            Clear All Auth
          </Button>
        </Box>

        <Alert severity='info'>
          <Typography variant='body2'>
            <strong>How to use:</strong>
            <br />
            1. Click "Set Mock Authentication" to create fake tokens
            <br />
            2. Refresh the page to see the auth context update
            <br />
            3. Try uploading images - they should work with mock auth
            <br />
            4. Use "Debug Auth State" to check current token status
          </Typography>
        </Alert>

        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            Current Status:
            <br />
            Access Token:{' '}
            {localStorage.getItem('heartwood_access_token')
              ? '✅ Present'
              : '❌ Missing'}
            <br />
            Refresh Token:{' '}
            {localStorage.getItem('heartwood_refresh_token')
              ? '✅ Present'
              : '❌ Missing'}
            <br />
            User Data:{' '}
            {localStorage.getItem('heartwood_user_data')
              ? '✅ Present'
              : '❌ Missing'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TestAuthHelper;
