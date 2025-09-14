import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  Assignment,
  Gavel,
  Error as ErrorIcon,
  Edit,
  Email,
  Refresh,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { formatSubmissionDate, formatTimelineDate } from '../utils/dateUtils';
import OpenShopApiService from '../services/open-shop.api';
import { type ApplicationStatusResponse } from '../types/open-shop.types';

interface ApplicationStatusTrackerProps {
  storeId: number;
  submissionId?: string;
  onRefresh?: () => void;
}

const ApplicationStatusTracker: React.FC<ApplicationStatusTrackerProps> = ({
  storeId,
  submissionId,
  onRefresh,
}) => {
  const [status, setStatus] = useState<ApplicationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await OpenShopApiService.getApplicationStatus(storeId);
      setStatus(response);

      if (isRefresh) {
        toast.success('Status updated');
        onRefresh?.();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch application status';
      setError(errorMessage);
      if (isRefresh) {
        toast.error('Failed to refresh status');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [storeId]);

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'needs_revision':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'submitted':
        return <Assignment />;
      case 'under_review':
        return <Schedule />;
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <ErrorIcon />;
      case 'needs_revision':
        return <Edit />;
      default:
        return <Assignment />;
    }
  };

  const getStatusDescription = (currentStatus: string) => {
    switch (currentStatus) {
      case 'submitted':
        return 'Your application has been submitted and is waiting for review.';
      case 'under_review':
        return 'Our team is currently reviewing your application.';
      case 'approved':
        return 'Congratulations! Your store has been approved and is now live.';
      case 'rejected':
        return 'Your application was not approved. Please see the notes below.';
      case 'needs_revision':
        return 'Your application needs some changes before it can be approved.';
      default:
        return 'Unknown status';
    }
  };

  const getStepStatus = (stepStatus: string, currentStatus: string) => {
    const statusOrder = ['submitted', 'under_review', 'approved'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (currentStatus === 'rejected' || currentStatus === 'needs_revision') {
      return stepIndex <= statusOrder.indexOf('under_review')
        ? 'completed'
        : 'disabled';
    }

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'disabled';
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant='body2' sx={{ mt: 2 }}>
          Loading application status...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          <Typography variant='body2'>{error}</Typography>
        </Alert>
        <Button
          variant='outlined'
          startIcon={<Refresh />}
          onClick={() => fetchStatus(true)}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Retry'}
        </Button>
      </Paper>
    );
  }

  if (!status) {
    return (
      <Paper sx={{ p: 4 }}>
        <Alert severity='info'>
          No application status found. Please ensure you have submitted your
          store application.
        </Alert>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Status Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box>
            <Typography variant='h5' gutterBottom sx={{ fontWeight: 600 }}>
              Application Status
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Submission ID: {status.submissionId}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              icon={getStatusIcon(status.currentStatus)}
              label={status.currentStatus.replace('_', ' ').toUpperCase()}
              color={getStatusColor(status.currentStatus)}
              size='large'
              sx={{ mb: 1 }}
            />
            <br />
            <Button
              size='small'
              startIcon={<Refresh />}
              onClick={() => fetchStatus(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </Box>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          {getStatusDescription(status.currentStatus)}
        </Typography>

        {/* Timeline Information */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {status.submittedAt && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Submitted
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatSubmissionDate(status.submittedAt)}
              </Typography>
            </Box>
          )}

          {status.reviewStartedAt && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Review Started
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatSubmissionDate(status.reviewStartedAt)}
              </Typography>
            </Box>
          )}

          {status.completedAt && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Completed
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatSubmissionDate(status.completedAt)}
              </Typography>
            </Box>
          )}

          {status.estimatedCompletionDate && !status.completedAt && (
            <Box>
              <Typography variant='caption' color='text.secondary'>
                Estimated Completion
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                {formatTimelineDate(status.estimatedCompletionDate)}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Progress Stepper */}
      <Paper elevation={1} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
        <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
          Review Progress
        </Typography>

        <Stepper orientation='vertical' sx={{ mt: 2 }}>
          <Step
            active={
              getStepStatus('submitted', status.currentStatus) !== 'disabled'
            }
          >
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor:
                      getStepStatus('submitted', status.currentStatus) ===
                      'completed'
                        ? 'success.main'
                        : getStepStatus('submitted', status.currentStatus) ===
                            'active'
                          ? 'primary.main'
                          : 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getStepStatus('submitted', status.currentStatus) ===
                  'completed' ? (
                    <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                  ) : (
                    <Assignment sx={{ fontSize: 16, color: 'white' }} />
                  )}
                </Box>
              )}
            >
              Application Submitted
            </StepLabel>
            <StepContent>
              <Typography variant='body2' color='text.secondary'>
                Your store application has been received and is in the queue for
                review.
              </Typography>
            </StepContent>
          </Step>

          <Step
            active={
              getStepStatus('under_review', status.currentStatus) !== 'disabled'
            }
          >
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor:
                      getStepStatus('under_review', status.currentStatus) ===
                      'completed'
                        ? 'success.main'
                        : getStepStatus(
                              'under_review',
                              status.currentStatus
                            ) === 'active'
                          ? 'warning.main'
                          : 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getStepStatus('under_review', status.currentStatus) ===
                  'completed' ? (
                    <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                  ) : (
                    <Schedule sx={{ fontSize: 16, color: 'white' }} />
                  )}
                </Box>
              )}
            >
              Under Review
            </StepLabel>
            <StepContent>
              <Typography variant='body2' color='text.secondary'>
                Our team is reviewing your store details, products, and
                compliance with our guidelines.
              </Typography>
            </StepContent>
          </Step>

          <Step
            active={
              getStepStatus('approved', status.currentStatus) !== 'disabled'
            }
          >
            <StepLabel
              StepIconComponent={() => (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor:
                      status.currentStatus === 'approved'
                        ? 'success.main'
                        : status.currentStatus === 'rejected'
                          ? 'error.main'
                          : 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {status.currentStatus === 'approved' ? (
                    <CheckCircle sx={{ fontSize: 16, color: 'white' }} />
                  ) : status.currentStatus === 'rejected' ? (
                    <ErrorIcon sx={{ fontSize: 16, color: 'white' }} />
                  ) : (
                    <Gavel sx={{ fontSize: 16, color: 'white' }} />
                  )}
                </Box>
              )}
            >
              {status.currentStatus === 'approved'
                ? 'Approved'
                : status.currentStatus === 'rejected'
                  ? 'Rejected'
                  : 'Decision Pending'}
            </StepLabel>
            <StepContent>
              <Typography variant='body2' color='text.secondary'>
                {status.currentStatus === 'approved'
                  ? 'Your store has been approved and is now live on the platform!'
                  : status.currentStatus === 'rejected'
                    ? 'Your application was not approved. Please see the reviewer notes below.'
                    : 'Waiting for final decision on your application.'}
              </Typography>
            </StepContent>
          </Step>
        </Stepper>
      </Paper>

      {/* Reviewer Notes */}
      {status.reviewerNotes && (
        <Paper elevation={1} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            Reviewer Notes
          </Typography>
          <Alert
            severity={
              status.currentStatus === 'approved'
                ? 'success'
                : status.currentStatus === 'rejected'
                  ? 'error'
                  : 'info'
            }
            sx={{ mt: 2 }}
          >
            <Typography variant='body2'>{status.reviewerNotes}</Typography>
          </Alert>
        </Paper>
      )}

      {/* Required Actions */}
      {status.requiredActions && status.requiredActions.length > 0 && (
        <Paper elevation={1} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 600, color: 'warning.main' }}
          >
            Required Actions
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Please complete the following actions to proceed with your
            application:
          </Typography>
          <List>
            {status.requiredActions.map((action, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Edit color='warning' />
                </ListItemIcon>
                <ListItemText primary={action} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Status History */}
      {status.statusHistory && status.statusHistory.length > 0 && (
        <Paper elevation={1} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
            Status History
          </Typography>
          <List>
            {status.statusHistory.map((history, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>{getStatusIcon(history.status)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant='body2' sx={{ fontWeight: 500 }}>
                          {history.status.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {formatSubmissionDate(history.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={history.notes}
                  />
                </ListItem>
                {index < status.statusHistory.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Contact Support */}
      <Paper
        elevation={1}
        sx={{ p: 3, mt: 3, borderRadius: 2, bgcolor: 'grey.50' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Email sx={{ mr: 2, color: 'info.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Need Help?
          </Typography>
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Have questions about your application status? Our support team is here
          to help!
        </Typography>
        <Button
          variant='outlined'
          color='info'
          href='mailto:support@farmertrading.com'
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Contact Support
        </Button>
      </Paper>
    </Box>
  );
};

export default ApplicationStatusTracker;
