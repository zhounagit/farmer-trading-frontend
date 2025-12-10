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
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [rateLimitCooldown, setRateLimitCooldown] = useState<number | null>(
    () => {
      // Check localStorage for existing rate limit cooldown
      const savedCooldown = localStorage.getItem('login_rate_limit_cooldown');
      const savedTimestamp = localStorage.getItem('login_rate_limit_timestamp');

      if (savedCooldown && savedTimestamp) {
        const remainingSeconds = parseInt(savedCooldown, 10);
        const timestamp = parseInt(savedTimestamp, 10);
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - timestamp) / 1000);

        if (elapsedSeconds < remainingSeconds) {
          return remainingSeconds - elapsedSeconds;
        } else {
          // Clear expired cooldown
          localStorage.removeItem('login_rate_limit_cooldown');
          localStorage.removeItem('login_rate_limit_timestamp');
        }
      }
      return null;
    }
  );

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Get redirect destination from either query parameters or navigation state
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl');
  const fromState = location.state?.from?.pathname;

  // Priority: 1. returnUrl query param, 2. from state, 3. default home
  const redirectTo = returnUrl || fromState || '/';

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

    // Check if we're in rate limit cooldown
    if (rateLimitCooldown && rateLimitCooldown > 0) {
      return;
    }

    try {
      await login(formData.email, formData.password);
      navigate(redirectTo);
    } catch (error: any) {
      // Check if this is a rate limit error
      if (error?.status === 429) {
        // Extract retryAfterSeconds from error details
        const retrySeconds = error?.details?.retryAfterSeconds || 60;
        setRateLimitCooldown(retrySeconds);
        setRateLimitError(
          `Too many login attempts. Please try again in ${Math.ceil(retrySeconds / 60)} minute${Math.ceil(retrySeconds / 60) !== 1 ? 's' : ''}.`
        );

        // Save to localStorage for persistence
        localStorage.setItem(
          'login_rate_limit_cooldown',
          retrySeconds.toString()
        );
        localStorage.setItem(
          'login_rate_limit_timestamp',
          Date.now().toString()
        );

        // Start countdown timer
        const interval = setInterval(() => {
          setRateLimitCooldown((prev) => {
            if (prev && prev > 1) {
              // Update localStorage with remaining time
              localStorage.setItem(
                'login_rate_limit_cooldown',
                (prev - 1).toString()
              );
              return prev - 1;
            } else {
              clearInterval(interval);
              setRateLimitError(null);
              // Clear localStorage when cooldown expires
              localStorage.removeItem('login_rate_limit_cooldown');
              localStorage.removeItem('login_rate_limit_timestamp');
              return null;
            }
          });
        }, 1000);
      }
      // Error is also handled by the auth context and toast
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Format cooldown time for display
  const formatCooldownTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
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
                  {/* Rate Limit Error Alert */}
                  {rateLimitError && (
                    <Alert
                      severity='warning'
                      sx={{
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          width: '100%',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Typography variant='body2'>
                          {rateLimitError}
                        </Typography>
                        {rateLimitCooldown && rateLimitCooldown > 0 && (
                          <Typography
                            variant='body2'
                            sx={{ fontWeight: 'bold', ml: 2 }}
                          >
                            {formatCooldownTime(rateLimitCooldown)}
                          </Typography>
                        )}
                      </Box>
                    </Alert>
                  )}

                  {/* Regular Error Alert */}
                  {error && !rateLimitError && (
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
                    disabled={!!rateLimitCooldown && rateLimitCooldown > 0}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background:
                        rateLimitCooldown && rateLimitCooldown > 0
                          ? theme.palette.grey[400]
                          : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      '&:hover':
                        rateLimitCooldown && rateLimitCooldown > 0
                          ? {}
                          : {
                              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                            },
                    }}
                  >
                    {rateLimitCooldown && rateLimitCooldown > 0
                      ? `Try again in ${formatCooldownTime(rateLimitCooldown)}`
                      : 'Sign In'}
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
                    to={`/register?returnUrl=${encodeURIComponent(redirectTo)}`}
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
