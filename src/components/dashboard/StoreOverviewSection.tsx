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
  Business,
  ErrorOutline,
  Preview,
  LocalPhone,
  Inventory,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserStore } from '../../hooks/useUserStore';
import StoreApiService from '../../services/store.api';
import { STORAGE_KEYS } from '../../utils/api';

import type {
  ComprehensiveStoreData,
  StoreAddress,
  StoreOpenHours,
  StoreImage,
} from '../../services/store.api';
import PartnershipSection from './PartnershipSection';
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
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const data = await StoreApiService.getComprehensiveStoreDetails(
          primaryStore.storeId
        );
        setComprehensiveStoreData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load store details';
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
      // Update the hasStore flag in context if we found stores but flag is false
      const userData = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.USER_DATA) || '{}'
      );
      if (userData.userId === user.userId) {
        userData.hasStore = true;
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        // Note: AuthContext will pick up this change on next refresh
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
  ): { day: string; hours: string }[] => {
    if (!openHours || openHours.length === 0) return [];

    const daysMap = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    // Create a map of day index to hours
    const dayHours: { [key: number]: string } = {};

    openHours.forEach((hour) => {
      if (hour.isClosed) {
        dayHours[hour.dayOfWeek] = 'Closed';
      } else if (hour.openTime && hour.closeTime) {
        dayHours[hour.dayOfWeek] = `${hour.openTime} - ${hour.closeTime}`;
      }
    });

    // Group consecutive days with same hours
    const consolidated: { day: string; hours: string }[] = [];
    let i = 0;

    while (i < 7) {
      if (dayHours[i] === undefined) {
        i++;
        continue;
      }

      const currentHours = dayHours[i];
      let endDay = i;

      // Find consecutive days with same hours
      while (endDay + 1 < 7 && dayHours[endDay + 1] === currentHours) {
        endDay++;
      }

      // Format the day range
      let dayRange: string;
      if (i === endDay) {
        // Single day
        dayRange = daysMap[i];
      } else if (endDay - i === 1) {
        // Two consecutive days
        dayRange = `${daysMap[i]} - ${daysMap[endDay]}`;
      } else {
        // Multiple consecutive days
        dayRange = `${daysMap[i]} - ${daysMap[endDay]}`;
      }

      consolidated.push({ day: dayRange, hours: currentHours });
      i = endDay + 1;
    }

    return consolidated;
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
        completed: !!(primaryAddress && primaryAddress.streetAddress),
        route: '/open-shop/location',
        icon: <LocationOn />,
        priority: 'high',
      },
      {
        id: 'policies',
        title: 'Store Policies',
        description: 'Business hours and payment methods',
        completed: !!(
          businessHours.length > 0 && storeData.paymentMethods?.length > 0
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

  // const handleStepClick = (step: SetupStep) => {
  //   if (step.id === 'branding') {
  //     onNavigateToBranding?.();
  //   } else {
  //     navigate(step.route);
  //   }
  // };

  const handleEditStore = () => {
    if (primaryStore?.storeId) {
      navigate(`/open-shop?edit=true&storeId=${primaryStore.storeId}`);
    } else {
      navigate('/open-shop?edit=true');
    }
  };

  const handlePreviewStore = () => {
    navigate(`/stores/${primaryStore?.storeId}/customize`);
  };

  const handleManageProducts = () => {
    if (!primaryStore?.storeId || primaryStore.storeId === 0) {
      alert('Unable to navigate to products: Invalid store ID');
      return;
    }

    navigate(`/inventory?storeId=${primaryStore.storeId}`);
  };

  const hasStoreData = primaryStore && comprehensiveStoreData;

  // Since Store Overview tab is only shown to store owners, always show loading until we have data
  const shouldShowLoading = storesLoading || isLoading || !hasStoreData;

  // Always show loading until we have complete store data
  if (shouldShowLoading) {
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
  // const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            startIcon={<Preview />}
            onClick={handlePreviewStore}
            size='small'
            color='primary'
            title='Preview and customize your storefront appearance'
          >
            Preview & Customize Store
          </Button>
          <Button
            variant='outlined'
            startIcon={<Edit />}
            onClick={handleEditStore}
            size='small'
          >
            Edit Store
          </Button>
          <Button
            variant='outlined'
            startIcon={<Inventory />}
            onClick={handleManageProducts}
            size='small'
            color='secondary'
            disabled={!primaryStore?.storeId || primaryStore.storeId === 0}
            title='Add products, upload images, manage inventory'
          >
            Manage Products
          </Button>
        </Box>

        {/* Workflow Guidance */}
        <Alert severity='info' sx={{ mt: 2, mb: 2 }}>
          <Typography variant='body2' fontWeight={600} gutterBottom>
            Quick Start Guide:
          </Typography>
          <Typography variant='body2' component='div'>
            1. <strong>Manage Products</strong> - Add inventory items, upload
            images, set prices
            <br />
            2. <strong>Preview & Customize Store</strong> - See how your store
            looks with real products
          </Typography>
        </Alert>
      </Box>

      <Grid container spacing={3}>
        {/* Partnership Section as Priority Item */}
        {(storeData.isProducer ||
          storeData.isProcessor ||
          storeData.canProduce ||
          storeData.canProcess ||
          storeData.storeType === 'producer' ||
          storeData.storeType === 'processor' ||
          storeData.storeType === 'hybrid') && (
          <Grid size={{ xs: 12 }}>
            <PartnershipSection
              storeId={storeData.storeId}
              storeName={storeData.storeName}
              storeType={storeData.storeType || 'independent'}
              canProduce={storeData.canProduce || false}
              canProcess={storeData.canProcess || false}
              partnershipRadiusMi={storeData.partnershipRadiusMi || 50}
            />
          </Grid>
        )}
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
                          {primaryAddress.streetAddress}
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
                            <LocalPhone
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
                    {businessHours.length > 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {businessHours.map(({ day, hours }, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr auto',
                              gap: 2,
                              p: '8px 12px',
                              bgcolor:
                                index % 2 === 0 ? 'grey.50' : 'transparent',
                              borderRadius: '6px',
                              alignItems: 'center',
                              minHeight: '36px',
                            }}
                          >
                            <Typography
                              variant='body2'
                              fontWeight={500}
                              sx={{
                                fontSize: '0.875rem',
                                color: 'text.primary',
                              }}
                            >
                              {day}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{
                                fontSize: '0.875rem',
                                color:
                                  hours === 'Closed'
                                    ? 'error.main'
                                    : 'text.secondary',
                                fontWeight: hours === 'Closed' ? 500 : 400,
                                textAlign: 'right',
                              }}
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
      </Grid>
    </Box>
  );
};

export default StoreOverviewSection;
