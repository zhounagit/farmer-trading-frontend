import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { Grid } from '../../../shared/components/layout/Grid';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom'; // TODO: Will be used for navigation
import { format } from 'date-fns';
import orderService from '../services/orderService';
import type {
  Order,
  OrderFilterParams,
  OrderStatus,
  PaymentStatus,
} from '../../../types/order';

// Configuration: Set to true to use mock data, false to use real API
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;

interface StoreOrdersProps {
  storeId?: number;
  userId?: number;
}

const StoreOrders: React.FC<StoreOrdersProps> = ({ storeId, userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 10,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  // Filter states
  const [filterParams, setFilterParams] = useState<OrderFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'created_at',
    sortDirection: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(
    {}
  );

  // Status options for filter dropdown
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'ready_for_pickup', label: 'Ready for Pickup' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  // Fetch store orders
  const fetchOrders = useCallback(async () => {
    if (!storeId) {
      setError('Store ID is required to fetch orders');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Build filter params
      const params: OrderFilterParams = {
        ...filterParams,
        page: filterParams.page || 1,
        pageSize: filterParams.pageSize || 10,
      };

      // Apply status filter
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      // Apply search query
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Apply date range
      if (dateRange.from) {
        params.fromDate = dateRange.from;
      }
      if (dateRange.to) {
        params.toDate = dateRange.to;
      }

      console.log(
        `📋 StoreOrders: Fetching orders for store ${storeId}`,
        params
      );

      let response;
      if (USE_MOCK_DATA) {
        // Use mock data for development
        console.log('📋 StoreOrders: Using mock data');
        // For now, we'll use the same mock data but filter by storeId
        response = await orderService.getMockOrders(params);

        // For development/demo: If no orders match the exact storeId,
        // modify some orders to match the current storeId so we can see data
        const hasMatchingOrders = response.orders.some(
          (order: Order) => order.storeId === storeId
        );

        if (!hasMatchingOrders && response.orders.length > 0) {
          // For demo purposes, update the first few orders to match this store
          console.log(
            `📋 StoreOrders: No mock orders for store ${storeId}, modifying for demo`
          );
          response.orders = response.orders.map(
            (order: Order, index: number) => ({
              ...order,
              storeId: index < 3 ? storeId : order.storeId, // First 3 orders for this store
            })
          );
        } else {
          // Filter mock orders by storeId (in real API, this would be done server-side)
          response.orders = response.orders.filter(
            (order: Order) => order.storeId === storeId
          );
        }

        response.pagination.totalCount = response.orders.length;
        response.pagination.totalPages = Math.ceil(
          response.orders.length / (params.pageSize || 10)
        );
      } else {
        // Use real API
        response = await orderService.getStoreOrders(storeId, params);
      }

      setOrders(response.orders);
      setPagination({
        totalCount: response.pagination.totalCount,
        totalPages: response.pagination.totalPages,
        currentPage: response.pagination.currentPage,
        pageSize: response.pagination.pageSize,
        hasPreviousPage: response.pagination.hasPreviousPage,
        hasNextPage: response.pagination.hasNextPage,
      });

      console.log(
        `✅ StoreOrders: Loaded ${response.orders.length} orders for store ${storeId}`
      );
    } catch (err) {
      console.error(
        `❌ StoreOrders: Error loading orders for store ${storeId}:`,
        err
      );
      setError('Failed to load store orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [storeId, filterParams, statusFilter, searchQuery, dateRange]);

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle page change
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilterParams((prev) => ({
      ...prev,
      page: newPage + 1, // TablePagination is 0-indexed, our API is 1-indexed
    }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setFilterParams((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1, // Reset to first page when changing page size
    }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as OrderStatus | 'all';
    setStatusFilter(value);
    setFilterParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page when changing filters
    }));
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle search submit (on Enter key)
  const handleSearchSubmit = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      setFilterParams((prev) => ({
        ...prev,
        page: 1, // Reset to first page when searching
      }));
    }
  };

  // Handle date range change
  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
    setFilterParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page when changing date range
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRange({});
    setFilterParams({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortDirection: 'desc',
    });
  };

  // Handle view order
  const handleViewOrder = (orderId: number) => {
    console.log(`View order ${orderId}`);
    // TODO: Navigate to order details page
    // navigate(`/dashboard/orders/${orderId}`);
  };

  // Handle view invoice
  const handleViewInvoice = (orderId: number) => {
    console.log(`View invoice for order ${orderId}`);
    // TODO: Generate/download invoice
  };

  // Handle track shipment
  const handleTrackShipment = (orderId: number, trackingNumber?: string) => {
    console.log(`Track shipment for order ${orderId}`, trackingNumber);
    if (trackingNumber) {
      // TODO: Open tracking in new window or show tracking modal
      window.open(
        `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
        '_blank'
      );
    }
  };

  // Handle fulfill order
  const handleFulfillOrder = (orderId: number) => {
    console.log(`Fulfill order ${orderId}`);
    // TODO: Implement order fulfillment logic
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status color for chip
  const getStatusColor = (
    status: OrderStatus
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'ready_for_pickup':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get payment status color for chip
  const getPaymentStatusColor = (
    status: PaymentStatus
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
      case 'unpaid':
        return 'error';
      case 'pending':
        return 'warning';
      case 'paid':
        return 'success';
      case 'partially_paid':
        return 'info';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <Alert
        severity='error'
        action={
          <Button color='inherit' size='small' onClick={fetchOrders}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // No store ID state
  if (!storeId) {
    return (
      <Alert severity='info'>
        <Typography variant='body1' gutterBottom>
          Store information not available
        </Typography>
        <Typography variant='body2'>
          You need to have a store to view store orders. Please create a store
          first or check your store settings.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' gutterBottom fontWeight='bold'>
          Store Orders
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          View and manage orders placed at your store. Track order status,
          process fulfillments, and handle customer inquiries.
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<StoreIcon />}
            label={`Store ID: ${storeId}`}
            size='small'
            variant='outlined'
            color='primary'
          />
          {userId && (
            <Chip
              icon={<PersonIcon />}
              label={`User ID: ${userId}`}
              size='small'
              variant='outlined'
            />
          )}
          {USE_MOCK_DATA && (
            <Chip
              label='Using Demo Data'
              size='small'
              color='warning'
              variant='outlined'
            />
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder='Search orders...'
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size='small'
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size='small'>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  handleStatusFilterChange(
                    e as React.ChangeEvent<{ value: unknown }>
                  )
                }
                label='Status'
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type='date'
              label='From Date'
              value={dateRange.from || ''}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <CalendarIcon fontSize='small' />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type='date'
              label='To Date'
              value={dateRange.to || ''}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size='small'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <CalendarIcon fontSize='small' />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='outlined'
              startIcon={<FilterIcon />}
              onClick={handleClearFilters}
              size='small'
            >
              Clear Filters
            </Button>
            <Button
              variant='contained'
              startIcon={<RefreshIcon />}
              onClick={fetchOrders}
              size='small'
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant='h6' gutterBottom color='text.secondary'>
            No orders found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {searchQuery ||
            statusFilter !== 'all' ||
            dateRange.from ||
            dateRange.to
              ? 'Try adjusting your filters'
              : 'No orders have been placed at your store yet. Orders will appear here when customers purchase from your store.'}
          </Typography>
          {USE_MOCK_DATA && (
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 1, display: 'block' }}
            >
              Note: Using demo data. In production, real orders will appear
              here.
            </Typography>
          )}
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.orderId} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {order.userId ? `User #${order.userId}` : 'Guest'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.replace('_', ' ')}
                        color={getStatusColor(order.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Tooltip title='View Order'>
                        <IconButton
                          size='small'
                          onClick={() => handleViewOrder(order.orderId)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='View Invoice'>
                        <IconButton
                          size='small'
                          onClick={() => handleViewInvoice(order.orderId)}
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Tooltip>
                      {order.trackingNumber && (
                        <Tooltip title='Track Shipment'>
                          <IconButton
                            size='small'
                            onClick={() =>
                              handleTrackShipment(
                                order.orderId,
                                order.trackingNumber
                              )
                            }
                          >
                            <ShippingIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(order.status === 'confirmed' ||
                        order.status === 'processing') && (
                        <Tooltip title='Fulfill Order'>
                          <Button
                            variant='contained'
                            size='small'
                            onClick={() => handleFulfillOrder(order.orderId)}
                            sx={{ ml: 1 }}
                          >
                            Fulfill
                          </Button>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component='div'
            count={pagination.totalCount}
            page={pagination.currentPage - 1} // Convert to 0-indexed for MUI
            rowsPerPage={pagination.pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Stats Card */}
      {orders.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  Total Orders
                </Typography>
                <Typography variant='h6'>{pagination.totalCount}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  Pending
                </Typography>
                <Typography variant='h6'>
                  {orders.filter((o) => o.status === 'pending').length}
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  Processing
                </Typography>
                <Typography variant='h6'>
                  {
                    orders.filter(
                      (o) =>
                        o.status === 'processing' || o.status === 'confirmed'
                    ).length
                  }
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography variant='body2' color='text.secondary'>
                  Completed
                </Typography>
                <Typography variant='h6'>
                  {
                    orders.filter(
                      (o) =>
                        o.status === 'delivered' ||
                        o.status === 'ready_for_pickup'
                    ).length
                  }
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StoreOrders;
