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

interface MyPurchasesProps {
  userId?: number;
}

const MyPurchases: React.FC<MyPurchasesProps> = ({ userId }) => {
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

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!userId) return;

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

      // Apply search
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Apply date range
      if (dateRange.from) {
        params.fromDate = dateRange.from;
      }
      if (dateRange.to) {
        params.toDate = dateRange.to;
      }

      let response;

      if (USE_MOCK_DATA) {
        console.log('📋 Using mock data for orders');
        response = await orderService.getMockOrders(params);
      } else {
        console.log('🌐 Fetching orders from real API');
        response = await orderService.getMyOrders(params);
      }

      setOrders(response.orders);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching orders:', err);

      // Try to provide a user-friendly error message
      if (err instanceof Error) {
        if (
          err.message.includes('Network Error') ||
          err.message.includes('Failed to fetch')
        ) {
          setError(
            'Unable to connect to the server. Please check your internet connection and try again.'
          );
        } else if (
          err.message.includes('401') ||
          err.message.includes('UNAUTHORIZED')
        ) {
          setError('Please log in to view your orders.');
        } else if (
          err.message.includes('403') ||
          err.message.includes('FORBIDDEN')
        ) {
          setError('You do not have permission to view these orders.');
        } else {
          setError(`Failed to load orders: ${err.message}`);
        }
      } else {
        setError('Failed to load orders. Please try again.');
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filterParams, statusFilter, searchQuery, dateRange]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle pagination
  const handlePageChange = (_event: unknown, newPage: number) => {
    setFilterParams((prev) => ({
      ...prev,
      page: newPage + 1, // MUI TablePagination is 0-based, backend is 1-based
    }));
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterParams((prev) => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      page: 1, // Reset to first page when changing page size
    }));
  };

  // Handle filter changes
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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilterParams((prev) => ({
      ...prev,
      page: 1, // Reset to first page when searching
    }));
  };

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

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    // navigate(`/dashboard/orders/${orderId}`); // TODO: Implement order detail page
    alert(
      `View order details for order ID: ${orderId}\n\nThis feature will be implemented with the order detail page.`
    );
  };

  // Handle view invoice
  const handleViewInvoice = (orderId: number) => {
    // TODO: Implement invoice viewing
    alert(
      `View invoice for order ID: ${orderId}\n\nThis feature will be implemented with invoice generation.`
    );
  };

  // Handle track shipment
  const handleTrackShipment = (orderId: number, trackingNumber?: string) => {
    if (trackingNumber) {
      // TODO: Implement tracking
      alert(
        `Track shipment for order ID: ${orderId}\nTracking number: ${trackingNumber}\n\nThis feature will be implemented with shipment tracking.`
      );
    } else {
      alert(`No tracking number available for order ID: ${orderId}`);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get status chip color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'processing':
        return 'info';
      case 'shipped':
      case 'ready_for_pickup':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get payment status chip color
  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
      case 'partially_paid':
        return 'warning';
      case 'failed':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  // Status options for filter
  const statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
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

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {error}
        <Button onClick={fetchOrders} sx={{ ml: 2 }} size='small'>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h5' gutterBottom fontWeight='bold'>
          My Purchases
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          View your order history and track current orders
        </Typography>
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
              : "You haven't placed any orders yet"}
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
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
            page={pagination.currentPage - 1} // Convert to 0-based for MUI
            rowsPerPage={pagination.pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}

      {/* Quick Stats */}
      {orders.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    Total Orders
                  </Typography>
                  <Typography variant='h6'>{pagination.totalCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    Active Orders
                  </Typography>
                  <Typography variant='h6'>
                    {
                      orders.filter((order) =>
                        [
                          'pending',
                          'confirmed',
                          'processing',
                          'shipped',
                        ].includes(order.status)
                      ).length
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    Total Spent
                  </Typography>
                  <Typography variant='h6'>
                    {formatCurrency(
                      orders.reduce((sum, order) => sum + order.total, 0)
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant='outlined'>
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    Average Order
                  </Typography>
                  <Typography variant='h6'>
                    {formatCurrency(
                      orders.length > 0
                        ? orders.reduce((sum, order) => sum + order.total, 0) /
                            orders.length
                        : 0
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default MyPurchases;
