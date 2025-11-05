import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import { Close, Store } from '@mui/icons-material';
import { storeApi, tokenUtils } from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface SimpleStoreCreationModalProps {
  open: boolean;
  onClose: () => void;
  onStoreCreated: () => void;
}

const paymentMethods = ['cash', 'card', 'bank_transfer', 'mobile_money'];

const deliveryOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

const defaultOpenHours = {
  monday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  tuesday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  wednesday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  thursday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  friday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  saturday: {
    isOpen: true,
    openTime: '09:00',
    closeTime: '17:00',
    isAllDay: false,
  },
  sunday: { isOpen: false, openTime: '', closeTime: '', isAllDay: false },
};

export const SimpleStoreCreationModal: React.FC<
  SimpleStoreCreationModalProps
> = ({ open, onClose, onStoreCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    deliveryRadiusKm: 10,
    acceptedPaymentMethods: ['cash'] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleDeliveryRadiusChange = (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      deliveryRadiusKm: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      acceptedPaymentMethods: prev.acceptedPaymentMethods.includes(method)
        ? prev.acceptedPaymentMethods.filter((m) => m !== method)
        : [...prev.acceptedPaymentMethods, method],
    }));
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    } else if (formData.storeName.trim().length < 3) {
      errors.storeName = 'Store name must be at least 3 characters long';
    }

    if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    if (formData.acceptedPaymentMethods.length === 0) {
      errors.paymentMethods = 'At least one payment method is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Check authentication
    if (!isAuthenticated || !user) {
      setError('Please log in to create a store');
      setIsLoading(false);
      return;
    }

    // Check token
    const token = tokenUtils.getAccessToken();
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      setIsLoading(false);
      return;
    }

    console.log('🔍 DEBUG: Store creation starting...');
    console.log('👤 User:', user);
    console.log('🔑 Has token:', !!token);

    try {
      // Use camelCase properties - ApiMapper will convert to PascalCase for backend
      const storeFields: {
        storeName: string;
        deliveryRadiusKm: number;
        acceptedPaymentMethods: string[];
        openHours: string;
        description?: string;
      } = {
        storeName: formData.storeName.trim(),
        deliveryRadiusKm: formData.deliveryRadiusKm,
        acceptedPaymentMethods: formData.acceptedPaymentMethods,
        openHours: JSON.stringify(defaultOpenHours), // Send as JSON string for JSONB
      };

      if (formData.description.trim()) {
        storeFields.description = formData.description.trim();
      }

      // The error shows it expects the Store object directly, not wrapped in 'store'
      const storeData = storeFields;

      console.log('📤 Sending store data:', JSON.stringify(storeData, null, 2));
      console.log('📤 StoreName being sent:', storeData.storeName);
      const result = await storeApi.create(storeData);
      console.log('✅ Store creation result:', result);

      toast.success('Store created successfully!');
      onStoreCreated();
      onClose();

      // Reset form
      setFormData({
        storeName: '',
        description: '',
        deliveryRadiusKm: 10,
        acceptedPaymentMethods: ['cash'],
      });
      setFormErrors({});
    } catch (err: any) {
      console.error('❌ Full error object:', err);
      console.error('❌ Error message:', err?.message);
      console.error('❌ Error status:', err?.status);
      console.error('❌ Error data:', err?.data);

      let errorMessage = 'Failed to create store. Please try again.';

      if (err?.status === 400) {
        errorMessage = 'Invalid store data. Please check your inputs.';
      } else if (err?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err?.status === 403) {
        errorMessage = 'You do not have permission to create a store.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form and errors when closing
      setFormData({
        storeName: '',
        description: '',
        deliveryRadiusKm: 10,
        acceptedPaymentMethods: ['cash'],
      });
      setFormErrors({});
      setError(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store color='primary' />
          <Typography variant='h6' fontWeight={600}>
            Open Your Store
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size='small'
          sx={{ color: 'grey.500' }}
          disabled={isLoading}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Create your online store to start selling your products to customers
          in your area.
        </Typography>

        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name='storeName'
            label='Store Name'
            placeholder='Enter your store name'
            value={formData.storeName}
            onChange={handleInputChange}
            error={!!formErrors.storeName}
            helperText={formErrors.storeName}
            sx={{ mb: 3 }}
            required
            disabled={isLoading}
          />

          <TextField
            fullWidth
            name='description'
            label='Store Description'
            placeholder='Describe your store and what you sell (optional)'
            value={formData.description}
            onChange={handleInputChange}
            error={!!formErrors.description}
            helperText={
              formErrors.description ||
              `${formData.description.length}/500 characters`
            }
            multiline
            rows={4}
            sx={{ mb: 3 }}
            disabled={isLoading}
          />

          <Typography variant='h6' sx={{ mb: 2 }}>
            Payment Methods
          </Typography>
          {formErrors.paymentMethods && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {formErrors.paymentMethods}
            </Alert>
          )}
          <Box sx={{ mb: 3 }}>
            {paymentMethods.map((method) => (
              <Chip
                key={method}
                label={method.replace('_', ' ').toUpperCase()}
                onClick={() => handlePaymentMethodToggle(method)}
                color={
                  formData.acceptedPaymentMethods.includes(method)
                    ? 'primary'
                    : 'default'
                }
                variant={
                  formData.acceptedPaymentMethods.includes(method)
                    ? 'filled'
                    : 'outlined'
                }
                sx={{ mr: 1, mb: 1 }}
                disabled={isLoading}
              />
            ))}
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Delivery Radius</InputLabel>
            <Select
              value={formData.deliveryRadiusKm}
              onChange={handleDeliveryRadiusChange}
              label='Delivery Radius'
              disabled={isLoading}
            >
              {deliveryOptions.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Store Benefits */}
          <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 1, mb: 2 }}>
            <Typography variant='subtitle2' color='success.main' sx={{ mb: 1 }}>
              Benefits of opening your store:
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • Reach customers in your local area
              <br />
              • Set your own prices and manage inventory
              <br />
              • Build relationships with regular customers
              <br />• Track sales and earnings through your dashboard
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          sx={{ textTransform: 'none' }}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant='contained'
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Store />}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Creating Store...' : 'Create Store'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleStoreCreationModal;
