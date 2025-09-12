import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Card,
  CardContent,
  Grid,
  Switch,
  Chip,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import OpenShopApiService from '../../../services/open-shop.api';
import toast from 'react-hot-toast';
import { parse, format } from 'date-fns';

const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'Sunday', dayOfWeek: 0 },
  { key: 'monday', label: 'Monday', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Tuesday', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Wednesday', dayOfWeek: 3 },
  { key: 'thursday', label: 'Thursday', dayOfWeek: 4 },
  { key: 'friday', label: 'Friday', dayOfWeek: 5 },
  { key: 'saturday', label: 'Saturday', dayOfWeek: 6 },
];

const PAYMENT_METHODS_OPTIONS = [
  'Cash',
  'Credit Card',
  'Bank Transfer',
  'Mobile Payment',
];

const StorePoliciesStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    console.log('=== STORE POLICIES VALIDATION ===');
    const newErrors: { [key: string]: string } = {};

    // Validate store hours - check if at least one day is open
    const hasOpenDays = DAYS_OF_WEEK.some(
      (day) => formState.storeHours[day.key]?.isOpen
    );

    console.log('Has open days:', hasOpenDays);
    console.log('Store hours:', JSON.stringify(formState.storeHours, null, 2));

    if (!hasOpenDays) {
      newErrors.storeHours = 'Please set hours for at least one day';
    } else {
      // Validate that open days have valid times
      for (const day of DAYS_OF_WEEK) {
        const dayData = formState.storeHours[day.key];
        if (dayData?.isOpen) {
          if (!dayData.openTime || !dayData.closeTime) {
            newErrors.storeHours =
              'Please set open and close times for all open days';
            break;
          }

          // Validate that close time is after open time
          if (dayData.openTime && dayData.closeTime) {
            const openTime = parse(dayData.openTime, 'HH:mm', new Date());
            const closeTime = parse(dayData.closeTime, 'HH:mm', new Date());

            if (closeTime <= openTime) {
              newErrors.storeHours = `${day.label}: Close time must be after open time`;
              break;
            }
          }
        }
      }
    }

    // Validate payment methods
    console.log(
      'Selected payment methods:',
      formState.paymentMethods.selectedMethods
    );
    console.log(
      'Number of payment methods:',
      formState.paymentMethods.selectedMethods.length
    );

    if (formState.paymentMethods.selectedMethods.length === 0) {
      newErrors.paymentMethods = 'Please select at least one payment method';
    }

    console.log('Validation errors:', newErrors);
    console.log('Validation passed:', Object.keys(newErrors).length === 0);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDayToggle = (dayKey: string, isOpen: boolean) => {
    updateFormState({
      storeHours: {
        ...formState.storeHours,
        [dayKey]: {
          ...formState.storeHours[dayKey],
          isOpen,
          // Set default times when opening a day
          openTime:
            isOpen && !formState.storeHours[dayKey]?.openTime
              ? '09:00'
              : formState.storeHours[dayKey]?.openTime,
          closeTime:
            isOpen && !formState.storeHours[dayKey]?.closeTime
              ? '17:00'
              : formState.storeHours[dayKey]?.closeTime,
        },
      },
    });

    // Clear errors when user makes changes
    if (errors.storeHours) {
      setErrors((prev) => ({
        ...prev,
        storeHours: '',
      }));
    }
  };

  const handleTimeChange = (
    dayKey: string,
    timeType: 'openTime' | 'closeTime',
    time: Date | null
  ) => {
    if (!time) return;

    const timeString = format(time, 'HH:mm');

    updateFormState({
      storeHours: {
        ...formState.storeHours,
        [dayKey]: {
          ...formState.storeHours[dayKey],
          [timeType]: timeString,
        },
      },
    });

    // Clear errors when user makes changes
    if (errors.storeHours) {
      setErrors((prev) => ({
        ...prev,
        storeHours: '',
      }));
    }
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const currentMethods = formState.paymentMethods.selectedMethods;
    const newMethods = checked
      ? [...currentMethods, method]
      : currentMethods.filter((m) => m !== method);

    updateFormState({
      paymentMethods: {
        selectedMethods: newMethods,
      },
    });

    // Clear errors when user makes changes
    if (errors.paymentMethods) {
      setErrors((prev) => ({
        ...prev,
        paymentMethods: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!formState.storeId) {
      toast.error('Store ID not found. Please go back to Step 1.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== STORE POLICIES API CALLS ===');
      console.log('Store ID:', formState.storeId);

      // 1. Save store hours
      const openHoursPayload = {
        storeId: formState.storeId,
        openHours: DAYS_OF_WEEK.map((day) => {
          const dayData = formState.storeHours[day.key];
          return {
            dayOfWeek: day.dayOfWeek,
            openTime:
              dayData?.isOpen && dayData.openTime
                ? `${dayData.openTime}:00`
                : null,
            closeTime:
              dayData?.isOpen && dayData.closeTime
                ? `${dayData.closeTime}:00`
                : null,
            isClosed: !dayData?.isOpen,
          };
        }),
      };

      console.log('=== 1. CALLING OPEN HOURS API ===');
      console.log(
        'Open hours payload:',
        JSON.stringify(openHoursPayload, null, 2)
      );

      await OpenShopApiService.setOpenHours(openHoursPayload);
      console.log('✅ Open hours API completed successfully');

      // 2. Save payment methods
      const paymentMethodsPayload = {
        storeId: formState.storeId,
        paymentMethodNames: formState.paymentMethods.selectedMethods,
      };

      console.log('=== 2. CALLING PAYMENT METHODS API ===');
      console.log(
        'Payment methods payload:',
        JSON.stringify(paymentMethodsPayload, null, 2)
      );
      console.log(
        'Selected payment methods:',
        formState.paymentMethods.selectedMethods
      );
      console.log(
        'Number of selected methods:',
        formState.paymentMethods.selectedMethods.length
      );

      await OpenShopApiService.setPaymentMethods(paymentMethodsPayload);
      console.log('✅ Payment methods API completed successfully');

      toast.success('Store policies saved successfully!');
      onNext();
    } catch (error: unknown) {
      console.error('Error saving store policies:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to save store policies. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        Store Policies
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Set up your store hours and accepted payment methods.
      </Typography>

      {/* Store Hours Section */}
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
          <ScheduleIcon color='primary' />
          Store Opening Hours
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Set your operating hours for each day of the week.
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {DAYS_OF_WEEK.map((day) => {
              const dayData = formState.storeHours[day.key];
              const isOpen = dayData?.isOpen || false;

              return (
                <Card
                  key={day.key}
                  variant='outlined'
                  sx={{
                    p: 3,
                    backgroundColor: isOpen
                      ? 'action.hover'
                      : 'background.paper',
                    borderColor: isOpen ? 'primary.main' : 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isOpen}
                          onChange={(e) =>
                            handleDayToggle(day.key, e.target.checked)
                          }
                          color='primary'
                        />
                      }
                      label={
                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                          {day.label}
                        </Typography>
                      }
                      sx={{ flexGrow: 1 }}
                    />

                    {isOpen && (
                      <Chip
                        label='Open'
                        color='primary'
                        size='small'
                        variant='outlined'
                      />
                    )}
                  </Box>

                  {isOpen && (
                    <Grid container spacing={2} alignItems='center'>
                      <Grid item xs={12} sm={5}>
                        <TimePicker
                          label='Opens'
                          value={
                            dayData?.openTime
                              ? parse(dayData.openTime, 'HH:mm', new Date())
                              : null
                          }
                          onChange={(time) =>
                            handleTimeChange(day.key, 'openTime', time)
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              InputProps: {
                                startAdornment: (
                                  <TimeIcon color='action' sx={{ mr: 1 }} />
                                ),
                              },
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                        <Typography variant='body2' color='text.secondary'>
                          to
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={5}>
                        <TimePicker
                          label='Closes'
                          value={
                            dayData?.closeTime
                              ? parse(dayData.closeTime, 'HH:mm', new Date())
                              : null
                          }
                          onChange={(time) =>
                            handleTimeChange(day.key, 'closeTime', time)
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              InputProps: {
                                startAdornment: (
                                  <TimeIcon color='action' sx={{ mr: 1 }} />
                                ),
                              },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  )}

                  {!isOpen && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontStyle: 'italic' }}
                    >
                      Closed
                    </Typography>
                  )}
                </Card>
              );
            })}
          </Box>
        </LocalizationProvider>

        {errors.storeHours && (
          <Alert severity='error' sx={{ mt: 3 }}>
            {errors.storeHours}
          </Alert>
        )}
      </Paper>

      {/* Payment Methods Section */}
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
          <PaymentIcon color='primary' />
          Accepted Payment Methods
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Select all payment methods you accept (at least one required).
        </Typography>

        <FormGroup>
          {PAYMENT_METHODS_OPTIONS.map((method) => (
            <FormControlLabel
              key={method}
              control={
                <Checkbox
                  checked={formState.paymentMethods.selectedMethods.includes(
                    method
                  )}
                  onChange={(e) =>
                    handlePaymentMethodChange(method, e.target.checked)
                  }
                  color='primary'
                />
              }
              label={method}
              sx={{ mb: 1 }}
            />
          ))}
        </FormGroup>

        {errors.paymentMethods && (
          <Alert severity='error' sx={{ mt: 2 }}>
            {errors.paymentMethods}
          </Alert>
        )}
      </Paper>

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fix the issues above before continuing.
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
          Back to Location
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
          disabled={Object.keys(errors).length > 0}
        >
          Continue to Branding
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StorePoliciesStep;
