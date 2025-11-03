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
import { useAuth } from '../../../contexts/AuthContext';
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
  PartnershipStep,
} from './steps';

import { STEP_NAMES } from '../services/open-shop.types';
import type {
  OpenShopFormState,
  StoreImage,
  StoreAddress,
} from '../services/open-shop.types';
import OpenShopApiService from '../services/open-shop.api';

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
    const draftStr = localStorage.getItem('openShop_draft');
    if (!draftStr) return null;

    const draft = JSON.parse(draftStr);

    if (draft.userId && draft.userId.toString() === userId.toString()) {
      return draft;
    }
    return null;
  },

  /**
   * Save draft with user validation
   */
  saveUserDraft: (userId: number | string, draftData: OpenShopFormState) => {
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
  },

  /**
   * Clean up all draft data for security
   */
  clearAllDrafts: () => {
    localStorage.removeItem('openShop_draft');
    localStorage.removeItem('openShop_draft_lastSaved');
  },

  /**
   * Validate draft age and cleanup old drafts
   */
  validateDraftAge: (maxDays: number = 7) => {
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
  },
};

const OpenShopPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateStoreStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're in edit mode - use URL parameter directly to avoid timing issues
  const isEditMode = searchParams.get('edit') === 'true';
  const storeIdParam = searchParams.get('storeId');
  const editStoreId = isEditMode
    ? parseInt(storeIdParam || '0', 10) || null
    : null;

  // State for exit confirmation dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isLoadingStoreData, setIsLoadingStoreData] = useState(isEditMode);
  const [storeLoadError, setStoreLoadError] = useState<string | null>(null);

  // User validation - redirect if no user
  useEffect(() => {
    if (!user?.userId) {
      navigate('/login');
      return;
    }

    // Clean up any drafts that don't belong to current user on component mount
    const cleanupInvalidDrafts = () => {
      const draftStr = localStorage.getItem('openShop_draft');
      if (draftStr) {
        const draft = JSON.parse(draftStr);
        if (draft.userId && draft.userId !== user.userId) {
          DraftUtils.clearAllDrafts();
        }
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
        return;
      }

      // Skip draft recovery in edit mode - user should see existing store data
      if (isEditMode) {
        return;
      }

      // Use utility function for safe draft retrieval
      const draft = DraftUtils.getUserDraft(user.userId);

      if (draft) {
        // Validate draft age and cleanup if too old
        if (DraftUtils.validateDraftAge(7)) {
          if (draft.storeId) {
            setSavedDraft(draft);
            setShowDraftRecovery(true);
          }
        }
      }
    };

    checkForSavedDraft();
  }, [user?.userId, isEditMode]);

  // Cleanup effect for user changes and component unmount
  useEffect(() => {
    return () => {
      // Clean up drafts when component unmounts or user changes
      if (user?.userId) {
        const currentDraft = DraftUtils.getUserDraft(user.userId);
        if (!currentDraft) {
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
      needsPartnerships: false,
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
        pickupInstructions: '',
        sameAsBusinessAddress: false,
      },

      sellingMethods: [],
    },
    storeHours: {
      sunday: {
        isOpen: false,
        openTime: undefined,
        closeTime: undefined,
        isAllDay: false,
      },
      monday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
      tuesday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
      wednesday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
      thursday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
      friday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
      saturday: {
        isOpen: true,
        openTime: '09:00',
        closeTime: '17:00',
        isAllDay: false,
      },
    },
    partnerships: {
      partnershipRadiusMi: 50,
      selectedPartnerIds: [],
      potentialPartners: [],
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

    if (!user.email || user.email.trim() === '') {
      toast.error('User email not found. Please log out and log in again.');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Load existing store data for edit mode
  useEffect(() => {
    const loadStoreDataForEditing = async () => {
      if (!isEditMode) {
        return;
      }
      if (!editStoreId) {
        return;
      }

      setIsLoadingStoreData(true);
      setStoreLoadError(null);

      const storeData =
        await OpenShopApiService.getComprehensiveStoreDetails(editStoreId);

      // Fetch video data separately if not included in comprehensive data
      let videoData: StoreImage | null = null;
      try {
        const videoResponse =
          await OpenShopApiService.getStoreVideo(editStoreId);
        if (videoResponse.success && videoResponse.data) {
          videoData = videoResponse.data;
        }
      } catch (error) {
        console.warn('Failed to fetch video data:', error);
        // Continue without video data - it's optional
      }

      if (!storeData) {
        setStoreLoadError('Store data not found');
        toast.error('Failed to load store data for editing');
        setIsLoadingStoreData(false);
        return;
      }

      // Safe array access for all data arrays with error handling
      let addresses: unknown[] = [];
      let openHours: unknown[] = [];
      let images: unknown[] = [];
      let categories: unknown[] = [];

      // Handle enhanced store API response structure
      if (
        storeData.addresses &&
        typeof storeData.addresses === 'object' &&
        !Array.isArray(storeData.addresses)
      ) {
        const addressArray = [];
        if (storeData.addresses.business) {
          addressArray.push(storeData.addresses.business);
        }
        if (
          storeData.addresses.pickupLocations &&
          Array.isArray(storeData.addresses.pickupLocations)
        ) {
          addressArray.push(...storeData.addresses.pickupLocations);
        }

        addresses = addressArray;
      } else {
        addresses = Array.isArray(storeData.addresses)
          ? storeData.addresses
          : [];
      }

      if (storeData.operations?.openHours) {
        openHours = Array.isArray(storeData.operations.openHours)
          ? storeData.operations.openHours
          : [];
      }

      if (
        storeData.images &&
        typeof storeData.images === 'object' &&
        !Array.isArray(storeData.images)
      ) {
        console.log('🖼️ Processing images object:', storeData.images);
        images = Array.isArray(storeData.images.gallery)
          ? storeData.images.gallery.map((img) => {
              const image = img as unknown as {
                imageType?: string;
                isActive?: boolean;
              };
              return {
                ...image,
                isActive: image.isActive !== undefined ? image.isActive : true,
              };
            })
          : [];
        console.log('🖼️ Gallery images after mapping:', images);

        if (storeData.images.logoUrl) {
          images.push({
            imageType: 'logo',
            filePath: storeData.images.logoUrl,
            fileName: 'logo',
            isActive: true,
          });
        }
        if (storeData.images.bannerUrl) {
          images.push({
            imageType: 'banner',
            filePath: storeData.images.bannerUrl,
            fileName: 'banner',
            isActive: true,
          });
        }
        // Add video data if available
        if (storeData.images.video && storeData.images.video.filePath) {
          images.push({
            imageType: 'video',
            filePath: storeData.images.video.filePath,
            fileName: 'video',
            isActive: true,
            isVideo: true,
            mimeType: storeData.images.video.mimeType,
          });
        }
        console.log('🖼️ Final images array:', images);
      } else {
        images = Array.isArray(storeData.images) ? storeData.images : [];
      }

      categories = Array.isArray(storeData.categories)
        ? storeData.categories
        : [];

      // Helper function to build proper image URLs
      const buildImageUrl = (filePath: string) => {
        if (filePath.startsWith('http')) return filePath;
        const baseUrl = 'https://localhost:7008';
        const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
        return `${baseUrl}${cleanPath}`;
      };

      // Convert store data to form state format
      let primaryAddress: unknown = null;

      primaryAddress =
        (Array.isArray(addresses)
          ? ((addresses.find(
              (addr) =>
                (addr as StoreAddress).addressType === 'business' ||
                (addr as StoreAddress).isPrimary
            ) || addresses[0]) as StoreAddress | undefined)
          : null) || null;

      const businessHours =
        openHours.reduce(
          (
            acc: Record<
              string,
              { isOpen: boolean; openTime?: string; closeTime?: string }
            >,
            hour: unknown
          ) => {
            const hourData = hour as unknown as {
              dayOfWeek?: string | number;
              isClosed?: boolean;
              openTime?: string;
              closeTime?: string;
            };
            // Handle both numeric and string dayOfWeek values
            const dayName =
              typeof hourData.dayOfWeek === 'number'
                ? [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ][hourData.dayOfWeek]
                : hourData.dayOfWeek?.toLowerCase();

            const formatTime = (
              timeString: string | null | undefined
            ): string | undefined => {
              if (!timeString) return undefined;
              if (typeof timeString === 'string') {
                const parts = timeString.split(':');
                if (parts.length >= 2) {
                  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
                }
              }
              return timeString;
            };

            if (
              dayName &&
              [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
              ].includes(dayName)
            ) {
              acc[dayName] = {
                isOpen: !hourData.isClosed,
                openTime: formatTime(hourData.openTime) || '09:00',
                closeTime: formatTime(hourData.closeTime) || '17:00',
              };
            }
            return acc;
          },
          {} as Record<
            string,
            { isOpen: boolean; openTime?: string; closeTime?: string }
          >
        ) || {};

      let categoryNames: string[] = [];
      categoryNames = categories.map((cat: unknown) => {
        const category = cat as unknown as { name?: string };
        return category.name || '';
      });

      setFormState({
        currentStep: 0,
        storeBasics: {
          storeName: storeData.storeName || '',
          description: storeData.description || '',
          categories: categoryNames,
          needsPartnerships:
            (storeData as unknown as { needsPartnerships?: boolean })
              .needsPartnerships || false,
        },
        locationLogistics: {
          businessAddress: {
            locationName: (primaryAddress as StoreAddress)?.locationName || '',
            contactPhone:
              (primaryAddress as StoreAddress)?.contactPhone ||
              storeData.contactPhone ||
              '',
            contactEmail:
              (primaryAddress as unknown as { contactEmail?: string })
                ?.contactEmail ||
              storeData.contactEmail ||
              '',
            streetAddress:
              (primaryAddress as StoreAddress)?.streetAddress || '',
            city: (primaryAddress as StoreAddress)?.city || '',
            state: (primaryAddress as StoreAddress)?.state || '',
            zipCode: (primaryAddress as StoreAddress)?.zipCode || '',
            country: (primaryAddress as StoreAddress)?.country || 'US',
            pickupInstructions:
              (primaryAddress as StoreAddress)?.pickupInstructions || '',
            sameAsBusinessAddress: false,
          },

          sellingMethods: (() => {
            const methods: Array<'pickup' | 'local-delivery'> = [];

            const pickupAddresses = addresses?.filter(
              (addr: unknown) => (addr as StoreAddress).addressType === 'pickup'
            );
            if (pickupAddresses && pickupAddresses.length > 0) {
              methods.push('pickup');
            }

            if (storeData.deliveryRadiusMi && storeData.deliveryRadiusMi > 0) {
              methods.push('local-delivery');
            }

            return methods;
          })(),
          deliveryRadiusMi: storeData.deliveryRadiusMi || 5,
          pickupPointAddress: (() => {
            const pickupAddr = Array.isArray(addresses)
              ? addresses.find(
                  (addr: unknown) =>
                    (addr as StoreAddress).addressType === 'pickup'
                )
              : undefined;

            if (pickupAddr) {
              const addr = pickupAddr as StoreAddress;
              return {
                locationName: addr.locationName || '',
                contactPhone: addr.contactPhone || '',
                contactEmail: ((addr as unknown as { contactEmail?: string })
                  ?.contactEmail ||
                  storeData.contactEmail ||
                  storeData.contactPhone ||
                  '') as string,
                streetAddress: addr.streetAddress || '',
                city: addr.city || '',
                state: addr.state || '',
                zipCode: addr.zipCode || '',
                country: addr.country || 'US',
                pickupInstructions: addr.pickupInstructions || '',
                sameAsBusinessAddress: false,
              };
            }

            return undefined;
          })(),
        },
        storeHours: {
          sunday: businessHours.sunday || { isOpen: false },
          monday: businessHours.monday || { isOpen: false },
          tuesday: businessHours.tuesday || { isOpen: false },
          wednesday: businessHours.wednesday || { isOpen: false },
          thursday: businessHours.thursday || { isOpen: false },
          friday: businessHours.friday || { isOpen: false },
          saturday: businessHours.saturday || { isOpen: false },
        },
        branding: {
          logoUrl: (() => {
            const logoImage = Array.isArray(images)
              ? images.find((img: unknown) => {
                  const image = img as unknown as {
                    imageType?: string;
                    isActive?: boolean;
                    filePath?: string;
                  };
                  return image.imageType === 'logo' && image.isActive;
                })
              : undefined;
            const logoImagePath = (
              logoImage as unknown as {
                filePath?: string;
              }
            )?.filePath;
            if (logoImagePath) {
              return buildImageUrl(logoImagePath as string);
            }
            return storeData.logoUrl;
          })(),
          bannerUrl: (() => {
            const bannerImage = Array.isArray(images)
              ? images.find((img: unknown) => {
                  const image = img as unknown as {
                    imageType?: string;
                    isActive?: boolean;
                    filePath?: string;
                  };
                  return image.imageType === 'banner' && image.isActive;
                })
              : undefined;
            const bannerImagePath = (
              bannerImage as unknown as {
                filePath?: string;
              }
            )?.filePath;
            if (bannerImagePath) {
              return buildImageUrl(bannerImagePath as string);
            }
            return storeData.bannerUrl;
          })(),
          galleryUrls: (() => {
            console.log('🖼️ Filtering gallery images from:', images);
            const galleryImages =
              images
                ?.filter((img: unknown) => {
                  const image = img as unknown as {
                    imageType?: string;
                    isActive?: boolean;
                  };
                  return (
                    image.imageType === 'gallery' && image.isActive !== false
                  );
                })
                .sort((a: unknown, b: unknown) => {
                  const imageA = a as unknown as { displayOrder?: number };
                  const imageB = b as unknown as { displayOrder?: number };
                  return (
                    (imageA.displayOrder || 0) - (imageB.displayOrder || 0)
                  );
                }) || [];
            console.log('🖼️ Filtered gallery images:', galleryImages);

            const galleryUrls = galleryImages
              .map((img: unknown) => {
                const image = img as unknown as { filePath?: string };
                if (image.filePath) {
                  return buildImageUrl(image.filePath as string);
                }
                return '';
              })
              .filter((url: string) => url !== '');
            console.log('🖼️ Final gallery URLs:', galleryUrls);
            return galleryUrls;
          })(),
          videoUrl: (() => {
            console.log('🎥 Processing video data:', { images, videoData });
            // Check for video in images array first
            const videoImage = Array.isArray(images)
              ? images.find((img: unknown) => {
                  const image = img as unknown as {
                    imageType?: string;
                    isActive?: boolean;
                    displayOrder?: number;
                  };
                  return image.imageType === 'video' && image.isActive;
                })
              : undefined;
            console.log('🎥 Found video image:', videoImage);

            const videoImagePath = (
              videoImage as unknown as {
                filePath?: string;
              }
            )?.filePath;
            if (videoImagePath) {
              const videoUrl = buildImageUrl(videoImagePath as string);
              console.log('🎥 Using video from images array:', videoUrl);
              return videoUrl;
            }

            // Use separately fetched video data if available
            if (videoData?.filePath) {
              const videoUrl = buildImageUrl(videoData.filePath);
              console.log('🎥 Using separately fetched video:', videoUrl);
              return videoUrl;
            }

            // Fall back to external video URL
            if (videoData?.externalVideoUrl) {
              console.log(
                '🎥 Using external video URL:',
                videoData.externalVideoUrl
              );
              return videoData.externalVideoUrl;
            }

            // Return any existing video URL from store data
            const fallbackUrl = (storeData as unknown as { videoUrl?: string })
              .videoUrl;
            console.log('🎥 Using fallback video URL:', fallbackUrl);
            return fallbackUrl;
          })(),
        },
        partnerships: {
          partnershipRadiusMi: 50,
          selectedPartnerIds: [],
          potentialPartners: [],
        },
        agreedToTerms: !!storeData.submittedAt || !!storeData.approvalStatus,
        storeId: editStoreId,
      });

      const categoryResponses: { [key: string]: string } = {};

      if (
        categories?.some((cat: unknown) => {
          const category = cat as unknown as { name?: string };
          return category.name === 'Live Animals';
        })
      ) {
        if (
          (storeData as unknown as { canProcess?: boolean }).canProcess &&
          (storeData as unknown as { canProduce?: boolean }).canProduce
        ) {
          categoryResponses['Live Animals'] = 'self_processing';
        } else if (
          (storeData as unknown as { canProduce?: boolean }).canProduce &&
          !(storeData as unknown as { canProcess?: boolean }).canProcess
        ) {
          categoryResponses['Live Animals'] = 'recommend_processors';
        } else {
          categoryResponses['Live Animals'] = 'independent_sales';
        }
      }

      const parsedSetupFlowData = (
        storeData as unknown as { setupFlowData?: string }
      ).setupFlowData
        ? JSON.parse(
            (storeData as unknown as { setupFlowData?: string })
              .setupFlowData as string
          )
        : null;

      const existingSetupFlow = {
        selectedCategoryIds:
          (categories as unknown as Array<{ categoryId?: number }>)?.map(
            (cat: unknown): number => {
              const category = cat as unknown as { categoryId?: number };
              return (category.categoryId as number) || 0;
            }
          ) || [],
        categoryResponses,
        partnershipRadiusMi:
          parsedSetupFlowData?.partnershipRadiusMi ||
          storeData.partnershipRadiusMi ||
          50,
        selectedPartnerIds: [],
        derivedStoreType:
          (storeData as unknown as { storeType?: string }).storeType ||
          'independent',
        derivedCanProduce:
          (storeData as unknown as { canProduce?: boolean }).canProduce ||
          false,
        derivedCanProcess:
          (storeData as unknown as { canProcess?: boolean }).canProcess ||
          false,
        derivedCanRetail:
          (storeData as unknown as { canRetail?: boolean }).canRetail || true,
        needsPartnerships:
          parsedSetupFlowData?.needsPartnerships ||
          (storeData as unknown as { needsPartnerships?: boolean })
            .needsPartnerships ||
          false,
        partnershipType:
          (parsedSetupFlowData?.partnershipType as string) ||
          ((storeData as unknown as { canProcess?: boolean }).canProcess
            ? 'processor'
            : (storeData as unknown as { canProduce?: boolean }).canProduce
              ? 'producer'
              : '') ||
          '',
      };

      setFormState((prevState) => ({
        ...prevState,
        storeBasics: {
          ...prevState.storeBasics,
          setupFlow: existingSetupFlow,
        },
      }));

      setIsLoadingStoreData(false);
    };

    loadStoreDataForEditing();
  }, [isEditMode, editStoreId]);

  // Auto-save functionality
  const autoSave = useCallback(
    async (stateToSave: OpenShopFormState) => {
      if (!stateToSave.storeId) return;

      setAutoSaveStatus('saving');

      if (!user?.userId) {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
        return;
      }

      const saveSuccess = DraftUtils.saveUserDraft(user.userId, stateToSave);

      if (saveSuccess) {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } else {
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    },
    [user?.userId]
  );

  const updateFormState = (updates: Partial<OpenShopFormState>) => {
    if (!updates.currentStep) {
      setHasUnsavedChanges(true);
    }

    setFormState((prev) => {
      const newState = {
        ...prev,
        ...updates,
      };

      if (newState.storeId && !updates.currentStep) {
        setTimeout(() => autoSave(newState), 2000);
      }

      return newState;
    });
  };

  // Helper functions for conditional partnership step logic
  // Partnership page is only shown for producer or processor store types
  const shouldShowPartnershipStep = () => {
    const storeType = formState.storeBasics?.setupFlow?.derivedStoreType;
    return storeType === 'producer' || storeType === 'processor';
  };

  const getStepComponent = (stepIndex: number) => {
    const stepProps = {
      formState,
      updateFormState,
      onNext: handleNext,
      onPrevious: formState.currentStep > 0 ? handlePrevious : () => {},
      isEditMode,
    };

    const showPartnerships = shouldShowPartnershipStep();

    // Map currentStep to the correct component
    // For stores without partnership: 0=Basics, 1=Location, 2=StorePolicies, 3=Branding, 4=Review
    // For stores with partnership: 0=Basics, 1=Location, 2=Partnership, 3=StorePolicies, 4=Branding, 5=Review
    if (!showPartnerships) {
      switch (stepIndex) {
        case 0:
          return <StoreBasicsStep {...stepProps} />;
        case 1:
          return <LocationLogisticsStep {...stepProps} />;
        case 2:
          return <StorePoliciesStep {...stepProps} />;
        case 3:
          return <BrandingStep {...stepProps} />;
        case 4:
          return (
            <ReviewSubmitStep
              {...stepProps}
              onComplete={handleComplete}
              onPrevious={handlePrevious}
            />
          );
        default:
          return <StoreBasicsStep {...stepProps} />;
      }
    }

    // Standard flow when partnership is shown
    switch (stepIndex) {
      case 0:
        return <StoreBasicsStep {...stepProps} />;
      case 1:
        return <LocationLogisticsStep {...stepProps} />;
      case 2:
        return <PartnershipStep {...stepProps} />;
      case 3:
        return <StorePoliciesStep {...stepProps} />;
      case 4:
        return <BrandingStep {...stepProps} />;
      case 5:
        return (
          <ReviewSubmitStep
            {...stepProps}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
          />
        );
      default:
        return <StoreBasicsStep {...stepProps} />;
    }
  };

  const handleNext = () => {
    const showPartnerships = shouldShowPartnershipStep();
    const nextStep = formState.currentStep + 1;

    // For stores without partnership, max step is 4 (0-4 = 5 steps)
    // For stores with partnership, max step is 5 (0-5 = 6 steps)
    const maxStep = showPartnerships
      ? STEP_NAMES.length - 1
      : STEP_NAMES.length - 2;

    if (nextStep <= maxStep) {
      updateFormState({ currentStep: nextStep });
    }
  };

  const handlePrevious = () => {
    if (formState.currentStep > 0) {
      const prevStep = formState.currentStep - 1;
      updateFormState({ currentStep: prevStep });
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < formState.currentStep) {
      updateFormState({ currentStep: stepIndex });
    }
  };

  const handleComplete = () => {
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
    setHasUnsavedChanges(false);
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
    return getStepComponent(formState.currentStep);
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
    return null;
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
                Step {formState.currentStep + 1} of{' '}
                {shouldShowPartnershipStep()
                  ? STEP_NAMES.length
                  : STEP_NAMES.length - 1}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${Math.round((formState.currentStep / (shouldShowPartnershipStep() ? STEP_NAMES.length : STEP_NAMES.length - 1)) * 100)}% Complete`}
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
                if (index === 2 && !shouldShowPartnershipStep()) {
                  return null;
                }

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
                {shouldShowPartnershipStep()
                  ? STEP_NAMES.length
                  : STEP_NAMES.length - 1}
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
