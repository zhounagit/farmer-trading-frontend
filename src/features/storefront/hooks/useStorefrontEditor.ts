import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import InventoryApiService from '../../inventory/services/inventoryApi';
import type { InventoryItem } from '../../../shared/types/inventory';
import StoresApiService from '../../stores/services/storesApi';
import type { Store } from '../../../shared/types/store';
import StorefrontApiService from '../services/storefrontApi';
import type {
  StorefrontPublishRequest,
  StorefrontTheme,
  StorefrontCustomization,
} from '../../../shared/types/storefront';
import { STOREFRONT_THEMES } from '../../../shared/types/storefront';
import type {
  StorefrontModuleConfig,
  StorefrontPreviewMode,
} from '../../../types/storefront';

export interface UseStorefrontEditorReturn {
  // Store data
  storeId: string | undefined;
  storeData: Store | null;
  storeDataLoading: boolean;

  // Theme management
  selectedTheme: StorefrontTheme;
  availableThemes: StorefrontTheme[];
  setSelectedTheme: (theme: StorefrontTheme) => void;

  // Module management
  modules: StorefrontModuleConfig[];
  setModules: (modules: StorefrontModuleConfig[]) => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;

  // Preview mode
  previewMode: StorefrontPreviewMode;
  setPreviewMode: (mode: StorefrontPreviewMode) => void;

  // Inventory
  inventoryItems: InventoryItem[];
  inventoryLoading: boolean;
  productImages: Record<number, string>;
  setProductImages: (images: Record<number, string>) => void;

  // UI state
  activeTab: number;
  setActiveTab: (tab: number) => void;
  showAddModuleDialog: boolean;
  setShowAddModuleDialog: (show: boolean) => void;

  // Actions
  isSaving: boolean;
  isDirty: boolean;
  saveChanges: () => Promise<void>;
  publishStorefront: () => Promise<void>;
  loadStoreData: () => Promise<void>;
  loadInventoryItems: () => Promise<void>;

  // Snackbar
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  };
  setSnackbar: (snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }) => void;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useStorefrontEditor = (): UseStorefrontEditorReturn => {
  const { storeId } = useParams<{ storeId: string }>();

  // Store data state
  const [storeData, setStoreData] = useState<Store | null>(null);
  const [storeDataLoading, setStoreDataLoading] = useState(false);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<StorefrontTheme>(
    STOREFRONT_THEMES[0]
  );

  // Module state
  const [modules, setModules] = useState<StorefrontModuleConfig[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Preview state
  const [previewMode, setPreviewMode] = useState<StorefrontPreviewMode>({
    device: 'desktop',
    isLivePreview: true,
  });

  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [productImages, setProductImages] = useState<Record<number, string>>(
    {}
  );

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Feedback state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load store data
  const loadStoreData = useCallback(async () => {
    if (!storeId) return;

    setStoreDataLoading(true);
    setError(null);

    try {
      const data = await StoresApiService.getStore(parseInt(storeId));
      setStoreData(data);

      // Load existing storefront customization if available
      try {
        const storefront = await StorefrontApiService.getStorefront(
          parseInt(storeId)
        );
        if (storefront.customization?.theme) {
          const theme = STOREFRONT_THEMES.find(
            (t) => t.id === storefront.customization.theme.id
          );
          if (theme) {
            setSelectedTheme(theme);
          }
        }
        if (storefront.customization) {
          // Handle modules from storefront customization
          // The modules property might be available in the actual API response
          const customizationWithModules = storefront.customization as any;
          if (customizationWithModules.modules) {
            setModules(customizationWithModules.modules);
          }
        }
      } catch (error) {
        // No existing customization found, using defaults
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load store data'
      );
      setSnackbar({
        open: true,
        message: 'Failed to load store data',
        severity: 'error',
      });
    } finally {
      setStoreDataLoading(false);
    }
  }, [storeId]);

  // Load inventory items
  const loadInventoryItems = useCallback(async () => {
    if (!storeId) return;

    setInventoryLoading(true);
    setError(null);

    try {
      const result = await InventoryApiService.getInventoryItems(
        parseInt(storeId)
      );
      const items = result.items;
      setInventoryItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setInventoryLoading(false);
    }
  }, [storeId]);

  // Save changes
  const saveChanges = useCallback(async () => {
    if (!storeId || !storeData) return;

    setIsSaving(true);
    setError(null);

    try {
      const customization: StorefrontCustomization = {
        storeId: parseInt(storeId),
        theme: selectedTheme,
        layout: 'default',
        colorScheme: {
          primary: '#10B981',
          secondary: '#059669',
          accent: '#F59E0B',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text: {
            primary: '#111827',
            secondary: '#6B7280',
            muted: '#9CA3AF',
          },
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        typography: {
          fontFamily: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
          },
          fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
          },
          lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
          },
        },
        header: {
          showLogo: true,
          logoPosition: 'left',
          showStoreName: true,
          showTagline: false,
          showContactInfo: true,
          showSocialLinks: true,
          isSticky: true,
          backgroundColor: '#FFFFFF',
          textColor: '#111827',
        },
        navigation: {
          style: 'horizontal',
          showCategories: true,
          showSearch: true,
          showCart: true,
          showAccount: true,
          customMenuItems: [],
        },
        heroSection: {
          isEnabled: true,
          type: 'banner',
          layout: 'full-width',
          height: 'medium',
          content: {
            headline: 'Fresh From Our Farm',
            subheadline: 'Discover locally grown, organic produce',
            description:
              'Support local agriculture and enjoy the freshest ingredients delivered right to your door.',
          },
          backgroundSettings: {
            type: 'color',
            color: '#F9FAFB',
          },
        },
        productDisplay: {
          layout: 'grid',
          itemsPerRow: 3,
          showProductImages: true,
          showProductPrices: true,
          showProductDescription: true,
          showProductRating: true,
          showProductBadges: true,
          showAddToCartButton: true,
          showQuickViewButton: false,
          sortOptions: [
            {
              id: 'name',
              label: 'Name',
              field: 'name',
              direction: 'asc',
              isDefault: true,
              isActive: true,
            },
            {
              id: 'price-low',
              label: 'Price: Low to High',
              field: 'price',
              direction: 'asc',
              isDefault: false,
              isActive: true,
            },
            {
              id: 'price-high',
              label: 'Price: High to Low',
              field: 'price',
              direction: 'desc',
              isDefault: false,
              isActive: true,
            },
          ],
          filterOptions: [
            {
              id: 'category',
              type: 'category',
              label: 'Category',
              isActive: true,
            },
            {
              id: 'price',
              type: 'price',
              label: 'Price Range',
              isActive: true,
            },
            {
              id: 'organic',
              type: 'custom',
              label: 'Organic Only',
              field: 'isOrganic',
              isActive: true,
            },
          ],
        },
        footer: {
          isEnabled: true,
          layout: 'multi-column',
          showLogo: true,
          showContactInfo: true,
          showSocialLinks: true,
          showNewsletter: true,
          showBusinessHours: true,
          customSections: [],
          backgroundColor: '#1F2937',
          textColor: '#FFFFFF',
        },
        modules: modules,
        globalSettings: {
          colorScheme: {
            primary: '#10B981',
            secondary: '#059669',
            accent: '#F59E0B',
            background: '#FFFFFF',
            surface: '#F9FAFB',
            text: {
              primary: '#111827',
              secondary: '#6B7280',
              muted: '#9CA3AF',
            },
            border: '#E5E7EB',
            shadow: 'rgba(0, 0, 0, 0.1)',
          },
          typography: {
            fontFamily: {
              primary: 'Inter, system-ui, sans-serif',
            },
            fontSize: 'medium',
            fontWeight: {
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700,
            },
          },
          layout: {
            maxWidth: '1200px',
            containerPadding: '16px',
            spacing: 'normal',
            borderRadius: {
              sm: '4px',
              md: '8px',
              lg: '12px',
              xl: '16px',
            },
          },
          effects: {
            boxShadow: {
              sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },
            transition: {
              fast: '150ms',
              normal: '300ms',
              slow: '500ms',
            },
          },
        },
        customCss: '',
        customJs: '',
        isPublished: false,
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await StorefrontApiService.updateStorefront(parseInt(storeId), {
        customization,
      });
      setIsDirty(false);
      setSnackbar({
        open: true,
        message: 'Changes saved successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      setSnackbar({
        open: true,
        message: 'Failed to save changes',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [storeId, storeData, selectedTheme, modules]);

  // Publish storefront
  const publishStorefront = useCallback(async () => {
    if (!storeId || !storeData) return;

    setIsSaving(true);
    setError(null);

    try {
      const publishRequest: StorefrontPublishRequest = {
        isPublished: true,
      };

      await StorefrontApiService.publishStorefront(
        parseInt(storeId),
        publishRequest
      );
      setSnackbar({
        open: true,
        message: 'Storefront published successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to publish storefront'
      );
      setSnackbar({
        open: true,
        message: 'Failed to publish storefront',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [storeId, storeData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Track dirty state
  useEffect(() => {
    setIsDirty(true);
  }, [selectedTheme, modules]);

  // Load initial data
  useEffect(() => {
    if (storeId) {
      loadStoreData();
      loadInventoryItems();
    }
  }, [storeId, loadStoreData, loadInventoryItems]);

  return {
    // Store data
    storeId,
    storeData,
    storeDataLoading,

    // Theme management
    selectedTheme,
    availableThemes: [...STOREFRONT_THEMES],
    setSelectedTheme,

    // Module management
    modules,
    setModules,
    selectedModuleId,
    setSelectedModuleId,

    // Preview mode
    previewMode,
    setPreviewMode,

    // Inventory
    inventoryItems,
    inventoryLoading,
    productImages,
    setProductImages,

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
    loadStoreData,
    loadInventoryItems,

    // Snackbar
    snackbar,
    setSnackbar,

    // Error handling
    error,
    clearError,
  };
};

export default useStorefrontEditor;
