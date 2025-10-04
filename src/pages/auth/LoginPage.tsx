import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  console.log('🔥 LOGIN PAGE LOADING - JS IS WORKING');
  const theme = useTheme();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      // Error is handled by the auth context and toast
      console.error('Login failed:', error);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth='sm'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            elevation={8}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <LoginIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Welcome Back
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.9 }}>
                Sign in to your HelloNeighbors account
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Error Alert */}
                  {error && (
                    <Alert severity='error' sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Email Field */}
                  <TextField
                    label='Email Address'
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <EmailIcon color='action' />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {/* Password Field */}
                  <TextField
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <LockIcon color='action' />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={handleTogglePassword}
                            edge='end'
                            size='small'
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  {/* Login Button */}
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    size='large'
                    loading={isLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                      },
                    }}
                  >
                    Sign In
                  </LoadingButton>

                  {/* Forgot Password Link */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Link
                      component={RouterLink}
                      to='/forgot-password'
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Forgot your password?
                    </Link>
                  </Box>

                  {/* Divider */}
                  <Box
                    sx={{
                      textAlign: 'center',
                      position: 'relative',
                      mt: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        height: 1,
                        bgcolor: 'divider',
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                      }}
                    />
                    <Typography
                      variant='body2'
                      sx={{
                        bgcolor: 'background.paper',
                        px: 2,
                        color: 'text.secondary',
                        position: 'relative',
                      }}
                    >
                      Don't have an account?
                    </Typography>
                  </Box>

                  {/* Register Link */}
                  <Button
                    component={RouterLink}
                    to='/register'
                    variant='outlined'
                    size='large'
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component={RouterLink}
            to='/'
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 500,
              opacity: 0.9,
              '&:hover': {
                opacity: 1,
                textDecoration: 'underline',
              },
            }}
          >
            ← Back to Home
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;
