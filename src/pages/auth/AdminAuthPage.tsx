import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Container,
  Stack
} from '@mui/material';
import { AdminPanelSettings, Security, Email } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AdminAuthPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('helloneighbors.store@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in as admin
  useEffect(() => {
    if (user && user.userType === 'Admin') {
      // Already logged in as admin, redirect to store application
      navigate(`/admin/store-applications/${submissionId}`);
    }
  }, [user, navigate, submissionId]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loggedInUser = await login(email, password);

      // Check if the logged-in user is actually an admin
      if (loggedInUser.userType === 'Admin') {
        toast.success('Admin login successful');
        // Redirect to the store application review page
        navigate(`/admin/store-applications/${submissionId}`);
      } else {
        setError('Access denied. This account does not have administrator privileges.');
        // You may want to logout the non-admin user here if desired
      }
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearToken = () => {
    // Clear old JWT token to force new login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    toast.success('Token cleared. Please login again.');
    window.location.reload();
  };

  const handleGoToLogin = () => {
    // Redirect to regular login page with return URL
    navigate(`/login?returnUrl=/admin/store-applications/${submissionId}`);
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
                backgroundColor: 'primary.main',
                mb: 2
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Admin Authentication Required
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Please log in as an administrator to review the store application.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Email />
              <Typography variant="body2">
                You clicked a review link from the admin email. Please authenticate to continue.
              </Typography>
            </Stack>
          </Alert>

          <Box component="form" onSubmit={handleAdminLogin}>
            <TextField
              fullWidth
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              label="Admin Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Authenticating...
                </>
              ) : (
                'Login as Administrator'
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoToLogin}
              disabled={isLoading}
              sx={{ mb: 1 }}
            >
              Use Different Account
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleClearToken}
              disabled={isLoading}
              color="error"
              size="small"
            >
              Clear Token (Debug)
            </Button>
          </Box>

          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>Store Application ID:</strong> {submissionId}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminAuthPage;
