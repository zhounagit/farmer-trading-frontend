import React from 'react';
import { Typography, Grid, TextField, Paper } from '@mui/material';

interface BusinessAddressFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const BusinessAddressForm: React.FC<BusinessAddressFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const handleFieldChange = (field: string, value: string) => {
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

  const businessAddress = formState.locationLogistics?.businessAddress || {};

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Business Address
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Provide your main business address. This will be used for official
        communications and business registration.
      </Typography>
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            label='Street Address'
            placeholder='Enter street address'
            value={businessAddress.street || ''}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            error={!!errors?.businessAddress?.street}
            helperText={errors?.businessAddress?.street?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            label='City'
            placeholder='Enter city'
            value={businessAddress.city || ''}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            error={!!errors?.businessAddress?.city}
            helperText={errors?.businessAddress?.city?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            label='State/Province'
            placeholder='Enter state or province'
            value={businessAddress.state || ''}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            error={!!errors?.businessAddress?.state}
            helperText={errors?.businessAddress?.state?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            label='Postal Code'
            placeholder='Enter postal code'
            value={businessAddress.postalCode || ''}
            onChange={(e) => handleFieldChange('postalCode', e.target.value)}
            error={!!errors?.businessAddress?.postalCode}
            helperText={errors?.businessAddress?.postalCode?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <TextField
            label='Country'
            placeholder='Enter country'
            value={businessAddress.country || ''}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            error={!!errors?.businessAddress?.country}
            helperText={errors?.businessAddress?.country?.message}
            required
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label='Additional Address Information'
            placeholder='Optional additional information'
            value={businessAddress.additionalInfo || ''}
            onChange={(e) =>
              handleFieldChange('additionalInfo', e.target.value)
            }
            error={!!errors?.businessAddress?.additionalInfo}
            helperText={
              errors?.businessAddress?.additionalInfo?.message ||
              'Suite number, building name, or other delivery instructions'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={2}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BusinessAddressForm;
