import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import Header from '../../../components/layout/Header';
import categoryApiService from '../../search/services/categoryApi';
import type { ProductCategory } from '../../search/services/categoryApi';
import {
  Add,
  Edit,
  Delete,
  Image,
  ArrowBack,
  CloudUpload,
  Delete as DeleteIcon,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { InventoryApiService } from '../services/inventoryApi';
import type {
  InventoryImage as ApiInventoryImage,
  InventoryItem,
  UnitType,
} from '../../../shared/types/inventory';

const SimpleInventoryPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // All the state declarations
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [currentItemForImages, setCurrentItemForImages] =
    useState<InventoryItem | null>(null);
  const [itemImages, setItemImages] = useState<ApiInventoryImage[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    quantity: 0,
    unit: 'piece',
    category: 'General',
    cost: 0,
    minStockLevel: 0,
    allowOffers: false,
  });

  // Category state
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      console.log('🔍 DEBUG - Starting to load categories...');
      setLoadingCategories(true);
      const categoriesData = await categoryApiService.getActiveCategories();
      console.log('🔍 DEBUG - Categories loaded:', categoriesData);
      console.log('🔍 DEBUG - Categories count:', categoriesData?.length || 0);
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      console.error('❌ Error details:', error);
      showSnackbar('Failed to load product categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      console.log('🔍 DEBUG - loadItems - storeId:', storeId);
      console.log('🔍 DEBUG - loadItems - Number(storeId):', Number(storeId));

      setLoading(true);
      const response = await InventoryApiService.getInventoryItems(
        Number(storeId),
        {
          status: ['active'],
        }
      );

      console.log('🔍 DEBUG - loadItems - API response:', response);
      console.log('🔍 DEBUG - loadItems - Response items:', response.items);
      console.log(
        '🔍 DEBUG - loadItems - Response items length:',
        response.items?.length || 0
      );

      if (response.items) {
        setItems(response.items);
        console.log('✅ Successfully loaded', response.items.length, 'items');
      } else {
        console.log('❌ Failed to load items - no items in response');
        setItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    loadItems();
    loadCategories();
  }, [loadItems, loadCategories]);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddItem = async () => {
    try {
      console.log('🔍 DEBUG - storeId from URL:', storeId);
      console.log('🔍 DEBUG - storeId type:', typeof storeId);
      console.log('🔍 DEBUG - Number(storeId):', Number(storeId));
      console.log('🔍 DEBUG - newItem:', newItem);

      if (
        !storeId ||
        !newItem.name ||
        !newItem.sku ||
        !newItem.price ||
        Number(newItem.price) <= 0
      ) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      const itemData = {
        storeId: Number(storeId),
        Name: newItem.name,
        description: newItem.description,
        sku: newItem.sku,
        Price: Number(newItem.price),
        Quantity: Number(newItem.quantity),
        Unit: newItem.unit,
        Category: newItem.category || 'General',
        Cost: Number(newItem.cost) || 0,
        MinStockLevel: Number(newItem.minStockLevel) || 0,
        AllowOffers: newItem.allowOffers || false,
      };

      await InventoryApiService.createInventoryItem(itemData);

      setAddDialogOpen(false);
      setNewItem({
        name: '',
        description: '',
        sku: '',
        price: 0,
        quantity: 0,
        unit: 'piece',
        category: 'General',
        cost: 0,
        minStockLevel: 0,
        allowOffers: false,
      });
      loadItems();
      showSnackbar('Product added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add item:', error);
      showSnackbar('Failed to add product', 'error');
    }
  };

  const handleUpdateItem = async () => {
    try {
      if (!selectedItem) return;

      const updateData = {
        Name: selectedItem.name,
        description: selectedItem.description,
        Category: 'General',
        Unit: selectedItem.unit,
        Price: selectedItem.price,
        Quantity: selectedItem.quantity,
        Cost: selectedItem.cost,
        MinStockLevel: selectedItem.minStockLevel,
      };
      await InventoryApiService.updateInventoryItem(
        selectedItem.itemId,
        updateData
      );
      setEditDialogOpen(false);
      setSelectedItem(null);
      loadItems();
      showSnackbar('Product updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update item:', error);
      showSnackbar('Failed to update product', 'error');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await InventoryApiService.deleteInventoryItem(itemId);
      loadItems();
      showSnackbar('Product deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete item:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const handleImageManagement = (item: InventoryItem) => {
    setCurrentItemForImages(item);
    setImageDialogOpen(true);
    loadItemImages(item.itemId);
  };

  const loadItemImages = async (itemId: number) => {
    setImageLoading(true);
    try {
      const response = await InventoryApiService.getInventoryItemImages(itemId);
      console.log('🔍 DEBUG - loadItemImages - API response:', response);
      console.log('🔍 DEBUG - loadItemImages - Response:', response);
      if (response) {
        console.log('🔍 DEBUG - loadItemImages - Setting images:', response);
        console.log(
          '🔍 DEBUG - loadItemImages - First image url:',
          response[0]?.url
        );
        setItemImages(response);
      } else {
        console.log('🔍 DEBUG - loadItemImages - No images in response');
        setItemImages([]);
      }
    } catch (error) {
      console.error('Failed to load item images:', error);
      showSnackbar('Failed to load images', 'error');
      setItemImages([]);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!currentItemForImages) return;

    const totalFiles = files.length;
    let completedFiles = 0;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          const response = await InventoryApiService.uploadInventoryImage(
            currentItemForImages.itemId,
            file,
            {
              isPrimary: itemImages.length === 0,
              altText: file.name,
              sortOrder: itemImages.length + i,
            }
          );

          if (response) {
            completedFiles++;
            const progress = Math.round((completedFiles / totalFiles) * 100);
            setUploadProgress(progress);

            // Add the new image to the current list
            if (response) {
              setItemImages((prev) => [...prev, response]);
            }
          }
        } catch (error) {
          console.error(`Failed to upload image ${file.name}:`, error);
          showSnackbar(`Failed to upload ${file.name}`, 'error');
        }
      }

      if (completedFiles > 0) {
        showSnackbar(
          `Successfully uploaded ${completedFiles} image(s)!`,
          'success'
        );
        await loadItemImages(currentItemForImages.itemId);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!currentItemForImages) return;

    try {
      await InventoryApiService.deleteInventoryImage(
        currentItemForImages.itemId,
        imageId
      );
      setItemImages((prev) => prev.filter((img) => img.imageId !== imageId));
      showSnackbar('Image deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete image:', error);
      showSnackbar('Failed to delete image', 'error');
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!currentItemForImages) return;

    try {
      // This would need to be implemented in the API
      // await inventoryApi.setPrimaryImage(currentItemForImages.itemId, imageId);

      // For now, update local state
      setItemImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.imageId === imageId,
        }))
      );
      showSnackbar('Primary image updated', 'success');
    } catch (error) {
      console.error('Failed to set primary image:', error);
      showSnackbar('Failed to set primary image', 'error');
    }
  };

  const closeImageDialog = () => {
    setImageDialogOpen(false);
    setCurrentItemForImages(null);
    setItemImages([]);
    setUploading(false);
    setUploadProgress(0);
  };

  if (loading) {
    return (
      <Box>
        <Header onLoginClick={() => navigate('/login')} />
        <Container maxWidth='lg' sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header onLoginClick={() => navigate('/login')} />
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant='h4' component='h1'>
            Store Inventory
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h6' color='text.secondary'>
            Manage your store's product inventory
          </Typography>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Product
          </Button>
        </Box>

        {items.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant='h6' gutterBottom>
                No products yet
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Add your first product to get started
              </Typography>
              <Button
                variant='contained'
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
              >
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.itemId}>
                      <TableCell>
                        <Box>
                          <Typography variant='body1' fontWeight={600}>
                            {item.name}
                          </Typography>
                          {item.description && (
                            <Typography variant='body2' color='text.secondary'>
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontFamily='monospace'>
                          {item.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          ${item.price.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.quantity}
                          size='small'
                          color={item.quantity > 0 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title='Manage Images'>
                            <IconButton
                              size='small'
                              onClick={() => handleImageManagement(item)}
                            >
                              <Image />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton
                              size='small'
                              onClick={() => {
                                setSelectedItem(item);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteItem(item.itemId)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Add Product Dialog */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Add New Product</DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
            >
              <TextField
                fullWidth
                label='Product Name *'
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <TextField
                fullWidth
                label='SKU *'
                value={newItem.sku}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={3}
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label='Price *'
                  type='number'
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>$</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Quantity *'
                  type='number'
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value) || 0,
                    }))
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>units</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Unit'
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  placeholder='lb, kg, dozen, each'
                  helperText='Enter the unit of measurement'
                />
                <FormControl fullWidth disabled={loadingCategories}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItem.category}
                    label='Category'
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value='General'>
                      <em>General</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} variant='contained'>
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth='sm'
          fullWidth
        >
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
              >
                <TextField
                  fullWidth
                  label='Product Name *'
                  value={selectedItem.name}
                  onChange={(e) =>
                    setSelectedItem((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
                <TextField
                  fullWidth
                  label='SKU *'
                  value={selectedItem.sku}
                  onChange={(e) =>
                    setSelectedItem((prev) =>
                      prev ? { ...prev, sku: e.target.value } : null
                    )
                  }
                />
                <TextField
                  fullWidth
                  label='Description'
                  multiline
                  rows={3}
                  value={selectedItem.description || ''}
                  onChange={(e) =>
                    setSelectedItem((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label='Price *'
                    type='number'
                    value={selectedItem.price}
                    onChange={(e) =>
                      setSelectedItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              price: parseFloat(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>$</InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label='Quantity'
                    type='number'
                    value={selectedItem.quantity}
                    onChange={(e) =>
                      setSelectedItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              quantity: parseInt(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>units</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem} variant='contained'>
              Update Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Management Dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={closeImageDialog}
          maxWidth='md'
          fullWidth
        >
          <DialogTitle>
            Manage Images - {currentItemForImages?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              {/* Upload Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant='h6' gutterBottom>
                  Upload New Images
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files) {
                        handleImageUpload(files);
                      }
                    };
                    input.click();
                  }}
                >
                  <CloudUpload
                    sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                  />
                  <Typography variant='h6' gutterBottom>
                    Click to upload images
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Drag and drop or click to select multiple images
                  </Typography>
                </Box>
                {uploading && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant='determinate'
                      value={uploadProgress}
                    />
                    <Typography variant='body2' sx={{ mt: 1 }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Current Images */}
              <Typography variant='h6' gutterBottom>
                Current Images ({itemImages.length})
              </Typography>
              {imageLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress />
                </Box>
              ) : itemImages.length === 0 ? (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ py: 3 }}
                >
                  No images uploaded yet
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {itemImages.map((image) => (
                    <Card key={image.imageId} sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 150,
                          backgroundImage: `url(${image.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-end',
                          p: 1,
                        }}
                      >
                        {image.isPrimary && (
                          <Chip
                            label='Primary'
                            size='small'
                            color='primary'
                            sx={{ position: 'absolute', top: 8, left: 8 }}
                          />
                        )}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title='Set as Primary'>
                            <IconButton
                              size='small'
                              onClick={() =>
                                handleSetPrimaryImage(image.imageId)
                              }
                              sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                            >
                              {image.isPrimary ? <Star /> : <StarBorder />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete Image'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleDeleteImage(image.imageId)}
                              sx={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeImageDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default SimpleInventoryPage;
