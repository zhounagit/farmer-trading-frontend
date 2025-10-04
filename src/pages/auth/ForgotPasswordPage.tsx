import React, { useState } from 'react';
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
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authApi } from '../../utils/api';

const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) {
      setEmailError('');
    }
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.forgotPassword(email.trim());

      setIsSuccess(true);
      toast.success('Password reset email sent successfully!');
    } catch (err: unknown) {
      const error = err as {
        message?: string;
        status?: number;
      };

      if (error.message) {
        setError(error.message);
      } else if (error.status === 404) {
        setError('No account found with this email address');
      } else if (error.status && error.status >= 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }

      toast.error('Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

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
                <SendIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography
                  variant='h4'
                  component='h1'
                  gutterBottom
                  sx={{ fontWeight: 700 }}
                >
                  Email Sent!
                </Typography>
                <Typography variant='body1' sx={{ opacity: 0.9 }}>
                  We've sent password reset instructions to your email
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ mb: 2 }}
                  >
                    We've sent a password reset link to:
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      p: 2,
                      bgcolor: theme.palette.primary.main + '10',
                      borderRadius: 2,
                    }}
                  >
                    {email}
                  </Typography>
                </Box>

                <Alert severity='info' sx={{ mb: 3, borderRadius: 2 }}>
                  <Typography variant='body2'>
                    <strong>Next steps:</strong>
                    <br />
                    1. Check your email inbox (and spam folder)
                    <br />
                    2. Click the reset link in the email
                    <br />
                    3. Create your new password
                  </Typography>
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant='contained'
                    size='large'
                    onClick={handleBackToLogin}
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

                  <Button
                    variant='outlined'
                    size='large'
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail('');
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Send to Different Email
                  </Button>
                </Box>
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
              <EmailIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Forgot Password?
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.9 }}>
                No worries! Enter your email and we'll send you reset
                instructions
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

                  <TextField
                    label='Email Address'
                    type='email'
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    error={!!emailError}
                    helperText={
                      emailError ||
                      "We'll send password reset instructions to this email"
                    }
                    required
                    fullWidth
                    autoFocus
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
                    startIcon={<SendIcon />}
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
                    Send Reset Instructions
                  </LoadingButton>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      component={RouterLink}
                      to='/login'
                      startIcon={<ArrowBackIcon />}
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

export default ForgotPasswordPage;
