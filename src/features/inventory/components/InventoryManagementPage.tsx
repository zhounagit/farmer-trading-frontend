import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Pagination,
  InputAdornment,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  Upload,
  Download,
  Image,
  ArrowBack,
  Visibility,
  VisibilityOff,
  MoreVert,
  Inventory,
  Warning,
  TrendingUp,
  TrendingDown,
  LocalOffer,
  PhotoCamera,
  AttachMoney,
  Category,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import InventoryApiService, {
  InventoryItem,
  InventoryFilters,
} from '../../services/inventory.api';
import categoryApiService, {
  ProductCategory,
} from '../../services/category.api';
import SimpleImageUpload from '../../components/inventory/SimpleImageUpload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const InventoryManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dialog states
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [imageManagerDialogOpen, setImageManagerDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form states
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    sku: '',
    price: '',
    cost: '',
    quantity: '',
    unit: '',
    minStockLevel: 0,
    isActive: true,
    allowOffers: false,
  });

  // Filter and search states
  const [filters, setFilters] = useState<InventoryFilters>({
    page: 1,
    limit: itemsPerPage,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Category states
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemForMenu, setSelectedItemForMenu] =
    useState<InventoryItem | null>(null);

  // Notification states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    'success' | 'error' | 'warning' | 'info'
  >('info');

  // Stats states
  const [stats, setStats] = useState({
    total_items: 0,
    active_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_value: 0,
    items_with_images: 0,
  });

  // Load inventory items
  useEffect(() => {
    loadInventoryItems();
    loadCategories();
    if (storeId) {
      loadStats();
    }
  }, [filters, storeId]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoryApiService.getActiveCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showSnackbar('Failed to load product categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await InventoryApiService.getInventoryItems(
        Number(storeId),
        filters
      );

      setInventoryItems(response.items || []);
      setTotalItems(response.totalCount || 0);
    } catch (error) {
      showSnackbar('Failed to load inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!storeId) return;
      const response = await InventoryApiService.getInventoryStats(
        Number(storeId)
      );
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const showSnackbar = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleAddItem = async () => {
    try {
      if (!storeId || !newItem.name || !newItem.sku || !newItem.price) {
        showSnackbar('Please fill in all required fields', 'error');
        return;
      }

      await InventoryApiService.createInventoryItem({
        ...newItem,
        storeId: Number(storeId),
        price: Number(newItem.price || 0),
        cost: newItem.cost ? Number(newItem.cost) : undefined,
        quantity: Number(newItem.quantity || 0),
        minStockLevel: Number(newItem.minStockLevel || 0),
      } as any);

      setAddItemDialogOpen(false);
      setNewItem({
        name: '',
        description: '',
        sku: '',
        price: '',
        cost: '',
        quantity: '',
        min_stock_level: 0,
        is_active: true,
        allow_offers: false,
      });
      loadInventoryItems();
      showSnackbar('Item added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add item', 'error');
    }
  };

  const handleEditItem = async () => {
    try {
      if (!editingItem) return;

      await InventoryApiService.updateInventoryItem(editingItem.itemId, {
        ...editingItem,
        price: Number(editingItem.price),
        cost: editingItem.cost ? Number(editingItem.cost) : undefined,
        quantity: Number(editingItem.quantity),
        minStockLevel: Number(editingItem.minStockLevel),
      });

      setEditItemDialogOpen(false);
      setEditingItem(null);
      loadInventoryItems();
      showSnackbar('Item updated successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to update item', 'error');
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (!selectedItem) return;

      await InventoryApiService.deleteInventoryItem(selectedItem.itemId);
      setDeleteConfirmOpen(false);
      setSelectedItem(null);
      loadInventoryItems();
      showSnackbar('Item deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to delete item', 'error');
    }
  };

  const handleToggleActive = async (item: InventoryItem) => {
    try {
      await InventoryApiService.updateInventoryItem(item.itemId, {
        isActive: !item.isActive,
      });
      loadInventoryItems();
      showSnackbar(
        `Item ${item.isActive ? 'deactivated' : 'activated'} successfully`,
        'success'
      );
    } catch (error) {
      showSnackbar('Failed to update item status', 'error');
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: InventoryItem
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemForMenu(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemForMenu(null);
  };

  const handleOpenImageManager = (item: InventoryItem) => {
    setSelectedItem(item);
    setImageManagerDialogOpen(true);
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStockStatusColor = (item: InventoryItem) => {
    if (item.quantity === 0) return 'error';
    if (item.quantity <= item.minStockLevel) return 'warning';
    return 'success';
  };

  const getStockStatusText = (item: InventoryItem) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minStockLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Box>
          {/* Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/stores/${storeId}/customize`)}
              size='small'
              sx={{ textTransform: 'none' }}
            >
              Back to Storefront
            </Button>
          </Box>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            Inventory Management
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Manage your products and upload images
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => setAddItemDialogOpen(true)}
          size='large'
        >
          Add Product
        </Button>
      </Box>

      {/* Image Upload Instructions */}
      <Alert severity='info' sx={{ mb: 3 }}>
        <Typography variant='body2' fontWeight={600} gutterBottom>
          📸 How to Upload Product Images:
        </Typography>
        <Typography variant='body2'>
          • Click the "Upload Images" button next to any product, OR • Use the
          camera icon in the product row, OR • Click the ⋮ menu → "Manage
          Images"
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color='textSecondary' gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant='h4'>{stats.total_items}</Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color='textSecondary' gutterBottom>
                    Active Products
                  </Typography>
                  <Typography variant='h4'>{stats.active_items}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color='textSecondary' gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant='h4'>{stats.low_stock_items}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography color='textSecondary' gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant='h4'>
                    {formatCurrency(stats.total_value)}
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Box
              component='form'
              onSubmit={handleSearch}
              sx={{ flex: 1, minWidth: 300 }}
            >
              <TextField
                fullWidth
                placeholder='Search products...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? 'contained' : 'outlined'}
            >
              Filters
            </Button>

            <Button startIcon={<Upload />} variant='outlined'>
              Import
            </Button>

            <Button startIcon={<Download />} variant='outlined'>
              Export
            </Button>
          </Box>

          {/* Advanced Filters */}
          {showFilters && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.isActive ?? ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          isActive:
                            e.target.value === ''
                              ? undefined
                              : e.target.value === 'true',
                        }))
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='true'>Active</MenuItem>
                      <MenuItem value='false'>Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Stock Status</InputLabel>
                    <Select
                      value={filters.low_stock ? 'low' : ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          low_stock: e.target.value === 'low',
                        }))
                      }
                    >
                      <MenuItem value=''>All</MenuItem>
                      <MenuItem value='low'>Low Stock</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='Min Price'
                    type='number'
                    value={filters.min_price || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        min_price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label='Max Price'
                    type='number'
                    value={filters.max_price || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        max_price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : inventoryItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant='h6' color='text.secondary'>
                      No products found
                    </Typography>
                    <Button
                      variant='contained'
                      startIcon={<Add />}
                      onClick={() => setAddItemDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Add Your First Product
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                inventoryItems.map((item) => (
                  <TableRow key={item.itemId} hover>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Avatar
                          sx={{ width: 60, height: 60, cursor: 'pointer' }}
                          variant='rounded'
                          onClick={() => handleOpenImageManager(item)}
                          title='Click to upload images'
                        >
                          <PhotoCamera />
                        </Avatar>
                        <Button
                          size='small'
                          variant='outlined'
                          startIcon={<PhotoCamera />}
                          onClick={() => handleOpenImageManager(item)}
                          sx={{ textTransform: 'none' }}
                        >
                          Upload Images
                        </Button>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography
                          variant='subtitle2'
                          sx={{ fontWeight: 600 }}
                        >
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            noWrap
                          >
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant='body2'
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {item.sku}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant='subtitle2'>
                        {formatCurrency(item.price)}
                      </Typography>
                      {item.cost && (
                        <Typography variant='caption' color='text.secondary'>
                          Cost: {formatCurrency(item.cost)}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={`${item.quantity} units`}
                        color={getStockStatusColor(item)}
                        variant='outlined'
                        size='small'
                      />
                      <Typography variant='caption' display='block'>
                        {getStockStatusText(item)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Switch
                        checked={item.isActive}
                        onChange={() => handleToggleActive(item)}
                        size='small'
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size='small'
                        onClick={(e) => handleMenuOpen(e, item)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalItems > itemsPerPage && (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(totalItems / itemsPerPage)}
              page={currentPage}
              onChange={(event, page) => {
                setCurrentPage(page);
                setFilters((prev) => ({ ...prev, page }));
              }}
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedItemForMenu) {
              setEditingItem({ ...selectedItemForMenu });
              setEditItemDialogOpen(true);
            }
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit Product</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedItemForMenu) {
              handleOpenImageManager(selectedItemForMenu);
            }
          }}
        >
          <ListItemIcon>
            <Image />
          </ListItemIcon>
          <ListItemText>Manage Images</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setSelectedItem(selectedItemForMenu);
            setDeleteConfirmOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add Item Dialog */}
      <Dialog
        open={addItemDialogOpen}
        onClose={() => setAddItemDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Product Name *'
                value={newItem.name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='SKU *'
                value={newItem.sku}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, sku: e.target.value }))
                }
              />
            </Grid>

            <Grid item xs={12}>
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Price *'
                type='number'
                value={newItem.price}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>$</InputAdornment>
                  ),
                }}
                placeholder='0.00'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Cost'
                type='number'
                value={newItem.cost}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    cost: e.target.value,
                  }))
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>$</InputAdornment>
                  ),
                }}
                placeholder='0.00'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Quantity'
                type='number'
                value={newItem.quantity}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>units</InputAdornment>
                  ),
                }}
                placeholder='0'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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
                placeholder='e.g., lb, kg, dozen, each, gallon'
                helperText='Enter the unit of measurement for this product'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Minimum Stock Level'
                type='number'
                value={newItem.minStockLevel}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    minStockLevel: Number(e.target.value),
                  }))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingCategories}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItem.categoryId || ''}
                    label='Category'
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        categoryId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  >
                    <MenuItem value=''>
                      <em>No Category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingCategories}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={newItem.categoryId || ''}
                    label='Category'
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        categoryId: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  >
                    <MenuItem value=''>
                      <em>No Category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newItem.allowOffers}
                      onChange={(e) =>
                        setNewItem((prev) => ({
                          ...prev,
                          allowOffers: e.target.checked,
                        }))
                      }
                    />
                  }
                  label='Allow customer offers'
                />
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant='contained'>
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={editItemDialogOpen}
        onClose={() => setEditItemDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editingItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Product Name *'
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='SKU *'
                  value={editingItem.sku}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, sku: e.target.value } : null
                    )
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  multiline
                  rows={3}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Price *'
                  type='number'
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, price: Number(e.target.value) } : null
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Cost'
                  type='number'
                  value={editingItem.cost}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev ? { ...prev, cost: Number(e.target.value) } : null
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>$</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Quantity'
                  type='number'
                  value={editingItem.quantity}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev
                        ? { ...prev, quantity: Number(e.target.value) }
                        : null
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Minimum Stock Level'
                  type='number'
                  value={editingItem.minStockLevel}
                  onChange={(e) =>
                    setEditingItem((prev) =>
                      prev
                        ? { ...prev, minStockLevel: Number(e.target.value) }
                        : null
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={loadingCategories}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editingItem.categoryId || ''}
                    label='Category'
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev
                          ? {
                              ...prev,
                              categoryId: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }
                          : null
                      )
                    }
                  >
                    <MenuItem value=''>
                      <em>No Category</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingItem.allowOffers}
                      onChange={(e) =>
                        setEditingItem((prev) =>
                          prev
                            ? { ...prev, allowOffers: e.target.checked }
                            : null
                        )
                      }
                    />
                  }
                  label='Allow customer offers'
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditItem} variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Manager Dialog */}
      <Dialog
        open={imageManagerDialogOpen}
        onClose={() => setImageManagerDialogOpen(false)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>Manage Product Images</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <SimpleImageUpload
              itemId={selectedItem.itemId}
              onImagesChange={(images) => {
                console.log('Images updated:', images);
                // Refresh inventory items to show updated image count
                loadInventoryItems();
              }}
              maxImages={10}
              maxFileSize={5 * 1024 * 1024}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageManagerDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.name}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteItem} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryManagementPage;
