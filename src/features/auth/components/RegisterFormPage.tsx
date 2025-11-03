import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
  const theme = useTheme();

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  const handleClose = () => {
    // After successful registration, RegisterForm will handle navigation
    // via the auth context. This close handler can be used if needed.
    navigate('/');
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
