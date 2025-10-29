import React from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';

interface ProcessorLogisticsFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const ProcessorLogisticsForm: React.FC<ProcessorLogisticsFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const handleFieldChange = (field: string, value: any) => {
    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        processorLogistics: {
          ...formState.locationLogistics?.processorLogistics,
          [field]: value,
        },
      },
    });
  };

  const processorLogistics =
    formState.locationLogistics?.processorLogistics || {};

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Processor Logistics
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Configure how you handle processor logistics for live animals and other
        products that require processing.
      </Typography>

      <Alert severity='info' sx={{ mb: 3 }}>
        This section is required for stores selling live animals or products
        that need processing.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  processorLogistics.enableProcessorNotifications || false
                }
                onChange={(e) =>
                  handleFieldChange(
                    'enableProcessorNotifications',
                    e.target.checked
                  )
                }
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label='Enable processor notifications'
          />
        </Grid>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={
                  processorLogistics.enableCustomerProcessorContact || false
                }
                onChange={(e) =>
                  handleFieldChange(
                    'enableCustomerProcessorContact',
                    e.target.checked
                  )
                }
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
            }
            label='Allow customers to contact processors directly'
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Processor Instructions'
            placeholder='Enter processor instructions'
            value={processorLogistics.processorInstructions || ''}
            onChange={(e) =>
              handleFieldChange('processorInstructions', e.target.value)
            }
            error={!!errors?.processorLogistics?.processorInstructions}
            helperText={
              errors?.processorLogistics?.processorInstructions?.message ||
              'Specific instructions for processors (e.g., handling requirements, special processing needs)'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={4}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Preferred Processors'
            placeholder='e.g., Local Meat Processing, Fresh Poultry Co.'
            value={processorLogistics.preferredProcessors || ''}
            onChange={(e) =>
              handleFieldChange('preferredProcessors', e.target.value)
            }
            error={!!errors?.processorLogistics?.preferredProcessors}
            helperText={
              errors?.processorLogistics?.preferredProcessors?.message ||
              'List your preferred processing facilities or partners'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label='Processor Pickup Lead Time'
            placeholder='e.g., 48 hours, 1 week'
            value={processorLogistics.pickupLeadTime || ''}
            onChange={(e) =>
              handleFieldChange('pickupLeadTime', e.target.value)
            }
            error={!!errors?.processorLogistics?.pickupLeadTime}
            helperText={
              errors?.processorLogistics?.pickupLeadTime?.message ||
              'How much notice processors need for pickup'
            }
            fullWidth
            variant='outlined'
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            type='number'
            label='Processing Capacity'
            placeholder='e.g., 10'
            value={processorLogistics.processingCapacity || ''}
            onChange={(e) =>
              handleFieldChange('processingCapacity', e.target.value)
            }
            error={!!errors?.processorLogistics?.processingCapacity}
            helperText={
              errors?.processorLogistics?.processingCapacity?.message ||
              'Maximum number of animals/products you can process per week'
            }
            fullWidth
            variant='outlined'
            inputProps={{ min: 0 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label='Special Processing Requirements'
            placeholder='e.g., USDA certified, organic processing, halal/kosher'
            value={processorLogistics.specialRequirements || ''}
            onChange={(e) =>
              handleFieldChange('specialRequirements', e.target.value)
            }
            error={!!errors?.processorLogistics?.specialRequirements}
            helperText={
              errors?.processorLogistics?.specialRequirements?.message ||
              'Any special handling, certifications, or requirements'
            }
            fullWidth
            variant='outlined'
            multiline
            rows={3}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProcessorLogisticsForm;
