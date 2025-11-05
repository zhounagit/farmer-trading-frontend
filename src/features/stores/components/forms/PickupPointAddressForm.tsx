import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

interface PickupPointAddressFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const PickupPointAddressForm: React.FC<PickupPointAddressFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const handleFieldChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        pickupPointAddress: {
          ...formState.locationLogistics?.pickupPointAddress,
          [field]: value,
        },
      },
    });
  };

  const handleSeasonalChange = (checked: boolean) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        pickupPointAddress: {
          ...formState.locationLogistics?.pickupPointAddress,
          seasonal: checked,
        },
      },
    });
  };

  const pickupPointAddress =
    formState.locationLogistics?.pickupPointAddress || {};
  const isSeasonal = pickupPointAddress.seasonal || false;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Farmers Market / Pickup Point Address
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Provide the address and details for your farmers market or other pickup
        locations.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            label='Location Name'
            placeholder='e.g., Downtown Farmers Market, Community Center'
            value={pickupPointAddress.locationName || ''}
            onChange={(e) => handleFieldChange('locationName', e.target.value)}
            error={!!errors?.pickupPointAddress?.locationName}
            helperText={
              errors?.pickupPointAddress?.locationName?.message ||
              'Name of the farmers market or pickup location'
            }
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label='Address'
            placeholder='Enter street address'
            value={pickupPointAddress.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            error={!!errors?.pickupPointAddress?.street}
            helperText={errors?.pickupPointAddress?.street?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            label='City'
            placeholder='Enter city'
            value={pickupPointAddress.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            error={!!errors?.pickupPointAddress?.city}
            helperText={errors?.pickupPointAddress?.city?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            label='State/Province'
            placeholder='Enter state or province'
            value={pickupPointAddress.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            error={!!errors?.pickupPointAddress?.state}
            helperText={errors?.pickupPointAddress?.state?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            label='Postal Code'
            placeholder='Enter postal code'
            value={pickupPointAddress.postalCode || ''}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            error={!!errors?.pickupPointAddress?.postalCode}
            helperText={errors?.pickupPointAddress?.postalCode?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <TextField
            label='Country'
            placeholder='Enter country'
            value={pickupPointAddress.country || ''}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            error={!!errors?.pickupPointAddress?.country}
            helperText={errors?.pickupPointAddress?.country?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label='Operating Hours'
            placeholder='e.g., Saturdays 8am-1pm, Wednesdays 3pm-7pm'
            value={pickupPointAddress.operatingHours || ''}
            onChange={(e) =>
              handleFieldChange('operatingHours', e.target.value)
            }
            error={!!errors?.pickupPointAddress?.operatingHours}
            helperText={
              errors?.pickupPointAddress?.operatingHours?.message ||
              'When this location is open for business'
            }
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label='Pickup Instructions'
            placeholder='Enter pickup instructions for customers'
            value={pickupPointAddress.pickupInstructions || ''}
            onChange={(e) =>
              handleFieldChange('pickupInstructions', e.target.value)
            }
            error={!!errors?.pickupPointAddress?.pickupInstructions}
            helperText={
              errors?.pickupPointAddress?.pickupInstructions?.message ||
              'Specific instructions for customers (e.g., "Look for our blue tent", "Ask for vendor #12")'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={3}
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSeasonal}
                onChange={(e) => handleSeasonalChange(e.target.checked)}
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label='This is a seasonal location'
          />
        </Grid>

        {isSeasonal && (
          <Grid size={12}>
            <TextField
              label='Seasonal Dates'
              placeholder='e.g., May 1 - October 31'
              value={pickupPointAddress.seasonalDates || ''}
              onChange={(e) =>
                handleFieldChange('seasonalDates', e.target.value)
              }
              error={!!errors?.pickupPointAddress?.seasonalDates}
              helperText={
                errors?.pickupPointAddress?.seasonalDates?.message ||
                'Start and end dates for seasonal operation'
              }
              fullWidth
              variant='outlined'
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default PickupPointAddressForm;
