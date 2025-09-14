import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard,
  Person,
  CardGiftcard,
  Store,
  ShoppingCart,
  Settings,
  Palette,
  Home,
  Favorite,
  MonetizationOn,
  Star,
  Paid,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ReferralProgramPage from './ReferralProgramPage';
import BrandingVisualsSection from '../../components/dashboard/BrandingVisualsSection';
import { useUserStore } from '../../hooks/useUserStore';
import { useComprehensiveStore } from '../../hooks/useComprehensiveStore';
import StoreOverviewSection from '../../components/dashboard/StoreOverviewSection';
import StoreSetupProgress from '../../components/dashboard/StoreSetupProgress';
import ErrorBoundary from '../../components/ErrorBoundary';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const UserDashboard: React.FC = () => {
  const { user, handleAuthenticationError } = useAuth();

  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Fetch user store data
  const {
    primaryStore,
    isLoading: storeLoading,
    error: storeError,
  } = useUserStore();

  // Use comprehensive store hook for detailed store data
  const { storeData: comprehensiveStoreData, getCompletionPercentage } =
    useComprehensiveStore({
      storeId: primaryStore?.storeId,
      autoFetch: !!primaryStore?.storeId,
    });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Debug: Validate store type
  React.useEffect(() => {
    if (primaryStore) {
      console.log('✅ Store type validation:', {
        storeId: primaryStore.storeId,
        storeName: primaryStore.storeName,
        isActive: primaryStore.isActive,
        type: typeof primaryStore,
      });
    }
  }, [primaryStore]);

  if (!user) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Typography variant='h5'>
          Please log in to access your dashboard.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* User Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display='flex' alignItems='center' gap={3}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
              fontWeight: 600,
            }}
          >
            {getInitials(user.firstName, user.lastName)}
          </Avatar>
          <Box flex={1}>
            <Typography variant='h4' fontWeight={600} gutterBottom>
              Welcome, {user.firstName}!
            </Typography>
            <Box display='flex' alignItems='center' gap={2} flexWrap='wrap'>
              <Typography variant='body1' color='text.secondary'>
                {user.email}
              </Typography>
              {user.hasStore ? (
                <Chip
                  label='Store Owner'
                  color='success'
                  variant='outlined'
                  size='small'
                />
              ) : (
                <Chip
                  label={user.userType}
                  color='primary'
                  variant='outlined'
                  size='small'
                />
              )}
            </Box>
          </Box>
          <Box display='flex' gap={1}>
            <Button
              variant='outlined'
              startIcon={<Home />}
              onClick={() => navigate('/')}
              sx={{ textTransform: 'none' }}
            >
              Back to Homepage
            </Button>
            <Button
              variant='outlined'
              startIcon={<Settings />}
              sx={{ textTransform: 'none' }}
            >
              Account Settings
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats */}
      {user.hasStore ? (
        // Store owner stats
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Store color='primary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      1
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Active Store
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Dashboard color='success' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      24
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Products Listed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <ShoppingCart color='warning' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      8
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Orders Today
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Paid color='info' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      $1,248
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      ) : (
        // Regular customer stats
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            mb: 3,
          }}
        >
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <ShoppingCart color='primary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      3
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Orders This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Favorite color='error' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      12
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Favorite Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <MonetizationOn color='success' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      $234
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Star color='warning' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      4.8
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Average Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Main Dashboard Content */}
      <Paper sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='dashboard tabs'
            variant='scrollable'
            scrollButtons='auto'
            sx={{ px: 3 }}
          >
            <Tab
              icon={<Dashboard />}
              label='Overview'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(0)}
            />
            <Tab
              icon={<Store />}
              label='Store Overview'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(1)}
            />
            <Tab
              icon={<Palette />}
              label='Branding & Visuals'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(2)}
            />
            <Tab
              icon={<ShoppingCart />}
              label='My Orders'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(3)}
            />
            <Tab
              icon={<CardGiftcard />}
              label='Referral Program'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(4)}
            />
            <Tab
              icon={<Person />}
              label='Profile'
              iconPosition='start'
              sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
              {...a11yProps(5)}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {user.hasStore ? (
              <StoreSetupProgress
                storeId={primaryStore?.storeId || 0}
                storeName={primaryStore?.storeName || 'Your Store'}
                completionPercentage={getCompletionPercentage()}
                storeData={comprehensiveStoreData}
                approvalStatus={comprehensiveStoreData?.approvalStatus}
                onNavigateToStep={(step) => {
                  if (step === 'branding') {
                    setTabValue(2);
                  }
                }}
                onCompleteSetup={() => console.log('Complete setup')}
              />
            ) : (
              <>
                <Typography variant='h6' gutterBottom>
                  Dashboard Overview
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 3 }}
                >
                  Welcome to your dashboard! Here you can manage your account,
                  track orders, and explore our referral program.
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          Recent Activity
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Your recent orders and activities will appear here.
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Card variant='outlined'>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          Quick Actions
                        </Typography>
                        <Box
                          display='flex'
                          flexDirection='column'
                          gap={1}
                          sx={{ mt: 2 }}
                        >
                          <Button
                            variant='outlined'
                            size='small'
                            sx={{ textTransform: 'none' }}
                          >
                            Browse Products
                          </Button>
                          <Button
                            variant='outlined'
                            size='small'
                            sx={{ textTransform: 'none' }}
                          >
                            Track an Order
                          </Button>
                          <Button
                            variant='outlined'
                            size='small'
                            sx={{ textTransform: 'none' }}
                          >
                            Update Profile
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <StoreOverviewSection onNavigateToBranding={() => setTabValue(2)} />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            {storeLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant='body2' sx={{ ml: 2 }}>
                  Loading store data...
                </Typography>
              </Box>
            ) : storeError ? (
              <Alert severity='error' sx={{ mb: 2 }}>
                Store Error: {storeError}
                <br />
                <Button
                  size='small'
                  onClick={() => window.location.reload()}
                  sx={{ mt: 1 }}
                >
                  Reload Page
                </Button>
              </Alert>
            ) : !primaryStore ? (
              <Alert severity='warning' sx={{ mb: 2 }}>
                No store found. Please create a store first to manage branding.
              </Alert>
            ) : (
              <BrandingVisualsSection
                storeId={primaryStore.storeId}
                onUpdate={(data: unknown) => {
                  console.log('Branding data updated:', data);
                  // TODO: Save to backend or update local state
                }}
                onError={(error: unknown) => {
                  // Handle authentication errors
                  if (!handleAuthenticationError(error, navigate)) {
                    // If not an auth error, show generic error
                    console.error('Branding section error:', error);
                  }
                }}
              />
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              My Orders
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Your order history and current orders will be displayed here.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: 0 }}>
            <ReferralProgramPage />
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Update your personal information and account preferences.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

const WrappedUserDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserDashboard />
    </ErrorBoundary>
  );
};

export default WrappedUserDashboard;
