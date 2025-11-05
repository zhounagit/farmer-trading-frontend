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
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Store as StoreIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  Handshake as PartnershipIcon,
  Agriculture as AgricultureIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../services/open-shop.types';
import { useAuth } from '@/contexts/AuthContext';
import { tokenUtils } from '@/utils/api';
import { useNavigate } from 'react-router-dom';

import { StoresApiService } from '../../services/storesApi';
import type { StoreCategory } from '@/shared/types/store';

import toast from 'react-hot-toast';

// Enhanced interfaces for setup flow
interface CategoryFlowOption {
  key: string;
  label: string;
  description: string;
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  canRetail: boolean;
  needsPartnerships: boolean;
  partnerType?: string;
}

interface CategoryFlowConfiguration {
  categoryName: string;
  question: string;
  options: CategoryFlowOption[];
}

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

  // Enhanced setup flow state
  const [categoryFlows, setCategoryFlows] = useState<{
    [key: string]: CategoryFlowConfiguration;
  }>({});
  const [categoryResponses, setCategoryResponses] = useState<{
    [key: string]: string;
  }>({});

  // Load categories and flow configurations from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setCategoriesLoading(true);

        // Load categories
        const apiCategories = await StoresApiService.getAllStoreCategories();
        setCategories(apiCategories);

        // Load category flow configurations
        const token = tokenUtils.getAccessToken();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/stores/setup-flow/category-flows', {
          headers,
        });
        if (response.ok) {
          const flowData = await response.json();
          // Handle nested API response structure: { data: { data: { categoryFlows } } }
          const categoryFlowsData = flowData.data?.data || flowData.data;
          setCategoryFlows(categoryFlowsData);
          if (categoryFlowsData['Live Animals']) {
            console.log(
              '🐄 Live Animals flow options:',
              categoryFlowsData['Live Animals'].options
            );

            // Log each option with its key and details
            categoryFlowsData['Live Animals'].options.forEach(
              (option: CategoryFlowOption, index: number) => {
                console.log(`🐄 Option ${index + 1}:`, {
                  key: option.key,
                  label: option.label,
                  description: option.description,
                  storeType: option.storeType,
                  canProduce: option.canProduce,
                  canProcess: option.canProcess,
                  needsPartnerships: option.needsPartnerships,
                  partnerType: option.partnerType,
                });
              }
            );
          }
          if (categoryFlowsData['Meat Processing']) {
            console.log(
              '🥩 Meat Processing flow options:',
              categoryFlowsData['Meat Processing'].options
            );

            // Log each option with its key and details
            categoryFlowsData['Meat Processing'].options.forEach(
              (option: CategoryFlowOption, index: number) => {
                console.log(`🥩 Option ${index + 1}:`, {
                  key: option.key,
                  label: option.label,
                  description: option.description,
                  storeType: option.storeType,
                  canProduce: option.canProduce,
                  canProcess: option.canProcess,
                  needsPartnerships: option.needsPartnerships,
                  partnerType: option.partnerType,
                });
              }
            );
          }
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load categories. Please refresh the page.');
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Check if selected categories need additional flow questions
  useEffect(() => {
    const selectedCategories = formState.storeBasics.categories || [];
    const needsFlow = selectedCategories.some((cat) => categoryFlows[cat]);

    // Update partnership intent based on category flows
    if (needsFlow) {
      // Partnership intent is now derived from category flows automatically
      // No need to set separate state
    }
  }, [formState.storeBasics.categories, categoryFlows]);

  // Initialize partnership state in edit mode with existing store data
  useEffect(() => {
    if (formState.storeId && formState.storeBasics?.setupFlow) {
      const setupFlow = formState.storeBasics.setupFlow;

      // Restore category responses
      if (setupFlow.categoryResponses) {
        setCategoryResponses(setupFlow.categoryResponses);
      }

      // Partnership intent is now derived from category flows
      // No need to restore separate state

      console.log('🔧 Edit mode: Restored partnership state:', {
        categoryResponses: setupFlow.categoryResponses,
      });
    }
  }, [formState.storeId, formState.storeBasics?.setupFlow]);

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

    // Validate category flow responses
    const selectedCategories = formState.storeBasics.categories || [];
    for (const category of selectedCategories) {
      if (categoryFlows[category] && !categoryResponses[category]) {
        newErrors[`category_${category}`] =
          `Please answer the question for ${category}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const deriveStoreConfiguration = () => {
    const selectedCategories = formState.storeBasics.categories || [];
    let storeType = 'independent';
    let canProduce = false;
    let canProcess = false;
    let canRetail = true;
    let needsPartnerships = false;
    let needPartnership = 'no'; // 'yes', 'no', 'hybrid'
    let partnershipType = '';

    for (const category of selectedCategories) {
      const flow = categoryFlows[category];
      if (flow && categoryResponses[category]) {
        const selectedOption = flow.options.find(
          (option) => option.key === categoryResponses[category]
        );
        if (selectedOption) {
          if (selectedOption.canProduce) canProduce = true;
          if (selectedOption.canProcess) canProcess = true;
          if (selectedOption.canRetail !== undefined)
            canRetail = selectedOption.canRetail;
          if (selectedOption.needsPartnerships) {
            needsPartnerships = true;
            needPartnership = 'yes';
            partnershipType = selectedOption.partnerType || '';
          }

          // Set store type based on capabilities
          if (canProduce && canProcess) {
            storeType = 'hybrid';
          } else if (canProduce) {
            storeType = 'producer';
          } else if (canProcess) {
            storeType = 'processor';
          }
        }
      }
    }

    return {
      storeType,
      canProduce,
      canProcess,
      canRetail,
      needsPartnerships,
      needPartnership,
      partnershipType,
    };
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

  const handleCategoryResponseChange = (category: string, response: string) => {
    setCategoryResponses((prev) => ({
      ...prev,
      [category]: response,
    }));

    // Clear error for this category
    if (errors[`category_${category}`]) {
      setErrors((prev) => ({
        ...prev,
        [`category_${category}`]: '',
      }));
    }

    // Update partnership intent based on category selection
    const config = deriveStoreConfiguration();
    console.log('🔍 Partnership config after category change:', {
      category,
      response,
      needsPartnerships: config.needsPartnerships,
      partnershipType: config.partnershipType,
      selectedCategories: formState.storeBasics.categories,
      categoryResponses,
    });
    // Partnership intent is automatically updated through deriveStoreConfiguration()
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
      const config = deriveStoreConfiguration();

      // Enhanced payload with setup flow data
      // Prepare API payload
      const payload = {
        storeName: formState.storeBasics.storeName.trim(),
        description: formState.storeBasics.description.trim() || undefined,
        categories: formState.storeBasics.categories,
        storeCreatorEmail: userEmail,
        needPartnership: config.needPartnership, // 'yes', 'no', 'hybrid'
        setupFlow: {
          selectedCategoryIds: categories
            .filter((cat) =>
              formState.storeBasics.categories?.includes(cat.name)
            )
            .map((cat) => cat.categoryId),
          categoryResponses,
          partnershipRadiusMi: 50, // Default partnership radius
          selectedPartnerIds: [], // Empty initially, will be populated in partnership step
          derivedStoreType: config.storeType,
          derivedCanProduce: config.canProduce,
          derivedCanProcess: config.canProcess,
          derivedCanRetail: config.canRetail,
          needsPartnerships: config.needsPartnerships,
          needPartnership: config.needPartnership, // 'yes', 'no', 'hybrid'
          partnershipType: config.partnershipType,
        },
      };

      const response = await fetch('/api/stores/setup-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenUtils.getAccessToken()}`,
        },
        body: JSON.stringify(payload),
      });

      // We'll set the needsPartnerships property after we get the API response

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create store');
      }

      const result = await response.json();

      // Handle both camelCase and snake_case response formats
      const storeId =
        result?.data?.storeId ||
        result?.storeId ||
        result?.data?.store_id ||
        result?.store_id;

      // Extract backend-validated data from response
      const responseData = result?.data || result;
      const backendStoreType = responseData?.storeType || config.storeType;
      const backendNeedsPartnerships =
        responseData?.needsPartnerships ?? config.needsPartnerships;
      const backendPartnershipType =
        responseData?.partnershipType || config.partnershipType;

      if (!storeId) {
        throw new Error('No store ID returned from server');
      }

      // Update form state with store ID and backend-validated setup flow configuration
      updateFormState({
        storeId: storeId,
        storeBasics: {
          ...formState.storeBasics,
          // Set the needsPartnerships at the top level to ensure partnership step is shown
          needsPartnerships:
            backendNeedsPartnerships || config.needsPartnerships,
          setupFlow: {
            selectedCategoryIds: categories
              .filter((cat) =>
                formState.storeBasics.categories?.includes(cat.name)
              )
              .map((cat) => cat.categoryId),
            categoryResponses,
            partnershipRadiusMi: 50,
            selectedPartnerIds: [],
            derivedStoreType: backendStoreType,
            derivedCanProduce: config.canProduce,
            derivedCanProcess: config.canProcess,
            derivedCanRetail: config.canRetail,
            needsPartnerships:
              backendNeedsPartnerships || config.needsPartnerships,
            partnershipType: backendPartnershipType,
          },
        },
      });

      toast.success(`Store created successfully as ${backendStoreType}!`);

      // Add small delay to ensure state update completes
      setTimeout(() => {
        onNext();
      }, 100);
    } catch (error: unknown) {
      let errorMessage = 'Failed to create store. Please try again.';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryFlowQuestions = () => {
    const selectedCategories = formState.storeBasics.categories || [];
    const categoriesWithFlows = selectedCategories.filter(
      (cat) => categoryFlows[cat]
    );

    if (categoriesWithFlows.length === 0) return null;

    return (
      <Paper
        elevation={1}
        sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.50' }}
      >
        <Typography
          variant='h6'
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AgricultureIcon color='primary' />
          Store Setup Configuration
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Based on your selected categories, please answer these questions to
          optimize your store setup.
        </Typography>

        {categoriesWithFlows.map((category) => {
          const flow = categoryFlows[category];
          if (!flow) return null;

          return (
            <Accordion key={category} sx={{ mb: 2 }} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight={600}>
                  {category}: {flow.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl component='fieldset' fullWidth>
                  <RadioGroup
                    value={categoryResponses[category] || ''}
                    onChange={(e) =>
                      handleCategoryResponseChange(category, e.target.value)
                    }
                  >
                    {flow.options.map((option) => (
                      <FormControlLabel
                        key={option.key}
                        value={option.key}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant='body1' fontWeight={500}>
                              {option.label}
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {option.description}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          mb: 1,
                          alignItems: 'flex-start',
                          '& .MuiRadio-root': { mt: 0.5 },
                        }}
                      />
                    ))}
                  </RadioGroup>
                  {errors[`category_${category}`] && (
                    <Alert severity='error' sx={{ mt: 1 }}>
                      {errors[`category_${category}`]}
                    </Alert>
                  )}
                </FormControl>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Partnership Status Information */}
        {deriveStoreConfiguration().needsPartnerships && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PartnershipIcon color='primary' />
                Partnership Setup Required
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Based on your category selections, your store requires
                partnerships with other local businesses to provide complete
                services.
              </Typography>
              <Alert severity='info'>
                You'll be able to configure your partnership preferences and
                search for compatible partners in the next step.
              </Alert>
            </CardContent>
          </Card>
        )}
      </Paper>
    );
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
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                  borderWidth: '1px !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                  borderWidth: '1px !important',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: 'rgba(0, 0, 0, 0.6) !important',
                },
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
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                  borderWidth: '1px !important',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23) !important',
                  borderWidth: '1px !important',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(0, 0, 0, 0.6)',
                '&.Mui-focused': {
                  color: 'rgba(0, 0, 0, 0.6) !important',
                },
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
                    'Select multiple categories - some may require additional setup questions'
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

      {/* Category Flow Questions */}
      {renderCategoryFlowQuestions()}

      {Object.keys(errors).length > 0 && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Please fill in all required fields and answer configuration questions.
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
            categoriesLoading ||
            Object.keys(errors).length > 0
          }
        >
          {(() => {
            const config = deriveStoreConfiguration();
            if (config.storeType !== 'independent') {
              const storeType =
                config.storeType.charAt(0).toUpperCase() +
                config.storeType.slice(1);
              return `Continue as ${storeType} Store`;
            }
            return 'Continue to Locations';
          })()}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StoreBasicsStep;
