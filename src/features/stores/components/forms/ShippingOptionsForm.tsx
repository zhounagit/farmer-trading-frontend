import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from '@mui/material';

interface ShippingOptionsFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const ShippingOptionsForm: React.FC<ShippingOptionsFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const deliveryRadiusOptions = [
    { value: '5', label: '5 miles' },
    { value: '10', label: '10 miles' },
    { value: '15', label: '15 miles' },
    { value: '20', label: '20 miles' },
    { value: '25', label: '25 miles' },
    { value: '30', label: '30 miles' },
    { value: '50', label: '50 miles' },
    { value: 'custom', label: 'Custom radius' },
  ];

  const deliveryDaysOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const handleFieldChange = (field: string, value: any) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        shippingOptions: {
          ...formState.locationLogistics?.shippingOptions,
          [field]: value,
        },
      },
    });
  };

  const handleDeliveryDaysChange = (day: string, checked: boolean) => {
    const currentDays =
      formState.locationLogistics?.shippingOptions?.deliveryDays || [];
    let newDays: string[];

    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter((d: string) => d !== day);
    }

    handleFieldChange('deliveryDays', newDays);
  };

  const shippingOptions = formState.locationLogistics?.shippingOptions || {};
  const deliveryDays = shippingOptions.deliveryDays || [];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Local Delivery Options
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Configure your local delivery service area, fees, and scheduling
        options.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            label='Delivery Radius'
            value={shippingOptions.deliveryRadius || ''}
            onChange={(e) =>
              handleFieldChange('deliveryRadius', e.target.value)
            }
            error={!!errors?.shippingOptions?.deliveryRadius}
            helperText={
              errors?.shippingOptions?.deliveryRadius?.message ||
              'Maximum distance you will deliver from your location'
            }
            required
            fullWidth
            variant='outlined'
          >
            {deliveryRadiusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type='number'
            label='Custom Radius (miles)'
            placeholder='Enter custom radius'
            value={shippingOptions.customRadius || ''}
            onChange={(e) => handleFieldChange('customRadius', e.target.value)}
            error={!!errors?.shippingOptions?.customRadius}
            helperText={errors?.shippingOptions?.customRadius?.message}
            fullWidth
            variant='outlined'
            inputProps={{ min: 1, max: 100 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type='number'
            label='Minimum Order for Delivery'
            placeholder='0.00'
            value={shippingOptions.minimumOrder || ''}
            onChange={(e) => handleFieldChange('minimumOrder', e.target.value)}
            error={!!errors?.shippingOptions?.minimumOrder}
            helperText={
              errors?.shippingOptions?.minimumOrder?.message ||
              'Minimum order amount required for free delivery'
            }
            fullWidth
            variant='outlined'
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type='number'
            label='Delivery Fee'
            placeholder='0.00'
            value={shippingOptions.deliveryFee || ''}
            onChange={(e) => handleFieldChange('deliveryFee', e.target.value)}
            error={!!errors?.shippingOptions?.deliveryFee}
            helperText={
              errors?.shippingOptions?.deliveryFee?.message ||
              'Fee for orders below minimum order amount'
            }
            fullWidth
            variant='outlined'
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
            }}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant='body1' fontWeight={600} sx={{ mb: 2 }}>
            Delivery Days
          </Typography>
          <Grid container spacing={1}>
            {deliveryDaysOptions.map((day) => (
              <Grid item xs={12} sm={6} md={4} key={day.value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={deliveryDays.includes(day.value)}
                      onChange={(e) =>
                        handleDeliveryDaysChange(day.value, e.target.checked)
                      }
                      sx={{
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={day.label}
                />
              </Grid>
            ))}
          </Grid>
          {errors?.shippingOptions?.deliveryDays && (
            <Typography
              variant='caption'
              color='error'
              sx={{ mt: 1, display: 'block' }}
            >
              {errors.shippingOptions.deliveryDays.message}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Delivery Time Windows'
            placeholder='e.g., 2pm-5pm, 6pm-8pm'
            value={shippingOptions.deliveryTimeWindows || ''}
            onChange={(e) =>
              handleFieldChange('deliveryTimeWindows', e.target.value)
            }
            error={!!errors?.shippingOptions?.deliveryTimeWindows}
            helperText={
              errors?.shippingOptions?.deliveryTimeWindows?.message ||
              'When you typically make deliveries'
            }
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Delivery Instructions'
            placeholder='e.g., "Leave at front door", "Call upon arrival"'
            value={shippingOptions.deliveryInstructions || ''}
            onChange={(e) =>
              handleFieldChange('deliveryInstructions', e.target.value)
            }
            error={!!errors?.shippingOptions?.deliveryInstructions}
            helperText={
              errors?.shippingOptions?.deliveryInstructions?.message ||
              'Any special delivery instructions or requirements'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={3}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={shippingOptions.sameDayDelivery || false}
                onChange={(e) =>
                  handleFieldChange('sameDayDelivery', e.target.checked)
                }
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label='Offer same-day delivery'
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Advance Notice Required'
            placeholder='e.g., "24 hours", "2 days"'
            value={shippingOptions.advanceNotice || ''}
            onChange={(e) => handleFieldChange('advanceNotice', e.target.value)}
            error={!!errors?.shippingOptions?.advanceNotice}
            helperText={
              errors?.shippingOptions?.advanceNotice?.message ||
              'How far in advance orders must be placed for delivery'
            }
            fullWidth
            variant='outlined'
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingOptionsForm;
