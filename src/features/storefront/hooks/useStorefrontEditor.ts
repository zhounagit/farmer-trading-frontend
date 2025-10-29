import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import InventoryApiService from '../../inventory/services/inventoryApi';
import type { InventoryItem } from '../../../shared/types/inventory';
import StoresApiService from '../../stores/services/storesApi';
import type { Store } from '../../../shared/types/store';
import StorefrontApiService from '../services/storefrontApi';
import type {
  StorefrontCustomization,
  StorefrontPublishRequest,
} from '../../../shared/types/storefront';
import { AVAILABLE_THEMES, type StorefrontTheme } from '../../../types/themes';
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
    AVAILABLE_THEMES[0]
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
          const theme = AVAILABLE_THEMES.find(
            (t) => t.id === storefront.customization.theme.id
          );
          if (theme) {
            setSelectedTheme(theme);
          }
        }
        if (storefront.customization?.modules) {
          setModules(storefront.customization.modules);
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
        modules: modules,
        settings: {
          showInventory: true,
          showBusinessHours: true,
          showContactInfo: true,
          allowOnlineOrdering: false,
        },
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
        storeId: parseInt(storeId),
        isPublic: true,
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
    availableThemes: AVAILABLE_THEMES,
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
