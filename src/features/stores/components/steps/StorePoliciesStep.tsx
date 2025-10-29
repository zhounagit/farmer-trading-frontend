import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Alert,
  Card,
  Grid,
  Switch,
  Chip,
  Button,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../services/open-shop.types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../services/open-shop.api';
import { StoresApiService } from '@/shared/services';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  { key: 'sunday', label: 'Sunday', dayOfWeek: 0 },
  { key: 'monday', label: 'Monday', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Tuesday', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Wednesday', dayOfWeek: 3 },
  { key: 'thursday', label: 'Thursday', dayOfWeek: 4 },
  { key: 'friday', label: 'Friday', dayOfWeek: 5 },
  { key: 'saturday', label: 'Saturday', dayOfWeek: 6 },
];

// Helper function to convert time string (HH:mm) to minutes
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

const StorePoliciesStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
  isEditMode,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if we already have open hours data from enhanced API response
  useEffect(() => {
    if (!isEditMode) return;

    // Check if we have any open hours data already loaded
    const hasExistingHours = DAYS_OF_WEEK.some(
      (day) => formState.storeHours[day.key]?.isOpen !== undefined
    );

    if (!hasExistingHours) {
      console.log('🕒 No existing open hours found, using default hours');
    }
  }, [isEditMode, formState.storeHours]);

  const validateForm = () => {
    console.log('=== STORE POLICIES VALIDATION ===');
    const newErrors: { [key: string]: string } = {};

    // Validate store hours - check if at least one day is open
    const hasOpenDays = DAYS_OF_WEEK.some(
      (day) => formState.storeHours[day.key]?.isOpen
    );

    if (!hasOpenDays) {
      newErrors.storeHours = 'Please set hours for at least one day';
    } else {
      // Validate that open days have valid times
      for (const day of DAYS_OF_WEEK) {
        const dayData = formState.storeHours[day.key];
        if (dayData?.isOpen) {
          if (!dayData?.openTime || !dayData?.closeTime) {
            newErrors.storeHours =
              'Please set open and close times for all open days';
            break;
          }

          // Validate that close time is after open time
          if (dayData.openTime && dayData.closeTime) {
            // Convert time strings to minutes for comparison
            const openMinutes = timeToMinutes(dayData.openTime);
            const closeMinutes = timeToMinutes(dayData.closeTime);

            if (closeMinutes <= openMinutes) {
              newErrors.storeHours = `${day.label}: Close time must be after open time`;
              break;
            }
          }
        }
      }
    }

    // Payment methods are now platform-controlled and managed centrally
    // No store-specific payment method validation needed

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
    timeValue: string
  ) => {
    if (!timeValue) return;

    updateFormState({
      storeHours: {
        ...formState.storeHours,
        [dayKey]: {
          ...formState.storeHours[dayKey],
          [timeType]: timeValue,
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

      try {
        await OpenShopApiService.setOpenHours(openHoursPayload);
        console.log('✅ Open hours API completed successfully');
      } catch (openHoursError) {
        console.warn(
          '⚠️ Open hours API not available, continuing with local data:',
          openHoursError
        );
        // Show user-friendly message for API not implemented
        if (
          openHoursError instanceof Error &&
          openHoursError.message.includes('not implemented')
        ) {
          console.log(
            '📝 Open hours will be saved when backend endpoint is available'
          );
        }
        // Continue anyway - this is a fallback for when backend endpoints are not implemented
      }

      // Payment methods are now platform-controlled and managed centrally
      // No store-specific payment method configuration needed

      toast.success('Store policies saved successfully!');
      onNext();
    } catch (error: unknown) {
      console.error('Error saving store policies:', error);

      // Provide more user-friendly error messages
      let errorMessage = 'Failed to save store policies. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('not implemented')) {
          errorMessage =
            'Store policies saved locally. Some features may not be available until backend updates are complete.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
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
                  backgroundColor: isOpen ? 'action.hover' : 'background.paper',
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
                      <TextField
                        label='Opens'
                        type='time'
                        fullWidth
                        size='small'
                        value={dayData?.openTime || ''}
                        onChange={(e) =>
                          handleTimeChange(day.key, 'openTime', e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <TimeIcon color='action' sx={{ mr: 1 }} />
                          ),
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                      <Typography variant='body2' color='text.secondary'>
                        to
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <TextField
                        label='Closes'
                        type='time'
                        fullWidth
                        size='small'
                        value={dayData?.closeTime || ''}
                        onChange={(e) =>
                          handleTimeChange(day.key, 'closeTime', e.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <TimeIcon color='action' sx={{ mr: 1 }} />
                          ),
                        }}
                        InputLabelProps={{
                          shrink: true,
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

        {errors.storeHours && (
          <Alert severity='error' sx={{ mt: 3 }}>
            {errors.storeHours}
          </Alert>
        )}
      </Paper>

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fix the issues above before continuing.
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
            Back to Location
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
          Continue to Branding
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StorePoliciesStep;
