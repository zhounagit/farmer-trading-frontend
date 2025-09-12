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
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Agriculture as FarmIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import OpenShopApiService from '../../../services/open-shop.api';
import toast from 'react-hot-toast';

type SellingMethod = 'on-farm-pickup' | 'local-delivery' | 'farmers-market';

const LocationLogisticsStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateBusinessAddress = () => {
    const newErrors: { [key: string]: string } = {};
    const address = formState.locationLogistics.businessAddress;

    if (!address.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    }
    if (!address.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required';
    }
    if (!address.streetLine.trim()) {
      newErrors.streetLine = 'Street address is required';
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
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        farmgateAddress: {
          ...formState.locationLogistics.farmgateAddress,
          [field]: value,
        },
      },
    });
  };

  const handlePickupPointAddressChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        pickupPointAddress: {
          ...formState.locationLogistics.pickupPointAddress,
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
              streetLine: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'US',
            },
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
      // 1. Create business address
      await OpenShopApiService.createStoreAddress(formState.storeId, {
        addressType: 'business',
        locationName: formState.locationLogistics.businessAddress.locationName,
        contactPhone: formState.locationLogistics.businessAddress.contactPhone,
        streetLine: formState.locationLogistics.businessAddress.streetLine,
        city: formState.locationLogistics.businessAddress.city,
        state: formState.locationLogistics.businessAddress.state,
        zipCode: formState.locationLogistics.businessAddress.zipCode,
        country: formState.locationLogistics.businessAddress.country,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        isActive: true,
      });

      // 2. Handle conditional addresses based on selling methods
      const sellingMethods = formState.locationLogistics.sellingMethods;

      // Create farmgate address if on-farm pickup is selected
      if (sellingMethods.includes('on-farm-pickup')) {
        if (!formState.locationLogistics.farmgateSameAsBusinessAddress) {
          await OpenShopApiService.createStoreAddress(formState.storeId, {
            addressType: 'farmgate',
            locationName:
              formState.locationLogistics.farmgateAddress?.locationName || '',
            contactPhone:
              formState.locationLogistics.farmgateAddress?.contactPhone || '',
            streetLine:
              formState.locationLogistics.farmgateAddress?.streetLine || '',
            city: formState.locationLogistics.farmgateAddress?.city || '',
            state: formState.locationLogistics.farmgateAddress?.state || '',
            zipCode: formState.locationLogistics.farmgateAddress?.zipCode || '',
            country:
              formState.locationLogistics.farmgateAddress?.country || 'US',
            isPrimary: false,
            createdAt: new Date().toISOString(),
            isActive: true,
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
          addressType: 'pickup',
          locationName:
            formState.locationLogistics.pickupPointAddress?.locationName || '',
          contactPhone:
            formState.locationLogistics.pickupPointAddress?.contactPhone || '',
          streetLine:
            formState.locationLogistics.pickupPointAddress?.streetLine || '',
          city: formState.locationLogistics.pickupPointAddress?.city || '',
          state: formState.locationLogistics.pickupPointAddress?.state || '',
          zipCode:
            formState.locationLogistics.pickupPointAddress?.zipCode || '',
          country:
            formState.locationLogistics.pickupPointAddress?.country || 'US',
          isPrimary: false,
          createdAt: new Date().toISOString(),
          isActive: true,
        });
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

  return (
    <Box>
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
            label='Street Address'
            placeholder='e.g., 123 Farm Road'
            value={formState.locationLogistics.businessAddress.streetLine}
            onChange={(e) =>
              handleBusinessAddressChange('streetLine', e.target.value)
            }
            error={!!errors.streetLine}
            helperText={errors.streetLine}
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
                  formState.locationLogistics.farmgateAddress?.streetLine || ''
                }
                onChange={(e) =>
                  handleFarmgateAddressChange('streetLine', e.target.value)
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

      {/* Delivery Radius - appears when Local Delivery is selected */}
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
                formState.locationLogistics.pickupPointAddress?.streetLine || ''
              }
              onChange={(e) =>
                handlePickupPointAddressChange('streetLine', e.target.value)
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
          }}
        >
          Continue to Policies
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default LocationLogisticsStep;
