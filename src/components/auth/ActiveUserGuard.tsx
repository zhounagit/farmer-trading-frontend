import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ActiveUserGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * ActiveUserGuard component that protects routes by ensuring the user is active.
 * If the user is inactive, it automatically logs them out and redirects to the fallback path.
 *
 * @param children - The protected content to render if user is active
 * @param fallbackPath - The path to redirect to when user is inactive (default: '/')
 */
const ActiveUserGuard: React.FC<ActiveUserGuardProps> = ({
  children,
  fallbackPath = '/',
}) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated but inactive
    if (user && user.isActive === false) {
      console.warn(
        'ActiveUserGuard: User account is inactive, auto-logging out'
      );
      logout();
      navigate(fallbackPath, { replace: true });
    }
  }, [user, isAuthenticated, logout, navigate, fallbackPath]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  // If user is inactive, show deactivated account message
  // Only show this for inactive users, not during normal logout flow
  if (user?.isActive === false) {
    return (
      <Container maxWidth='sm' sx={{ py: 8 }}>
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          textAlign='center'
          gap={3}
        >
          <WarningIcon sx={{ fontSize: 64, color: 'warning.main' }} />

          <Typography variant='h4' component='h1' gutterBottom>
            Account Deactivated
          </Typography>

          <Alert severity='warning' sx={{ width: '100%' }}>
            Your account has been deactivated. Please contact support if you
            believe this is an error.
          </Alert>

          <Typography variant='body1' color='text.secondary'>
            You have been logged out automatically. You can sign in again if
            your account is reactivated.
          </Typography>

          <Button
            variant='contained'
            onClick={() => navigate('/login')}
            size='large'
          >
            Sign In Again
          </Button>

          <Button variant='outlined' onClick={() => navigate('/')} size='large'>
            Return to Home
          </Button>
        </Box>
      </Container>
    );
  }

  // If user is not authenticated, don't render anything (let the normal logout flow continue)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated and active, render the protected content
  return <>{children}</>;
};

export default ActiveUserGuard;
