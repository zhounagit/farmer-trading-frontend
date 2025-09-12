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
  LocationOn,
  Schedule,
  Payment,
  Palette,
  Visibility,
  ArrowForward,
} from '@mui/icons-material';

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
  onNavigateToStep?: (step: string) => void;
  onCompleteSetup?: () => void;
}

const StoreSetupProgress: React.FC<StoreSetupProgressProps> = ({
  storeId,
  storeName = 'Your Store',
  completionPercentage = 0,
  onNavigateToStep,
  onCompleteSetup,
}) => {
  // Mock setup steps - replace with real data
  const setupSteps: SetupStep[] = [
    {
      label: 'Store Basics',
      description: 'Store name, description, and basic information',
      completed: true,
    },
    {
      label: 'Location & Logistics',
      description: 'Business address, selling methods, and delivery settings',
      completed: true,
    },
    {
      label: 'Store Policies',
      description: 'Operating hours and payment methods',
      completed: true,
    },
    {
      label: 'Branding & Visuals',
      description: 'Logo, banner, and gallery images',
      completed: false,
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
      completed: false,
      actions: {
        primary: {
          label: 'Review Store',
          action: () => onCompleteSetup?.(),
        },
      },
    },
  ];

  const completedSteps = setupSteps.filter(step => step.completed).length;
  const totalSteps = setupSteps.length;
  const nextStep = setupSteps.find(step => !step.completed);

  const getStepIcon = (step: SetupStep, index: number) => {
    if (step.completed) {
      return <CheckCircle color="success" />;
    }
    return <RadioButtonUnchecked color="disabled" />;
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Store Setup Progress
          </Typography>
          <Chip
            label={`${completedSteps}/${totalSteps} Complete`}
            color={completedSteps === totalSteps ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>

        {/* Overall Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {storeName} Setup
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {Math.round((completedSteps / totalSteps) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={(completedSteps / totalSteps) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Setup Status */}
        {completedSteps === totalSteps ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography variant="body2">
              🎉 Congratulations! Your store setup is complete and ready to go live!
            </Typography>
          </Alert>
        ) : nextStep ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Next Step: {nextStep.label}
            </Typography>
            <Typography variant="body2">
              {nextStep.description}
            </Typography>
          </Alert>
        ) : null}
      </Paper>

      {/* Detailed Steps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Setup Steps
        </Typography>

        <Stepper orientation="vertical" sx={{ mt: 2 }}>
          {setupSteps.map((step, index) => (
            <Step key={step.label} active={!step.completed} completed={step.completed}>
              <StepLabel
                StepIconComponent={() => getStepIcon(step, index)}
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
                    <Chip label="Optional" size="small" variant="outlined" />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>

                {step.actions && !step.completed && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {step.actions.primary && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={step.actions.primary.action}
                        startIcon={<ArrowForward />}
                      >
                        {step.actions.primary.label}
                      </Button>
                    )}
                    {step.actions.secondary && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={step.actions.secondary.action}
                      >
                        {step.actions.secondary.label}
                      </Button>
                    )}
                  </Box>
                )}

                {step.completed && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircle color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="body2" color="success.main" fontWeight={500}>
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

        <Typography variant="body2" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>

        <List dense>
          <ListItem button onClick={() => onNavigateToStep?.('branding')}>
            <ListItemIcon>
              <Palette color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Complete Branding"
              secondary="Add logo, banner, and gallery images"
            />
          </ListItem>

          <ListItem button onClick={() => console.log('Preview store')}>
            <ListItemIcon>
              <Visibility color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Preview Store"
              secondary="See how your store looks to customers"
            />
          </ListItem>

          <ListItem button onClick={() => onCompleteSetup?.()}>
            <ListItemIcon>
              <Store color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Launch Store"
              secondary="Make your store live and start selling"
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default StoreSetupProgress;
