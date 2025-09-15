import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from '../common/Logo';
import UserProfilePictureAvatar from '../user/UserProfilePictureAvatar';
import {
  canAccessStoreFeatures,
  debugUserType,
  getUserRoleDisplayName,
  getUserRoleBadgeColor,
} from '../../utils/userTypeUtils';

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
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
                bgcolor: 'grey.100',
              },
            }}
          >
            How It Works
          </Button>
        </Box>

        {/* Navigation Actions */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, md: 2 },
          }}
        >
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
                onClick={handleProfileMenuOpen}
                color='inherit'
                sx={{ p: { xs: 1, md: 1.5 } }}
              >
                <UserProfilePictureAvatar
                  user={user as any}
                  size={isMobile ? 28 : 32}
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
                    {user.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={() => {
                    navigate('/dashboard');
                    handleProfileMenuClose();
                  }}
                >
                  <Dashboard sx={{ mr: 2 }} />
                  Dashboard
                </MenuItem>

                {(() => {
                  // Debug user type for troubleshooting
                  debugUserType(
                    user.userType,
                    user.hasStore,
                    'Header My Stores'
                  );

                  return canAccessStoreFeatures(user.userType, user.hasStore);
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

                <MenuItem onClick={handleProfileMenuClose}>
                  <Settings sx={{ mr: 2 }} />
                  Settings
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleOpenStoreClick}>
                  <Store sx={{ mr: 2 }} />
                  Open Your Shop
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* How It Works Button for Mobile */}
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
                  fontSize: '0.875rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                How It Works
              </Button>

              {/* Login Button for Guests */}
              <Button
                variant='text'
                startIcon={<Login />}
                onClick={onLoginClick}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: 'text.primary',
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
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
