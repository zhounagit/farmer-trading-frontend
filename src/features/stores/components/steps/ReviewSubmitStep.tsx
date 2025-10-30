import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
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
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Handshake as HandshakeIcon,
  Business as BusinessIcon,
  LocalShipping as DeliveryIcon,
  Agriculture as FarmIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../../../../contexts/AuthContext';
import { consolidateBusinessHours } from '../../../../utils/businessHours';
import type { StoreOpenHours } from '@features/stores/services/open-shop.types';
import { useNavigate } from 'react-router-dom';
import {
  type StepProps,
  SELLING_METHODS,
  type StoreSubmissionRequest,
} from '@features/stores/services/open-shop.types';
import OpenShopApiService from '../../services/open-shop.api';
import toast from 'react-hot-toast';

interface ReviewSubmitStepProps extends StepProps {
  onComplete: () => void;
}

const ReviewSubmitStep: React.FC<ReviewSubmitStepProps> = ({
  formState,
  updateFormState,
  onPrevious,
  onComplete,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if partnership section should be shown
  const shouldShowPartnershipSection = () => {
    const storeType = formState.storeBasics?.setupFlow?.derivedStoreType;
    return storeType === 'producer' || storeType === 'processor';
  };

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

    if (!formState.storeId) {
      toast.error('Store ID not found. Please complete previous steps.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('=== SUBMITTING STORE FOR REVIEW ===');
      console.log('Store ID:', formState.storeId);
      console.log('Form State:', formState);

      // Prepare submission request
      const submissionRequest: StoreSubmissionRequest = {
        storeId: Number(formState.storeId) || 0,
        agreedToTermsAt: new Date().toISOString(),
        termsVersion: '1.0.0',
        submissionNotes: `Store application for ${formState.storeBasics.storeName}`,
      };

      // Submit store for review using standardized API service
      const response = await OpenShopApiService.submitStore(submissionRequest);

      console.log('✅ Store submitted successfully:', response);

      // Update form state with submission details
      updateFormState({
        submissionId: response.submissionId,
        submissionStatus: response.status,
        submittedAt: response.submittedAt,
      });

      toast.success('Store application submitted successfully!');
      onComplete();
    } catch (error: unknown) {
      console.error('Submission error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to submit application. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time?: string): string => {
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

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <Typography variant='body2' color='text.secondary'>
              Store Name
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {formState.storeBasics.storeName}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
            <Typography variant='body2' color='text.secondary'>
              Store ID
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              #{formState.storeId}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Description
            </Typography>
            <Typography variant='body1' sx={{ fontWeight: 500 }}>
              {formState.storeBasics.description}
            </Typography>
          </Box>
        </Box>
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
            {formState.locationLogistics.businessAddress.streetAddress}
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
        {formState.locationLogistics.sellingMethods.includes('pickup') && (
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
              {formState.storeBasics?.setupFlow?.derivedStoreType ===
                'producer' &&
              formState.storeBasics?.categories?.includes('Live Animals')
                ? 'Processor Partner Pickup'
                : 'Pickup Location'}
            </Typography>
            {formState.storeBasics?.setupFlow?.derivedStoreType ===
              'producer' &&
            formState.storeBasics?.categories?.includes('Live Animals') ? (
              <Typography variant='body2' color='text.secondary'>
                Customers will pick up processed products from your processor
                partner's designated pickup location
              </Typography>
            ) : formState.locationLogistics.pickupPointSameAsBusinessAddress ? (
              <Typography variant='body2' color='text.secondary'>
                Same as business address
              </Typography>
            ) : (
              <>
                <Typography variant='body2' color='text.secondary'>
                  {formState.locationLogistics.pickupPointAddress
                    ?.locationName && (
                    <>
                      {
                        formState.locationLogistics.pickupPointAddress
                          .locationName
                      }
                      <br />
                    </>
                  )}
                  {
                    formState.locationLogistics.pickupPointAddress
                      ?.streetAddress
                  }
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {formState.locationLogistics.pickupPointAddress?.city},{' '}
                  {formState.locationLogistics.pickupPointAddress?.state}{' '}
                  {formState.locationLogistics.pickupPointAddress?.zipCode}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Phone:{' '}
                  {formState.locationLogistics.pickupPointAddress?.contactPhone}
                </Typography>
              </>
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
      </CardContent>
    </Card>
  );

  const renderPartnerships = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HandshakeIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Partnerships
          </Typography>
        </Box>

        {formState.partnerships?.selectedPartnerIds &&
        formState.partnerships.selectedPartnerIds.length > 0 ? (
          <Box>
            <Typography variant='body2' sx={{ mb: 2 }}>
              You have selected{' '}
              {formState.partnerships.selectedPartnerIds.length} partner
              {formState.partnerships.selectedPartnerIds.length > 1 ? 's' : ''}:
            </Typography>
            <List dense>
              {formState.partnerships.potentialPartners
                ?.filter((partner) =>
                  formState.partnerships.selectedPartnerIds.includes(
                    partner.storeId
                  )
                )
                .map((partner) => (
                  <ListItem key={partner.storeId} disablePadding sx={{ mb: 1 }}>
                    <ListItemText
                      primary={partner.storeName}
                      secondary={
                        <Box>
                          <Typography variant='body2' color='text.secondary'>
                            {partner.address?.city}, {partner.address?.state}
                          </Typography>
                          {partner.distanceMiles > 0 && (
                            <Typography variant='body2' color='text.secondary'>
                              {partner.distanceMiles.toFixed(1)} miles away
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
            </List>
          </Box>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            No partnerships selected
          </Typography>
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

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {/* Store Hours */}
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              Store Hours
            </Typography>
            <List dense>
              {(() => {
                // Convert form hours to StoreOpenHours format
                const storeHours: StoreOpenHours[] = Object.entries(
                  formState.storeHours
                ).map(([day, hours]) => {
                  const dayIndex = [
                    'sunday',
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                  ].indexOf(day);

                  return {
                    storeId: formState.storeId || 0,
                    dayOfWeek: dayIndex,
                    openTime: hours.isOpen ? hours.openTime || '' : '',
                    closeTime: hours.isOpen ? hours.closeTime || '' : '',
                    isClosed: !hours.isOpen,
                    isAllDay: hours.isAllDay || false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                });

                // Get consolidated hours
                const consolidatedHours = consolidateBusinessHours(storeHours);

                return consolidatedHours.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            {item.day}
                          </Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {item.hours === 'Closed'
                              ? 'Closed'
                              : item.hours
                                  .split(' - ')
                                  .map((time) => formatTime(time))
                                  .join(' - ')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ));
              })()}
            </List>
          </Box>

          {/* Payment methods are now platform-controlled and managed centrally */}
        </Box>
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

          {/* Debug branding data */}
          {(() => {
            console.log('🔍 ReviewSubmitStep - Branding data:', {
              hasBranding: !!formState.branding,
              logoFile: !!formState.branding?.logoFile,
              logoUrl: !!formState.branding?.logoUrl,
              bannerFile: !!formState.branding?.bannerFile,
              bannerUrl: !!formState.branding?.bannerUrl,
              galleryFiles: formState.branding?.galleryFiles?.length || 0,
              galleryUrls: formState.branding?.galleryUrls?.length || 0,
              brandingState: formState.branding,
            });
            return null;
          })()}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Store Logo
            </Typography>
            {formState.branding.logoFile || formState.branding.logoUrl ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>Logo uploaded</Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Store Banner
            </Typography>
            {formState.branding.bannerFile || formState.branding.bannerUrl ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>Banner uploaded</Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: '200px' }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Gallery Images
            </Typography>
            {(formState.branding.galleryFiles &&
              formState.branding.galleryFiles.length > 0) ||
            (formState.branding.galleryUrls &&
              formState.branding.galleryUrls.length > 0) ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckIcon color='success' sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant='body2'>
                  {formState.branding.galleryFiles?.length ||
                    formState.branding.galleryUrls?.length ||
                    0}{' '}
                  image(s) uploaded
                </Typography>
              </Box>
            ) : (
              <Typography variant='body2' color='text.secondary'>
                Not provided
              </Typography>
            )}
          </Box>
        </Box>
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
      {shouldShowPartnershipSection() && renderPartnerships()}
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
          Your store application will be reviewed by our team within 1-2
          business days. You'll receive an email notification once it's
          approved.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, order: { xs: 2, sm: 1 } }}>
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

            <Button
              variant='text'
              onClick={() => navigate(user?.hasStore ? '/dashboard' : '/')}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                px: 2,
              }}
            >
              Save & Exit Later
            </Button>
          </Box>

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
              order: { xs: 1, sm: 2 },
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
