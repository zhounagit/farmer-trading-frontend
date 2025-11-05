import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Edit,
  Visibility,
  OpenInNew,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../../../shared/services/api-service';
import { StoresApiService } from '../../../features/stores/services/storesApi';
import { useAuth } from '../../../contexts/AuthContext';
import { isAdminUser } from '../../../utils/userTypeUtils';

// Interfaces
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Array<{ code?: string; message: string }>;
}

interface StoreSubmission {
  submissionId: string;
  storeId: number;
  storeName: string;
  status: string;
  submittedAt: string;
  ownerName: string;
  ownerEmail: string;
  address: string;
  phoneNumber: string;
  description?: string;
  reviewComments?: string;
}

interface StoreDetails {
  storeId: number;
  storeName: string;
  slug: string;
  description: string;
  isPublished: boolean;
}

interface ReviewActionRequest {
  reviewNotes?: string;
  requiredActions?: string[];
}

// API functions
const storeApplicationsApi = {
  async getStoreApplicationDetail(
    submissionId: string
  ): Promise<StoreSubmission> {
    console.log('🔍 Fetching store application detail:', submissionId);
    console.log(
      '📡 API endpoint:',
      `/api/admin/store-applications/${submissionId}`
    );

    try {
      const response = await apiService.get<ApiResponse<StoreSubmission>>(
        `/api/admin/store-applications/${submissionId}`
      );
      console.log('✅ Store application API response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Store application API error:', error);
      throw error;
    }
  },

  async getStoreDetails(storeId: number): Promise<StoreDetails> {
    console.log('🔍 Fetching store details:', storeId);
    try {
      const response = await StoresApiService.getEnhancedStoreById(storeId);
      console.log('✅ Store details API response:', response);
      // Transform the enhanced response to our expected interface
      return {
        storeId: response.storeId,
        storeName: response.storeName,
        slug: response.slug || '',
        description: response.description || '',
        isPublished: false, // storefrontInfo property doesn't exist on Store type
      };
    } catch (error) {
      console.error('❌ Store details API error:', error);
      throw error;
    }
  },

  async approveSubmission(
    submissionId: string,
    request: ReviewActionRequest
  ): Promise<{ message: string }> {
    console.log('✅ Approving submission:', submissionId, request);
    try {
      const response = await apiService.post<ApiResponse<any>>(
        `/api/admin/store-applications/${submissionId}/approve`,
        request.reviewNotes || ''
      );
      console.log('✅ Approve submission response:', response);
      return {
        message:
          response?.message ||
          response?.data?.message ||
          'Store application approved successfully',
      };
    } catch (error) {
      console.error('❌ Approve submission error:', error);
      throw error;
    }
  },

  async rejectSubmission(
    submissionId: string,
    request: ReviewActionRequest
  ): Promise<{ message: string }> {
    console.log('❌ Rejecting submission:', submissionId, request);
    try {
      const response = await apiService.post<ApiResponse<any>>(
        `/api/admin/store-applications/${submissionId}/reject`,
        request.reviewNotes || ''
      );
      console.log('✅ Reject submission response:', response);
      return {
        message:
          response?.message ||
          response?.data?.message ||
          'Store application rejected successfully',
      };
    } catch (error) {
      console.error('❌ Reject submission error:', error);
      throw error;
    }
  },

  async requestRevision(
    submissionId: string,
    request: ReviewActionRequest
  ): Promise<{ message: string }> {
    console.log('📝 Requesting revision:', submissionId, request);
    try {
      const response = await apiService.post<ApiResponse<any>>(
        `/api/admin/store-applications/${submissionId}/request-revision`,
        request
      );
      console.log('✅ Request revision response:', response);
      return { message: response.message || 'Revision requested successfully' };
    } catch (error) {
      console.error('❌ Request revision error:', error);
      throw error;
    }
  },
};

const StoreApplicationReview: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // State for action dialogs
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject' | 'revision' | null;
    open: boolean;
  }>({ type: null, open: false });
  const [reviewNotes, setReviewNotes] = useState('');
  const [requiredActions, setRequiredActions] = useState<string[]>([]);

  // Available revision actions
  const availableRevisionActions = [
    'Update business information',
    'Provide additional documentation',
    'Clarify store description',
    'Update contact details',
    'Provide proof of business registration',
    'Update store photos/logo',
    'Clarify operating hours',
    'Update payment methods',
  ];

  // Authentication guard
  useEffect(() => {
    const hasAdminRole = isAdminUser(user?.userType);

    console.log('🔍 StoreApplicationReview Auth Guard Debug:', {
      isAuthenticated,
      user,
      userType: user?.userType,
      hasAdminRole,
      submissionId,
      shouldRedirect: !isAuthenticated || !user || !hasAdminRole,
    });

    if (!isAuthenticated || !user || !hasAdminRole) {
      console.log('❌ Not authenticated as admin, redirecting to auth page');
      navigate(`/admin/auth/${submissionId}`);
    } else {
      console.log('✅ Authenticated as admin, staying on page');
    }
  }, [isAuthenticated, user, submissionId, navigate]);

  // Fetch application details
  const {
    data: applicationData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['store-application', submissionId],
    queryFn: () => {
      console.log('🚀 Query function called for submissionId:', submissionId);
      return StoresApiService.getStoreApplicationDetail(submissionId!);
    },
    enabled: !!submissionId,
    retry: 1,
  });

  // Fetch store details for the store link
  const { data: storeDetails, isLoading: storeLoading } = useQuery({
    queryKey: ['store-details', applicationData?.storeId],
    queryFn: () => {
      if (applicationData?.storeId) {
        return storeApplicationsApi.getStoreDetails(applicationData.storeId);
      }
      return Promise.reject(new Error('No store ID available'));
    },
    enabled: !!applicationData?.storeId,
    retry: 1,
  });

  // Mutations for actions
  const approveMutation = useMutation({
    mutationFn: (request: ReviewActionRequest) =>
      storeApplicationsApi.approveSubmission(submissionId!, request),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['store-application', submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ['store-applications'] });
      setActionDialog({ type: null, open: false });
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve submission');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (request: ReviewActionRequest) =>
      storeApplicationsApi.rejectSubmission(submissionId!, request),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['store-application', submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ['store-applications'] });
      setActionDialog({ type: null, open: false });
      setReviewNotes('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject submission');
    },
  });

  const revisionMutation = useMutation({
    mutationFn: (request: ReviewActionRequest) =>
      storeApplicationsApi.requestRevision(submissionId!, request),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['store-application', submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ['store-applications'] });
      setActionDialog({ type: null, open: false });
      setReviewNotes('');
      setRequiredActions([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to request revision');
    },
  });

  // Check authentication after all hooks are called
  const hasAdminRole = isAdminUser(user?.userType);

  if (!isAuthenticated || !user || !hasAdminRole) {
    console.log(
      '⏹️ Not rendering StoreApplicationReview - not authenticated as admin'
    );
    return <div>Redirecting to admin authentication...</div>;
  }

  const getStatusColor = (
    status: string
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'submitted':
      case 'pending':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'revision_requested':
      case 'needs_revision':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string): string => {
    if (!status) return 'Unknown';
    return status
      .replace('_', ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const handleActionClick = (type: 'approve' | 'reject' | 'revision') => {
    setActionDialog({ type, open: true });
    setReviewNotes('');
    setRequiredActions([]);
  };

  const handleActionSubmit = () => {
    if (!reviewNotes.trim() && actionDialog.type !== 'approve') {
      toast.error('Review notes are required');
      return;
    }

    if (actionDialog.type === 'revision' && requiredActions.length === 0) {
      toast.error('Please select at least one required action for revision');
      return;
    }

    const request: ReviewActionRequest = {
      reviewNotes: reviewNotes.trim(),
      ...(actionDialog.type === 'revision' && { requiredActions }),
    };

    switch (actionDialog.type) {
      case 'approve':
        approveMutation.mutate(request);
        break;
      case 'reject':
        rejectMutation.mutate(request);
        break;
      case 'revision':
        revisionMutation.mutate(request);
        break;
    }
  };

  const handleCloseDialog = () => {
    setActionDialog({ type: null, open: false });
    setReviewNotes('');
    setRequiredActions([]);
  };

  const handleRequiredActionChange = (action: string, checked: boolean) => {
    setRequiredActions((prev) => {
      if (checked) {
        return [...prev, action];
      } else {
        return prev.filter((a) => a !== action);
      }
    });
  };

  const getStorefrontUrl = (slug: string) => {
    // Use the storefront URL pattern from the routes
    return `/store/${slug}`;
  };

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading application details...</Typography>
      </Box>
    );
  }

  if (error) {
    console.error('❌ Application data error:', error);
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load application details:{' '}
          {(error as Error)?.message || 'Unknown error'}
          <br />
          <Button onClick={() => refetch()} sx={{ mt: 1 }}>
            Try Again
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!applicationData) {
    return (
      <Box p={3}>
        <Alert severity='warning'>
          No application data received. Please check if the application ID is
          correct.
          <br />
          <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
            Submission ID: {submissionId}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Handle different response structures
  const submission = applicationData;

  if (!submission) {
    console.warn('⚠️ No submission data in response:', applicationData);
    return (
      <Box p={3}>
        <Alert severity='error'>
          Submission data is missing from the API response. Please try again.
          <br />
          <Typography variant='caption' sx={{ mt: 1, display: 'block' }}>
            Raw response: {JSON.stringify(applicationData, null, 2)}
          </Typography>
        </Alert>
      </Box>
    );
  }

  const canPerformActions = [
    'submitted',
    'pending',
    'under_review',
    'revision_requested',
    'needs_revision',
  ].includes(submission?.status?.toLowerCase());

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        mb={3}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
      >
        <Box display='flex' alignItems='center'>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/store-applications')}
            sx={{ mr: 2 }}
          >
            Back to Applications
          </Button>
          <Typography variant='h4' component='h1'>
            Store Application Review
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={2}>
          {/* Store View Link */}
          {storeDetails?.slug && (
            <Button
              variant='outlined'
              startIcon={<Visibility />}
              endIcon={<OpenInNew />}
              component='a'
              href={getStorefrontUrl(storeDetails.slug)}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ mr: 1 }}
            >
              View Store
            </Button>
          )}
          <Chip
            label={getStatusLabel(submission.status)}
            color={getStatusColor(submission.status)}
            size='medium'
          />
        </Box>
      </Box>

      {/* Store Link Loading State */}
      {storeLoading && (
        <Alert severity='info' sx={{ mb: 2 }}>
          Loading store information...
        </Alert>
      )}

      {/* Application Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='flex-start'
            mb={2}
          >
            <Typography variant='h5' component='h2'>
              {submission?.storeName}
            </Typography>
            {storeDetails && (
              <Box textAlign='right'>
                <Typography variant='body2' color='text.secondary'>
                  Storefront Status:
                </Typography>
                <Chip
                  label={
                    storeDetails.isPublished ? 'Published' : 'Not Published'
                  }
                  color={storeDetails.isPublished ? 'success' : 'default'}
                  size='small'
                />
              </Box>
            )}
          </Box>

          <Stack spacing={2}>
            <Typography>
              <strong>Submission ID:</strong> {submission?.submissionId}
            </Typography>
            <Typography>
              <strong>Store ID:</strong> {submission?.storeId}
            </Typography>
            <Typography>
              <strong>Owner:</strong> {submission.storeName || 'N/A'}
            </Typography>
            <Typography>
              <strong>Email:</strong> {submission.email || 'N/A'}
            </Typography>
            <Typography>
              <strong>Address:</strong> {submission?.address}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {submission?.phoneNumber || 'N/A'}
            </Typography>
            <Typography>
              <strong>Submitted:</strong>{' '}
              {new Date(submission.submittedAt).toLocaleString()}
            </Typography>

            {submission.description && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Description
                </Typography>
                <Typography color='text.secondary'>
                  {submission.description}
                </Typography>
              </Box>
            )}

            {submission.reviewNotes && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Previous Review Comments
                </Typography>
                <Alert severity='info'>{submission.reviewNotes}</Alert>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Actions
          </Typography>

          {canPerformActions ? (
            <Stack direction='row' spacing={2} flexWrap='wrap'>
              <Button
                variant='contained'
                color='success'
                startIcon={<CheckCircle />}
                onClick={() => handleActionClick('approve')}
                disabled={approveMutation.isPending}
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant='contained'
                color='error'
                startIcon={<Cancel />}
                onClick={() => handleActionClick('reject')}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                variant='contained'
                color='warning'
                startIcon={<Edit />}
                onClick={() => handleActionClick('revision')}
                disabled={revisionMutation.isPending}
              >
                {revisionMutation.isPending
                  ? 'Requesting...'
                  : 'Request Revision'}
              </Button>
            </Stack>
          ) : (
            <>
              <Alert severity='info' sx={{ mb: 2 }}>
                This application has already been processed (Status:{' '}
                {getStatusLabel(submission.status)}). No further actions can be
                performed.
              </Alert>

              {submission.status?.toLowerCase() === 'approved' && (
                <Alert severity='warning'>
                  <Typography variant='body2' gutterBottom>
                    <strong>Post-Approval Setup Required</strong>
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    The store has been approved but may need additional setup to
                    be publicly visible:
                  </Typography>
                  <Typography variant='body2' component='div' sx={{ ml: 2 }}>
                    1. Store owner needs to access storefront customization
                    <br />
                    2. Create initial storefront layout and design
                    <br />
                    3. Publish the storefront to make it publicly accessible
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    If the "View Store" button above shows an error, the store
                    owner needs to complete the storefront setup first.
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleCloseDialog}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'approve' && 'Approve Store Application'}
          {actionDialog.type === 'reject' && 'Reject Store Application'}
          {actionDialog.type === 'revision' && 'Request Revision'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={
                actionDialog.type === 'approve'
                  ? 'Approval Notes (Optional)'
                  : 'Review Notes *'
              }
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder={
                actionDialog.type === 'approve'
                  ? 'Add any approval notes...'
                  : actionDialog.type === 'reject'
                    ? 'Explain the reasons for rejection...'
                    : 'Explain what needs to be revised...'
              }
              sx={{ mb: 2 }}
            />

            {actionDialog.type === 'revision' && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Required Actions *
                </Typography>
                <FormGroup>
                  {availableRevisionActions.map((action) => (
                    <FormControlLabel
                      key={action}
                      control={
                        <Checkbox
                          checked={requiredActions.includes(action)}
                          onChange={(e) =>
                            handleRequiredActionChange(action, e.target.checked)
                          }
                        />
                      }
                      label={action}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleActionSubmit}
            variant='contained'
            color={
              actionDialog.type === 'approve'
                ? 'success'
                : actionDialog.type === 'reject'
                  ? 'error'
                  : 'warning'
            }
            disabled={
              approveMutation.isPending ||
              rejectMutation.isPending ||
              revisionMutation.isPending
            }
          >
            {actionDialog.type === 'approve' && 'Approve Application'}
            {actionDialog.type === 'reject' && 'Reject Application'}
            {actionDialog.type === 'revision' && 'Request Revision'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Debug Information */}
      <Card sx={{ mt: 3, bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Debug Information
          </Typography>
          <Typography
            variant='caption'
            component='pre'
            sx={{ fontSize: '0.75rem' }}
          >
            {JSON.stringify(
              {
                submissionId,
                applicationData,
                storeDetails,
                canPerformActions,
              },
              null,
              2
            )}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StoreApplicationReview;
