import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Dashboard,
  People,
  Store,
  AccountBalance,
  Analytics,
  Settings,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';

import AdminKPICards from '../../components/admin/AdminKPICards';
import AdminAlertHub from '../../components/admin/AdminAlertHub';
import AdminActivityLog from '../../components/admin/AdminActivityLog';
import AdminQuickActions from '../../components/admin/AdminQuickActions';
import type {
  AlertItem,
  ActivityLogItem,
  QuickAction,
} from '../../components/admin';
import { isAdminUser } from '../../utils/userTypeUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

const mockRecentActivity = [
  {
    id: 1,
    type: 'order',
    title: 'New Order',
    description: 'Order #12345 - $89.50',
    timestamp: '2 minutes ago',
    severity: 'success',
  },
  {
    id: 2,
    type: 'store',
    title: 'Store Application',
    description: 'Fresh Farm Produce submitted for review',
    timestamp: '15 minutes ago',
    severity: 'info',
  },
  {
    id: 3,
    type: 'alert',
    title: 'Low Stock Alert',
    description: 'Organic Tomatoes - Only 5 items left',
    timestamp: '1 hour ago',
    severity: 'warning',
  },
  {
    id: 4,
    type: 'user',
    title: 'New User Registration',
    description: 'John Smith joined as customer',
    timestamp: '2 hours ago',
    severity: 'info',
  },
  {
    id: 5,
    type: 'payout',
    title: 'Payout Processed',
    description: '$450.00 to Green Valley Farm',
    timestamp: '3 hours ago',
    severity: 'success',
  },
];



const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Fetch pending store applications for Mission Control Center
  const { data: pendingApplications } = useQuery({
    queryKey: ['pending-store-applications'],
    queryFn: async () => {
      try {
        const response = await apiService.get('/api/admin/store-applications/pending');
        return response.data || [];
      } catch (error) {
        console.log('Failed to fetch pending applications:', error);
        return [];
      }
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const pendingCount = pendingApplications?.length || 0;



  // KPIs with real data
  const mockKPIs = {
    gmv: {
      value: 250000,
      change: 12.5,
      label: 'Gross Merchandise Volume',
      format: 'currency' as const,
    },
    revenue: {
      value: 25000,
      change: 8.3,
      label: 'Platform Revenue',
      format: 'currency' as const,
    },
    orders: {
      value: 3400,
      change: 15.2,
      label: 'Total Orders',
      format: 'number' as const,
    },
    customers: {
      value: 540,
      change: 22.1,
      label: 'New Customers',
      format: 'number' as const,
    },
    stores: {
      value: pendingCount,
      change: 0,
      label: 'Pending Store Applications',
      format: 'number' as const,
    },
    aov: {
      value: 73.53,
      change: -2.1,
      label: 'Average Order Value',
      format: 'currency' as const,
    },
  };

  // Alerts with real data
  const mockAlerts = [
    {
      id: 1,
      type: 'pending',
      title: 'Store Applications',
      count: pendingCount,
      description: 'Pending review',
      severity: pendingCount > 0 ? 'warning' : 'info',
      action: {
        label: pendingCount > 0 ? 'Review Now' : 'View All',
        onClick: () => navigate('/admin/store-applications'),
      },
    },
    {
      id: 2,
      type: 'withdrawal',
      title: 'Withdrawal Requests',
      count: 3,
      value: 4500,
      description: '$4,500 pending',
      severity: 'info',
      action: {
        label: 'Process',
        onClick: () => console.log('Navigate to withdrawals'),
      },
    },
    {
      id: 3,
      type: 'inventory',
      title: 'Low Stock Items',
      count: 12,
      description: 'Items below threshold',
      severity: 'warning',
      action: {
        label: 'Review',
        onClick: () => console.log('Navigate to inventory'),
      },
    },
    {
      id: 4,
      type: 'report',
      title: 'System Health',
      description: 'All systems operational',
      severity: 'success',
      action: {
        label: 'View Details',
        onClick: () => console.log('Navigate to system health'),
      },
    },
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setLastRefresh(new Date());
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleKPICardClick = (key: string) => {
    console.log(`Navigate to detailed view for ${key}`);
    // Add navigation logic based on KPI type
    if (key === 'stores') {
      navigate('/admin/store-applications');
    }
  };

  // Chart data
  const gmvChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'GMV ($)',
        data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const revenueBreakdownData = {
    labels: ['Commissions', 'Listing Fees', 'Transaction Fees'],
    datasets: [
      {
        data: [18000, 4000, 3000],
        backgroundColor: ['#2e7d32', '#ffa726', '#1976d2'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const topCategoriesData = {
    labels: ['Organic Produce', 'Dairy', 'Grains', 'Meat', 'Beverages'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [45000, 32000, 28000, 22000, 15000],
        backgroundColor: 'rgba(46, 125, 50, 0.8)',
        borderColor: '#2e7d32',
        borderWidth: 1,
      },
    ],
  };

  const tabConfig = [
    { key: 'dashboard', label: 'Mission Control', icon: <Dashboard /> },
    { key: 'users', label: 'User Management', icon: <People /> },
    { key: 'stores', label: 'Store Management', icon: <Store /> },
    { key: 'financial', label: 'Financial Hub', icon: <AccountBalance /> },
    { key: 'analytics', label: 'Analytics & Reports', icon: <Analytics /> },
    { key: 'settings', label: 'Platform Settings', icon: <Settings /> },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'review-applications',
      label: 'Review Applications',
      icon: <Store />,
      count: pendingCount,
      variant: 'contained',
      color: pendingCount > 0 ? 'warning' : 'primary',
      onClick: () => navigate('/admin/store-applications'),
      description: `${pendingCount} pending store applications`,
      urgent: pendingCount > 0,
    },
    {
      id: 'process-payouts',
      label: 'Process Payouts',
      icon: <AccountBalance />,
      count: 3,
      variant: 'contained',
      color: 'info',
      onClick: () => setTabValue(3),
      description: 'Withdrawal requests awaiting processing',
      urgent: true,
    },
    {
      id: 'view-disputes',
      label: 'View Disputes',
      icon: <Settings />,
      count: 2,
      variant: 'contained',
      color: 'error',
      onClick: () => console.log('Navigate to disputes'),
      description: 'Customer disputes requiring attention',
      urgent: true,
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: <Analytics />,
      variant: 'outlined',
      color: 'primary',
      onClick: () => setTabValue(4),
      description: 'Create platform analytics report',
    },
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: <People />,
      variant: 'outlined',
      color: 'primary',
      onClick: () => setTabValue(1),
      description: 'User account management',
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: <Settings />,
      variant: 'outlined',
      color: 'primary',
      onClick: () => setTabValue(5),
      description: 'Platform configuration',
    },
  ];

  if (!user || !isAdminUser(user.userType)) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have administrator privileges to access this dashboard.
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} />

      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Admin Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={2}
          >
            <Typography variant='h3' fontWeight={700} color='#d32f2f'>
              Platform Administrator Dashboard
            </Typography>
            <Box display='flex' alignItems='center' gap={2}>
              <Typography variant='body2' color='text.secondary'>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Typography>
              <Button
                variant='outlined'
                startIcon={<Refresh />}
                onClick={handleRefresh}
                size='small'
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>
          </Box>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            Mission Control Center
          </Typography>
        </Box>

        {/* Alert Hub */}
        <AdminAlertHub
          alerts={mockAlerts}
          loading={loading}
          onRefresh={handleRefresh}
          lastUpdated={lastRefresh}
        />

        {/* KPI Cards Grid */}
        <Box sx={{ mb: 4 }}>
          <AdminKPICards
            kpis={mockKPIs}
            loading={loading}
            onCardClick={handleKPICardClick}
          />
        </Box>

        {/* Navigation Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                minHeight: 64,
              },
            }}
          >
            {tabConfig.map((tab, index) => (
              <Tab
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition='start'
                {...a11yProps(index)}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Mission Control Dashboard */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', lg: 'row' },
            }}
          >
            {/* Main Charts */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant='h6' gutterBottom fontWeight={600}>
                  Gross Merchandise Volume Trend (Last 7 Days)
                </Typography>
                <Box height={300}>
                  <Line
                    data={gmvChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) =>
                              `GMV: $${context.parsed.y.toLocaleString()}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) =>
                              `$${Number(value).toLocaleString()}`,
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </Box>
              </Paper>

              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', md: 'row' },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant='h6' gutterBottom fontWeight={600}>
                      Revenue Breakdown
                    </Typography>
                    <Box height={250}>
                      <Doughnut
                        data={revenueBreakdownData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 20,
                                usePointStyle: true,
                              },
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) =>
                                  `${context.label}: $${context.parsed.toLocaleString()}`,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant='h6' gutterBottom fontWeight={600}>
                      Top Selling Categories
                    </Typography>
                    <Box height={250}>
                      <Bar
                        data={topCategoriesData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: (context) =>
                                  `Sales: $${context.parsed.y.toLocaleString()}`,
                              },
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: (value) =>
                                  `$${Number(value).toLocaleString()}`,
                              },
                              grid: {
                                color: 'rgba(0, 0, 0, 0.1)',
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>

            {/* Sidebar with Quick Actions and Activity */}
            <Box sx={{ width: { lg: 350 }, flexShrink: 0 }}>
              <Box sx={{ mb: 3 }}>
                <AdminQuickActions actions={quickActions} loading={loading} />
              </Box>

              <AdminActivityLog
                activities={mockRecentActivity}
                loading={loading}
                onRefresh={handleRefresh}
                maxItems={8}
              />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* User Management */}
          <Paper sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom fontWeight={600}>
              User Management
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Comprehensive user management features including customer
              accounts, store owner profiles, and administrative role
              assignments.
            </Typography>
            <Alert severity='info' sx={{ mt: 3 }}>
              <AlertTitle>Coming Soon</AlertTitle>
              Advanced user management features are currently in development and
              will be available in the next release.
            </Alert>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Store Management */}
          <Paper sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom fontWeight={600}>
              Store Management
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Complete store lifecycle management including application reviews,
              verification processes, active store monitoring, and suspension
              controls.
            </Typography>
            <Alert severity='info' sx={{ mt: 3 }}>
              <AlertTitle>In Development</AlertTitle>
              Store management features are being actively developed with a
              focus on streamlined approval workflows.
            </Alert>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Financial Hub */}
          <Paper sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom fontWeight={600}>
              Financial Hub
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Centralized financial operations including transaction monitoring,
              commission rate management, referral program configuration, and
              automated payout processing.
            </Typography>
            <Alert severity='info' sx={{ mt: 3 }}>
              <AlertTitle>Priority Development</AlertTitle>
              Financial management tools are our top priority and will include
              real-time transaction tracking and automated reconciliation.
            </Alert>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          {/* Analytics & Reports */}
          <Paper sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom fontWeight={600}>
              Analytics & Reports
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Advanced analytics dashboard with sales performance metrics, user
              acquisition trends, conversion analytics, and comprehensive export
              capabilities for business intelligence.
            </Typography>
            <Alert severity='info' sx={{ mt: 3 }}>
              <AlertTitle>Enhanced Features</AlertTitle>
              Advanced reporting with predictive analytics and custom dashboard
              creation will be available soon.
            </Alert>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          {/* Platform Settings */}
          <Paper sx={{ p: 4 }}>
            <Typography variant='h5' gutterBottom fontWeight={600}>
              Platform Settings
            </Typography>
            <Typography variant='body1' color='text.secondary' paragraph>
              Global platform configuration including site branding, payment
              gateway integration, tax and shipping rules, notification
              templates, and system-wide preferences.
            </Typography>
            <Alert severity='info' sx={{ mt: 3 }}>
              <AlertTitle>Configuration Management</AlertTitle>A comprehensive
              settings panel with role-based access control is under
              development.
            </Alert>
          </Paper>
        </TabPanel>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
