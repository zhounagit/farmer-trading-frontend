import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Store as StoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import { useAuth } from '../../../contexts/AuthContext';
import OpenShopApiService from '../../../services/open-shop.api';
import toast from 'react-hot-toast';

const StoreBasicsStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
}) => {
  const { user } = useAuth();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formState.storeBasics.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!formState.storeBasics.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    updateFormState({
      storeBasics: {
        ...formState.storeBasics,
        [field]: value,
      },
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Get email from user object with fallback
    const userEmail = user?.email?.trim() || '';

    if (!userEmail) {
      toast.error('User email not found. Please log in again.');
      console.error('User object missing email:', user);
      return;
    }

    setIsLoading(true);
    try {
      // Call API: POST /api/stores
      const payload = {
        storeName: formState.storeBasics.storeName.trim(),
        description: formState.storeBasics.description.trim(),
        categoryIds: [], // Empty array for now, can be added later
        storeCreatorEmail: userEmail,
        createdAt: new Date().toISOString(),
      };

      console.log('=== SENDING API REQUEST ===');
      console.log('Store creation payload:', payload);
      console.log('API URL:', '/api/stores');
      console.log('Request time:', new Date().toISOString());

      const response = await OpenShopApiService.createStore(payload);

      console.log('=== API RESPONSE SUCCESS ===');
      console.log('Store creation response:', response);
      console.log('Response time:', new Date().toISOString());
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Store ID from response:', response?.store_id);
      console.log('Store ID type:', typeof response?.store_id);

      // Check for different possible response structures
      if (response?.store_id) {
        console.log('✅ Found store_id:', response.store_id);
      } else if (response?.storeId) {
        console.log('✅ Found storeId:', response.storeId);
      } else if (response?.id) {
        console.log('✅ Found id:', response.id);
      } else {
        console.log('❌ No store ID found in response');
      }

      // Extract store ID with fallback options
      const storeId = response?.store_id || response?.storeId || response?.id;
      console.log('Final extracted storeId:', storeId);

      if (!storeId) {
        throw new Error('No store ID returned from server');
      }

      // Update form state with store ID for next steps
      updateFormState({
        storeId: storeId,
      });

      toast.success('Store basics saved successfully!');

      // Add small delay to ensure state update completes
      setTimeout(() => {
        onNext();
      }, 100);
    } catch (error: any) {
      console.error('=== API ERROR ===');
      console.error('Full error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Has response:', !!error?.response);
      console.error('Response status:', error?.response?.status);
      console.error('Response data:', error?.response?.data);
      console.error('Original error:', error?.originalError);

      // Better error handling
      let errorMessage = 'Failed to create store. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('API Error Details:', errorData);

        if (errorData.errors) {
          // Handle validation errors
          const validationErrors = Object.entries(errorData.errors)
            .map(
              ([field, messages]: [string, any]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            )
            .join('; ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else if (errorData.title) {
          errorMessage = errorData.title;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
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
        Store Basics - Step 1 ONLY (Name & Description)
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Let's start with the basic information about your store.
      </Typography>

      <Paper
        elevation={1}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Store Name Field */}
          <TextField
            label='Store Name'
            placeholder='Enter your store name'
            value={formState.storeBasics.storeName}
            onChange={(e) => handleInputChange('storeName', e.target.value)}
            error={!!errors.storeName}
            helperText={errors.storeName}
            fullWidth
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <StoreIcon color='action' />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />

          {/* Description Field */}
          <TextField
            label='Description'
            placeholder='Describe your store and what you sell'
            value={formState.storeBasics.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            multiline
            rows={4}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position='start'
                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                >
                  <DescriptionIcon color='action' />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
              },
            }}
          />
        </Box>
      </Paper>

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fill in all required fields.
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
          disabled={
            !formState.storeBasics.storeName.trim() ||
            !formState.storeBasics.description.trim()
          }
        >
          Continue to Locations
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StoreBasicsStep;
