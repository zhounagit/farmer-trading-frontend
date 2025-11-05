import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { apiService } from '@/shared/services/api-service';
import { API_ENDPOINTS } from '@/shared/types/api-contracts';
import type { UserProfileResponse } from '@/shared/types/api-contracts';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoleBadgeColor } from '@/utils/userTypeUtils';

interface AccountInfoProps {
  onDataChange?: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ onDataChange }) => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get<UserProfileResponse>(
          API_ENDPOINTS.USERS.BY_ID(parseInt(user.userId))
        );
        setUserProfile(response);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError('Failed to load account information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Handle edit form changes
  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Open edit dialog
  const handleEditOpen = () => {
    if (userProfile) {
      setEditForm({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone || '',
      });
    }
    setEditDialogOpen(true);
  };

  // Save profile changes
  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      setError(null);
      await apiService.put(
        API_ENDPOINTS.USERS.BY_ID(parseInt(user.userId)),
        editForm
      );

      // Reload profile data
      const response = await apiService.get<UserProfileResponse>(
        API_ENDPOINTS.USERS.BY_ID(parseInt(user.userId))
      );
      setUserProfile(response);
      setEditDialogOpen(false);
      onDataChange?.();
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await apiService.delete(API_ENDPOINTS.USERS.BY_ID(parseInt(user.userId)));
      // Log out user and redirect to home page after deletion
      await logout();
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to delete account:', err);
      setError(
        'Failed to delete account. Please check your password and try again.'
      );
    } finally {
      setPasswordDialogOpen(false);
    }
  };

  // Handle data export
  const handleExportData = async () => {
    // This would typically call an API endpoint to export user data
    alert(
      'Data export functionality would be implemented here for GDPR compliance'
    );
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get user type display text
  const getUserTypeDisplay = (userType: string) => {
    switch (userType) {
      case 'customer':
        return 'Customer';
      case 'store_owner':
        return 'Store Owner';
      case 'admin':
        return 'Administrator';
      default:
        return userType;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading account information...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  if (!userProfile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='warning'>No account information found.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' gutterBottom>
          Account Information
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Manage your personal information and account settings
        </Typography>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* First Row */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Basic Profile Information */}
          <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='h6'>Basic Profile Information</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      First Name
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      {userProfile.firstName}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Last Name
                    </Typography>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      {userProfile.lastName}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    Email Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='body1' sx={{ fontWeight: 500 }}>
                      {userProfile.email}
                    </Typography>
                    <Tooltip title='Email verified'>
                      <VerifiedUserIcon
                        sx={{ fontSize: 16, color: 'success.main' }}
                      />
                    </Tooltip>
                  </Box>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Phone Number
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {userProfile.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<EditIcon />}
                  variant='outlined'
                  size='small'
                  onClick={handleEditOpen}
                >
                  Edit Profile
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='h6'>Account Details</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    User Type
                  </Typography>
                  <Chip
                    label={getUserTypeDisplay(userProfile.userType)}
                    size='small'
                    sx={{
                      backgroundColor: getUserRoleBadgeColor(
                        userProfile.userType
                      ),
                      color: 'white',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    Account Status
                  </Typography>
                  <Chip
                    label={userProfile.isActive ? 'Active' : 'Inactive'}
                    size='small'
                    color={userProfile.isActive ? 'success' : 'default'}
                  />
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Referral Code
                  </Typography>
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 500, fontFamily: 'monospace' }}
                  >
                    {userProfile.usedReferralCode || 'Not available'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Second Row */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {/* Account Timeline */}
          <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='h6'>Account Timeline</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Account Created
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {formatDate(userProfile.createdAt)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Last Updated
                  </Typography>
                  <Typography variant='body1' sx={{ fontWeight: 500 }}>
                    {formatDate(userProfile.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card sx={{ flex: '1 1 300px', minWidth: 300 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant='h6'>Account Management</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  startIcon={<SecurityIcon />}
                  variant='outlined'
                  onClick={() => (window.location.href = '/change-password')}
                >
                  Change Password
                </Button>

                <Button
                  startIcon={<DownloadIcon />}
                  variant='outlined'
                  onClick={handleExportData}
                >
                  Export My Data
                </Button>

                <Divider />

                <Button
                  startIcon={<DeleteIcon />}
                  variant='outlined'
                  color='error'
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Edit Profile Information</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='First Name'
                value={editForm.firstName}
                onChange={(e) => handleEditChange('firstName', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label='Last Name'
                value={editForm.lastName}
                onChange={(e) => handleEditChange('lastName', e.target.value)}
                fullWidth
                required
              />
            </Box>
            <TextField
              label='Phone Number'
              value={editForm.phone}
              onChange={(e) => handleEditChange('phone', e.target.value)}
              fullWidth
              placeholder='+1 (555) 123-4567'
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your account? This action cannot be
            undone. All your data, including orders, preferences, and profile
            information will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setPasswordDialogOpen(true);
            }}
            color='error'
            variant='contained'
          >
            Continue to Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Confirm Account Deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to permanently delete your account? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color='error'
            variant='contained'
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountInfo;
