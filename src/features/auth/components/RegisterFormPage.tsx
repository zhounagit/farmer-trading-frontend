import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { RegisterForm } from '../../../components/auth/RegisterForm';

/**
 * RegisterFormPage - Full page wrapper for RegisterForm
 *
 * This component wraps the RegisterForm modal component to work as a full-page
 * registration flow, using HelloNeighbors branding instead of the legacy
 * "Create Your Account" page.
 */
const RegisterFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  // Get redirect destination from either query parameters or navigation state
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const fromState = location.state?.from?.pathname;

  // Priority: 1. returnUrl query param, 2. from state, 3. default home
  const redirectTo = returnUrl || fromState || '/';

  const handleSwitchToLogin = () => {
    // Pass the redirect URL to login page
    navigate(`/login?returnUrl=${encodeURIComponent(redirectTo)}`);
  };

  const handleClose = () => {
    // After successful registration, redirect to the intended destination
    navigate(redirectTo);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 500,
          width: '100%',
        }}
      >
        <RegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          onClose={handleClose}
        />
      </Box>
    </Box>
  );
};

export default RegisterFormPage;
