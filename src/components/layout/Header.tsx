import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Login,
  Logout,
  Dashboard,
  Settings,
  Info,
  Store,
  ShoppingCart,
} from '@mui/icons-material';

import { CartBadge } from '@features/cart';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';
import UserProfilePictureAvatar from '../user/UserProfilePictureAvatar';
import {
  canAccessStoreFeatures,
  getUserRoleDisplayName,
  getUserRoleBadgeColor,
  isAdminUser,
} from '../../utils/userTypeUtils';

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const {
    user,
    isAuthenticated,
    logout,
    refreshProfilePicture,
    userVersion,
    userPreferences,
    updateUserPreferences,
  } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const profilePictureRetryCountRef = useRef(0);
  const [maxProfilePictureRetries] = useState(2); // Maximum retry attempts
  const [profilePictureExists, setProfilePictureExists] = useState<
    boolean | null
  >(null);

  const profilePictureLoadingRef = useRef(false);

  const navigate = useNavigate();
  const profilePictureRetryRef = useRef<NodeJS.Timeout | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // Function to immediately update privacy settings without API call
  const updatePrivacySettingsImmediately = useCallback(
    (showEmail: boolean) => {
      if (!userPreferences) {
        // If no preferences exist yet, create default with the updated privacy setting
        const newPreferences = {
          privacy: {
            showEmail,
            showPhone: false,
            allowMessages: true,
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false,
          },
          display: {
            theme: 'auto' as const,
            language: 'en',
            timezone: 'UTC',
          },
          referralCredits: {
            handling: 'bank_transfer',
          },
        };
        updateUserPreferences(newPreferences);
      } else {
        // Update only the privacy settings
        const updatedPreferences = {
          ...userPreferences,
          privacy: {
            ...userPreferences.privacy,
            showEmail,
          },
        };
        updateUserPreferences(updatedPreferences);
      }
    },
    [userPreferences, updateUserPreferences]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Expose refresh function globally so other components can call it
  React.useEffect(() => {
    (
      window as typeof window & {
        updatePrivacySettingsImmediately?: (showEmail: boolean) => void;
      }
    ).updatePrivacySettingsImmediately = updatePrivacySettingsImmediately;

    // Expose function to reset profile picture state when new photo is uploaded
    (
      window as typeof window & {
        refreshHeaderPreferences?: () => void;
        resetHeaderProfilePictureState?: () => void;
        updatePrivacySettingsImmediately?: (showEmail: boolean) => void;
      }
    ).resetHeaderProfilePictureState = () => {
      setProfilePictureExists(null);
      profilePictureRetryCountRef.current = 0;
      profilePictureLoadingRef.current = false;
      // Don't call refreshProfilePicture - it overrides the new URL with old backend data
      // The updateProfile call already has the correct new URL
    };

    return () => {
      delete (
        window as typeof window & {
          updatePrivacySettingsImmediately?: (showEmail: boolean) => void;
        }
      ).updatePrivacySettingsImmediately;
    };
  }, [updatePrivacySettingsImmediately]);

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/');
  };

  const handleHowItWorks = () => {
    navigate('/how-it-works');
  };

  const isMenuOpen = Boolean(anchorEl);

  const handleOpenStoreClick = () => {
    navigate('/open-shop');
    handleProfileMenuClose();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  // Profile picture loading with retry mechanism
  useEffect(() => {
    if (!user || !user.userId) {
      return;
    }

    // Clear any existing retry timer
    if (profilePictureRetryRef.current) {
      clearTimeout(profilePictureRetryRef.current);
    }

    // If user has no profile picture URL, we haven't exceeded max retries, and we don't know that no picture exists
    // OR if profilePictureExists is null (indicating a forced refresh)
    if (
      (!user?.profilePictureUrl || profilePictureExists === null) &&
      profilePictureRetryCountRef.current < maxProfilePictureRetries &&
      !profilePictureLoadingRef.current &&
      profilePictureExists !== false
    ) {
      profilePictureLoadingRef.current = true;

      profilePictureRetryRef.current = setTimeout(
        async () => {
          try {
            // Don't call refreshProfilePicture - it overrides the correct new URL with stale backend data
            profilePictureRetryCountRef.current += 1;
          } catch {
            // Only log error on first attempt to prevent spam
            if (profilePictureRetryCountRef.current === 0) {
              // Silent error handling
            }
            profilePictureRetryCountRef.current += 1;
          } finally {
            profilePictureLoadingRef.current = false;
          }
        },
        1000 * (profilePictureRetryCountRef.current + 1)
      ); // Exponential backoff
    } else if (
      profilePictureRetryCountRef.current >= maxProfilePictureRetries
    ) {
      // Max retries reached
    } else if (profilePictureExists === false) {
      // Profile picture doesn't exist
    } else {
      // No action needed
    }
  }, [
    user,
    user?.userId,
    maxProfilePictureRetries,
    refreshProfilePicture,
    profilePictureExists,
    userVersion,
  ]);

  // Reset retry count and completion state when user changes or profile picture updates
  useEffect(() => {
    profilePictureRetryCountRef.current = 0;
    profilePictureLoadingRef.current = false;
    setProfilePictureExists(null); // Reset existence check when user changes
  }, [user?.userId, user?.profilePictureUrl, userVersion]);

  return (
    <AppBar
      position='static'
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 1, md: 1.5 },
          minHeight: { xs: 56, md: 64 },
        }}
      >
        {/* Logo Section */}
        <Logo size='medium' onClick={handleLogoClick} />

        {/* Navigation Links */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 2,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Navigation Links */}
          {isLandingPage && (
            <Button
              variant='text'
              startIcon={<Info />}
              onClick={handleHowItWorks}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: 'text.primary',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              How It Works
            </Button>
          )}
        </Box>

        {/* Navigation Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Cart Badge - Show for both authenticated and guest users */}
          <CartBadge
            onClick={() => navigate('/cart')}
            size='medium'
            color='primary'
          />

          {isAuthenticated && user ? (
            <>
              {/* User Info */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  gap: 1,
                  mr: 1,
                }}
              >
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ fontSize: { sm: '0.875rem', md: '1rem' } }}
                >
                  Welcome,
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight={600}
                  sx={{ fontSize: { sm: '0.875rem', md: '1rem' } }}
                >
                  {user.firstName}
                </Typography>
                <Chip
                  label={getUserRoleDisplayName(user.userType, user.hasStore)}
                  size='small'
                  variant='filled'
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: getUserRoleBadgeColor(
                      user.userType,
                      user.hasStore
                    ),
                    color: 'white',
                    '&:hover': {
                      backgroundColor: (() => {
                        const baseColor = getUserRoleBadgeColor(
                          user.userType,
                          user.hasStore
                        );
                        // Darken the color for hover effect
                        switch (baseColor) {
                          case '#1976d2':
                            return '#1565c0'; // Blue -> Darker Blue
                          case '#2e7d32':
                            return '#1b5e20'; // Green -> Darker Green
                          case '#d32f2f':
                            return '#c62828'; // Red -> Darker Red
                          default:
                            return '#555';
                        }
                      })(),
                    },
                  }}
                />
              </Box>

              {/* Profile Menu */}
              <IconButton
                size={isMobile ? 'medium' : 'large'}
                edge='end'
                aria-label='account of current user'
                aria-controls='profile-menu'
                aria-haspopup='true'
                onClick={handleMenuOpen}
                color='inherit'
                sx={{ p: { xs: 1, md: 1.5 } }}
              >
                <UserProfilePictureAvatar
                  user={user}
                  size={isMobile ? 28 : 64}
                  retryCount={3}
                />
              </IconButton>

              <Menu
                id='profile-menu'
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={isMenuOpen}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                  },
                }}
              >
                {/* User Info Header */}
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant='subtitle2' fontWeight={600}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {userPreferences?.privacy?.showEmail
                      ? user.email
                      : 'Email hidden'}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={() => {
                    // Redirect admin users to admin dashboard, others to regular dashboard
                    const dashboardPath =
                      user.userType === 'admin'
                        ? '/admin/dashboard'
                        : '/dashboard';
                    navigate(dashboardPath);
                    handleProfileMenuClose();
                  }}
                >
                  <Dashboard sx={{ mr: 2 }} />
                  {isAdminUser(user.userType) ? 'Admin Dashboard' : 'Dashboard'}
                </MenuItem>

                {(() => {
                  // Only show "My Stores" for store owners, not admin users
                  const typeCheck = canAccessStoreFeatures(
                    user.userType,
                    user.hasStore
                  );
                  const isAdmin = isAdminUser(user.userType);
                  return typeCheck && !isAdmin;
                })() && (
                  <MenuItem
                    onClick={() => {
                      navigate('/my-stores');
                      handleProfileMenuClose();
                    }}
                  >
                    <Store sx={{ mr: 2 }} />
                    My Stores
                  </MenuItem>
                )}

                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate('/cart');
                  }}
                >
                  <ShoppingCart sx={{ mr: 2 }} />
                  View Cart
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose();
                    navigate('/account-settings');
                  }}
                >
                  <Settings sx={{ mr: 2 }} />
                  Account Settings
                </MenuItem>

                <Divider />

                {!isAdminUser(user.userType) && [
                  <MenuItem key='open-store' onClick={handleOpenStoreClick}>
                    <Store sx={{ mr: 2 }} />
                    Open Your Shop
                  </MenuItem>,

                  <Divider key='divider-store' />,
                ]}

                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* How It Works Button for Mobile - Only show on landing page */}
              {isLandingPage && (
                <Button
                  variant='text'
                  startIcon={<Info />}
                  onClick={handleHowItWorks}
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    textTransform: 'none',
                    fontWeight: 500,
                    color: 'text.primary',
                    px: 2,
                    py: 1,
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  How It Works
                </Button>
              )}

              {/* Login Button for Guests */}
              <Button
                variant='contained'
                startIcon={<Login />}
                onClick={onLoginClick}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  fontSize: '1rem',
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
