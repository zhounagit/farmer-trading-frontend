import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  Container
} from '@mui/material';
import { Security, RefreshRounded, LoginRounded } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const ClearTokenPage: React.FC = () => {
  const navigate = useNavigate();

  const clearTokens = () => {
    try {
      // Clear all authentication data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      // Clear any other auth-related items
      localStorage.clear();
      sessionStorage.clear();

      toast.success('All tokens cleared successfully');

      // Small delay then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error clearing tokens:', error);
      toast.error('Failed to clear tokens');
    }
  };

  const testJWTToken = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('❌ No JWT token found');
      toast.error('No token found');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT Token Analysis:', {
        token: token.substring(0, 50) + '...',
        tokenLength: token.length,
        payload: payload,
        role: payload.role,
        roleType: typeof payload.role,
        sub: payload.sub,
        exp: new Date(payload.exp * 1000),
        isExpired: payload.exp < Date.now() / 1000,
        timeUntilExpiry: Math.round((payload.exp - Date.now() / 1000) / 60) + ' minutes'
      });
      toast.success('JWT token logged to console');
    } catch (error) {
      console.error('❌ Failed to decode JWT:', error);
      toast.error('Invalid JWT token format');
    }
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const goToAdminAuth = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const submissionId = urlParams.get('submissionId');

    if (submissionId) {
      navigate(`/admin/auth/${submissionId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'warning.main',
                mb: 2
              }}
            >
              <Security sx={{ fontSize: 32, color: 'white' }} />
            </Box>

            <Typography variant="h4" component="h1" gutterBottom align="center">
              Token Management
            </Typography>

            <Typography variant="body1" color="text.secondary" align="center">
              Use this page to clear authentication tokens and resolve login issues.
            </Typography>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            If you're experiencing authentication issues (403 errors, login problems, etc.),
            clearing your tokens will force a fresh login and resolve most issues.
          </Alert>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              startIcon={<RefreshRounded />}
              onClick={clearTokens}
            >
              Clear All Tokens
            </Button>

            <Button
              fullWidth
              variant="outlined"
              color="info"
              onClick={testJWTToken}
            >
              Test JWT Token (Check Console)
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<LoginRounded />}
              onClick={goToLogin}
            >
              Go to Login Page
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={goToAdminAuth}
            >
              Go to Admin Auth
            </Button>
          </Stack>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>Debug Info:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.8em' }}>
              Current URL: {window.location.href}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.8em' }}>
              Has Access Token: {localStorage.getItem('access_token') ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: '0.8em' }}>
              Has User Data: {localStorage.getItem('user_data') ? 'Yes' : 'No'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ClearTokenPage;
