import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Paper,
  Alert,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Phone,
  Email,
  Send,
  Schedule,
  SupportAgent,
  RequestQuote,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/search/services/storefront.api';

interface ContactFormModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  inquiryType?: string;
}

const ContactFormModule: React.FC<ContactFormModuleProps> = ({
  module,
  storefront,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const settings = module.settings || {};
  const title = (settings.title as string) || 'Get Professional Support';
  const subtitle =
    (settings.subtitle as string) ||
    'Contact our sales and technical team for quotes, support, and business inquiries';

  // Industrial professional fields
  const defaultFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Business Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
    {
      name: 'company',
      label: 'Company/Organization',
      type: 'text',
      required: true,
    },
    {
      name: 'inquiryType',
      label: 'Inquiry Type',
      type: 'select',
      required: true,
      options: [
        'Request Quote',
        'Technical Support',
        'Product Information',
        'Volume Pricing',
        'Partnership Inquiry',
        'General Question',
      ],
    },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    {
      name: 'message',
      label: 'Message Details',
      type: 'textarea',
      required: true,
    },
  ];

  const settingsFields = settings.fields as
    | Array<{
        name: string;
        label: string;
        type: string;
        required: boolean;
        options?: string[];
      }>
    | undefined;

  const fields =
    settingsFields && settingsFields.length === 7
      ? settingsFields
      : defaultFields;

  const submitText = (settings.submitText as string) || 'Submit Inquiry';
  const successMessage =
    (settings.successMessage as string) ||
    'Thank you for your inquiry! Our team will respond within 24 business hours.';

  // Get store contact info from enhanced settings
  const storeContactInfo =
    (settings.storeContactInfo as {
      storePhone?: string;
      storeEmail?: string;
      businessAddress?: {
        locationName?: string;
        streetAddress?: string;
        city?: string;
        state?: string;
        zipCode?: string;
      };
    }) || {};

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual form submission to backend
      // Form submission logic here

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general',
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return fields
      .filter((field) => field.required)
      .every((field) => {
        const value = formData[field.name as keyof ContactFormData];
        return value && value.trim().length > 0;
      });
  };

  const renderField = (field: (typeof fields)[0] | undefined) => {
    if (!field) return null;
    const value = formData[field.name as keyof ContactFormData] || '';

    if (field.type === 'textarea') {
      return (
        <TextField
          key={field.name}
          fullWidth
          multiline
          rows={5}
          label={field.label}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          required={field.required}
          variant='outlined'
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
          placeholder={
            field.name === 'message'
              ? 'Please provide detailed information about your inquiry, including quantities, specifications, or technical requirements...'
              : ''
          }
        />
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <TextField
          key={field.name}
          fullWidth
          select
          label={field.label}
          value={value}
          onChange={(e) => handleInputChange(field.name, e.target.value)}
          required={field.required}
          variant='outlined'
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        >
          {field.options.map((option) => (
            <MenuItem
              key={option}
              value={option.toLowerCase().replace(/\s+/g, '-')}
            >
              {option}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    return (
      <TextField
        key={field.name}
        fullWidth
        type={field.type}
        label={field.label}
        value={value}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
        required={field.required}
        variant='outlined'
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
          },
        }}
        placeholder={
          field.name === 'company'
            ? 'Your company or organization name'
            : field.name === 'subject'
              ? 'Brief description of your inquiry'
              : ''
        }
      />
    );
  };

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: 'var(--theme-surface, #1F2937)',
        color: 'var(--theme-text-primary, white)',
        borderTop: '4px solid var(--theme-accent, #F59E0B)',
      }}
    >
      <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant='h3'
            component='h2'
            sx={{
              mb: 2,
              fontWeight: 700,
              color: 'var(--theme-text-primary, #1F2937)',
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
            }}
          >
            {title}
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{
              color: '#D1D5DB',
              fontSize: '1.125rem',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Contact Form */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              backgroundColor: 'var(--theme-background, white)',
              borderRadius: 'var(--theme-radius-lg, 8px)',
              border: '2px solid var(--theme-border, #E5E7EB)',
            }}
          >
            <Box display='flex' alignItems='center' mb={4}>
              <RequestQuote sx={{ mr: 2, color: '#1E3A8A', fontSize: 28 }} />
              <Typography
                variant='h5'
                component='h3'
                sx={{
                  color: 'var(--theme-text-primary, #374151)',
                  fontWeight: 500,
                  fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
                }}
              >
                Professional Inquiry Form
              </Typography>
            </Box>

            {submitStatus === 'success' && (
              <Alert severity='success' sx={{ mb: 3, borderRadius: 1 }}>
                {successMessage}
              </Alert>
            )}

            {submitStatus === 'error' && (
              <Alert severity='error' sx={{ mb: 3, borderRadius: 1 }}>
                There was an error processing your inquiry. Please try again or
                contact us directly at the numbers below.
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                  },
                  gap: 3,
                }}
              >
                <Box>{renderField(fields.find((f) => f?.name === 'name'))}</Box>
                <Box>
                  {renderField(fields.find((f) => f?.name === 'email'))}
                </Box>
                <Box>
                  {renderField(fields.find((f) => f?.name === 'phone'))}
                </Box>
                <Box>
                  {renderField(fields.find((f) => f?.name === 'company'))}
                </Box>
                <Box>
                  {renderField(fields.find((f) => f?.name === 'inquiryType'))}
                </Box>
                <Box>
                  {renderField(fields.find((f) => f?.name === 'subject'))}
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  {renderField(fields.find((f) => f?.name === 'message'))}
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <LoadingButton
                    type='submit'
                    variant='contained'
                    size='large'
                    loading={isSubmitting}
                    disabled={!isFormValid()}
                    startIcon={<Send />}
                    sx={{
                      mt: 2,
                      py: 2,
                      px: 6,
                      backgroundColor: '#1E3A8A',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.875rem',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: '#1E40AF',
                      },
                      '&:disabled': {
                        backgroundColor: '#9CA3AF',
                      },
                    }}
                  >
                    {submitText}
                  </LoadingButton>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Professional Contact Information */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
              }}
            >
              {/* Direct Contact Card */}
              <Paper
                sx={{
                  p: 4,
                  backgroundColor: '#374151',
                  color: 'white',
                  borderRadius: 2,
                  flex: 1,
                }}
              >
                <Box display='flex' alignItems='center' mb={3}>
                  <SupportAgent
                    sx={{ color: 'var(--theme-accent, #F59E0B)', fontSize: 20 }}
                  />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 600, color: 'white' }}
                  >
                    Direct Contact
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Sales & Support Phone */}
                  <Box>
                    <Box display='flex' alignItems='center' mb={1}>
                      <Phone sx={{ mr: 1.5, color: '#F59E0B', fontSize: 20 }} />
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 600, color: 'white' }}
                      >
                        Sales & Support
                      </Typography>
                    </Box>
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 700, color: '#F59E0B', mb: 1 }}
                    >
                      {storeContactInfo.storePhone ||
                        storefront.store.contactPhone ||
                        '1-800-BUSINESS'}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: '#D1D5DB', fontSize: '0.875rem' }}
                    >
                      Mon-Fri: 8:00 AM - 6:00 PM EST
                      <br />
                      Emergency: 24/7 Available
                    </Typography>
                  </Box>

                  {/* Business Email */}
                  <Box>
                    <Box display='flex' alignItems='center' mb={1}>
                      <Email sx={{ mr: 1.5, color: '#F59E0B', fontSize: 20 }} />
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 600, color: 'white' }}
                      >
                        Business Email
                      </Typography>
                    </Box>
                    <Typography
                      variant='body1'
                      sx={{ fontWeight: 600, color: '#F59E0B', mb: 1 }}
                    >
                      {storeContactInfo.storeEmail ||
                        storefront.store.contactEmail ||
                        'sales@company.com'}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{ color: '#D1D5DB', fontSize: '0.875rem' }}
                    >
                      Quotes, technical support,
                      <br />
                      account management
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Business Hours */}
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  backgroundColor: 'var(--theme-background, white)',
                  borderRadius: 'var(--theme-radius-lg, 8px)',
                  border: '2px solid var(--theme-border, #E5E7EB)',
                  flex: 1,
                }}
              >
                <Box display='flex' alignItems='center' mb={3}>
                  <Schedule sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
                  <Typography
                    variant='h6'
                    sx={{ fontWeight: 600, color: '#1F2937' }}
                  >
                    Business Hours
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
                    { day: 'Saturday', hours: '9:00 AM - 4:00 PM' },
                    { day: 'Sunday', hours: 'Emergency Only' },
                  ].map((schedule, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: index < 2 ? '1px solid #E5E7EB' : 'none',
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{ fontWeight: 500, color: '#374151' }}
                      >
                        {schedule.day}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#6B7280' }}>
                        {schedule.hours}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              {/* Trust Indicators */}
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: '#FEF3C7',
                  borderRadius: 2,
                  border: '1px solid #F59E0B',
                  flex: 1,
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    color: '#92400E',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    mb: 2,
                  }}
                >
                  Professional Service Promise
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    '24hr Response',
                    'Expert Support',
                    'Volume Pricing',
                    'Custom Solutions',
                  ].map((feature) => (
                    <Chip
                      key={feature}
                      label={feature}
                      size='small'
                      sx={{
                        backgroundColor: '#F59E0B',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactFormModule;
