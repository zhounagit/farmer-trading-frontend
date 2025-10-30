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
  Alert,
  Collapse,
  Button,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../services/open-shop.types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StoreApiService from '../../services/storesApi';
import toast from 'react-hot-toast';
import type { AddressType } from '../../../../shared/types/store';
import type { SellingMethod } from '../../services/open-shop.types';

const LocationLogisticsStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is a producer store that needs processor logistics
  const isProducerStore =
    formState.storeBasics?.setupFlow?.derivedStoreType === 'producer';
  const hasLiveAnimalsCategory =
    formState.storeBasics?.categories?.includes('Live Animals');
  const needsProcessorLogistics = isProducerStore && hasLiveAnimalsCategory;

  // Determine if partnership step should be shown
  const shouldShowPartnershipStep = () => {
    const storeType = formState.storeBasics?.setupFlow?.derivedStoreType;
    return storeType === 'producer' || storeType === 'processor';
  };

  // Get the next step button text and description
  const getNextStepLabel = () => {
    return shouldShowPartnershipStep()
      ? 'Continue to Partnership'
      : 'Continue to Store Policies';
  };

  // Phone formatting for database constraint
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    const digitsOnly = phone.replace(/\D/g, '');

    // Database constraint likely expects digits only or E.164 format
    // Try digits only first: 5074581941
    return digitsOnly;
  };

  // Business Address Handlers
  const handleBusinessAddressChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        businessAddress: {
          ...formState.locationLogistics?.businessAddress,
          [field]: value,
        },
      },
    });
  };

  // Billing Address Handlers
  const handleBillingAddressChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        billingAddress: {
          ...formState.locationLogistics?.billingAddress,
          [field]: value,
        },
      },
    });
  };

  // Handle "Same as Business Address" checkbox
  const handleBillingSameAsBusinessChange = (checked: boolean) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        billingSameAsBusinessAddress: checked,
        // If checked, copy business address to billing address
        ...(checked && {
          billingAddress: formState.locationLogistics?.businessAddress,
        }),
      },
    });
  };

  // Selling Methods Handler
  const handleSellingMethodChange = (
    method: SellingMethod,
    checked: boolean
  ) => {
    const currentMethods = formState.locationLogistics?.sellingMethods || [];
    let newMethods: SellingMethod[];

    if (checked) {
      newMethods = [...currentMethods, method];
    } else {
      newMethods = currentMethods.filter((m) => m !== method);
    }

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        sellingMethods: newMethods,
      },
    });
  };

  // Local Delivery Handler
  const handleDeliveryRadiusChange = (value: number) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        deliveryRadiusMi: value,
      },
    });
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!formState.storeId) {
      toast.error('Store ID is required');
      return;
    }

    setIsLoading(true);

    try {
      // Save business address
      const businessAddressData = {
        AddressType: 'business' as AddressType,
        LocationName:
          formState.locationLogistics.businessAddress.locationName || '',
        ContactPhone: formatPhoneNumber(
          formState.locationLogistics.businessAddress.contactPhone || ''
        ),
        ContactEmail:
          formState.locationLogistics.businessAddress.contactEmail || '',
        StreetAddress:
          formState.locationLogistics.businessAddress.streetAddress || '',
        City: formState.locationLogistics.businessAddress.city || '',
        State: formState.locationLogistics.businessAddress.state || '',
        ZipCode: formState.locationLogistics.businessAddress.zipCode || '',
        Country: formState.locationLogistics.businessAddress.country || 'US',
        IsPrimary: true,
        PickupInstructions:
          formState.locationLogistics.businessAddress.pickupInstructions || '',
      };

      await StoreApiService.createStoreAddress(
        formState.storeId,
        businessAddressData
      );

      // Always save billing address - use business address data when sameAsBusiness is true
      const billingSameAsBusiness =
        formState.locationLogistics.billingSameAsBusinessAddress ?? true;
      const billingAddressData = {
        AddressType: 'billing' as AddressType,
        LocationName: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.locationName || ''
          : formState.locationLogistics.billingAddress?.locationName || '',
        ContactPhone: formatPhoneNumber(
          billingSameAsBusiness
            ? formState.locationLogistics.businessAddress.contactPhone || ''
            : formState.locationLogistics.billingAddress?.contactPhone || ''
        ),
        ContactEmail: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.contactEmail || ''
          : formState.locationLogistics.billingAddress?.contactEmail || '',
        StreetAddress: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.streetAddress || ''
          : formState.locationLogistics.billingAddress?.streetAddress || '',
        City: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.city || ''
          : formState.locationLogistics.billingAddress?.city || '',
        State: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.state || ''
          : formState.locationLogistics.billingAddress?.state || '',
        ZipCode: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.zipCode || ''
          : formState.locationLogistics.billingAddress?.zipCode || '',
        Country: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.country || 'US'
          : formState.locationLogistics.billingAddress?.country || 'US',
        IsPrimary: false,
        PickupInstructions: billingSameAsBusiness
          ? formState.locationLogistics.businessAddress.pickupInstructions || ''
          : formState.locationLogistics.billingAddress?.pickupInstructions ||
            '',
      };

      console.log('=== BILLING ADDRESS DEBUG ===');
      console.log(
        'billingSameAsBusinessAddress:',
        formState.locationLogistics.billingSameAsBusinessAddress
      );
      console.log(
        'Business address data:',
        formState.locationLogistics.businessAddress
      );
      console.log(
        'Billing address data:',
        formState.locationLogistics.billingAddress
      );
      console.log(
        'Final billing address payload:',
        JSON.stringify(billingAddressData, null, 2)
      );

      const billingResponse = await StoreApiService.createStoreAddress(
        formState.storeId,
        billingAddressData
      );
      console.log('Billing address creation response:', billingResponse);

      // Update store with delivery radius if local delivery is selected
      const sellingMethods = formState.locationLogistics.sellingMethods;
      if (sellingMethods.includes('local-delivery')) {
        await StoreApiService.updateStore(formState.storeId, {
          deliveryRadiusMi: formState.locationLogistics.deliveryRadiusMi,
        });
      }

      toast.success('Location & logistics saved successfully!');
      onNext();
    } catch (error) {
      console.error('❌ Failed to save location logistics:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to save location logistics. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isPickupSelected =
    formState.locationLogistics?.sellingMethods?.includes('pickup');
  const isLocalDeliverySelected =
    formState.locationLogistics?.sellingMethods?.includes('local-delivery');
  const billingSameAsBusiness =
    formState.locationLogistics?.billingSameAsBusinessAddress ?? true;

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
            value={
              formState.locationLogistics?.businessAddress?.locationName || ''
            }
            onChange={(e) =>
              handleBusinessAddressChange('locationName', e.target.value)
            }
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
            value={
              formState.locationLogistics?.businessAddress?.contactPhone || ''
            }
            onChange={(e) =>
              handleBusinessAddressChange('contactPhone', e.target.value)
            }
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
            value={
              formState.locationLogistics?.businessAddress?.contactEmail || ''
            }
            onChange={(e) =>
              handleBusinessAddressChange('contactEmail', e.target.value)
            }
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
            value={
              formState.locationLogistics?.businessAddress?.streetAddress || ''
            }
            onChange={(e) =>
              handleBusinessAddressChange('streetAddress', e.target.value)
            }
            fullWidth
            required
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='City'
              value={formState.locationLogistics?.businessAddress?.city || ''}
              onChange={(e) =>
                handleBusinessAddressChange('city', e.target.value)
              }
              required
              sx={{ flex: 1 }}
            />

            <TextField
              label='State'
              value={formState.locationLogistics?.businessAddress?.state || ''}
              onChange={(e) =>
                handleBusinessAddressChange('state', e.target.value)
              }
              required
              sx={{ flex: 1 }}
            />

            <TextField
              label='ZIP Code'
              value={
                formState.locationLogistics?.businessAddress?.zipCode || ''
              }
              onChange={(e) =>
                handleBusinessAddressChange('zipCode', e.target.value)
              }
              required
              sx={{ flex: 1 }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              label='Country'
              value={
                formState.locationLogistics?.businessAddress?.country || 'US'
              }
              onChange={(e) =>
                handleBusinessAddressChange('country', e.target.value)
              }
              required
              fullWidth
              placeholder='US'
            />
          </Box>

          <TextField
            label='Pickup Instructions'
            placeholder='e.g., Look for the red barn, park in the gravel lot'
            value={
              formState.locationLogistics?.businessAddress
                ?.pickupInstructions || ''
            }
            onChange={(e) =>
              handleBusinessAddressChange('pickupInstructions', e.target.value)
            }
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </Paper>

      {/* Billing Address Section */}
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
          <ReceiptIcon color='primary' />
          Billing Address
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={billingSameAsBusiness}
              onChange={(e) =>
                handleBillingSameAsBusinessChange(e.target.checked)
              }
              color='primary'
            />
          }
          label='Same as Business Address'
          sx={{ mb: 3 }}
        />

        <Collapse in={!billingSameAsBusiness}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label='Location Name'
              placeholder='e.g., Billing Department'
              value={
                formState.locationLogistics?.billingAddress?.locationName || ''
              }
              onChange={(e) =>
                handleBillingAddressChange('locationName', e.target.value)
              }
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
              value={
                formState.locationLogistics?.billingAddress?.contactPhone || ''
              }
              onChange={(e) =>
                handleBillingAddressChange('contactPhone', e.target.value)
              }
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
              placeholder='e.g., billing@farm.com'
              value={
                formState.locationLogistics?.billingAddress?.contactEmail || ''
              }
              onChange={(e) =>
                handleBillingAddressChange('contactEmail', e.target.value)
              }
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
              placeholder='e.g., 123 Billing Street'
              value={
                formState.locationLogistics?.billingAddress?.streetAddress || ''
              }
              onChange={(e) =>
                handleBillingAddressChange('streetAddress', e.target.value)
              }
              fullWidth
              required
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='City'
                value={formState.locationLogistics?.billingAddress?.city || ''}
                onChange={(e) =>
                  handleBillingAddressChange('city', e.target.value)
                }
                required
                sx={{ flex: 1 }}
              />

              <TextField
                label='State'
                value={formState.locationLogistics?.billingAddress?.state || ''}
                onChange={(e) =>
                  handleBillingAddressChange('state', e.target.value)
                }
                required
                sx={{ flex: 1 }}
              />

              <TextField
                label='ZIP Code'
                value={
                  formState.locationLogistics?.billingAddress?.zipCode || ''
                }
                onChange={(e) =>
                  handleBillingAddressChange('zipCode', e.target.value)
                }
                required
                sx={{ flex: 1 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                label='Country'
                value={
                  formState.locationLogistics?.billingAddress?.country || 'US'
                }
                onChange={(e) =>
                  handleBillingAddressChange('country', e.target.value)
                }
                required
                fullWidth
                placeholder='US'
              />
            </Box>

            <TextField
              label='Special Instructions'
              placeholder='e.g., Attention: Accounts Payable'
              value={
                formState.locationLogistics?.billingAddress
                  ?.pickupInstructions || ''
              }
              onChange={(e) =>
                handleBillingAddressChange('pickupInstructions', e.target.value)
              }
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </Collapse>
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
                Note: Since you're selling live animals, customers will pick up
                processed products from your processor partner's location.
              </em>
            </>
          )}
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPickupSelected}
                onChange={(e) =>
                  handleSellingMethodChange('pickup', e.target.checked)
                }
                color='primary'
              />
            }
            label='Pickup (Customers come to me)'
            sx={{ mb: 1 }}
          />
          {needsProcessorLogistics && isPickupSelected && (
            <Alert severity='info' sx={{ mt: 1, mb: 1 }}>
              <Typography variant='body2'>
                <strong>Processor Partner Pickup:</strong> Customers will pick
                up processed products from your processor partner's designated
                pickup location, not from your farm location.
              </Typography>
            </Alert>
          )}

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
        </FormGroup>
      </Paper>

      {/* Conditional Fields */}

      {/* Processor Partner Pickup Info - for producer stores with partnerships */}
      <Collapse in={isPickupSelected && needsProcessorLogistics}>
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
            Pickup Location
          </Typography>
          <Alert severity='info'>
            <Typography variant='body2'>
              <strong>Processor Partner Pickup:</strong> Since your store
              requires partnerships with meat processors, customers will pick up
              processed products from your processor partner's designated pickup
              location, not from your farm location. You'll select your
              processor partners and their pickup locations in the Partnerships
              step.
            </Typography>
          </Alert>
        </Paper>
      </Collapse>

      {/* Local Delivery Options - appears when Local Delivery is selected */}
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
            Local Delivery Options
          </Typography>

          <TextField
            label='Delivery Radius (miles)'
            type='number'
            value={formState.locationLogistics?.deliveryRadiusMi || 5}
            onChange={(e) => handleDeliveryRadiusChange(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 100 }}
            helperText='How far will you deliver?'
          />
        </Paper>
      </Collapse>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          pt: 3,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <LoadingButton
          variant='outlined'
          onClick={onPrevious}
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
          Cancel
        </Button>

        <LoadingButton
          variant='contained'
          onClick={handleSubmit}
          loading={isLoading}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600,
          }}
        >
          {getNextStepLabel()}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default LocationLogisticsStep;
