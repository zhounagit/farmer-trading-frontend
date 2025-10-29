import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/shared/services/api-service';
import { API_ENDPOINTS } from '@/shared/types/api-contracts';
import Header from '@/components/layout/Header';

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (
    field: keyof ChangePasswordForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!form.currentPassword.trim()) {
      return 'Current password is required';
    }
    if (!form.newPassword.trim()) {
      return 'New password is required';
    }
    if (!form.confirmPassword.trim()) {
      return 'Please confirm your new password';
    }
    if (form.newPassword !== form.confirmPassword) {
      return 'New passwords do not match';
    }
    if (form.newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (form.newPassword === form.currentPassword) {
      return 'New password must be different from current password';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError('You must be logged in to change your password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await apiService.post(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD(parseInt(user.userId)),
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }
      );

      setSuccess(true);
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Redirect to account settings after 2 seconds
      setTimeout(() => {
        navigate('/account-settings');
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to change password:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSettings = () => {
    navigate('/account-settings');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Box>
      <Header onLoginClick={handleLoginClick} />
      <Container maxWidth='sm' sx={{ py: 4 }}>
        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToSettings}
          sx={{ mb: 2 }}
        >
          Back to Account Settings
        </Button>

        {/* Page Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant='h4' component='h1' gutterBottom>
            Change Password
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Update your password to keep your account secure
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' sx={{ mb: 3 }}>
                Password changed successfully! Redirecting to account
                settings...
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label='Current Password'
                  type='password'
                  value={form.currentPassword}
                  onChange={(e) =>
                    handleInputChange('currentPassword', e.target.value)
                  }
                  required
                  fullWidth
                  disabled={loading || success}
                  autoComplete='current-password'
                />

                <TextField
                  label='New Password'
                  type='password'
                  value={form.newPassword}
                  onChange={(e) =>
                    handleInputChange('newPassword', e.target.value)
                  }
                  required
                  fullWidth
                  disabled={loading || success}
                  autoComplete='new-password'
                  helperText='Password must be at least 8 characters long'
                />

                <TextField
                  label='Confirm New Password'
                  type='password'
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleInputChange('confirmPassword', e.target.value)
                  }
                  required
                  fullWidth
                  disabled={loading || success}
                  autoComplete='new-password'
                />

                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  disabled={loading || success}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Changing Password...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant='body2' color='text.secondary'>
                Forgot your password?{' '}
                <Button
                  variant='text'
                  size='small'
                  onClick={() => navigate('/forgot-password')}
                  sx={{ textTransform: 'none' }}
                >
                  Reset it here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
