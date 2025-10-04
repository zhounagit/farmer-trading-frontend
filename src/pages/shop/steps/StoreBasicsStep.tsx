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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
} from '@mui/material';
import {
  Store as StoreIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  ExpandMore as ExpandMoreIcon,
  Agriculture as AgricultureIcon,
  LocalDining as ProcessingIcon,
  Handshake as PartnershipIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { type StepProps } from '../../../types/open-shop.types';
import { useAuth } from '../../../contexts/AuthContext';
import { tokenUtils, STORAGE_KEYS } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import OpenShopApiService from '../../../services/open-shop.api';
import StoreApiService, {
  type StoreCategory,
} from '../../../services/store.api';

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

interface PotentialPartner {
  storeId: number;
  storeName: string;
  description?: string;
  storeType: string;
  distanceMiles: number;
  existingPartnershipStatus?: string;
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
  const [partnershipRadius, setPartnershipRadius] = useState(50);
  const [potentialPartners, setPotentialPartners] = useState<
    PotentialPartner[]
  >([]);
  const [selectedPartners, setSelectedPartners] = useState<number[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [showPartnershipStep, setShowPartnershipStep] = useState(false);

  // Load categories and flow configurations from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setCategoriesLoading(true);

        // Load categories
        const apiCategories = await StoreApiService.getAllStoreCategories();
        setCategories(apiCategories);

        // Load category flow configurations
        const response = await fetch('/api/stores/setup-flow/category-flows');
        if (response.ok) {
          const flowData = await response.json();
          setCategoryFlows(flowData.data);

          // Debug: Log category flows to see available options
          console.log('🔧 Category flows loaded:', flowData.data);

          // Log specific Live Animals flow options
          if (flowData.data['Live Animals']) {
            console.log(
              '🐄 Live Animals flow options:',
              flowData.data['Live Animals'].options
            );

            // Log each option with its key and details
            flowData.data['Live Animals'].options.forEach((option, index) => {
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
            });
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
    setShowPartnershipStep(needsFlow);
  }, [formState.storeBasics.categories, categoryFlows]);

  // Initialize partnership state in edit mode with existing store data
  useEffect(() => {
    if (formState.storeId && formState.storeBasics?.setupFlow) {
      const setupFlow = formState.storeBasics.setupFlow;

      // Restore partnership radius
      if (setupFlow.partnershipRadiusMi) {
        setPartnershipRadius(setupFlow.partnershipRadiusMi);
      }

      // Restore selected partners
      if (setupFlow.selectedPartnerIds) {
        setSelectedPartners(setupFlow.selectedPartnerIds);
      }

      // Restore category responses
      if (setupFlow.categoryResponses) {
        setCategoryResponses(setupFlow.categoryResponses);
      }

      console.log('🔧 Edit mode: Restored partnership state:', {
        partnershipRadius: setupFlow.partnershipRadiusMi,
        selectedPartners: setupFlow.selectedPartnerIds,
        categoryResponses: setupFlow.categoryResponses,
        needsPartnerships: setupFlow.needsPartnerships,
      });

      // Trigger partnership search if needed (but only after categoryFlows are loaded)
      if (Object.keys(categoryFlows).length > 0) {
        const config = deriveStoreConfiguration();
        if (config.needsPartnerships && config.partnershipType) {
          console.log('🔍 Triggering partnership search for edit mode');
          searchPartners(
            config.partnershipType,
            setupFlow.partnershipRadiusMi || 50
          );
        }
      }
    }
  }, [formState.storeId, formState.storeBasics?.setupFlow, categoryFlows]);

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
    let partnershipType = '';

    for (const category of selectedCategories) {
      const flow = categoryFlows[category];
      const response = categoryResponses[category];

      if (flow && response) {
        const selectedOption = flow.options.find((opt) => opt.key === response);
        if (selectedOption) {
          if (selectedOption.canProduce) canProduce = true;
          if (selectedOption.canProcess) canProcess = true;
          if (selectedOption.canRetail !== undefined)
            canRetail = selectedOption.canRetail;
          if (selectedOption.needsPartnerships) {
            needsPartnerships = true;
            partnershipType = selectedOption.partnerType || '';
          }

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
      partnershipType,
    };
  };

  // Helper function to get auth token
  const getAuthToken = (): string | null => {
    const token = localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN || 'helloneighbors_access_token'
    );
    if (token) {
      try {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        if (isExpired) {
          console.error('🔐 Token is expired');
          return null;
        }
        return token;
      } catch (error) {
        console.error('🔐 Failed to parse token:', error);
        return null;
      }
    }
    return null;
  };

  const searchPartners = async (partnerType: string, radius: number) => {
    if (!formState.storeId) return;

    setPartnersLoading(true);
    try {
      // Get the auth token using helper function
      const token = getAuthToken();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔐 Adding auth token to partnership search request');
      } else {
        console.warn('⚠️ No auth token found for partnership search');
      }

      const response = await fetch(
        `/api/stores/${formState.storeId}/potential-partners?partnerType=${partnerType}&radiusMiles=${radius}`,
        {
          method: 'GET',
          headers: headers,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPotentialPartners(data.data || []);
        console.log('✅ Successfully loaded potential partners');
      } else {
        console.error(
          '❌ Partnership search failed with status:',
          response.status
        );
        if (response.status === 401) {
          console.error(
            '🔐 Authentication error - token may be invalid or expired'
          );
        }
      }
    } catch (error) {
      console.error('Failed to search partners:', error);
      toast.error('Failed to load potential partners');
    } finally {
      setPartnersLoading(false);
    }
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

    // Update partnership search if needed
    const config = deriveStoreConfiguration();
    if (config.needsPartnerships && config.partnershipType) {
      searchPartners(config.partnershipType, partnershipRadius);
    }
  };

  const handlePartnerToggle = (partnerId: number) => {
    setSelectedPartners((prev) => {
      if (prev.includes(partnerId)) {
        return prev.filter((id) => id !== partnerId);
      } else {
        return [...prev, partnerId];
      }
    });
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
      const payload = {
        storeName: formState.storeBasics.storeName.trim(),
        description: formState.storeBasics.description.trim(),
        categories: formState.storeBasics.categories,
        setupFlow: {
          selectedCategoryIds: categories
            .filter((cat) =>
              formState.storeBasics.categories?.includes(cat.name)
            )
            .map((cat) => cat.categoryId),
          categoryResponses,
          partnershipRadiusMi: partnershipRadius,
          selectedPartnerIds: selectedPartners,
          derivedStoreType: config.storeType,
          derivedCanProduce: config.canProduce,
          derivedCanProcess: config.canProcess,
          derivedCanRetail: config.canRetail,
          needsPartnerships: config.needsPartnerships,
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create store');
      }

      const result = await response.json();
      const storeId = result?.store_id;

      if (!storeId) {
        throw new Error('No store ID returned from server');
      }

      // Update form state with store ID and setup flow configuration for next steps
      updateFormState({
        storeId: storeId,
        storeBasics: {
          ...formState.storeBasics,
          setupFlow: {
            selectedCategoryIds: categories
              .filter((cat) =>
                formState.storeBasics.categories?.includes(cat.name)
              )
              .map((cat) => cat.categoryId),
            categoryResponses,
            partnershipRadiusMi: partnershipRadius,
            selectedPartnerIds: selectedPartners,
            derivedStoreType: config.storeType,
            derivedCanProduce: config.canProduce,
            derivedCanProcess: config.canProcess,
            derivedCanRetail: config.canRetail,
            needsPartnerships: config.needsPartnerships,
            partnershipType: config.partnershipType,
          },
        },
      });

      toast.success(`Store created successfully as ${config.storeType}!`);

      // Add small delay to ensure state update completes
      setTimeout(() => {
        onNext();
      }, 100);
    } catch (error: any) {
      let errorMessage = 'Failed to create store. Please try again.';

      if (error?.message) {
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

        {/* Partnership Configuration */}
        {deriveStoreConfiguration().needsPartnerships && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography
                variant='h6'
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PartnershipIcon color='primary' />
                Partnership Setup
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Configure your partnership preferences to work with other local
                businesses.
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Partnership Radius: {partnershipRadius} miles
                </Typography>
                <Slider
                  value={partnershipRadius}
                  onChange={(_, value) => setPartnershipRadius(value as number)}
                  min={10}
                  max={200}
                  step={10}
                  marks
                  valueLabelDisplay='auto'
                />
              </Box>

              {potentialPartners.length > 0 && (
                <Box>
                  <Typography variant='subtitle2' gutterBottom>
                    Available Live Animals Partners ({potentialPartners.length}{' '}
                    found):
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', mb: 2 }}
                  >
                    Select farms that raise quality livestock within your
                    partnership radius
                  </Typography>
                  <List dense>
                    {potentialPartners.map((partner) => (
                      <ListItem
                        key={partner.storeId}
                        disablePadding
                        sx={{ mb: 1 }}
                      >
                        <ListItemButton
                          onClick={() => handlePartnerToggle(partner.storeId)}
                          selected={selectedPartners.includes(partner.storeId)}
                          sx={{
                            border: '1px solid',
                            borderColor: selectedPartners.includes(
                              partner.storeId
                            )
                              ? 'success.main'
                              : 'divider',
                            borderRadius: 1,
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <ListItemIcon>
                            {selectedPartners.includes(partner.storeId) ? (
                              <CheckCircleIcon color='success' />
                            ) : (
                              <ProcessingIcon color='action' />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Typography variant='subtitle2'>
                                  {partner.storeName}
                                </Typography>
                                <Chip
                                  label='Live Animals'
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant='caption' display='block'>
                                  {partner.storeType} •{' '}
                                  {Math.round(partner.distanceMiles)} miles away
                                </Typography>
                                {partner.description && (
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'
                                    display='block'
                                  >
                                    {partner.description.length > 60
                                      ? `${partner.description.substring(0, 60)}...`
                                      : partner.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  {selectedPartners.length > 0 && (
                    <Alert severity='info' sx={{ mt: 2 }}>
                      You have selected {selectedPartners.length} preferred farm
                      partner{selectedPartners.length > 1 ? 's' : ''}. These
                      partnerships will be established once your store is
                      approved.
                    </Alert>
                  )}
                </Box>
              )}
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
          {deriveStoreConfiguration().storeType !== 'independent'
            ? `Continue as ${deriveStoreConfiguration().storeType.charAt(0).toUpperCase() + deriveStoreConfiguration().storeType.slice(1)} Store`
            : 'Continue to Locations'}
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default StoreBasicsStep;
