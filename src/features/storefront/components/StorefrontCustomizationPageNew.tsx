import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Container, Stack } from '../../shared/components';
import { ErrorDisplay, Loading } from '../../shared/components/feedback';
import StorefrontHeader from '../../features/storefront/components/sections/StorefrontHeader';
import StorefrontTabs from '../../features/storefront/components/StorefrontTabs';
import { useStorefrontEditor } from '../../features/storefront/hooks/useStorefrontEditor';
import type { ModuleTemplate } from '../../types/storefront';
import type { Store } from '../../shared/types/store';

// Module templates - this would normally come from an API or config
const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'hero-banner',
    name: 'Hero Banner',
    description: 'Large promotional banner with image and text',
    defaultConfig: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      showButton: true,
      buttonText: 'Shop Now',
    },
    premium: false,
  },
  {
    type: 'featured-products',
    name: 'Featured Products',
    description: 'Showcase your best products',
    defaultConfig: {
      title: 'Featured Products',
      maxItems: 4,
      showPrices: true,
    },
    premium: false,
  },
  {
    type: 'product-grid',
    name: 'Product Grid',
    description: 'Display products in a grid layout',
    defaultConfig: {
      title: 'Our Products',
      columns: 3,
      maxItems: 9,
      showFilters: false,
    },
    premium: false,
  },
  {
    type: 'contact-info',
    name: 'Contact Information',
    description: 'Display store contact details',
    defaultConfig: {
      title: 'Get in Touch',
      showPhone: true,
      showEmail: true,
      showAddress: true,
    },
    premium: false,
  },
  {
    type: 'business-hours',
    name: 'Business Hours',
    description: 'Show when your store is open',
    defaultConfig: {
      title: 'Store Hours',
      format: '12-hour',
    },
    premium: false,
  },
  {
    type: 'location-map',
    name: 'Location Map',
    description: 'Interactive map showing store location',
    defaultConfig: {
      title: 'Find Us',
      showDirections: true,
      zoom: 15,
    },
    premium: true,
  },
  {
    type: 'inventory-showcase',
    name: 'Inventory Showcase',
    description: 'Live inventory with availability',
    defaultConfig: {
      title: 'Available Now',
      showStock: true,
      autoUpdate: true,
    },
    premium: true,
  },
];

const StorefrontCustomizationPageNew: React.FC = () => {
  const navigate = useNavigate();
  const {
    // Store data
    storeId,
    storeData,
    storeDataLoading,

    // Theme management
    selectedTheme,
    availableThemes,
    setSelectedTheme,

    // Module management
    modules,
    setModules,
    selectedModuleId,
    setSelectedModuleId,

    // Preview mode
    previewMode,
    setPreviewMode,

    // UI state
    activeTab,
    setActiveTab,
    showAddModuleDialog,
    setShowAddModuleDialog,

    // Actions
    isSaving,
    isDirty,
    saveChanges,
    publishStorefront,

    // Feedback
    snackbar,
    setSnackbar,

    // Error handling
    error,
    clearError,
  } = useStorefrontEditor();

  // Handle back navigation
  const handleBack = () => {
    if (isDirty) {
      const shouldLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!shouldLeave) return;
    }
    navigate(`/stores/${storeId}`);
  };

  // Handle save with error handling
  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Handle publish with confirmation
  const handlePublish = async () => {
    const shouldPublish = window.confirm(
      'This will make your storefront publicly available. Continue?'
    );
    if (!shouldPublish) return;

    try {
      // Save changes first if needed
      if (isDirty) {
        await saveChanges();
      }
      await publishStorefront();
    } catch (err) {
      console.error('Publish failed:', err);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Show loading state
  if (storeDataLoading) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Loading
          variant='skeleton'
          rows={8}
          height={60}
          text='Loading storefront customization...'
        />
      </Container>
    );
  }

  // Show error state
  if (error && !storeData) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <ErrorDisplay
          variant='error'
          title='Failed to load storefront'
          message={error}
          showRetry
          onRetry={clearError}
          onDismiss={() => navigate('/stores')}
        />
      </Container>
    );
  }

  // Show not found state
  if (!storeData && !storeDataLoading) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <ErrorDisplay
          variant='error'
          title='Store not found'
          message='The requested store could not be found.'
          onDismiss={() => navigate('/stores')}
        />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Container maxWidth='xl' padding='none'>
        <StorefrontHeader
          storeId={storeId}
          storeName={storeData?.storeName}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          isSaving={isSaving}
          isDirty={isDirty}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </Container>

      {/* Main Content */}
      <Container
        maxWidth='xl'
        padding='none'
        sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ flex: 1, bgcolor: 'background.paper' }}>
          <StorefrontTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            storeData={storeData as Store | null}
            selectedTheme={selectedTheme}
            availableThemes={availableThemes}
            onThemeChange={setSelectedTheme}
            modules={modules}
            onModulesChange={setModules}
            selectedModuleId={selectedModuleId}
            onModuleSelect={setSelectedModuleId}
            showAddModuleDialog={showAddModuleDialog}
            onShowAddModuleDialog={setShowAddModuleDialog}
            availableTemplates={MODULE_TEMPLATES}
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            loading={isSaving}
          />
        </Box>
      </Container>

      {/* Snackbar for feedback */}
      {snackbar.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1500,
          }}
        >
          <ErrorDisplay
            variant={snackbar.severity === 'error' ? 'error' : 'success'}
            message={snackbar.message}
            compact
            onDismiss={handleCloseSnackbar}
          />
        </Box>
      )}
    </Box>
  );
};

export default StorefrontCustomizationPageNew;
