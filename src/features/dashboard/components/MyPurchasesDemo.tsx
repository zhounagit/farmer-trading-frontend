/**
 * MyPurchasesDemo Component
 *
 * Demo version of MyPurchases that uses only mock data.
 * This component is for development, testing, and demonstration purposes.
 * It does not make any API calls and uses the comprehensive mock data.
 */

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
import { format } from 'date-fns';
import type {
  Order,
  OrderFilterParams,
  OrderStatus,
  PaymentStatus,
} from '../../../types/order';
import {
  generateMockOrderListResponse,
  getMockOrderStats,
} from '../mocks/orderMocks';

interface MyPurchasesDemoProps {
  userId?: number;
}

const MyPurchasesDemo: React.FC<MyPurchasesDemoProps> = () => {
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

  // Order statistics
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    averageOrder: 0,
  });

  // Fetch orders from mock data
  const fetchOrders = useCallback(async () => {
    console.log('📋 MyPurchasesDemo: Fetching mock orders');

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

      // Get mock data response
      const response = generateMockOrderListResponse({
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        search: params.search,
        fromDate: params.fromDate,
        toDate: params.toDate,
      });

      // Get order statistics
      const stats = getMockOrderStats();

      setOrders(response.orders);
      setPagination(response.pagination);
      setOrderStats(stats);

      console.log(
        '✅ MyPurchasesDemo: Loaded',
        response.orders.length,
        'mock orders'
      );
    } catch (err) {
      console.error('❌ MyPurchasesDemo: Error loading mock orders:', err);
      setError('Failed to load demo orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterParams, statusFilter, searchQuery, dateRange]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle page change
  const handlePageChange = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number
  ) => {
    setFilterParams((prev) => ({ ...prev, page: page + 1 }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPageSize = parseInt(event.target.value, 10);
    setFilterParams((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as OrderStatus | 'all';
    setStatusFilter(value);
    setFilterParams((prev) => ({ ...prev, page: 1 }));
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setFilterParams((prev) => ({ ...prev, page: 1 }));
    }
  };

  // Handle date range change
  const handleDateRangeChange = (
    type: 'from' | 'to',
    value: string | undefined
  ) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
    setFilterParams((prev) => ({ ...prev, page: 1 }));
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

  // Handle view order details
  const handleViewOrder = (orderId: number) => {
    alert(
      `DEMO: View order details for order ID: ${orderId}\n\nThis is a demo version. In the real application, this would navigate to the order detail page.`
    );
  };

  // Handle view invoice
  const handleViewInvoice = (orderId: number) => {
    alert(
      `DEMO: View invoice for order ID: ${orderId}\n\nThis is a demo version. In the real application, this would generate/download an invoice PDF.`
    );
  };

  // Handle track shipment
  const handleTrackShipment = (orderId: number, trackingNumber?: string) => {
    if (trackingNumber) {
      alert(
        `DEMO: Track shipment for order ID: ${orderId}\nTracking number: ${trackingNumber}\n\nThis is a demo version. In the real application, this would show real-time tracking information.`
      );
    } else {
      alert(`DEMO: No tracking number available for order ID: ${orderId}`);
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

  return (
    <Box>
      {/* Demo Banner */}
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2'>
          <strong>DEMO MODE:</strong> This is a demonstration version using mock
          data. No real API calls are being made. Switch to the real version to
          connect to backend APIs.
        </Typography>
      </Alert>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' gutterBottom>
          My Purchases (Demo)
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          View and manage your order history with comprehensive mock data
        </Typography>
      </Box>

      {/* Order Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Total Orders
              </Typography>
              <Typography variant='h4'>{orderStats.totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Active Orders
              </Typography>
              <Typography variant='h4'>{orderStats.activeOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Total Spent
              </Typography>
              <Typography variant='h4'>
                {formatCurrency(orderStats.totalSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='text.secondary' gutterBottom>
                Average Order
              </Typography>
              <Typography variant='h4'>
                {formatCurrency(orderStats.averageOrder)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder='Search orders...'
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                handleSearchSubmit(e as React.KeyboardEvent<HTMLInputElement>)
              }
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

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                startIcon={<FilterIcon />}
                onClick={fetchOrders}
              >
                Apply Filters
              </Button>
              <Button variant='text' onClick={handleClearFilters}>
                Clear
              </Button>
              <Button
                variant='text'
                startIcon={<RefreshIcon />}
                onClick={fetchOrders}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Orders Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
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
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ p: 4 }}>
                    <Typography color='text.secondary'>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.orderId} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight='medium'>
                        {order.orderNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.replace(/_/g, ' ')}
                        color={getStatusColor(order.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus.replace(/_/g, ' ')}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight='medium'>
                        {formatCurrency(order.total)}
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: 1,
                        }}
                      >
                        <Tooltip title='View Order'>
                          <IconButton
                            size='small'
                            onClick={() => handleViewOrder(order.orderId)}
                          >
                            <ViewIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='View Invoice'>
                          <IconButton
                            size='small'
                            onClick={() => handleViewInvoice(order.orderId)}
                          >
                            <ReceiptIcon fontSize='small' />
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
                              <ShippingIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component='div'
          count={pagination.totalCount}
          rowsPerPage={pagination.pageSize}
          page={pagination.currentPage - 1}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Paper>

      {/* Demo Info Footer */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          <strong>Demo Information:</strong> This component uses comprehensive
          mock data with:
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          • {orderStats.totalOrders} sample orders with various statuses •
          Realistic order amounts and dates • Full filtering and pagination
          functionality • No API dependencies - perfect for development and
          testing
        </Typography>
      </Box>
    </Box>
  );
};

export default MyPurchasesDemo;
