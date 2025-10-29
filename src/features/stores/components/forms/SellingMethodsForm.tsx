import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Paper,
} from '@mui/material';

interface SellingMethodsFormProps {
  formState: any;
  updateFormState: (updates: any) => void;
  errors?: Record<string, any>;
}

export const SellingMethodsForm: React.FC<SellingMethodsFormProps> = ({
  formState,
  updateFormState,
  errors,
}) => {
  const sellingMethods = [
    {
      value: 'pickup',
      label: 'Pickup',
      description: 'Customers come to designated location to get their orders',
    },
    {
      value: 'local-delivery',
      label: 'Local Delivery',
      description: 'Deliver products directly to customers',
    },
  ];

  const handleSellingMethodChange = (methodValue: string, checked: boolean) => {
    const currentMethods = formState.locationLogistics?.sellingMethods || [];
    let newMethods: string[];

    if (checked) {
      newMethods = [...currentMethods, methodValue];
    } else {
      newMethods = currentMethods.filter(
        (method: string) => method !== methodValue
      );
    }

    updateFormState({
      locationLogistics: {
        ...formState.locationLogistics,
        sellingMethods: newMethods,
      },
    });
  };

  const selectedMethods = formState.locationLogistics?.sellingMethods || [];

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
      <Typography variant='h6' gutterBottom fontWeight={600}>
        Selling Methods
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Select all the ways you plan to sell your products. This will determine
        which additional logistics information we'll need from you.
      </Typography>

      <FormControl component='fieldset' variant='standard' fullWidth>
        <FormLabel component='legend' sx={{ mb: 2, fontWeight: 600 }}>
          Select Selling Methods
        </FormLabel>
        <FormGroup>
          {sellingMethods.map((method) => (
            <FormControlLabel
              key={method.value}
              control={
                <Checkbox
                  checked={selectedMethods.includes(method.value)}
                  onChange={(e) =>
                    handleSellingMethodChange(method.value, e.target.checked)
                  }
                  sx={{
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant='body1' fontWeight={500}>
                    {method.label}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {method.description}
                  </Typography>
                </Box>
              }
              sx={{
                mb: 2,
                alignItems: 'flex-start',
                '& .MuiFormControlLabel-label': {
                  flex: 1,
                },
              }}
            />
          ))}
        </FormGroup>
        {errors?.sellingMethods && (
          <FormHelperText error>{errors.sellingMethods.message}</FormHelperText>
        )}
      </FormControl>
    </Paper>
  );
};

export default SellingMethodsForm;
