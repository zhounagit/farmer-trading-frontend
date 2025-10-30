import React, { useState, useEffect } from 'react';
import OpenShopApiService from '@/features/stores/services/open-shop.api';
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
  LocationOn,
  Schedule,
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
import { useAuth } from '@/contexts/AuthContext';

import { useUserStore } from '@/hooks/useUserStore';
import { STORAGE_KEYS } from '@/utils/api';
import type {
  StoreCategory,
  EnhancedStoreDto,
} from '@/features/stores/services/open-shop.types';

import PartnershipSection from '../PartnershipSection';
import toast from 'react-hot-toast';

// SetupStep interface removed as it's unused

// StoreOverviewSectionProps interface removed as it was empty

const StoreOverviewSection: React.FC = () => {
  // Auth context available if needed
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    primaryStore,
    isLoading: storesLoading,
    error: storesError,
  } = useUserStore();

  const [comprehensiveStoreData, setComprehensiveStoreData] =
    useState<EnhancedStoreDto | null>(null);
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
        const data = await OpenShopApiService.getComprehensiveStoreDetails(
          primaryStore.storeId
        );
        console.log(
          '✅ StoreOverviewSection: Comprehensive store data received:',
          data
        );
        console.log('✅ StoreOverviewSection: Contact info:', data.contactInfo);
        console.log('✅ StoreOverviewSection: Addresses:', data.addresses);
        console.log('✅ StoreOverviewSection: Images:', data.images);
        console.log('✅ StoreOverviewSection: Status:', data.status);
        console.log(
          '✅ StoreOverviewSection: Full data structure:',
          JSON.stringify(data, null, 2)
        );
        setComprehensiveStoreData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load store details';
        console.error(
          '❌ StoreOverviewSection: Failed to fetch comprehensive store data:',
          err
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
      case 'submitted':
      case 'under_review':
        return 'warning';
      case 'rejected':
      case 'suspended':
        return 'error';
      case 'needs_revision':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Live & Active';
      case 'pending':
        return 'Pending Review';
      case 'submitted':
        return 'Submitted for Review';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'needs_revision':
        return 'Needs Revision';
      case 'suspended':
        return 'Suspension';
      default:
        return 'Setup In Progress';
    }
  };

  const formatBusinessHours = (
    openHours: Array<{
      dayOfWeek: string;
      openTime?: string;
      closeTime?: string;
      isClosed: boolean;
      formattedHours?: string;
    }>
  ): { day: string; hours: string }[] => {
    if (!openHours || openHours.length === 0) return [];

    // Create a map of day name to hours
    const dayHours: { [key: string]: string } = {};

    openHours.forEach((hour) => {
      if (hour.isClosed) {
        dayHours[hour.dayOfWeek] = 'Closed';
      } else if (hour.openTime && hour.closeTime) {
        // Format time to remove seconds if present
        const formatTime = (time: string) => {
          if (time.includes(':')) {
            const parts = time.split(':');
            return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
          }
          return time;
        };
        dayHours[hour.dayOfWeek] =
          `${formatTime(hour.openTime)} - ${formatTime(hour.closeTime)}`;
      } else if (hour.formattedHours) {
        dayHours[hour.dayOfWeek] = hour.formattedHours;
      } else {
        dayHours[hour.dayOfWeek] = 'Hours not specified';
      }
    });

    // Define the order of days with numeric indices for grouping
    const dayOrder = [
      { key: 'sunday', name: 'Sunday', index: 0 },
      { key: 'monday', name: 'Monday', index: 1 },
      { key: 'tuesday', name: 'Tuesday', index: 2 },
      { key: 'wednesday', name: 'Wednesday', index: 3 },
      { key: 'thursday', name: 'Thursday', index: 4 },
      { key: 'friday', name: 'Friday', index: 5 },
      { key: 'saturday', name: 'Saturday', index: 6 },
    ];

    // Group consecutive days with same hours
    const result: { day: string; hours: string }[] = [];
    let i = 0;

    while (i < dayOrder.length) {
      const currentDay = dayOrder[i];
      const currentHours =
        dayHours[currentDay.key] || dayHours[currentDay.name.toLowerCase()];

      if (!currentHours) {
        i++;
        continue;
      }

      let endIndex = i;

      // Find consecutive days with same hours
      for (let j = i + 1; j < dayOrder.length; j++) {
        const nextDay = dayOrder[j];
        const nextHours =
          dayHours[nextDay.key] || dayHours[nextDay.name.toLowerCase()];
        if (nextHours === currentHours) {
          endIndex = j;
        } else {
          break;
        }
      }

      // Format the day range
      let dayRange: string;
      if (i === endIndex) {
        // Single day
        dayRange = dayOrder[i].name;
      } else if (endIndex - i === 1) {
        // Two consecutive days
        dayRange = `${dayOrder[i].name} - ${dayOrder[endIndex].name}`;
      } else {
        // Multiple consecutive days
        dayRange = `${dayOrder[i].name} - ${dayOrder[endIndex].name}`;
      }

      result.push({ day: dayRange, hours: currentHours });
      i = endIndex + 1;
    }

    return result;
  };

  const getImageCounts = (images: {
    logoUrl?: string;
    bannerUrl?: string;
    gallery: Array<{
      imageId: number;
      filePath: string;
      imageType: string;
      caption?: string;
      displayOrder: number;
      uploadedAt: string;
    }>;
  }): { hasLogo: boolean; hasBanner: boolean; galleryImageCount: number } => {
    if (!images) {
      return { hasLogo: false, hasBanner: false, galleryImageCount: 0 };
    }

    const hasLogo = !!images.logoUrl;
    const hasBanner = !!images.bannerUrl;
    const galleryImageCount = images.gallery ? images.gallery.length : 0;

    return { hasLogo, hasBanner, galleryImageCount };
  };

  // const handleStepClick = (step: SetupStep) => {
  //   if (step.id === 'branding') {
  //     onNavigateToBranding?.();
  //   } else {
  //     navigate(step.route);
  //   }
  // };

  const handleEditStore = () => {
    const storeId = getStoreId();
    if (storeId) {
      navigate(`/open-shop?edit=true&storeId=${storeId}`);
    } else {
      navigate('/open-shop');
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

    // Navigate to inventory page for the current store
    navigate(`/inventory/${primaryStore.storeId}`);
  };

  // Helper functions for safe data access
  const getStoreId = (): number => {
    if (comprehensiveStoreData?.storeId) return comprehensiveStoreData.storeId;
    if (primaryStore?.storeId) return primaryStore.storeId;
    return 0;
  };

  const getStoreName = (): string => {
    if (comprehensiveStoreData?.storeName)
      return comprehensiveStoreData.storeName;
    if (primaryStore?.storeName) return primaryStore.storeName;
    return 'Your Store';
  };

  const getStoreDescription = (): string => {
    if (comprehensiveStoreData?.description)
      return comprehensiveStoreData.description;
    if (primaryStore?.description) return primaryStore.description;
    return 'No description provided';
  };

  const getApprovalStatus = (): string => {
    // First check if there's submission status in comprehensive data
    if (comprehensiveStoreData?.submissionStatus) {
      return comprehensiveStoreData.submissionStatus;
    }
    // Then check approval status
    if (comprehensiveStoreData?.status?.approvalStatus) {
      return comprehensiveStoreData.status.approvalStatus;
    }
    // Fallback to primary store approval status
    return primaryStore?.approvalStatus || 'pending';
  };

  // Show loading while fetching store data or waiting for primary store
  const shouldShowLoading = storesLoading || isLoading;

  // Show loading while data is being fetched or if primary store hasn't loaded yet
  if (shouldShowLoading || !primaryStore) {
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

  // If no store data is available after loading completed
  if (!comprehensiveStoreData) {
    return (
      <Box>
        <Typography variant='h5' fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Alert severity='info'>
            No store information available. Please complete your store setup.
          </Alert>
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
              Your store "{primaryStore.storeName}" submission is being
              processed. We're having trouble loading the latest status. Please
              try refreshing the page.
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

  // Use primaryStore as main data source, comprehensiveStoreData as enhanced data

  const businessAddress = comprehensiveStoreData?.addresses?.business || null;
  const businessHours = comprehensiveStoreData
    ? formatBusinessHours(comprehensiveStoreData.operations?.openHours || [])
    : [];

  const { hasLogo, hasBanner, galleryImageCount } = comprehensiveStoreData
    ? getImageCounts(
        comprehensiveStoreData.images || {
          logoUrl: undefined,
          bannerUrl: undefined,
          gallery: [],
        }
      )
    : { hasLogo: false, hasBanner: false, galleryImageCount: 0 };

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
        {/* Partnership Section - Only show for producer or processor stores */}
        {(comprehensiveStoreData?.storeType === 'producer' ||
          comprehensiveStoreData?.storeType === 'processor') && (
          <Grid size={{ xs: 12 }}>
            <PartnershipSection
              storeId={getStoreId()}
              storeName={getStoreName()}
              storeType={comprehensiveStoreData?.storeType || 'independent'}
              canProduce={comprehensiveStoreData?.canProduce || false}
              canProcess={comprehensiveStoreData?.canProcess || false}
              partnershipRadiusMi={
                comprehensiveStoreData?.partnershipRadiusMi || 50
              }
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
                  {getStoreName()}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  {getStoreDescription()}
                </Typography>
                <Chip
                  label={getStatusText(getApprovalStatus())}
                  color={getStatusColor(getApprovalStatus())}
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
                      Business Location & Contact
                    </Typography>
                    {businessAddress ? (
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          {businessAddress.streetAddress}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {businessAddress.city}, {businessAddress.state}{' '}
                          {businessAddress.zipCode}
                        </Typography>
                        {comprehensiveStoreData?.contactInfo?.phone &&
                          comprehensiveStoreData.contactInfo.phone.trim() !==
                            '' && (
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
                              {comprehensiveStoreData.contactInfo.phone}
                            </Typography>
                          )}
                        {(!comprehensiveStoreData?.contactInfo?.phone ||
                          comprehensiveStoreData.contactInfo.phone.trim() ===
                            '') && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            <LocalPhone
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            Phone number not set
                          </Typography>
                        )}
                        {!comprehensiveStoreData?.contactInfo?.phone && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 1, fontStyle: 'italic' }}
                          >
                            <LocalPhone
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            Phone number not set
                          </Typography>
                        )}
                        {comprehensiveStoreData?.contactInfo?.email &&
                          comprehensiveStoreData.contactInfo.email.trim() !==
                            '' && (
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
                              {comprehensiveStoreData.contactInfo.email}
                            </Typography>
                          )}
                        {(!comprehensiveStoreData?.contactInfo?.email ||
                          comprehensiveStoreData.contactInfo.email.trim() ===
                            '') && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 0.5, fontStyle: 'italic' }}
                          >
                            <Email
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            Email not set
                          </Typography>
                        )}
                        {!comprehensiveStoreData?.contactInfo?.email && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mt: 0.5, fontStyle: 'italic' }}
                          >
                            <Email
                              sx={{
                                fontSize: 14,
                                mr: 0.5,
                                verticalAlign: 'middle',
                              }}
                            />
                            Email not set
                          </Typography>
                        )}
                        {businessAddress?.pickupInstructions && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              {businessAddress?.pickupInstructions}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant='body2' color='text.secondary'>
                          No business address information available
                        </Typography>
                        <Button
                          variant='outlined'
                          size='small'
                          sx={{ mt: 1 }}
                          onClick={() => navigate('/dashboard/store-setup')}
                        >
                          Add Business Address
                        </Button>
                      </Box>
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
                        {comprehensiveStoreData?.categories &&
                        comprehensiveStoreData?.categories &&
                        Array.isArray(comprehensiveStoreData?.categories) &&
                        comprehensiveStoreData?.categories.length > 0 ? (
                          comprehensiveStoreData?.categories.map(
                            (category: StoreCategory, index: number) => {
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
                            }
                          )
                        ) : comprehensiveStoreData?.categories === null ||
                          comprehensiveStoreData?.categories === undefined ? (
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
                        {businessHours &&
                          Array.isArray(businessHours) &&
                          businessHours.map(({ day, hours }, index) => (
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
                      <Typography variant='body2' color='text.secondary'>
                        No business hours set
                      </Typography>
                    )}
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
                    {comprehensiveStoreData?.operations?.deliveryRadiusMiles ? (
                      <Box>
                        <Typography variant='body2' color='success.main'>
                          Delivery Available
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          Radius:{' '}
                          {
                            comprehensiveStoreData?.operations
                              ?.deliveryRadiusMiles
                          }{' '}
                          miles
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
