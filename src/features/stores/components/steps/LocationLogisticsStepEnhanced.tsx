import React, { useState, useEffect } from 'react';
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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Store as StoreIcon,
  Agriculture as FarmIcon,
  Factory as ProcessorIcon,
  Schedule as TimeIcon,
  AttachMoney as MoneyIcon,
  Handshake as PartnershipIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '@features/stores/services/open-shop.types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StoreApiService from '../../services/storesApi';

import { STORAGE_KEYS } from '../../../utils/api';
import toast from 'react-hot-toast';

type SellingMethod = 'pickup' | 'local-delivery';

interface ProcessorPartner {
  storeId: number;
  storeName: string;
  address: string;
  distance: number;
  logoUrl?: string;
  canProcess: boolean;
  autoAcceptPartnerships: boolean;
}

interface PartnershipLogistics {
  processorId: number;
  processorName: string;
  processorAddress: string;
  deliveryArrangement:
    | 'producer-delivers'
    | 'customer-delivers'
    | 'pickup-service';
  processingTimeframes: string[];
  customerNotificationMethod: 'email' | 'sms' | 'phone';
  specialInstructions?: string;
}

const LocationLogisticsStepEnhanced: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
  isSubmitting,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [processorPartners, setProcessorPartners] = useState<
    ProcessorPartner[]
  >([]);
  const [selectedProcessors, setSelectedProcessors] = useState<number[]>([]);
  const [partnershipLogistics, setPartnershipLogistics] = useState<
    PartnershipLogistics[]
  >([]);

  // Determine if this is a producer store that needs processor logistics
  const isProducerStore =
    formState.storeBasics?.setupFlow?.derivedStoreType === 'producer';
  const hasLiveAnimalsCategory =
    formState.storeBasics?.categories?.includes('Live Animals');
  const needsProcessorLogistics = isProducerStore && hasLiveAnimalsCategory;

  // Helper function to format phone numbers for database constraint
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      if (digitsOnly.length === 10) {
        return `+1${digitsOnly}`;
      }
      if (digitsOnly.length >= 11) {
        return `+${digitsOnly}`;
      }
    }
    console.warn('Phone number may not meet database constraint:', phone);
    return digitsOnly;
  };

  // Load processor partners on component mount if needed (using direct fetch like Store Basics)
  useEffect(() => {
    if (needsProcessorLogistics && formState.storeId) {
      loadProcessorPartners();
    }
  }, [needsProcessorLogistics, formState.storeId]);

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN || 'helloneighbors_access_token'
    );
    if (token) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          console.error('🔐 Token is expired');
          return null;
        }
        return token;
      } catch (error) {
        console.error('🔐 Failed to parse token:', error);
        return null;
      }
    }
    return null;
  };

  const loadProcessorPartners = async () => {
    if (!formState.storeId) {
      console.log('No store ID available, skipping processor partners load');
      return;
    }

    try {
      console.log('🔄 Using direct fetch approach (same as Store Basics)...');

      // Get the auth token using helper function
      const token = getAuthToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Adding auth token to processor partners request');
      } else {
        console.warn('⚠️ No auth token found for processor partners request');
      }

      // Use the same direct fetch approach as Store Basics step
      const response = await fetch(
        `/api/stores/${formState.storeId}/potential-partners?partnerType=processor&radiusMiles=${formState.storeBasics?.setupFlow?.partnershipRadiusMi || 50}`,
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const partners = data.data || [];
        setProcessorPartners(partners);

        // Pre-select partners from setup flow
        const preSelectedIds =
          formState.storeBasics?.setupFlow?.selectedPartnerIds || [];
        setSelectedProcessors(preSelectedIds);

        // Initialize partnership logistics for pre-selected partners
        const initialLogistics = preSelectedIds.map((id) => {
          const partner = Array.isArray(partners)
            ? partners.find((p) => p.storeId === id)
            : undefined;
          return {
            processorId: id,
            processorName: partner?.storeName || '',
            processorAddress: partner?.address || '',
            deliveryArrangement: 'producer-delivers' as const,
            processingTimeframes: ['1-2 days'],
            customerNotificationMethod: 'email' as const,
          };
        });
        setPartnershipLogistics(initialLogistics);

        console.log(
          '✅ Successfully loaded processor partners via direct fetch'
        );
      } else {
        console.error('❌ Direct fetch failed with status:', response.status);
        if (response.status === 401) {
          console.error(
            '🔐 Authentication error - token may be invalid or expired'
          );
          toast.error('Authentication failed - please log in again');
        } else {
          toast.error('Failed to load processor partners');
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to load processor partners:', error);
      toast.error('Failed to load processor partners');
    }
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
      newErrors.zipCode = 'Zip code is required';
    }

    return newErrors;
  };

  const validateSellingMethods = () => {
    const newErrors: { [key: string]: string } = {};

    if (formState.locationLogistics.sellingMethods.length === 0) {
      newErrors.sellingMethods = 'Please select at least one selling method';
    }

    // If processor pickup is selected, validate processor logistics
    if (formState.locationLogistics.sellingMethods.includes('pickup')) {
      if (selectedProcessors.length === 0) {
        newErrors.processorSelection =
          'Please select at least one processor partner';
      }

      // Validate each processor's logistics
      partnershipLogistics.forEach((logistics, index) => {
        if (!logistics.deliveryArrangement) {
          newErrors[`processor_${logistics.processorId}_delivery`] =
            'Please specify delivery arrangement';
        }
        if (logistics.processingTimeframes.length === 0) {
          newErrors[`processor_${logistics.processorId}_timeframe`] =
            'Please specify processing timeframe';
        }
      });
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before continuing');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create business address
      await StoreApiService.createStoreAddress(formState.storeId, {
        AddressType: 'business',
        LocationName: formState.locationLogistics.businessAddress.locationName,
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
      });

      // 2. Handle selling methods
      const sellingMethods = formState.locationLogistics.sellingMethods;

      // Create farmgate address if on-farm pickup is selected
      if (sellingMethods.includes('pickup')) {
        if (!formState.locationLogistics.farmgateSameAsBusinessAddress) {
          await StoreApiService.createStoreAddress(formState.storeId, {
            AddressType: 'farm_location',
            LocationName:
              formState.locationLogistics.farmgateAddress?.locationName ||
              'Farm Gate',
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
        await StoreApiService.updateStoreDeliveryRadius(
          formState.storeId,
          deliveryRadius
        );
      }

      // Create pickup point address if farmers market is selected
      if (sellingMethods.includes('pickup')) {
        await StoreApiService.createStoreAddress(formState.storeId, {
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

      // 3. Handle processor partnerships and logistics
      if (sellingMethods.includes('pickup') && needsProcessorLogistics) {
        // Create partnerships with selected processors
        for (const processorId of selectedProcessors) {
          try {
            await StoreApiService.createPartnership({
              ProducerStoreId: formState.storeId,
              ProcessorStoreId: processorId,
              InitiatedByStoreId: formState.storeId,
            });
          } catch (error) {
            console.warn(
              `Partnership with processor ${processorId} may already exist`,
              error
            );
          }
        }

        // Save partnership logistics preferences
        const logisticsData = {
          partnershipLogistics: partnershipLogistics,
          processorPickupEnabled: true,
        };

        // Store logistics preferences in store setup data
        await StoreApiService.updateStore(formState.storeId, {
          partnershipLogistics: logisticsData,
          sellingMethods: formState.locationLogistics.sellingMethods,
        });
      }

      // 4. Create shipping services if applicable
      if (sellingMethods.includes('local-delivery')) {
        const standardShipping = {
          serviceId: 0,
          serviceType: 'standard',
          serviceName: 'Standard Delivery',
          description: 'Regular delivery service (1-3 days)',
          baseCost: 5.99,
          costPerMile: 0.5,
          maxRadiusMiles: formState.locationLogistics.deliveryRadiusMi || 25,
          estimatedDeliveryHours: 48,
          minimumOrderValue: 0,
          maxWeightLbs: 50,
          isActive: true,
          availableDays: DAYS_OF_WEEK,
        };

        await StoreApiService.createShippingService(
          formState.storeId,
          standardShipping
        );
      }

      toast.success('Location and logistics configured successfully!');
      onNext();
    } catch (error) {
      console.error('Error in location logistics setup:', error);
      toast.error(
        'Failed to save location and logistics settings. Please try again.'
      );
    } finally {
      setIsLoading(false);
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

  const handleProcessorSelectionChange = (
    processorId: number,
    selected: boolean
  ) => {
    const newSelection = selected
      ? [...selectedProcessors, processorId]
      : selectedProcessors.filter((id) => id !== processorId);

    setSelectedProcessors(newSelection);

    // Add or remove logistics configuration
    if (selected) {
      const processor = Array.isArray(processorPartners)
        ? processorPartners.find((p) => p.storeId === processorId)
        : undefined;
      const newLogistics: PartnershipLogistics = {
        processorId,
        processorName: processor?.storeName || '',
        processorAddress: processor?.address || '',
        deliveryArrangement: 'producer-delivers',
        processingTimeframes: ['1-2 days'],
        customerNotificationMethod: 'email',
      };
      setPartnershipLogistics([...partnershipLogistics, newLogistics]);
    } else {
      setPartnershipLogistics(
        partnershipLogistics.filter((l) => l.processorId !== processorId)
      );
    }

    // Clear related errors
    if (errors.processorSelection) {
      setErrors((prev) => ({ ...prev, processorSelection: '' }));
    }
  };

  const updateProcessorLogistics = (
    processorId: number,
    field: keyof PartnershipLogistics,
    value: any
  ) => {
    setPartnershipLogistics((logistics) =>
      logistics.map((l) =>
        l.processorId === processorId ? { ...l, [field]: value } : l
      )
    );

    // Clear related errors
    const errorKey = `processor_${processorId}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Component state checks
  const isPickupSelected =
    formState.locationLogistics.sellingMethods.includes('pickup');
  const isLocalDeliverySelected =
    formState.locationLogistics.sellingMethods.includes('local-delivery');
  const isProcessorPickupSelected = false;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Location & Logistics
      </Typography>
      <Typography variant='body1' color='text.secondary' paragraph>
        Set up where your business operates and how customers will receive their
        orders.
        {needsProcessorLogistics && (
          <Alert severity='info' sx={{ mt: 2 }}>
            <Typography variant='body2'>
              Since you're selling live animals, you can set up partnerships
              with processors so customers can pick up processed meat directly
              from processor facilities.
            </Typography>
          </Alert>
        )}
      </Typography>

      {/* Business Address Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BusinessIcon color='primary' />
          Business Address
        </Typography>
        <Typography variant='body2' color='text.secondary' paragraph>
          This is your primary business location for legal and contact purposes.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <TextField
            fullWidth
            label='Location Name *'
            value={formState.locationLogistics.businessAddress.locationName}
            onChange={(e) =>
              updateFormState({
                locationLogistics: {
                  ...formState.locationLogistics,
                  businessAddress: {
                    ...formState.locationLogistics.businessAddress,
                    locationName: e.target.value,
                  },
                },
              })
            }
            error={!!errors.locationName}
            helperText={errors.locationName}
            placeholder='e.g., Green Valley Farm'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <LocationIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Contact Phone *'
            value={formState.locationLogistics.businessAddress.contactPhone}
            onChange={(e) =>
              updateFormState({
                locationLogistics: {
                  ...formState.locationLogistics,
                  businessAddress: {
                    ...formState.locationLogistics.businessAddress,
                    contactPhone: e.target.value,
                  },
                },
              })
            }
            error={!!errors.contactPhone}
            helperText={errors.contactPhone}
            placeholder='(555) 123-4567'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Contact Email *'
            type='email'
            value={formState.locationLogistics.businessAddress.contactEmail}
            onChange={(e) =>
              updateFormState({
                locationLogistics: {
                  ...formState.locationLogistics,
                  businessAddress: {
                    ...formState.locationLogistics.businessAddress,
                    contactEmail: e.target.value,
                  },
                },
              })
            }
            error={!!errors.contactEmail}
            helperText={errors.contactEmail}
            placeholder='farm@example.com'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <EmailIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label='Street Address *'
            value={formState.locationLogistics.businessAddress.streetAddress}
            onChange={(e) =>
              updateFormState({
                locationLogistics: {
                  ...formState.locationLogistics,
                  businessAddress: {
                    ...formState.locationLogistics.businessAddress,
                    streetAddress: e.target.value,
                  },
                },
              })
            }
            error={!!errors.streetAddress}
            helperText={errors.streetAddress}
            placeholder='123 Farm Road'
            sx={{ gridColumn: { md: 'span 2' } }}
          />

          <TextField
            fullWidth
            label='City *'
            value={formState.locationLogistics.businessAddress.city}
            onChange={(e) =>
              updateFormState({
                locationLogistics: {
                  ...formState.locationLogistics,
                  businessAddress: {
                    ...formState.locationLogistics.businessAddress,
                    city: e.target.value,
                  },
                },
              })
            }
            error={!!errors.city}
            helperText={errors.city}
            placeholder='Springfield'
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label='State *'
              value={formState.locationLogistics.businessAddress.state}
              onChange={(e) =>
                updateFormState({
                  locationLogistics: {
                    ...formState.locationLogistics,
                    businessAddress: {
                      ...formState.locationLogistics.businessAddress,
                      state: e.target.value,
                    },
                  },
                })
              }
              error={!!errors.state}
              helperText={errors.state}
              placeholder='CA'
              sx={{ flex: 1 }}
            />
            <TextField
              label='ZIP Code *'
              value={formState.locationLogistics.businessAddress.zipCode}
              onChange={(e) =>
                updateFormState({
                  locationLogistics: {
                    ...formState.locationLogistics,
                    businessAddress: {
                      ...formState.locationLogistics.businessAddress,
                      zipCode: e.target.value,
                    },
                  },
                })
              }
              error={!!errors.zipCode}
              helperText={errors.zipCode}
              placeholder='12345'
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Selling Methods Section */}
      <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <StoreIcon color='primary' />
          How will customers get their orders?
        </Typography>
        <Typography variant='body2' color='text.secondary' paragraph>
          Select all methods that apply to your business model.
        </Typography>

        <FormGroup sx={{ gap: 2 }}>
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
            label={
              <Box>
                <Typography variant='body1'>
                  Pickup (Customers come to designated location)
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Customers come to pickup locations to get their orders
                </Typography>
              </Box>
            }
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
            label={
              <Box>
                <Typography variant='body1'>
                  Local Delivery (I deliver to customers)
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  You deliver products directly to customers within your area
                </Typography>
              </Box>
            }
          />
        </FormGroup>

        {errors.sellingMethods && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {errors.sellingMethods}
          </Alert>
        )}
      </Paper>

      {/* Processor Partnership Logistics */}
      {isPickupSelected && needsProcessorLogistics && (
        <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Typography
            variant='h5'
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <PartnershipIcon color='primary' />
            Processor Partnership Logistics
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            Configure how customers will interact with your processor partners
            for pickup and processing.
          </Typography>

          {errors.processorSelection && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {errors.processorSelection}
            </Alert>
          )}

          <Typography variant='h6' gutterBottom>
            Select Processor Partners
          </Typography>

          <List sx={{ mb: 3 }}>
            {processorPartners.map((processor) => (
              <ListItem key={processor.storeId} divider>
                <ListItemAvatar>
                  <Avatar
                    src={processor.logoUrl}
                    sx={{ bgcolor: 'primary.light' }}
                  >
                    <ProcessorIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={processor.storeName}
                  secondary={
                    <Box>
                      <Typography variant='body2' color='text.secondary'>
                        {processor.address}
                      </Typography>
                      <Chip
                        size='small'
                        label={`${processor.distance} miles`}
                        sx={{ mt: 0.5 }}
                      />
                      {processor.autoAcceptPartnerships && (
                        <Chip
                          size='small'
                          label='Auto-accepts partnerships'
                          color='success'
                          sx={{ mt: 0.5, ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={selectedProcessors.includes(processor.storeId)}
                    onChange={(e) =>
                      handleProcessorSelectionChange(
                        processor.storeId,
                        e.target.checked
                      )
                    }
                    color='primary'
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {/* Logistics Configuration for Selected Processors */}
          {partnershipLogistics.map((logistics) => (
            <Card
              key={logistics.processorId}
              sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}
            >
              <CardContent>
                <Typography
                  variant='h6'
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <ProcessorIcon color='primary' />
                  {logistics.processorName} - Logistics Setup
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  }}
                >
                  <FormControl component='fieldset'>
                    <FormLabel component='legend'>
                      How do animals get to the processor?
                    </FormLabel>
                    <RadioGroup
                      value={logistics.deliveryArrangement}
                      onChange={(e) =>
                        updateProcessorLogistics(
                          logistics.processorId,
                          'deliveryArrangement',
                          e.target.value
                        )
                      }
                    >
                      <FormControlLabel
                        value='producer-delivers'
                        control={<Radio />}
                        label='I deliver animals to processor'
                      />
                      <FormControlLabel
                        value='customer-delivers'
                        control={<Radio />}
                        label='Customer delivers animals to processor'
                      />
                      <FormControlLabel
                        value='pickup-service'
                        control={<Radio />}
                        label='Processor pickup service available'
                      />
                    </RadioGroup>
                  </FormControl>

                  <FormControl component='fieldset'>
                    <FormLabel component='legend'>
                      Processing Timeframes
                    </FormLabel>
                    <FormGroup>
                      {[
                        'Same day',
                        '1-2 days',
                        '3-5 days',
                        '1 week',
                        'Custom schedule',
                      ].map((timeframe) => (
                        <FormControlLabel
                          key={timeframe}
                          control={
                            <Checkbox
                              checked={logistics.processingTimeframes.includes(
                                timeframe
                              )}
                              onChange={(e) => {
                                const newTimeframes = e.target.checked
                                  ? [
                                      ...logistics.processingTimeframes,
                                      timeframe,
                                    ]
                                  : logistics.processingTimeframes.filter(
                                      (t) => t !== timeframe
                                    );
                                updateProcessorLogistics(
                                  logistics.processorId,
                                  'processingTimeframes',
                                  newTimeframes
                                );
                              }}
                            />
                          }
                          label={timeframe}
                        />
                      ))}
                    </FormGroup>
                  </FormControl>

                  <FormControl component='fieldset'>
                    <FormLabel component='legend'>
                      Customer Notification Method
                    </FormLabel>
                    <RadioGroup
                      value={logistics.customerNotificationMethod}
                      onChange={(e) =>
                        updateProcessorLogistics(
                          logistics.processorId,
                          'customerNotificationMethod',
                          e.target.value
                        )
                      }
                    >
                      <FormControlLabel
                        value='email'
                        control={<Radio />}
                        label='Email notification'
                      />
                      <FormControlLabel
                        value='sms'
                        control={<Radio />}
                        label='SMS notification'
                      />
                      <FormControlLabel
                        value='phone'
                        control={<Radio />}
                        label='Phone call'
                      />
                    </RadioGroup>
                  </FormControl>

                  <TextField
                    fullWidth
                    label='Special Instructions (optional)'
                    multiline
                    rows={3}
                    value={logistics.specialInstructions || ''}
                    onChange={(e) =>
                      updateProcessorLogistics(
                        logistics.processorId,
                        'specialInstructions',
                        e.target.value
                      )
                    }
                    placeholder='Any special handling or processing instructions...'
                    sx={{ gridColumn: { md: 'span 2' } }}
                  />
                </Box>

                {/* Error messages for this processor */}
                {Object.entries(errors)
                  .filter(([key]) =>
                    key.startsWith(`processor_${logistics.processorId}_`)
                  )
                  .map(([key, error]) => (
                    <Alert key={key} severity='error' sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  ))}
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}

      {/* Local Delivery Configuration */}
      {isLocalDeliverySelected && (
        <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h6' gutterBottom>
            Local Delivery Settings
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Configure your local delivery options
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LocationLogisticsStepEnhanced;
