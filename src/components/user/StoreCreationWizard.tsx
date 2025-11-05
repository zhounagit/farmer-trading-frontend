import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import {
  Close,
  Store,
  NavigateNext,
  NavigateBefore,
  Check,
  Schedule,
  Payment,
  LocationOn,
} from '@mui/icons-material';
import { storeApi } from '../../utils/api';
import type { StoreFormData, StoreValidationErrors } from '../../types/store';
import {
  PAYMENT_METHODS,
  DELIVERY_RADIUS_OPTIONS,
  DAYS_OF_WEEK,
} from '../../types/store';
import toast from 'react-hot-toast';

interface StoreCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onStoreCreated: () => void;
}

const steps = [
  {
    label: 'Basic Information',
    description: 'Store name and description',
    icon: <Store />,
  },
  {
    label: 'Business Hours',
    description: 'When is your store open?',
    icon: <Schedule />,
  },
  {
    label: 'Payment & Delivery',
    description: 'Payment methods and delivery radius',
    icon: <Payment />,
  },
  {
    label: 'Addresses',
    description: 'Business and pickup locations',
    icon: <LocationOn />,
  },
];

const defaultDayHours = {
  isOpen: true,
  openTime: '09:00',
  closeTime: '17:00',
  isAllDay: false,
};

const initialFormData: StoreFormData = {
  storeName: '',
  description: '',
  deliveryRadiusKm: 10,
  acceptedPaymentMethods: ['cash'],
  openHours: {
    monday: { ...defaultDayHours },
    tuesday: { ...defaultDayHours },
    wednesday: { ...defaultDayHours },
    thursday: { ...defaultDayHours },
    friday: { ...defaultDayHours },
    saturday: { ...defaultDayHours },
    sunday: { isOpen: false, openTime: '', closeTime: '', isAllDay: false },
  },
  businessAddress: {
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  },
  pickupAddress: {
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    sameAsBusinessAddress: true,
  },
  farmgateAddress: {
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    sameAsBusinessAddress: true,
  },
};

export const StoreCreationWizard: React.FC<StoreCreationWizardProps> = ({
  open,
  onClose,
  onStoreCreated,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<StoreValidationErrors>({});

  const handleInputChange = (
    field: string,
    value: unknown,
    section?: string
  ) => {
    setFormData((prev) => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...(prev[section as keyof StoreFormData] as Record<
              string,
              unknown
            >),
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });

    // Clear related errors
    if (formErrors[field as keyof StoreValidationErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleOpenHoursChange = (
    day: string,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => ({
      ...prev,
      openHours: {
        ...prev.openHours,
        [day]: {
          ...prev.openHours[day as keyof typeof prev.openHours],
          [field]: value,
        },
      },
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      acceptedPaymentMethods: prev.acceptedPaymentMethods.includes(method)
        ? prev.acceptedPaymentMethods.filter((m) => m !== method)
        : [...prev.acceptedPaymentMethods, method],
    }));
  };

  const handleAddressCopy = (
    addressType: 'pickupAddress' | 'farmgateAddress'
  ) => {
    if (formData[addressType].sameAsBusinessAddress) {
      setFormData((prev) => ({
        ...prev,
        [addressType]: {
          ...prev.businessAddress,
          sameAsBusinessAddress: true,
        },
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: StoreValidationErrors = {};

    switch (step) {
      case 0: // Basic Information
        if (!formData.storeName.trim()) {
          errors.storeName = 'Store name is required';
        } else if (formData.storeName.trim().length < 3) {
          errors.storeName = 'Store name must be at least 3 characters';
        }
        if (formData.description && formData.description.length > 500) {
          errors.description = 'Description must be less than 500 characters';
        }
        break;

      case 1: {
        // Business Hours
        const hasOpenDays = Object.values(formData.openHours).some(
          (day) => day?.isOpen
        );
        if (!hasOpenDays) {
          errors.openHours = 'Store must be open at least one day per week';
        }
        break;
      }

      case 2: // Payment & Delivery
        if (formData.acceptedPaymentMethods.length === 0) {
          errors.acceptedPaymentMethods =
            'At least one payment method is required';
        }
        if (formData.deliveryRadiusKm < 1 || formData.deliveryRadiusKm > 200) {
          errors.deliveryRadiusKm =
            'Delivery radius must be between 1 and 200 km';
        }
        break;

      case 3: // Addresses
        if (!formData.businessAddress.streetAddress.trim()) {
          errors.businessAddress = {
            ...errors.businessAddress,
            streetAddress: 'Street address is required',
          };
        }
        if (!formData.businessAddress.city.trim()) {
          errors.businessAddress = {
            ...errors.businessAddress,
            city: 'City is required',
          };
        }
        if (!formData.businessAddress.state.trim()) {
          errors.businessAddress = {
            ...errors.businessAddress,
            state: 'State is required',
          };
        }
        if (!formData.businessAddress.postalCode.trim()) {
          errors.businessAddress = {
            ...errors.businessAddress,
            postalCode: 'Postal code is required',
          };
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const storeData = {
        storeName: formData.storeName.trim(),
        description: formData.description?.trim() || undefined,
        openHours: JSON.stringify(formData.openHours),
        acceptedPaymentMethods: formData.acceptedPaymentMethods,
        deliveryRadiusKm: formData.deliveryRadiusKm,
      };

      await storeApi.create(storeData);
      toast.success('Store created successfully!');
      onStoreCreated();
      onClose();
      resetForm();
    } catch (err) {
      setError('Failed to create store. Please try again.');
      console.error('Store creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setError(null);
    setActiveStep(0);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              name='storeName'
              label='Store Name'
              placeholder='Enter your store name'
              value={formData.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              error={!!formErrors.storeName}
              helperText={formErrors.storeName}
              sx={{ mb: 3 }}
              required
              disabled={isLoading}
            />

            <TextField
              fullWidth
              name='description'
              label='Store Description'
              placeholder='Describe your store and what you sell (optional)'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!formErrors.description}
              helperText={
                formErrors.description ||
                `${formData.description.length}/500 characters`
              }
              multiline
              rows={4}
              disabled={isLoading}
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Business Hours
            </Typography>
            {formErrors.openHours && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {formErrors.openHours}
              </Alert>
            )}
            {DAYS_OF_WEEK.map(({ key, label }) => (
              <Box
                key={key}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ minWidth: 200 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={
                            formData.openHours[
                              key as keyof typeof formData.openHours
                            ]?.isOpen || false
                          }
                          onChange={(e) =>
                            handleOpenHoursChange(
                              key,
                              'isOpen',
                              e.target.checked
                            )
                          }
                          disabled={isLoading}
                        />
                      }
                      label={label}
                    />
                  </Box>
                  {formData.openHours[key as keyof typeof formData.openHours]
                    ?.isOpen && (
                    <>
                      <Box sx={{ minWidth: 120 }}>
                        <TextField
                          label='Open Time'
                          type='time'
                          value={
                            formData.openHours[
                              key as keyof typeof formData.openHours
                            ]?.openTime || ''
                          }
                          onChange={(e) =>
                            handleOpenHoursChange(
                              key,
                              'openTime',
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          disabled={isLoading}
                          fullWidth
                        />
                      </Box>
                      <Box sx={{ minWidth: 120 }}>
                        <TextField
                          label='Close Time'
                          type='time'
                          value={
                            formData.openHours[
                              key as keyof typeof formData.openHours
                            ]?.closeTime || ''
                          }
                          onChange={(e) =>
                            handleOpenHoursChange(
                              key,
                              'closeTime',
                              e.target.value
                            )
                          }
                          InputLabelProps={{ shrink: true }}
                          disabled={isLoading}
                          fullWidth
                        />
                      </Box>
                      <Box sx={{ minWidth: 120 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                formData.openHours[
                                  key as keyof typeof formData.openHours
                                ]?.isAllDay || false
                              }
                              onChange={(e) =>
                                handleOpenHoursChange(
                                  key,
                                  'isAllDay',
                                  e.target.checked
                                )
                              }
                              disabled={isLoading}
                            />
                          }
                          label='24 Hours'
                        />
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Payment Methods
            </Typography>
            {formErrors.acceptedPaymentMethods && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {formErrors.acceptedPaymentMethods}
              </Alert>
            )}
            <Box sx={{ mb: 3 }}>
              {PAYMENT_METHODS.map((method) => (
                <Chip
                  key={method}
                  label={method.replace('_', ' ').toUpperCase()}
                  onClick={() => handlePaymentMethodToggle(method)}
                  color={
                    formData.acceptedPaymentMethods.includes(method)
                      ? 'primary'
                      : 'default'
                  }
                  variant={
                    formData.acceptedPaymentMethods.includes(method)
                      ? 'filled'
                      : 'outlined'
                  }
                  sx={{ mr: 1, mb: 1 }}
                  disabled={isLoading}
                />
              ))}
            </Box>

            <FormControl
              fullWidth
              sx={{ mb: 3 }}
              error={!!formErrors.deliveryRadiusKm}
            >
              <InputLabel>Delivery Radius</InputLabel>
              <Select
                value={formData.deliveryRadiusKm}
                onChange={(e) =>
                  handleInputChange('deliveryRadiusKm', e.target.value)
                }
                label='Delivery Radius'
                disabled={isLoading}
              >
                {DELIVERY_RADIUS_OPTIONS.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.deliveryRadiusKm && (
                <Typography
                  variant='caption'
                  color='error'
                  sx={{ mt: 0.5, ml: 2 }}
                >
                  {formErrors.deliveryRadiusKm}
                </Typography>
              )}
            </FormControl>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Business Address
            </Typography>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
            >
              <Box>
                <TextField
                  fullWidth
                  label='Street Address'
                  value={formData.businessAddress.streetAddress}
                  onChange={(e) =>
                    handleInputChange(
                      'streetAddress',
                      e.target.value,
                      'businessAddress'
                    )
                  }
                  error={!!formErrors.businessAddress?.streetAddress}
                  helperText={formErrors.businessAddress?.streetAddress}
                  required
                  disabled={isLoading}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label='City'
                    value={formData.businessAddress.city}
                    onChange={(e) =>
                      handleInputChange(
                        'city',
                        e.target.value,
                        'businessAddress'
                      )
                    }
                    error={!!formErrors.businessAddress?.city}
                    helperText={formErrors.businessAddress?.city}
                    required
                    disabled={isLoading}
                  />
                </Box>
                <Box sx={{ minWidth: 120 }}>
                  <TextField
                    fullWidth
                    label='State'
                    value={formData.businessAddress.state}
                    onChange={(e) =>
                      handleInputChange(
                        'state',
                        e.target.value,
                        'businessAddress'
                      )
                    }
                    error={!!formErrors.businessAddress?.state}
                    helperText={formErrors.businessAddress?.state}
                    required
                    disabled={isLoading}
                  />
                </Box>
                <Box sx={{ minWidth: 120 }}>
                  <TextField
                    fullWidth
                    label='Postal Code'
                    value={formData.businessAddress.postalCode}
                    onChange={(e) =>
                      handleInputChange(
                        'postalCode',
                        e.target.value,
                        'businessAddress'
                      )
                    }
                    error={!!formErrors.businessAddress?.postalCode}
                    helperText={formErrors.businessAddress?.postalCode}
                    required
                    disabled={isLoading}
                  />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant='h6' sx={{ mb: 2 }}>
              Pickup Address
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.pickupAddress.sameAsBusinessAddress}
                  onChange={(e) => {
                    handleInputChange(
                      'sameAsBusinessAddress',
                      e.target.checked,
                      'pickupAddress'
                    );
                    if (e.target.checked) {
                      handleAddressCopy('pickupAddress');
                    }
                  }}
                  disabled={isLoading}
                />
              }
              label='Same as business address'
              sx={{ mb: 2 }}
            />

            {!formData.pickupAddress.sameAsBusinessAddress && (
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
              >
                <Box>
                  <TextField
                    fullWidth
                    label='Street Address'
                    value={formData.pickupAddress.streetAddress}
                    onChange={(e) =>
                      handleInputChange(
                        'streetAddress',
                        e.target.value,
                        'pickupAddress'
                      )
                    }
                    disabled={isLoading}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label='City'
                      value={formData.pickupAddress.city}
                      onChange={(e) =>
                        handleInputChange(
                          'city',
                          e.target.value,
                          'pickupAddress'
                        )
                      }
                      disabled={isLoading}
                    />
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      fullWidth
                      label='State'
                      value={formData.pickupAddress.state}
                      onChange={(e) =>
                        handleInputChange(
                          'state',
                          e.target.value,
                          'pickupAddress'
                        )
                      }
                      disabled={isLoading}
                    />
                  </Box>
                  <Box sx={{ minWidth: 120 }}>
                    <TextField
                      fullWidth
                      label='Postal Code'
                      value={formData.pickupAddress.postalCode}
                      onChange={(e) =>
                        handleInputChange(
                          'postalCode',
                          e.target.value,
                          'pickupAddress'
                        )
                      }
                      disabled={isLoading}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store color='primary' />
          <Typography variant='h6' fontWeight={600}>
            Open Your Store
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size='small'
          sx={{ color: 'grey.500' }}
          disabled={isLoading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation='vertical'>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant='caption'>Last step</Typography>
                  ) : null
                }
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor:
                        index <= activeStep ? 'primary.main' : 'grey.300',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {index < activeStep ? <Check /> : step.icon}
                  </Box>
                )}
              >
                <Typography variant='h6'>{step.label}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>{renderStepContent(index)}</StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none' }}
          disabled={isLoading}
        >
          Cancel
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            startIcon={<NavigateBefore />}
            sx={{ textTransform: 'none', mr: 1 }}
            disabled={isLoading}
          >
            Back
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant='contained'
            endIcon={<NavigateNext />}
            sx={{ textTransform: 'none' }}
            disabled={isLoading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant='contained'
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <Store />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {isLoading ? 'Creating Store...' : 'Create Store'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StoreCreationWizard;
