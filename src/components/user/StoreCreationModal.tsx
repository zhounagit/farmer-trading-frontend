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
} from '@mui/material';
import { Close, Store } from '@mui/icons-material';
import { storeApi } from '../../utils/api';
import toast from 'react-hot-toast';

interface StoreCreationModalProps {
  open: boolean;
  onClose: () => void;
  onStoreCreated: () => void;
}

const storeCategories = [
  'Fresh Produce',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Grains & Cereals',
  'Herbs & Spices',
  'Organic Products',
  'Processed Foods',
  'Beverages',
  'Other',
];

export const StoreCreationModal: React.FC<StoreCreationModalProps> = ({
  open,
  onClose,
  onStoreCreated,
}) => {
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    category: '',
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

  const handleCategoryChange = (event: any) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));

    // Clear category error
    if (formErrors.category) {
      setFormErrors((prev) => ({
        ...prev,
        category: '',
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    } else if (formData.storeName.trim().length < 3) {
      errors.storeName = 'Store name must be at least 3 characters long';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
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

    try {
      await storeApi.create({
        storeName: formData.storeName.trim(),
        description: formData.description.trim() || undefined,
        openHours: JSON.stringify({}),
        acceptedPaymentMethods: [],
        deliveryRadiusKm: 5,
      });

      toast.success('Store created successfully!');
      onStoreCreated();
      onClose();

      // Reset form
      setFormData({
        storeName: '',
        description: '',
        category: '',
      });
    } catch (err) {
      setError('Failed to create store. Please try again.');
      console.error('Store creation failed:', err);
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
        category: '',
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
            sx={{ mb: 2 }}
            required
            disabled={isLoading}
          />

          <FormControl
            fullWidth
            sx={{ mb: 2 }}
            error={!!formErrors.category}
            required
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleCategoryChange}
              label='Category'
              disabled={isLoading}
            >
              {storeCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
            {formErrors.category && (
              <Typography
                variant='caption'
                color='error'
                sx={{ mt: 0.5, ml: 2 }}
              >
                {formErrors.category}
              </Typography>
            )}
          </FormControl>

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

export default StoreCreationModal;
