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
  Grid,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Phone,
  PersonAdd,
  CardGiftcard,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import type { RegisterData } from '../../types/auth';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onClose,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    referralCode: '',
    userType: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
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
      await register(formData);
      onClose();
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        maxWidth: 500,
        width: '100%',
        mx: 'auto',
        borderRadius: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Logo size='medium' />
        <Typography variant='h5' fontWeight={600} sx={{ mt: 2, mb: 1 }}>
          Join HelloNeighbors
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Create your account to get started
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Registration Form */}
      <Box component='form' onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* First Name */}
          <Grid size={6}>
            <TextField
              fullWidth
              name='firstName'
              label='First Name'
              placeholder='Enter first name'
              value={formData.firstName}
              onChange={handleInputChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Person color='action' />
                  </InputAdornment>
                ),
              }}
              autoComplete='given-name'
            />
          </Grid>

          {/* Last Name */}
          <Grid size={6}>
            <TextField
              fullWidth
              name='lastName'
              label='Last Name'
              placeholder='Enter last name'
              value={formData.lastName}
              onChange={handleInputChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              autoComplete='family-name'
            />
          </Grid>
        </Grid>

        {/* Email */}
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
          sx={{ mt: 2 }}
          autoComplete='email'
        />

        {/* Phone (Optional) */}
        <TextField
          fullWidth
          name='phone'
          label='Phone Number (Optional)'
          placeholder='Enter your phone number'
          value={formData.phone}
          onChange={handleInputChange}
          error={!!formErrors.phone}
          helperText={formErrors.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Phone color='action' />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2 }}
          autoComplete='tel'
        />

        {/* Password */}
        <TextField
          fullWidth
          name='password'
          type={showPassword ? 'text' : 'password'}
          label='Password'
          placeholder='Create a password'
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
          sx={{ mt: 2 }}
          autoComplete='new-password'
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          name='confirmPassword'
          type={showConfirmPassword ? 'text' : 'password'}
          label='Confirm Password'
          placeholder='Confirm your password'
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Lock color='action' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle confirm password visibility'
                  onClick={handleToggleConfirmPasswordVisibility}
                  edge='end'
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2 }}
          autoComplete='new-password'
        />

        {/* Referral Code (Optional) */}
        <TextField
          fullWidth
          name='referralCode'
          label='Referral Code (Optional)'
          placeholder='Enter referral code'
          value={formData.referralCode}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <CardGiftcard color='action' />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2, mb: 3 }}
        />

        {/* Submit Button */}
        <Button
          type='submit'
          fullWidth
          variant='contained'
          size='large'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <PersonAdd />}
          sx={{
            mb: 3,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Divider sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            or
          </Typography>
        </Divider>

        {/* Switch to Login */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='body2' color='text.secondary'>
            Already have an account?{' '}
            <Link
              component='button'
              type='button'
              variant='body2'
              onClick={onSwitchToLogin}
              sx={{
                textDecoration: 'none',
                fontWeight: 600,
                color: 'primary.main',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegisterForm;
