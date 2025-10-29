import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, Refresh } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../../shared/services/api-service';
import { useAuth } from '../../../contexts/AuthContext';

// Define interfaces locally to avoid import issues
enum SubmissionStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_REQUESTED = 'revision_requested',
  RESUBMITTED = 'resubmitted',
}

interface StoreSubmission {
  submissionId: string;
  storeId: number;
  storeName: string;
  description: string;
  address: string;
  phoneNumber: string;
  email: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerName?: string;
  assignedReviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Array<{ code?: string; message: string }>;
}

interface StoreApplicationsResponse {
  applications: StoreSubmission[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Simple API function
const getStoreApplications = async (): Promise<StoreApplicationsResponse> => {
  const response = await apiService.get<ApiResponse<StoreSubmission[]>>(
    '/api/admin/store-applications/pending'
  );
  return {
    applications: response.data || [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      pageSize: response.data?.length || 0,
      totalItems: response.data?.length || 0,
      hasNext: false,
      hasPrevious: false,
    },
  };
};

const StoreApplicationsList: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Authentication guard - redirect to login if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.userType !== 'Admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Don't render if not authenticated as admin
  if (!isAuthenticated || !user || user.userType !== 'Admin') {
    return null;
  }

  // Fetch applications
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['store-applications'],
    queryFn: getStoreApplications,
  });

  const getStatusColor = (
    status: SubmissionStatus
  ):
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning' => {
    switch (status) {
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
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: SubmissionStatus): string => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleViewApplication = (submissionId: string) => {
    navigate(`/admin/store-applications/${submissionId}`);
  };

  const applications = applicationsData?.applications || [];

  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='400px'
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity='error'>
          Failed to load store applications. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box
        mb={3}
        display='flex'
        alignItems='center'
        justifyContent='space-between'
      >
        <Typography variant='h4' component='h1'>
          Store Applications
        </Typography>
        <Button
          variant='outlined'
          startIcon={<Refresh />}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Box>

      {/* Applications Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Assigned Reviewer</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((application) => (
                  <TableRow key={application.submissionId} hover>
                    <TableCell>
                      <Stack>
                        <Typography variant='subtitle2' fontWeight='medium'>
                          {application.storeName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          ID: {application.submissionId}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack>
                        <Typography variant='body2'>
                          {application.ownerName}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {application.ownerEmail}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(application.status)}
                        color={getStatusColor(application.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {new Date(application.submittedAt).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {application.assignedReviewerName ? (
                        <Chip
                          label={application.assignedReviewerName}
                          variant='outlined'
                          size='small'
                        />
                      ) : (
                        <Typography variant='body2' color='text.secondary'>
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Details'>
                        <IconButton
                          size='small'
                          onClick={() =>
                            handleViewApplication(application.submissionId)
                          }
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <Typography color='text.secondary' py={4}>
                      No applications found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default StoreApplicationsList;
