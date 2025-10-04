import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Stack,
  Divider,
  Collapse,
  Tooltip,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Analytics,
  Inventory,
  Store,
  Launch,
  Settings,
  Palette,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Pending,
  Cancel,
  Warning,
  Public,
  PublicOff,
  LocalShipping,
  Storefront,
  Payment,
  Schedule,
  LocationOn,
  Phone,
  Email,
  TrendingUp,
  TrendingDown,
  Star,
  ShoppingCart,
  AttachMoney,
  RemoveRedEye,
} from '@mui/icons-material';

interface EnhancedStoreCardProps {
  store: any; // Using any for flexibility with the data structure
  viewMode: 'card' | 'list' | 'detailed';
  onEdit: () => void;
  onDelete: () => void;
  onViewAnalytics: () => void;
  onManageProducts: () => void;
  onCustomizeStorefront: () => void;
  onPreviewStore: () => void;
}

const EnhancedStoreCard: React.FC<EnhancedStoreCardProps> = ({
  store,
  viewMode = 'card',
  onEdit,
  onDelete,
  onViewAnalytics,
  onManageProducts,
  onCustomizeStorefront,
  onPreviewStore,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Helper functions
  const getApprovalStatusChip = () => {
    const status =
      store.status?.approvalStatus || store.approvalStatus || 'pending';
    const statusConfig = {
      pending: {
        label: 'Pending Review',
        color: 'warning' as const,
        icon: <Pending />,
      },
      approved: {
        label: 'Approved',
        color: 'success' as const,
        icon: <CheckCircle />,
      },
      rejected: {
        label: 'Rejected',
        color: 'error' as const,
        icon: <Cancel />,
      },
      suspended: {
        label: 'Suspended',
        color: 'error' as const,
        icon: <Warning />,
      },
      under_review: {
        label: 'Under Review',
        color: 'info' as const,
        icon: <Pending />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Chip
        size='small'
        label={config.label}
        color={config.color}
        icon={config.icon}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const getStorefrontStatusBadge = () => {
    const isPublished = store.storefront?.isPublished || false;

    return isPublished ? (
      <Chip
        size='small'
        label='Live'
        color='success'
        icon={<Public />}
        sx={{ ml: 1 }}
      />
    ) : (
      <Chip
        size='small'
        label='Draft'
        color='default'
        icon={<PublicOff />}
        sx={{ ml: 1 }}
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderTrendIndicator = (trend: number | undefined) => {
    if (!trend || trend === 0) return null;

    return trend > 0 ? (
      <Stack
        direction='row'
        spacing={0.5}
        alignItems='center'
        sx={{ color: 'success.main' }}
      >
        <TrendingUp fontSize='small' />
        <Typography variant='caption'>+{trend.toFixed(1)}%</Typography>
      </Stack>
    ) : (
      <Stack
        direction='row'
        spacing={0.5}
        alignItems='center'
        sx={{ color: 'error.main' }}
      >
        <TrendingDown fontSize='small' />
        <Typography variant='caption'>{trend.toFixed(1)}%</Typography>
      </Stack>
    );
  };

  const renderMetricsBar = () => {
    const metrics = store.metrics || {};

    return (
      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Stack spacing={0.5}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Inventory fontSize='small' color='action' />
                <Typography variant='h6' fontWeight='600'>
                  {store.totalProducts || 0}
                </Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Products
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={0.5}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <RemoveRedEye fontSize='small' color='action' />
                <Typography variant='h6' fontWeight='600'>
                  {formatNumber(metrics.totalViews || 0)}
                </Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Views
              </Typography>
              {metrics.trends &&
                renderTrendIndicator(metrics.trends.viewsTrend)}
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={0.5}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Star fontSize='small' color='action' />
                <Typography variant='h6' fontWeight='600'>
                  {(metrics.averageRating || 0).toFixed(1)}
                </Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Rating ({metrics.reviewCount || 0})
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack spacing={0.5}>
              <Stack direction='row' spacing={1} alignItems='center'>
                <AttachMoney fontSize='small' color='action' />
                <Typography variant='h6' fontWeight='600'>
                  {formatNumber(metrics.monthlyRevenue || 0)}
                </Typography>
              </Stack>
              <Typography variant='caption' color='text.secondary'>
                Monthly Revenue
              </Typography>
              {metrics.trends &&
                renderTrendIndicator(metrics.trends.revenueTrend)}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderFeaturedProducts = () => {
    const products = store.featuredProducts || [];

    if (products.length === 0) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant='subtitle2' fontWeight='600' gutterBottom>
          Featured Products
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            width: '100%',
            '& > div': {
              flex: '1 1 calc(25% - 8px)',
              minWidth: '120px',
              maxWidth: '200px',
            },
          }}
        >
          {products.slice(0, 4).map((product: any) => (
            <Box key={product.itemId}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                {product.imageUrl && (
                  <CardMedia
                    component='img'
                    height='80'
                    image={product.imageUrl}
                    alt={product.itemName}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ p: 1 }}>
                  <Typography variant='caption' noWrap>
                    {product.itemName}
                  </Typography>
                  <Typography variant='subtitle2' fontWeight='600'>
                    {formatCurrency(product.price)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderOperationsInfo = () => {
    const operations = store.operations || {};

    return (
      <Stack spacing={1} sx={{ mt: 2 }}>
        {store.addresses?.business && (
          <Stack direction='row' spacing={1} alignItems='center'>
            <LocationOn fontSize='small' color='action' />
            <Typography variant='body2'>
              {store.addresses.business.city}, {store.addresses.business.state}
            </Typography>
          </Stack>
        )}

        {operations.supportsDelivery && (
          <Stack direction='row' spacing={1} alignItems='center'>
            <LocalShipping fontSize='small' color='action' />
            <Typography variant='body2'>
              Delivery: {operations.deliveryRadiusMiles} miles
            </Typography>
          </Stack>
        )}

        {store.paymentMethods && store.paymentMethods.length > 0 && (
          <Stack direction='row' spacing={1} alignItems='center'>
            <Payment fontSize='small' color='action' />
            <Typography variant='body2'>
              {store.paymentMethods.map((pm: any) => pm.methodName).join(', ')}
            </Typography>
          </Stack>
        )}

        {operations.openHours && operations.isOpenNow !== undefined && (
          <Stack direction='row' spacing={1} alignItems='center'>
            <Schedule fontSize='small' color='action' />
            <Typography variant='body2'>
              {operations.isOpenNow ? 'Open Now' : 'Closed'}
              {operations.nextOpenTime && ` • Opens ${operations.nextOpenTime}`}
            </Typography>
          </Stack>
        )}
      </Stack>
    );
  };

  // Render based on view mode
  if (viewMode === 'list') {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={12} md={3}>
              <Stack direction='row' spacing={2} alignItems='center'>
                <Avatar
                  src={store.images?.logoUrl || store.logoUrl}
                  sx={{ width: 60, height: 60 }}
                >
                  <Store />
                </Avatar>
                <Box>
                  <Typography variant='h6' fontWeight='600'>
                    {store.storeName}
                  </Typography>
                  <Stack direction='row' spacing={1}>
                    {getApprovalStatusChip()}
                    {getStorefrontStatusBadge()}
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              {store.metrics && (
                <Stack direction='row' spacing={3}>
                  <Box>
                    <Typography variant='h6'>
                      {formatNumber(store.metrics.totalOrders || 0)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Orders
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='h6'>
                      {formatCurrency(store.metrics.monthlyRevenue || 0)}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Revenue/mo
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='h6'>
                      {(store.metrics.averageRating || 0).toFixed(1)} ⭐
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Rating
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack direction='row' spacing={1} justifyContent='flex-end'>
                <Button size='small' startIcon={<Edit />} onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  size='small'
                  startIcon={<Analytics />}
                  onClick={onViewAnalytics}
                >
                  Analytics
                </Button>
                <Button
                  size='small'
                  startIcon={<Inventory />}
                  onClick={onManageProducts}
                >
                  Products
                </Button>
                <Button
                  size='small'
                  startIcon={<Launch />}
                  onClick={onPreviewStore}
                >
                  Preview
                </Button>
                <IconButton size='small' onClick={handleMenuOpen}>
                  <MoreVert />
                </IconButton>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onCustomizeStorefront();
            }}
          >
            <Palette fontSize='small' sx={{ mr: 1 }} /> Customize Storefront
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete fontSize='small' sx={{ mr: 1 }} /> Delete Store
          </MenuItem>
        </Menu>
      </Card>
    );
  }

  // Card view (default) and detailed view
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Banner Image */}
      {(store.images?.bannerUrl || store.bannerUrl) && (
        <CardMedia
          component='img'
          height='140'
          image={store.images?.bannerUrl || store.bannerUrl}
          alt={store.storeName}
          sx={{ objectFit: 'cover' }}
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Stack
          direction='row'
          spacing={2}
          alignItems='flex-start'
          sx={{ mb: 2 }}
        >
          <Avatar
            src={store.images?.logoUrl || store.logoUrl}
            sx={{ width: 56, height: 56 }}
          >
            <Store />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              {store.storeName}
            </Typography>
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {getApprovalStatusChip()}
              {getStorefrontStatusBadge()}
            </Stack>
          </Box>
          <IconButton size='small' onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Stack>

        {/* Description */}
        {store.description && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            {store.description}
          </Typography>
        )}

        {/* Metrics Bar */}
        {viewMode === 'detailed' && renderMetricsBar()}

        {/* Operations Info */}
        {viewMode === 'detailed' && renderOperationsInfo()}

        {/* Featured Products */}
        {viewMode === 'detailed' &&
          store.featuredProducts &&
          renderFeaturedProducts()}

        {/* Expandable Section for Card View */}
        {viewMode === 'card' && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              size='small'
              onClick={handleExpandClick}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
              fullWidth
            >
              {expanded ? 'Show Less' : 'Show More'}
            </Button>
            <Collapse in={expanded}>
              {renderMetricsBar()}
              {renderOperationsInfo()}
            </Collapse>
          </>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              size='small'
              fullWidth
              variant='outlined'
              startIcon={<Edit />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              size='small'
              fullWidth
              variant='outlined'
              startIcon={<Launch />}
              onClick={onPreviewStore}
            >
              Preview
            </Button>
          </Grid>
          {viewMode === 'detailed' && (
            <>
              <Grid item xs={6}>
                <Button
                  size='small'
                  fullWidth
                  variant='outlined'
                  startIcon={<Analytics />}
                  onClick={onViewAnalytics}
                >
                  Analytics
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  size='small'
                  fullWidth
                  variant='outlined'
                  startIcon={<Inventory />}
                  onClick={onManageProducts}
                >
                  Products
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </CardActions>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onViewAnalytics();
          }}
        >
          <Analytics fontSize='small' sx={{ mr: 1 }} /> View Analytics
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onManageProducts();
          }}
        >
          <Inventory fontSize='small' sx={{ mr: 1 }} /> Manage Products
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onCustomizeStorefront();
          }}
        >
          <Palette fontSize='small' sx={{ mr: 1 }} /> Customize Storefront
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onEdit();
          }}
        >
          <Settings fontSize='small' sx={{ mr: 1 }} /> Store Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleMenuClose();
            onDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete fontSize='small' sx={{ mr: 1 }} /> Delete Store
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default EnhancedStoreCard;
