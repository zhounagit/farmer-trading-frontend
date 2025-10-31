import React, { useState, useEffect } from 'react';
import OpenShopApiService from '../services/open-shop.api';
import { API_CONFIG } from '@/utils/api';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fab,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Badge,
  Tooltip,
  Paper,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Add,
  Search,
  Store as StoreIcon,
  Edit,
  Inventory,
  Analytics,
  MoreVert,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
  Launch,
  OpenInNew,
  Delete,
  Settings,
  Phone,
  Email,
  LocationOn,
  AccessTime,
  Payment,
  Image as ImageIcon,
  Close,
  Refresh,
  Visibility,
  Public,
  Storefront,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { StoresApiService } from '../services/storesApi';
import type { Store } from '@/shared/types/store';
import type { EnhancedStoreDto } from '../services/open-shop.types';
import toast from 'react-hot-toast';

interface FeaturedProduct {
  itemId: number;
  itemName: string;
  description: string;
  price: number;
  imageUrl?: string;
  unit: string;
  inStock: boolean;
}

const MyStoresPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch comprehensive store data
  const {
    data: storesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myStoresComprehensive', user?.userId],
    queryFn: async () => {
      if (!user?.userId) {
        return [];
      }

      let stores: any[] = [];

      try {
        // Fetching stores for user ID: ${user.userId}
        // Try to fetch stores specifically for the current user
        const storeListResponse = await StoresApiService.getUserStores(
          user.userId
        );
        stores = storeListResponse.stores || [];
      } catch (userStoresError) {
        console.warn(
          'getUserStores failed, falling back to getMyStores:',
          userStoresError
        );
        try {
          // Fallback to the general stores endpoint
          const response = await StoresApiService.getAllStores();
          stores = response.stores || [];
          console.log(`📋 Raw stores data from getAllStores:`, stores);
        } catch (myStoresError) {
          console.error(
            'Both getUserStores and getAllStores failed:',
            myStoresError
          );
          throw myStoresError;
        }
      }

      if (!stores || !Array.isArray(stores)) {
        console.warn('No stores found or invalid response format:', stores);
        return [];
      }

      console.log(
        `📊 Processing ${stores.length} stores for user ${user.userId}`
      );
      stores.forEach((store: any, index: number) => {
        console.log(`Store ${index + 1}:`, {
          storeId: store.store_id || store.storeId,
          storeName: store.store_name || store.storeName,
          ownerId: store.store_creator_id || store.storeCreatorId,
          status: store.approval_status || store.approvalStatus,
        });
      });

      try {
        // Filter stores to ensure they belong to the current user
        const userStores = stores.filter((store: any) => {
          const storeOwnerId =
            store.store_creator_id ||
            store.storeCreatorId ||
            store.store_owner_id;

          console.log(
            `🔍 Store ${store.store_id || store.storeId}: owner=${storeOwnerId}, currentUser=${user.userId}`
          );

          if (storeOwnerId && Number(storeOwnerId) !== Number(user.userId)) {
            console.warn(
              `Store ${store.store_id || store.storeId} does not belong to user ${user.userId}`
            );
            return false;
          }
          return true;
        });

        console.log(
          `✅ Found ${userStores.length} stores for user ${user.userId}`
        );

        const comprehensiveStores = await Promise.all(
          userStores.map(async (store: any) => {
            try {
              const storeId = store.store_id || store.storeId;
              console.log(
                `📋 Fetching comprehensive details for store ${storeId}`
              );

              const comprehensive =
                await OpenShopApiService.getComprehensiveStoreDetails(storeId);

              // Extract approvalStatus from nested status object if it exists
              const approvalStatus =
                comprehensive.approvalStatus ||
                comprehensive.status?.approvalStatus ||
                store.approval_status ||
                store.approvalStatus ||
                'pending';

              console.log(
                `✅ Comprehensive store ${storeId} approvalStatus:`,
                approvalStatus
              );

              // Ensure approvalStatus is always available at the top level
              const enhancedStore = {
                ...comprehensive,
                approvalStatus,
              };

              // Double-check ownership in comprehensive data
              if (
                enhancedStore.storeCreatorId &&
                Number(enhancedStore.storeCreatorId) !== Number(user.userId)
              ) {
                console.warn(
                  `Comprehensive store ${enhancedStore.storeId} ownership mismatch`
                );
                return null;
              }

              return enhancedStore;
            } catch (error) {
              console.error(
                `Failed to fetch comprehensive details for store ${store.storeId || store.store_id}:`,
                error
              );
              // Return basic store data with empty related arrays
              console.log(
                `⚠️ Using fallback approvalStatus for store ${store.store_id || store.storeId}:`,
                store.approval_status || store.approvalStatus || 'pending'
              );
              return {
                storeId: store.store_id || store.storeId,
                storeName:
                  store.store_name || store.storeName || 'Unnamed Store',
                description: store.description || '',
                approvalStatus:
                  store.approval_status || store.approvalStatus || 'pending',
                contactPhone: store.contact_phone || store.contactPhone || '',
                contactEmail: store.contact_email || store.contactEmail || '',
                logoUrl: store.logo_url || store.logoUrl || '',
                bannerUrl: store.banner_url || store.bannerUrl || '',
                slug: store.slug || '',
                createdAt:
                  store.created_at ||
                  store.createdAt ||
                  new Date().toISOString(),
                updatedAt:
                  store.updated_at ||
                  store.updatedAt ||
                  new Date().toISOString(),
                addresses: [],
                images: [],
                openHours: [],
                categories: [],
                storeCreatorId:
                  store.store_creator_id ||
                  store.storeCreatorId ||
                  user?.userId ||
                  0,
              } as EnhancedStoreDto;
            }
          })
        );

        // Filter out null results from ownership validation
        const validStores = comprehensiveStores.filter(
          (store) => store !== null
        );
        console.log(
          `✅ Validated ${validStores.length} comprehensive stores for user ${user.userId}`
        );

        return validStores;
      } catch (error) {
        console.error('Failed to fetch user stores:', error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    retry: 2,
    retryDelay: 1000,
  });

  // Mock featured products for demonstration
  const mockFeaturedProducts: { [storeId: number]: FeaturedProduct[] } = {
    1: [
      {
        itemId: 1,
        itemName: 'Organic Tomatoes',
        description: 'Fresh vine tomatoes',
        price: 4.99,
        unit: 'lb',
        inStock: true,
        imageUrl: 'https://via.placeholder.com/150x150/FF6B6B/white?text=🍅',
      },
      {
        itemId: 2,
        itemName: 'Fresh Lettuce',
        description: 'Crispy green lettuce',
        price: 2.49,
        unit: 'head',
        inStock: true,
        imageUrl: 'https://via.placeholder.com/150x150/4ECDC4/white?text=🥬',
      },
      {
        itemId: 3,
        itemName: 'Carrots',
        description: 'Sweet baby carrots',
        price: 3.99,
        unit: 'bunch',
        inStock: true,
        imageUrl: 'https://via.placeholder.com/150x150/FF8C42/white?text=🥕',
      },
    ],
  };

  // Filter stores based on search and status
  const filteredStores = React.useMemo(() => {
    if (!storesData) return [];

    console.log(`📊 MyStoresPage - ${storesData.length} stores loaded`);

    return storesData.filter((store) => {
      const matchesSearch =
        store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || store.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [storesData, searchQuery, statusFilter]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    store: EnhancedStoreDto
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStore(store);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStore(null);
  };

  const handleImageGalleryOpen = (store: EnhancedStoreDto) => {
    const galleryImages =
      store.images
        ?.filter((img) => img.imageType === 'gallery' && img.isActive)
        ?.map((img) => img.filePath) || [];

    if (store.bannerUrl) galleryImages.unshift(store.bannerUrl);
    if (store.logoUrl) galleryImages.unshift(store.logoUrl);

    setSelectedImages(galleryImages);
    setSelectedImageIndex(0);
    setImageDialogOpen(true);
  };

  const getStatusChip = (status: string) => {
    console.log('🎨 getStatusChip - Raw status value:', {
      status,
      type: typeof status,
      length: status?.length,
    });

    const statusConfig = {
      approved: {
        label: 'Live',
        color: 'success' as const,
        icon: <CheckCircle />,
      },
      pending: {
        label: 'Pending',
        color: 'warning' as const,
        icon: <Schedule />,
      },
      under_review: {
        label: 'Under Review',
        color: 'info' as const,
        icon: <Schedule />,
      },
      rejected: {
        label: 'Rejected',
        color: 'error' as const,
        icon: <ErrorIcon />,
      },
      suspended: {
        label: 'Suspended',
        color: 'error' as const,
        icon: <ErrorIcon />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    console.log('🎨 getStatusChip - Selected config:', {
      requestedStatus: status,
      configFound: status in statusConfig,
      selectedLabel: config.label,
    });

    return (
      <Chip
        label={config.label}
        color={config.color}
        size='small'
        icon={config.icon}
      />
    );
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided';

    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`;
  };

  const getFullImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${API_CONFIG.BASE_URL}${imagePath}`;
    return `${API_CONFIG.BASE_URL}/${imagePath}`;
  };

  const formatOpenHours = (openHours: any) => {
    if (!openHours) return 'Hours not set';

    // Handle nested operations.openHours format (array with dayOfWeek as string or number)
    const hoursArray = Array.isArray(openHours) ? openHours : [];
    if (hoursArray.length === 0) return 'Hours not set';

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIndex = new Date().getDay();
    const todayName = days[todayIndex];

    // Find today's hours by either numeric dayOfWeek or string dayOfWeek
    const today = hoursArray.find(
      (h) => h.dayOfWeek === todayIndex || h.dayOfWeek === todayName
    );

    if (!today) return 'Closed today';
    if (today.isClosed) return 'Closed today';

    // Format hours - handle both HH:MM:SS and HH:MM formats
    const formatTime = (time: string) =>
      time?.split(':').slice(0, 2).join(':') || '';
    return `${formatTime(today.openTime)} - ${formatTime(today.closeTime)}`;
  };

  const getPrimaryAddress = (addresses: any) => {
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0)
      return null;
    return addresses.find((addr) => addr.isPrimary) || addresses[0];
  };

  const StoreCard: React.FC<{ store: EnhancedStoreDto }> = ({ store }) => {
    // Handle both array and object formats for addresses
    const addressesArray = Array.isArray(store.addresses)
      ? store.addresses
      : store.addresses?.pickupLocations || [];
    const primaryAddress = getPrimaryAddress(addressesArray);

    // Use actual product count from comprehensive store if available
    const totalProducts =
      (store as any).totalProducts ||
      mockFeaturedProducts[store.storeId]?.length ||
      0;
    const featuredProducts = mockFeaturedProducts[store.storeId] || [];

    // Extract logoUrl and bannerUrl from nested images object
    const rawLogoUrl = store.logoUrl || (store.images as any)?.logoUrl || '';
    const rawBannerUrl =
      store.bannerUrl || (store.images as any)?.bannerUrl || '';
    const logoUrl = getFullImageUrl(rawLogoUrl);
    const bannerUrl = getFullImageUrl(rawBannerUrl);

    // Handle both array and object formats for images
    const galleryImages =
      store.images && Array.isArray(store.images)
        ? store.images.filter(
            (img) => img.imageType === 'gallery' && img.isActive
          )
        : (store.images as any)?.gallery || [];

    // Extract openHours from nested operations object if available
    const openHours =
      (store as any)?.operations?.openHours || store.openHours || [];

    // Extract actual addresses count (business + pickup locations)
    const addressesCount =
      addressesArray.length + ((store.addresses as any)?.business ? 1 : 0);

    // Extract contact info from nested contactInfo or use top-level fields
    const contactPhone =
      store.contactPhone ||
      (store.addresses as any)?.business?.contactPhone ||
      (store as any)?.contactInfo?.phone ||
      '';
    const contactEmail =
      store.contactEmail ||
      (store.addresses as any)?.business?.contactEmail ||
      (store as any)?.contactInfo?.email ||
      '';

    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[12],
          },
        }}
      >
        {/* Banner Image */}
        {bannerUrl && (
          <CardMedia
            component='img'
            height='200'
            image={bannerUrl}
            alt={store.storeName}
            sx={{
              objectFit: 'cover',
              cursor: 'pointer',
            }}
            onClick={() => handleImageGalleryOpen(store)}
          />
        )}

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Store Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
            <Badge
              overlap='circular'
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                store.approvalStatus === 'approved' ? (
                  <CheckCircle color='success' sx={{ fontSize: 16 }} />
                ) : (
                  <Schedule color='warning' sx={{ fontSize: 16 }} />
                )
              }
            >
              <Avatar
                src={logoUrl}
                sx={{
                  width: 60,
                  height: 60,
                  mr: 2,
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                }}
                onClick={() => handleImageGalleryOpen(store)}
              >
                <StoreIcon />
              </Avatar>
            </Badge>

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant='h6' fontWeight={600} gutterBottom noWrap>
                {store.storeName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {getStatusChip(store.approvalStatus)}
                {store.slug && (
                  <Tooltip title='Store is publicly accessible'>
                    <Chip
                      label='Published'
                      color='info'
                      size='small'
                      icon={<Public />}
                      variant='outlined'
                    />
                  </Tooltip>
                )}
              </Box>
            </Box>

            <IconButton size='small' onClick={(e) => handleMenuClick(e, store)}>
              <MoreVert />
            </IconButton>
          </Box>

          {/* Description */}
          {store.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{ mb: 2, lineHeight: 1.5 }}
            >
              {store.description}
            </Typography>
          )}

          {/* Contact Information */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant='subtitle2' fontWeight={600} gutterBottom>
              Contact Information
            </Typography>
            <Stack spacing={1}>
              {contactPhone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2'>{contactPhone}</Typography>
                </Box>
              )}
              {contactEmail && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant='body2'>{contactEmail}</Typography>
                </Box>
              )}
              {primaryAddress && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn
                    sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }}
                  />
                  <Typography variant='body2' sx={{ lineHeight: 1.3 }}>
                    {formatAddress(primaryAddress)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant='body2'>
                  {formatOpenHours(openHours)}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Store Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={600} color='primary.main'>
                  {galleryImages.length}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Images
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={600} color='info.main'>
                  {addressesCount}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Locations
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6' fontWeight={600} color='success.main'>
                  {totalProducts}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Products
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Gallery Preview */}
          {galleryImages.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
              >
                <ImageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant='subtitle2' fontWeight={600}>
                  Gallery ({galleryImages.length} images)
                </Typography>
                <Button
                  size='small'
                  startIcon={<Visibility />}
                  onClick={() => handleImageGalleryOpen(store)}
                >
                  View All
                </Button>
              </Box>
              <ImageList cols={3} rowHeight={80} sx={{ m: 0 }}>
                {galleryImages.slice(0, 3).map((image, index) => (
                  <ImageListItem
                    key={index}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleImageGalleryOpen(store)}
                  >
                    <img
                      src={image.filePath}
                      alt={`Gallery ${index + 1}`}
                      loading='lazy'
                      style={{ borderRadius: 4 }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                Featured Products
              </Typography>
              <Grid container spacing={1}>
                {featuredProducts.slice(0, 3).map((product) => (
                  <Grid item xs={4} key={product.itemId}>
                    <Card variant='outlined' sx={{ p: 1, textAlign: 'center' }}>
                      {product.imageUrl && (
                        <Box
                          component='img'
                          src={product.imageUrl}
                          sx={{
                            width: '100%',
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        />
                      )}
                      <Typography variant='caption' fontWeight={500} noWrap>
                        {product.itemName}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='primary.main'
                        display='block'
                      >
                        ${product.price}/{product.unit}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Action Buttons */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant='outlined'
                size='small'
                fullWidth
                startIcon={<Edit />}
                onClick={() =>
                  navigate(`/open-shop?edit=true&storeId=${store.storeId}`)
                }
              >
                Edit Store
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant='outlined'
                size='small'
                fullWidth
                startIcon={<Inventory />}
                onClick={() => navigate(`/inventory/${store.storeId}`)}
              >
                Products
              </Button>
            </Grid>

            <Grid item xs={6}>
              <Button
                variant='outlined'
                size='small'
                fullWidth
                startIcon={<Analytics />}
                onClick={() => navigate(`/stores/${store.storeId}/customize`)}
              >
                Customize
              </Button>
            </Grid>

            {/* Visit Published Store Button */}
            {store.slug && (
              <Grid item xs={12}>
                <Button
                  variant='contained'
                  size='small'
                  fullWidth
                  startIcon={<OpenInNew />}
                  onClick={() => window.open(`/store/${store.slug}`, '_blank')}
                  sx={{
                    mt: 1,
                    backgroundColor: 'success.main',
                    '&:hover': { backgroundColor: 'success.dark' },
                  }}
                >
                  Visit Published Store
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((n) => (
        <Grid item xs={12} sm={6} lg={4} xl={3} key={n}>
          <Card sx={{ height: 600 }}>
            <Skeleton variant='rectangular' height={200} />
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton
                  variant='circular'
                  width={60}
                  height={60}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant='text' width='80%' height={24} />
                  <Skeleton variant='text' width='60%' height={20} />
                </Box>
              </Box>
              <Skeleton variant='text' height={60} sx={{ mb: 2 }} />
              <Skeleton variant='rectangular' height={100} sx={{ mb: 2 }} />
              <Skeleton variant='rectangular' height={60} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
      <Storefront sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant='h5' gutterBottom color='text.secondary'>
        {searchQuery || statusFilter !== 'all'
          ? 'No stores found'
          : 'No stores yet'}
      </Typography>
      <Typography variant='body1' color='text.secondary' paragraph>
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search filters'
          : 'Create your first store to start selling your products online'}
      </Typography>
      {!searchQuery && statusFilter === 'all' && (
        <Button
          variant='contained'
          size='large'
          startIcon={<Add />}
          onClick={() => navigate('/stores/create')}
          sx={{ mt: 2 }}
        >
          Create Your First Store
        </Button>
      )}
    </Box>
  );

  if (!user) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Alert severity='warning'>Please log in to view your stores</Alert>
        </Container>
      </>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Header onLoginClick={() => navigate('/login')} />

      <Container maxWidth='xl' sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant='h3' fontWeight={700} gutterBottom>
            My Stores
          </Typography>
          <Typography variant='h6' color='text.secondary' fontWeight={400}>
            Manage your stores and track their performance
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Paper
          sx={{
            p: 3,
            mb: 4,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          <TextField
            placeholder='Search stores...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 250 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label='Status'
            >
              <MenuItem value='all'>All Stores</MenuItem>
              <MenuItem value='approved'>Approved</MenuItem>
              <MenuItem value='pending'>Pending</MenuItem>
              <MenuItem value='under_review'>Under Review</MenuItem>
              <MenuItem value='rejected'>Rejected</MenuItem>
              <MenuItem value='suspended'>Suspended</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title='Refresh data'>
            <IconButton onClick={() => refetch()} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}
          >
            <Typography variant='body2' color='text.secondary'>
              {filteredStores.length} store
              {filteredStores.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Paper>

        {/* Error State */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            Failed to load stores. Please try again.
            <Button size='small' onClick={() => refetch()} sx={{ ml: 2 }}>
              Retry
            </Button>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Store Grid */}
        {!isLoading && !error && (
          <>
            {filteredStores.length === 0 ? (
              <EmptyState />
            ) : (
              <Grid container spacing={3}>
                {filteredStores.map((store) => (
                  <Grid item xs={12} sm={6} lg={4} xl={3} key={store.storeId}>
                    <StoreCard store={store} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Floating Action Button */}
        <Fab
          color='primary'
          aria-label='add store'
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
          onClick={() => navigate('/stores/create')}
        >
          <Add />
        </Fab>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              navigate(
                `/open-shop?edit=true&storeId=${selectedStore?.storeId}`
              );
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <Edit fontSize='small' />
            </ListItemIcon>
            <ListItemText>Edit Store</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate(`/inventory/${selectedStore?.storeId}`);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <Inventory fontSize='small' />
            </ListItemIcon>
            <ListItemText>Manage Products</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              navigate(`/stores/${selectedStore?.storeId}/customize`);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <Analytics fontSize='small' />
            </ListItemIcon>
            <ListItemText>Customize Storefront</ListItemText>
          </MenuItem>

          {/* Visit Published Store Menu Item */}
          {selectedStore?.slug && (
            <MenuItem
              onClick={() => {
                window.open(`/store/${selectedStore.slug}`, '_blank');
                handleMenuClose();
              }}
            >
              <ListItemIcon>
                <OpenInNew fontSize='small' />
              </ListItemIcon>
              <ListItemText>Visit Published Store</ListItemText>
            </MenuItem>
          )}

          <Divider />

          <MenuItem
            onClick={() => {
              // Handle delete
              handleMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText>Delete Store</ListItemText>
          </MenuItem>
        </Menu>

        {/* Image Gallery Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            Store Images
            <IconButton onClick={() => setImageDialogOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedImages.length > 0 && (
              <Box>
                <Box
                  component='img'
                  src={selectedImages[selectedImageIndex]}
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'contain',
                    borderRadius: 2,
                    mb: 2,
                  }}
                />
                <ImageList cols={4} rowHeight={100}>
                  {selectedImages.map((image, index) => (
                    <ImageListItem
                      key={index}
                      sx={{
                        cursor: 'pointer',
                        border: index === selectedImageIndex ? 2 : 0,
                        borderColor: 'primary.main',
                        borderRadius: 1,
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Gallery ${index + 1}`}
                        loading='lazy'
                        style={{ borderRadius: 4 }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MyStoresPage;
