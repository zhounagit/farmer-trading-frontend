import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Grid,
} from '@mui/material';
import {
  Handshake,
  Star,
  LocationOn,
  Add,
  Settings,
  Phone,
  Email,
  CheckCircle,
  Pending,
  Close,
  Business,
  Info,
  Check,
  Clear,
} from '@mui/icons-material';
import {
  partnershipsApi,
  type Partnership,
  type PotentialPartner,
} from '../../services/partnerships.api';
import { OpenShopApiService } from '../../services/open-shop.api';
import StorefrontApiService from '../../services/storefront.api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface PartnershipSectionProps {
  storeId: number;
  storeName: string;
  storeType: string;
  canProduce: boolean;
  canProcess: boolean;
  partnershipRadiusMi: number;
}

const PartnershipSection: React.FC<PartnershipSectionProps> = ({
  storeId,
  storeName,
  storeType,
  canProduce,
  canProcess,
  partnershipRadiusMi,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [potentialPartners, setPotentialPartners] = useState<
    PotentialPartner[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(partnershipRadiusMi);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [storeNavigationLoading, setStoreNavigationLoading] = useState<
    number | null
  >(null);
  const [publishedStoreIds, setPublishedStoreIds] = useState<Set<number>>(
    new Set()
  );

  // Determine if this store is a producer (needs processors as partners)
  const isProducerStore =
    canProduce || storeType === 'producer' || storeType === 'hybrid';
  // Determine if this store is a processor (needs producers as partners)
  const isProcessorStore =
    canProcess || storeType === 'processor' || storeType === 'hybrid';

  useEffect(() => {
    // Wait for authentication to be ready before making API calls
    if (isAuthenticated && user?.userId) {
      fetchPartnerships();
    }
  }, [storeId, isAuthenticated, user?.userId]);

  const fetchPartnerships = async () => {
    if (!storeId || !isAuthenticated || !user?.userId) return;

    try {
      setLoading(true);
      const response = await partnershipsApi.getPartnershipsByStoreId({
        storeId,
        // Remove status filter to get both pending and active partnerships
        partnerType: isProducerStore ? 'processor' : 'producer',
      });
      setPartnerships(response.partnerships);

      // Check which partner stores have published storefronts
      const partnerStoreIds = response.partnerships.map((p) =>
        isProducerStore ? p.processorStoreId : p.producerStoreId
      );

      const publishedIds = new Set<number>();
      await Promise.all(
        partnerStoreIds.map(async (partnerStoreId) => {
          try {
            // Try to get public storefront - if it succeeds, the store is published
            await StorefrontApiService.getPublicStorefrontById(partnerStoreId);
            publishedIds.add(partnerStoreId);
          } catch (error) {
            // 404 or other error means store is not published or doesn't exist
          }
        })
      );

      setPublishedStoreIds(publishedIds);
    } catch (error) {
      toast.error('Failed to load partnerships');
    } finally {
      setLoading(false);
    }
  };

  const searchPotentialPartners = async () => {
    if (!isAuthenticated || !user?.userId) {
      toast.error('Please log in to search for partners');
      return;
    }
    try {
      setSearchLoading(true);
      const partners = await partnershipsApi.searchPotentialPartners({
        storeId,
        partnerType: isProducerStore ? 'processor' : 'producer',
        radiusMiles: searchRadius,
      });

      // Ensure partners is an array before setting state
      if (Array.isArray(partners)) {
        setPotentialPartners(partners);
      } else {
        setPotentialPartners([]);
      }
    } catch (error) {
      toast.error('Failed to search for partners');
      setPotentialPartners([]); // Set to empty array on error
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
    searchPotentialPartners();
  };

  const handleCreatePartnership = async (
    partnerId: number,
    partnerName: string
  ) => {
    try {
      const request = isProducerStore
        ? {
            producerStoreId: storeId,
            processorStoreId: partnerId,
            initiatedByStoreId: storeId,
          }
        : {
            producerStoreId: partnerId,
            processorStoreId: storeId,
            initiatedByStoreId: storeId,
          };

      await partnershipsApi.createPartnership(request);
      toast.success(`Partnership request sent to ${partnerName}`);
      setSearchDialogOpen(false);
      fetchPartnerships(); // Refresh partnerships list
    } catch (error) {
      toast.error('Failed to create partnership request');
    }
  };

  const handleApprovePartnership = async (
    partnershipId: number,
    partnerName: string
  ) => {
    if (!user?.userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setActionLoading(partnershipId);
      await partnershipsApi.approvePartnership(
        partnershipId,
        parseInt(user.userId)
      );
      toast.success(`Partnership with ${partnerName} approved!`);
      fetchPartnerships(); // Refresh partnerships list
    } catch (error) {
      toast.error('Failed to approve partnership');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclinePartnership = async (
    partnershipId: number,
    partnerName: string
  ) => {
    try {
      setActionLoading(partnershipId);
      await partnershipsApi.rejectPartnership(
        partnershipId,
        storeId,
        'Declined by user'
      );
      toast.success(`Partnership request from ${partnerName} declined`);
      fetchPartnerships(); // Refresh partnerships list
    } catch (error) {
      toast.error('Failed to decline partnership');
    } finally {
      setActionLoading(null);
    }
  };

  const getPartnerStoreName = (partnership: Partnership): string => {
    return isProducerStore
      ? partnership.processorStoreName
      : partnership.producerStoreName;
  };

  const getPartnerStoreId = (partnership: Partnership): number => {
    return isProducerStore
      ? partnership.processorStoreId
      : partnership.producerStoreId;
  };

  const isStorePublished = (partnership: Partnership): boolean => {
    const partnerStoreId = getPartnerStoreId(partnership);
    return publishedStoreIds.has(partnerStoreId);
  };

  const handleViewPartnerStore = async (partnership: Partnership) => {
    const partnerStoreId = getPartnerStoreId(partnership);

    try {
      setStoreNavigationLoading(partnerStoreId);

      // Get store details to find the slug
      const storeData = (await OpenShopApiService.getStoreDetails(
        partnerStoreId
      )) as any;
      const slug = storeData?.slug || storeData?.data?.slug;

      if (slug) {
        navigate(`/store/${slug}`);
      }
    } catch (error) {
      toast.error('Could not load store details');
    } finally {
      setStoreNavigationLoading(null);
    }
  };

  const getDistanceText = (distanceMiles?: number): string => {
    if (!distanceMiles) return '';
    return distanceMiles < 1
      ? `${Math.round(distanceMiles * 5280)} ft away`
      : `${Math.round(distanceMiles)} miles away`;
  };

  const formatServices = (termsJson?: string): string[] => {
    if (!termsJson) return [];
    try {
      const terms = JSON.parse(termsJson);
      return terms.services || [];
    } catch {
      return [];
    }
  };

  const activePartnerships = partnerships.filter((p) => p.status === 'active');
  const pendingPartnerships = partnerships.filter(
    (p) => p.status === 'pending'
  );

  if (loading) {
    return (
      <Card variant='outlined' sx={{ height: '100%' }}>
        <CardContent>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='center'
            minHeight='200px'
          >
            <CircularProgress size={40} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card variant='outlined' sx={{ height: '100%' }}>
        <CardContent>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            mb={2}
          >
            <Typography variant='h6' fontWeight={600}>
              <Handshake sx={{ mr: 1, verticalAlign: 'middle' }} />
              {isProcessorStore
                ? `Live Animals Partners (${activePartnerships.length} active)`
                : isProducerStore
                  ? `Processing Partners (${activePartnerships.length} active)`
                  : `Partnerships (${activePartnerships.length} active)`}
            </Typography>
            <Box>
              <Tooltip title='Find new partners'>
                <IconButton
                  onClick={handleOpenSearchDialog}
                  size='small'
                  color='primary'
                >
                  <Add />
                </IconButton>
              </Tooltip>
              <Tooltip title='Manage partnerships'>
                <IconButton
                  onClick={() => {
                    // Navigate to partnerships management page
                    window.location.href = '/dashboard/partnerships';
                  }}
                  size='small'
                >
                  <Settings />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {!isProducerStore && (
            <Alert severity='info' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                {isProcessorStore
                  ? 'Find local Live Animals producers to partner with for quality livestock supply.'
                  : 'As a processor/retailer, partnerships help you connect with local producers.'}
              </Typography>
            </Alert>
          )}

          {isProducerStore && (
            <Alert severity='info' sx={{ mb: 2 }}>
              <Typography variant='body2'>
                Connect with meat processors to offer complete service to your
                customers.
              </Typography>
            </Alert>
          )}

          {activePartnerships.length === 0 &&
          pendingPartnerships.length === 0 ? (
            <Box textAlign='center' py={3}>
              <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {isProcessorStore
                  ? 'No Live Animals partners yet'
                  : isProducerStore
                    ? 'No processing partners yet'
                    : 'No partnerships yet'}
              </Typography>
              <Button
                variant='contained'
                startIcon={<Add />}
                onClick={handleOpenSearchDialog}
                size='small'
              >
                {isProcessorStore
                  ? 'Find Live Animals Producers'
                  : isProducerStore
                    ? 'Find Processors'
                    : 'Find Partners'}
              </Button>
            </Box>
          ) : (
            <Stack spacing={1}>
              {/* Active Partnerships */}
              {activePartnerships.map((partnership) => {
                const partnerName = getPartnerStoreName(partnership);
                const services = formatServices(partnership.partnershipTerms);
                const isPrimary =
                  partnership.partnershipId ===
                  activePartnerships[0]?.partnershipId;

                return (
                  <Box
                    key={partnership.partnershipId}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      backgroundColor: isPrimary
                        ? 'success.50'
                        : 'background.paper',
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={1} mb={0.5}>
                      {isPrimary && (
                        <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                      )}
                      {isStorePublished(partnership) ? (
                        <Tooltip
                          title={`Click to view ${partnerName}'s storefront`}
                        >
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              cursor: 'pointer',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              '&:hover': {
                                color: 'primary.dark',
                                textDecoration: 'underline',
                              },
                              opacity:
                                storeNavigationLoading ===
                                getPartnerStoreId(partnership)
                                  ? 0.6
                                  : 1,
                              pointerEvents:
                                storeNavigationLoading ===
                                getPartnerStoreId(partnership)
                                  ? 'none'
                                  : 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                            onClick={() => handleViewPartnerStore(partnership)}
                          >
                            {storeNavigationLoading ===
                            getPartnerStoreId(partnership)
                              ? 'Loading...'
                              : `${partnerName}${isPrimary ? ' (Primary Partner)' : ''}`}
                            {!storeNavigationLoading && (
                              <Typography
                                component='span'
                                sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                              >
                                (view store)
                              </Typography>
                            )}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          variant='body2'
                          fontWeight={600}
                          sx={{ color: 'text.primary' }}
                        >
                          {partnerName}
                          {isPrimary && ' (Primary Partner)'}
                        </Typography>
                      )}
                      <Chip
                        size='small'
                        label={isProcessorStore ? 'Live Animals' : 'Processing'}
                        color='success'
                        variant='outlined'
                        sx={{ ml: 'auto' }}
                      />
                    </Box>

                    {isProcessorStore && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        🐄 Livestock supplier • Quality cattle, pork, lamb
                      </Typography>
                    )}

                    {!isProcessorStore && services.length > 0 && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        display='block'
                      >
                        Services: {services.join(', ')}
                      </Typography>
                    )}

                    <Typography variant='caption' color='text.secondary'>
                      <LocationOn
                        sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      Partnership established{' '}
                      {new Date(
                        partnership.activatedAt || partnership.createdAt
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>
                );
              })}

              {/* Pending Partnerships */}
              {pendingPartnerships.map((partnership) => {
                const partnerName = getPartnerStoreName(partnership);
                const isInitiatedByMe =
                  partnership.initiatedByStoreId === storeId;

                return (
                  <Box
                    key={partnership.partnershipId}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: 'warning.main',
                      borderRadius: 1,
                      backgroundColor: 'warning.50',
                    }}
                  >
                    <Box display='flex' alignItems='center' gap={1} mb={0.5}>
                      <Pending sx={{ fontSize: 16, color: 'warning.main' }} />
                      {isStorePublished(partnership) ? (
                        <Tooltip
                          title={`Click to view ${partnerName}'s storefront`}
                        >
                          <Typography
                            variant='body2'
                            fontWeight={600}
                            sx={{
                              cursor: 'pointer',
                              color: 'primary.main',
                              textDecoration: 'underline',
                              '&:hover': {
                                color: 'primary.dark',
                                textDecoration: 'underline',
                              },
                              opacity:
                                storeNavigationLoading ===
                                getPartnerStoreId(partnership)
                                  ? 0.6
                                  : 1,
                              pointerEvents:
                                storeNavigationLoading ===
                                getPartnerStoreId(partnership)
                                  ? 'none'
                                  : 'auto',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                            onClick={() => handleViewPartnerStore(partnership)}
                          >
                            {storeNavigationLoading ===
                            getPartnerStoreId(partnership)
                              ? 'Loading...'
                              : partnerName}
                            {!storeNavigationLoading && (
                              <Typography
                                component='span'
                                sx={{ fontSize: '0.7rem', opacity: 0.7 }}
                              >
                                (view store)
                              </Typography>
                            )}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography
                          variant='body2'
                          fontWeight={600}
                          sx={{ color: 'text.primary' }}
                        >
                          {partnerName}
                        </Typography>
                      )}
                      {isInitiatedByMe ? (
                        <Chip
                          size='small'
                          label='Pending their approval'
                          color='warning'
                          variant='outlined'
                          sx={{ ml: 'auto' }}
                        />
                      ) : (
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                          <Tooltip title='Approve partnership'>
                            <IconButton
                              size='small'
                              color='success'
                              onClick={() =>
                                handleApprovePartnership(
                                  partnership.partnershipId,
                                  partnerName
                                )
                              }
                              disabled={
                                actionLoading === partnership.partnershipId
                              }
                            >
                              {actionLoading === partnership.partnershipId ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Check sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Decline partnership'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() =>
                                handleDeclinePartnership(
                                  partnership.partnershipId,
                                  partnerName
                                )
                              }
                              disabled={
                                actionLoading === partnership.partnershipId
                              }
                            >
                              <Clear sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                    {!isInitiatedByMe && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 3 }}
                      >
                        Partnership request received{' '}
                        {new Date(partnership.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                    {isInitiatedByMe && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ ml: 3 }}
                      >
                        Request sent{' '}
                        {new Date(partnership.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}

          {activePartnerships.length > 0 && (
            <Box mt={2} display='flex' gap={1}>
              <Button
                variant='outlined'
                startIcon={<Add />}
                onClick={handleOpenSearchDialog}
                size='small'
                fullWidth
              >
                Add New Partners
              </Button>
              <Button
                variant='outlined'
                startIcon={<Settings />}
                onClick={() => {
                  window.location.href = '/dashboard/partnerships';
                }}
                size='small'
                fullWidth
              >
                Manage Partners
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Search Partners Dialog */}
      <Dialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          Find{' '}
          {isProcessorStore
            ? 'Live Animals Producers'
            : isProducerStore
              ? 'Processing Partners'
              : 'Partners'}
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {isProcessorStore
                ? 'Search for local farms that raise quality livestock within your specified radius.'
                : isProducerStore
                  ? 'Find meat processing facilities to partner with for your livestock.'
                  : 'Find potential business partners in your area.'}
            </Typography>
            <TextField
              label='Search Radius (miles)'
              type='number'
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              size='small'
              sx={{ mr: 2 }}
            />
            <Button
              variant='outlined'
              onClick={searchPotentialPartners}
              disabled={searchLoading}
            >
              Search
            </Button>
          </Box>

          {searchLoading ? (
            <Box display='flex' justifyContent='center' py={4}>
              <CircularProgress />
            </Box>
          ) : !Array.isArray(potentialPartners) ||
            potentialPartners.length === 0 ? (
            <Alert severity='info'>
              No potential partners found within {searchRadius} miles.
            </Alert>
          ) : (
            <List>
              {Array.isArray(potentialPartners) &&
                potentialPartners.map((partner) => (
                  <ListItem
                    key={partner.storeId}
                    divider
                    secondaryAction={
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() =>
                          handleCreatePartnership(
                            partner.storeId,
                            partner.storeName
                          )
                        }
                      >
                        Send Request
                      </Button>
                    }
                  >
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <Typography variant='subtitle2'>
                            {partner.storeName}
                          </Typography>
                          {isProcessorStore && partner.canProduce && (
                            <Chip
                              label='Live Animals'
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            {isProcessorStore && partner.canProduce
                              ? '🐄 Livestock farm • Raises quality animals for processing'
                              : partner.description || 'No description'}
                          </Typography>
                          {partner.address && (
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              <LocationOn
                                sx={{
                                  fontSize: 12,
                                  mr: 0.5,
                                  verticalAlign: 'middle',
                                }}
                              />
                              {partner.address.formattedAddress ||
                                `${partner.address.city}, ${partner.address.state}`}{' '}
                              • {getDistanceText(partner.distanceMiles)}
                            </Typography>
                          )}
                          <Box mt={0.5}>
                            <Chip
                              size='small'
                              label={partner.storeType}
                              sx={{ mr: 0.5 }}
                            />
                            {partner.canProduce && (
                              <Chip
                                size='small'
                                label='Producer'
                                color='primary'
                                sx={{ mr: 0.5 }}
                              />
                            )}
                            {partner.canProcess && (
                              <Chip
                                size='small'
                                label='Processor'
                                color='secondary'
                                sx={{ mr: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PartnershipSection;
