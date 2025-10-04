import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onClose,
}) => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      onClose();
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPassword = () => {
    onClose(); // Close the modal first
    navigate('/forgot-password'); // Then navigate to forgot password page
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Logo size='medium' />
        <Typography variant='h5' fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Welcome Back
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Sign in to your HelloNeighbors account
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Login Form */}
      <Box component='form' onSubmit={handleSubmit}>
        <TextField
          fullWidth
          name='email'
          type='email'
          label='Email Address'
          placeholder='Enter your email'
          value={formData.email}
          onChange={handleInputChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Email color='action' />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
          autoComplete='email'
        />

        <TextField
          fullWidth
          name='password'
          type={showPassword ? 'text' : 'password'}
          label='Password'
          placeholder='Enter your password'
          value={formData.password}
          onChange={handleInputChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Lock color='action' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={handleTogglePasswordVisibility}
                  edge='end'
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
          autoComplete='current-password'
        />

        <Button
          type='submit'
          fullWidth
          variant='contained'
          size='large'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Login />}
          sx={{
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Forgot Password Link */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Link
            component='button'
            type='button'
            variant='body2'
            onClick={handleForgotPassword}
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot your password?
          </Link>
        </Box>

        <Divider sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            or
          </Typography>
        </Divider>

        {/* Switch to Register */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Don't have an account?{' '}
            <Link
              component='button'
              type='button'
              variant='body2'
              onClick={onSwitchToRegister}
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;
