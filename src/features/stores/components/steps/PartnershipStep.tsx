import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Slider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Handshake as PartnershipIcon,
  CheckCircle as CheckCircleIcon,
  Agriculture as AgricultureIcon,
  LocalDining as ProcessingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { partnershipsApi } from '@/features/partnerships/services/partnershipsApi';
import type { StepProps } from '../../services/open-shop.types';

// Extended type to include partnership fields from API response
type ExtendedPotentialPartner = {
  existingPartnershipId?: number;
  existingPartnershipStatus?: string;
} & StepProps['formState']['partnerships']['potentialPartners'][0];

const PartnershipStep: React.FC<StepProps> = ({
  formState,
  updateFormState,
  onNext,
  onPrevious,
}) => {
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPartnerships, setExistingPartnerships] = useState<number[]>(
    []
  );

  // Initialize partnership data if not present
  useEffect(() => {
    if (!formState.partnerships) {
      updateFormState({
        partnerships: {
          partnershipRadiusMi: 50,
          selectedPartnerIds: [],
          partnershipType: '',
          potentialPartners: [],
        },
      });
    }
  }, [formState.partnerships, updateFormState]);

  const partnerships = formState.partnerships || {
    partnershipRadiusMi: 50,
    selectedPartnerIds: [],
    partnershipType: '',
    potentialPartners: [],
  };

  // Determine partnership type based on store configuration
  const getPartnershipType = (): string => {
    const storeType = formState.storeBasics.setupFlow?.derivedStoreType;
    const needPartnership = formState.storeBasics.needPartnership;

    if (needPartnership !== 'yes') return '';

    if (storeType === 'processor') {
      return 'producer'; // Processors need producers
    } else if (storeType === 'producer') {
      return 'processor'; // Producers need processors
    }

    return '';
  };

  // Search for potential partners
  const searchPartners = async () => {
    const partnershipType = getPartnershipType();
    if (!partnershipType || !formState.storeId) {
      setSearchError(
        'Unable to determine partnership type or store ID not available'
      );
      return;
    }

    console.log('🔍 Partnership search debug:', {
      storeId: formState.storeId,
      storeIdType: typeof formState.storeId,
      partnershipType,
      radiusMiles: partnerships.partnershipRadiusMi,
    });

    setPartnersLoading(true);
    setSearchError(null);

    try {
      const partners = await partnershipsApi.searchPotentialPartners({
        storeId: formState.storeId,
        partnerType: partnershipType as 'producer' | 'processor',
        radiusMiles: partnerships.partnershipRadiusMi,
      });

      console.log('🔍 Partners received from API:', partners);
      console.log(
        '🔍 Partners array length:',
        Array.isArray(partners) ? partners.length : 'not array'
      );
      console.log('🔍 Partners data:', partners);
      console.log('🔍 Form state before update:', formState.partnerships);

      updateFormState({
        partnerships: {
          ...partnerships,
          partnershipType,
          potentialPartners: Array.isArray(partners) ? partners : [],
        },
      });

      console.log(
        '🔍 Form state after update - partnerships:',
        formState.partnerships
      );
      console.log(
        '🔍 Form state after update - potentialPartners:',
        formState.partnerships?.potentialPartners
      );
    } catch (error) {
      console.error('Partnership search failed:', error);
      setSearchError('Failed to search for partners. Please try again.');
    } finally {
      setPartnersLoading(false);
    }
  };

  // Save partnerships to database when continuing to next step
  const handleContinue = async () => {
    if (!formState.storeId) {
      toast.error('Store ID not found. Please complete previous steps.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🤝 Saving partnerships to database...');
      console.log('Selected partner IDs:', partnerships.selectedPartnerIds);
      console.log('Existing partnerships:', existingPartnerships);

      // Get partnership type
      const partnershipType = getPartnershipType();
      if (!partnershipType) {
        throw new Error('Unable to determine partnership type');
      }

      // Handle partnerships to be created (new selections)
      const newPartnerIds = partnerships.selectedPartnerIds.filter(
        (id) => !existingPartnerships.includes(id)
      );

      // Handle partnerships to be terminated (deselected)
      const terminatedPartnerIds = existingPartnerships.filter(
        (id) => !partnerships.selectedPartnerIds.includes(id)
      );

      console.log('New partnerships to create:', newPartnerIds);
      console.log('Partnerships to terminate:', terminatedPartnerIds);

      // Create new partnerships - ensure only one record per partnership
      const createPromises = newPartnerIds.map(async (partnerId) => {
        console.log(`🤝 Creating partnership with partner ${partnerId}`);
        console.log(
          `Store ID: ${formState.storeId}, Partnership Type: ${partnershipType}`
        );

        const createRequest = {
          producerStoreId:
            partnershipType === 'producer'
              ? partnerId
              : Number(formState.storeId),
          processorStoreId:
            partnershipType === 'producer'
              ? Number(formState.storeId)
              : partnerId,
          initiatedByStoreId: Number(formState.storeId),
          partnershipTerms: JSON.stringify({
            services: ['collaboration'],
            notes: 'Partnership created during store setup',
          }),
          deliveryArrangements: JSON.stringify({
            method: 'pickup',
            notes: 'To be determined',
          }),
        };

        console.log(`🤝 Creating partnership request:`, {
          ...createRequest,
          partnershipType,
          currentStoreId: formState.storeId,
          partnerStoreId: partnerId,
        });
        try {
          const result = await partnershipsApi.createPartnership(createRequest);
          console.log(`✅ Partnership created successfully:`, result);
          console.log(`✅ Partnership status: ${result?.status || 'pending'}`);
          return { partnerId, success: true, action: 'created' };
        } catch (createError: unknown) {
          console.error(
            `❌ Failed to create partnership with partner ${partnerId}:`,
            {
              error: createError,
              request: createRequest,
              response: result,
            }
          );

          // Check if it's a duplicate partnership error
          const errorData = (createError as any)?.response?.data;
          if (
            errorData?.message?.includes('already exists') ||
            errorData?.error?.includes('already exists')
          ) {
            console.log(
              `ℹ️ Partnership already exists with partner ${partnerId}, skipping creation`
            );
            return { partnerId, success: true, action: 'already_exists' };
          }

          throw createError;
        }
      });

      // Terminate deselected partnerships
      const terminatePromises = terminatedPartnerIds.map(async (partnerId) => {
        console.log(`🤝 Terminating partnership with partner ${partnerId}`);

        // First, find the partnership ID for this partner
        const partner = partnerships.potentialPartners.find(
          (p) => p.storeId === partnerId
        ) as ExtendedPotentialPartner;

        if (partner?.existingPartnershipId) {
          await partnershipsApi.terminatePartnership(
            partner.existingPartnershipId,
            'Partnership deselected during store setup'
          );
          return { partnerId, success: true, action: 'terminated' };
        } else {
          console.warn(
            `⚠️ Could not find partnership ID for partner ${partnerId}`
          );
          return { partnerId, success: false, action: 'terminate_failed' };
        }
      });

      // Wait for all operations to complete
      const results = await Promise.all([
        ...createPromises,
        ...terminatePromises,
      ]);

      const successful = results.filter((r) => r.success).length;
      const total = results.length;
      const created = results.filter((r) => r.action === 'created').length;
      const terminated = results.filter(
        (r) => r.action === 'terminated'
      ).length;

      console.log(
        `✅ Successfully processed ${successful}/${total} partnerships (${created} created, ${terminated} terminated)`
      );

      if (successful > 0) {
        toast.success(
          `Successfully updated partnerships (${created} added, ${terminated} removed)`
        );
      }

      // Update existing partnerships state
      setExistingPartnerships(partnerships.selectedPartnerIds);

      // Proceed to next step
      onNext();
    } catch (error: any) {
      console.error('❌ Error saving partnerships:', error);

      // Extract detailed error message
      let errorMessage = 'Failed to save partnerships. Please try again.';

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code === 'HTTP_400') {
        errorMessage =
          'Invalid partnership request. Please check the selected partners and try again.';
      }

      console.error('❌ Detailed partnership error:', {
        status: error?.status,
        code: error?.code,
        message: error?.message,
        response: error?.response?.data,
      });

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle partner selection toggle
  const handlePartnerToggle = (partnerId: number) => {
    const currentSelected = partnerships.selectedPartnerIds || [];
    const isAdding = !currentSelected.includes(partnerId);
    const newSelected = isAdding
      ? [...currentSelected, partnerId]
      : currentSelected.filter((id) => id !== partnerId);

    updateFormState({
      partnerships: {
        ...partnerships,
        selectedPartnerIds: newSelected,
      },
      storeBasics: {
        ...formState.storeBasics,
        setupFlow: {
          selectedCategoryIds:
            formState.storeBasics.setupFlow?.selectedCategoryIds || [],
          categoryResponses:
            formState.storeBasics.setupFlow?.categoryResponses || {},
          partnershipRadiusMi:
            formState.storeBasics.setupFlow?.partnershipRadiusMi || 50,
          selectedPartnerIds: newSelected,
          derivedStoreType:
            formState.storeBasics.setupFlow?.derivedStoreType || 'independent',
          derivedCanProduce:
            formState.storeBasics.setupFlow?.derivedCanProduce || false,
          derivedCanProcess:
            formState.storeBasics.setupFlow?.derivedCanProcess || false,
          derivedCanRetail:
            formState.storeBasics.setupFlow?.derivedCanRetail || true,
          needPartnership:
            formState.storeBasics.setupFlow?.needPartnership || 'no',
          partnershipType:
            formState.storeBasics.setupFlow?.partnershipType || '',
        },
      },
    });
  };

  // Handle radius change
  const handleRadiusChange = (newRadius: number) => {
    updateFormState({
      partnerships: {
        ...partnerships,
        partnershipRadiusMi: newRadius,
      },
      storeBasics: {
        ...formState.storeBasics,
        setupFlow: {
          selectedCategoryIds:
            formState.storeBasics.setupFlow?.selectedCategoryIds || [],
          categoryResponses:
            formState.storeBasics.setupFlow?.categoryResponses || {},
          partnershipRadiusMi: newRadius,
          selectedPartnerIds:
            formState.storeBasics.setupFlow?.selectedPartnerIds || [],
          derivedStoreType:
            formState.storeBasics.setupFlow?.derivedStoreType || 'independent',
          derivedCanProduce:
            formState.storeBasics.setupFlow?.derivedCanProduce || false,
          derivedCanProcess:
            formState.storeBasics.setupFlow?.derivedCanProcess || false,
          derivedCanRetail:
            formState.storeBasics.setupFlow?.derivedCanRetail || true,
          needPartnership:
            formState.storeBasics.setupFlow?.needPartnership || 'no',
          partnershipType:
            formState.storeBasics.setupFlow?.partnershipType || '',
        },
      },
    });
  };

  // Auto-search when radius changes and we have a store ID
  // Load existing partnerships from store_partnerships table
  const loadExistingPartnerships = async () => {
    if (!formState.storeId) return;

    try {
      console.log(
        '🔍 Loading existing partnerships for store:',
        formState.storeId
      );
      const partnershipsResponse =
        await partnershipsApi.getPartnershipsByStoreId(
          Number(formState.storeId),
          {
            storeId: Number(formState.storeId),
            status: 'active,pending', // Load both active and pending partnerships
          }
        );

      if (partnershipsResponse?.partnerships) {
        const partnerIds = partnershipsResponse.partnerships.map(
          (partnership) => {
            // Determine which store is the partner (not the current store)
            return partnership.producerStoreId === formState.storeId
              ? partnership.processorStoreId
              : partnership.producerStoreId;
          }
        );

        console.log('✅ Loaded existing partnerships:', partnerIds);
        setExistingPartnerships(partnerIds);

        // Update form state with existing partnerships as selected
        updateFormState({
          partnerships: {
            ...partnerships,
            selectedPartnerIds: partnerIds,
          },
        });
      }
    } catch (error) {
      console.error('❌ Error loading existing partnerships:', error);
    }
  };

  useEffect(() => {
    if (formState.storeId && partnerships.partnershipType) {
      const debounceTimer = setTimeout(() => {
        searchPartners();
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [partnerships.partnershipRadiusMi, formState.storeId]);

  // Load existing partnerships when store ID is available
  useEffect(() => {
    if (formState.storeId) {
      loadExistingPartnerships();
    }
  }, [formState.storeId]);

  // Auto-search when store ID becomes available
  useEffect(() => {
    if (formState.storeId && !partnerships.partnershipType) {
      const partnershipType = getPartnershipType();
      if (partnershipType) {
        updateFormState({
          partnerships: {
            ...partnerships,
            partnershipType,
          },
          storeBasics: {
            ...formState.storeBasics,
            setupFlow: {
              selectedCategoryIds:
                formState.storeBasics.setupFlow?.selectedCategoryIds || [],
              categoryResponses:
                formState.storeBasics.setupFlow?.categoryResponses || {},
              partnershipRadiusMi:
                formState.storeBasics.setupFlow?.partnershipRadiusMi || 50,
              selectedPartnerIds:
                formState.storeBasics.setupFlow?.selectedPartnerIds || [],
              derivedStoreType:
                formState.storeBasics.setupFlow?.derivedStoreType ||
                'independent',
              derivedCanProduce:
                formState.storeBasics.setupFlow?.derivedCanProduce || false,
              derivedCanProcess:
                formState.storeBasics.setupFlow?.derivedCanProcess || false,
              derivedCanRetail:
                formState.storeBasics.setupFlow?.derivedCanRetail || true,
              needPartnership:
                formState.storeBasics.setupFlow?.needPartnership || 'no',
              partnershipType,
            },
          },
        });
        searchPartners();
      }
    }
  }, [formState.storeId]);

  const partnershipType = getPartnershipType();
  const isProcessorStore =
    formState.storeBasics.setupFlow?.derivedStoreType === 'processor';
  const isProducerStore =
    formState.storeBasics.setupFlow?.derivedStoreType === 'producer';

  const getPartnerTypeLabel = () => {
    if (isProcessorStore) return 'Live Animals Producers';
    if (isProducerStore) return 'Meat Processors';
    return 'Partners';
  };

  const getPartnerDescription = () => {
    if (isProcessorStore) {
      return 'Connect with local farms that raise quality livestock for processing.';
    }
    if (isProducerStore) {
      return 'Find local processing facilities that can handle your livestock.';
    }
    return 'Configure your partnership preferences to work with other local businesses.';
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
        Partnerships - Step 3
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        {getPartnerDescription()}
      </Typography>

      <Paper
        elevation={1}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Partnership Configuration */}
        <Card sx={{ mb: 4 }}>
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
              Configure your search radius to find{' '}
              {getPartnerTypeLabel().toLowerCase()} in your area.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' gutterBottom>
                Search Radius: {partnerships.partnershipRadiusMi} miles
              </Typography>
              <Slider
                value={partnerships.partnershipRadiusMi}
                onChange={(_, value) => handleRadiusChange(value as number)}
                min={10}
                max={200}
                step={10}
                marks
                valueLabelDisplay='auto'
              />
            </Box>

            {!formState.storeId && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Store address information is required to search for partners.
                Please complete the Location & Logistics step first.
              </Alert>
            )}

            {formState.storeId && (
              <Box
                sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}
              >
                <Button
                  variant='outlined'
                  startIcon={<SearchIcon />}
                  onClick={searchPartners}
                  disabled={partnersLoading || !partnershipType}
                >
                  {partnersLoading ? 'Searching...' : 'Search Partners'}
                </Button>
                {partnersLoading && <CircularProgress size={24} />}
              </Box>
            )}

            {searchError && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {searchError}
              </Alert>
            )}

            {/* Potential Partners List */}
            {/* Debug logs removed for production */}
            {partnerships.potentialPartners.length > 0 && (
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  Available {getPartnerTypeLabel()} (
                  {partnerships.potentialPartners.length} found):
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mb: 2 }}
                >
                  Select businesses within your partnership radius
                </Typography>

                <List dense>
                  {partnerships.potentialPartners.map(
                    (partner: ExtendedPotentialPartner) => (
                      <ListItem
                        key={partner.storeId}
                        disablePadding
                        sx={{ mb: 1 }}
                      >
                        <ListItemButton
                          onClick={() => handlePartnerToggle(partner.storeId)}
                          selected={partnerships.selectedPartnerIds.includes(
                            partner.storeId
                          )}
                          disabled={partnersLoading}
                          sx={{
                            border: '1px solid',
                            borderColor:
                              partnerships.selectedPartnerIds.includes(
                                partner.storeId
                              )
                                ? 'success.main'
                                : 'divider',
                            borderRadius: 1,
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.6,
                            },
                          }}
                        >
                          <ListItemIcon>
                            {partnerships.selectedPartnerIds.includes(
                              partner.storeId
                            ) ? (
                              <CheckCircleIcon color='success' />
                            ) : isProcessorStore ? (
                              <AgricultureIcon color='action' />
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
                                  label={partner.storeType}
                                  size='small'
                                  color='primary'
                                  variant='outlined'
                                />
                                {partner.existingPartnershipStatus && (
                                  <Chip
                                    label={partnershipsApi.getStatusDisplayText(
                                      partner.existingPartnershipStatus
                                    )}
                                    size='small'
                                    color={partnershipsApi.getStatusColor(
                                      partner.existingPartnershipStatus
                                    )}
                                    variant='filled'
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant='caption' display='block'>
                                  {partner.storeType} •{' '}
                                  {Math.round(partner.distanceMiles)} miles away
                                  {partner.existingPartnershipStatus &&
                                    ` • ${partnershipsApi.getStatusDisplayText(partner.existingPartnershipStatus)}`}
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
                    )
                  )}
                </List>

                {partnerships.selectedPartnerIds.length > 0 && (
                  <Alert severity='info' sx={{ mt: 2 }}>
                    You have selected {partnerships.selectedPartnerIds.length}{' '}
                    preferred partner
                    {partnerships.selectedPartnerIds.length > 1 ? 's' : ''}.
                    These partnerships will be established once your store is
                    approved.
                  </Alert>
                )}
              </Box>
            )}

            {partnerships.potentialPartners.length === 0 &&
              formState.storeId &&
              partnershipType && (
                <Alert severity='info'>
                  No {getPartnerTypeLabel().toLowerCase()} found within{' '}
                  {partnerships.partnershipRadiusMi} miles. Try increasing the
                  search radius or check back later as more stores join the
                  platform.
                </Alert>
              )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'space-between',
            mt: 2,
          }}
        >
          <Button variant='outlined' onClick={onPrevious}>
            Back to Location & Logistics
          </Button>
          <LoadingButton
            variant='contained'
            onClick={handleContinue}
            loading={isSubmitting}
          >
            Continue to Store Policies
          </LoadingButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default PartnershipStep;
