import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  Support as SupportIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  TrackChanges as TrackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { useAuth } from '@/contexts/AuthContext';

interface SuccessStepProps {
  storeId?: number;
  submissionId?: string;
  submissionStatus?: string;
  submittedAt?: string;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  storeId,
  submissionId,
  submissionStatus,
  submittedAt,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
      >
        <Avatar
          sx={{
            width: 120,
            height: 120,
            mx: 'auto',
            mb: 3,
            bgcolor: 'success.main',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60 }} />
        </Avatar>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Typography
          variant='h3'
          component='h1'
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'success.main',
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
          }}
        >
          Congratulations!
        </Typography>

        <Typography
          variant='h5'
          component='h2'
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 3,
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
          }}
        >
          Your store application has been submitted!
        </Typography>

        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 2, lineHeight: 1.6 }}
        >
          Thank you for joining our farming community! Our team will review your
          application and get back to you shortly. You'll receive an email
          notification once it's approved.
        </Typography>

        {/* Submission Details */}
        {(submissionId || submittedAt) && (
          <Paper
            elevation={1}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundColor: 'success.50',
              border: '1px solid',
              borderColor: 'success.200',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssignmentIcon sx={{ mr: 2, color: 'success.main' }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: 'success.main' }}
              >
                Application Details
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {submissionId && (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Submission ID
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {submissionId}
                  </Typography>
                </Box>
              )}

              {storeId && (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Store ID
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    #{storeId}
                  </Typography>
                </Box>
              )}

              {submittedAt && (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Submitted At
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {format(new Date(submittedAt), 'MMM dd, yyyy h:mm a')}
                  </Typography>
                </Box>
              )}

              {submissionStatus && (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Status
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 500, textTransform: 'capitalize' }}
                  >
                    {submissionStatus.replace('_', ' ')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        )}
      </motion.div>

      {/* Tabs for What's Next and Status Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Paper
          elevation={2}
          sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label='success step tabs'
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<ScheduleIcon />}
              label="What's Next"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
            {storeId && (
              <Tab
                icon={<TrackIcon />}
                label='Track Status'
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            )}
          </Tabs>

          {/* What's Next Tab */}
          {tabValue === 0 && (
            <Box sx={{ p: 4, textAlign: 'left' }}>
              <Typography
                variant='h6'
                gutterBottom
                sx={{
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
                What happens next?
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <EmailIcon color='primary' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Email Confirmation'
                    secondary="You'll receive a confirmation email with your application details"
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <NotificationsIcon color='primary' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Review Process'
                    secondary='Our team will review your application within 1-2 business days'
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <CheckCircleIcon color='success' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Store Activation'
                    secondary='Once approved, your store will be live and ready for customers'
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DashboardIcon color='primary' />
                  </ListItemIcon>
                  <ListItemText
                    primary='Manage Your Store'
                    secondary='Access your store dashboard to add products and manage orders'
                  />
                </ListItem>
              </List>
            </Box>
          )}

          {/* Status Tracking Tab */}
          {tabValue === 1 && storeId && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='body1' color='text.secondary'>
                Status tracking feature coming soon
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SupportIcon sx={{ mr: 2, color: 'info.main' }} />
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Need Help?
            </Typography>
          </Box>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Have questions about your application or need assistance getting
            started? Our support team is here to help!
          </Typography>

          <Button
            variant='outlined'
            color='info'
            href='mailto:support@farmertrading.com'
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Contact Support
          </Button>
        </Paper>
      </motion.div>

      <Divider sx={{ mb: 4 }} />

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant='contained'
            onClick={handleGoToDashboard}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              minWidth: 180,
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            variant='outlined'
            onClick={handleGoToHome}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              minWidth: 180,
            }}
          >
            Back to Home
          </Button>
        </Box>
      </motion.div>

      {/* Application ID */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{
            mt: 4,
            display: 'block',
            fontSize: '0.8rem',
          }}
        >
          Application submitted on{' '}
          {submittedAt
            ? format(new Date(submittedAt), 'MMMM dd, yyyy')
            : new Date().toLocaleDateString()}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default SuccessStep;
