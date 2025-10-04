import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Person,
  CardGiftcard,
  Store,
  ShoppingCart,
  Palette,
  Favorite,
  Star,
  Paid,
  TrendingUp,
  AccountBalanceWallet,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import ReferralProgramPage from './ReferralProgramPage';
import BrandingVisualsSection from '../../components/dashboard/BrandingVisualsSection';
import { useUserStore } from '../../hooks/useUserStore';
import { useComprehensiveStore } from '../../hooks/useComprehensiveStore';
import StoreOverviewSection from '../../components/dashboard/StoreOverviewSection';
import StoreSetupProgress from '../../components/dashboard/StoreSetupProgress';
import ErrorBoundary from '../../components/ErrorBoundary';
import ProfilePictureUpload from '../../components/user/ProfilePictureUpload';
import dashboardApiService, {
  type DashboardMetrics,
} from '../../services/dashboard.api';
import {
  canAccessStoreFeatures,
  getDashboardMetricLabels,
  isAdminUser,
} from '../../utils/userTypeUtils';

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (isAdminUser(user?.userType)) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
  }, [user?.userType, navigate]);

  // Define tab configuration based on user type
  const getTabConfig = () => {
    const canAccessStore = canAccessStoreFeatures(
      user?.userType,
      user?.hasStore
    );
    const isAdmin = isAdminUser(user?.userType);

    if (canAccessStore && !isAdmin) {
      console.log('✅ Loading STORE OWNER dashboard tabs (6 tabs)');
      return [
        { key: 'overview', label: 'Overview', icon: <Dashboard /> },
        { key: 'store', label: 'Store Overview', icon: <Store /> },
        { key: 'branding', label: 'Branding & Visuals', icon: <Palette /> },
        { key: 'orders', label: 'My Orders', icon: <ShoppingCart /> },
        { key: 'referral', label: 'Referral Program', icon: <CardGiftcard /> },
        { key: 'profile', label: 'Profile', icon: <Person /> },
      ];
    } else if (isAdmin) {
      console.log('✅ Loading ADMIN dashboard tabs (4 tabs)');
      return [
        { key: 'overview', label: 'Overview', icon: <Dashboard /> },
        { key: 'orders', label: 'My Orders', icon: <ShoppingCart /> },
        { key: 'referral', label: 'Referral Program', icon: <CardGiftcard /> },
        { key: 'profile', label: 'Profile', icon: <Person /> },
      ];
    } else {
      console.log('✅ Loading CUSTOMER dashboard tabs (4 tabs)');
      return [
        { key: 'overview', label: 'Overview', icon: <Dashboard /> },
        { key: 'orders', label: 'My Orders', icon: <ShoppingCart /> },
        { key: 'referral', label: 'Referral Program', icon: <CardGiftcard /> },
        { key: 'profile', label: 'Profile', icon: <Person /> },
      ];
    }
  };

  const tabConfig = getTabConfig();

  // Get dynamic metric labels based on user type
  // - Store Owners: "Total Transactions" (transaction volume from their store)
  // - Customers: "Total Referral Credit" (credits earned from referrals)
  // - Admins: "Total Spent" (default platform spending)
  const metricLabels = getDashboardMetricLabels(user?.userType, user?.hasStore);

  // Debug logging for metric labels
  console.log('📊 Dashboard metrics for user:', {
    userType: user?.userType,
    hasStore: user?.hasStore,
    metricLabels,
    isStoreOwner: canAccessStoreFeatures(user?.userType, user?.hasStore),
  });

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

  // Fetch dashboard metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      setMetricsLoading(true);
      try {
        let dashboardMetrics: DashboardMetrics;

        if (primaryStore) {
          // Fetch store-specific metrics for store owners
          dashboardMetrics = await dashboardApiService.getStoreMetrics(
            primaryStore.storeId
          );
        } else {
          // Fetch general user metrics for customers
          dashboardMetrics = await dashboardApiService.getUserMetrics();
        }

        setMetrics(dashboardMetrics);
        console.log('✅ Dashboard metrics loaded:', dashboardMetrics);
      } catch (error) {
        console.error('❌ Failed to load dashboard metrics:', error);
        // Use default metrics on error
        setMetrics({
          ordersThisMonth: 0,
          favoriteItems: 0,
          totalTransactions: 0,
          averageRating: 0,
          productsListed: 0,
          totalRevenue: 0,
          referralCredits: 0,
        });
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, [user, primaryStore]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Debug: Validate store type
  useEffect(() => {
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

  // Show loading while redirecting admin users
  if (isAdminUser(user.userType)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='50vh'
        >
          <CircularProgress />
          <Typography variant='h6' sx={{ ml: 2 }}>
            Redirecting to Admin Dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Dashboard Content */}
        <Box sx={{ mb: 3 }}>
          <Box>
            <Typography variant='h4' fontWeight={600}>
              Dashboard
            </Typography>
          </Box>
        </Box>

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
                        {metricsLoading
                          ? '...'
                          : (metrics?.productsListed ?? 0)}
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
                        {metricsLoading
                          ? '...'
                          : (metrics?.ordersThisMonth ?? 0)}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Total Orders
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
                        {metricsLoading
                          ? '...'
                          : `$${metrics?.totalRevenue ?? 0}`}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Total Revenue
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
                        {metricsLoading
                          ? '...'
                          : (metrics?.ordersThisMonth ?? 0)}
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
                        {metricsLoading
                          ? '...'
                          : primaryStore
                            ? (metrics?.productsListed ?? 0)
                            : (metrics?.favoriteItems ?? 0)}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {primaryStore ? 'Products Listed' : 'Favorite Items'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
              <Card>
                <CardContent>
                  <Tooltip title={metricLabels.spentDescription} arrow>
                    <Box display='flex' alignItems='center' gap={2}>
                      {/* Dynamic icon based on user type:
                        - Store Owners: TrendingUp (for transaction volume)
                        - Customers: AccountBalanceWallet (for referral credits) */}
                      {canAccessStoreFeatures(
                        user?.userType,
                        user?.hasStore
                      ) ? (
                        <TrendingUp color='success' />
                      ) : (
                        <AccountBalanceWallet color='success' />
                      )}
                      <Box>
                        <Typography variant='h6' fontWeight={600}>
                          {metricsLoading
                            ? '...'
                            : canAccessStoreFeatures(
                                  user?.userType,
                                  user?.hasStore
                                )
                              ? `$${metrics?.totalRevenue ?? 0}`
                              : `$${metrics?.referralCredits ?? 0}`}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {/* Dynamic label from getDashboardMetricLabels utility */}
                          {metricLabels.spentLabel}
                        </Typography>
                      </Box>
                    </Box>
                  </Tooltip>
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
                        {metricsLoading ? '...' : (metrics?.averageRating ?? 0)}
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
              {tabConfig.map((tab, index) => (
                <Tab
                  key={tab.key}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition='start'
                  sx={{ textTransform: 'none', minHeight: 'auto', py: 2 }}
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {tabConfig.map((tab, index) => (
            <TabPanel key={tab.key} value={tabValue} index={index}>
              {tab.key === 'overview' && (
                <Box sx={{ p: 3 }}>
                  {/* Store Management Section - Only show setup progress if store is incomplete */}
                  {primaryStore && getCompletionPercentage() < 100 ? (
                    <Box sx={{ mb: 4 }}>
                      <StoreSetupProgress
                        storeId={primaryStore?.storeId || 0}
                        storeName={primaryStore?.storeName || 'Your Store'}
                        completionPercentage={getCompletionPercentage()}
                        storeData={comprehensiveStoreData}
                        approvalStatus={comprehensiveStoreData?.approvalStatus}
                        onNavigateToStep={(step) => {
                          if (step === 'branding') {
                            const brandingIndex = tabConfig.findIndex(
                              (t) => t.key === 'branding'
                            );
                            if (brandingIndex !== -1)
                              setTabValue(brandingIndex);
                          }
                        }}
                        onCompleteSetup={() => console.log('Complete setup')}
                      />
                    </Box>
                  ) : primaryStore && getCompletionPercentage() === 100 ? (
                    <Box sx={{ mb: 4 }}>
                      <Card
                        sx={{
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.200',
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                            }}
                          >
                            <CheckCircle
                              sx={{
                                color: 'success.main',
                                mr: 2,
                                fontSize: 32,
                              }}
                            />
                            <Box>
                              <Typography
                                variant='h6'
                                fontWeight={600}
                                color='success.main'
                              >
                                Store Setup Complete! 🎉
                              </Typography>
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {primaryStore.storeName} is ready and live
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
                          >
                            <Button
                              variant='contained'
                              color='success'
                              startIcon={<Store />}
                              onClick={() =>
                                setTabValue(
                                  tabConfig.findIndex((t) => t.key === 'store')
                                )
                              }
                            >
                              View Store Overview
                            </Button>
                            <Button
                              variant='outlined'
                              color='success'
                              onClick={() =>
                                navigate(
                                  `/stores/${primaryStore.storeId}/customize`
                                )
                              }
                            >
                              Preview Live Store
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : primaryStore ? null : user.hasStore ? (
                    <Box sx={{ mb: 4 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          py: 4,
                        }}
                      >
                        <CircularProgress />
                        <Typography variant='body2' sx={{ ml: 2 }}>
                          Loading your store...
                        </Typography>
                      </Box>
                    </Box>
                  ) : null}

                  {/* Customer Dashboard Section - Always show for all users */}
                  <Box>
                    <Typography variant='h6' gutterBottom>
                      {primaryStore || user.hasStore
                        ? 'Shopping Dashboard'
                        : 'Dashboard Overview'}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 3 }}
                    >
                      {primaryStore || user.hasStore
                        ? 'Browse products, track your orders, and manage your shopping experience.'
                        : 'Welcome to your dashboard! Here you can manage your account, track orders, and explore our referral program.'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      <Box sx={{ flex: '1 1 300px' }}>
                        <Card variant='outlined'>
                          <CardContent>
                            <Typography variant='h6' gutterBottom>
                              Recent Activity
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              Your recent orders and activities will appear
                              here.
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
                                onClick={() => {
                                  const profileIndex = tabConfig.findIndex(
                                    (t) => t.key === 'profile'
                                  );
                                  if (profileIndex !== -1)
                                    setTabValue(profileIndex);
                                }}
                              >
                                Update Profile
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              {tab.key === 'store' && (
                <Box sx={{ p: 3 }}>
                  <StoreOverviewSection
                    onNavigateToBranding={() => {
                      const brandingIndex = tabConfig.findIndex(
                        (t) => t.key === 'branding'
                      );
                      if (brandingIndex !== -1) setTabValue(brandingIndex);
                    }}
                  />
                </Box>
              )}

              {tab.key === 'branding' && (
                <Box sx={{ p: 3 }}>
                  {storeLoading ? (
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
                    >
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
                      No store found. Please create a store first to manage
                      branding.
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
              )}

              {tab.key === 'orders' && (
                <Box sx={{ p: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    My Orders
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Your order history and current orders will be displayed
                    here.
                  </Typography>
                </Box>
              )}

              {tab.key === 'referral' && (
                <Box sx={{ p: 0 }}>
                  <ReferralProgramPage />
                </Box>
              )}

              {tab.key === 'profile' && (
                <Box sx={{ p: 3 }}>
                  <Typography variant='h6' gutterBottom>
                    Profile Settings
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 3 }}
                  >
                    Update your personal information and account preferences.
                  </Typography>

                  {/* Profile Picture Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant='subtitle1' gutterBottom>
                      Profile Picture
                    </Typography>
                    <ProfilePictureUpload
                      size='large'
                      editable={true}
                      showUploadButton={true}
                      onUploadSuccess={(url) => {
                        console.log(
                          'Profile picture uploaded successfully:',
                          url
                        );
                      }}
                      onUploadError={(error) => {
                        console.error('Profile picture upload failed:', error);
                      }}
                    />
                  </Box>

                  {/* Additional profile settings can be added here */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant='h6' gutterBottom>
                      Account Information
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Additional profile settings and account management options
                      will be available here.
                    </Typography>
                  </Box>
                </Box>
              )}
            </TabPanel>
          ))}
        </Paper>
      </Container>
    </Box>
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
