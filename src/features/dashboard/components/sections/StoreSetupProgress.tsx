import React from 'react';
import { Alert, Box, Typography, Chip, CircularProgress } from '@mui/material';
import { CheckCircle, Pending, ErrorOutline } from '@mui/icons-material';

interface StoreSetupProgressProps {
  storeId?: number;
  storeData?: {
    status?: {
      submissionStatus?: string;
      approvalStatus?: string;
      submittedAt?: string;
    };
  } | null;
  approvalStatus?: string;
  onNavigateToStep?: (step: string) => void;
  onCompleteSetup?: () => void;
}

const StoreSetupProgress: React.FC<StoreSetupProgressProps> = ({
  storeData,
}) => {
  // Show loading state if storeData is null (data still loading)
  if (!storeData) {
    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            Store Status
          </Typography>
          <Chip label='Loading...' color='default' size='small' />
        </Box>
        <Alert
          severity='info'
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2 }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
            Loading Store Status...
          </Typography>
          <Typography variant='body2'>
            Please wait while we load your store information.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Extract status information from store data
  const submissionStatus = storeData?.status?.submissionStatus;
  const approvalStatus = storeData?.status?.approvalStatus;

  console.log('🔍 StoreSetupProgress - Component RENDERED');
  console.log('🔍 StoreSetupProgress - storeData:', storeData);
  console.log('🔍 StoreSetupProgress - submissionStatus:', submissionStatus);
  console.log('🔍 StoreSetupProgress - approvalStatus:', approvalStatus);

  const getStatusConfig = () => {
    // Priority 1: If store is approved in either submission or approval status, show approved
    if (submissionStatus === 'approved' || approvalStatus === 'approved') {
      return {
        severity: 'success' as const,
        icon: <CheckCircle />,
        title: 'Store Approved & Live',
        description: 'Your store is approved and ready for customers!',
        chipColor: 'success' as const,
        chipLabel: 'Approved & Live',
      };
    }

    // Priority 2: Check submission status (from store_submissions table)
    if (submissionStatus) {
      switch (submissionStatus) {
        case 'submitted':
          return {
            severity: 'warning' as const,
            icon: <Pending />,
            title: 'Store Submitted for Review',
            description:
              'Your store has been submitted and is pending admin review.',
            chipColor: 'warning' as const,
            chipLabel: 'Submitted - Pending Review',
          };
        case 'under_review':
          return {
            severity: 'warning' as const,
            icon: <Pending />,
            title: 'Store Under Review',
            description:
              'Your store application is being reviewed. You will be notified once approved.',
            chipColor: 'warning' as const,
            chipLabel: 'Under Review',
          };
        case 'needs_revision':
          return {
            severity: 'warning' as const,
            icon: <Pending />,
            title: 'Store Needs Revision',
            description:
              'Your store needs some changes before it can be approved.',
            chipColor: 'warning' as const,
            chipLabel: 'Needs Revision',
          };
        case 'rejected':
          return {
            severity: 'error' as const,
            icon: <ErrorOutline />,
            title: 'Store Application Rejected',
            description:
              'Your store application was not approved. Please check your email for details.',
            chipColor: 'error' as const,
            chipLabel: 'Rejected',
          };
      }
    }

    // Priority 3: If no submission status, check approval status (from stores table)
    switch (approvalStatus) {
      case 'rejected':
        return {
          severity: 'error' as const,
          icon: <ErrorOutline />,
          title: 'Store Application Rejected',
          description:
            'Your store application was not approved. Please check your email for details.',
          chipColor: 'error' as const,
          chipLabel: 'Rejected',
        };
      case 'suspended':
        return {
          severity: 'error' as const,
          icon: <ErrorOutline />,
          title: 'Store Suspended',
          description:
            'Your store has been suspended. Please contact support for assistance.',
          chipColor: 'error' as const,
          chipLabel: 'Suspended',
        };
      default:
        return {
          severity: 'info' as const,
          icon: <Pending />,
          title: 'Store Setup In Progress',
          description: 'Complete your store setup to submit for approval.',
          chipColor: 'primary' as const,
          chipLabel: 'Setup In Progress',
        };
    }
  };

  const statusConfig = getStatusConfig();

  console.log('✅ StoreSetupProgress - Final status config:', statusConfig);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant='h6' fontWeight={600}>
          Store Status
        </Typography>
        <Chip
          label={statusConfig.chipLabel}
          color={statusConfig.chipColor}
          size='small'
        />
      </Box>

      <Alert
        severity={statusConfig.severity}
        icon={statusConfig.icon}
        sx={{ mb: 2 }}
      >
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
          {statusConfig.title}
        </Typography>
        <Typography variant='body2'>{statusConfig.description}</Typography>

        {/* Show submission date if available */}
        {submissionStatus && storeData?.status?.submittedAt && (
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ mt: 1, display: 'block' }}
          >
            Submitted on:{' '}
            {new Date(storeData.status.submittedAt).toLocaleDateString()}
          </Typography>
        )}
      </Alert>
    </Box>
  );
};

export default StoreSetupProgress;
