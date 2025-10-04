import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/login',
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Give auth context time to initialize on page refresh
    const timer = setTimeout(() => {
      setAuthCheckComplete(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while auth is being checked
  if (isLoading || !authCheckComplete) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="60vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && user?.userType !== requiredRole) {
    const roleRedirects: Record<string, string> = {
      'Admin': '/admin',
      'Store Owner': '/dashboard',
      'Customer': '/browse',
    };

    const userRedirect = user?.userType ? roleRedirects[user.userType] || '/dashboard' : '/login';
    return <Navigate to={userRedirect} replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
