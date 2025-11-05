import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

interface FarmgateAddressFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const FarmgateAddressForm: React.FC<FarmgateAddressFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const handleFieldChange = (field: string, value: string) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        farmgateAddress: {
          ...formState.locationLogistics?.farmgateAddress,
          [field]: value,
        },
      },
    });
  };

  const handleSameAsBusinessChange = (checked: boolean) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        farmgateSameAsBusinessAddress: checked,
        farmgateAddress: checked
          ? { ...formState.locationLogistics?.businessAddress }
          : {},
      },
    });
  };

  const farmgateAddress = formState.locationLogistics?.farmgateAddress || {};
  const sameAsBusiness =
    formState.locationLogistics?.farmgateSameAsBusinessAddress || false;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Farmgate Pickup Address
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Provide the address where customers can pick up orders directly from
        your farm.
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={sameAsBusiness}
            onChange={(e) => handleSameAsBusinessChange(e.target.checked)}
            sx={{
              '&.Mui-checked': {
                color: 'primary.main',
              },
            }}
          />
        }
        label='Same as business address'
        sx={{ mb: 3 }}
      />
      {!sameAsBusiness && (
        <Grid container spacing={3}>
          <Grid size={12}>
            <TextField
              label='Farm Address'
              placeholder='Enter farm street address'
              value={farmgateAddress.street || ''}
              onChange={(e) => handleFieldChange('street', e.target.value)}
              error={!!errors?.farmgateAddress?.street}
              helperText={errors?.farmgateAddress?.street?.message}
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
              value={farmgateAddress.city || ''}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              error={!!errors?.farmgateAddress?.city}
              helperText={errors?.farmgateAddress?.city?.message}
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
              value={farmgateAddress.state || ''}
              onChange={(e) => handleFieldChange('state', e.target.value)}
              error={!!errors?.farmgateAddress?.state}
              helperText={errors?.farmgateAddress?.state?.message}
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
              value={farmgateAddress.postalCode || ''}
              onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              error={!!errors?.farmgateAddress?.postalCode}
              helperText={errors?.farmgateAddress?.postalCode?.message}
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
              value={farmgateAddress.country || ''}
              onChange={(e) => handleFieldChange('country', e.target.value)}
              error={!!errors?.farmgateAddress?.country}
              helperText={errors?.farmgateAddress?.country?.message}
              required
              fullWidth
              variant='outlined'
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Pickup Instructions'
              placeholder='Enter pickup instructions for customers'
              value={farmgateAddress.pickupInstructions || ''}
              onChange={(e) =>
                handleFieldChange('pickupInstructions', e.target.value)
              }
              error={!!errors?.farmgateAddress?.pickupInstructions}
              helperText={
                errors?.farmgateAddress?.pickupInstructions?.message ||
                'Specific instructions for customers picking up orders (e.g., "Look for the red barn", "Call upon arrival")'
              }
              fullWidth
              variant='outlined'
              multiline
              rows={3}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label='Farmgate Business Hours'
              placeholder='e.g., Mon-Fri 9am-5pm, Sat 10am-2pm'
              value={farmgateAddress.businessHours || ''}
              onChange={(e) =>
                handleFieldChange('businessHours', e.target.value)
              }
              error={!!errors?.farmgateAddress?.businessHours}
              helperText={
                errors?.farmgateAddress?.businessHours?.message ||
                'When customers can pick up orders from your farm'
              }
              fullWidth
              variant='outlined'
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default FarmgateAddressForm;
