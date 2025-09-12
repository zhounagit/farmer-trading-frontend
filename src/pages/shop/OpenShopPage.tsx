import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

const OpenShopPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, updateStoreStatus } = useAuth();
  const navigate = useNavigate();

  // Initialize form state
  const [formState, setFormState] = useState<OpenShopFormState>({
    currentStep: 0,
    storeBasics: {
      storeName: '',
      description: '',
    },
    locationLogistics: {
      businessAddress: {
        locationName: '',
        contactPhone: '',
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

    // Check if user already has a store
    if (user.hasStore) {
      toast.error('You already have a store');
      navigate('/store/dashboard');
      return;
    }
  }, [user, navigate]);

  const updateFormState = (updates: Partial<OpenShopFormState>) => {
    console.log('=== UPDATE FORM STATE ===');
    console.log('Updates:', updates);
    console.log('Previous formState.storeId:', formState.storeId);

    setFormState((prev) => {
      const newState = {
        ...prev,
        ...updates,
      };

      console.log('New formState.storeId:', newState.storeId);
      console.log('Full new state:', JSON.stringify(newState, null, 2));

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

  const handleComplete = () => {
    // Update user's store status when store creation is completed
    updateStoreStatus(true);
    setIsCompleted(true);
  };

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
    return <SuccessStep />;
  }

  if (!user) {
    return null; // Redirect will happen in useEffect
  }

  return (
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
            Open Your Shop
          </Typography>
          <Typography
            variant='h6'
            sx={{
              opacity: 0.9,
              fontSize: { xs: '1rem', sm: '1.1rem' },
            }}
          >
            Let's get your farm store ready for customers!
          </Typography>
        </Box>

        {/* Stepper */}
        <Box sx={{ p: { xs: 2, sm: 4 }, pb: { xs: 1, sm: 2 } }}>
          <Stepper
            activeStep={formState.currentStep}
            alternativeLabel={!isMobile}
            orientation={isMobile ? 'vertical' : 'horizontal'}
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
              },
            }}
          >
            {STEP_NAMES.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label.Mui-active': {
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: theme.palette.success.main,
                      fontWeight: 500,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
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
  );
};

export default OpenShopPage;
