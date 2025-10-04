import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

// Import step components
import {
  StoreBasicsStep,
  LocationLogisticsStep,
  StorePoliciesStep,
  BrandingStep,
  ReviewSubmitStep,
  SuccessStep,
} from './steps';

import { STEP_NAMES } from '../../types/open-shop.types';
import type {
  OpenShopFormState,
  SellingMethod,
} from '../../types/open-shop.types';
import StoreApiService from '../../services/store.api';

import { useUserStore } from '../../hooks/useUserStore';

// Type for draft data that includes metadata
interface SavedDraftData extends OpenShopFormState {
  userId: number | string;
  savedAt: string;
}

// Utility functions for safe draft operations with user validation
const DraftUtils = {
  /**
   * Safely get user-specific draft from localStorage
   */
  getUserDraft: (userId: number | string) => {
    try {
      const draftStr = localStorage.getItem('openShop_draft');
      if (!draftStr) return null;

      const draft = JSON.parse(draftStr);

      // Validate that draft belongs to current user
      if (draft.userId && draft.userId.toString() === userId.toString()) {
        return draft;
      }

      console.log('Draft user mismatch:', {
        draftUserId: draft.userId,
        currentUserId: userId,
      });
      return null;
    } catch (error) {
      console.error('Error reading user draft:', error);
      return null;
    }
  },

  /**
   * Save draft with user validation
   */
  saveUserDraft: (userId: number | string, draftData: any) => {
    try {
      const draftWithUser = {
        ...draftData,
        userId: userId,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem('openShop_draft', JSON.stringify(draftWithUser));
      localStorage.setItem(
        'openShop_draft_lastSaved',
        JSON.stringify({
          lastSaved: new Date().toISOString(),
          userId: userId,
        })
      );

      return true;
    } catch (error) {
      console.error('Error saving user draft:', error);
      return false;
    }
  },

  /**
   * Clean up all draft data for security
   */
  clearAllDrafts: () => {
    try {
      localStorage.removeItem('openShop_draft');
      localStorage.removeItem('openShop_draft_lastSaved');
      console.log('All drafts cleared');
    } catch (error) {
      console.error('Error clearing drafts:', error);
    }
  },

  /**
   * Validate draft age and cleanup old drafts
   */
  validateDraftAge: (maxDays: number = 7) => {
    try {
      const lastSavedStr = localStorage.getItem('openShop_draft_lastSaved');
      if (!lastSavedStr) return false;

      const lastSavedData = JSON.parse(lastSavedStr);
      const lastSaved = new Date(lastSavedData.lastSaved);
      const daysSince =
        (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > maxDays) {
        DraftUtils.clearAllDrafts();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating draft age:', error);
      DraftUtils.clearAllDrafts();
      return false;
    }
  },
};

const OpenShopPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateStoreStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { primaryStore } = useUserStore();

  // Check if we're in edit mode - use URL parameter directly to avoid timing issues
  const isEditMode = searchParams.get('edit') === 'true';
  const editStoreId = isEditMode ? primaryStore?.storeId || null : null;

  // State for exit confirmation dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isLoadingStoreData, setIsLoadingStoreData] = useState(isEditMode);
  const [storeLoadError, setStoreLoadError] = useState<string | null>(null);

  // User validation - redirect if no user
  useEffect(() => {
    if (!user?.userId) {
      console.warn('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    // Clean up any drafts that don't belong to current user on component mount
    const cleanupInvalidDrafts = () => {
      try {
        const draftStr = localStorage.getItem('openShop_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft.userId && draft.userId !== user.userId) {
            console.log(
              '🧹 Cleaning up draft from different user on component mount'
            );
            DraftUtils.clearAllDrafts();
          }
        }
      } catch (error) {
        console.error('Error during draft cleanup:', error);
        DraftUtils.clearAllDrafts();
      }
    };

    cleanupInvalidDrafts();
  }, [user?.userId, navigate]);

  // Initialize form state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  const [savedDraft, setSavedDraft] = useState<SavedDraftData | null>(null);

  // Browser navigation handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Check for saved draft on component mount (skip in edit mode)
  useEffect(() => {
    const checkForSavedDraft = () => {
      if (!user?.userId) {
        console.log('No user available, skipping draft check');
        return;
      }

      // Skip draft recovery in edit mode - user should see existing store data
      if (isEditMode) {
        console.log(
          '🔧 Edit mode detected: skipping draft recovery - user is editing existing store',
          {
            editParam: searchParams.get('edit'),
            storeIdParam: searchParams.get('storeId'),
            primaryStoreId: primaryStore?.storeId,
          }
        );
        return;
      }

      try {
        // Use utility function for safe draft retrieval
        const draft = DraftUtils.getUserDraft(user.userId);

        if (draft) {
          // Validate draft age and cleanup if too old
          if (DraftUtils.validateDraftAge(7)) {
            if (draft.storeId) {
              console.log('✅ Valid draft found for current user', {
                userId: draft.userId,
                savedAt: draft.savedAt,
              });
              setSavedDraft(draft);
              setShowDraftRecovery(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking for saved draft:', error);
        DraftUtils.clearAllDrafts();
      }
    };

    checkForSavedDraft();
  }, [user?.userId, isEditMode]);

  // Cleanup effect for user changes and component unmount
  useEffect(() => {
    return () => {
      // Clean up drafts when component unmounts or user changes
      // This prevents drafts from persisting across user sessions
      if (user?.userId) {
        const currentDraft = DraftUtils.getUserDraft(user.userId);
        if (!currentDraft) {
          // If no valid draft for current user, clean up any existing drafts
          DraftUtils.clearAllDrafts();
        }
      }
    };
  }, [user?.userId]);

  const [formState, setFormState] = useState<OpenShopFormState>({
    currentStep: 0,
    storeBasics: {
      storeName: '',
      description: '',
      categories: [],
    },
    locationLogistics: {
      businessAddress: {
        locationName: '',
        contactPhone: '',
        contactEmail: '',
        streetAddress: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
      },
      sellingMethods: [],
    },
    storeHours: {
      sunday: { isOpen: false },
      monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    },
    paymentMethods: {
      selectedMethods: [],
    },
    branding: {},
    agreedToTerms: false,
    storeId: editStoreId || undefined,
  });

  const [isCompleted, setIsCompleted] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    console.log('=== OpenShopPage User Check ===');
    console.log('User object:', JSON.stringify(user, null, 2));
    console.log('User email:', user.email);
    console.log('User type:', user.userType);

    if (!user.email || user.email.trim() === '') {
      toast.error('User email not found. Please log out and log in again.');
      navigate('/login');
      return;
    }

    // Allow users to create multiple stores
    console.log('User has existing stores:', user.hasStore);
    // Note: Backend supports multiple stores per user
  }, [user, navigate]);

  // Load existing store data for edit mode
  useEffect(() => {
    const loadStoreDataForEditing = async () => {
      if (!isEditMode) {
        console.log('🔧 Not in edit mode, skipping store data load');
        return;
      }
      if (!editStoreId) {
        console.warn('🔧 Edit mode enabled but no store ID available yet', {
          isEditMode,
          editParam: searchParams.get('edit'),
          storeIdParam: searchParams.get('storeId'),
          primaryStoreId: primaryStore?.storeId,
        });
        return;
      }

      console.log('🏪 Loading store data for edit mode, storeId:', editStoreId);
      setIsLoadingStoreData(true);
      setStoreLoadError(null);

      try {
        // Fetch comprehensive store data
        const storeData =
          await StoreApiService.getComprehensiveStoreDetails(editStoreId);
        console.log('✅ Store data loaded for editing:', storeData);

        // Helper function to build proper image URLs
        const buildImageUrl = (filePath: string) => {
          if (filePath.startsWith('http')) return filePath;
          const baseUrl = 'https://localhost:7008'; // Match working implementation
          // filePath already contains the uploads path like '/uploads/stores/34/...'
          // Static files are served directly from /uploads, not /api/uploads
          const cleanPath = filePath.startsWith('/')
            ? filePath
            : '/' + filePath;
          const finalUrl = `${baseUrl}${cleanPath}`;

          console.log('🖼️ buildImageUrl:', {
            originalFilePath: filePath,
            cleanPath,
            baseUrl,
            finalUrl,
          });

          return finalUrl;
        };

        // Detailed debugging for all data sections
        console.log('🔍 DETAILED API DATA ANALYSIS:');
        console.log('  📊 Store Basic Info:', {
          storeId: storeData.storeId,
          storeName: storeData.storeName,
          description: storeData.description,
        });
        console.log('  📍 Address Info:', {
          businessAddressId: storeData.businessAddressId,
          pickupAddressId: storeData.pickupAddressId,
          farmgateAddressId: storeData.farmgateAddressId,
          deliveryRadiusMi: storeData.deliveryRadiusMi,
          totalAddresses: storeData.addresses?.length || 0,
          addressDetails: storeData.addresses?.map((addr) => ({
            id: addr.addressId,
            type: addr.addressType,
            name: addr.locationName,
            street: addr.streetAddress,
          })),
        });
        console.log('  💳 Payment Methods Raw:', {
          totalPaymentMethods: storeData.paymentMethods?.length || 0,
          paymentMethodsStructure: storeData.paymentMethods?.map((pm) => ({
            methodId: pm.methodId,
            hasPaymentMethod: !!pm.paymentMethod,
            methodName: pm.paymentMethod?.methodName,
            directMethodName: (pm as any).methodName,
          })),
        });
        console.log('  🕐 Open Hours Raw:', {
          totalOpenHours: storeData.openHours?.length || 0,
          openHoursStructure: storeData.openHours?.map((oh) => ({
            dayOfWeek: oh.dayOfWeek,
            openTime: oh.openTime,
            closeTime: oh.closeTime,
            isClosed: oh.isClosed,
            openTimeType: typeof oh.openTime,
            closeTimeType: typeof oh.closeTime,
          })),
        });
        console.log('  🖼️ Images Raw:', {
          totalImages: storeData.images?.length || 0,
          imageTypes: storeData.images?.map((img) => ({
            type: img.imageType,
            isActive: img.isActive,
            filePath: img.filePath,
            sortOrder: img.sortOrder,
          })),
        });
        console.log('  ⚙️ Setup Flow Data:', {
          hasSetupFlowData: !!(storeData as any).setupFlowData,
          setupFlowDataType: typeof (storeData as any).setupFlowData,
          setupFlowDataLength: (storeData as any).setupFlowData?.length || 0,
          rawSetupFlowData: (storeData as any).setupFlowData,
        });

        // Try to parse setup flow data for detailed debugging
        try {
          const parsedSetupFlowData = (storeData as any).setupFlowData
            ? JSON.parse((storeData as any).setupFlowData)
            : null;
          console.log('  📦 Parsed Setup Flow Data:', parsedSetupFlowData);
        } catch (error) {
          console.error('  ❌ Failed to parse setup flow data:', error);
        }

        // Convert store data to form state format
        const primaryAddress =
          storeData.addresses?.find(
            (addr) => addr.addressType === 'business' || addr.isPrimary
          ) || storeData.addresses?.[0];

        console.log('🏠 Edit mode - Primary address data:', {
          primaryAddress,
          allAddresses: storeData.addresses,
          locationName: primaryAddress?.locationName,
          hasLocationName: !!primaryAddress?.locationName,
        });

        const businessHours =
          storeData.openHours?.reduce(
            (acc, hour) => {
              const dayNames = [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
              ];
              const dayName = dayNames[hour.dayOfWeek];

              // Convert TimeSpan format (HH:mm:ss) to HH:mm format expected by the form
              const formatTime = (
                timeString: string | null | undefined
              ): string | undefined => {
                if (!timeString) return undefined;
                // Handle TimeSpan format like "09:00:00" or already formatted "09:00"
                if (typeof timeString === 'string') {
                  const parts = timeString.split(':');
                  if (parts.length >= 2) {
                    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                  }
                }
                return timeString;
              };

              acc[dayName] = {
                isOpen: !hour.isClosed,
                openTime: formatTime(hour.openTime) || '09:00',
                closeTime: formatTime(hour.closeTime) || '17:00',
              };
              return acc;
            },
            {} as Record<
              string,
              { isOpen: boolean; openTime?: string; closeTime?: string }
            >
          ) || {};

        // Extract payment method names from store_payment_methods table data
        console.log('💳 Raw payment methods from API:', {
          totalCount: storeData.paymentMethods?.length || 0,
          rawData: storeData.paymentMethods?.map((pm, index) => ({
            index,
            storePaymentMethodsId: pm.storePaymentMethodsId,
            methodId: pm.methodId,
            hasPaymentMethodObject: !!pm.paymentMethod,
            methodName: pm.paymentMethod?.methodName,
          })),
        });

        const paymentMethodNames = storeData.paymentMethods
          ? Array.from(
              new Set( // Remove duplicates using Set
                storeData.paymentMethods
                  .map((pm) => {
                    // Get the method name from the nested paymentMethod object
                    const methodName = pm.paymentMethod?.methodName;
                    if (!methodName) return null;

                    // Convert database format to display format
                    const displayNameMap: { [key: string]: string } = {
                      cash: 'Cash',
                      credit_card: 'Credit Card',
                      bank_transfer: 'Bank Transfer',
                      mobile_payment: 'Mobile Payment',
                    };

                    return displayNameMap[methodName] || methodName;
                  })
                  .filter(Boolean) // Remove null values
              )
            )
          : [];

        console.log('💳 Processed payment methods:', {
          uniqueCount: paymentMethodNames.length,
          methods: paymentMethodNames,
        });
        const categoryNames =
          storeData.categories?.map((cat) => cat.name) || [];

        console.log('🏪 Edit mode - Category data:', {
          storeCategories: storeData.categories,
          categoryNames,
          rawCategoryData: storeData.categories?.map((cat) => ({
            id: cat.categoryId,
            name: cat.name,
          })),
        });

        console.log('🏪 Edit mode - Business hours data:', {
          rawOpenHours: storeData.openHours,
          processedBusinessHours: businessHours,
          hasValidHours: Object.keys(businessHours).length > 0,
        });

        console.log('🏪 Edit mode - Payment methods data:', {
          rawPaymentMethods: storeData.paymentMethods,
          extractedMethodNames: paymentMethodNames,
          hasValidPaymentMethods: paymentMethodNames.length > 0,
        });

        // Additional validation logging
        if (!storeData.openHours || storeData.openHours.length === 0) {
          console.warn('⚠️ No open hours found for store in edit mode');
        }

        if (
          !storeData.paymentMethods ||
          storeData.paymentMethods.length === 0
        ) {
          console.warn('⚠️ No payment methods found for store in edit mode');
        }

        // Validate that we have properly formatted store hours
        const validDays = Object.keys(businessHours).filter(
          (day) => businessHours[day]?.isOpen
        );
        console.log('🏪 Edit mode - Valid open days:', validDays);

        // Validate payment method names format
        const invalidPaymentMethods = paymentMethodNames.filter(
          (method) => typeof method !== 'string' || method.length === 0
        );
        if (invalidPaymentMethods.length > 0) {
          console.warn(
            '⚠️ Invalid payment method names detected:',
            invalidPaymentMethods
          );
        }

        // Add final validation before setting form state
        // Add final comprehensive validation and logging for all form data
        const formValidationData = {
          businessHoursKeys: Object.keys(businessHours),
          paymentMethodsCount: paymentMethodNames.length,
          storeHoursStructure: Object.entries(businessHours).map(
            ([day, hours]) => ({
              day,
              isOpen: hours?.isOpen,
              openTime: hours?.openTime,
              closeTime: hours?.closeTime,
            })
          ),
          paymentMethodsArray: paymentMethodNames,
          deliveryRadius: storeData.deliveryRadiusMi,
          addressCount: storeData.addresses?.length || 0,
          addressTypes:
            storeData.addresses?.map((addr) => ({
              id: addr.addressId,
              type: addr.addressType,
              location: addr.locationName,
            })) || [],
          logisticsConfig: {
            hasPickupAddress: !!storeData.pickupAddressId,
            hasDeliveryRadius: !!(
              storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0
            ),
            hasFarmgateAddress: !!storeData.farmgateAddressId,
            businessAddressId: storeData.businessAddressId,
            pickupAddressId: storeData.pickupAddressId,
            farmgateAddressId: storeData.farmgateAddressId,
          },
        };

        console.log(
          '🏪 Edit mode - Final validation before setting form state:',
          formValidationData
        );

        // Validate critical data
        if (paymentMethodNames.length === 0) {
          console.warn(
            '⚠️ No payment methods found - store policies step will be empty'
          );
        }

        if (Object.keys(businessHours).length === 0) {
          console.warn(
            '⚠️ No business hours found - store policies step will be empty'
          );
        }

        // Update form state with loaded data
        console.log(
          '🏪 Edit mode - About to set form state with selling methods:',
          {
            sellingMethodsCount: (() => {
              const methods: string[] = [];
              if (storeData.pickupAddressId) methods.push('on-farm-pickup');
              if (storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0)
                methods.push('local-delivery');
              if (storeData.farmgateAddressId) methods.push('processor-pickup');
              return methods.length;
            })(),
          }
        );

        setFormState({
          currentStep: 0, // Start at first step for editing
          storeBasics: {
            storeName: storeData.storeName || '',
            description: storeData.description || '',
            categories: categoryNames,
          },
          locationLogistics: {
            businessAddress: {
              locationName: primaryAddress?.locationName || '',
              contactPhone:
                primaryAddress?.contactPhone || storeData.contactPhone || '',
              contactEmail: storeData.contactEmail || '',
              streetAddress: primaryAddress?.streetAddress || '',
              city: primaryAddress?.city || '',
              state: primaryAddress?.state || '',
              zipCode: primaryAddress?.zipCode || '',
              country: primaryAddress?.country || 'US',
            },
            sellingMethods: (() => {
              // Try to load selling methods from setup_flow_data first
              try {
                const setupFlowData = (storeData as any).setupFlowData
                  ? JSON.parse((storeData as any).setupFlowData)
                  : null;

                if (
                  setupFlowData?.sellingMethods &&
                  Array.isArray(setupFlowData.sellingMethods)
                ) {
                  console.log(
                    '🚚 Edit mode - Selling methods loaded from setup_flow_data:',
                    setupFlowData.sellingMethods
                  );
                  return setupFlowData.sellingMethods;
                }
              } catch (error) {
                console.warn(
                  '⚠️ Failed to parse setup_flow_data for selling methods, falling back to address inference:',
                  error
                );
              }

              // Fallback: Determine selling methods based on store configuration (addresses)
              const methods: string[] = [];

              // On-farm pickup: if store has pickup_address_id
              if (storeData.pickupAddressId) {
                methods.push('on-farm-pickup');
              }

              // Local delivery: if store has delivery_radius_mi > 0
              if (
                storeData.deliveryRadiusMi &&
                storeData.deliveryRadiusMi > 0
              ) {
                methods.push('local-delivery');
              }

              // Processor pickup: if store has farmgate_address_id
              if (storeData.farmgateAddressId) {
                methods.push('processor-pickup');
              }

              // TODO: Add farmers-market detection based on additional address types
              // For now, we'll check if there are pickup addresses that aren't the main pickup
              const pickupAddresses = storeData.addresses?.filter(
                (addr) =>
                  addr.addressType === 'pickup_location' &&
                  addr.addressId !== storeData.pickupAddressId
              );
              if (pickupAddresses && pickupAddresses.length > 0) {
                methods.push('farmers-market');
              }

              console.log(
                '🚚 Edit mode - Selling methods determined from addresses:',
                {
                  pickupAddressId: storeData.pickupAddressId,
                  deliveryRadiusMi: storeData.deliveryRadiusMi,
                  farmgateAddressId: storeData.farmgateAddressId,
                  pickupAddresses: pickupAddresses?.length || 0,
                  detectedMethods: methods,
                  allAddresses: storeData.addresses?.map((addr) => ({
                    id: addr.addressId,
                    type: addr.addressType,
                  })),
                  formStateWillHave: {
                    hasOnFarmPickup: methods.includes('on-farm-pickup'),
                    hasLocalDelivery: methods.includes('local-delivery'),
                    hasProcessorPickup: methods.includes('processor-pickup'),
                    hasFarmersMarket: methods.includes('farmers-market'),
                    totalMethods: methods.length,
                  },
                }
              );

              if (methods.length === 0) {
                console.warn(
                  '⚠️ No selling methods detected - checkboxes will be empty'
                );
              }

              return methods;
            })(),
            deliveryRadiusMi: storeData.deliveryRadiusMi || 5,
            farmgateSameAsBusinessAddress: (() => {
              // Check if farmgate address is the same as business address
              if (!storeData.farmgateAddressId) return false;

              const farmgateAddress = storeData.addresses?.find(
                (addr) => addr.addressId === storeData.farmgateAddressId
              );
              const businessAddress = storeData.addresses?.find(
                (addr) => addr.addressId === storeData.businessAddressId
              );

              // Compare key address fields to determine if they're the same
              if (farmgateAddress && businessAddress) {
                return (
                  farmgateAddress.streetAddress ===
                    businessAddress.streetAddress &&
                  farmgateAddress.city === businessAddress.city &&
                  farmgateAddress.state === businessAddress.state &&
                  farmgateAddress.zipCode === businessAddress.zipCode
                );
              }

              return false;
            })(),
            farmgateAddress: (() => {
              // Load farmgate address if it exists and is different from business
              if (!storeData.farmgateAddressId) return undefined;

              const farmgateAddress = storeData.addresses?.find(
                (addr) => addr.addressId === storeData.farmgateAddressId
              );

              if (farmgateAddress) {
                return {
                  locationName: farmgateAddress.locationName || '',
                  contactPhone: farmgateAddress.contactPhone || '',
                  contactEmail: storeData.contactEmail || '',
                  streetAddress: farmgateAddress.streetAddress || '',
                  city: farmgateAddress.city || '',
                  state: farmgateAddress.state || '',
                  zipCode: farmgateAddress.zipCode || '',
                  country: farmgateAddress.country || 'US',
                };
              }

              return undefined;
            })(),
            pickupPointAddress: (() => {
              // Load pickup point address for farmers market
              const pickupAddress = storeData.addresses?.find(
                (addr) =>
                  addr.addressType === 'pickup_location' &&
                  addr.addressId !== storeData.pickupAddressId
              );

              if (pickupAddress) {
                return {
                  locationName: pickupAddress.locationName || '',
                  contactPhone: pickupAddress.contactPhone || '',
                  contactEmail: storeData.contactEmail || '',
                  streetAddress: pickupAddress.streetAddress || '',
                  city: pickupAddress.city || '',
                  state: pickupAddress.state || '',
                  zipCode: pickupAddress.zipCode || '',
                  country: pickupAddress.country || 'US',
                };
              }

              return undefined;
            })(),
            // Load processor logistics data from setup_flow_data if available
            enableProcessorNotifications: (() => {
              try {
                const setupFlowData = (storeData as any).setupFlowData
                  ? JSON.parse((storeData as any).setupFlowData)
                  : null;

                console.log('🔧 Loading enableProcessorNotifications:', {
                  hasSetupFlowData: !!setupFlowData,
                  hasProcessorLogistics: !!setupFlowData?.processorLogistics,
                  value:
                    setupFlowData?.processorLogistics
                      ?.enableProcessorNotifications,
                });

                return (
                  setupFlowData?.processorLogistics
                    ?.enableProcessorNotifications || false
                );
              } catch (error) {
                console.error(
                  '❌ Error loading enableProcessorNotifications:',
                  error
                );
                return false;
              }
            })(),
            enableCustomerProcessorContact: (() => {
              try {
                const setupFlowData = (storeData as any).setupFlowData
                  ? JSON.parse((storeData as any).setupFlowData)
                  : null;

                console.log('🔧 Loading enableCustomerProcessorContact:', {
                  hasSetupFlowData: !!setupFlowData,
                  hasProcessorLogistics: !!setupFlowData?.processorLogistics,
                  value:
                    setupFlowData?.processorLogistics
                      ?.enableCustomerProcessorContact,
                });

                return (
                  setupFlowData?.processorLogistics
                    ?.enableCustomerProcessorContact || false
                );
              } catch (error) {
                console.error(
                  '❌ Error loading enableCustomerProcessorContact:',
                  error
                );
                return false;
              }
            })(),
            processorInstructions: (() => {
              try {
                const setupFlowData = (storeData as any).setupFlowData
                  ? JSON.parse((storeData as any).setupFlowData)
                  : null;
                return (
                  setupFlowData?.processorLogistics?.processorInstructions || ''
                );
              } catch {
                return '';
              }
            })(),
          },
          storeHours: {
            sunday: businessHours.sunday || { isOpen: false },
            monday: businessHours.monday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
            tuesday: businessHours.tuesday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
            wednesday: businessHours.wednesday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
            thursday: businessHours.thursday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
            friday: businessHours.friday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
            saturday: businessHours.saturday || {
              isOpen: true,
              openTime: '09:00',
              closeTime: '17:00',
            },
          },
          paymentMethods: {
            selectedMethods: paymentMethodNames,
          },
          branding: {
            // Load existing store images for editing - build proper URLs
            logoUrl: (() => {
              const logoImage = storeData.images?.find(
                (img) => img.imageType === 'logo' && img.isActive
              );
              if (logoImage?.filePath) {
                const logoUrl = buildImageUrl(logoImage.filePath);
                console.log('🖼️ Edit mode: Loading existing logo', {
                  logoImage,
                  logoUrl,
                  filePath: logoImage.filePath,
                });
                return logoUrl;
              }
              console.log(
                '🖼️ Edit mode: No logo image found, using storeData.logoUrl',
                storeData.logoUrl
              );
              return storeData.logoUrl;
            })(),
            bannerUrl: (() => {
              const bannerImage = storeData.images?.find(
                (img) => img.imageType === 'banner' && img.isActive
              );
              if (bannerImage?.filePath) {
                const bannerUrl = buildImageUrl(bannerImage.filePath);
                console.log('🖼️ Edit mode: Loading existing banner', {
                  bannerImage,
                  bannerUrl,
                  filePath: bannerImage.filePath,
                });
                return bannerUrl;
              }
              console.log(
                '🖼️ Edit mode: No banner image found, using storeData.bannerUrl',
                storeData.bannerUrl
              );
              return storeData.bannerUrl;
            })(),
            galleryUrls: (() => {
              const galleryImages =
                storeData.images
                  ?.filter((img) => img.imageType === 'gallery' && img.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder) || [];

              const galleryUrls = galleryImages.map((img) =>
                buildImageUrl(img.filePath)
              );

              console.log('🖼️ Edit mode: Loading existing gallery images', {
                galleryImageCount: galleryImages.length,
                galleryImages,
                galleryUrls,
              });

              return galleryUrls;
            })(),
          }, // Populate with existing store images in edit mode
          agreedToTerms: true, // Already agreed since store exists
          storeId: editStoreId,
        });

        // Debug: Verify selling methods were loaded correctly
        console.log('🚚 Edit mode - Form state selling methods verification:', {
          loadedSellingMethods:
            storeData.pickupAddressId ||
            storeData.deliveryRadiusMi ||
            storeData.farmgateAddressId
              ? 'Should have methods'
              : 'No methods expected',
          formStateSellingMethods: (() => {
            const methods: string[] = [];
            if (storeData.pickupAddressId) methods.push('on-farm-pickup');
            if (storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0)
              methods.push('local-delivery');
            if (storeData.farmgateAddressId) methods.push('processor-pickup');
            const pickupAddresses = storeData.addresses?.filter(
              (addr) =>
                addr.addressType === 'pickup_location' &&
                addr.addressId !== storeData.pickupAddressId
            );
            if (pickupAddresses && pickupAddresses.length > 0)
              methods.push('farmers-market');
            return methods;
          })(),
          storeConfig: {
            pickupAddressId: storeData.pickupAddressId,
            deliveryRadiusMi: storeData.deliveryRadiusMi,
            farmgateAddressId: storeData.farmgateAddressId,
            totalAddresses: storeData.addresses?.length || 0,
          },
        });

        // Add debug to track what will actually be set in formState
        const finalFormStateDebug = {
          locationLogistics: {
            sellingMethods: (() => {
              const methods: string[] = [];
              if (storeData.pickupAddressId) methods.push('on-farm-pickup');
              if (storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0)
                methods.push('local-delivery');
              if (storeData.farmgateAddressId) methods.push('processor-pickup');
              const pickupAddresses = storeData.addresses?.filter(
                (addr) =>
                  addr.addressType === 'pickup_location' &&
                  addr.addressId !== storeData.pickupAddressId
              );
              if (pickupAddresses && pickupAddresses.length > 0)
                methods.push('farmers-market');
              return methods;
            })(),
            deliveryRadiusMi: storeData.deliveryRadiusMi || 5,
          },
          branding: {
            logoUrl: (() => {
              const logoImage = storeData.images?.find(
                (img) => img.imageType === 'logo' && img.isActive
              );
              return logoImage?.filePath ? 'WILL_LOAD_LOGO' : 'NO_LOGO';
            })(),
            bannerUrl: (() => {
              const bannerImage = storeData.images?.find(
                (img) => img.imageType === 'banner' && img.isActive
              );
              return bannerImage?.filePath ? 'WILL_LOAD_BANNER' : 'NO_BANNER';
            })(),
            galleryUrls: (() => {
              const galleryImages =
                storeData.images?.filter(
                  (img) => img.imageType === 'gallery' && img.isActive
                ) || [];
              return galleryImages.length > 0
                ? `WILL_LOAD_${galleryImages.length}_GALLERY`
                : 'NO_GALLERY';
            })(),
          },
        };
        console.log('🎯 Form state that WILL be set:', finalFormStateDebug);

        // Use setTimeout to check if form state was actually set
        setTimeout(() => {
          console.log('⏰ FORM STATE CHECK (after 100ms delay):');
          console.log('Current formState object:', formState);
          console.log(
            'FormState.locationLogistics:',
            formState.locationLogistics
          );
          console.log('FormState.branding:', formState.branding);
          console.log('FormState.paymentMethods:', formState.paymentMethods);
        }, 100);

        setTimeout(() => {
          console.log('⏰ FORM STATE CHECK (after 500ms delay):');
          console.log('Current formState object:', formState);
          console.log(
            'FormState.locationLogistics.sellingMethods:',
            formState.locationLogistics?.sellingMethods
          );
          console.log(
            'FormState.branding.logoUrl:',
            formState.branding?.logoUrl
          );
          console.log(
            'FormState.branding.bannerUrl:',
            formState.branding?.bannerUrl
          );
          console.log(
            'FormState.branding.galleryUrls:',
            formState.branding?.galleryUrls
          );
        }, 500);

        // Load existing setupFlow data separately to preserve partnership info
        try {
          console.log('🔧 Loading existing setupFlow data for edit mode');

          // Build setupFlow from comprehensive store data
          // Infer category responses from existing store configuration
          const categoryResponses: { [key: string]: string } = {};

          // For Live Animals category, infer response based on store capabilities
          if (
            storeData.categories?.some((cat) => cat.name === 'Live Animals')
          ) {
            // Use correct API keys based on store capabilities
            if (storeData.canProcess && storeData.canProduce) {
              // Store handles processing itself - hybrid type
              categoryResponses['Live Animals'] = 'self_processing';
            } else if (storeData.canProduce && !storeData.canProcess) {
              // Store partners with processors - producer type (most likely for this case)
              categoryResponses['Live Animals'] = 'recommend_processors';
            } else {
              // Store only sells live animals for other purposes
              categoryResponses['Live Animals'] = 'independent_sales';
            }

            console.log(
              '🐄 Inferred Live Animals response based on store config:',
              {
                canProduce: storeData.canProduce,
                canProcess: storeData.canProcess,
                inferredResponse: categoryResponses['Live Animals'],
                correctKey: categoryResponses['Live Animals'],
              }
            );
          }

          const existingSetupFlow = {
            selectedCategoryIds:
              storeData.categories?.map((cat) => cat.categoryId) || [],
            categoryResponses,
            partnershipRadiusMi: storeData.partnershipRadiusMi || 50,
            selectedPartnerIds: [], // This would need to be loaded from partnerships API
            derivedStoreType: storeData.storeType || 'independent',
            derivedCanProduce: storeData.canProduce || false,
            derivedCanProcess: storeData.canProcess || false,
            derivedCanRetail: storeData.canRetail || true,
            needsPartnerships: !!(storeData.canProduce || storeData.canProcess),
            partnershipType: storeData.canProcess
              ? 'processor'
              : storeData.canProduce
                ? 'producer'
                : '',
          };

          // Update form state with setupFlow data
          setFormState((prevState) => ({
            ...prevState,
            storeBasics: {
              ...prevState.storeBasics,
              setupFlow: existingSetupFlow,
            },
          }));

          console.log(
            '✅ SetupFlow data loaded for edit mode:',
            existingSetupFlow
          );
          console.log('🔧 Inferred category responses:', categoryResponses);
          console.log('🔧 Store capabilities used for inference:', {
            canProduce: storeData.canProduce,
            canProcess: storeData.canProcess,
            canRetail: storeData.canRetail,
            partnershipRadiusMi: storeData.partnershipRadiusMi,
          });
        } catch (setupFlowError) {
          console.warn('⚠️ Failed to load setupFlow data:', setupFlowError);
        }

        console.log('✅ Form state updated with store data');
      } catch (error) {
        console.error('❌ Failed to load store data for editing:', error);
        setStoreLoadError(
          error instanceof Error ? error.message : 'Failed to load store data'
        );
        toast.error('Failed to load store data for editing');
      } finally {
        setIsLoadingStoreData(false);
      }
    };

    loadStoreDataForEditing();
  }, [isEditMode, editStoreId]);

  // Auto-save functionality
  const autoSave = useCallback(async (stateToSave: OpenShopFormState) => {
    if (!stateToSave.storeId) return;

    setAutoSaveStatus('saving');
    try {
      if (!user?.userId) {
        throw new Error('No user ID available for draft saving');
      }

      // Use utility function for safe draft saving
      const saveSuccess = DraftUtils.saveUserDraft(user.userId, stateToSave);

      if (saveSuccess) {
        setAutoSaveStatus('saved');
        console.log('✅ Auto-save completed for user:', user.userId);

        // Clear saved status after 3 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, []);

  const updateFormState = (updates: Partial<OpenShopFormState>) => {
    console.log('=== UPDATE FORM STATE ===');
    console.log('Updates:', updates);
    console.log('Previous formState.storeId:', formState.storeId);

    // Mark as having unsaved changes unless we're just advancing steps
    if (!updates.currentStep) {
      setHasUnsavedChanges(true);
    }

    setFormState((prev) => {
      const newState = {
        ...prev,
        ...updates,
      };

      console.log('New formState.storeId:', newState.storeId);
      console.log('Full new state:', JSON.stringify(newState, null, 2));

      // Trigger auto-save after state update (debounced)
      if (newState.storeId && !updates.currentStep) {
        setTimeout(() => autoSave(newState), 2000);
      }

      return newState;
    });
  };

  const handleNext = () => {
    console.log('=== HANDLE NEXT CALLED ===');
    console.log('Current step:', formState.currentStep);
    console.log('STEP_NAMES.length:', STEP_NAMES.length);
    console.log(
      'Condition check:',
      formState.currentStep < STEP_NAMES.length - 1
    );

    if (formState.currentStep < STEP_NAMES.length - 1) {
      console.log('Advancing to next step...');
      updateFormState({ currentStep: formState.currentStep + 1 });
    } else {
      console.log('Already at final step, cannot advance further');
    }
  };

  const handlePrevious = () => {
    if (formState.currentStep > 0) {
      updateFormState({ currentStep: formState.currentStep - 1 });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to previous steps (completed steps)
    if (stepIndex < formState.currentStep) {
      updateFormState({ currentStep: stepIndex });
    }
  };

  const handleComplete = () => {
    // Update user's store status when store creation is completed
    updateStoreStatus(true);
    setIsCompleted(true);
  };

  // Exit handlers
  const handleExitRequest = () => {
    setExitDialogOpen(true);
  };

  const handleExitCancel = () => {
    setExitDialogOpen(false);
  };

  const handleExitConfirm = () => {
    setExitDialogOpen(false);
    setHasUnsavedChanges(false); // Clear unsaved changes flag
    // Keep draft saved for later continuation
    if (user?.hasStore) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Draft recovery handlers (only used in new store creation mode)
  const handleRecoverDraft = () => {
    if (savedDraft) {
      setFormState(savedDraft);
      setShowDraftRecovery(false);
      toast.success('Draft progress recovered successfully!');
    }
  };

  const handleDiscardDraft = () => {
    DraftUtils.clearAllDrafts();
    setShowDraftRecovery(false);
    setSavedDraft(null);
    console.log('✅ Draft discarded by user');
    toast('Draft discarded');
  };

  // Show loading state when loading store data in edit mode
  if (isLoadingStoreData) {
    return (
      <Container maxWidth='md' sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant='h6' gutterBottom>
          Loading store data for editing...
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Please wait while we retrieve your store information.
        </Typography>
      </Container>
    );
  }

  // Show error state if failed to load store data
  if (storeLoadError) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='body1' gutterBottom>
            Failed to load store data for editing
          </Typography>
          <Typography variant='body2'>{storeLoadError}</Typography>
        </Alert>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant='outlined' onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Button variant='contained' onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  const renderStepContent = () => {
    // Debug: Log current step and form state before rendering
    console.log('📋 Rendering step:', {
      currentStep: formState.currentStep,
      stepName: STEP_NAMES[formState.currentStep] || 'Unknown',
      hasLocationLogistics: !!formState.locationLogistics,
      sellingMethodsCount:
        formState.locationLogistics?.sellingMethods?.length || 0,
      hasBranding: !!formState.branding,
      brandingKeys: formState.branding ? Object.keys(formState.branding) : [],
      hasPaymentMethods: !!formState.paymentMethods,
      paymentMethodsCount:
        formState.paymentMethods?.selectedMethods?.length || 0,
      storeId: formState.storeId,
    });

    const stepProps = {
      formState,
      updateFormState,
      onNext: handleNext,
      onPrevious: formState.currentStep > 0 ? handlePrevious : undefined,
    };

    switch (formState.currentStep) {
      case 0:
        return <StoreBasicsStep {...stepProps} />;
      case 1:
        return <LocationLogisticsStep {...stepProps} />;
      case 2:
        return <StorePoliciesStep {...stepProps} />;
      case 3:
        return <BrandingStep {...stepProps} />;
      case 4:
        return <ReviewSubmitStep {...stepProps} onComplete={handleComplete} />;
      default:
        return <StoreBasicsStep {...stepProps} />;
    }
  };

  if (isCompleted) {
    return (
      <SuccessStep
        storeId={formState.storeId}
        submissionId={formState.submissionId}
        submissionStatus={formState.submissionStatus}
        submittedAt={formState.submittedAt}
      />
    );
  }

  if (!user) {
    return null; // Redirect will happen in useEffect
  }

  return (
    <>
      {/* Navigation Header */}
      <AppBar
        position='static'
        elevation={0}
        sx={{
          background: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => navigate(user?.hasStore ? '/dashboard' : '/')}
              sx={{ p: 0.5 }}
            >
              <StoreIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            </IconButton>
            <Box>
              <Typography
                variant='h6'
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                {isEditMode ? 'Edit Your Store' : 'Open Your Shop'}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  lineHeight: 1,
                }}
              >
                Step {formState.currentStep + 1} of {STEP_NAMES.length}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${Math.round((formState.currentStep / STEP_NAMES.length) * 100)}% Complete`}
                size='small'
                color='primary'
                variant='outlined'
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              {autoSaveStatus === 'saving' && (
                <Chip
                  label='Saving...'
                  size='small'
                  color='info'
                  variant='outlined'
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              )}
              {autoSaveStatus === 'saved' && (
                <Chip
                  label='Saved'
                  size='small'
                  color='success'
                  variant='outlined'
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                />
              )}
            </Box>
            <Button
              onClick={handleExitRequest}
              startIcon={<CloseIcon />}
              variant='outlined'
              color='inherit'
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'text.secondary',
                  color: 'text.primary',
                },
              }}
            >
              Exit Setup
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography
              variant='h3'
              component='h1'
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              {isEditMode
                ? 'Edit Your Store'
                : user.hasStore
                  ? 'Create Another Store'
                  : 'Open Your Shop'}
            </Typography>
            <Typography
              variant='h6'
              sx={{
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              {isEditMode
                ? 'Update your store information and settings'
                : user.hasStore
                  ? 'You can create multiple stores to expand your business!'
                  : "Let's get your store ready for customers!"}
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ p: { xs: 2, sm: 4 }, pb: { xs: 1, sm: 2 } }}>
            <Stepper
              activeStep={formState.currentStep}
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              sx={{
                '& .MuiStepConnector-line': {
                  transition: 'border-color 0.2s ease-in-out',
                },
                '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line':
                  {
                    borderColor: theme.palette.success.main,
                  },
              }}
            >
              {STEP_NAMES.map((label, index) => {
                const isClickable = index < formState.currentStep;
                const isActive = index === formState.currentStep;

                return (
                  <Step key={label}>
                    <Tooltip
                      title={
                        isClickable
                          ? `Click to return to ${label}`
                          : isActive
                            ? 'Current step'
                            : 'Complete previous steps to unlock'
                      }
                      arrow
                      placement='top'
                    >
                      <StepLabel
                        onClick={
                          isClickable ? () => handleStepClick(index) : undefined
                        }
                        sx={{
                          cursor: isClickable ? 'pointer' : 'default',
                          transition: 'all 0.2s ease-in-out',
                          '& .MuiStepLabel-label': {
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            transition: 'all 0.2s ease-in-out',
                          },
                          '& .MuiStepLabel-label.Mui-active': {
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                          },
                          '& .MuiStepLabel-label.Mui-completed': {
                            color: theme.palette.success.main,
                            fontWeight: 500,
                            ...(isClickable && {
                              cursor: 'pointer',
                              '&:hover': {
                                color: theme.palette.success.dark,
                                textDecoration: 'underline',
                                transform: 'translateY(-1px)',
                              },
                            }),
                          },
                          '& .MuiStepIcon-root': {
                            transition: 'all 0.2s ease-in-out',
                          },
                          '& .MuiStepIcon-root.Mui-completed': {
                            ...(isClickable && {
                              cursor: 'pointer',
                              '&:hover': {
                                color: theme.palette.success.dark,
                                transform: 'scale(1.1)',
                              },
                            }),
                          },
                          '& .MuiStepIcon-root.Mui-active': {
                            color: theme.palette.primary.main,
                          },
                          ...(isClickable && {
                            '&:hover': {
                              '& .MuiStepConnector-line': {
                                borderColor: theme.palette.success.light,
                              },
                            },
                          }),
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Tooltip>
                  </Step>
                );
              })}
            </Stepper>
          </Box>

          {/* Step Content */}
          <Box sx={{ p: { xs: 2, sm: 4 }, pt: { xs: 1, sm: 2 } }}>
            <AnimatePresence mode='wait'>
              <motion.div
                key={formState.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </Box>
        </Paper>
      </Container>

      {/* Draft Recovery Dialog */}
      <Dialog
        open={showDraftRecovery}
        onClose={() => setShowDraftRecovery(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StoreIcon color='primary' />
          Continue Previous Progress?
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            We found a saved draft from your previous store setup session.
          </Typography>
          {savedDraft && (
            <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
              Last saved:{' '}
              {savedDraft.savedAt
                ? new Date(savedDraft.savedAt).toLocaleString()
                : 'Unknown'}
            </Typography>
          )}
          {savedDraft && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant='body2' color='text.secondary'>
                <strong>Store:</strong>{' '}
                {savedDraft.storeBasics.storeName || 'Unnamed Store'}
                <br />
                <strong>Progress:</strong> Step {savedDraft.currentStep + 1} of{' '}
                {STEP_NAMES.length}
                <br />
                <strong>Last Saved:</strong>{' '}
                {(() => {
                  const lastSavedStr = localStorage.getItem(
                    'openShop_draft_lastSaved'
                  );
                  const lastSavedData = lastSavedStr
                    ? JSON.parse(lastSavedStr)
                    : null;
                  return lastSavedData?.lastSaved
                    ? new Date(lastSavedData.lastSaved).toLocaleString()
                    : 'Unknown';
                })()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleDiscardDraft}
            variant='outlined'
            sx={{ textTransform: 'none' }}
          >
            Start Fresh
          </Button>
          <Button
            onClick={handleRecoverDraft}
            variant='contained'
            color='primary'
            startIcon={<StoreIcon />}
            sx={{ textTransform: 'none' }}
          >
            Continue Draft
          </Button>
        </DialogActions>
      </Dialog>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={handleExitCancel}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloseIcon color='warning' />
          Exit Store Setup
        </DialogTitle>
        <DialogContent>
          <Typography variant='body1' gutterBottom>
            Are you sure you want to exit the{' '}
            {isEditMode ? 'store editing' : 'store setup'} process?
          </Typography>
          {formState.storeId ? (
            <Typography variant='body2' color='text.secondary'>
              {isEditMode
                ? 'Any unsaved changes will be lost. Your store will remain as it was before editing.'
                : 'Your progress has been saved as a draft. You can continue later from your dashboard.'}
            </Typography>
          ) : (
            <Typography variant='body2' color='text.secondary'>
              Any unsaved progress will be lost.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleExitCancel}
            variant='outlined'
            sx={{ textTransform: 'none' }}
          >
            Continue Setup
          </Button>
          <Button
            onClick={handleExitConfirm}
            variant='contained'
            color='primary'
            startIcon={<HomeIcon />}
            sx={{ textTransform: 'none' }}
          >
            {user?.hasStore ? 'Go to Dashboard' : 'Go to Home'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OpenShopPage;
