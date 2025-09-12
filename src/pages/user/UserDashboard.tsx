import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Dashboard,
  Person,
  CardGiftcard,
  Store,
  ShoppingCart,
  TrendingUp,
  Settings,
  Palette,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ReferralProgramPage from './ReferralProgramPage';
import BrandingVisualsSection from '../../components/dashboard/BrandingVisualsSection';
import StoreOverviewSection from '../../components/dashboard/StoreOverviewSection';
import StoreSetupProgress from '../../components/dashboard/StoreSetupProgress';

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
  const { user, updateStoreStatus } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
              <Chip
                label={user.userType}
                color='primary'
                variant='outlined'
                size='small'
              />
              {user.hasStore && (
                <Chip
                  label='Store Owner'
                  color='success'
                  variant='outlined'
                  size='small'
                />
              )}
              {/* DEBUG: Show store status */}
              <Chip
                label={`hasStore: ${user.hasStore}`}
                color={user.hasStore ? 'success' : 'error'}
                variant='outlined'
                size='small'
              />
            </Box>
          </Box>
          <Box display='flex' gap={1}>
            <Button
              variant='outlined'
              startIcon={<Settings />}
              sx={{ textTransform: 'none' }}
            >
              Account Settings
            </Button>
            {/* DEBUG: Test button to toggle store status */}
            <Button
              variant='outlined'
              color='secondary'
              onClick={() => {
                updateStoreStatus(!user.hasStore);
              }}
              size='small'
            >
              Toggle Store
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats */}
      {user.hasStore ? (
        // Store owner stats
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <ShoppingCart color='success' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      24
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Orders Received
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <TrendingUp color='success' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      $1,240.50
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Total Revenue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Person color='secondary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      18
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Regular Customers
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // Regular customer stats
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <ShoppingCart color='primary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      12
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Orders Placed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <TrendingUp color='success' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      $240.50
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Total Spent
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <CardGiftcard color='primary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      $25.00
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Available Credits
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' gap={2}>
                  <Person color='secondary' />
                  <Box>
                    <Typography variant='h6' fontWeight={600}>
                      5
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Friends Referred
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
            {/* Always show store tabs for testing - remove hasStore condition temporarily */}
            <>
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
            </>
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
                storeId={1}
                storeName='Green Valley Farm'
                completionPercentage={65}
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

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </TabPanel>

        {/* Always show store tabs for testing */}
        <>
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <StoreOverviewSection
                onNavigateToBranding={() => setTabValue(2)}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ p: 3 }}>
              <BrandingVisualsSection
                storeId={1} // TODO: Replace with actual store ID from user data
                onUpdate={(data) => {
                  console.log('Branding data updated:', data);
                  // TODO: Save to backend or update local state
                }}
              />
            </Box>
          </TabPanel>
        </>

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

export default UserDashboard;
