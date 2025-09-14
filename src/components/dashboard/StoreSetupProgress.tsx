import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Store,
  Palette,
  Visibility,
  ArrowForward,
} from '@mui/icons-material';
// Local interface to avoid import issues
interface StoreData {
  storeId: number;
  storeName?: string;
  description?: string;
  addresses?: any[];
  images?: Array<{
    imageType: 'logo' | 'banner' | 'gallery';
  }>;
  openHours?: any[];
  paymentMethods?: any[];
}

interface SetupStep {
  label: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  actions?: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

interface StoreSetupProgressProps {
  storeId?: number;
  storeName?: string;
  completionPercentage?: number;
  storeData?: StoreData | null;
  approvalStatus?:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'submitted'
    | 'under_review'
    | 'suspended';
  onNavigateToStep?: (step: string) => void;
  onCompleteSetup?: () => void;
}

const StoreSetupProgress: React.FC<StoreSetupProgressProps> = ({
  storeName = 'Your Store',
  storeData,
  approvalStatus,
  onNavigateToStep,
  onCompleteSetup,
}) => {
  // Calculate completion status based on real store data
  const hasBasicInfo = !!(storeData?.storeName && storeData?.description);
  const hasLocation = !!(
    storeData?.addresses && storeData?.addresses.length > 0
  );
  const hasOpenHours = !!(
    storeData?.openHours && storeData?.openHours.length > 0
  );
  const hasPaymentMethods = !!(
    storeData?.paymentMethods && storeData?.paymentMethods.length > 0
  );
  const hasPolicies = hasOpenHours && hasPaymentMethods;
  const hasLogo = !!storeData?.images?.some((img) => img.imageType === 'logo');
  const hasBanner = !!storeData?.images?.some(
    (img) => img.imageType === 'banner'
  );
  const hasGallery = !!storeData?.images?.some(
    (img) => img.imageType === 'gallery'
  );
  const hasBranding = hasLogo || hasBanner || hasGallery;

  const setupSteps: SetupStep[] = [
    {
      label: 'Store Basics',
      description: 'Store name, description, and basic information',
      completed: hasBasicInfo,
    },
    {
      label: 'Location & Logistics',
      description: 'Business address, selling methods, and delivery settings',
      completed: hasLocation,
    },
    {
      label: 'Store Policies',
      description: 'Operating hours and payment methods',
      completed: hasPolicies,
    },
    {
      label: 'Branding & Visuals',
      description: 'Logo, banner, and gallery images',
      completed: hasBranding,
      optional: true,
      actions: {
        primary: {
          label: 'Complete Now',
          action: () => onNavigateToStep?.('branding'),
        },
        secondary: {
          label: 'Skip for Now',
          action: () => console.log('Skip branding'),
        },
      },
    },
    {
      label: 'Review & Launch',
      description: 'Final review and store activation',
      completed: hasBasicInfo && hasLocation && hasPolicies,
      actions: {
        primary: {
          label: 'Review Store',
          action: () => onCompleteSetup?.(),
        },
      },
    },
  ];

  const completedSteps = setupSteps.filter((step) => step.completed).length;
  const totalSteps = setupSteps.length;
  const nextStep = setupSteps.find((step) => !step.completed);
  const actualCompletionPercentage = Math.round(
    (completedSteps / totalSteps) * 100
  );

  // Store is only truly complete when approved
  const isStoreFullyComplete =
    completedSteps === totalSteps && approvalStatus === 'approved';
  const isStoreSubmittedButPending =
    completedSteps === totalSteps &&
    (approvalStatus === 'submitted' ||
      approvalStatus === 'pending' ||
      approvalStatus === 'under_review');

  const getStepIcon = (step: SetupStep) => {
    if (step.completed) {
      return <CheckCircle color='success' />;
    }
    return <RadioButtonUnchecked color='disabled' />;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            Store Setup Progress
          </Typography>
          <Chip
            label={
              isStoreFullyComplete
                ? `Approved & Live`
                : isStoreSubmittedButPending
                  ? `Submitted - Under Review`
                  : `${completedSteps}/${totalSteps} Complete`
            }
            color={
              isStoreFullyComplete
                ? 'success'
                : isStoreSubmittedButPending
                  ? 'warning'
                  : completedSteps === totalSteps
                    ? 'info'
                    : 'primary'
            }
            variant='outlined'
          />
        </Box>

        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              {storeName} Setup
            </Typography>
            <Typography variant='body2' fontWeight={600}>
              {actualCompletionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={actualCompletionPercentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Setup Status */}
        {isStoreFullyComplete ? (
          <Alert severity='success' sx={{ mb: 3 }}>
            <Typography variant='body2'>
              🎉 Congratulations! Your store is approved and live!
            </Typography>
          </Alert>
        ) : isStoreSubmittedButPending ? (
          <Alert severity='warning' sx={{ mb: 3 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Store Under Review
            </Typography>
            <Typography variant='body2'>
              Your store application has been submitted and is currently being
              reviewed. You'll be notified once it's approved and ready to go
              live.
            </Typography>
          </Alert>
        ) : completedSteps === totalSteps ? (
          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Ready to Submit
            </Typography>
            <Typography variant='body2'>
              Your store setup is complete! Submit your store for approval to go
              live.
            </Typography>
          </Alert>
        ) : nextStep ? (
          <Alert severity='info' sx={{ mb: 3 }}>
            <Typography variant='body2' fontWeight={600} gutterBottom>
              Next Step: {nextStep.label}
            </Typography>
            <Typography variant='body2'>{nextStep.description}</Typography>
          </Alert>
        ) : null}
      </Paper>

      {/* Detailed Steps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' fontWeight={600} gutterBottom>
          Setup Steps
        </Typography>

        <Stepper orientation='vertical' sx={{ mt: 2 }}>
          {setupSteps.map((step) => (
            <Step
              key={step.label}
              active={!step.completed}
              completed={step.completed}
            >
              <StepLabel
                StepIconComponent={() => getStepIcon(step)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: step.completed ? 400 : 600,
                    color: step.completed ? 'text.secondary' : 'text.primary',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {step.label}
                  {step.optional && (
                    <Chip label='Optional' size='small' variant='outlined' />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}
                >
                  {step.description}
                </Typography>

                {step.actions && !step.completed && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {step.actions.primary && (
                      <Button
                        variant='contained'
                        size='small'
                        onClick={step.actions.primary.action}
                        startIcon={<ArrowForward />}
                      >
                        {step.actions.primary.label}
                      </Button>
                    )}
                    {step.actions.secondary && (
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={step.actions.secondary.action}
                      >
                        {step.actions.secondary.label}
                      </Button>
                    )}
                  </Box>
                )}

                {step.completed && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <CheckCircle color='success' sx={{ fontSize: 16 }} />
                    <Typography
                      variant='body2'
                      color='success.main'
                      fontWeight={500}
                    >
                      Completed
                    </Typography>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Quick Actions */}
        <Divider sx={{ my: 3 }} />

        <Typography variant='body2' fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>

        <List dense>
          <ListItem
            component='div'
            onClick={() => onNavigateToStep?.('branding')}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ListItemIcon>
              <Palette color='primary' />
            </ListItemIcon>
            <ListItemText
              primary='Complete Branding'
              secondary='Add logo, banner, and gallery images'
            />
          </ListItem>

          <ListItem
            component='div'
            onClick={() => console.log('Preview store')}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ListItemIcon>
              <Visibility color='primary' />
            </ListItemIcon>
            <ListItemText
              primary='Preview Store'
              secondary='See how your store looks to customers'
            />
          </ListItem>

          <ListItem
            component='div'
            onClick={() => onCompleteSetup?.()}
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          >
            <ListItemIcon>
              <Store color='primary' />
            </ListItemIcon>
            <ListItemText
              primary='Launch Store'
              secondary='Make your store live and start selling'
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default StoreSetupProgress;
