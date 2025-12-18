import React, { useState, useEffect, useCallback } from 'react';
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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import { Grid } from '../../../shared/components/layout/Grid';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../hooks/useCart';
import { useCartFulfillment } from '../../../hooks/useCartFulfillment';
import Header from '../../../components/layout/Header';
import { checkoutService } from '../services/checkoutService';
import { userAddressService } from '../services/userAddressService';
import { StoreAddressService } from '../services/storeAddressService';
import type {
  CheckoutRequest,
  CheckoutTotals,
} from '../services/checkoutService';
import type { UserAddress } from '../services/userAddressService';
import type { CartStoreAddresses } from '../services/storeAddressService';
import toast from 'react-hot-toast';

/**
 * User Checkout Page Component
 *
 * Allows authenticated users to complete checkout with their saved information.
 * Uses user profile data for faster checkout experience.
 */
const UserCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<
    number | null
  >(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<
    number | null
  >(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [saveShippingAddress, setSaveShippingAddress] = useState(true);
  const [saveBillingAddress, setSaveBillingAddress] = useState(true);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<string>('delivery');

  // Store pickup addresses for pickup fulfillment
  const [storeAddresses, setStoreAddresses] =
    useState<CartStoreAddresses | null>(null);
  const [loadingStoreAddresses, setLoadingStoreAddresses] = useState(false);

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
    setAsDefaultShipping: false,

    // Billing Information
    sameAsShipping: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    billingCountry: 'United States',
    setAsDefaultBilling: false,

    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  const [checkoutTotals, setCheckoutTotals] = useState<CheckoutTotals>({
    subtotal: cart?.subtotal || 0,
    taxAmount: 0,
    shippingCost: 0,
    discountAmount: 0,
    total: cart?.total || 0,
  });

  // Load user addresses on component mount
  const loadUserAddresses = useCallback(async () => {
    if (!user) return;

    try {
      const addresses = await userAddressService.getAddresses(
        parseInt(user.userId)
      );
      setUserAddresses(addresses);

      // Set default shipping address as default selection if available
      // Note: We need to get default shipping address from a separate API
      // For now, use the first shipping or both address
      const shippingAddress = addresses.find(
        (addr) => addr.addressType === 'shipping' || addr.addressType === 'both'
      );
      if (shippingAddress) {
        setSelectedShippingAddressId(shippingAddress.addressId);
        setSelectedBillingAddressId(shippingAddress.addressId);
        setUseSavedAddress(true);

        // Pre-fill form with shipping address data
        setFormData((prev) => ({
          ...prev,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
        }));
      } else if (addresses.length > 0) {
        // Use the first address if no shipping address found
        setSelectedShippingAddressId(addresses[0].addressId);
        setSelectedBillingAddressId(addresses[0].addressId);
        setUseSavedAddress(true);
      }
    } catch (error) {
      console.error('Failed to load user addresses:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserAddresses();
    }
  }, [user, loadUserAddresses]);

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

  const steps = ['Contact Info', 'Shipping', 'Payment', 'Review'];

  // Initialize cart fulfillment hook
  const {
    isLoading: fulfillmentLoading,
    availableFulfillmentMethods,
    recommendedFulfillmentMethod,
    error: fulfillmentError,
    showDeliveryAddress,
  } = useCartFulfillment();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to continue with checkout');
      navigate('/login?returnUrl=/checkout');
      return;
    }

    // Pre-fill user data
    if (user.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      }));
    }
  }, [user, navigate, loadUserAddresses]);

  // Calculate order totals when cart or shipping address changes
  useEffect(() => {
    if (!cart?.cartItems || !user) return;

    const calculateTotals = async () => {
      const orderTotal = cart.cartItems.reduce((total, item) => {
        return total + (item.itemPrice || 0) * item.quantity;
      }, 0);

      try {
        // Use checkout service to get accurate totals including tax
        if (cart.cartId && formData.zipCode) {
          const totals = await checkoutService.getCheckoutTotals(
            cart.cartId,
            selectedShippingAddressId || undefined,
            selectedBillingAddressId || undefined,
            user.userId ? parseInt(user.userId.toString()) : undefined,
            undefined // no guestId for users
          );
          setCheckoutTotals(totals);
        } else {
          // Fallback calculation without tax when no address available
          const calculatedShipping = fulfillmentMethod === 'pickup' ? 0 : 5.99;
          setCheckoutTotals({
            subtotal: orderTotal,
            taxAmount: 0, // Will be calculated when address is provided
            shippingCost: calculatedShipping,
            discountAmount: 0,
            total: orderTotal + calculatedShipping,
          });
        }
      } catch (error) {
        console.error('Failed to calculate checkout totals:', error);
        // Fallback to basic calculation
        const calculatedShipping = fulfillmentMethod === 'pickup' ? 0 : 5.99;
        setCheckoutTotals({
          subtotal: orderTotal,
          taxAmount: 0,
          shippingCost: calculatedShipping,
          discountAmount: 0,
          total: orderTotal + calculatedShipping,
        });
      }
    };

    calculateTotals();
  }, [
    formData.zipCode,
    cart,
    user,
    selectedShippingAddressId,
    selectedBillingAddressId,
    fulfillmentMethod,
  ]);

  // Load store addresses when fulfillment method is pickup
  useEffect(() => {
    const loadStoreAddresses = async () => {
      if (fulfillmentMethod === 'pickup' && cart?.cartItems?.length) {
        setLoadingStoreAddresses(true);
        try {
          const addresses = await StoreAddressService.getCartStoreAddresses(
            cart.cartItems
          );
          setStoreAddresses(addresses);
        } catch (error) {
          console.error('Failed to load store pickup addresses:', error);
          toast.error('Failed to load pickup locations');
        } finally {
          setLoadingStoreAddresses(false);
        }
      } else {
        setStoreAddresses(null);
      }
    };

    loadStoreAddresses();
  }, [fulfillmentMethod, cart?.cartItems]);

  // Set initial fulfillment method based on recommendations
  useEffect(() => {
    if (recommendedFulfillmentMethod && !fulfillmentLoading) {
      setFulfillmentMethod(recommendedFulfillmentMethod);
      setFormData((prev) => ({
        ...prev,
        fulfillmentMethod: recommendedFulfillmentMethod,
      }));
    }
  }, [recommendedFulfillmentMethod, fulfillmentLoading]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));

    // Auto-fill billing address when same as shipping is checked
    if (field === 'sameAsShipping' && checked) {
      setFormData((prev) => ({
        ...prev,
        billingFirstName: prev.firstName,
        billingLastName: prev.lastName,
        billingAddress: prev.address,
        billingCity: prev.city,
        billingState: prev.state,
        billingZipCode: prev.zipCode,
        billingCountry: prev.country,
      }));
    }
  };

  const handleAddressSelection = (
    addressId: number,
    addressType: 'shipping' | 'billing'
  ) => {
    const selectedAddress = userAddresses.find(
      (addr) => addr.addressId === addressId
    );
    if (!selectedAddress) return;

    if (addressType === 'shipping') {
      setSelectedShippingAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        address: selectedAddress.streetAddress,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country,
      }));
    } else {
      setSelectedBillingAddressId(addressId);
      setFormData((prev) => ({
        ...prev,
        billingFirstName: selectedAddress.firstName,
        billingLastName: selectedAddress.lastName,
        billingAddress: selectedAddress.streetAddress,
        billingCity: selectedAddress.city,
        billingState: selectedAddress.state,
        billingZipCode: selectedAddress.zipCode,
        billingCountry: selectedAddress.country,
      }));
    }
  };

  const handleSetDefaultShippingAddress = async (addressId: number) => {
    if (!user) return;

    try {
      await userAddressService.setDefaultShippingAddress(
        parseInt(user.userId),
        addressId
      );

      // Update local state to reflect the new default shipping address
      const updatedAddresses = userAddresses.map((addr) => ({
        ...addr,
        isPrimary: addr.addressId === addressId,
      }));
      setUserAddresses(updatedAddresses);

      toast.success('Default shipping address updated');
    } catch (error) {
      console.error('Failed to set default shipping address:', error);
      toast.error('Failed to update default shipping address');
    }
  };

  const handleSetDefaultBillingAddress = async (addressId: number) => {
    if (!user) return;

    try {
      await userAddressService.setDefaultBillingAddress(
        parseInt(user.userId),
        addressId
      );

      toast.success('Default billing address updated');
    } catch (error) {
      console.error('Failed to set default billing address:', error);
      toast.error('Failed to update default billing address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!user || !cart) return;

    // Validate cart state
    if (!cart.cartItems || cart.cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    // Clean card number by removing spaces and validate basic format
    const cleanedCardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      toast.error('Please enter a valid card number (13-19 digits)');
      setIsProcessing(false);
      return;
    }

    // Validate expiry date format
    const expiryParts = formData.expiryDate.split('/');
    if (expiryParts.length !== 2) {
      toast.error('Please enter expiry date in MM/YYYY format');
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
      // Normalize country codes
      const normalizedShippingCountry = normalizeCountry(formData.country);
      const normalizedBillingCountry = formData.sameAsShipping
        ? normalizedShippingCountry
        : normalizeCountry(formData.billingCountry);

      console.log('Normalized countries:', {
        shipping: normalizedShippingCountry,
        billing: normalizedBillingCountry,
      });

      // Use existing addresses or create new ones
      let shippingAddressId: number | undefined;
      let billingAddressId: number | undefined;

      if (useSavedAddress && selectedShippingAddressId) {
        // Use existing address for shipping
        shippingAddressId = selectedShippingAddressId;
      } else if (saveShippingAddress) {
        // Create new shipping address and save to user profile
        const shippingAddressData = {
          addressType: 'shipping' as const,
          streetAddress: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: normalizedShippingCountry,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          isPrimary: userAddresses.length === 0, // First address becomes primary
        };

        const shippingAddressResult = await userAddressService.createAddress(
          parseInt(user.userId),
          shippingAddressData
        );
        shippingAddressId = shippingAddressResult.addressId;

        // If user wants to set this as default shipping address
        if (formData.setAsDefaultShipping) {
          await userAddressService.setDefaultShippingAddress(
            parseInt(user.userId),
            shippingAddressResult.addressId
          );
        }
      }

      if (formData.sameAsShipping) {
        // Use the same address for billing
        billingAddressId = shippingAddressId;
      } else if (useSavedAddress && selectedBillingAddressId) {
        // Use existing address for billing
        billingAddressId = selectedBillingAddressId;
      } else if (saveBillingAddress) {
        // Create separate billing address
        const billingAddressData = {
          addressType: 'billing' as const,
          streetAddress: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: normalizedBillingCountry,
          firstName: formData.billingFirstName,
          lastName: formData.billingLastName,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          isPrimary: false, // Billing address is not primary
        };

        const billingAddressResult = await userAddressService.createAddress(
          parseInt(user.userId),
          billingAddressData
        );
        billingAddressId = billingAddressResult.addressId;

        // If user wants to set this as default billing address
        if (formData.setAsDefaultBilling) {
          await userAddressService.setDefaultBillingAddress(
            parseInt(user.userId),
            billingAddressResult.addressId
          );
        }
      }

      // Prepare checkout request
      const checkoutRequest: CheckoutRequest = {
        userId: parseInt(user.userId),
        cartId: cart.cartId || Math.floor(Math.random() * 10000),
        shippingAddressId,
        billingAddressId,
        paymentMethod: 'credit_card',
        fulfillmentMethod: 'delivery',
        customerNote: '',
        isTaxExempt: false,
        // Include address details if not using saved addresses
        shippingAddress: shippingAddressId
          ? undefined
          : {
              streetAddress: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: normalizedShippingCountry,
              firstName: formData.firstName,
              lastName: formData.lastName,
            },
        billingAddress:
          billingAddressId || formData.sameAsShipping
            ? undefined
            : {
                streetAddress: formData.billingAddress,
                city: formData.billingCity,
                state: formData.billingState,
                zipCode: formData.billingZipCode,
                country: normalizedBillingCountry,
                firstName: formData.billingFirstName,
                lastName: formData.billingLastName,
              },
        paymentDetails: {
          cardNumber: cleanedCardNumber,
          expiryMonth: expiryMonth,
          expiryYear: fullExpiryYear,
          cvv: formData.cvv,
          cardholderName: formData.nameOnCard,
          customerEmail: formData.email,
          customerPhone: formData.phone,
        },
        deliveryInstructions: '',
      };

      // Process checkout
      const result = await checkoutService.processCheckout(checkoutRequest);

      toast.success('Order placed successfully!');
      console.log('User checkout completed:', result);

      // Navigate to order confirmation
      navigate('/order-confirmation', {
        state: {
          orderId:
            (result as { orderId?: number })?.orderId ||
            Math.floor(Math.random() * 1000000),
          orderNumber:
            (result as { orderNumber?: string })?.orderNumber ||
            `ORD-${Date.now()}`,
        },
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Unable to process checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Contact Info
        return !!formData.email && !!formData.phone;

      case 1: // Shipping
        // For pickup fulfillment, no address needed (user info already pre-filled)
        if (fulfillmentMethod === 'pickup') {
          return true;
        }

        // For delivery fulfillment, check address selection
        // When using saved addresses, check if a shipping address is selected
        if (useSavedAddress && userAddresses.length > 0) {
          return selectedShippingAddressId !== null;
        }
        // When entering new address, check all required fields
        return (
          !!formData.firstName &&
          !!formData.lastName &&
          !!formData.address &&
          !!formData.city &&
          !!formData.state &&
          !!formData.zipCode &&
          !!formData.country
        );

      case 2: // Payment
        return (
          !!formData.cardNumber &&
          !!formData.expiryDate &&
          !!formData.cvv &&
          !!formData.nameOnCard
        );

      case 3: // Review
        return true;

      default:
        return false;
    }
  };

  const getStepValidationMessage = (step: number): string => {
    switch (step) {
      case 0: // Contact Info
        if (!formData.email) return 'Email is required';
        if (!formData.phone) return 'Phone number is required';
        return 'Contact information incomplete';

      case 1: // Shipping
        // For pickup fulfillment, validation passes
        if (fulfillmentMethod === 'pickup') {
          return '';
        }

        // For delivery, check address fields
        if (useSavedAddress && userAddresses.length > 0) {
          if (selectedShippingAddressId === null) {
            return 'Please select a shipping address';
          }
          return 'Shipping address not selected';
        } else {
          const missingFields = [];
          if (!formData.firstName) missingFields.push('First Name');
          if (!formData.lastName) missingFields.push('Last Name');
          if (!formData.address) missingFields.push('Address');
          if (!formData.city) missingFields.push('City');
          if (!formData.state) missingFields.push('State');
          if (!formData.zipCode) missingFields.push('ZIP Code');
          if (!formData.country) missingFields.push('Country');
          return missingFields.length > 0
            ? `Missing: ${missingFields.join(', ')}`
            : 'Shipping address incomplete';
        }

      case 2: {
        // Payment
        const missingPaymentFields = [];
        if (!formData.cardNumber) missingPaymentFields.push('Card Number');
        if (!formData.expiryDate) missingPaymentFields.push('Expiry Date');
        if (!formData.cvv) missingPaymentFields.push('CVV');
        if (!formData.nameOnCard) missingPaymentFields.push('Name on Card');
        return `Missing: ${missingPaymentFields.join(', ')}`;
      }

      default:
        return 'Step validation failed';
    }
  };

  const renderContactStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Contact Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Email Address'
            type='email'
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Phone Number'
            type='tel'
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderShippingStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Shipping & Fulfillment
      </Typography>

      {/* Fulfillment Method Selection */}
      {availableFulfillmentMethods.length > 0 ? (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'grey.50' }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            How would you like to receive your order?
          </Typography>

          {fulfillmentLoading ? (
            <Typography variant='body2' color='text.secondary'>
              Loading fulfillment options...
            </Typography>
          ) : (
            <FormControl component='fieldset'>
              <RadioGroup
                value={fulfillmentMethod}
                onChange={(e) => {
                  setFulfillmentMethod(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    fulfillmentMethod: e.target.value,
                  }));
                }}
              >
                {availableFulfillmentMethods.includes('delivery') && (
                  <FormControlLabel
                    value='delivery'
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1' fontWeight={500}>
                          Delivery
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Items will be delivered to your address
                        </Typography>
                      </Box>
                    }
                  />
                )}
                {availableFulfillmentMethods.includes('pickup') && (
                  <FormControlLabel
                    value='pickup'
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant='body1' fontWeight={500}>
                          Store Pickup
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          Pick up items directly from the store
                        </Typography>
                      </Box>
                    }
                  />
                )}
              </RadioGroup>
            </FormControl>
          )}

          {fulfillmentMethod === 'pickup' && (
            <Alert severity='info' sx={{ mt: 2 }}>
              <Typography variant='body2'>
                You'll receive pickup instructions after your order is
                confirmed.
              </Typography>
            </Alert>
          )}
        </Paper>
      ) : !fulfillmentLoading && !fulfillmentError ? (
        <Alert severity='warning' sx={{ mb: 3 }}>
          <Typography variant='body1' gutterBottom>
            No fulfillment options available
          </Typography>
          <Typography variant='body2'>
            The stores in your cart don't have any common fulfillment methods.
            This might be because stores have different delivery/pickup
            capabilities. Please try removing items or contact the stores
            directly.
          </Typography>
        </Alert>
      ) : null}

      {/* Address Section - Only show for delivery */}
      {showDeliveryAddress(fulfillmentMethod) && (
        <>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Shipping Address
          </Typography>

          {/* Address Selection */}
          {userAddresses.length > 0 && (
            <FormControl component='fieldset' sx={{ mb: 3 }}>
              <FormLabel component='legend'>Choose Address</FormLabel>
              <RadioGroup
                value={useSavedAddress ? 'saved' : 'new'}
                onChange={(e) => setUseSavedAddress(e.target.value === 'saved')}
              >
                <FormControlLabel
                  value='saved'
                  control={<Radio />}
                  label='Use saved address'
                />
                <FormControlLabel
                  value='new'
                  control={<Radio />}
                  label='Use new address'
                />
              </RadioGroup>
            </FormControl>
          )}

          {useSavedAddress && userAddresses.length > 0 ? (
            <Box>
              <Typography variant='subtitle1' gutterBottom>
                Select Shipping Address
              </Typography>
              {userAddresses.map((address) => (
                <Card
                  key={address.addressId}
                  sx={{
                    p: 2,
                    mb: 2,
                    border:
                      selectedShippingAddressId === address.addressId ? 2 : 1,
                    borderColor:
                      selectedShippingAddressId === address.addressId
                        ? 'primary.main'
                        : 'grey.300',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddressSelection(address.addressId, 'shipping');
                    // Ensure useSavedAddress is true when clicking an address card
                    if (!useSavedAddress) {
                      setUseSavedAddress(true);
                    }
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 600 }}
                        >
                          {address.firstName} {address.lastName}
                        </Typography>
                        <Typography variant='body2'>
                          {address.streetAddress}
                        </Typography>
                        <Typography variant='body2'>
                          {address.city}, {address.state} {address.zipCode}
                        </Typography>
                        <Typography variant='body2'>
                          {address.country}
                        </Typography>
                        {address.addressType === 'shipping' ||
                        address.addressType === 'both' ? (
                          <Typography variant='caption' color='primary'>
                            Shipping Address
                          </Typography>
                        ) : (
                          <Typography variant='caption' color='secondary'>
                            Billing Address
                          </Typography>
                        )}
                      </Box>
                      {(address.addressType === 'shipping' ||
                        address.addressType === 'both') && (
                        <Button
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefaultShippingAddress(address.addressId);
                          }}
                        >
                          Set as Default Shipping
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Street Address'
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='City'
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='State'
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='ZIP Code'
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Country'
                  placeholder='United States'
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveShippingAddress}
                      onChange={(e) => setSaveShippingAddress(e.target.checked)}
                    />
                  }
                  label='Save this shipping address to my profile'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.setAsDefaultShipping}
                      onChange={(e) =>
                        handleCheckboxChange(
                          'setAsDefaultShipping',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label='Set as my default shipping address'
                />
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Billing Address Section - Always show for payment processing */}
      <Divider sx={{ my: 4 }} />
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Billing Address
      </Typography>

      {/* Only show "Same as shipping" option for delivery */}
      {fulfillmentMethod === 'delivery' && (
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.sameAsShipping}
              onChange={(e) =>
                handleCheckboxChange('sameAsShipping', e.target.checked)
              }
            />
          }
          label='Same as shipping address'
        />
      )}

      {/* Show billing form when: pickup (always) or delivery (when not same as shipping) */}
      {(fulfillmentMethod === 'pickup' || !formData.sameAsShipping) && (
        <Box>
          {useSavedAddress && userAddresses.length > 0 ? (
            <Box>
              <Typography variant='subtitle1' gutterBottom>
                Select Billing Address
              </Typography>
              {userAddresses.map((address) => (
                <Card
                  key={address.addressId}
                  sx={{
                    p: 2,
                    mb: 2,
                    border:
                      selectedBillingAddressId === address.addressId ? 2 : 1,
                    borderColor:
                      selectedBillingAddressId === address.addressId
                        ? 'primary.main'
                        : 'grey.300',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    handleAddressSelection(address.addressId, 'billing');
                    // Ensure useSavedAddress is true when clicking an address card
                    if (!useSavedAddress) {
                      setUseSavedAddress(true);
                    }
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 600 }}
                        >
                          {address.firstName} {address.lastName}
                        </Typography>
                        <Typography variant='body2'>
                          {address.streetAddress}
                        </Typography>
                        <Typography variant='body2'>
                          {address.city}, {address.state} {address.zipCode}
                        </Typography>
                        <Typography variant='body2'>
                          {address.country}
                        </Typography>
                      </Box>
                      {(address.addressType === 'billing' ||
                        address.addressType === 'both') && (
                        <Button
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefaultBillingAddress(address.addressId);
                          }}
                        >
                          Set as Default Billing
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Billing First Name'
                  value={formData.billingFirstName}
                  onChange={(e) =>
                    handleInputChange('billingFirstName', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Billing Last Name'
                  value={formData.billingLastName}
                  onChange={(e) =>
                    handleInputChange('billingLastName', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Billing Address'
                  value={formData.billingAddress}
                  onChange={(e) =>
                    handleInputChange('billingAddress', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Billing City'
                  value={formData.billingCity}
                  onChange={(e) =>
                    handleInputChange('billingCity', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='Billing State'
                  value={formData.billingState}
                  onChange={(e) =>
                    handleInputChange('billingState', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label='Billing ZIP Code'
                  value={formData.billingZipCode}
                  onChange={(e) =>
                    handleInputChange('billingZipCode', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Billing Country'
                  placeholder='United States'
                  value={formData.billingCountry}
                  onChange={(e) =>
                    handleInputChange('billingCountry', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveBillingAddress}
                      onChange={(e) => setSaveBillingAddress(e.target.checked)}
                    />
                  }
                  label='Save this billing address to my profile'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.setAsDefaultBilling}
                      onChange={(e) =>
                        handleCheckboxChange(
                          'setAsDefaultBilling',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label='Set as my default billing address'
                />
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Payment Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Name on Card'
            value={formData.nameOnCard}
            onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label='Card Number'
            placeholder='1234 5678 9012 3456'
            value={formData.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Expiry Date'
            placeholder='MM/YY'
            value={formData.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='CVV'
            placeholder='123'
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Review Your Order
      </Typography>

      {/* Order Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Order Summary
          </Typography>
          {cart?.cartItems?.map((item) => (
            <Box
              key={item.cartItemId}
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant='body2'>
                {item.itemName} x {item.quantity}
              </Typography>
              <Typography variant='body2'>
                ${((item.itemPrice || 0) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal</Typography>
            <Typography>${checkoutTotals.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax</Typography>
            <Typography>${checkoutTotals.taxAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Shipping</Typography>
            <Typography>${checkoutTotals.shippingCost.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h6'>Total</Typography>
            <Typography variant='h6'>
              ${checkoutTotals.total.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Shipping/Pickup Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            {fulfillmentMethod === 'pickup'
              ? 'Pickup Location'
              : 'Shipping Information'}
          </Typography>
          {fulfillmentMethod === 'pickup' ? (
            // Show store pickup addresses
            <>
              {loadingStoreAddresses ? (
                <Typography variant='body2' color='text.secondary'>
                  Loading pickup locations...
                </Typography>
              ) : storeAddresses && storeAddresses.hasPickupAddresses ? (
                <>
                  {Array.from(storeAddresses.storePickupInfo.values()).map(
                    (storeInfo) => (
                      <Box key={storeInfo.storeId} sx={{ mb: 2 }}>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {storeInfo.storeName || `Store #${storeInfo.storeId}`}
                        </Typography>
                        {storeInfo.primaryPickupAddress ? (
                          <Typography variant='body2'>
                            {storeInfo.primaryPickupAddress.locationName && (
                              <>
                                {storeInfo.primaryPickupAddress.locationName}
                                <br />
                              </>
                            )}
                            {storeInfo.primaryPickupAddress.streetAddress}
                            <br />
                            {storeInfo.primaryPickupAddress.city},{' '}
                            {storeInfo.primaryPickupAddress.state}{' '}
                            {storeInfo.primaryPickupAddress.zipCode}
                            {storeInfo.primaryPickupAddress.contactPhone && (
                              <>
                                <br />
                                Phone:{' '}
                                {storeInfo.primaryPickupAddress.contactPhone}
                              </>
                            )}
                          </Typography>
                        ) : (
                          <Typography variant='body2' color='error'>
                            No pickup address available
                          </Typography>
                        )}
                      </Box>
                    )
                  )}
                </>
              ) : (
                <Alert severity='warning'>
                  <Typography variant='body2'>
                    Pickup addresses not available. Please contact the stores
                    directly.
                  </Typography>
                </Alert>
              )}
            </>
          ) : (
            // Show customer shipping address for delivery
            <>
              <Typography>
                {formData.firstName} {formData.lastName}
              </Typography>
              <Typography>{formData.address}</Typography>
              <Typography>
                {formData.city}, {formData.state} {formData.zipCode}
              </Typography>
              <Typography>{formData.country}</Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Payment Information
          </Typography>
          <Typography>
            Card ending in{' '}
            {formData.cardNumber ? formData.cardNumber.slice(-4) : ''}
          </Typography>
          <Typography>Expires: {formData.expiryDate}</Typography>
        </CardContent>
      </Card>
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
        return null;
    }
  };

  if (!user) {
    return (
      <>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Typography variant='h4' component='h1' gutterBottom>
            Checkout
          </Typography>
          <Alert severity='error'>
            Please sign in to continue with checkout.
          </Alert>
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
            Checkout
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Complete your purchase
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Paper sx={{ p: 4 }}>
          {getStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
                disabled={isProcessing || !isStepValid(activeStep)}
                size='large'
                sx={{ position: 'relative' }}
                title={
                  !isStepValid(activeStep) && !isProcessing
                    ? getStepValidationMessage(activeStep)
                    : ''
                }
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
              </Button>
            ) : (
              <Button
                variant='contained'
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
                sx={{ position: 'relative' }}
                title={
                  !isStepValid(activeStep)
                    ? getStepValidationMessage(activeStep)
                    : ''
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default UserCheckoutPage;
