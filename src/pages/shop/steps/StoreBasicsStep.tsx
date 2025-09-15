import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Alert,
  Paper,
  InputAdornment,
  Chip,
  Button,
  Autocomplete,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Store as StoreIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import { useAuth } from '../../../contexts/AuthContext';
import { tokenUtils } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../../services/open-shop.api';
import StoreApiService, {
  type StoreCategory,
} from '../../../services/store.api';
import toast from 'react-hot-toast';

const StoreBasicsStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const apiCategories = await StoreApiService.getAllStoreCategories();
        setCategories(apiCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formState.storeBasics.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    }

    if (!formState.storeBasics.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (
      !formState.storeBasics.categories ||
      formState.storeBasics.categories.length === 0
    ) {
      newErrors.categories = 'At least one category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
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

      return;
    }

    setIsLoading(true);
    try {
      // Call API: POST /api/stores
      const payload = {
        storeName: formState.storeBasics.storeName.trim(),
        description: formState.storeBasics.description.trim(),
        categories: formState.storeBasics.categories,
        storeCreatorEmail: userEmail,
        createdAt: new Date().toISOString(),
      };

      const response = await OpenShopApiService.createStore(payload);

      // Check for different possible response structures

      // Extract store ID with fallback options
      const storeId = response?.store_id || response?.storeId || response?.id;

      if (!storeId) {
        throw new Error('No store ID returned from server');
      }

      // Handle new JWT token if provided (user role updated to Store Owner)
      if (response?.accessToken) {
        // Update stored token with new role claims
        tokenUtils.setAccessToken(response.accessToken);

        // Update user data in localStorage if userType is provided
        if (response.userType) {
          const storedUserData = localStorage.getItem('heartwood_user_data');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              userData.userType = response.userType;
              userData.hasStore = true;
              localStorage.setItem(
                'heartwood_user_data',
                JSON.stringify(userData)
              );
            } catch (error) {
              console.warn('Failed to update stored user data:', error);
            }
          }
        }
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
      // Better error handling
      let errorMessage = 'Failed to create store. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;

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
        Store Basics - Step 1
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

          {/* Categories Selection */}
          <Box sx={{ mb: 2 }}>
            <Autocomplete
              multiple
              options={categories.map((cat) => cat.name)}
              value={formState.storeBasics.categories || []}
              onChange={(_, newValue) => {
                handleInputChange('categories', newValue);
              }}
              loading={categoriesLoading}
              disabled={categoriesLoading}
              disableCloseOnSelect={true}
              limitTags={3}
              getLimitTagsText={(more) => `+${more} more`}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    style={{ marginRight: 8 }}
                    checked={selected}
                    color='primary'
                  />
                  <ListItemText primary={option} />
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='What do you sell? *'
                  placeholder={
                    categoriesLoading
                      ? 'Loading categories...'
                      : 'Choose all categories that apply to your store'
                  }
                  error={!!errors.categories}
                  helperText={
                    errors.categories ||
                    'Select multiple categories - dropdown stays open for easy selection'
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position='start'>
                          <CategoryIcon color='action' />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                    },
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size='small'
                    icon={<CategoryIcon />}
                    color='primary'
                    variant='outlined'
                    sx={{ m: 0.25 }}
                  />
                ))
              }
              ChipProps={{
                size: 'small',
                color: 'primary',
                variant: 'outlined',
              }}
              sx={{
                '& .MuiAutocomplete-tag': {
                  margin: '2px',
                  maxWidth: 'calc(100% - 6px)',
                },
                '& .MuiAutocomplete-inputRoot': {
                  flexWrap: 'wrap',
                  '& .MuiAutocomplete-input': {
                    minWidth: '120px',
                  },
                },
              }}
            />
          </Box>
        </Box>
      </Paper>

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fill in all required fields.
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
        <Button
          variant='text'
          onClick={() => navigate(user?.hasStore ? '/dashboard' : '/')}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            order: { xs: 2, sm: 1 },
          }}
        >
          Save & Exit Later
        </Button>

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
          disabled={
            !formState.storeBasics.storeName.trim() ||
            !formState.storeBasics.description.trim() ||
            !formState.storeBasics.categories ||
            formState.storeBasics.categories.length === 0 ||
            categoriesLoading
          }
        >
          Continue to Locations
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StoreBasicsStep;
