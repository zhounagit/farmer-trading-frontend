import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  InputAdornment,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Alert,
  Collapse,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Agriculture as FarmIcon,
  LocalShipping,
  Schedule as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  type StepProps,
  type ShippingServiceFormData,
  DAYS_OF_WEEK,
} from '../../../types/open-shop.types';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../../services/open-shop.api';
import toast from 'react-hot-toast';

type SellingMethod =
  | 'on-farm-pickup'
  | 'local-delivery'
  | 'farmers-market'
  | 'processor-pickup';

const LocationLogisticsStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  // Debug: Log what formState this step receives
  console.log('🚚 LocationLogisticsStep - Received formState:', {
    hasLocationLogistics: !!formState.locationLogistics,
    sellingMethods: formState.locationLogistics?.sellingMethods,
    sellingMethodsLength:
      formState.locationLogistics?.sellingMethods?.length || 0,
    deliveryRadiusMi: formState.locationLogistics?.deliveryRadiusMi,
    businessAddress: formState.locationLogistics?.businessAddress,
    enableProcessorNotifications:
      formState.locationLogistics?.enableProcessorNotifications,
    enableCustomerProcessorContact:
      formState.locationLogistics?.enableCustomerProcessorContact,
    processorInstructions: formState.locationLogistics?.processorInstructions,
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is a producer store that needs processor logistics
  const isProducerStore =
    formState.storeBasics?.setupFlow?.derivedStoreType === 'producer';
  const hasLiveAnimalsCategory =
    formState.storeBasics?.categories?.includes('Live Animals');
  const needsProcessorLogistics = isProducerStore && hasLiveAnimalsCategory;

  // Helper function to format phone numbers for database constraint
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Database constraint: ^\+?[0-9]{10,15}$
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      // Add +1 for US numbers if it's exactly 10 digits
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      }
      // Add + prefix for international numbers (11+ digits)
      if (digitsOnly.length >= 11) {
        return `+${digitsOnly}`;
      }
    }

    // If it doesn't meet the constraint, return as-is and let backend validate
    console.warn('Phone number may not meet database constraint:', phone);
    return digitsOnly;
  };

  const validateBusinessAddress = () => {
    const newErrors: { [key: string]: string } = {};
    const address = formState.locationLogistics.businessAddress;

    if (!address.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    }
    if (!address.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }
    if (!address.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    }
    if (!address.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!address.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!address.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    return newErrors;
  };

  const validateSellingMethods = () => {
    const newErrors: { [key: string]: string } = {};

    if (formState.locationLogistics.sellingMethods.length === 0) {
      newErrors.sellingMethods = 'Please select at least one selling method';
    }

    return newErrors;
  };

  const validateForm = () => {
    const businessErrors = validateBusinessAddress();
    const sellingErrors = validateSellingMethods();

    const allErrors = { ...businessErrors, ...sellingErrors };
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleBusinessAddressChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        businessAddress: {
          ...formState.locationLogistics.businessAddress,
          [field]: value,
        },
      },
    });

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSellingMethodChange = (
    method: SellingMethod,
    checked: boolean
  ) => {
    const currentMethods = formState.locationLogistics.sellingMethods;
    const newMethods = checked
      ? [...currentMethods, method]
      : currentMethods.filter((m) => m !== method);

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        sellingMethods: newMethods,
      },
    });

    if (errors.sellingMethods) {
      setErrors((prev) => ({
        ...prev,
        sellingMethods: '',
      }));
    }
  };

  const handleFarmgateAddressChange = (field: string, value: string) => {
    const currentFarmgateAddress = formState.locationLogistics
      .farmgateAddress || {
      locationName: '',
      contactPhone: '',
      contactEmail: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    };

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        farmgateAddress: {
          ...currentFarmgateAddress,
          [field]: value,
        },
      },
    });
  };

  const handlePickupPointAddressChange = (field: string, value: string) => {
    const currentPickupAddress = formState.locationLogistics
      .pickupPointAddress || {
      locationName: '',
      contactPhone: '',
      contactEmail: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    };

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        pickupPointAddress: {
          ...currentPickupAddress,
          [field]: value,
        },
      },
    });
  };

  const handleDeliveryRadiusChange = (value: number) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        deliveryRadiusMi: value,
      },
    });
  };

  const handleSameAsBusinessAddress = (checked: boolean) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        farmgateSameAsBusinessAddress: checked,
        farmgateAddress: checked
          ? { ...formState.locationLogistics.businessAddress }
          : {
              locationName: '',
              contactPhone: '',
              contactEmail: '',
              streetAddress: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
            },
      },
    });
  };

  const handleShippingServiceToggle = (enabled: boolean) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        enablePlatformShipping: enabled,
        shippingServices: enabled
          ? [
              {
                serviceId: 0,
                serviceType: 'standard',
                serviceName: 'Standard Shipping',
                description: 'Regular delivery service (1-3 days)',
                baseCost: 5.99,
                costPerMile: 0.5,
                maxRadiusMiles: 25,
                estimatedDeliveryHours: 48,
                minimumOrderValue: 0,
                maxWeightLbs: 50,
                isEnabled: true,
                platformFeeRate: 0.05,
                platformFeeFixed: 1.0,
                availableDays: [1, 2, 3, 4, 5], // Monday-Friday
              },
            ]
          : [],
      },
    });
  };

  const handleShippingServiceUpdate = (
    index: number,
    updates: Partial<ShippingServiceFormData>
  ) => {
    const currentServices = formState.locationLogistics.shippingServices || [];
    const updatedServices = [...currentServices];
    updatedServices[index] = { ...updatedServices[index], ...updates };

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        shippingServices: updatedServices,
      },
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    console.log('=== STEP 2 DEBUG ===');
    console.log('Full formState:', JSON.stringify(formState, null, 2));
    console.log('formState.storeId:', formState.storeId);
    console.log('typeof formState.storeId:', typeof formState.storeId);
    console.log('formState.storeId truthy?', !!formState.storeId);

    if (!formState.storeId) {
      console.error('Store ID missing in Step 2!');
      toast.error('Store ID not found. Please go back to Step 1.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== Creating Business Address ===');
      const businessAddressData = {
        AddressType: 'business',
        LocationName:
          formState.locationLogistics.businessAddress.locationName ||
          'Business Address',
        ContactPhone: formatPhoneNumber(
          formState.locationLogistics.businessAddress.contactPhone
        ),
        ContactEmail: formState.locationLogistics.businessAddress.contactEmail,
        StreetAddress:
          formState.locationLogistics.businessAddress.streetAddress,
        City: formState.locationLogistics.businessAddress.city,
        State: formState.locationLogistics.businessAddress.state,
        ZipCode: formState.locationLogistics.businessAddress.zipCode,
        Country: formState.locationLogistics.businessAddress.country || 'US',
        IsPrimary: true,
        IsActive: true,
      };

      console.log(
        'Business address payload:',
        JSON.stringify(businessAddressData, null, 2)
      );

      // 1. Create business address
      await OpenShopApiService.createStoreAddress(
        formState.storeId,
        businessAddressData
      );

      // 2. Handle conditional addresses based on selling methods
      const sellingMethods = formState.locationLogistics.sellingMethods;

      // Create farmgate address if on-farm pickup is selected
      if (sellingMethods.includes('on-farm-pickup')) {
        if (!formState.locationLogistics.farmgateSameAsBusinessAddress) {
          await OpenShopApiService.createStoreAddress(formState.storeId, {
            AddressType: 'farm_location',
            LocationName:
              formState.locationLogistics.farmgateAddress?.locationName ||
              'Farm Location',
            ContactPhone: formatPhoneNumber(
              formState.locationLogistics.farmgateAddress?.contactPhone || ''
            ),
            StreetAddress:
              formState.locationLogistics.farmgateAddress?.streetAddress || '',
            City: formState.locationLogistics.farmgateAddress?.city || '',
            State: formState.locationLogistics.farmgateAddress?.state || '',
            ZipCode: formState.locationLogistics.farmgateAddress?.zipCode || '',
            Country:
              formState.locationLogistics.farmgateAddress?.country || 'US',
            IsPrimary: false,
            IsActive: true,
          });
        }
      }

      // Set delivery distance if local delivery is selected
      if (sellingMethods.includes('local-delivery')) {
        const deliveryRadius =
          formState.locationLogistics.deliveryRadiusMi || 5;
        await OpenShopApiService.setDeliveryDistance(
          formState.storeId,
          deliveryRadius
        );
      }

      // Create pickup point address if farmers market is selected
      if (sellingMethods.includes('farmers-market')) {
        await OpenShopApiService.createStoreAddress(formState.storeId, {
          AddressType: 'pickup_location',
          LocationName:
            formState.locationLogistics.pickupPointAddress?.locationName ||
            'Pickup Location',
          ContactPhone: formatPhoneNumber(
            formState.locationLogistics.pickupPointAddress?.contactPhone || ''
          ),
          StreetAddress:
            formState.locationLogistics.pickupPointAddress?.streetAddress || '',
          City: formState.locationLogistics.pickupPointAddress?.city || '',
          State: formState.locationLogistics.pickupPointAddress?.state || '',
          ZipCode:
            formState.locationLogistics.pickupPointAddress?.zipCode || '',
          Country:
            formState.locationLogistics.pickupPointAddress?.country || 'US',
          IsPrimary: false,
          IsActive: true,
        });
      }

      // Handle processor pickup logistics if selected
      if (
        sellingMethods.includes('processor-pickup') &&
        needsProcessorLogistics
      ) {
        // Store processor logistics preferences in store setup data
        const processorLogisticsData = {
          enableProcessorNotifications:
            formState.locationLogistics.enableProcessorNotifications || false,
          enableCustomerProcessorContact:
            formState.locationLogistics.enableCustomerProcessorContact || false,
          processorInstructions:
            formState.locationLogistics.processorInstructions || '',
          processorPickupEnabled: true,
        };

        // Update store setup data with processor logistics
        try {
          await OpenShopApiService.updateStoreSetupData(formState.storeId, {
            processorLogistics: processorLogisticsData,
            sellingMethods: formState.locationLogistics.sellingMethods,
          });
        } catch (processorError) {
          console.warn(
            'Failed to save processor logistics preferences:',
            processorError
          );
          // Don't fail the entire flow for this
        }
      }

      toast.success('Location and logistics saved successfully!');
      onNext();
    } catch (error: unknown) {
      console.error('Error saving location and logistics:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save location and logistics. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isOnFarmPickupSelected =
    formState.locationLogistics.sellingMethods.includes('on-farm-pickup');
  const isLocalDeliverySelected =
    formState.locationLogistics.sellingMethods.includes('local-delivery');
  const isFarmersMarketSelected =
    formState.locationLogistics.sellingMethods.includes('farmers-market');
  const isProcessorPickupSelected =
    formState.locationLogistics.sellingMethods.includes('processor-pickup');

  return (
    <Box component='form' noValidate>
      <Typography
        variant='h4'
        component='h2'
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        Location & Logistics
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Tell us where your business is located and how you'll serve customers.
      </Typography>

      {/* Business Address Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <BusinessIcon color='primary' />
          Business Address
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label='Location Name'
            placeholder='e.g., Green Valley Farm'
            value={formState.locationLogistics.businessAddress.locationName}
            onChange={(e) =>
              handleBusinessAddressChange('locationName', e.target.value)
            }
            error={!!errors.locationName}
            helperText={errors.locationName}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LocationIcon color='action' />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label='Contact Phone'
            placeholder='e.g., (555) 123-4567'
            value={formState.locationLogistics.businessAddress.contactPhone}
            onChange={(e) =>
              handleBusinessAddressChange('contactPhone', e.target.value)
            }
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <PhoneIcon color='action' />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label='Contact Email'
            placeholder='e.g., store@farm.com'
            value={formState.locationLogistics.businessAddress.contactEmail}
            onChange={(e) =>
              handleBusinessAddressChange('contactEmail', e.target.value)
            }
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
            fullWidth
            required
            type='email'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EmailIcon color='action' />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label='Street Address'
            placeholder='e.g., 123 Farm Road'
            value={formState.locationLogistics.businessAddress.streetAddress}
            onChange={(e) =>
              handleBusinessAddressChange('streetAddress', e.target.value)
            }
            error={!!errors.streetAddress}
            helperText={errors.streetAddress}
            fullWidth
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='City'
              value={formState.locationLogistics.businessAddress.city}
              onChange={(e) =>
                handleBusinessAddressChange('city', e.target.value)
              }
              error={!!errors.city}
              helperText={errors.city}
              required
              sx={{ flex: 1 }}
            />

            <TextField
              label='State'
              value={formState.locationLogistics.businessAddress.state}
              onChange={(e) =>
                handleBusinessAddressChange('state', e.target.value)
              }
              error={!!errors.state}
              helperText={errors.state}
              required
              sx={{ flex: 1 }}
            />

            <TextField
              label='ZIP Code'
              value={formState.locationLogistics.businessAddress.zipCode}
              onChange={(e) =>
                handleBusinessAddressChange('zipCode', e.target.value)
              }
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              required
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label='Country'
              value={
                formState.locationLogistics.businessAddress.country || 'US'
              }
              onChange={(e) =>
                handleBusinessAddressChange('country', e.target.value)
              }
              required
              fullWidth
              placeholder='US'
            />
          </Box>
        </Box>
      </Paper>

      {/* Selling Methods Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <StoreIcon color='primary' />
          How will customers get their orders?
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Select all that apply:
          {needsProcessorLogistics && (
            <>
              <br />
              <em>
                Note: Since you're selling live animals, customers can pick up
                processed meat from your processor partners.
              </em>
            </>
          )}
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOnFarmPickupSelected}
                onChange={(e) =>
                  handleSellingMethodChange('on-farm-pickup', e.target.checked)
                }
                color='primary'
              />
            }
            label='On-Farm Pickup (Customers come to me)'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isLocalDeliverySelected}
                onChange={(e) =>
                  handleSellingMethodChange('local-delivery', e.target.checked)
                }
                color='primary'
              />
            }
            label='Local Delivery (I deliver to customers)'
            sx={{ mb: 1 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isFarmersMarketSelected}
                onChange={(e) =>
                  handleSellingMethodChange('farmers-market', e.target.checked)
                }
                color='primary'
              />
            }
            label="I sell at a Farmers' Market or other pickup point"
          />

          {needsProcessorLogistics && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={isProcessorPickupSelected}
                  onChange={(e) =>
                    handleSellingMethodChange(
                      'processor-pickup',
                      e.target.checked
                    )
                  }
                  color='primary'
                />
              }
              label='Processor Pickup (Customers pick up processed products from my processor partners)'
              sx={{ mb: 1 }}
            />
          )}
        </FormGroup>

        {errors.sellingMethods && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {errors.sellingMethods}
          </Alert>
        )}
      </Paper>

      {/* Conditional Fields */}

      {/* Farmgate Address - appears when On-Farm Pickup is selected */}
      <Collapse in={isOnFarmPickupSelected}>
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FarmIcon color='primary' />
            Farmgate Address
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={
                  formState.locationLogistics.farmgateSameAsBusinessAddress ||
                  false
                }
                onChange={(e) => handleSameAsBusinessAddress(e.target.checked)}
                color='primary'
              />
            }
            label='Same as Business Address'
            sx={{ mb: 3 }}
          />

          <Collapse
            in={!formState.locationLogistics.farmgateSameAsBusinessAddress}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label='Farmgate Location Name'
                value={
                  formState.locationLogistics.farmgateAddress?.locationName ||
                  ''
                }
                onChange={(e) =>
                  handleFarmgateAddressChange('locationName', e.target.value)
                }
                fullWidth
              />
              <TextField
                label='Contact Phone'
                value={
                  formState.locationLogistics.farmgateAddress?.contactPhone ||
                  ''
                }
                onChange={(e) =>
                  handleFarmgateAddressChange('contactPhone', e.target.value)
                }
                fullWidth
              />
              <TextField
                label='Street Address'
                value={
                  formState.locationLogistics.farmgateAddress?.streetAddress ||
                  ''
                }
                onChange={(e) =>
                  handleFarmgateAddressChange('streetAddress', e.target.value)
                }
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label='City'
                  value={
                    formState.locationLogistics.farmgateAddress?.city || ''
                  }
                  onChange={(e) =>
                    handleFarmgateAddressChange('city', e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  label='State'
                  value={
                    formState.locationLogistics.farmgateAddress?.state || ''
                  }
                  onChange={(e) =>
                    handleFarmgateAddressChange('state', e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  label='ZIP Code'
                  value={
                    formState.locationLogistics.farmgateAddress?.zipCode || ''
                  }
                  onChange={(e) =>
                    handleFarmgateAddressChange('zipCode', e.target.value)
                  }
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>
          </Collapse>
        </Paper>
      </Collapse>

      {/* Processor Pickup Logistics - appears when Processor Pickup is selected for Producer stores */}
      <Collapse in={isProcessorPickupSelected && needsProcessorLogistics}>
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <BusinessIcon color='primary' />
            Processor Partnership Logistics
          </Typography>

          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='body2'>
              Configure how customers will interact with your processor
              partners. Customers will pick up processed meat directly from
              processor facilities, not from your farm location.
            </Typography>
          </Alert>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Your processor partnerships from the previous step will be used for
            customer pickup locations. The system will automatically provide
            customers with processor addresses and contact information when they
            place orders for live animals.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    formState.locationLogistics.enableProcessorNotifications ||
                    false
                  }
                  onChange={(e) =>
                    updateFormState({
                      locationLogistics: {
                        ...formState.locationLogistics,
                        enableProcessorNotifications: e.target.checked,
                      },
                    })
                  }
                  color='primary'
                />
              }
              label='Automatically notify processors when orders are placed'
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={
                    formState.locationLogistics
                      .enableCustomerProcessorContact || false
                  }
                  onChange={(e) =>
                    updateFormState({
                      locationLogistics: {
                        ...formState.locationLogistics,
                        enableCustomerProcessorContact: e.target.checked,
                      },
                    })
                  }
                  color='primary'
                />
              }
              label='Allow customers to contact processors directly for pickup coordination'
            />

            <TextField
              label='Special Instructions for Processor Partnerships'
              multiline
              rows={3}
              value={formState.locationLogistics.processorInstructions || ''}
              onChange={(e) =>
                updateFormState({
                  locationLogistics: {
                    ...formState.locationLogistics,
                    processorInstructions: e.target.value,
                  },
                })
              }
              placeholder='e.g., "Please call customer 24 hours before processing is complete", "Pickup available Tuesday-Saturday 8am-4pm"'
              fullWidth
              helperText='These instructions will be shared with your processor partners to ensure smooth customer pickup experience.'
            />
          </Box>
        </Paper>
      </Collapse>

      {/* Local Delivery - appears when Local Delivery is selected */}
      <Collapse in={isLocalDeliverySelected}>
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <DeliveryIcon color='primary' />
            Delivery Radius
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            I deliver within {formState.locationLogistics.deliveryRadiusMi || 5}{' '}
            miles of my farm.
          </Typography>

          <Slider
            value={formState.locationLogistics.deliveryRadiusMi || 5}
            onChange={(_, value) => handleDeliveryRadiusChange(value as number)}
            min={1}
            max={50}
            step={1}
            marks={[
              { value: 1, label: '1 mile' },
              { value: 10, label: '10 miles' },
              { value: 25, label: '25 miles' },
              { value: 50, label: '50 miles' },
            ]}
            valueLabelDisplay='auto'
            sx={{ mt: 2 }}
          />
        </Paper>
      </Collapse>

      {/* Platform Shipping Services - appears when Local Delivery is selected */}
      <Collapse in={isLocalDeliverySelected}>
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocalShipping color='primary' />
            Platform Shipping Services
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Let our platform handle shipping logistics for you. We'll manage
            delivery and charge a small service fee in addition to regular
            commission.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={
                  formState.locationLogistics.enablePlatformShipping || false
                }
                onChange={(e) => handleShippingServiceToggle(e.target.checked)}
                color='primary'
              />
            }
            label='Enable Platform Shipping Services'
            sx={{ mb: 3 }}
          />

          <Collapse in={formState.locationLogistics.enablePlatformShipping}>
            <Alert severity='info' sx={{ mb: 3 }}>
              Platform shipping includes a 5% service fee + $1.00 per shipment
              on top of regular store commission. This covers logistics
              management, customer support, and delivery tracking.
            </Alert>

            {formState.locationLogistics.shippingServices?.map(
              (service, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <CardContent>
                    <Typography
                      variant='h6'
                      sx={{
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <MoneyIcon color='primary' />
                      {service.serviceName}
                    </Typography>

                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          label='Base Cost ($)'
                          type='number'
                          value={service.baseCost}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              baseCost: parseFloat(e.target.value) || 0,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 120 }}
                        />

                        <TextField
                          label='Cost per Mile ($)'
                          type='number'
                          value={service.costPerMile}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              costPerMile: parseFloat(e.target.value) || 0,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 120 }}
                        />

                        <TextField
                          label='Max Radius (miles)'
                          type='number'
                          value={service.maxRadiusMiles || ''}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              maxRadiusMiles:
                                parseInt(e.target.value) || undefined,
                            })
                          }
                          sx={{ minWidth: 120 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                          label='Min Order Value ($)'
                          type='number'
                          value={service.minimumOrderValue}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              minimumOrderValue:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{ minWidth: 120 }}
                        />

                        <TextField
                          label='Max Weight (lbs)'
                          type='number'
                          value={service.maxWeightLbs || ''}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              maxWeightLbs:
                                parseFloat(e.target.value) || undefined,
                            })
                          }
                          sx={{ minWidth: 120 }}
                        />

                        <TextField
                          label='Delivery Hours'
                          type='number'
                          value={service.estimatedDeliveryHours}
                          onChange={(e) =>
                            handleShippingServiceUpdate(index, {
                              estimatedDeliveryHours:
                                parseInt(e.target.value) || 24,
                            })
                          }
                          sx={{ minWidth: 120 }}
                        />
                      </Box>

                      <TextField
                        label='Special Instructions'
                        multiline
                        rows={2}
                        value={service.specialInstructions || ''}
                        onChange={(e) =>
                          handleShippingServiceUpdate(index, {
                            specialInstructions: e.target.value,
                          })
                        }
                        placeholder='Any special handling requirements or delivery notes...'
                        fullWidth
                      />

                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <TimeIcon fontSize='small' />
                          Available Days
                        </Typography>
                        <FormGroup row>
                          {DAYS_OF_WEEK.map((day) => (
                            <FormControlLabel
                              key={day.value}
                              control={
                                <Checkbox
                                  size='small'
                                  checked={
                                    service.availableDays?.includes(
                                      day.value
                                    ) || false
                                  }
                                  onChange={(e) => {
                                    const currentDays =
                                      service.availableDays || [];
                                    const newDays = e.target.checked
                                      ? [...currentDays, day.value]
                                      : currentDays.filter(
                                          (d) => d !== day.value
                                        );
                                    handleShippingServiceUpdate(index, {
                                      availableDays: newDays,
                                    });
                                  }}
                                />
                              }
                              label={day.short}
                            />
                          ))}
                        </FormGroup>
                      </Box>

                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          mt: 1,
                          p: 2,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        Platform Fee: 5% of shipping cost + $1.00 per shipment =
                        ${(service.baseCost * 0.05 + 1.0).toFixed(2)} base fee
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )
            )}
          </Collapse>
        </Paper>
      </Collapse>

      {/* Pickup Point Address - appears when Farmers' Market is selected */}
      <Collapse in={isFarmersMarketSelected}>
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 600,
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <LocationIcon color='primary' />
            Pickup Point Address
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label='Pickup Point Name / Nickname'
              placeholder='e.g., Downtown Farmers Market'
              value={formState.locationLogistics.pickupPointNickname || ''}
              onChange={(e) =>
                updateFormState({
                  locationLogistics: {
                    ...formState.locationLogistics,
                    pickupPointNickname: e.target.value,
                  },
                })
              }
              fullWidth
            />
            <TextField
              label='Location Name'
              value={
                formState.locationLogistics.pickupPointAddress?.locationName ||
                ''
              }
              onChange={(e) =>
                handlePickupPointAddressChange('locationName', e.target.value)
              }
              fullWidth
            />
            <TextField
              label='Contact Phone'
              value={
                formState.locationLogistics.pickupPointAddress?.contactPhone ||
                ''
              }
              onChange={(e) =>
                handlePickupPointAddressChange('contactPhone', e.target.value)
              }
              fullWidth
            />
            <TextField
              label='Street Address'
              value={
                formState.locationLogistics.pickupPointAddress?.streetAddress ||
                ''
              }
              onChange={(e) =>
                handlePickupPointAddressChange('streetAddress', e.target.value)
              }
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='City'
                value={
                  formState.locationLogistics.pickupPointAddress?.city || ''
                }
                onChange={(e) =>
                  handlePickupPointAddressChange('city', e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label='State'
                value={
                  formState.locationLogistics.pickupPointAddress?.state || ''
                }
                onChange={(e) =>
                  handlePickupPointAddressChange('state', e.target.value)
                }
                sx={{ flex: 1 }}
              />
              <TextField
                label='ZIP Code'
                value={
                  formState.locationLogistics.pickupPointAddress?.zipCode || ''
                }
                onChange={(e) =>
                  handlePickupPointAddressChange('zipCode', e.target.value)
                }
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fill in all required fields.
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, order: { xs: 2, sm: 1 } }}>
          <LoadingButton
            variant='outlined'
            onClick={onPrevious}
            disabled={isLoading}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Back to Store Basics
          </LoadingButton>

          <Button
            variant='text'
            onClick={() => navigate(user?.hasStore ? '/dashboard' : '/')}
            sx={{
              textTransform: 'none',
              color: 'text.secondary',
              px: 2,
            }}
          >
            Save & Exit Later
          </Button>
        </Box>

        <LoadingButton
          variant='contained'
          onClick={handleSubmit}
          loading={isLoading}
          size='large'
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
            order: { xs: 1, sm: 2 },
          }}
        >
          Continue to Policies
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default LocationLogisticsStep;
