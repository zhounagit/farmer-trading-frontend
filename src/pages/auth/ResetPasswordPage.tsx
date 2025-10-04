import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../utils/api';

const ResetPasswordPage: React.FC = () => {
  const theme = useTheme();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const token = searchParams.get('token');

  const validateToken = useCallback(async () => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setTokenValid(false);
      setIsValidatingToken(false);
      return;
    }

    try {
      console.log('🔍 Validating reset token:', token);

      await authApi.validateResetToken(token);

      setTokenValid(true);
    } catch (err: unknown) {
      console.error('Token validation error:', err);

      const error = err as { status?: number; message?: string };
      if (error.status === 400) {
        setError(
          'This reset link has expired. Please request a new password reset.'
        );
      } else if (error.status === 404) {
        setError('Invalid reset link. Please request a new password reset.');
      } else {
        setError(
          'Unable to validate reset link. Please try again or request a new reset.'
        );
      }
      setTokenValid(false);
    } finally {
      setIsValidatingToken(false);
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Resetting password with token');

      await authApi.resetPassword(
        token,
        formData.password,
        formData.confirmPassword
      );

      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch (err: unknown) {
      console.error('Reset password error:', err);

      const error = err as {
        message?: string;
        status?: number;
      };
      if (error.message) {
        setError(error.message);
      } else if (error.status === 400) {
        setError(
          'Invalid or expired reset link. Please request a new password reset.'
        );
      } else if (error.status && error.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to reset password. Please try again.');
      }

      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (isValidatingToken) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress size={48} sx={{ color: 'white', mb: 2 }} />
          <Typography variant='h6'>Validating reset link...</Typography>
        </Box>
      </Box>
    );
  }

  if (!tokenValid) {
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
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.error.main} 30%, ${theme.palette.error.light} 90%)`,
                  color: 'white',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography
                  variant='h4'
                  component='h1'
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Invalid Link
                </Typography>
                <Typography variant='body1' sx={{ opacity: 0.9 }}>
                  This password reset link is invalid or has expired
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    component={RouterLink}
                    to='/forgot-password'
                    variant='contained'
                    size='large'
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Request New Reset Link
                  </Button>

                  <Button
                    component={RouterLink}
                    to='/login'
                    variant='outlined'
                    size='large'
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  if (isSuccess) {
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
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
                  color: 'white',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography
                  variant='h4'
                  component='h1'
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Password Reset!
                </Typography>
                <Typography variant='body1' sx={{ opacity: 0.9 }}>
                  Your password has been successfully reset
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant='body1' color='text.secondary'>
                    Your password has been updated. You can now sign in with
                    your new password.
                  </Typography>
                </Box>

                <Button
                  variant='contained'
                  size='large'
                  fullWidth
                  onClick={handleBackToLogin}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Continue to Login
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

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
            <Box
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.light} 90%)`,
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Reset Password
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.9 }}>
                Enter your new password below
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {error && (
                    <Alert severity='error' sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* New Password Field */}
                  <TextField
                    label='New Password'
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    error={!!formErrors.password}
                    helperText={
                      formErrors.password ||
                      'Must be at least 8 characters with uppercase, lowercase, and number'
                    }
                    required
                    fullWidth
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <LockIcon color='action' />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
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
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23) !important',
                          borderWidth: '1px !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: 'rgba(0, 0, 0, 0.6) !important',
                        },
                      },
                    }}
                  />

                  {/* Confirm Password Field */}
                  <TextField
                    label='Confirm New Password'
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
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
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge='end'
                            size='small'
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23) !important',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(0, 0, 0, 0.23) !important',
                          borderWidth: '1px !important',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-focused': {
                          color: 'rgba(0, 0, 0, 0.6) !important',
                        },
                      },
                    }}
                  />

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
                    Reset Password
                  </LoadingButton>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      component={RouterLink}
                      to='/login'
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 500,
                        textTransform: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      Back to Login
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back to Home */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            component={RouterLink}
            to='/'
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 500,
              opacity: 0.9,
              textTransform: 'none',
              '&:hover': {
                opacity: 1,
                textDecoration: 'underline',
                backgroundColor: 'transparent',
              },
            }}
          >
            ← Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;
