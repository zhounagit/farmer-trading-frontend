import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Store,
  CheckCircle,
  Warning,
  Edit,
  Add,
  Visibility,
  Business,
  Schedule,
  Payment,
  Palette,
  LocationOn,
  Phone,
  Email,
  ArrowForward,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StoreData {
  id: number;
  name: string;
  description: string;
  status: 'draft' | 'pending' | 'active' | 'suspended';
  completionPercentage: number;
  createdAt: string;
  address?: {
    streetLine: string;
    city: string;
    state: string;
    zipCode: string;
  };
  hasLogo: boolean;
  hasBanner: boolean;
  galleryImageCount: number;
  openHoursSet: boolean;
  paymentMethodsSet: boolean;
  sellingMethods: string[];
  lastUpdated: string;
}

interface StoreOverviewSectionProps {
  onNavigateToBranding?: () => void;
}

const StoreOverviewSection: React.FC<StoreOverviewSectionProps> = ({
  onNavigateToBranding,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchStoreData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock store data based on user having a store
      if (user?.hasStore) {
        setStoreData({
          id: 1,
          name: "Green Valley Farm",
          description: "Organic vegetables and seasonal produce",
          status: 'draft',
          completionPercentage: 65,
          createdAt: new Date().toISOString(),
          address: {
            streetLine: "123 Farm Road",
            city: "Green Valley",
            state: "CA",
            zipCode: "95123"
          },
          hasLogo: false,
          hasBanner: false,
          galleryImageCount: 0,
          openHoursSet: true,
          paymentMethodsSet: true,
          sellingMethods: ['on-farm-pickup', 'local-delivery'],
          lastUpdated: new Date().toISOString(),
        });
      }
      setLoading(false);
    };

    fetchStoreData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Review';
      case 'suspended': return 'Suspended';
      default: return 'Draft';
    }
  };

  const getMissingSteps = (store: StoreData) => {
    const steps = [];

    if (!store.hasLogo) {
      steps.push({
        title: 'Upload Store Logo',
        description: 'Add a professional logo to build trust with customers',
        action: 'Upload Logo',
        icon: <Palette />,
        severity: 'medium' as const,
      });
    }

    if (!store.hasBanner) {
      steps.push({
        title: 'Add Store Banner',
        description: 'Showcase your farm with a beautiful header image',
        action: 'Add Banner',
        icon: <Palette />,
        severity: 'medium' as const,
      });
    }

    if (store.galleryImageCount === 0) {
      steps.push({
        title: 'Add Gallery Images',
        description: 'Show customers your products and farm',
        action: 'Add Images',
        icon: <Palette />,
        severity: 'high' as const,
      });
    }

    return steps;
  };

  const handleCompleteSetup = () => {
    onNavigateToBranding?.();
  };

  const handleViewStore = () => {
    if (storeData) {
      navigate(`/stores/${storeData.id}`);
    }
  };

  const handleEditStore = () => {
    if (storeData) {
      navigate(`/stores/${storeData.id}/edit`);
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading store information...
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (!storeData) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Store Overview
        </Typography>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Store sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Store Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            It looks like you haven't created a store yet, or there was an issue loading your store data.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/open-shop')}
          >
            Create Your Store
          </Button>
        </Paper>
      </Box>
    );
  }

  const missingSteps = getMissingSteps(storeData);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Store Overview
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={handleViewStore}
            size="small"
          >
            View Store
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleEditStore}
            size="small"
          >
            Settings
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Store Info Card */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {storeData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {storeData.description}
                  </Typography>
                  <Chip
                    label={getStatusText(storeData.status)}
                    color={getStatusColor(storeData.status)}
                    size="small"
                  />
                </Box>
              </Box>
              <IconButton onClick={handleEditStore} size="small">
                <Edit />
              </IconButton>
            </Box>

            {/* Completion Progress */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Store Setup Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {storeData.completionPercentage}% Complete
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={storeData.completionPercentage}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Store Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Address
                </Typography>
                {storeData.address ? (
                  <Typography variant="body2" color="text.secondary">
                    {storeData.address.streetLine}<br />
                    {storeData.address.city}, {storeData.address.state} {storeData.address.zipCode}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="error.main">
                    No address set
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Selling Methods
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {storeData.sellingMethods.map((method) => (
                    <Chip
                      key={method}
                      label={method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Grid>
            </Grid>

            {/* Quick Stats */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Schedule sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {storeData.openHoursSet ? 'Hours Set' : 'Hours Missing'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Payment sx={{ color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {storeData.paymentMethodsSet ? 'Payment Set' : 'Payment Missing'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Palette sx={{ color: storeData.hasLogo ? 'success.main' : 'error.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {storeData.hasLogo ? 'Logo Added' : 'No Logo'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Palette sx={{ color: storeData.galleryImageCount > 0 ? 'success.main' : 'error.main', mb: 1 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {storeData.galleryImageCount} Images
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Missing Steps Card */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Complete Your Setup
            </Typography>

            {missingSteps.length === 0 ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🎉 Your store setup is complete!
                </Typography>
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Complete these steps to improve your store's visibility and attract more customers.
                </Typography>

                <List disablePadding>
                  {missingSteps.map((step, index) => (
                    <React.Fragment key={index}>
                      <ListItemButton
                        onClick={handleCompleteSetup}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid',
                          borderColor: step.severity === 'high' ? 'error.main' : 'warning.main',
                          '&:hover': {
                            bgcolor: step.severity === 'high' ? 'error.50' : 'warning.50',
                          }
                        }}
                      >
                        <ListItemIcon>
                          {step.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {step.title}
                              </Typography>
                              <Chip
                                label={step.severity === 'high' ? 'Important' : 'Recommended'}
                                color={step.severity === 'high' ? 'error' : 'warning'}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={step.description}
                        />
                        <ArrowForward sx={{ color: 'text.secondary' }} />
                      </ListItemButton>
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Palette />}
                  onClick={handleCompleteSetup}
                  sx={{ mt: 2 }}
                >
                  Complete Branding Setup
                </Button>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              <strong>Last updated:</strong> {new Date(storeData.lastUpdated).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StoreOverviewSection;
