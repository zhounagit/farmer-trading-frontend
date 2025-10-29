import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Store,
  Public,
  Launch,
  Settings,
  CheckCircle,
  Warning,
  Info,
  Inventory,
  Palette,
  Analytics,
} from '@mui/icons-material';
import Header from '../../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import StorefrontApiService from '../services/storefront.api';

interface StorefrontTestPageProps {
  // Empty interface is intentional for future props
}

const StorefrontTestPage: React.FC<StorefrontTestPageProps> = () => {
  const navigate = useNavigate();
  const [testStoreId, setTestStoreId] = useState<string>('1');
  const [testSlug, setTestSlug] = useState<string>('demo-farm');
  const [loading, setLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Record<string, unknown>[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [publishDialogOpen] = useState<boolean>(false);

  const addTestResult = (
    test: string,
    success: boolean,
    message: string,
    data?: Record<string, unknown>
  ) => {
    setTestResults((prev) => [
      {
        test,
        success,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      ...prev.slice(0, 9),
    ]);
  };

  const testStorefrontStatus = async () => {
    setLoading(true);
    try {
      const status = await StorefrontApiService.getStorefrontStatus(
        Number(testStoreId)
      );
      addTestResult(
        'Get Storefront Status',
        true,
        `Status: ${status.status}, Published: ${status.isPublished}`,
        status
      );
    } catch (error: unknown) {
      addTestResult('Get Storefront Status', false, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testPublicStorefront = async () => {
    setLoading(true);
    try {
      const storefront =
        await StorefrontApiService.getPublicStorefront(testSlug);
      addTestResult(
        'Get Public Storefront',
        true,
        `Found: ${storefront.storeName} with ${storefront.products?.length || 0} products`,
        storefront
      );
    } catch (error: unknown) {
      addTestResult('Get Public Storefront', false, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testPublishStorefront = async () => {
    setLoading(true);
    try {
      const mockCustomization = {
        storeId: Number(testStoreId),
        modules: [
          {
            id: 'hero-1',
            type: 'hero',
            title: 'Welcome to Our Farm',
            content: { subtitle: 'Fresh produce from our family to yours' },
            settings: {},
            order: 1,
            isVisible: true,
          },
        ],
        globalSettings: {
          primaryColor: '#2E7D32',
          secondaryColor: '#FFA726',
        },
        isPublished: true,
        publishedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const response = await StorefrontApiService.publishStorefront({
        storeId: Number(testStoreId),
        customization: mockCustomization,
        publishNow: true,
      });

      addTestResult(
        'Publish Storefront',
        true,
        `Published successfully! URL: ${response.publicUrl}`,
        response
      );
    } catch (error: unknown) {
      addTestResult('Publish Storefront', false, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testBrowseStorefronts = async () => {
    setLoading(true);
    try {
      const response = await StorefrontApiService.browseStorefronts({
        page: 1,
        limit: 5,
      });
      addTestResult(
        'Browse Storefronts',
        true,
        `Found ${response.storefronts.length} storefronts, ${response.total} total`,
        response
      );
    } catch (error: unknown) {
      addTestResult('Browse Storefronts', false, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testGenerateSlug = async () => {
    setLoading(true);
    try {
      const response = await StorefrontApiService.generateSlug(
        Number(testStoreId),
        'my-awesome-farm'
      );
      addTestResult(
        'Generate Slug',
        true,
        `Generated slug: ${response.slug}, Available: ${response.available}`,
        response
      );
    } catch (error: unknown) {
      addTestResult('Generate Slug', false, (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testStorefrontStatus();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testBrowseStorefronts();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testGenerateSlug();
    await new Promise((resolve) => setTimeout(resolve, 500));
    await testPublicStorefront();
  };

  const features = [
    {
      title: 'Storefront Customization',
      description:
        'Design and customize your storefront with themes, modules, and branding',
      icon: <Palette />,
      status: 'implemented',
      link: `/stores/${testStoreId}/customize`,
    },
    {
      title: 'Inventory Management',
      description: 'Manage products, upload images, track stock levels',
      icon: <Inventory />,
      status: 'implemented',
      link: `/inventory/${testStoreId}`,
    },
    {
      title: 'Live Storefront',
      description: 'Customer-facing storefront with your products and branding',
      icon: <Public />,
      status: 'implemented',
      link: `/store/${testSlug}`,
    },
    {
      title: 'Browse Storefronts',
      description: 'Public directory of all published storefronts',
      icon: <Store />,
      status: 'implemented',
      link: '/browse',
    },
    {
      title: 'Store Management',
      description: 'Manage multiple stores and view publication status',
      icon: <Settings />,
      status: 'implemented',
      link: '/my-stores',
    },
    {
      title: 'Analytics (Future)',
      description: 'Track storefront views, customer engagement, and sales',
      icon: <Analytics />,
      status: 'planned',
      link: null,
    },
  ];

  return (
    <Box>
      <Header onLoginClick={() => navigate('/login')} />

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant='h3'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            <Store sx={{ mr: 2, verticalAlign: 'middle' }} />
            Storefront System Demo
          </Typography>
          <Typography variant='h6' color='text.secondary' paragraph>
            Test and explore the complete storefront publishing workflow
          </Typography>
        </Box>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Quick Actions
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant='contained'
                      startIcon={<Palette />}
                      onClick={() =>
                        navigate(`/stores/${testStoreId}/customize`)
                      }
                    >
                      Customize Store
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant='contained'
                      startIcon={<Inventory />}
                      onClick={() => navigate(`/inventory/${testStoreId}`)}
                    >
                      Manage Products
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant='outlined'
                      startIcon={<Public />}
                      onClick={() =>
                        window.open(`/store/${testSlug}`, '_blank')
                      }
                    >
                      View Live Store
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant='outlined'
                      startIcon={<Store />}
                      onClick={() => navigate('/browse')}
                    >
                      Browse All Stores
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                  API Testing
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label='Test Store ID'
                    value={testStoreId}
                    onChange={(e) => setTestStoreId(e.target.value)}
                    size='small'
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    label='Test Store Slug'
                    value={testSlug}
                    onChange={(e) => setTestSlug(e.target.value)}
                    size='small'
                  />
                </Box>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant='outlined'
                      size='small'
                      onClick={testStorefrontStatus}
                      disabled={loading}
                    >
                      Test Status
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant='outlined'
                      size='small'
                      onClick={testBrowseStorefronts}
                      disabled={loading}
                    >
                      Test Browse
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant='contained'
                      onClick={runAllTests}
                      disabled={loading}
                      startIcon={
                        loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <CheckCircle />
                        )
                      }
                    >
                      {loading ? 'Running Tests...' : 'Run All Tests'}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Features Overview */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
              Feature Implementation Status
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {feature.icon}
                      <Typography variant='h6' sx={{ ml: 1, flexGrow: 1 }}>
                        {feature.title}
                      </Typography>
                      <Chip
                        label={feature.status}
                        color={
                          feature.status === 'implemented'
                            ? 'success'
                            : 'default'
                        }
                        size='small'
                      />
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                      sx={{ flexGrow: 1 }}
                    >
                      {feature.description}
                    </Typography>
                    {feature.link && (
                      <Button
                        size='small'
                        variant='outlined'
                        endIcon={<Launch />}
                        onClick={() => {
                          if (feature.link?.startsWith('/store/')) {
                            window.open(feature.link, '_blank');
                          } else {
                            navigate(feature.link!);
                          }
                        }}
                      >
                        {feature.link.includes('/store/') ? 'View' : 'Open'}
                      </Button>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant='h5' gutterBottom>
                <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
                Test Results
              </Typography>
              <List>
                {testResults.map((result, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      {result.success ? (
                        <CheckCircle color='success' />
                      ) : (
                        <Warning color='error' />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={result.test}
                      secondary={
                        <Box>
                          <Typography
                            variant='body2'
                            color={
                              result.success ? 'success.main' : 'error.main'
                            }
                          >
                            {result.message}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {new Date(result.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                    {result.data && (
                      <Button
                        size='small'
                        variant='text'
                        onClick={() => {
                          setDialogOpen(true);
                          console.log('Test Result Data:', result.data);
                        }}
                      >
                        View Data
                      </Button>
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        )}

        {/* Workflow Overview */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
              Complete Workflow
            </Typography>
            <Alert severity='info' sx={{ mb: 2 }}>
              Follow this workflow to set up and publish your storefront
            </Alert>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    1
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary='Set up your store'
                  secondary='Create store profile, add contact info, hours, and payment methods'
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    2
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary='Add inventory'
                  secondary='Upload products, set prices, add descriptions and images'
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    3
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary='Customize storefront'
                  secondary='Choose theme, arrange modules, customize colors and layout'
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    4
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary='Publish storefront'
                  secondary='Make your store live and accessible to customers'
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    5
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary='Share your store'
                  secondary='Your store appears in browse directory and has a unique URL'
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>

      {/* Test Data Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Test Result Data</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            Check the browser console for detailed test result data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StorefrontTestPage;
