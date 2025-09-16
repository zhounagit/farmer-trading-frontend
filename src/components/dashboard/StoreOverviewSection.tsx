import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Store,
  LocationOn,
  Schedule,
  Payment,
  Palette,
  Edit,
  ArrowForward,
  CheckCircle,
  RadioButtonUnchecked,
  Business,
  Phone,
  Email,
  Inventory,
  ErrorOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStore } from '../../hooks/useUserStore';
import StoreApiService from '../../services/store.api';

import type {
  ComprehensiveStoreData,
  StoreAddress,
  StoreOpenHours,
  StoreImage,
} from '../../services/store.api';
import toast from 'react-hot-toast';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
}

interface StoreOverviewSectionProps {
  onNavigateToBranding?: () => void;
}

const StoreOverviewSection: React.FC<StoreOverviewSectionProps> = ({
  onNavigateToBranding,
}) => {
  // Auth context available if needed
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    primaryStore,
    isLoading: storesLoading,
    error: storesError,
  } = useUserStore();

  const [comprehensiveStoreData, setComprehensiveStoreData] =
    useState<ComprehensiveStoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comprehensive store data when primary store is available
  useEffect(() => {
    const fetchComprehensiveStoreData = async () => {
      if (!primaryStore?.storeId) {
        console.log(
          '🏪 StoreOverview: No primaryStore.storeId, skipping comprehensive data fetch'
        );
        return;
      }

      console.log(
        '🏪 StoreOverview: Fetching comprehensive store data for storeId:',
        primaryStore.storeId
      );
      setIsLoading(true);
      setError(null);

      try {
        const data = await StoreApiService.getComprehensiveStoreDetails(
          primaryStore.storeId
        );
        console.log(
          '✅ StoreOverview: Comprehensive store data loaded successfully'
        );
        setComprehensiveStoreData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load store details';
        console.error(
          '❌ StoreOverview: Failed to load comprehensive store data:',
          errorMessage
        );
        setError(errorMessage);
        toast.error(`Failed to load store details: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComprehensiveStoreData();
  }, [primaryStore?.storeId]);

  // Sync hasStore flag in user context with actual store data
  useEffect(() => {
    if (user && primaryStore && !user.hasStore) {
      console.log(
        '🏪 StoreOverview: Syncing hasStore flag - user has store but flag is false'
      );
      // Update the hasStore flag in context if we found stores but flag is false
      const userData = JSON.parse(
        localStorage.getItem('heartwood_user_data') || '{}'
      );
      if (userData.userId === user.userId) {
        userData.hasStore = true;
        localStorage.setItem('heartwood_user_data', JSON.stringify(userData));
        // Note: We don't call updateStoreStatus here to avoid triggering re-renders
      }
    }
  }, [user, primaryStore]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
      case 'under_review':
        return 'warning';
      case 'rejected':
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Live & Active';
      case 'pending':
        return 'Pending Review';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'suspended':
        return 'Suspended';
      default:
        return 'Draft';
    }
  };

  const formatBusinessHours = (
    openHours: StoreOpenHours[]
  ): { [key: string]: string } => {
    if (!openHours || openHours.length === 0) return {};

    const daysMap = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const formatted: { [key: string]: string } = {};

    openHours.forEach((hour) => {
      const dayName = daysMap[hour.dayOfWeek];
      if (hour.isClosed) {
        formatted[dayName] = 'Closed';
      } else if (hour.openTime && hour.closeTime) {
        formatted[dayName] = `${hour.openTime} - ${hour.closeTime}`;
      }
    });

    return formatted;
  };

  const getPrimaryAddress = (
    addresses: StoreAddress[]
  ): StoreAddress | null => {
    if (!addresses || addresses.length === 0) return null;

    // Priority: business address > pickup address > first address
    const businessAddress = addresses.find(
      (addr) => addr.addressType === 'business'
    );
    const pickupAddress = addresses.find(
      (addr) => addr.addressType === 'pickup'
    );
    const primaryAddress = addresses.find((addr) => addr.isPrimary);

    return businessAddress || pickupAddress || primaryAddress || addresses[0];
  };

  const getImageCounts = (
    images: StoreImage[]
  ): { hasLogo: boolean; hasBanner: boolean; galleryImageCount: number } => {
    if (!images || images.length === 0) {
      return { hasLogo: false, hasBanner: false, galleryImageCount: 0 };
    }

    const activeImages = images.filter((img) => img.isActive);
    const hasLogo = activeImages.some((img) => img.imageType === 'logo');
    const hasBanner = activeImages.some((img) => img.imageType === 'banner');
    const galleryImageCount = activeImages.filter(
      (img) => img.imageType === 'gallery'
    ).length;

    return { hasLogo, hasBanner, galleryImageCount };
  };

  const getSetupSteps = (storeData: ComprehensiveStoreData): SetupStep[] => {
    const primaryAddress = getPrimaryAddress(storeData.addresses);
    const businessHours = formatBusinessHours(storeData.openHours);
    const { hasLogo, hasBanner, galleryImageCount } = getImageCounts(
      storeData.images
    );

    return [
      {
        id: 'basics',
        title: 'Store Basics',
        description: 'Name, description, and categories',
        completed: !!(
          storeData.storeName &&
          storeData.description &&
          storeData.categories?.length
        ),
        route: '/open-shop/basics',
        icon: <Store />,
        priority: 'high',
      },
      {
        id: 'location',
        title: 'Location & Logistics',
        description: 'Address, selling methods, delivery settings',
        completed: !!(primaryAddress && primaryAddress.streetLine),
        route: '/open-shop/location',
        icon: <LocationOn />,
        priority: 'high',
      },
      {
        id: 'policies',
        title: 'Store Policies',
        description: 'Business hours and payment methods',
        completed: !!(
          Object.keys(businessHours).length > 0 &&
          storeData.paymentMethods?.length > 0
        ),
        route: '/open-shop/policies',
        icon: <Schedule />,
        priority: 'high',
      },
      {
        id: 'branding',
        title: 'Branding & Visuals',
        description: 'Logo, banner, and gallery images',
        completed: hasLogo && hasBanner && galleryImageCount > 0,
        route: '/dashboard/branding',
        icon: <Palette />,
        priority: 'medium',
      },
    ];
  };

  const handleStepClick = (step: SetupStep) => {
    if (step.id === 'branding') {
      onNavigateToBranding?.();
    } else {
      navigate(step.route);
    }
  };

  const handleEditStore = () => {
    navigate('/open-shop?edit=true');
  };

  // Debug current state
  const hasStoreData = primaryStore && comprehensiveStoreData;

  // Since Store Overview tab is only shown to store owners, always show loading until we have data
  const shouldShowLoading = storesLoading || isLoading || !hasStoreData;

  console.log('🏪 StoreOverview render state:', {
    storesLoading,
    isLoading,
    hasPrimaryStore: !!primaryStore,
    hasComprehensiveData: !!comprehensiveStoreData,
    storesError,
    error,
    userHasStore: user?.hasStore,
    userType: user?.userType,
    hasStoreData,
    shouldShowLoading,
  });

  // Always show loading until we have complete store data
  if (shouldShowLoading) {
    console.log(
      '🏪 StoreOverview: Showing loading state until complete data available'
    );
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Loading store information...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Error state
  if (storesError || error) {
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Alert severity='error' sx={{ mb: 2 }}>
            <Typography variant='body2'>{storesError || error}</Typography>
          </Alert>
          <Button
            variant='outlined'
            onClick={() => window.location.reload()}
            startIcon={<ErrorOutline />}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  // Note: Removed "no store" message since Store Overview tab is only shown to store owners

  // If we have primaryStore but failed to load comprehensive data, handle gracefully
  if (primaryStore && !comprehensiveStoreData && error) {
    console.log(
      '🏪 StoreOverview: Have primaryStore but comprehensive data failed to load'
    );
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Alert severity='warning' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              Your store "{primaryStore.storeName}" exists but we're having
              trouble loading the details. Please try refreshing the page.
            </Typography>
          </Alert>
          <Button
            variant='outlined'
            onClick={() => window.location.reload()}
            startIcon={<ErrorOutline />}
          >
            Refresh Page
          </Button>
        </Paper>
      </Box>
    );
  }

  // Final safety check - this should not happen due to loading logic above
  if (!comprehensiveStoreData) {
    console.log(
      '🏪 StoreOverview: Final safety check - no comprehensive data, showing loading'
    );
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Loading store details...
          </Typography>
        </Paper>
      </Box>
    );
  }

  const storeData = comprehensiveStoreData;
  const setupSteps = getSetupSteps(storeData);
  const completedSteps = setupSteps.filter((step) => step.completed).length;
  const totalSteps = setupSteps.length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const primaryAddress = getPrimaryAddress(storeData.addresses);
  const businessHours = formatBusinessHours(storeData.openHours);
  const { hasLogo, hasBanner, galleryImageCount } = getImageCounts(
    storeData.images
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant='h5' fontWeight={600}>
          Store Overview
        </Typography>
        <Button
          variant='outlined'
          startIcon={<Edit />}
          onClick={handleEditStore}
          size='small'
        >
          Edit Store
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Store Info Card */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Store Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Business sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant='h6' fontWeight={600}>
                  {storeData.storeName}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {storeData.description || 'No description provided'}
                </Typography>
                <Chip
                  label={getStatusText(storeData.approvalStatus)}
                  color={getStatusColor(storeData.approvalStatus)}
                  size='small'
                />
              </Box>
            </Box>

            {/* Setup Progress */}
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant='body2' fontWeight={600}>
                  Setup Progress
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {completedSteps} of {totalSteps} steps completed (
                  {completionPercentage}%)
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={completionPercentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Store Information Grid */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Location & Contact
                    </Typography>
                    {primaryAddress ? (
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          {primaryAddress.streetLine}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {primaryAddress.city}, {primaryAddress.state}{' '}
                          {primaryAddress.zipCode}
                        </Typography>
                        {primaryAddress.contactPhone && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1 }}
                          >
                            <Phone
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            {primaryAddress.contactPhone}
                          </Typography>
                        )}
                        {storeData.contactEmail && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 0.5 }}
                          >
                            <Email
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            {storeData.contactEmail}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant='body2' color='error.main'>
                        Address not set
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <Inventory
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Products
                    </Typography>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Categories:
                      </Typography>
                      <Stack
                        direction='row'
                        spacing={0.5}
                        sx={{ mt: 0.5 }}
                        flexWrap='wrap'
                      >
                        {storeData.categories &&
                        storeData.categories.length > 0 ? (
                          storeData.categories.map((category, index) => {
                            const categoryName =
                              category?.name || `Category ${index + 1}`;
                            const categoryKey = category?.categoryId || index;

                            return (
                              <Chip
                                key={categoryKey}
                                label={categoryName}
                                size='small'
                                variant='outlined'
                                color='primary'
                              />
                            );
                          })
                        ) : storeData.categories === null ||
                          storeData.categories === undefined ? (
                          <Typography variant='body2' color='text.secondary'>
                            Loading categories...
                          </Typography>
                        ) : (
                          <Typography variant='body2' color='error.main'>
                            No categories set
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <Schedule
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Business Hours
                    </Typography>
                    {Object.keys(businessHours).length > 0 ? (
                      <Box>
                        {Object.entries(businessHours).map(([day, hours]) => (
                          <Box
                            key={day}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant='caption'
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {day}:
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {hours}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant='body2' color='error.main'>
                        Hours not set
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <Payment
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Payment Methods
                    </Typography>
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Accepted Methods:
                      </Typography>
                      <Stack
                        direction='row'
                        spacing={0.5}
                        sx={{ mt: 0.5 }}
                        flexWrap='wrap'
                      >
                        {storeData.paymentMethods?.length > 0 ? (
                          storeData.paymentMethods.map((payment) => (
                            <Chip
                              key={payment.methodId}
                              label={payment.paymentMethod.methodName}
                              size='small'
                              variant='outlined'
                              color='info'
                            />
                          ))
                        ) : (
                          <Typography variant='body2' color='error.main'>
                            No payment methods set
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <LocationOn
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Delivery Options
                    </Typography>
                    {storeData.deliveryRadiusMi ? (
                      <Box>
                        <Typography variant='body2' color='success.main'>
                          Delivery Available
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Radius: {storeData.deliveryRadiusMi} miles
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          No delivery service
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Pickup only
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant='outlined' sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant='body2' fontWeight={600} gutterBottom>
                      <Palette
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Branding
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={hasLogo ? 'Logo ✓' : 'No Logo'}
                        size='small'
                        color={hasLogo ? 'success' : 'default'}
                        variant='outlined'
                      />
                      <Chip
                        label={hasBanner ? 'Banner ✓' : 'No Banner'}
                        size='small'
                        color={hasBanner ? 'success' : 'default'}
                        variant='outlined'
                      />
                      <Chip
                        label={`${galleryImageCount} Images`}
                        size='small'
                        color={galleryImageCount > 0 ? 'success' : 'default'}
                        variant='outlined'
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Setup Steps Card */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              Setup Steps
            </Typography>

            {completedSteps === totalSteps ? (
              <Alert severity='success' sx={{ mb: 2 }}>
                <Typography variant='body2'>
                  🎉 Store setup complete! Ready to submit for approval.
                </Typography>
              </Alert>
            ) : (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Complete the remaining steps to finish your store setup.
              </Typography>
            )}

            <List disablePadding>
              {setupSteps.map((step) => (
                <ListItemButton
                  key={step.id}
                  onClick={() => handleStepClick(step)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: step.completed
                      ? 'success.main'
                      : step.priority === 'high'
                        ? 'warning.main'
                        : 'grey.300',
                    bgcolor: step.completed ? 'success.50' : 'transparent',
                    '&:hover': {
                      bgcolor: step.completed ? 'success.100' : 'grey.50',
                    },
                  }}
                >
                  <ListItemIcon>
                    {step.completed ? (
                      <CheckCircle color='success' />
                    ) : (
                      <RadioButtonUnchecked color='disabled' />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant='body2' fontWeight={600}>
                          {step.title}
                        </Typography>
                        {!step.completed && step.priority === 'high' && (
                          <Chip label='Required' color='warning' size='small' />
                        )}
                      </Box>
                    }
                    secondary={step.description}
                  />
                  <ArrowForward sx={{ color: 'text.secondary' }} />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant='body2' color='text.secondary'>
              <strong>Last updated:</strong>{' '}
              {new Date(storeData.updatedAt).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreOverviewSection;
