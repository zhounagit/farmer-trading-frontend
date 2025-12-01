import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Divider,
  Alert,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { Grid } from '../../../shared/components/layout/Grid';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from '@mui/icons-material';
import { useCart } from '../../../hooks/useCart';
import Header from '../../../components/layout/Header';
import { checkoutService } from '../services/checkoutService';
import { guestService } from '../services/guestService';
import { GuestCartService } from '../services/guestCartStorageService';
import type {
  CheckoutRequest,
  CheckoutTotals,
} from '../services/checkoutService';
import type {
  GuestSession,
  GuestAddressRequest,
  GuestAddress,
} from '../services/guestService';
import toast from 'react-hot-toast';

/**
 * Guest Checkout Page Component
 *
 * Allows guest users to complete checkout without creating an account.
 * Collects shipping and payment information for order processing.
 */
const GuestCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { guestCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [guestAddresses, setGuestAddresses] = useState<GuestAddress[]>([]);
  const [guestCartId, setGuestCartId] = useState<number | null>(null);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<
    number | null
  >(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    number | null
  >(null);

  const [formData, setFormData] = useState({
    // Contact Information
    email: '',
    phone: '',

    // Shipping Information
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',

    // Billing Address Information
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States',
    usePrimaryAddress: false,

    // Payment Information
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/26',
    cvv: '123',
    nameOnCard: 'John Doe',
  });

  const steps = ['Contact Info', 'Shipping', 'Payment', 'Review'];

  // Initialize guest session on component mount
  useEffect(() => {
    const initializeGuestSession = async () => {
      try {
        const session = await guestService.initializeGuest();
        setGuestSession(session);
      } catch (error) {
        console.error('Failed to initialize guest session:', error);
      }
    };

    initializeGuestSession();
  }, []);

  // Load guest addresses when session is available
  useEffect(() => {
    const loadGuestAddresses = async () => {
      if (guestSession) {
        try {
          const addresses = await guestService.getAddresses(
            guestSession.guestId
          );
          setGuestAddresses(addresses);

          // Set primary address as default selection if available
          const primaryAddress = addresses.find((addr) => addr.isPrimary);
          if (primaryAddress) {
            setSelectedShippingAddressId(primaryAddress.addressId);
            setSelectedBillingAddressId(primaryAddress.addressId);
            setFormData((prev) => ({
              ...prev,
              usePrimaryAddress: true,
            }));
          } else if (addresses.length > 0) {
            // If no primary address but addresses exist, set first as default
            const firstAddress = addresses[0];
            setSelectedShippingAddressId(firstAddress.addressId);
            setSelectedBillingAddressId(firstAddress.addressId);
          }

          // Load guest cart to get cartId and validate cart state
          try {
            const backendCart = await guestService.getCart(
              guestSession.guestId
            );
            setGuestCartId(backendCart.cartId);

            // Validate that backend cart has items
            if (
              backendCart.cartItems.length === 0 &&
              (guestCart?.items?.length || 0) > 0
            ) {
              console.warn(
                'Cart state mismatch: Frontend has items but backend cart is empty'
              );
              toast.error(
                'Cart items were lost due to server restart. Please add items to cart again.'
              );
              // Clear frontend cart to match backend state
              GuestCartService.clearCart().catch(console.error);
            }
          } catch (error) {
            console.warn('Failed to load guest cart:', error);
            // Don't set guestCartId to null, we'll try again during checkout
          }
        } catch (error) {
          console.warn('Failed to load guest addresses:', error);
        }
      }
    };

    loadGuestAddresses();
  }, [guestSession]);

  // Calculate order totals
  const orderTotal =
    guestCart?.items?.reduce((total, item) => {
      return total + (item.productPrice || 0) * item.quantity;
    }, 0) || 0;

  // Function to normalize country input (convert names to codes)
  const normalizeCountry = (country: string): string => {
    const countryMap: Record<string, string> = {
      'united states': 'US',
      'united states of america': 'US',
      usa: 'US',
      'u.s.a.': 'US',
      'u.s.': 'US',
      us: 'US',
      canada: 'CA',
      mexico: 'MX',
      'united kingdom': 'GB',
      'great britain': 'GB',
      uk: 'GB',
      germany: 'DE',
      france: 'FR',
      italy: 'IT',
      spain: 'ES',
      australia: 'AU',
      japan: 'JP',
      china: 'CN',
      india: 'IN',
      brazil: 'BR',
    };

    const normalized = country.toLowerCase().trim();
    return countryMap[normalized] || country.toUpperCase();
  };

  const [checkoutTotals, setCheckoutTotals] = useState<CheckoutTotals>({
    subtotal: orderTotal,
    taxAmount: orderTotal * 0.08, // Default 8% tax
    shippingCost: 5.99, // Default shipping
    discountAmount: 0,
    total: orderTotal + 5.99 + orderTotal * 0.08,
  });

  // Initialize guest session and calculate real totals
  useEffect(() => {
    const initializeGuestAndTotals = async () => {
      if (!guestCart) return;

      try {
        // Guest session is already initialized on component mount

        // Calculate totals with guest session
        if (formData.zipCode) {
          // In a real implementation, we would call:
          // const totals = await checkoutService.getCheckoutTotals(
          //   undefined, // cartId for guest
          //   undefined, // shippingAddressId
          //   undefined, // billingAddressId
          //   undefined, // customerId for guest
          //   guestSession?.guestId // guestId
          // );
          // setCheckoutTotals(totals);

          // For now, use calculated values
          const calculatedTax = orderTotal * 0.08;
          const calculatedShipping = 5.99;
          setCheckoutTotals({
            subtotal: orderTotal,
            taxAmount: calculatedTax,
            shippingCost: calculatedShipping,
            discountAmount: 0,
            total: orderTotal + calculatedShipping + calculatedTax,
          });
        }
      } catch (error) {
        console.error('Error calculating totals:', error);
      }
    };

    initializeGuestAndTotals();
  }, [orderTotal, formData.zipCode, guestCart]);

  const handleNext = () => {
    // Validate primary address when moving from shipping step
    if (activeStep === 1 && guestAddresses.length > 0) {
      const hasPrimaryAddress = guestAddresses.some((addr) => addr.isPrimary);
      if (!hasPrimaryAddress) {
        toast.error(
          'Please set a primary address before proceeding to payment.'
        );
        return;
      }
    }

    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      });
    };

  const handleCheckboxChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked;
      setFormData({
        ...formData,
        [field]: checked,
        // If same as shipping is checked, copy shipping address to billing address
        ...(field === 'sameAsShipping' && checked
          ? {
              billingFirstName: formData.firstName,
              billingLastName: formData.lastName,
              billingAddress: formData.address,
              billingCity: formData.city,
              billingState: formData.state,
              billingZipCode: formData.zipCode,
              billingCountry: formData.country,
            }
          : {}),
      });
    };

  const handleAddressSelection = (
    addressId: number,
    addressType: 'shipping' | 'billing'
  ) => {
    if (addressType === 'shipping') {
      setSelectedShippingAddressId(addressId);
      const selectedAddress = guestAddresses.find(
        (addr) => addr.addressId === addressId
      );
      if (selectedAddress) {
        setFormData((prev) => ({
          ...prev,
          firstName: selectedAddress.streetAddress.split(' ')[0] || '',
          lastName: selectedAddress.streetAddress.split(' ')[1] || '',
          address: selectedAddress.streetAddress,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country,
        }));
      }
    } else {
      setSelectedBillingAddressId(addressId);
      const selectedAddress = guestAddresses.find(
        (addr) => addr.addressId === addressId
      );
      if (selectedAddress) {
        setFormData((prev) => ({
          ...prev,
          billingFirstName: selectedAddress.streetAddress.split(' ')[0] || '',
          billingLastName: selectedAddress.streetAddress.split(' ')[1] || '',
          billingAddress: selectedAddress.streetAddress,
          billingCity: selectedAddress.city,
          billingState: selectedAddress.state,
          billingZipCode: selectedAddress.zipCode,
          billingCountry: selectedAddress.country,
        }));
      }
    }
  };

  const handleSetPrimaryAddress = async (addressId: number) => {
    if (!guestSession) return;

    try {
      await guestService.setPrimaryAddress(guestSession.guestId, addressId);

      // Update local state to reflect the new primary address
      const updatedAddresses = guestAddresses.map((addr) => ({
        ...addr,
        isPrimary: addr.addressId === addressId,
      }));
      setGuestAddresses(updatedAddresses);

      // Update selected addresses to use the new primary
      setSelectedShippingAddressId(addressId);
      setSelectedBillingAddressId(addressId);

      toast.success('Primary address updated');
    } catch (error) {
      console.error('Failed to set primary address:', error);
      toast.error('Failed to update primary address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!guestCart || !guestSession) return;

    // Validate cart state before proceeding with checkout
    if (!guestCart.items || guestCart.items.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Validate expiry date format
    const expiryParts = formData.expiryDate.split('/');
    if (expiryParts.length !== 2) {
      toast.error('Please enter expiry date in MM/YY format');
      setIsProcessing(false);
      return;
    }

    const expiryMonth = parseInt(expiryParts[0]);
    const expiryYear = parseInt(expiryParts[1]);

    if (isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      toast.error('Please enter a valid month (01-12)');
      setIsProcessing(false);
      return;
    }

    // Handle both YY and YYYY formats
    const fullExpiryYear = expiryYear < 100 ? 2000 + expiryYear : expiryYear;
    if (isNaN(fullExpiryYear) || fullExpiryYear < 2024) {
      toast.error('Please enter a valid year (2024 or later)');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Use existing addresses or create new ones
      let shippingAddressId: number;
      let billingAddressId: number;

      if (formData.usePrimaryAddress && selectedShippingAddressId) {
        // Use existing primary address for shipping
        shippingAddressId = selectedShippingAddressId;
      } else {
        // Create new shipping address
        const shippingAddressData: GuestAddressRequest = {
          addressType: 'shipping',
          streetAddress: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: normalizeCountry(formData.country),
          firstName: formData.firstName,
          lastName: formData.lastName,
          isPrimary: true, // First address or new address becomes primary
        };

        const shippingAddressResult = await guestService.createAddress(
          guestSession.guestId,
          shippingAddressData
        );
        shippingAddressId = shippingAddressResult.addressId;
      }

      if (formData.sameAsShipping) {
        // Use the same address for billing
        billingAddressId = shippingAddressId;
      } else if (formData.usePrimaryAddress && selectedBillingAddressId) {
        // Use existing address for billing
        billingAddressId = selectedBillingAddressId;
      } else {
        // Create separate billing address
        const billingAddressData: GuestAddressRequest = {
          addressType: 'billing',
          streetAddress: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: normalizeCountry(formData.billingCountry),
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          isPrimary: false, // Billing address is not primary
        };

        const billingAddressResult = await guestService.createAddress(
          guestSession.guestId,
          billingAddressData
        );
        billingAddressId = billingAddressResult.addressId;
      }

      // Update guest contact information if provided
      if (formData.email || formData.phone) {
        await guestService.updateContactInfo(guestSession.guestId, {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        });
      }

      // Ensure we have a valid cart ID and validate cart state before proceeding
      let finalCartId = guestCartId;
      let backendCart;
      if (!finalCartId) {
        // Try to load the guest cart if we don't have the ID
        try {
          backendCart = await guestService.getCart(guestSession.guestId);
          finalCartId = backendCart.cartId;
          setGuestCartId(backendCart.cartId);
        } catch (error) {
          console.error('Failed to load guest cart for checkout:', error);
          toast.error('Unable to process checkout. Please try again.');
          return;
        }
      } else {
        // Load cart to validate state
        try {
          backendCart = await guestService.getCart(guestSession.guestId);
        } catch (error) {
          console.error('Failed to validate cart state:', error);
          toast.error('Unable to validate cart. Please try again.');
          return;
        }
      }

      // Validate that backend cart has items
      if (!backendCart?.cartItems || backendCart.cartItems.length === 0) {
        toast.error(
          'Cart is empty. Please add items before proceeding with checkout.'
        );
        return;
      }

      // Prepare checkout request with address IDs
      const checkoutRequest: CheckoutRequest = {
        guestId: guestSession.guestId,
        cartId: finalCartId,
        shippingAddressId: shippingAddressId,
        billingAddressId: billingAddressId,
        paymentMethod: 'credit_card',
        fulfillmentMethod: 'delivery',
        customerNote: '',
        isTaxExempt: false,

        paymentDetails: {
          cardNumber: formData.cardNumber.replace(/\s/g, ''),
          expiryMonth: expiryMonth,
          expiryYear: fullExpiryYear,
          cvv: formData.cvv,
          cardholderName: formData.nameOnCard,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        },
        deliveryInstructions: formData.address,
      };

      // Validate checkout prerequisites before processing
      try {
        const validationResult = await guestService.validateCheckout(
          guestSession.guestId,
          finalCartId,
          shippingAddressId,
          billingAddressId
        );

        if (!validationResult?.isValid) {
          const errorMessage = validationResult?.errors?.length
            ? `Checkout validation failed: ${validationResult.errors.join(', ')}`
            : 'Checkout validation failed. Please check your cart and address information.';
          toast.error(errorMessage);
          return;
        }
      } catch (validationError) {
        console.error('Checkout validation error:', validationError);
        const errorMessage =
          validationError instanceof Error
            ? `Unable to validate checkout: ${validationError.message}`
            : 'Unable to validate checkout. Please try again.';
        toast.error(errorMessage);
        return;
      }

      // Process checkout
      const result = await checkoutService.processCheckout(checkoutRequest);

      toast.success('Order placed successfully!');
      console.log('Checkout completed:', result);

      // Clear guest cart after successful checkout
      try {
        await guestService.clearCart(guestSession.guestId);
      } catch (error) {
        console.warn('Failed to clear guest cart after checkout:', error);
      }

      // Clear frontend cart state
      GuestCartService.clearCart().catch(console.error);

      // Clear guest session after successful checkout
      guestService.clearGuestSession();

      // Redirect to home or order confirmation page
      navigate('/');
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, taxAmount, shippingCost, discountAmount, total } =
    checkoutTotals;

  const renderContactStep = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
        Contact Information
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        We'll use this to send your order confirmation and updates
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label='Email Address'
            type='email'
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder='your.email@example.com'
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Phone Number'
            type='tel'
            value={formData.phone}
            onChange={handleInputChange('phone')}
            placeholder='(555) 123-4567'
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderShippingStep = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
        Shipping Address
      </Typography>

      {/* Address Selection */}
      {guestAddresses.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            Select Existing Address
          </Typography>

          {/* Primary Address Warning */}
          {!guestAddresses.some((addr) => addr.isPrimary) &&
            guestAddresses.length > 0 && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                <Typography variant='body2'>
                  <strong>No primary address set.</strong> Please select a
                  primary address before proceeding to payment.
                </Typography>
              </Alert>
            )}

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.usePrimaryAddress}
                onChange={handleCheckboxChange('usePrimaryAddress')}
                color='primary'
              />
            }
            label='Use existing address'
          />

          {formData.usePrimaryAddress && (
            <Box sx={{ mt: 2 }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Select from your saved addresses:
              </Typography>
              {guestAddresses.map((address) => (
                <Card
                  key={address.addressId}
                  sx={{
                    mb: 2,
                    p: 2,
                    border:
                      selectedShippingAddressId === address.addressId ? 2 : 1,
                    borderColor:
                      selectedShippingAddressId === address.addressId
                        ? 'primary.main'
                        : 'grey.300',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    handleAddressSelection(address.addressId, 'shipping')
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {address.streetAddress}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {address.city}, {address.state} {address.zipCode}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {address.addressType} {address.isPrimary && '• Primary'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {address.isPrimary && (
                        <Chip
                          label='Primary'
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      )}
                      {!address.isPrimary && (
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetPrimaryAddress(address.addressId);
                          }}
                        >
                          Set Primary
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      )}

      {/* New Address Form */}
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
        {guestAddresses.length > 0
          ? 'Or Enter New Address'
          : 'Enter Shipping Address'}
      </Typography>

      {/* Primary Address Requirement Info */}
      {guestAddresses.length === 0 && (
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>This address will be set as your primary address.</strong>{' '}
            It will be your default address for future orders.
          </Typography>
        </Alert>
      )}
      {guestAddresses.length > 0 &&
        !guestAddresses.some((addr) => addr.isPrimary) && (
          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='body2'>
              <strong>This address will be set as primary</strong> since no
              primary address exists yet.
            </Typography>
          </Alert>
        )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label='First Name'
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label='Last Name'
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label='Street Address'
            value={formData.address}
            onChange={handleInputChange('address')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label='City'
            value={formData.city}
            onChange={handleInputChange('city')}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label='State'
            value={formData.state}
            onChange={handleInputChange('state')}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label='ZIP Code'
            value={formData.zipCode}
            onChange={handleInputChange('zipCode')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label='Country'
            value={formData.country}
            onChange={handleInputChange('country')}
            placeholder='United States'
          />
        </Grid>
      </Grid>

      {/* Billing Address Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
          Billing Address
        </Typography>

        {/* Billing Address Selection */}
        {!formData.sameAsShipping && guestAddresses.length > 0 && (
          <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
            <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
              Select Billing Address
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Select from your saved addresses:
            </Typography>
            {guestAddresses.map((address) => (
              <Card
                key={address.addressId}
                sx={{
                  mb: 2,
                  p: 2,
                  border:
                    selectedBillingAddressId === address.addressId ? 2 : 1,
                  borderColor:
                    selectedBillingAddressId === address.addressId
                      ? 'primary.main'
                      : 'grey.300',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  handleAddressSelection(address.addressId, 'billing')
                }
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant='body1' sx={{ fontWeight: 600 }}>
                      {address.streetAddress}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {address.city}, {address.state} {address.zipCode}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {address.addressType} {address.isPrimary && '• Primary'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {address.isPrimary && (
                      <Chip
                        label='Primary'
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    )}
                    {!address.isPrimary && (
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimaryAddress(address.addressId);
                        }}
                      >
                        Set Primary
                      </Button>
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Paper>
        )}

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.sameAsShipping}
                onChange={handleCheckboxChange('sameAsShipping')}
                color='primary'
              />
            }
            label='Billing address same as shipping address'
          />
        </Box>

        {!formData.sameAsShipping && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label='Billing First Name'
                value={formData.billingFirstName}
                onChange={handleInputChange('billingFirstName')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label='Billing Last Name'
                value={formData.billingLastName}
                onChange={handleInputChange('billingLastName')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label='Billing Street Address'
                value={formData.billingAddress}
                onChange={handleInputChange('billingAddress')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label='Billing City'
                value={formData.billingCity}
                onChange={handleInputChange('billingCity')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                required
                fullWidth
                label='Billing State'
                value={formData.billingState}
                onChange={handleInputChange('billingState')}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                required
                fullWidth
                label='Billing ZIP Code'
                value={formData.billingZipCode}
                onChange={handleInputChange('billingZipCode')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label='Billing Country'
                value={formData.billingCountry}
                onChange={handleInputChange('billingCountry')}
                placeholder='United States'
              />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );

  const renderPaymentStep = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
        Payment Information
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Your payment information is secure and encrypted
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label='Name on Card'
            value={formData.nameOnCard}
            onChange={handleInputChange('nameOnCard')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label='Card Number'
            placeholder='1234 5678 9012 3456'
            value={formData.cardNumber}
            onChange={handleInputChange('cardNumber')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label='Expiry Date'
            placeholder='MM/YY'
            value={formData.expiryDate}
            onChange={handleInputChange('expiryDate')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label='CVV'
            placeholder='123'
            value={formData.cvv}
            onChange={handleInputChange('cvv')}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewStep = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
        Review Your Order
      </Typography>

      {/* Order Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Order Items
          </Typography>
          {guestCart?.items?.map((item) => (
            <Box
              key={item.itemId}
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant='body2'>
                {item.productName} × {item.quantity}
              </Typography>
              <Typography variant='body2'>
                ${((item.productPrice || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2'>Subtotal</Typography>
            <Typography variant='body2'>${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2'>Shipping</Typography>
            <Typography variant='body2'>${shippingCost.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='body2'>Tax</Typography>
            <Typography variant='body2'>${taxAmount.toFixed(2)}</Typography>
          </Box>
          {discountAmount > 0 && (
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant='body2' color='success.main'>
                Discount
              </Typography>
              <Typography variant='body2' color='success.main'>
                -${discountAmount.toFixed(2)}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h6'>Total</Typography>
            <Typography variant='h6'>${total.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Shipping Address
          </Typography>
          <Typography variant='body2'>
            {formData.firstName} {formData.lastName}
            <br />
            {formData.address}
            <br />
            {formData.city}, {formData.state} {formData.zipCode}
            <br />
            {formData.country}
          </Typography>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Billing Address
          </Typography>
          <Typography variant='body2'>
            {formData.sameAsShipping ? (
              <>
                Same as shipping address
                <br />
                {formData.firstName} {formData.lastName}
                <br />
                {formData.address}
                <br />
                {formData.city}, {formData.state} {formData.zipCode}
                <br />
                {formData.country}
              </>
            ) : (
              <>
                {formData.billingFirstName} {formData.billingLastName}
                <br />
                {formData.billingAddress}
                <br />
                {formData.billingCity}, {formData.billingState}{' '}
                {formData.billingZipCode}
                <br />
                {formData.billingCountry}
              </>
            )}
          </Typography>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Contact Information
          </Typography>
          <Typography variant='body2'>
            Email: {formData.email}
            <br />
            Phone: {formData.phone || 'Not provided'}
          </Typography>
        </CardContent>
      </Card>

      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2'>
          By placing this order, you agree to our Terms of Service and Privacy
          Policy. You'll receive an email confirmation with your order details.
        </Typography>
      </Alert>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderContactStep();
      case 1:
        return renderShippingStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderReviewStep();
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.email.trim() !== '';
      case 1: {
        const shippingValid =
          formData.firstName.trim() !== '' &&
          formData.lastName.trim() !== '' &&
          formData.address.trim() !== '' &&
          formData.city.trim() !== '' &&
          formData.state.trim() !== '' &&
          formData.zipCode.trim() !== '' &&
          formData.country.trim() !== '';

        const billingValid = formData.sameAsShipping
          ? true
          : formData.billingFirstName.trim() !== '' &&
            formData.billingLastName.trim() !== '' &&
            formData.billingAddress.trim() !== '' &&
            formData.billingCity.trim() !== '' &&
            formData.billingState.trim() !== '' &&
            formData.billingZipCode.trim() !== '' &&
            formData.billingCountry.trim() !== '';

        return shippingValid && billingValid;
      }
      case 2: {
        // Basic validation for payment step - detailed validation happens in handlePlaceOrder
        return (
          formData.nameOnCard.trim() !== '' &&
          formData.cardNumber.trim() !== '' &&
          formData.cvv.trim() !== '' &&
          formData.expiryDate.trim() !== ''
        );
      }
      default:
        return true;
    }
  };

  if (!guestCart?.items?.length) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
            <Typography variant='h5' component='h2' gutterBottom>
              Your Cart is Empty
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Add some items to your cart before proceeding to checkout.
            </Typography>
            <Button
              variant='outlined'
              size='large'
              onClick={() => navigate('/unified-search')}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header onLoginClick={() => navigate('/login')} />
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Guest Checkout
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Complete your purchase without creating an account
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Checkout Steps */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {getStepContent(activeStep)}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant='outlined'
                >
                  Back
                </Button>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant='contained'
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !isStepValid()}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                ) : (
                  <Button
                    variant='contained'
                    onClick={handleNext}
                    disabled={!isStepValid()}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                {guestCart?.items?.map((item) => (
                  <Box
                    key={item.itemId}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant='body2'>
                      {item.productName} × {item.quantity}
                    </Typography>
                    <Typography variant='body2'>
                      ${((item.productPrice || 0) * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2'>Subtotal</Typography>
                <Typography variant='body2'>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2'>Shipping</Typography>
                <Typography variant='body2'>
                  ${shippingCost.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2'>Tax</Typography>
                <Typography variant='body2'>${taxAmount.toFixed(2)}</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' color='success.main'>
                    Discount
                  </Typography>
                  <Typography variant='body2' color='success.main'>
                    -${discountAmount.toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='h6'>Total</Typography>
                <Typography variant='h6'>${total.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default GuestCheckoutPage;
