import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Switch,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Alert,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  DragIndicator,
  Add,
  Delete,
  Save,
  Publish,
  Settings,
  Phone,
  Tablet,
  Computer,
  ArrowBack,
  ContentCopy,
  Image,
  Category,
  Star,
  ContactMail,
  Email,
  Share,
  ViewModule,
  LocationOn,
  Inventory,
  Payment,
  Schedule,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import InventoryApiService from '../../services/inventory.api';
import type { InventoryItem } from '../../services/inventory.api';
import StoreApiService from '../../services/store.api';
import type { ComprehensiveStoreData } from '../../services/store.api';
import ThemeSelector from '../../components/storefront/ThemeSelector';
import StorefrontApiService from '../../services/storefront.api';
import type {
  StorefrontCustomization,
  StorefrontPublishRequest,
  StorefrontModule,
} from '../../services/storefront.api';
import HeroBannerImageUpload from '../../components/storefront/HeroBannerImageUpload';
import {
  AVAILABLE_THEMES,
  generateThemeCSS,
  type StorefrontTheme,
} from '../../types/themes';
import { API_CONFIG } from '../../utils/api';
import type {
  StorefrontModuleConfig,
  StorefrontModuleType,
  ModuleTemplate,
  StorefrontPreviewMode,
} from '../../types/storefront';

// Mock data for module templates
const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    type: 'hero-banner',
    name: 'Hero Banner',
    description: 'Large banner with image, title, and call-to-action',
    icon: 'Image',
    category: 'content',
    defaultSettings: {
      title: 'Welcome to Our Farm',
      subtitle: 'Fresh, organic produce delivered to your door',
      ctaText: 'Shop Now',
      textAlignment: 'center',
      height: 'large',
      overlayOpacity: 0.4,
      backgroundImage: '',
    },
    requiredSettings: ['title'],
    previewComponent: 'HeroBannerPreview',
    configComponent: 'HeroBannerConfig',
  },
  {
    type: 'store-introduction',
    name: 'Store Introduction',
    description: 'Tell your story and share your farming practices',
    icon: 'ContentCopy',
    category: 'content',
    defaultSettings: {
      content:
        '<p>Welcome to our family farm! We have been growing organic produce for over 20 years...</p>',
      showOwnerPhoto: true,
      textAlignment: 'left',
    },
    requiredSettings: ['content'],
    previewComponent: 'StoreIntroPreview',
    configComponent: 'StoreIntroConfig',
  },
  {
    type: 'featured-products',
    name: 'Featured Products',
    description: 'Showcase your best products',
    icon: 'Star',
    category: 'products',
    defaultSettings: {
      productIds: [],
      displayStyle: 'grid',
      productsPerRow: 3,
      showPrices: true,
      maxProducts: 6,
    },
    requiredSettings: [],
    previewComponent: 'FeaturedProductsPreview',
    configComponent: 'FeaturedProductsConfig',
  },
  {
    type: 'product-categories',
    name: 'Product Categories',
    description: 'Display your product categories for easy navigation',
    icon: 'Category',
    category: 'products',
    defaultSettings: {
      displayStyle: 'cards',
      categoriesPerRow: 4,
      showProductCounts: true,
      showImages: true,
    },
    requiredSettings: [],
    previewComponent: 'ProductCategoriesPreview',
    configComponent: 'ProductCategoriesConfig',
  },
  {
    type: 'all-products',
    name: 'All Products',
    description: 'Complete product catalog with filtering and sorting',
    icon: 'ViewModule',
    category: 'products',
    defaultSettings: {
      displayStyle: 'grid',
      productsPerPage: 24,
      productsPerRow: 3,
      enableFiltering: true,
      enableSorting: true,
      showSearchBar: true,
      defaultSortBy: 'name',
    },
    requiredSettings: [],
    previewComponent: 'AllProductsPreview',
    configComponent: 'AllProductsConfig',
  },
  {
    type: 'testimonials',
    name: 'Customer Testimonials',
    description: 'Show customer reviews and testimonials',
    icon: 'Star',
    category: 'engagement',
    defaultSettings: {
      testimonialIds: [],
      displayStyle: 'carousel',
      showRatings: true,
      maxTestimonials: 5,
      autoRotate: true,
      rotationInterval: 5,
    },
    requiredSettings: [],
    previewComponent: 'TestimonialsPreview',
    configComponent: 'TestimonialsConfig',
  },
  {
    type: 'contact-form',
    name: 'Contact Form',
    description: 'Allow customers to contact you directly',
    icon: 'ContactMail',
    category: 'engagement',
    defaultSettings: {
      title: 'Contact Us',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      submitText: 'Send Message',
      successMessage: "Thank you for your message! We'll get back to you soon.",
    },
    requiredSettings: ['title', 'fields'],
    previewComponent: 'ContactFormPreview',
    configComponent: 'ContactFormConfig',
  },
  {
    type: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Build your customer email list',
    icon: 'Email',
    category: 'engagement',
    defaultSettings: {
      title: 'Stay Updated',
      description: 'Get notified about new products and seasonal updates',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe',
      position: 'inline',
    },
    requiredSettings: ['title'],
    previewComponent: 'NewsletterPreview',
    configComponent: 'NewsletterConfig',
  },
  {
    type: 'social-media',
    name: 'Social Media Links',
    description: 'Connect your social media accounts',
    icon: 'Share',
    category: 'engagement',
    defaultSettings: {
      platforms: [
        { name: 'facebook', url: '', enabled: false },
        { name: 'instagram', url: '', enabled: false },
        { name: 'twitter', url: '', enabled: false },
      ],
      displayStyle: 'icons',
      iconSize: 'medium',
      openInNewTab: true,
    },
    requiredSettings: [],
    previewComponent: 'SocialMediaPreview',
    configComponent: 'SocialMediaConfig',
  },
  {
    type: 'policy-section',
    name: 'Policies & Information',
    description: 'Display shipping, returns, and other policies',
    icon: 'Settings',
    category: 'information',
    defaultSettings: {
      showShipping: true,
      showReturns: true,
      showContact: true,
      customPolicies: [],
      displayStyle: 'tabs',
    },
    requiredSettings: [],
    previewComponent: 'PolicySectionPreview',
    configComponent: 'PolicySectionConfig',
  },
  {
    type: 'search-filter',
    name: 'Search & Filter',
    description: 'Product search and filtering with style-aware design',
    icon: 'Search',
    category: 'products',
    defaultSettings: {
      layout: 'industrial',
      searchPlaceholder: 'Search products...',
      showFilters: true,
      showSorting: true,
      persistentSearch: false,
    },
    requiredSettings: [],
    previewComponent: 'SearchFilterPreview',
    configComponent: 'SearchFilterConfig',
  },
  {
    type: 'business-address',
    name: 'Business Address',
    description: 'Display store location and contact information',
    icon: 'LocationOn',
    category: 'information',
    defaultSettings: {
      showLocationName: true,
      showContactPhone: true,
      showContactEmail: true,
      showFullAddress: true,
      showDirections: true,
      displayStyle: 'card',
    },
  },
];

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
      id={`customization-tabpanel-${index}`}
      aria-labelledby={`customization-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const StorefrontCustomizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [previewMode, setPreviewMode] = useState<StorefrontPreviewMode>({
    device: 'desktop',
    isLivePreview: true,
  });
  const [modules, setModules] = useState<StorefrontModuleConfig[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showAddModuleDialog, setShowAddModuleDialog] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [productImages, setProductImages] = useState<Record<number, string>>(
    {}
  );

  // Store data state
  const [storeData, setStoreData] = useState<ComprehensiveStoreData | null>(
    null
  );
  const [storeDataLoading, setStoreDataLoading] = useState(false);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<StorefrontTheme>(
    AVAILABLE_THEMES[0]
  );

  // Initialize with default modules (fallback)
  const initializeDefaultModules = useCallback(() => {
    const defaultModules: StorefrontModuleConfig[] = [
      {
        id: 'hero-1',
        type: 'hero-banner',
        title: 'Hero Banner',
        description: 'Welcome banner for your store',
        icon: 'Image',
        enabled: true,
        order: 0,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'hero-banner')
            ?.defaultSettings || {},
      },
      {
        id: 'intro-1',
        type: 'store-introduction',
        title: 'Store Introduction',
        description: 'Tell your story',
        icon: 'ContentCopy',
        enabled: true,
        order: 1,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'store-introduction')
            ?.defaultSettings || {},
      },
      {
        id: 'search-1',
        type: 'search-filter',
        title: 'Search & Filter',
        description: 'Help customers find products',
        icon: 'Search',
        enabled: true,
        order: 3,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'search-filter')
            ?.defaultSettings || {},
      },
      {
        id: 'featured-1',
        type: 'featured-products',
        title: 'Featured Products',
        description: 'Highlight your best products',
        icon: 'Star',
        enabled: true,
        order: 5,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'featured-products')
            ?.defaultSettings || {},
      },
      {
        id: 'contact-1',
        type: 'contact-form',
        title: 'Contact Form',
        description: 'Let customers contact you',
        icon: 'ContactMail',
        enabled: true,
        order: 7,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'contact-form')
            ?.defaultSettings || {},
      },
      {
        id: 'policies-1',
        type: 'policy-section',
        title: 'Policies & Information',
        description: 'Store policies and hours',
        icon: 'Info',
        enabled: true,
        order: 8,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'policy-section')
            ?.defaultSettings || {},
      },
      {
        id: 'categories-1',
        type: 'product-categories',
        title: 'Product Categories',
        description: 'Browse products by category',
        icon: 'Category',
        enabled: true,
        order: 4,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'product-categories')
            ?.defaultSettings || {},
      },
      {
        id: 'business-address-1',
        type: 'business-address',
        title: 'Store Location',
        description: 'Show business address and contact info',
        icon: 'LocationOn',
        enabled: true,
        order: 2,
        settings:
          MODULE_TEMPLATES.find((t) => t.type === 'business-address')
            ?.defaultSettings || {},
      },
    ];

    setModules(defaultModules);
  }, []);

  // Load existing storefront customization
  useEffect(() => {
    const loadStorefrontCustomization = async () => {
      if (!storeId) return;

      try {
        const customization =
          await StorefrontApiService.getStorefrontCustomization(
            Number(storeId)
          );

        if (customization) {
          // Load modules if they exist
          if (customization.modules && customization.modules.length > 0) {
            const loadedModules = customization.modules.map(
              (module: StorefrontModule, index: number) => ({
                id: module.id || `${module.type}-${index}`,
                type: module.type as StorefrontModuleType,
                title:
                  module.title ||
                  MODULE_TEMPLATES.find((t) => t.type === module.type)?.name ||
                  'Untitled',
                description:
                  MODULE_TEMPLATES.find((t) => t.type === module.type)
                    ?.description || '',
                icon:
                  MODULE_TEMPLATES.find((t) => t.type === module.type)?.icon ||
                  'ViewModule',
                enabled: module.isVisible !== false,
                order: module.order || index,
                settings: module.settings || {},
              })
            );
            setModules(loadedModules);
          }

          // Load theme if it exists
          if (customization.themeId) {
            const theme = AVAILABLE_THEMES.find(
              (t) => t.id === customization.themeId
            );
            if (theme) {
              setSelectedTheme(theme);
            }
          }
        }
      } catch {
        // Failed to load storefront customization
        // Continue with default setup if loading fails
        initializeDefaultModules();
      }
    };

    if (storeId) {
      loadStorefrontCustomization();
    } else {
      // Initialize with defaults if no storeId
      initializeDefaultModules();
    }
  }, [storeId, initializeDefaultModules]);

  // Load comprehensive store data
  const loadStoreData = useCallback(async () => {
    if (!storeId) return;

    try {
      setStoreDataLoading(true);

      const data = await StoreApiService.getComprehensiveStoreDetails(
        Number(storeId)
      );

      console.log('✅ Store data loaded:', {
        storeId: data.storeId,
        storeName: data.storeName,
        addressCount: data.addresses?.length || 0,
      });

      setStoreData(data);
    } catch (error) {
      console.error('❌ Store data loading error:', error);
      // Failed to load store data
      setStoreData(null);
    } finally {
      setStoreDataLoading(false);
    }
  }, [storeId]);

  // Load store data on component mount and when storeId changes
  useEffect(() => {
    loadStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]); // loadStoreData excluded to prevent infinite loop

  // Function to populate module settings with store data
  const populateModuleSettings = useCallback(
    (storeData: ComprehensiveStoreData) => {
      console.log('🔄 Populating module settings with store data');

      setModules((prevModules) =>
        prevModules.map((module) => {
          const updatedModule = { ...module };

          if (module.type === 'contact-form') {
            // Populate contact form settings with store data
            const businessAddress = storeData.addresses.find(
              (addr) =>
                addr.addressType === 'business_address' || addr.isPrimary
            );

            updatedModule.settings = {
              ...module.settings,
              storeContactInfo: {
                storePhone: storeData.contactPhone,
                storeEmail: storeData.contactEmail,
                businessAddress: businessAddress
                  ? {
                      locationName: businessAddress.locationName,
                      streetAddress: businessAddress.streetAddress,
                      city: businessAddress.city,
                      state: businessAddress.state,
                      zipCode: businessAddress.zipCode,
                    }
                  : undefined,
              },
            };
          }

          if (module.type === 'policy-section') {
            // Populate policy section settings with store data
            // Create all 7 days of the week, filling in missing days as closed
            const allDaysHours = Array.from({ length: 7 }, (_, dayIndex) => {
              const existingHour = storeData.openHours.find(
                (hour) => hour.dayOfWeek === dayIndex
              );
              return existingHour
                ? {
                    dayOfWeek: existingHour.dayOfWeek,
                    openTime: existingHour.openTime,
                    closeTime: existingHour.closeTime,
                    isClosed: existingHour.isClosed,
                  }
                : {
                    dayOfWeek: dayIndex,
                    openTime: '09:00',
                    closeTime: '17:00',
                    isClosed: true,
                  };
            });

            // Use Store Overview logistics approach - simple and working
            const hasDelivery =
              storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0;
            const hasFarmPickup = storeData.addresses.some(
              (addr) => addr.addressType === 'farm_location'
            );

            // Simple logistics data like Store Overview uses
            const logisticsInfo = {
              hasDelivery: hasDelivery,
              deliveryRadius: storeData.deliveryRadiusMi,
              hasFarmPickup: hasFarmPickup,
              hasBusinessAddress: storeData.addresses.some(
                (addr) =>
                  addr.addressType === 'business' ||
                  addr.addressType === 'business_address'
              ),
            };

            updatedModule.settings = {
              ...module.settings,
              businessHours: allDaysHours,
              paymentMethods: storeData.paymentMethods.map(
                (pm) => pm.paymentMethod.methodName
              ),
              contactInfo: {
                phone: storeData.contactPhone,
                email: storeData.contactEmail,
                storeName: storeData.storeName,
              },
              // Real logistics data from store setup (like Store Overview)
              logisticsInfo: logisticsInfo,
            };
          }

          if (module.type === 'product-categories') {
            // Populate product categories settings with store data
            updatedModule.settings = {
              ...module.settings,
              categories: storeData.categories.map((category) => ({
                categoryId: category.categoryId,
                name: category.name,
                description: category.description,
                iconUrl: category.iconUrl,
              })),
            };
          }

          if (module.type === 'business-address') {
            // Populate business address settings with store data using Store Overview logic
            const getPrimaryAddress = (addresses: any[]): any | null => {
              if (!addresses || addresses.length === 0) return null;

              // Priority: business address > pickup address > first address (same as Store Overview)
              const businessAddress = addresses.find(
                (addr) => addr.addressType === 'business'
              );
              const pickupAddress = addresses.find(
                (addr) => addr.addressType === 'pickup'
              );
              const primaryAddress = addresses.find((addr) => addr.isPrimary);

              return (
                businessAddress ||
                pickupAddress ||
                primaryAddress ||
                addresses[0]
              );
            };

            const primaryAddress = getPrimaryAddress(storeData.addresses);

            if (primaryAddress) {
              updatedModule.settings = {
                ...module.settings,
                businessAddress: {
                  addressType: primaryAddress.addressType,
                  locationName: primaryAddress.locationName,
                  contactPhone: primaryAddress.contactPhone,
                  contactEmail:
                    storeData.contactEmail || primaryAddress.contactEmail, // Use store email as fallback like Store Overview
                  streetAddress: primaryAddress.streetAddress,
                  city: primaryAddress.city,
                  state: primaryAddress.state,
                  zipCode: primaryAddress.zipCode,
                },
              };
              console.log('✅ Business Address module populated with data');
            }
          }

          return updatedModule;
        })
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // Intentionally empty to prevent infinite loop - function uses setModules with prevModules callback
  );

  // Apply store data to module settings when store data is loaded
  useEffect(() => {
    if (storeData) {
      populateModuleSettings(storeData);
    }
  }, [storeData, populateModuleSettings]);

  // Function to manually update logistics data for published storefronts
  const updatePublishedLogisticsData = useCallback(async () => {
    if (!storeId || !storeData) return;

    try {
      console.log(
        '🔄 Manually updating published storefront logistics data...'
      );

      // Get current customization
      const customization =
        await StorefrontApiService.getStorefrontCustomization(Number(storeId));

      if (customization && customization.modules) {
        // Update policy-section modules with logistics data
        const updatedModules = customization.modules.map((module: any) => {
          if (module.type === 'policy-section') {
            const hasDelivery =
              storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0;
            const hasFarmPickup = storeData.addresses.some(
              (addr: any) => addr.addressType === 'farm_location'
            );

            const logisticsInfo = {
              hasDelivery: hasDelivery,
              deliveryRadius: storeData.deliveryRadiusMi,
              hasFarmPickup: hasFarmPickup,
              hasBusinessAddress: storeData.addresses.some(
                (addr: any) =>
                  addr.addressType === 'business' ||
                  addr.addressType === 'business_address'
              ),
            };

            return {
              ...module,
              settings: {
                ...module.settings,
                logisticsInfo: logisticsInfo,
              },
            };
          }
          return module;
        });

        // Update the customization with new logistics data
        const updatedCustomization = {
          ...customization,
          modules: updatedModules,
        };

        await StorefrontApiService.updateStorefrontCustomization(
          Number(storeId),
          updatedCustomization
        );
        console.log('✅ Published storefront logistics data updated!');
      }
    } catch (error) {
      console.error(
        '❌ Failed to update published storefront logistics:',
        error
      );
    }
  }, [storeId, storeData]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Load inventory items for the store
  const loadInventoryItems = useCallback(async () => {
    if (!storeId) return;

    try {
      setInventoryLoading(true);
      const response = await InventoryApiService.getInventoryItems({
        storeId: Number(storeId),
        isActive: true, // Only show active products in storefront
        limit: 50, // Limit for performance
      });
      const items = response.data || [];
      setInventoryItems(items);

      // Load primary images for each product
      const imagePromises = items.slice(0, 6).map(async (item) => {
        try {
          const imageResponse = await InventoryApiService.getInventoryImages(
            item.itemId
          );
          const primaryImage = imageResponse.data?.find((img) => img.isPrimary);
          return { itemId: item.itemId, imageUrl: primaryImage?.originalUrl };
        } catch {
          // Failed to load image for item
          return { itemId: item.itemId, imageUrl: null };
        }
      });

      const imageResults = await Promise.all(imagePromises);
      const imageMap = imageResults.reduce(
        (acc, result) => {
          if (result.imageUrl) {
            acc[result.itemId] = result.imageUrl;
          }
          return acc;
        },
        {} as Record<number, string>
      );

      setProductImages(imageMap);
    } catch {
      // Failed to load inventory items
      setInventoryItems([]);
      setProductImages({});
    } finally {
      setInventoryLoading(false);
    }
  }, [storeId]);

  // Load inventory items on component mount and when storeId changes
  useEffect(() => {
    loadInventoryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]); // loadInventoryItems excluded to prevent infinite loop

  // Apply theme CSS when theme changes
  useEffect(() => {
    const themeCSS = generateThemeCSS(selectedTheme);

    // Apply theme CSS to the preview
    const styleElement =
      document.getElementById('storefront-theme-styles') ||
      document.createElement('style');
    styleElement.id = 'storefront-theme-styles';
    styleElement.innerHTML = themeCSS;

    if (!document.getElementById('storefront-theme-styles')) {
      document.head.appendChild(styleElement);
    }
  }, [selectedTheme]);

  const handleThemeSelect = (theme: StorefrontTheme) => {
    setSelectedTheme(theme);
    setSnackbar({
      open: true,
      message: `${theme.name} theme applied successfully!`,
      severity: 'success',
    });
  };

  const handleMoveModule = (moduleId: string, direction: 'up' | 'down') => {
    const currentIndex = modules.findIndex((m) => m.id === moduleId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= modules.length) return;

    const reorderedModules = Array.from(modules);
    const [movedModule] = reorderedModules.splice(currentIndex, 1);
    reorderedModules.splice(newIndex, 0, movedModule);

    // Update order values
    const updatedModules = reorderedModules.map((module, index) => ({
      ...module,
      order: index,
    }));

    setModules(updatedModules);
  };

  const handleAddModule = (moduleType: StorefrontModuleType) => {
    const template = MODULE_TEMPLATES.find((t) => t.type === moduleType);
    if (!template) return;

    const newModule: StorefrontModuleConfig = {
      id: `${moduleType}-${Date.now()}`,
      type: moduleType,
      title: template.name,
      description: template.description,
      icon: template.icon,
      enabled: true,
      order: modules.length,
      settings: { ...template.defaultSettings },
    };

    let updatedModules = [...modules, newModule];

    // Auto-configure contact settings to prevent duplication
    if (moduleType === 'contact-form') {
      // If adding contact-form, disable contact in policy-section modules
      updatedModules = updatedModules.map((module) => {
        if (module.type === 'policy-section') {
          return {
            ...module,
            settings: {
              ...module.settings,
              showContact: false,
            },
          };
        }
        return module;
      });
    } else if (moduleType === 'policy-section') {
      // If adding policy-section, check if contact-form already exists
      const hasContactForm = modules.some((m) => m.type === 'contact-form');
      if (hasContactForm) {
        newModule.settings = {
          ...newModule.settings,
          showContact: false,
        };
        // Update the module in the array
        updatedModules = updatedModules.map((module) =>
          module.id === newModule.id ? newModule : module
        );
      }
    }

    setModules(updatedModules);
    setShowAddModuleDialog(false);
    setSnackbar({
      open: true,
      message: `${template.name} module added successfully!`,
      severity: 'success',
    });
  };

  const handleRemoveModule = (moduleId: string) => {
    const moduleToRemove = modules.find((m) => m.id === moduleId);
    let updatedModules = modules
      .filter((m) => m.id !== moduleId)
      .map((module, index) => ({ ...module, order: index }));

    // If removing a contact-form module, re-enable contact in policy-section modules
    if (moduleToRemove?.type === 'contact-form') {
      // Check if there are any other contact-form modules remaining
      const hasOtherContactForm = updatedModules.some(
        (m) => m.type === 'contact-form'
      );

      // If no other contact forms exist, re-enable contact in policy sections
      if (!hasOtherContactForm) {
        updatedModules = updatedModules.map((module) => {
          if (module.type === 'policy-section') {
            return {
              ...module,
              settings: {
                ...module.settings,
                showContact: true,
              },
            };
          }
          return module;
        });
      }
    }

    setModules(updatedModules);
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(null);
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setModules(
      modules.map((module) =>
        module.id === moduleId
          ? { ...module, enabled: !module.enabled }
          : module
      )
    );
  };

  const handleSave = async (publish = false) => {
    setIsSaving(true);
    try {
      if (!storeId) {
        throw new Error('Store ID is required');
      }

      const customizationData: StorefrontCustomization = {
        storeId: Number(storeId),
        themeId: selectedTheme?.id,
        modules: modules.map((module) => ({
          id: module.id,
          type: module.type,
          title: module.title,
          content: {},
          settings: module.settings || {},
          order: module.order,
          isVisible: module.enabled !== false,
        })),
        globalSettings: {
          primaryColor: selectedTheme?.colors?.primary,
          secondaryColor: selectedTheme?.colors?.secondary,
          fontFamily: selectedTheme?.typography?.fontFamily?.primary,
          headerStyle: 'modern',
          footerText: 'Powered by HelloNeighbors',
        },
        customCss: selectedTheme ? generateThemeCSS(selectedTheme) : undefined,
        isPublished: publish,
        publishedAt: publish ? new Date().toISOString() : undefined,
        lastModified: new Date().toISOString(),
      };

      if (publish) {
        // First save the customization data to ensure all changes are persisted
        await StorefrontApiService.saveStorefrontCustomization(
          customizationData
        );

        const publishRequest: StorefrontPublishRequest = {
          storeId: Number(storeId),
          customization: customizationData,
          publishNow: true,
        };

        const publishResponse =
          await StorefrontApiService.publishStorefront(publishRequest);

        setSnackbar({
          open: true,
          message: `Storefront published successfully! Your store is now live at: ${publishResponse.publicUrl}`,
          severity: 'success',
        });

        // Construct the local storefront URL format
        const localStorefrontUrl = `http://localhost:5173/store/${publishResponse.slug}`;

        setSnackbar({
          open: true,
          message: `Storefront published successfully! Redirecting to your live store...`,
          severity: 'success',
        });

        setTimeout(() => {
          window.open(localStorefrontUrl, '_blank');
        }, 2000);
      } else {
        await StorefrontApiService.saveStorefrontCustomization(
          customizationData
        );

        setSnackbar({
          open: true,
          message: 'Changes saved successfully!',
          severity: 'success',
        });
      }
    } catch (error: unknown) {
      // Failed to save storefront

      let errorMessage = 'Failed to save changes. Please try again.';
      const errorObj = error as { message?: string; status?: number };

      if (errorObj?.message?.includes('Network')) {
        errorMessage =
          'Network error - please check if the backend is running on https://localhost:7008';
      } else if (errorObj?.status === 401) {
        errorMessage = 'Authentication failed - please log in again';
      } else if (errorObj?.status === 403) {
        errorMessage =
          'Access denied - you may not have permission to publish this storefront';
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getModuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Image':
        return <Image />;
      case 'ContentCopy':
        return <ContentCopy />;
      case 'Star':
        return <Star />;
      case 'Category':
        return <Category />;
      case 'ViewModule':
        return <ViewModule />;
      case 'ContactMail':
        return <ContactMail />;
      case 'Email':
        return <Email />;
      case 'Share':
        return <Share />;
      case 'Settings':
        return <Settings />;
      case 'LocationOn':
        return <LocationOn />;
      default:
        return <ViewModule />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Container maxWidth='xl'>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => {
                  console.log('🔙 Back button clicked');
                  window.location.href = '/dashboard';
                }}
                title='Back to Dashboard'
              >
                <ArrowBack />
              </IconButton>

              {/* Alternative Dashboard Button */}
              <Button
                variant='outlined'
                size='small'
                startIcon={<ArrowBack />}
                onClick={() => {
                  console.log('📊 Dashboard button clicked');
                  window.location.href = '/dashboard';
                }}
                sx={{ ml: 1 }}
              >
                Dashboard
              </Button>
              <Box>
                <Typography variant='h6' fontWeight={600}>
                  Storefront Customization
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Design your store with modular sections
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Device Preview Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title='Desktop Preview'>
                  <IconButton
                    size='small'
                    color={
                      previewMode.device === 'desktop' ? 'primary' : 'default'
                    }
                    onClick={() =>
                      setPreviewMode({ ...previewMode, device: 'desktop' })
                    }
                  >
                    <Computer />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Tablet Preview'>
                  <IconButton
                    size='small'
                    color={
                      previewMode.device === 'tablet' ? 'primary' : 'default'
                    }
                    onClick={() =>
                      setPreviewMode({ ...previewMode, device: 'tablet' })
                    }
                  >
                    <Tablet />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Mobile Preview'>
                  <IconButton
                    size='small'
                    color={
                      previewMode.device === 'mobile' ? 'primary' : 'default'
                    }
                    onClick={() =>
                      setPreviewMode({ ...previewMode, device: 'mobile' })
                    }
                  >
                    <Phone />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider orientation='vertical' flexItem />

              <Button
                variant='outlined'
                startIcon={<Save />}
                onClick={() => handleSave(false)}
                disabled={isSaving}
              >
                Save Draft
              </Button>
              <Button
                variant='contained'
                startIcon={<Publish />}
                onClick={() => handleSave(true)}
                disabled={isSaving}
              >
                Publish
              </Button>
              <Button
                variant='outlined'
                onClick={updatePublishedLogisticsData}
                disabled={!storeData}
                sx={{ ml: 1 }}
              >
                Update Logistics
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth='xl' sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Left Sidebar - Module Management */}
          <Box sx={{ width: { xs: '100%', md: '300px' }, minWidth: '300px' }}>
            <Paper sx={{ height: 'fit-content' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label='Modules' />
                  <Tab label='Settings' />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                <Box sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant='h6' fontWeight={600}>
                      Page Modules
                    </Typography>
                    <Button
                      size='small'
                      startIcon={<Add />}
                      onClick={() => setShowAddModuleDialog(true)}
                    >
                      Add
                    </Button>
                  </Box>

                  <Box>
                    {modules.map((module, index) => (
                      <Card
                        key={module.id}
                        sx={{
                          mb: 1,
                          opacity: module.enabled ? 1 : 0.6,
                          cursor: 'pointer',
                          border: selectedModuleId === module.id ? 2 : 1,
                          borderColor:
                            selectedModuleId === module.id
                              ? 'primary.main'
                              : 'grey.300',
                        }}
                        onClick={() => setSelectedModuleId(module.id)}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{ display: 'flex', flexDirection: 'column' }}
                            >
                              <IconButton
                                size='small'
                                disabled={index === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveModule(module.id, 'up');
                                }}
                              >
                                <DragIndicator
                                  sx={{ transform: 'rotate(-90deg)' }}
                                />
                              </IconButton>
                              <IconButton
                                size='small'
                                disabled={index === modules.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveModule(module.id, 'down');
                                }}
                              >
                                <DragIndicator
                                  sx={{ transform: 'rotate(90deg)' }}
                                />
                              </IconButton>
                            </Box>
                            {getModuleIcon(module.icon)}
                            <Box sx={{ flex: 1 }}>
                              <Typography variant='body2' fontWeight={600}>
                                {module.title}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {module.description}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                              }}
                            >
                              <Switch
                                size='small'
                                checked={module.enabled}
                                onChange={() => handleToggleModule(module.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <IconButton
                                size='small'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveModule(module.id);
                                }}
                              >
                                <Delete fontSize='small' />
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <Box sx={{ p: 2 }}>
                  <Typography variant='h6' fontWeight={600} gutterBottom>
                    Global Settings
                  </Typography>

                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2 }}
                  >
                    Choose from 3 professionally designed themes. Your store
                    preview will update instantly.
                  </Typography>

                  <Alert severity='success' sx={{ mb: 3 }}>
                    <Typography variant='body2' fontWeight={600}>
                      Current Theme: {selectedTheme.name}
                    </Typography>
                    <Typography variant='body2'>
                      {selectedTheme.description}
                    </Typography>
                  </Alert>

                  <ThemeSelector
                    selectedThemeId={selectedTheme.id}
                    onThemeSelect={handleThemeSelect}
                    onPreviewTheme={() => {
                      // Theme preview functionality
                    }}
                  />
                </Box>
              </TabPanel>
            </Paper>
          </Box>

          {/* Center - Preview */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ minHeight: '80vh', p: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant='h6' fontWeight={600}>
                  Preview
                </Typography>
                <Chip
                  label={`${previewMode.device.charAt(0).toUpperCase() + previewMode.device.slice(1)} View`}
                  size='small'
                  color='primary'
                />
              </Box>

              {/* Preview Container */}
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  overflow: 'hidden',
                  mx: 'auto',
                  bgcolor: 'white',
                  ...(previewMode.device === 'mobile' && {
                    maxWidth: 375,
                  }),
                  ...(previewMode.device === 'tablet' && {
                    maxWidth: 768,
                  }),
                }}
              >
                {modules
                  .filter((module) => module.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((module) => (
                    <Box
                      key={module.id}
                      sx={{
                        minHeight: 100,
                        p: 3,
                        borderBottom:
                          selectedModuleId === module.id
                            ? '2px solid'
                            : '1px solid',
                        borderColor:
                          selectedModuleId === module.id
                            ? 'primary.main'
                            : 'grey.200',
                        bgcolor:
                          selectedModuleId === module.id
                            ? 'primary.50'
                            : 'transparent',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'grey.50',
                        },
                      }}
                      onClick={() => setSelectedModuleId(module.id)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        {getModuleIcon(module.icon)}
                        <Typography
                          variant='h6'
                          fontWeight={600}
                          sx={{ color: selectedTheme.colors.text.primary }}
                        >
                          {module.title}
                        </Typography>
                        <Chip
                          label={module.type}
                          size='small'
                          variant='outlined'
                        />
                        {module.type === 'featured-products' && (
                          <Button
                            size='small'
                            variant='outlined'
                            startIcon={<Inventory />}
                            onClick={() => navigate(`/inventory/${storeId}`)}
                            sx={{
                              ml: 'auto',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                            }}
                          >
                            Manage Products
                          </Button>
                        )}
                      </Box>

                      {/* Module Preview Content */}
                      {module.type === 'hero-banner' && (
                        <Box
                          sx={{
                            height: 200,
                            background: (() => {
                              // Check if there's a background image set
                              const backgroundImage = module.settings
                                ?.backgroundImage as string;

                              if (backgroundImage) {
                                // Convert relative URLs to absolute URLs with API base
                                const fullImageUrl = backgroundImage.startsWith(
                                  '/'
                                )
                                  ? `${API_CONFIG.BASE_URL}${backgroundImage}`
                                  : backgroundImage;

                                return `url("${fullImageUrl}")`;
                              }

                              // Fallback to theme gradient
                              return (
                                selectedTheme.customProperties[
                                  '--gradient-primary'
                                ] ||
                                `linear-gradient(135deg, ${selectedTheme.colors.primary}, ${selectedTheme.colors.secondary})`
                              );
                            })(),
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            textAlign: 'center',
                            borderRadius: selectedTheme.layout.borderRadius.lg,
                            boxShadow: selectedTheme.effects.boxShadow.md,
                            border: `3px solid ${selectedTheme.colors.accent}`,
                            position: 'relative',
                          }}
                        >
                          {/* Theme indicator */}
                          <Chip
                            label={`Theme: ${selectedTheme.name}`}
                            size='small'
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: selectedTheme.colors.accent,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                          <Box>
                            <Typography
                              variant='h4'
                              fontWeight={700}
                              gutterBottom
                              sx={{
                                fontFamily:
                                  selectedTheme.typography.fontFamily.primary,
                              }}
                            >
                              {module.settings.title || 'Welcome to Our Farm'}
                            </Typography>
                            <Typography
                              variant='h6'
                              sx={{
                                mb: 3,
                                fontFamily:
                                  selectedTheme.typography.fontFamily
                                    .secondary ||
                                  selectedTheme.typography.fontFamily.primary,
                              }}
                            >
                              {module.settings.subtitle ||
                                'Fresh, organic produce delivered to your door'}
                            </Typography>
                            <Button
                              variant='contained'
                              size='large'
                              sx={{
                                backgroundColor: selectedTheme.colors.accent,
                                borderRadius:
                                  selectedTheme.layout.borderRadius.md,
                                transition:
                                  selectedTheme.effects.transition.normal,
                                fontFamily:
                                  selectedTheme.typography.fontFamily.primary,
                                '&:hover': {
                                  backgroundColor: selectedTheme.colors.accent,
                                  filter: 'brightness(0.9)',
                                },
                              }}
                            >
                              {module.settings.ctaText || 'Shop Now'}
                            </Button>
                          </Box>
                        </Box>
                      )}

                      {module.type === 'store-introduction' && (
                        <Box
                          sx={{
                            backgroundColor: selectedTheme.colors.surface,
                            borderRadius: selectedTheme.layout.borderRadius.md,
                            p: 3,
                            border: `1px solid ${selectedTheme.colors.border}`,
                          }}
                        >
                          <Typography
                            variant='body1'
                            sx={{
                              color: selectedTheme.colors.text.primary,
                              fontFamily:
                                selectedTheme.typography.fontFamily.secondary ||
                                selectedTheme.typography.fontFamily.primary,
                              lineHeight:
                                selectedTheme.typography.lineHeight.relaxed,
                              whiteSpace: 'pre-line',
                            }}
                            dangerouslySetInnerHTML={{
                              __html:
                                module.settings.content ||
                                'Welcome to our family farm! We have been growing organic produce for over 20 years, using sustainable farming practices that respect the land and provide the freshest, most nutritious food for our community.',
                            }}
                          />
                        </Box>
                      )}

                      {module.type === 'featured-products' && (
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns:
                              'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: 2,
                          }}
                        >
                          {inventoryLoading ? (
                            // Loading placeholder
                            [1, 2, 3].map((placeholder) => (
                              <Box key={placeholder}>
                                <Card>
                                  <Box
                                    sx={{
                                      height: 120,
                                      bgcolor: 'grey.200',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      Loading...
                                    </Typography>
                                  </Box>
                                  <CardContent sx={{ p: 2 }}>
                                    <Box
                                      sx={{
                                        height: 20,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        mb: 1,
                                      }}
                                    />
                                    <Box
                                      sx={{
                                        height: 16,
                                        bgcolor: 'grey.100',
                                        borderRadius: 1,
                                        width: '60%',
                                      }}
                                    />
                                  </CardContent>
                                </Card>
                              </Box>
                            ))
                          ) : inventoryItems.length > 0 ? (
                            // Display actual inventory items
                            inventoryItems.slice(0, 6).map((item) => (
                              <Box key={item.itemId}>
                                <Card
                                  sx={{
                                    cursor: 'pointer',
                                    backgroundColor:
                                      selectedTheme.colors.surface,
                                    borderRadius:
                                      selectedTheme.layout.borderRadius.md,
                                    boxShadow:
                                      selectedTheme.effects.boxShadow.sm,
                                    border: `1px solid ${selectedTheme.colors.border}`,
                                    transition:
                                      selectedTheme.effects.transition.fast,
                                    overflow: 'hidden',
                                    '&:hover': {
                                      boxShadow:
                                        selectedTheme.effects.boxShadow.lg,
                                      transform:
                                        selectedTheme.customProperties[
                                          '--card-hover-scale'
                                        ] || 'scale(1.02)',
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      height: 120,
                                      background: `linear-gradient(45deg, ${selectedTheme.colors.primary}20, ${selectedTheme.colors.accent}20)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {productImages[item.itemId] ? (
                                      <Box
                                        component='img'
                                        src={productImages[item.itemId]}
                                        alt={item.name}
                                        sx={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                        onError={(e) => {
                                          // Failed to load image - fallback to icon
                                          // Fallback to icon on image error
                                          e.currentTarget.style.display =
                                            'none';
                                          const parent =
                                            e.currentTarget.parentElement;
                                          if (
                                            parent &&
                                            !parent.querySelector(
                                              '.fallback-icon'
                                            )
                                          ) {
                                            const icon =
                                              document.createElement('div');
                                            icon.className = 'fallback-icon';
                                            icon.innerHTML = '📦';
                                            icon.style.fontSize = '40px';
                                            icon.style.opacity = '0.7';
                                            parent.appendChild(icon);
                                          }
                                        }}
                                      />
                                    ) : (
                                      <Inventory
                                        sx={{
                                          fontSize: 40,
                                          color: selectedTheme.colors.primary,
                                          opacity: 0.7,
                                        }}
                                      />
                                    )}
                                    {!item.isActive && (
                                      <Chip
                                        label='Inactive'
                                        size='small'
                                        sx={{
                                          position: 'absolute',
                                          top: 8,
                                          right: 8,
                                          backgroundColor:
                                            selectedTheme.colors.secondary,
                                          color: 'white',
                                        }}
                                      />
                                    )}
                                  </Box>
                                  <CardContent sx={{ p: 2 }}>
                                    <Typography
                                      variant='body2'
                                      fontWeight={600}
                                      noWrap
                                      title={item.name}
                                      sx={{
                                        color:
                                          selectedTheme.colors.text.primary,
                                        fontFamily:
                                          selectedTheme.typography.fontFamily
                                            .primary,
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <Typography
                                      variant='body2'
                                      fontWeight={600}
                                      sx={{
                                        color: selectedTheme.colors.primary,
                                        fontFamily:
                                          selectedTheme.typography.fontFamily
                                            .primary,
                                      }}
                                    >
                                      ${item.price.toFixed(2)}
                                    </Typography>
                                    <Typography
                                      variant='caption'
                                      display='block'
                                      sx={{
                                        color: selectedTheme.colors.text.muted,
                                        fontFamily:
                                          selectedTheme.typography.fontFamily
                                            .secondary ||
                                          selectedTheme.typography.fontFamily
                                            .primary,
                                      }}
                                    >
                                      Stock: {item.quantity}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Box>
                            ))
                          ) : (
                            // No items message
                            <Box
                              sx={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                py: 4,
                                bgcolor: selectedTheme.colors.surface,
                                borderRadius:
                                  selectedTheme.layout.borderRadius.md,
                                border: `2px dashed ${selectedTheme.colors.border}`,
                              }}
                            >
                              <Inventory
                                sx={{ fontSize: 48, color: 'grey.400', mb: 2 }}
                              />
                              <Typography
                                variant='h6'
                                gutterBottom
                                sx={{
                                  color: selectedTheme.colors.text.secondary,
                                  fontFamily:
                                    selectedTheme.typography.fontFamily.primary,
                                }}
                              >
                                No Products Available
                              </Typography>
                              <Typography
                                variant='body2'
                                paragraph
                                sx={{
                                  color: selectedTheme.colors.text.muted,
                                  fontFamily:
                                    selectedTheme.typography.fontFamily
                                      .secondary ||
                                    selectedTheme.typography.fontFamily.primary,
                                }}
                              >
                                Add products to your inventory to display them
                                in your store.
                              </Typography>
                              <Button
                                variant='outlined'
                                size='small'
                                startIcon={<Inventory />}
                                onClick={() =>
                                  navigate(`/inventory/${storeId}`)
                                }
                                sx={{
                                  textTransform: 'none',
                                  borderColor: selectedTheme.colors.primary,
                                  color: selectedTheme.colors.primary,
                                  fontFamily:
                                    selectedTheme.typography.fontFamily.primary,
                                  borderRadius:
                                    selectedTheme.layout.borderRadius.md,
                                  '&:hover': {
                                    borderColor: selectedTheme.colors.primary,
                                    backgroundColor:
                                      selectedTheme.colors.primary,
                                    color: 'white',
                                  },
                                }}
                              >
                                Manage Products
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}

                      {module.type === 'product-categories' && (
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: 'grey.50',
                            borderRadius: selectedTheme.layout.borderRadius.md,
                            border: `1px solid ${selectedTheme.colors.border}`,
                          }}
                        >
                          <Typography
                            variant='h6'
                            gutterBottom
                            sx={{
                              fontFamily:
                                selectedTheme.typography.fontFamily.primary,
                              color: selectedTheme.colors.text.primary,
                              textAlign: 'center',
                              mb: 3,
                            }}
                          >
                            {module.title || 'Product Categories'}
                          </Typography>

                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(120px, 1fr))',
                              gap: 2,
                            }}
                          >
                            {storeData?.categories &&
                            storeData.categories.length > 0 ? (
                              storeData.categories.map((category) => (
                                <Box key={category.categoryId}>
                                  <Card
                                    sx={{
                                      textAlign: 'center',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 2,
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        height: 80,
                                        bgcolor: selectedTheme.colors.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                      }}
                                    >
                                      <Category sx={{ fontSize: 40 }} />
                                    </Box>
                                    <CardContent>
                                      <Typography
                                        variant='body2'
                                        fontWeight={600}
                                        sx={{
                                          color:
                                            selectedTheme.colors.text.primary,
                                        }}
                                      >
                                        {category.name}
                                      </Typography>
                                      {category.description && (
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                          sx={{ mt: 0.5 }}
                                        >
                                          {category.description}
                                        </Typography>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Box>
                              ))
                            ) : (
                              <Box
                                sx={{
                                  gridColumn: '1 / -1',
                                  textAlign: 'center',
                                  py: 4,
                                }}
                              >
                                <Category
                                  sx={{
                                    fontSize: 64,
                                    color: 'grey.400',
                                    mb: 2,
                                  }}
                                />
                                <Typography
                                  variant='h6'
                                  color='text.secondary'
                                  gutterBottom
                                >
                                  No Product Categories
                                </Typography>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  {storeDataLoading
                                    ? 'Loading categories...'
                                    : 'Add product categories in your store setup to display them here.'}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      )}

                      {module.type === 'contact-form' && (
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: 'grey.50',
                            borderRadius: selectedTheme.layout.borderRadius.md,
                            border: `1px solid ${selectedTheme.colors.border}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 3,
                            }}
                          >
                            <ContactMail
                              sx={{
                                mr: 2,
                                color: selectedTheme.colors.primary,
                              }}
                            />
                            <Typography
                              variant='h6'
                              sx={{
                                fontFamily:
                                  selectedTheme.typography.fontFamily.primary,
                                color: selectedTheme.colors.text.primary,
                              }}
                            >
                              {module.settings.title || 'Contact Us'}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              gap: 3,
                              flexDirection: { xs: 'column', md: 'row' },
                            }}
                          >
                            <Box sx={{ flex: 2 }}>
                              <TextField
                                fullWidth
                                label='Name'
                                disabled
                                sx={{ mb: 2 }}
                                size='small'
                              />
                              <TextField
                                fullWidth
                                label='Email'
                                disabled
                                sx={{ mb: 2 }}
                                size='small'
                              />
                              <TextField
                                fullWidth
                                label='Message'
                                multiline
                                rows={3}
                                disabled
                                sx={{ mb: 2 }}
                                size='small'
                              />
                              <Button
                                variant='contained'
                                disabled
                                startIcon={<Email />}
                                sx={{
                                  backgroundColor: selectedTheme.colors.primary,
                                  color: 'white',
                                }}
                              >
                                Send Message
                              </Button>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Card sx={{ p: 2 }}>
                                <Typography variant='subtitle1' gutterBottom>
                                  Get in Touch
                                </Typography>
                                {storeData?.contactPhone && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 1,
                                    }}
                                  >
                                    <Phone
                                      sx={{
                                        mr: 1,
                                        fontSize: 16,
                                        color: selectedTheme.colors.primary,
                                      }}
                                    />
                                    <Typography variant='body2'>
                                      {storeData.contactPhone}
                                    </Typography>
                                  </Box>
                                )}
                                {storeData?.contactEmail && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 1,
                                    }}
                                  >
                                    <Email
                                      sx={{
                                        mr: 1,
                                        fontSize: 16,
                                        color: selectedTheme.colors.primary,
                                      }}
                                    />
                                    <Typography variant='body2'>
                                      {storeData.contactEmail}
                                    </Typography>
                                  </Box>
                                )}
                                {!storeData && (
                                  <Typography
                                    variant='body2'
                                    color='text.secondary'
                                  >
                                    Store contact info will appear here
                                  </Typography>
                                )}
                              </Card>
                            </Box>
                          </Box>
                        </Box>
                      )}

                      {module.type === 'policy-section' && (
                        <Box
                          sx={{
                            p: 3,
                            bgcolor: 'grey.50',
                            borderRadius: selectedTheme.layout.borderRadius.md,
                            border: `1px solid ${selectedTheme.colors.border}`,
                          }}
                        >
                          <Typography
                            variant='h6'
                            gutterBottom
                            sx={{
                              fontFamily:
                                selectedTheme.typography.fontFamily.primary,
                              color: selectedTheme.colors.text.primary,
                              textAlign: 'center',
                              mb: 3,
                            }}
                          >
                            {module.title || 'Store Information'}
                          </Typography>

                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: '1fr',
                                md: 'repeat(2, 1fr)',
                              },
                              gap: 2,
                            }}
                          >
                            {/* Business Hours */}
                            <Card sx={{ p: 2 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <Schedule
                                  sx={{
                                    mr: 1,
                                    color: selectedTheme.colors.primary,
                                  }}
                                />
                                <Typography variant='subtitle2'>
                                  Business Hours
                                </Typography>
                              </Box>
                              {storeData?.openHours &&
                              storeData.openHours.length > 0 ? (
                                storeData.openHours
                                  .slice(0, 3)
                                  .map((hour, index) => (
                                    <Box
                                      key={index}
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mb: 1,
                                      }}
                                    >
                                      <Typography variant='body2'>
                                        {
                                          [
                                            'Sun',
                                            'Mon',
                                            'Tue',
                                            'Wed',
                                            'Thu',
                                            'Fri',
                                            'Sat',
                                          ][hour.dayOfWeek]
                                        }
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        color='text.secondary'
                                      >
                                        {hour.isClosed
                                          ? 'Closed'
                                          : hour.openTime && hour.closeTime
                                            ? `${hour.openTime} - ${hour.closeTime}`
                                            : 'Hours not set'}
                                      </Typography>
                                    </Box>
                                  ))
                              ) : (
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  Business hours will appear here
                                </Typography>
                              )}
                            </Card>

                            {/* Payment Methods */}
                            <Card sx={{ p: 2 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <Payment
                                  sx={{
                                    mr: 1,
                                    color: selectedTheme.colors.primary,
                                  }}
                                />
                                <Typography variant='subtitle2'>
                                  Payment Methods
                                </Typography>
                              </Box>
                              {storeData?.paymentMethods &&
                              storeData.paymentMethods.length > 0 ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 0.5,
                                  }}
                                >
                                  {storeData.paymentMethods
                                    .slice(0, 4)
                                    .map((pm, index) => (
                                      <Chip
                                        key={index}
                                        label={pm.paymentMethod.methodName}
                                        size='small'
                                        variant='outlined'
                                        sx={{
                                          borderColor:
                                            selectedTheme.colors.primary,
                                          color: selectedTheme.colors.primary,
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    ))}
                                </Box>
                              ) : (
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  Payment methods will appear here
                                </Typography>
                              )}
                            </Card>
                          </Box>
                        </Box>
                      )}

                      {![
                        'hero-banner',
                        'store-introduction',
                        'featured-products',
                        'product-categories',
                        'contact-form',
                        'policy-section',
                      ].includes(module.type) && (
                        <Alert severity='info'>
                          {module.description} - Preview coming soon!
                        </Alert>
                      )}
                    </Box>
                  ))}
              </Box>

              {/* Store Data Loading Status */}
              {storeDataLoading && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant='body2' color='text.secondary'>
                    Loading store information...
                  </Typography>
                </Box>
              )}

              {!storeDataLoading && !storeData && (
                <Box sx={{ p: 2 }}>
                  <Alert severity='warning'>
                    Store information could not be loaded. Contact Form and
                    Policies sections may not display complete information.
                  </Alert>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Right Sidebar - Module Settings */}
          <Box sx={{ width: { xs: '100%', md: '300px' }, minWidth: '300px' }}>
            <Paper sx={{ height: 'fit-content' }}>
              <Box sx={{ p: 2 }}>
                {selectedModuleId ? (
                  <>
                    <Typography variant='h6' fontWeight={600} gutterBottom>
                      Module Settings
                    </Typography>
                    {(() => {
                      const selectedModule = modules.find(
                        (m) => m.id === selectedModuleId
                      );
                      if (!selectedModule) return null;

                      return (
                        <Box>
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              gutterBottom
                            >
                              Module Type
                            </Typography>
                            <Chip
                              label={selectedModule.type}
                              variant='outlined'
                            />
                          </Box>

                          <TextField
                            fullWidth
                            label='Title'
                            value={selectedModule.title}
                            onChange={(e) => {
                              setModules(
                                modules.map((m) =>
                                  m.id === selectedModuleId
                                    ? { ...m, title: e.target.value }
                                    : m
                                )
                              );
                            }}
                            sx={{ mb: 2 }}
                          />

                          <TextField
                            fullWidth
                            label='Description'
                            value={selectedModule.description}
                            onChange={(e) => {
                              setModules(
                                modules.map((m) =>
                                  m.id === selectedModuleId
                                    ? { ...m, description: e.target.value }
                                    : m
                                )
                              );
                            }}
                            sx={{ mb: 2 }}
                          />

                          {/* Module-specific settings */}
                          {selectedModule.type === 'hero-banner' && (
                            <Box>
                              <TextField
                                fullWidth
                                label='Banner Title'
                                value={selectedModule.settings.title || ''}
                                onChange={(e) => {
                                  setModules(
                                    modules.map((m) =>
                                      m.id === selectedModuleId
                                        ? {
                                            ...m,
                                            settings: {
                                              ...m.settings,
                                              title: e.target.value,
                                            },
                                          }
                                        : m
                                    )
                                  );
                                }}
                                sx={{ mb: 2 }}
                              />
                              <TextField
                                fullWidth
                                label='Subtitle'
                                value={selectedModule.settings.subtitle || ''}
                                onChange={(e) => {
                                  setModules(
                                    modules.map((m) =>
                                      m.id === selectedModuleId
                                        ? {
                                            ...m,
                                            settings: {
                                              ...m.settings,
                                              subtitle: e.target.value,
                                            },
                                          }
                                        : m
                                    )
                                  );
                                }}
                                sx={{ mb: 2 }}
                              />
                              <TextField
                                fullWidth
                                label='Call-to-Action Text'
                                value={selectedModule.settings.ctaText || ''}
                                onChange={(e) => {
                                  setModules(
                                    modules.map((m) =>
                                      m.id === selectedModuleId
                                        ? {
                                            ...m,
                                            settings: {
                                              ...m.settings,
                                              ctaText: e.target.value,
                                            },
                                          }
                                        : m
                                    )
                                  );
                                }}
                                sx={{ mb: 2 }}
                              />
                              <HeroBannerImageUpload
                                storeId={parseInt(storeId!)}
                                currentImageUrl={
                                  (selectedModule.settings
                                    .backgroundImage as string) || ''
                                }
                                onImageUploaded={async (imageUrl) => {
                                  const updatedModules = modules.map((m) =>
                                    m.id === selectedModuleId
                                      ? {
                                          ...m,
                                          settings: {
                                            ...m.settings,
                                            backgroundImage: imageUrl,
                                          },
                                        }
                                      : m
                                  );

                                  setModules(updatedModules);

                                  // Auto-save the updated customization
                                  try {
                                    const customizationData: StorefrontCustomization =
                                      {
                                        storeId: parseInt(storeId!),
                                        themeId: selectedTheme.id,
                                        modules: updatedModules.map((m) => ({
                                          id: m.id,
                                          type: m.type,
                                          title: m.title,
                                          content: {},
                                          settings: m.settings,
                                          order: m.order,
                                          isVisible: m.enabled,
                                        })),
                                        globalSettings: {
                                          primaryColor:
                                            selectedTheme?.colors?.primary,
                                          secondaryColor:
                                            selectedTheme?.colors?.secondary,
                                          fontFamily:
                                            selectedTheme?.typography
                                              ?.fontFamily?.primary,
                                          headerStyle: 'modern',
                                          footerText:
                                            'Powered by HelloNeighbors',
                                        },
                                        customCss: selectedTheme
                                          ? generateThemeCSS(selectedTheme)
                                          : undefined,
                                        isPublished: false,
                                        lastModified: new Date().toISOString(),
                                      };

                                    await StorefrontApiService.saveStorefrontCustomization(
                                      customizationData
                                    );

                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Hero banner image saved successfully!',
                                      severity: 'success',
                                    });
                                  } catch {
                                    // Failed to save hero banner image
                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Image uploaded but failed to save. Please save manually.',
                                      severity: 'error',
                                    });
                                  }
                                }}
                                onImageRemoved={async () => {
                                  const updatedModules = modules.map((m) =>
                                    m.id === selectedModuleId
                                      ? {
                                          ...m,
                                          settings: {
                                            ...m.settings,
                                            backgroundImage: '',
                                          },
                                        }
                                      : m
                                  );

                                  setModules(updatedModules);

                                  // Auto-save the updated customization
                                  try {
                                    const customizationData: StorefrontCustomization =
                                      {
                                        storeId: parseInt(storeId!),
                                        themeId: selectedTheme.id,
                                        modules: updatedModules.map((m) => ({
                                          id: m.id,
                                          type: m.type,
                                          title: m.title,
                                          content: {},
                                          settings: m.settings,
                                          order: m.order,
                                          isVisible: m.enabled,
                                        })),
                                        globalSettings: {
                                          primaryColor:
                                            selectedTheme?.colors?.primary,
                                          secondaryColor:
                                            selectedTheme?.colors?.secondary,
                                          fontFamily:
                                            selectedTheme?.typography
                                              ?.fontFamily?.primary,
                                          headerStyle: 'modern',
                                          footerText:
                                            'Powered by HelloNeighbors',
                                        },
                                        customCss: selectedTheme
                                          ? generateThemeCSS(selectedTheme)
                                          : undefined,
                                        isPublished: false,
                                        lastModified: new Date().toISOString(),
                                      };

                                    await StorefrontApiService.saveStorefrontCustomization(
                                      customizationData
                                    );

                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Hero banner image removed successfully!',
                                      severity: 'success',
                                    });
                                  } catch {
                                    // Failed to save hero banner removal
                                    setSnackbar({
                                      open: true,
                                      message:
                                        'Image removed but failed to save. Please save manually.',
                                      severity: 'error',
                                    });
                                  }
                                }}
                              />
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Banner Height</InputLabel>
                                <Select
                                  value={
                                    selectedModule.settings.height || 'large'
                                  }
                                  onChange={(e) => {
                                    setModules(
                                      modules.map((m) =>
                                        m.id === selectedModuleId
                                          ? {
                                              ...m,
                                              settings: {
                                                ...m.settings,
                                                height: e.target.value,
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                >
                                  <MenuItem value='small'>
                                    Small (300px)
                                  </MenuItem>
                                  <MenuItem value='medium'>
                                    Medium (450px)
                                  </MenuItem>
                                  <MenuItem value='large'>
                                    Large (600px)
                                  </MenuItem>
                                  <MenuItem value='extra-large'>
                                    Extra Large (700px)
                                  </MenuItem>
                                </Select>
                              </FormControl>
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Text Alignment</InputLabel>
                                <Select
                                  value={
                                    selectedModule.settings.textAlignment ||
                                    'center'
                                  }
                                  onChange={(e) => {
                                    setModules(
                                      modules.map((m) =>
                                        m.id === selectedModuleId
                                          ? {
                                              ...m,
                                              settings: {
                                                ...m.settings,
                                                textAlignment: e.target.value,
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                >
                                  <MenuItem value='left'>Left</MenuItem>
                                  <MenuItem value='center'>Center</MenuItem>
                                  <MenuItem value='right'>Right</MenuItem>
                                </Select>
                              </FormControl>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant='body2' gutterBottom>
                                  Overlay Opacity:{' '}
                                  {Math.round(
                                    (selectedModule.settings.overlayOpacity ||
                                      0.4) * 100
                                  )}
                                  %
                                </Typography>
                                <input
                                  type='range'
                                  min='0'
                                  max='1'
                                  step='0.1'
                                  value={
                                    selectedModule.settings.overlayOpacity ||
                                    0.4
                                  }
                                  onChange={(e) => {
                                    setModules(
                                      modules.map((m) =>
                                        m.id === selectedModuleId
                                          ? {
                                              ...m,
                                              settings: {
                                                ...m.settings,
                                                overlayOpacity: parseFloat(
                                                  e.target.value
                                                ),
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                  style={{ width: '100%' }}
                                />
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  Controls the darkness of the overlay on
                                  background images
                                </Typography>
                              </Box>
                            </Box>
                          )}

                          {selectedModule.type === 'store-introduction' && (
                            <Box>
                              <TextField
                                fullWidth
                                label='Content'
                                multiline
                                rows={6}
                                value={selectedModule.settings.content || ''}
                                onChange={(e) => {
                                  setModules(
                                    modules.map((m) =>
                                      m.id === selectedModuleId
                                        ? {
                                            ...m,
                                            settings: {
                                              ...m.settings,
                                              content: e.target.value,
                                            },
                                          }
                                        : m
                                    )
                                  );
                                }}
                                sx={{ mb: 2 }}
                                helperText="Tell your store's story. You can use HTML tags for formatting."
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      selectedModule.settings.showOwnerPhoto !==
                                      false
                                    }
                                    onChange={(e) => {
                                      setModules(
                                        modules.map((m) =>
                                          m.id === selectedModuleId
                                            ? {
                                                ...m,
                                                settings: {
                                                  ...m.settings,
                                                  showOwnerPhoto:
                                                    e.target.checked,
                                                },
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                  />
                                }
                                label='Show Owner Photo'
                                sx={{ mb: 2 }}
                              />
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Text Alignment</InputLabel>
                                <Select
                                  value={
                                    selectedModule.settings.textAlignment ||
                                    'left'
                                  }
                                  onChange={(e) => {
                                    setModules(
                                      modules.map((m) =>
                                        m.id === selectedModuleId
                                          ? {
                                              ...m,
                                              settings: {
                                                ...m.settings,
                                                textAlignment: e.target.value,
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                >
                                  <MenuItem value='left'>Left</MenuItem>
                                  <MenuItem value='center'>Center</MenuItem>
                                  <MenuItem value='right'>Right</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          )}

                          {selectedModule.type === 'search-filter' && (
                            <Box>
                              <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Layout Style</InputLabel>
                                <Select
                                  value={
                                    selectedModule.settings.layout ||
                                    'industrial'
                                  }
                                  onChange={(e) => {
                                    setModules(
                                      modules.map((m) =>
                                        m.id === selectedModuleId
                                          ? {
                                              ...m,
                                              settings: {
                                                ...m.settings,
                                                layout: e.target.value,
                                              },
                                            }
                                          : m
                                      )
                                    );
                                  }}
                                >
                                  <MenuItem value='industrial'>
                                    Industrial Professional
                                  </MenuItem>
                                  <MenuItem value='farm'>Farm Style</MenuItem>
                                  <MenuItem value='artist'>
                                    Artist Style
                                  </MenuItem>
                                  <MenuItem value='minimalist'>
                                    Minimalist
                                  </MenuItem>
                                  <MenuItem value='brutalist'>
                                    Bold & Brutalist
                                  </MenuItem>
                                  <MenuItem value='luxe'>
                                    Modern & Luxe
                                  </MenuItem>
                                </Select>
                              </FormControl>

                              <TextField
                                fullWidth
                                label='Search Placeholder'
                                value={
                                  selectedModule.settings.searchPlaceholder ||
                                  'Search products...'
                                }
                                onChange={(e) => {
                                  setModules(
                                    modules.map((m) =>
                                      m.id === selectedModuleId
                                        ? {
                                            ...m,
                                            settings: {
                                              ...m.settings,
                                              searchPlaceholder: e.target.value,
                                            },
                                          }
                                        : m
                                    )
                                  );
                                }}
                                sx={{ mb: 2 }}
                              />

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      selectedModule.settings.showFilters !==
                                      false
                                    }
                                    onChange={(e) => {
                                      setModules(
                                        modules.map((m) =>
                                          m.id === selectedModuleId
                                            ? {
                                                ...m,
                                                settings: {
                                                  ...m.settings,
                                                  showFilters: e.target.checked,
                                                },
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                  />
                                }
                                label='Show Filters'
                                sx={{ mb: 2 }}
                              />

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      selectedModule.settings.showSorting !==
                                      false
                                    }
                                    onChange={(e) => {
                                      setModules(
                                        modules.map((m) =>
                                          m.id === selectedModuleId
                                            ? {
                                                ...m,
                                                settings: {
                                                  ...m.settings,
                                                  showSorting: e.target.checked,
                                                },
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                  />
                                }
                                label='Show Sorting Options'
                                sx={{ mb: 2 }}
                              />

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      selectedModule.settings
                                        .persistentSearch === true
                                    }
                                    onChange={(e) => {
                                      setModules(
                                        modules.map((m) =>
                                          m.id === selectedModuleId
                                            ? {
                                                ...m,
                                                settings: {
                                                  ...m.settings,
                                                  persistentSearch:
                                                    e.target.checked,
                                                },
                                              }
                                            : m
                                        )
                                      );
                                    }}
                                  />
                                }
                                label='Sticky Search Bar (Industrial style only)'
                                sx={{ mb: 2 }}
                              />
                            </Box>
                          )}

                          {![
                            'hero-banner',
                            'store-introduction',
                            'search-filter',
                          ].includes(selectedModule.type) && (
                            <Alert severity='info' sx={{ mt: 2 }}>
                              Advanced settings for this module type coming
                              soon!
                            </Alert>
                          )}
                        </Box>
                      );
                    })()}
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography
                      variant='h6'
                      color='text.secondary'
                      gutterBottom
                    >
                      Select a Module
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Click on a module from the preview to configure its
                      settings
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Add Module Dialog */}
      <Dialog
        open={showAddModuleDialog}
        onClose={() => setShowAddModuleDialog(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Add Module</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Choose a module to add to your storefront
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 2,
            }}
          >
            {MODULE_TEMPLATES.map((template) => (
              <Box key={template.type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      elevation: 4,
                      bgcolor: 'grey.50',
                    },
                  }}
                  onClick={() => handleAddModule(template.type)}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      {getModuleIcon(template.icon)}
                      <Typography variant='h6' fontWeight={600}>
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography variant='body2' color='text.secondary'>
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={template.category}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddModuleDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default StorefrontCustomizationPage;
