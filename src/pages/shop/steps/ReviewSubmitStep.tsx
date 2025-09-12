import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  Avatar,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Agriculture as FarmIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  type StepProps,
  SELLING_METHODS,
  PAYMENT_METHODS_OPTIONS,
} from '../../../types/open-shop.types';
import toast from 'react-hot-toast';

interface ReviewSubmitStepProps extends StepProps {
  onComplete: () => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  formState,
  updateFormState,
  onPrevious,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTermsChange = (checked: boolean) => {
    updateFormState({
      agreedToTerms: checked,
    });
  };

  const handleSubmit = async () => {
    if (!formState.agreedToTerms) {
      toast.error('Please agree to the Terms and Conditions');
      return;
    }

    setIsSubmitting(true);
    try {
      // All API calls have been made in previous steps
      // This is just for final submission confirmation
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate processing

      toast.success('Store application submitted successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'Not set';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSellingMethodLabel = (method: string) => {
    const found = SELLING_METHODS.find((m) => m.value === method);
    return found ? found.label : method;
  };

  const renderStoreBasics = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <StoreIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Store Information
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant='body2' color='text.secondary'>
              Store Name
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {formState.storeBasics.storeName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant='body2' color='text.secondary'>
              Store ID
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              #{formState.storeId}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant='body2' color='text.secondary'>
              Description
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {formState.storeBasics.description}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderLocationInfo = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Location & Logistics
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Business Address */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant='subtitle1'
            sx={{
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <BusinessIcon sx={{ mr: 1, fontSize: 20 }} />
            Business Address
          </Typography>
          <Typography variant='body2'>
            {formState.locationLogistics.businessAddress.locationName}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {formState.locationLogistics.businessAddress.streetLine}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {formState.locationLogistics.businessAddress.city},{' '}
            {formState.locationLogistics.businessAddress.state}{' '}
            {formState.locationLogistics.businessAddress.zipCode}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Phone: {formState.locationLogistics.businessAddress.contactPhone}
          </Typography>
        </Box>

        {/* Selling Methods */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
            Selling Methods
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formState.locationLogistics.sellingMethods.map((method) => (
              <Chip
                key={method}
                label={getSellingMethodLabel(method)}
                color='primary'
                variant='outlined'
                size='small'
              />
            ))}
          </Box>
        </Box>

        {/* Conditional Address Info */}
        {formState.locationLogistics.sellingMethods.includes(
          'on-farm-pickup'
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <FarmIcon sx={{ mr: 1, fontSize: 18 }} />
              Farmgate Pickup
            </Typography>
            {formState.locationLogistics.farmgateSameAsBusinessAddress ? (
              <Typography variant='body2' color='text.secondary'>
                Same as business address
              </Typography>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                {formState.locationLogistics.farmgateAddress?.streetLine},{' '}
                {formState.locationLogistics.farmgateAddress?.city}
              </Typography>
            )}
          </Box>
        )}

        {formState.locationLogistics.sellingMethods.includes(
          'local-delivery'
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant='subtitle2'
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <DeliveryIcon sx={{ mr: 1, fontSize: 18 }} />
              Local Delivery
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Delivery radius: {formState.locationLogistics.deliveryRadiusMi}{' '}
              miles
            </Typography>
          </Box>
        )}

        {formState.locationLogistics.sellingMethods.includes(
          'farmers-market'
        ) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
              Pickup Point
            </Typography>
            <Typography variant='body2'>
              {formState.locationLogistics.pickupPointNickname ||
                'Farmers Market'}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {formState.locationLogistics.pickupPointAddress?.streetLine},{' '}
              {formState.locationLogistics.pickupPointAddress?.city}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const renderStorePolicies = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ScheduleIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Store Policies
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={3}>
          {/* Store Hours */}
          <Grid item xs={12} md={6}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              Store Hours
            </Typography>
            <List dense>
              {Object.entries(formState.storeHours).map(([day, hours]) => {
                const dayIndex = [
                  'sunday',
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                ].indexOf(day);
                const dayName = DAYS_OF_WEEK[dayIndex];

                return (
                  <ListItem key={day} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {dayName}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {hours.isOpen
                              ? `${formatTime(hours.openTime)} - ${formatTime(hours.closeTime)}`
                              : 'Closed'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12} md={6}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              Accepted Payment Methods
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formState.paymentMethods.selectedMethods.map((method) => (
                <Chip
                  key={method}
                  label={method}
                  color='success'
                  variant='outlined'
                  size='small'
                  icon={<PaymentIcon sx={{ fontSize: 16 }} />}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderBranding = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ImageIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Branding & Visuals
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Store Logo
            </Typography>
            {formState.branding.logoFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>Logo uploaded</Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Store Banner
            </Typography>
            {formState.branding.bannerFile ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>Banner uploaded</Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Gallery Images
            </Typography>
            {formState.branding.galleryFiles &&
            formState.branding.galleryFiles.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>
                  {formState.branding.galleryFiles.length} image(s) uploaded
                </Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderTermsAndConditions = () => (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 3,
        border: '1px solid',
        borderColor: formState.agreedToTerms ? 'success.main' : 'warning.main',
        borderRadius: 2,
      }}
    >
      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
        Terms and Conditions
      </Typography>

      <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          By submitting your store application, you agree to:
        </Typography>
        <List dense sx={{ mt: 1 }}>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 20 }}>
              <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant='body2'>
                  Provide accurate and truthful information about your products
                </Typography>
              }
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 20 }}>
              <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant='body2'>
                  Maintain quality standards and fulfill customer orders
                  promptly
                </Typography>
              }
            />
          </ListItem>
          <ListItem sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 20 }}>
              <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant='body2'>
                  Follow platform guidelines and community standards
                </Typography>
              }
            />
          </ListItem>
        </List>
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={formState.agreedToTerms}
            onChange={(e) => handleTermsChange(e.target.checked)}
            color='primary'
          />
        }
        label={
          <Typography variant='body2'>
            I agree to the{' '}
            <Button
              variant='text'
              size='small'
              sx={{ p: 0, textTransform: 'none', textDecoration: 'underline' }}
              onClick={() => window.open('/terms', '_blank')}
            >
              Seller Terms and Conditions
            </Button>
          </Typography>
        }
      />
    </Paper>
  );

  return (
    <Box>
      <Typography
        variant='h4'
        component='h2'
        gutterBottom
        sx={{ fontWeight: 600, mb: 3 }}
      >
        Review & Submit
      </Typography>

      <Typography variant='body1' color='text.secondary' sx={{ mb: 4 }}>
        Please review all your information before submitting your store
        application.
      </Typography>

      {/* Review Sections */}
      {renderStoreBasics()}
      {renderLocationInfo()}
      {renderStorePolicies()}
      {renderBranding()}

      {/* Terms and Conditions */}
      {renderTermsAndConditions()}

      {/* Submit Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
        }}
      >
        <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
          Ready to Submit?
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Your store application will be reviewed by our team. You'll be
          notified once it's approved.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          <Button
            variant='outlined'
            onClick={onPrevious}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Back to Branding
          </Button>

          <LoadingButton
            variant='contained'
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!formState.agreedToTerms}
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
              },
            }}
          >
            Submit for Review
          </LoadingButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReviewSubmitStep;
