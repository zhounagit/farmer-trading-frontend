import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import OpenShopApiService from '../services/open-shop.api';
import ApplicationStatusTracker from './ApplicationStatusTracker';
import {
  type StoreSubmissionRequest,
  type StoreSubmissionResponse,
  type ApplicationStatusResponse,
} from '../types/open-shop.types';

const TestStoreSubmission: React.FC = () => {
  const [testStoreId, setTestStoreId] = useState<string>('1');
  const [submissionNotes, setSubmissionNotes] = useState<string>(
    'Test submission from frontend integration test'
  );
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingStatus, setIsFetchingStatus] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] =
    useState<StoreSubmissionResponse | null>(null);
  const [statusResult, setStatusResult] =
    useState<ApplicationStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showStatusTracker, setShowStatusTracker] = useState<boolean>(false);

  const handleTestSubmission = async () => {
    if (!testStoreId) {
      toast.error('Please enter a store ID');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to terms for testing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Testing store submission

      const submissionRequest: StoreSubmissionRequest = {
        storeId: parseInt(testStoreId),
        agreedToTermsAt: new Date().toISOString(),
        termsVersion: '1.0.0',
        submissionNotes: submissionNotes || undefined,
      };

      // Request payload prepared

      const response =
        await OpenShopApiService.submitStoreForReview(submissionRequest);

      // Store submitted successfully
      setSubmissionResult(response);
      toast.success('Store submitted successfully!');

      // Automatically fetch status after submission
      setTimeout(() => {
        handleFetchStatus(parseInt(testStoreId));
      }, 1000);
    } catch (err) {
      // Submission error occurred
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit store';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchStatus = async (storeId?: number) => {
    const id = storeId || parseInt(testStoreId);
    if (!id) {
      toast.error('Please enter a store ID');
      return;
    }

    setIsFetchingStatus(true);
    setError(null);

    try {
      // Testing status fetch

      const response = await OpenShopApiService.getApplicationStatus(id);

      // Status fetched successfully
      setStatusResult(response);
      toast.success('Status fetched successfully!');
    } catch (err) {
      // Status fetch error occurred
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsFetchingStatus(false);
    }
  };

  const resetTest = () => {
    setSubmissionResult(null);
    setStatusResult(null);
    setError(null);
    setShowStatusTracker(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h4' gutterBottom sx={{ fontWeight: 600 }}>
        Store Submission API Test
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Test the store submission and status tracking API endpoints.
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          <Typography variant='body2'>{error}</Typography>
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 4,
        }}
      >
        {/* Left Panel - Test Controls */}
        <Box sx={{ flex: 1 }}>
          {/* Test Configuration */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
              Test Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <TextField
              fullWidth
              label='Store ID'
              value={testStoreId}
              onChange={(e) => setTestStoreId(e.target.value)}
              type='number'
              sx={{ mb: 2 }}
              helperText='Enter a valid store ID to test with'
            />

            <TextField
              fullWidth
              label='Submission Notes (Optional)'
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
              }
              label='Agree to Terms (Test Mode)'
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                startIcon={<SendIcon />}
                onClick={handleTestSubmission}
                disabled={isSubmitting || !testStoreId}
                sx={{ minWidth: 150 }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Store'}
              </Button>

              <Button
                variant='outlined'
                startIcon={<RefreshIcon />}
                onClick={() => handleFetchStatus()}
                disabled={isFetchingStatus || !testStoreId}
                sx={{ minWidth: 150 }}
              >
                {isFetchingStatus ? 'Fetching...' : 'Fetch Status'}
              </Button>

              <Button variant='text' onClick={resetTest} sx={{ minWidth: 100 }}>
                Reset
              </Button>
            </Box>

            {(isSubmitting || isFetchingStatus) && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 1, display: 'block' }}
                >
                  {isSubmitting
                    ? 'Submitting store application...'
                    : 'Fetching application status...'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* API Endpoints Info */}
          <Paper elevation={1} sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
              API Endpoints Being Tested
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant='body2'
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    >
                      POST /api/store-submissions/{'{storeId}'}
                      /submit-for-review
                    </Typography>
                  }
                  secondary='Submit store application for admin review'
                />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography
                      variant='body2'
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                    >
                      GET /api/store-submissions/{'{storeId}'}/submission-status
                    </Typography>
                  }
                  secondary='Get current application status and history'
                />
              </ListItem>
            </List>
          </Paper>
        </Box>

        {/* Right Panel - Results */}
        <Box sx={{ flex: 1 }}>
          {/* Submission Result */}
          {submissionResult && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckIcon color='success' sx={{ mr: 1 }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Submission Successful
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    Submission ID:
                  </Typography>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    {submissionResult.submissionId}
                  </Typography>

                  <Typography variant='caption' color='text.secondary'>
                    Store ID:
                  </Typography>
                  <Typography variant='body2'>
                    {submissionResult.storeId}
                  </Typography>

                  <Typography variant='caption' color='text.secondary'>
                    Status:
                  </Typography>
                  <Chip
                    label={submissionResult.status
                      .replace('_', ' ')
                      .toUpperCase()}
                    color={getStatusColor(submissionResult.status)}
                    size='small'
                  />

                  <Typography variant='caption' color='text.secondary'>
                    Submitted At:
                  </Typography>
                  <Typography variant='body2'>
                    {new Date(submissionResult.submittedAt).toLocaleString()}
                  </Typography>

                  <Typography variant='caption' color='text.secondary'>
                    Est. Review Time:
                  </Typography>
                  <Typography variant='body2'>
                    {submissionResult.estimatedReviewTime}
                  </Typography>
                </Box>

                <Button
                  size='small'
                  onClick={() => setShowStatusTracker(true)}
                  startIcon={<InfoIcon />}
                  sx={{ mt: 1 }}
                >
                  Show Status Tracker
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Result */}
          {statusResult && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InfoIcon color='info' sx={{ mr: 1 }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Status Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant='caption' color='text.secondary'>
                    Submission ID:
                  </Typography>
                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                    {statusResult.submissionId}
                  </Typography>

                  <Typography variant='caption' color='text.secondary'>
                    Current Status:
                  </Typography>
                  <Chip
                    label={statusResult.currentStatus
                      .replace('_', ' ')
                      .toUpperCase()}
                    color={getStatusColor(statusResult.currentStatus)}
                    size='small'
                  />

                  {statusResult.submittedAt && (
                    <>
                      <Typography variant='caption' color='text.secondary'>
                        Submitted At:
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(statusResult.submittedAt).toLocaleString()}
                      </Typography>
                    </>
                  )}

                  {statusResult.reviewStartedAt && (
                    <>
                      <Typography variant='caption' color='text.secondary'>
                        Review Started:
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(
                          statusResult.reviewStartedAt
                        ).toLocaleString()}
                      </Typography>
                    </>
                  )}

                  {statusResult.completedAt && (
                    <>
                      <Typography variant='caption' color='text.secondary'>
                        Completed At:
                      </Typography>
                      <Typography variant='body2'>
                        {new Date(statusResult.completedAt).toLocaleString()}
                      </Typography>
                    </>
                  )}

                  {statusResult.reviewerNotes && (
                    <>
                      <Typography variant='caption' color='text.secondary'>
                        Reviewer Notes:
                      </Typography>
                      <Typography variant='body2'>
                        {statusResult.reviewerNotes}
                      </Typography>
                    </>
                  )}
                </Box>

                {statusResult.requiredActions &&
                  statusResult.requiredActions.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        gutterBottom
                      >
                        Required Actions:
                      </Typography>
                      <List dense>
                        {statusResult.requiredActions.map((action, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemText
                              primary={
                                <Typography variant='body2'>
                                  • {action}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                <Button
                  size='small'
                  onClick={() => setShowStatusTracker(true)}
                  startIcon={<InfoIcon />}
                  sx={{ mt: 1 }}
                >
                  Show Full Status Tracker
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Console Output Info */}
          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2'>
              <strong>Check Browser Console:</strong> Detailed API
              request/response logs are available in the browser developer
              console.
            </Typography>
          </Alert>

          {/* Status Tracker */}
          {showStatusTracker && testStoreId && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Live Status Tracker
                </Typography>
                <Button
                  size='small'
                  onClick={() => setShowStatusTracker(false)}
                >
                  Hide
                </Button>
              </Box>
              <ApplicationStatusTracker
                storeId={parseInt(testStoreId)}
                submissionId={submissionResult?.submissionId}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TestStoreSubmission;
