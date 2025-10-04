import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Edit,
  Person,
  Business,
  Email,
  Phone,
  LocationOn,
  History,
  Assignment,
  Visibility
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

// Define all interfaces directly in this component to avoid import issues
interface StoreSubmission {
  submissionId: string;
  storeId: number;
  storeName: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  businessRegistration?: string;
  taxId?: string;
  bankAccountNumber?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewComments?: string;
  assignedReviewerId?: number;
  assignedReviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

enum SubmissionStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
  NEEDS_REVISION = 'needs_revision',
  RESUBMITTED = 'resubmitted'
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface ReviewHistory {
  id: number;
  submissionId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  comments?: string;
  internalNotes?: string;
  performedAt: string;
  oldStatus?: SubmissionStatus;
  newStatus?: SubmissionStatus;
}

interface ReviewFormData {
  action: 'approve' | 'reject' | 'request-revision';
  comments: string;
  internalNotes?: string;
}

interface AssignReviewerFormData {
  reviewerId: number;
  notes?: string;
}

interface StoreReviewRequest {
  comments: string;
  internalNotes?: string;
}

interface AssignReviewerRequest {
  reviewerId: number;
  notes?: string;
}

interface StoreApplicationDetailResponse {
  submission: StoreSubmission;
  history: ReviewHistory[];
  availableReviewers: AdminUser[];
}

interface ReviewActionResponse {
  success: boolean;
  message: string;
  updatedSubmission: StoreSubmission;
}

// API functions defined locally
const storeApplicationsApi = {
  async getStoreApplicationDetail(submissionId: string): Promise<StoreApplicationDetailResponse> {
    return await apiService.get<StoreApplicationDetailResponse>(`/api/admin/store-applications/${submissionId}`);
  },

  async approveApplication(submissionId: string, request: StoreReviewRequest): Promise<ReviewActionResponse> {
    return await apiService.post<ReviewActionResponse>(`/api/admin/store-applications/${submissionId}/approve`, {
      reviewNotes: request.comments,
      internalNotes: request.internalNotes
    });
  },

  async rejectApplication(submissionId: string, request: StoreReviewRequest): Promise<ReviewActionResponse> {
    return await apiService.post<ReviewActionResponse>(`/api/admin/store-applications/${submissionId}/reject`, {
      reviewNotes: request.comments,
      internalNotes: request.internalNotes
    });
  },

  async requestRevision(submissionId: string, request: StoreReviewRequest): Promise<ReviewActionResponse> {
    return await apiService.post<ReviewActionResponse>(`/api/admin/store-applications/${submissionId}/request-revision`, {
      reviewNotes: request.comments,
      internalNotes: request.internalNotes
    });
  },

  async assignReviewer(submissionId: string, request: AssignReviewerRequest): Promise<ReviewActionResponse> {
    return await apiService.post<ReviewActionResponse>(`/api/admin/store-applications/${submissionId}/assign-reviewer`, request);
  }
};

const StoreApplicationReview: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Authentication guard - check if user is authenticated as admin
  useEffect(() => {
    // Check if user has admin role (handle both string and array cases for backward compatibility)
    const hasAdminRole = user?.userType === 'Admin' ||
                        (Array.isArray(user?.userType) && user?.userType.includes('Admin'));

    console.log('🔍 StoreApplicationReview Auth Guard Debug:', {
      isAuthenticated,
      user,
      userType: user?.userType,
      hasAdminRole,
      submissionId,
      shouldRedirect: !isAuthenticated || !user || !hasAdminRole
    });

    if (!isAuthenticated || !user || !hasAdminRole) {
      console.log('❌ Not authenticated as admin, redirecting to auth page');
      navigate(`/admin/auth/${submissionId}`);
    } else {
      console.log('✅ Authenticated as admin, staying on page');
    }
  }, [isAuthenticated, user, submissionId, navigate]);

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({
    action: 'approve',
    comments: '',
    internalNotes: ''
  });
  const [assignFormData, setAssignFormData] = useState<AssignReviewerFormData>({
    reviewerId: 0,
    notes: ''
  });

  // Fetch application details
  const {
    data: applicationData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['store-application', submissionId],
    queryFn: () => storeApplicationsApi.getStoreApplicationDetail(submissionId!),
    enabled: !!submissionId
  });

  // Review mutations
  const reviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      if (!submissionId) throw new Error('No submission ID');

      switch (data.action) {
        case 'approve':
          return storeApplicationsApi.approveApplication(submissionId, {
            comments: data.comments,
            internalNotes: data.internalNotes
          });
        case 'reject':
          return storeApplicationsApi.rejectApplication(submissionId, {
            comments: data.comments,
            internalNotes: data.internalNotes
          });
        case 'request-revision':
          return storeApplicationsApi.requestRevision(submissionId, {
            comments: data.comments,
            internalNotes: data.internalNotes
          });
        default:
          throw new Error('Invalid action');
      }
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Review action completed successfully');
      setReviewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['store-application', submissionId] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to process review');
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (data: AssignReviewerFormData) => {
      if (!submissionId) throw new Error('No submission ID');
      return storeApplicationsApi.assignReviewer(submissionId, data);
    },
    onSuccess: (response) => {
      toast.success('Reviewer assigned successfully');
      setAssignDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['store-application', submissionId] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign reviewer');
    }
  });

  // Check authentication after all hooks are called
  const hasAdminRole = user?.userType === 'Admin' ||
                      (Array.isArray(user?.userType) && user?.userType.includes('Admin'));

  if (!isAuthenticated || !user || !hasAdminRole) {
    console.log('⏹️ Not rendering StoreApplicationReview - not authenticated as admin');
    return <div>Redirecting to admin authentication...</div>;
  }

  const getStatusColor = (status: SubmissionStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!status) return 'default';
    switch (status) {
      case SubmissionStatus.SUBMITTED:
        return 'primary';
      case SubmissionStatus.PENDING:
        return 'warning';
      case SubmissionStatus.UNDER_REVIEW:
        return 'info';
      case SubmissionStatus.APPROVED:
        return 'success';
      case SubmissionStatus.REJECTED:
        return 'error';
      case SubmissionStatus.REVISION_REQUESTED:
        return 'secondary';
      case SubmissionStatus.NEEDS_REVISION:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SubmissionStatus): string => {
    if (!status) return 'Unknown';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionLabel = (action: string | null | undefined): string => {
    if (!action) return 'Unknown Action';
    return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleReviewAction = (action: 'approve' | 'reject' | 'request-revision') => {
    setReviewFormData({
      action,
      comments: '',
      internalNotes: ''
    });
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewFormData.comments.trim()) {
      toast.error('Comments are required');
      return;
    }
    reviewMutation.mutate(reviewFormData);
  };

  const handleAssignReviewer = () => {
    if (!assignFormData.reviewerId) {
      toast.error('Please select a reviewer');
      return;
    }
    assignMutation.mutate(assignFormData);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !applicationData) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load application details. Please try again.
        </Alert>
      </Box>
    );
  }

  const { submission, history, availableReviewers } = applicationData;

  if (!submission) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Submission data is missing. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate('/admin/store-applications')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1">
            Store Application Review
          </Typography>
        </Box>
        <Chip
          label={getStatusLabel(submission.status)}
          color={getStatusColor(submission.status)}
          size="large"
        />
      </Box>

      <Grid container spacing={3}>
        {/* Application Details */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Business sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5">{submission.storeName}</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Store Information</Typography>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center">
                      <Business sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Store:</strong> {submission.storeName}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Address:</strong> {submission.address}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Phone sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Phone:</strong> {submission.phoneNumber}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Email sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Email:</strong> {submission.email}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Owner Information</Typography>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Owner:</strong> {submission.ownerName}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Email sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Email:</strong> {submission.ownerEmail}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Phone sx={{ mr: 1, fontSize: 20 }} />
                      <Typography><strong>Phone:</strong> {submission.ownerPhone}</Typography>
                    </Box>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Description</Typography>
                  <Typography color="text.secondary">
                    {submission.description || 'No description provided'}
                  </Typography>
                </Grid>

                {(submission.businessRegistration || submission.taxId || submission.bankAccountNumber) && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Business Details</Typography>
                    <Stack spacing={1}>
                      {submission.businessRegistration && (
                        <Typography><strong>Business Registration:</strong> {submission.businessRegistration}</Typography>
                      )}
                      {submission.taxId && (
                        <Typography><strong>Tax ID:</strong> {submission.taxId}</Typography>
                      )}
                      {submission.bankAccountNumber && (
                        <Typography><strong>Bank Account:</strong> {submission.bankAccountNumber}</Typography>
                      )}
                    </Stack>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Submission Details</Typography>
                  <Stack spacing={1}>
                    <Typography>
                      <strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                    </Typography>
                    <Typography>
                      <strong>Submission ID:</strong> {submission.submissionId}
                    </Typography>
                    {submission.assignedReviewerName && (
                      <Typography>
                        <strong>Assigned Reviewer:</strong> {submission.assignedReviewerName}
                      </Typography>
                    )}
                    {submission.reviewedAt && submission.reviewerName && (
                      <>
                        <Typography>
                          <strong>Reviewed By:</strong> {submission.reviewerName}
                        </Typography>
                        <Typography>
                          <strong>Reviewed At:</strong> {new Date(submission.reviewedAt).toLocaleString()}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Grid>

                {submission.reviewComments && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Previous Review Comments</Typography>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography>{submission.reviewComments}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Actions</Typography>

              {submission.status === SubmissionStatus.SUBMITTED || submission.status === SubmissionStatus.PENDING || submission.status === SubmissionStatus.UNDER_REVIEW ? (
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleReviewAction('approve')}
                    fullWidth
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleReviewAction('reject')}
                    fullWidth
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<Edit />}
                    onClick={() => handleReviewAction('request-revision')}
                    fullWidth
                  >
                    Request Revision
                  </Button>
                  <Divider />
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    onClick={() => setAssignDialogOpen(true)}
                    fullWidth
                  >
                    Assign Reviewer
                  </Button>
                </Stack>
              ) : (
                <Alert severity="info">
                  This application has been {submission.status?.toLowerCase().replace('_', ' ')}.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Review History */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <History sx={{ mr: 1 }} />
                <Typography variant="h6">Review History</Typography>
              </Box>

              {history && history.length > 0 ? (
                <List dense>
                  {history.map((item, index) => (
                    <ListItem key={index} divider={index < history.length - 1}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                          {item.performedByName?.charAt(0) || '?'}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={getActionLabel(item.action)}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {item.performedByName} • {new Date(item.performedAt).toLocaleString()}
                            </Typography>
                            {item.comments && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {item.comments}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">No history available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {reviewFormData.action === 'approve' && 'Approve Application'}
          {reviewFormData.action === 'reject' && 'Reject Application'}
          {reviewFormData.action === 'request-revision' && 'Request Revision'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Comments (Required)"
            multiline
            rows={4}
            value={reviewFormData.comments}
            onChange={(e) => setReviewFormData({ ...reviewFormData, comments: e.target.value })}
            placeholder="Please provide detailed comments for your decision..."
            sx={{ mb: 2, mt: 1 }}
            required
          />
          <TextField
            fullWidth
            label="Internal Notes (Optional)"
            multiline
            rows={3}
            value={reviewFormData.internalNotes}
            onChange={(e) => setReviewFormData({ ...reviewFormData, internalNotes: e.target.value })}
            placeholder="Internal notes for administrative use..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={reviewMutation.isPending || !reviewFormData.comments.trim()}
          >
            {reviewMutation.isPending ? 'Processing...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Reviewer Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Reviewer</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>Select Reviewer</InputLabel>
            <Select
              value={assignFormData.reviewerId}
              onChange={(e) => setAssignFormData({ ...assignFormData, reviewerId: Number(e.target.value) })}
              label="Select Reviewer"
            >
              <MenuItem value={0}>Select a reviewer...</MenuItem>
              {availableReviewers.map((reviewer) => (
                <MenuItem key={reviewer.id} value={reviewer.id}>
                  {reviewer.name} ({reviewer.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Assignment Notes (Optional)"
            multiline
            rows={3}
            value={assignFormData.notes}
            onChange={(e) => setAssignFormData({ ...assignFormData, notes: e.target.value })}
            placeholder="Notes about this assignment..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAssignReviewer}
            variant="contained"
            disabled={assignMutation.isPending || !assignFormData.reviewerId}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Reviewer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreApplicationReview;
