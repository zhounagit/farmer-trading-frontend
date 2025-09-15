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
import type { OpenShopFormState } from '../../types/open-shop.types';
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

  // Check if we're in edit mode
  const editStoreId = searchParams.get('edit')
    ? primaryStore?.storeId || null
    : null;
  const isEditMode = !!editStoreId;

  // State for exit confirmation dialog
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [isLoadingStoreData, setIsLoadingStoreData] = useState(false);
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

  // Check for saved draft on component mount
  useEffect(() => {
    const checkForSavedDraft = () => {
      if (!user?.userId) {
        console.log('No user available, skipping draft check');
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
        } else {
          // Clean up any invalid drafts that might exist
          const draftStr = localStorage.getItem('openShop_draft');
          if (draftStr) {
            console.log('🧹 Cleaning up invalid draft data');
            DraftUtils.clearAllDrafts();
          }
        }
      } catch (error) {
        console.error('❌ Error checking for saved draft:', error);
        DraftUtils.clearAllDrafts();
      }
    };

    checkForSavedDraft();
  }, [user?.userId]);

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
        streetLine: '',
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
      if (!isEditMode || !editStoreId) return;

      console.log('🏪 Loading store data for edit mode, storeId:', editStoreId);
      setIsLoadingStoreData(true);
      setStoreLoadError(null);

      try {
        // Fetch comprehensive store data
        const storeData =
          await StoreApiService.getComprehensiveStoreDetails(editStoreId);
        console.log('✅ Store data loaded for editing:', storeData);

        // Convert store data to form state format
        const primaryAddress =
          storeData.addresses?.find(
            (addr) => addr.addressType === 'business' || addr.isPrimary
          ) || storeData.addresses?.[0];

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
              acc[dayName] = {
                isOpen: !hour.isClosed,
                openTime: hour.openTime || '09:00',
                closeTime: hour.closeTime || '17:00',
              };
              return acc;
            },
            {} as Record<
              string,
              { isOpen: boolean; openTime?: string; closeTime?: string }
            >
          ) || {};

        const paymentMethodIds =
          storeData.paymentMethods?.map((pm) => pm.methodId) || [];
        const categoryIds =
          storeData.categories?.map((cat) => cat.categoryId) || [];

        // Update form state with loaded data
        setFormState({
          currentStep: 0, // Start at first step for editing
          storeBasics: {
            storeName: storeData.storeName || '',
            description: storeData.description || '',
            categories: categoryIds.map(String),
          },
          locationLogistics: {
            businessAddress: {
              locationName: primaryAddress?.locationName || '',
              contactPhone:
                primaryAddress?.contactPhone || storeData.contactPhone || '',
              contactEmail: storeData.contactEmail || '',
              streetLine: primaryAddress?.streetLine || '',
              city: primaryAddress?.city || '',
              state: primaryAddress?.state || '',
              zipCode: primaryAddress?.zipCode || '',
              country: primaryAddress?.country || 'US',
            },
            sellingMethods: [], // TODO: Add selling methods to API if needed
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
            selectedMethods: paymentMethodIds.map(String),
          },
          branding: {}, // Branding is handled separately in dashboard
          agreedToTerms: true, // Already agreed since store exists
          storeId: editStoreId,
        });

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

  // Draft recovery handlers
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
              {user.hasStore ? 'Create Another Store' : 'Open Your Shop'}
            </Typography>
            <Typography
              variant='h6'
              sx={{
                opacity: 0.9,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              {user.hasStore
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
