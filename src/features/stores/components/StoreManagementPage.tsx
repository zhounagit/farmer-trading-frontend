import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Link,
  Tooltip,
} from '@mui/material';
import {
  Store,
  Add,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Schedule,
  Payment,
  CheckCircle,
  Pending,
  Cancel,
  Public,
  PublicOff,
  Launch,
  Settings,
  Analytics,
  Inventory,
  LocalShipping,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { StoresApiService } from '@/features/stores/services/storesApi';
import type { Store as StoreType } from '@/shared/types/store';
import SimpleStoreCreationModal from '@/components/user/SimpleStoreCreationModal';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import StorefrontApiService from '@/features/storefront/services/storefrontApi';

const StoreManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateStoreStatus } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);
  const [storefrontStatuses, setStorefrontStatuses] = useState<
    Map<
      number,
      {
        status: string;
        isPublished: boolean;
        publicUrl?: string;
        slug?: string;
        publishedAt?: string;
        lastModified?: string;
      }
    >
  >(new Map());

  const handleLoginClick = () => {
    navigate('/login');
  };

  // Fetch user's stores
  const {
    data: stores = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myStores'],
    queryFn: () => StoresApiService.getUserStores(user?.userId),
    enabled: !!user,
  });

  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: (storeId: number) => StoresApiService.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStores'] });
      toast.success('Store deleted successfully');
      setDeleteDialogOpen(false);
      setStoreToDelete(null);

      // Update user's store status if no stores left
      if (Array.isArray(stores) && stores.length === 1) {
        updateStoreStatus(false);
      }
    },
    onError: (error: unknown) => {
      console.error('Failed to delete store:', error);
      toast.error('Failed to delete store');
    },
  });

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    store: StoreType
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedStore(store);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStore(null);
  };

  const handleViewStore = () => {
    if (selectedStore) {
      navigate(`/stores/${selectedStore.storeId}`);
    }
    handleMenuClose();
  };

  const handleEditStore = () => {
    if (selectedStore) {
      navigate(`/stores/${selectedStore.storeId}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedStore) {
      setStoreToDelete(selectedStore);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleConfirmDelete = () => {
    if (storeToDelete) {
      deleteStoreMutation.mutate(storeToDelete.storeId!);
    }
  };

  const handleStoreCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['myStores'] });
    updateStoreStatus(true);
  };

  const getApprovalStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Chip
            icon={<CheckCircle />}
            label='Approved'
            color='success'
            size='small'
            variant='filled'
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<Pending />}
            label='Pending Review'
            color='warning'
            size='small'
            variant='filled'
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<Cancel />}
            label='Rejected'
            color='error'
            size='small'
            variant='filled'
          />
        );
      case 'suspended':
        return (
          <Chip
            icon={<Cancel />}
            label='Suspended'
            color='error'
            size='small'
            variant='outlined'
          />
        );
      default:
        return (
          <Chip
            label={status}
            color='default'
            size='small'
            variant='outlined'
          />
        );
    }
  };

  const formatOpenHours = (openHours: Record<string, any>) => {
    if (!openHours) return 'Not specified';

    const openDays = Object.entries(openHours)
      .filter(([, hours]: [string, any]) => hours?.isOpen)
      .map(([day, hours]: [string, any]) => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1, 3);
        if (hours?.isAllDay) return `${dayName}: 24/7`;
        return `${dayName}: ${hours?.openTime}-${hours?.closeTime}`;
      });

    return openDays.length > 0 ? openDays.join(', ') : 'Closed';
  };

  // Load storefront status for each store
  useEffect(() => {
    const loadStorefrontStatuses = async () => {
      if (!stores || !Array.isArray(stores) || stores.length === 0) return;

      const statusPromises = (stores as StoreType[]).map(
        async (store: StoreType) => {
          try {
            const status = await StorefrontApiService.getStorefrontStatus(
              store.storeId!
            );
            return { storeId: store.storeId!, status };
          } catch (error) {
            console.error(
              `Failed to load storefront status for store ${store.storeId}:`,
              error
            );
            return {
              storeId: store.storeId!,
              status: { status: 'draft', isPublished: false },
            };
          }
        }
      );

      const statuses = await Promise.all(statusPromises);
      const statusMap = new Map(
        statuses.map(({ storeId, status }) => [storeId, status])
      );
      setStorefrontStatuses(statusMap);
    };

    loadStorefrontStatuses();
  }, [stores]);

  const getStorefrontStatus = (storeId: number | undefined) => {
    if (!storeId) return { status: 'draft', isPublished: false };
    return (
      storefrontStatuses.get(storeId) || { status: 'draft', isPublished: false }
    );
  };

  const renderStorefrontStatus = (store: StoreType) => {
    const status = getStorefrontStatus(store.storeId!);

    if (status.isPublished && status.publicUrl) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            icon={<Public />}
            label='Live Store'
            color='success'
            size='small'
            variant='filled'
          />
          <Tooltip title='Visit your live storefront'>
            <IconButton
              size='small'
              color='primary'
              onClick={(e) => {
                e.stopPropagation();
                window.open(status.publicUrl, '_blank');
              }}
            >
              <Launch fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            icon={<PublicOff />}
            label='Draft'
            color='default'
            size='small'
            variant='outlined'
          />
          <Tooltip title='Customize and publish your storefront'>
            <Button
              size='small'
              variant='outlined'
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/stores/${store.storeId}/customize`);
              }}
            >
              Customize
            </Button>
          </Tooltip>
        </Box>
      );
    }
  };

  const renderStoreCard = (store: StoreType) => (
    <Box key={store.storeId} sx={{ mb: 3 }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        {/* Store Header */}
        <Box sx={{ position: 'relative' }}>
          {store.bannerUrl ? (
            <Box
              sx={{
                height: 120,
                backgroundImage: `url(${store.bannerUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 120,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Store sx={{ fontSize: 40, color: 'white' }} />
            </Box>
          )}

          {/* Store Avatar */}
          <Avatar
            src={store.logoUrl}
            sx={{
              position: 'absolute',
              bottom: -20,
              left: 16,
              width: 60,
              height: 60,
              bgcolor: 'background.paper',
              border: 3,
              borderColor: 'background.paper',
            }}
          >
            <Store />
          </Avatar>

          {/* Action Menu */}
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
            onClick={(e) => handleMenuOpen(e, store)}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 3 }}>
          {/* Store Name and Status */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              mb: 1,
            }}
          >
            <Typography variant='h6' fontWeight={600} sx={{ pr: 1 }}>
              {store.storeName}
            </Typography>
            {getApprovalStatusChip(store.approvalStatus || 'pending')}
          </Box>

          {/* Storefront Status */}
          {renderStorefrontStatus(store)}

          {/* Store Description */}
          {store.description && (
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {store.description}
            </Typography>
          )}

          {/* Store Details */}
          <List dense sx={{ py: 0 }}>
            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Schedule fontSize='small' color='action' />
              </ListItemIcon>
              <ListItemText
                primary={formatOpenHours(store.openHours)}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LocalShipping fontSize='small' color='action' />
              </ListItemIcon>
              <ListItemText
                primary={`Delivers within ${store.deliveryRadiusKm} km`}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>

            <ListItem sx={{ px: 0, py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Payment fontSize='small' color='action' />
              </ListItemIcon>
              <ListItemText
                primary={
                  store.acceptedPaymentMethods?.join(', ') || 'Not specified'
                }
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>

            {/* Public URL if available */}
            {getStorefrontStatus(store.storeId!).publicUrl && (
              <ListItem sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Public fontSize='small' color='action' />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link
                      href={getStorefrontStatus(store.storeId!).publicUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      color='primary'
                      sx={{
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Visit Live Store ↗
                    </Link>
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            )}
          </List>

          {/* Approval Notes */}
          {store.approvalNotes && store.approvalStatus === 'rejected' && (
            <Alert severity='error' sx={{ mt: 2, fontSize: '0.875rem' }}>
              <Typography variant='body2'>{store.approvalNotes}</Typography>
            </Alert>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size='small'
            startIcon={<Analytics />}
            onClick={() => navigate(`/stores/${store.storeId}/dashboard`)}
            sx={{ textTransform: 'none' }}
          >
            Dashboard
          </Button>
          <Button
            size='small'
            startIcon={<Inventory />}
            onClick={() => navigate(`/stores/${store.storeId}/products`)}
            sx={{ textTransform: 'none' }}
          >
            Products
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  if (isLoading) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Alert severity='error'>Failed to load stores. Please try again.</Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Page Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant='h4' fontWeight={700} sx={{ mb: 1 }}>
              My Stores
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage your stores and track their performance
            </Typography>
          </Box>
        </Box>

        {/* Store Cards */}
        {Array.isArray(stores) && stores.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(stores as StoreType[]).map((store: StoreType) =>
              renderStoreCard(store)
            )}
          </Box>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Store sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant='h5' fontWeight={600} sx={{ mb: 1 }}>
              No stores yet
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
              Create your first store to start selling your products
            </Typography>
            <Button
              variant='contained'
              size='large'
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Create Your First Store
            </Button>
          </Paper>
        )}

        {/* Floating Action Button */}
        {stores.length > 0 && (
          <Fab
            color='primary'
            sx={{ position: 'fixed', bottom: 24, right: 24 }}
            onClick={() => setCreateModalOpen(true)}
          >
            <Add />
          </Fab>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleViewStore}>
            <ListItemIcon>
              <Visibility fontSize='small' />
            </ListItemIcon>
            <ListItemText>View Store</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditStore}>
            <ListItemIcon>
              <Edit fontSize='small' />
            </ListItemIcon>
            <ListItemText>Edit Store</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() =>
              navigate(`/stores/${selectedStore?.storeId}/settings`)
            }
          >
            <ListItemIcon>
              <Settings fontSize='small' />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Delete fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText>Delete Store</ListItemText>
          </MenuItem>
        </Menu>

        {/* Store Creation Modal */}
        <SimpleStoreCreationModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onStoreCreated={handleStoreCreated}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Store</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{storeToDelete?.storeName}"? This
              action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmDelete}
              color='error'
              variant='contained'
              disabled={deleteStoreMutation.isPending}
            >
              {deleteStoreMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default StoreManagementPage;
