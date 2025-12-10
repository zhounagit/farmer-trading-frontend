import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  ShoppingBag,
  LocalShipping,
  Email,
  Home,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Grid } from '../../../shared/components/layout/Grid';

/**
 * Order Confirmation Component
 *
 * Displays order confirmation details after successful checkout.
 * Shows order ID, order number, and next steps for the customer.
 */
const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get order details from navigation state
  const orderId = location.state?.orderId;
  const orderNumber = location.state?.orderNumber;

  // If no order details, show error and redirect
  React.useEffect(() => {
    if (!orderId && !orderNumber) {
      // Redirect to home if no order details
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [orderId, orderNumber, navigate]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/dashboard', { state: { activeTab: 'orders' } });
  };

  return (
    <Container maxWidth='md' sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        {/* Success Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CheckCircle
            sx={{
              fontSize: 80,
              color: 'success.main',
              mb: 3,
            }}
          />
          <Typography
            variant='h3'
            component='h1'
            gutterBottom
            fontWeight='bold'
          >
            Order Confirmed!
          </Typography>
          <Typography variant='h6' color='text.secondary' paragraph>
            Thank you for your purchase. Your order has been successfully
            placed.
          </Typography>
        </Box>

        {/* Order Details Card */}
        <Card
          sx={{
            mb: 5,
            border: '1px solid',
            borderColor: 'success.light',
            backgroundColor: 'success.50',
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              <Grid component='div' item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Order Number
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    {orderNumber || 'Loading...'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid component='div' item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Order ID
                  </Typography>
                  <Typography variant='h5' fontWeight='bold'>
                    {orderId ? `#${orderId}` : 'Loading...'}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Box sx={{ mb: 6 }}>
          <Typography variant='h5' gutterBottom fontWeight='bold'>
            What's Next?
          </Typography>
          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            <Grid component='div' item xs={12} md={4}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Email sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant='h6' gutterBottom>
                    Email Confirmation
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    You'll receive an email with your order details and receipt.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid component='div' item xs={12} md={4}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalShipping
                    sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant='h6' gutterBottom>
                    Order Processing
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Your order is being processed and prepared for shipping.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid component='div' item xs={12} md={4}>
              <Card variant='outlined' sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StoreIcon
                    sx={{ fontSize: 40, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant='h6' gutterBottom>
                    Store Notification
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    The store has been notified and will prepare your items.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Help Information */}
        <Alert severity='info' sx={{ mb: 4 }}>
          <Typography variant='body2'>
            Need help with your order? Visit our{' '}
            <RouterLink
              to='/help/orders'
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Order Help Center
            </RouterLink>{' '}
            or contact customer support.
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Button
            variant='contained'
            size='large'
            startIcon={<ShoppingBag />}
            onClick={handleContinueShopping}
            sx={{ minWidth: 200 }}
          >
            Continue Shopping
          </Button>

          <Button
            variant='outlined'
            size='large'
            startIcon={<Home />}
            onClick={handleViewOrders}
            sx={{ minWidth: 200 }}
          >
            View My Orders
          </Button>
        </Box>

        {/* Redirect Notice */}
        {(!orderId || !orderNumber) && (
          <Alert severity='warning' sx={{ mt: 4 }}>
            <Typography variant='body2'>
              No order details found. Redirecting to home page...
            </Typography>
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default OrderConfirmation;
