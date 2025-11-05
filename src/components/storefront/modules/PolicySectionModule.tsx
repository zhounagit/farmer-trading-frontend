import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Schedule,
  Phone,
  Email,
  LocalShipping,
  ExpandMore,
  Security,
  VerifiedUser,
  SupportAgent,
  Agriculture,
  Store,
} from '@mui/icons-material';
import {
  consolidateBusinessHours,
  type StoreOpenHours,
} from '../../../utils/businessHours';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';

interface PolicySectionModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const PolicySectionModule: React.FC<PolicySectionModuleProps> = ({
  module,
  storefront,
}) => {
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([
    'hours',
  ]);

  const settings = module.settings || {};
  const displayStyle = (settings.displayStyle as string) || 'accordion';
  const showShipping = (settings.showShipping as boolean) !== false;
  const showReturns = (settings.showReturns as boolean) !== false;

  // Check if there's already a contact-form module in the storefront to prevent duplication
  // Check if there's a contact form module
  const hasContactFormModule =
    (Array.isArray(storefront.customization?.modules)
      ? storefront.customization.modules.some(
          (mod) => mod.type === 'contact-form' && mod.isVisible !== false
        )
      : false) || false;

  // Only show contact section if explicitly enabled AND no dedicated contact form module exists
  // This prevents redundant contact information when users have added a separate Contact Form module
  const showContact =
    (settings.showContact as boolean) !== false && !hasContactFormModule;

  // Debug logging for contact form duplication prevention
  // Contact settings configured

  // Get enhanced data from backend
  const businessHours = (settings.businessHours as StoreOpenHours[]) || [];

  const paymentMethods = (settings.paymentMethods as string[]) || [];
  const contactInfo =
    (settings.contactInfo as {
      phone?: string;
      email?: string;
      storeName?: string;
    }) || {};

  // Get real logistics data from store setup (like Store Overview)
  let logisticsInfo =
    (settings.logisticsInfo as {
      hasDelivery?: boolean;
      deliveryRadius?: number;
      hasFarmPickup?: boolean;
      hasBusinessAddress?: boolean;
    }) || {};

  // Fallback: If logistics info not in settings, derive from storefront data
  if (!logisticsInfo.hasDelivery && !logisticsInfo.hasFarmPickup) {
    const storeData = storefront.store;
    if (storeData) {
      // Check if delivery is available based on storefront data
      const hasDelivery =
        storeData.addresses?.some(
          (addr: Record<string, unknown>) =>
            (addr.addressType as string) === 'business' ||
            (addr.addressType as string) === 'business_address'
        ) &&
        Boolean(
          (storeData as any).contactPhone || storeData.addresses?.[0]?.phone
        ); // Basic delivery capability check

      const hasFarmPickup = storeData.addresses?.some(
        (addr: Record<string, unknown>) =>
          (addr.addressType as string) === 'farm_location'
      );

      const hasBusinessAddress = storeData.addresses?.some(
        (addr: Record<string, unknown>) =>
          (addr.addressType as string) === 'business' ||
          (addr.addressType as string) === 'business_address'
      );

      logisticsInfo = {
        hasDelivery: hasDelivery,
        deliveryRadius: 16, // Default delivery radius based on your Store Overview
        hasFarmPickup: hasFarmPickup,
        hasBusinessAddress: hasBusinessAddress,
      };
    }
  }

  // Debug logging to see what logistics data we have
  console.log('PolicySectionModule Debug:', {
    hasLogisticsSettings: !!settings.logisticsInfo,
    logisticsInfo,
    hasDelivery: logisticsInfo.hasDelivery,
    deliveryRadius: logisticsInfo.deliveryRadius,
    hasFarmPickup: logisticsInfo.hasFarmPickup,
    hasBusinessAddress: logisticsInfo.hasBusinessAddress,
    allSettings: settings,
  });

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordions((prev) =>
        isExpanded ? [...prev, panel] : prev.filter((p) => p !== panel)
      );
    };

  const renderBusinessHours = () => {
    if (businessHours.length === 0) return null;

    const consolidatedHours = consolidateBusinessHours(businessHours);

    return (
      <Box>
        <Typography variant='body2' sx={{ mb: 2, color: '#6B7280' }}>
          Our professional service hours for orders, support, and deliveries.
        </Typography>
        <List dense>
          {consolidatedHours.map((item, index) => (
            <ListItem key={index} sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary={
                  <Box
                    display='flex'
                    justifyContent='space-between'
                    sx={{
                      borderBottom:
                        index < consolidatedHours.length - 1
                          ? '1px solid #E5E7EB'
                          : 'none',
                      pb: 1,
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600, color: '#1F2937' }}
                    >
                      {item.day}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: item.hours === 'Closed' ? '#DC2626' : '#059669',
                        fontWeight: 500,
                      }}
                    >
                      {item.hours}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderPaymentMethods = () => {
    const industrialPaymentMethods =
      paymentMethods.length > 0
        ? paymentMethods
        : [
            'Credit Card',
            'Corporate Account',
            'Purchase Order',
            'Bank Transfer',
            'Check',
          ];

    return (
      <Box>
        <Typography variant='body2' sx={{ mb: 3, color: '#6B7280' }}>
          Secure payment options designed for business and professional
          customers.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
          {industrialPaymentMethods.map((method, index) => (
            <Chip
              key={index}
              label={method}
              sx={{
                backgroundColor: '#1E3A8A',
                color: 'white',
                fontWeight: 500,
                fontSize: '0.875rem',
                '&:hover': {
                  backgroundColor: '#1E40AF',
                },
              }}
            />
          ))}
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: '#F8FAFC',
            borderRadius: 1,
            border: '1px solid #E5E7EB',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            Business Terms Available
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#374151', fontSize: '0.875rem' }}
          >
            • Net 30 payment terms for qualified businesses
            <br />
            • Volume discounts for bulk orders
            <br />• Dedicated account management
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderContactInfo = () => {
    if (!showContact) return null;

    const phone =
      contactInfo.phone ||
      (storefront.store as any).contactPhone ||
      '1-800-BUSINESS';
    const email =
      contactInfo.email ||
      (storefront.store as any).contactEmail ||
      'sales@company.com';

    return (
      <Box>
        <Typography variant='body2' sx={{ mb: 3, color: '#6B7280' }}>
          Professional support and sales team ready to assist with your business
          needs.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 3,
          }}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: '#F8FAFC',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
            }}
          >
            <Box display='flex' alignItems='center' mb={2}>
              <Phone sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Sales & Support
              </Typography>
            </Box>
            <Typography
              variant='body1'
              sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}
            >
              {phone}
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: '#6B7280', fontSize: '0.875rem' }}
            >
              Mon-Fri: 8:00 AM - 6:00 PM
              <br />
              Emergency support available 24/7
            </Typography>
          </Box>

          <Box
            sx={{
              p: 3,
              backgroundColor: '#F8FAFC',
              borderRadius: 2,
              border: '1px solid #E5E7EB',
            }}
          >
            <Box display='flex' alignItems='center' mb={2}>
              <Email sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Business Inquiries
              </Typography>
            </Box>
            <Typography
              variant='body1'
              sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}
            >
              {email}
            </Typography>
            <Typography
              variant='body2'
              sx={{ color: '#6B7280', fontSize: '0.875rem' }}
            >
              Quotes, technical support,
              <br />
              and account management
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: '#FEF3C7',
            borderRadius: 1,
            border: '1px solid #F59E0B',
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
              mb: 1,
            }}
          >
            Priority Support Available
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#92400E', fontSize: '0.875rem' }}
          >
            Dedicated account managers for enterprise customers and high-volume
            orders
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderShippingPolicy = () => {
    if (!showShipping) return null;

    const hasRealLogisticsData =
      logisticsInfo.hasDelivery || logisticsInfo.hasFarmPickup;

    console.log('Shipping Policy Debug:', {
      hasRealLogisticsData,
      hasDelivery: logisticsInfo.hasDelivery,
      hasFarmPickup: logisticsInfo.hasFarmPickup,
      deliveryRadius: logisticsInfo.deliveryRadius,
    });

    // Safety check to prevent any potential image loading issues
    if (!showShipping) return null;

    return (
      <Box>
        <Typography variant='body2' sx={{ mb: 3, color: '#6B7280' }}>
          {hasRealLogisticsData
            ? 'Available shipping and delivery options for your orders.'
            : 'Comprehensive shipping and logistics solutions for business customers.'}
        </Typography>

        {/* Real Logistics Info - Simple Store Overview Style */}
        {hasRealLogisticsData && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant='h6'
              sx={{ mb: 2, fontWeight: 600, color: '#1F2937' }}
            >
              Delivery & Pickup Options
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Delivery Service */}
              {logisticsInfo.hasDelivery && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#F0FDF4',
                    borderRadius: '6px',
                    border: '1px solid #BBF7D0',
                  }}
                >
                  <LocalShipping sx={{ mr: 2, color: '#059669' }} />
                  <Box>
                    <Typography
                      variant='body2'
                      sx={{ color: '#15803D', fontWeight: 600 }}
                    >
                      Local Delivery Available
                    </Typography>
                    {logisticsInfo.deliveryRadius && (
                      <Typography variant='caption' sx={{ color: '#059669' }}>
                        Delivery radius: {logisticsInfo.deliveryRadius} miles
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Farm Pickup */}
              {logisticsInfo.hasFarmPickup && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#FEF3C7',
                    borderRadius: '6px',
                    border: '1px solid #FDE68A',
                  }}
                >
                  <Agriculture sx={{ mr: 2, color: '#D97706' }} />
                  <Typography
                    variant='body2'
                    sx={{ color: '#92400E', fontWeight: 600 }}
                  >
                    On-Farm Pickup Available
                  </Typography>
                </Box>
              )}

              {/* Business Address Pickup */}
              {logisticsInfo.hasBusinessAddress && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#EBF4FF',
                    borderRadius: '6px',
                    border: '1px solid #DBEAFE',
                  }}
                >
                  <Store sx={{ mr: 2, color: '#2563EB' }} />
                  <Typography
                    variant='body2'
                    sx={{ color: '#1D4ED8', fontWeight: 600 }}
                  >
                    Store Pickup Available
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Default content if no real data */}
        {!hasRealLogisticsData && (
          <Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 2,
                mb: 3,
              }}
            >
              {[
                {
                  title: 'Standard Shipping',
                  description: '3-5 business days nationwide',
                  detail: 'Free shipping on orders over $500',
                },
                {
                  title: 'Express Delivery',
                  description: '1-2 business days to major cities',
                  detail: 'Priority handling for urgent orders',
                },
                {
                  title: 'Freight & LTL',
                  description: 'Bulk orders and oversized items',
                  detail: 'White-glove delivery available',
                },
                {
                  title: 'Will Call/Pickup',
                  description: 'Pick up at our distribution center',
                  detail: 'Same-day availability for in-stock items',
                },
              ].map((option, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid #E5E7EB',
                    borderRadius: 1,
                    '&:hover': {
                      borderColor: '#F59E0B',
                      backgroundColor: '#FFFBEB',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography
                    variant='body1'
                    sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5 }}
                  >
                    {option.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ color: '#374151', mb: 0.5 }}
                  >
                    {option.description}
                  </Typography>
                  <Typography variant='caption' sx={{ color: '#6B7280' }}>
                    {option.detail}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                p: 2,
                backgroundColor: '#F0F9FF',
                borderRadius: 1,
                border: '1px solid #0EA5E9',
              }}
            >
              <Typography
                variant='caption'
                sx={{
                  color: '#0C4A6E',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'block',
                  mb: 1,
                }}
              >
                Professional Services
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#0C4A6E', fontSize: '0.875rem' }}
              >
                • Installation and setup services available
                <br />
                • Technical support and training
                <br />• Scheduled deliveries and supply chain management
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderReturnsPolicy = () => {
    if (!showReturns) return null;

    return (
      <Box>
        <Typography variant='body2' sx={{ mb: 3, color: '#6B7280' }}>
          Professional-grade return and warranty policies designed for business
          customers.
        </Typography>

        <Box
          sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, mb: 3 }}
        >
          <Box
            sx={{
              p: 3,
              border: '1px solid #E5E7EB',
              borderRadius: 2,
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}
            >
              30-Day Return Policy
            </Typography>
            <Typography variant='body2' sx={{ color: '#374151', mb: 2 }}>
              Most items can be returned within 30 days of delivery in original
              condition.
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '0.875rem' }}
              >
                • Return authorization required
                <br />
                • Original packaging and documentation needed
                <br />• Customer responsible for return shipping unless
                defective
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 3,
              border: '1px solid #E5E7EB',
              borderRadius: 2,
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: '#1F2937', mb: 2 }}
            >
              Warranty & Support
            </Typography>
            <Typography variant='body2' sx={{ color: '#374151', mb: 2 }}>
              Comprehensive warranty coverage and professional support services.
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '0.875rem' }}
              >
                • Manufacturer warranties honored
                <br />
                • Extended warranty options available
                <br />• On-site service and repair for qualified products
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            backgroundColor: '#FEF2F2',
            borderRadius: 1,
            border: '1px solid #DC2626',
          }}
        >
          <Typography
            variant='caption'
            sx={{
              color: '#991B1B',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'block',
              mb: 1,
            }}
          >
            Quality Guarantee
          </Typography>
          <Typography
            variant='body2'
            sx={{ color: '#991B1B', fontSize: '0.875rem' }}
          >
            Not satisfied? Contact us within 48 hours for immediate resolution.
            We stand behind every product we sell.
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderAccordionView = () => {
    const accordions = [];

    if (businessHours.length > 0) {
      accordions.push(
        <Accordion
          key='hours'
          expanded={expandedAccordions.includes('hours')}
          onChange={handleAccordionChange('hours')}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <Box display='flex' alignItems='center'>
              <Schedule sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Business Hours
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {renderBusinessHours()}
          </AccordionDetails>
        </Accordion>
      );
    }

    accordions.push(
      <Accordion
        key='payment'
        expanded={expandedAccordions.includes('payment')}
        onChange={handleAccordionChange('payment')}
        sx={{
          border: '1px solid #E5E7EB',
          borderRadius: '8px !important',
          mb: 2,
          '&:before': { display: 'none' },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            '&.Mui-expanded': {
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
          }}
        >
          <Box display='flex' alignItems='center'>
            <Security sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
            <Typography variant='h6' sx={{ fontWeight: 600, color: '#1F2937' }}>
              Payment & Terms
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 3 }}>
          {renderPaymentMethods()}
        </AccordionDetails>
      </Accordion>
    );

    if (showContact) {
      accordions.push(
        <Accordion
          key='contact'
          expanded={expandedAccordions.includes('contact')}
          onChange={handleAccordionChange('contact')}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <Box display='flex' alignItems='center'>
              <SupportAgent sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Professional Support
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {renderContactInfo()}
          </AccordionDetails>
        </Accordion>
      );
    }

    if (showShipping) {
      accordions.push(
        <Accordion
          key='shipping'
          expanded={expandedAccordions.includes('shipping')}
          onChange={handleAccordionChange('shipping')}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <Box display='flex' alignItems='center'>
              <LocalShipping sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Shipping & Logistics
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {renderShippingPolicy()}
          </AccordionDetails>
        </Accordion>
      );
    }

    if (showReturns) {
      accordions.push(
        <Accordion
          key='returns'
          expanded={expandedAccordions.includes('returns')}
          onChange={handleAccordionChange('returns')}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px !important',
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              '&.Mui-expanded': {
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            }}
          >
            <Box display='flex' alignItems='center'>
              <VerifiedUser sx={{ mr: 2, color: '#1E3A8A', fontSize: 24 }} />
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: '#1F2937' }}
              >
                Returns & Warranty
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            {renderReturnsPolicy()}
          </AccordionDetails>
        </Accordion>
      );
    }

    return <Box>{accordions}</Box>;
  };

  const renderCardsView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {businessHours.length > 0 && renderBusinessHours()}
      {renderPaymentMethods()}
      {showContact && renderContactInfo()}
      {showShipping && renderShippingPolicy()}
      {showReturns && renderReturnsPolicy()}
    </Box>
  );

  // Don't render if no content to show
  // Check if we have any content to show
  const hasContent = Boolean(
    businessHours.length > 0 ||
      paymentMethods.length > 0 ||
      showContact ||
      showShipping ||
      showReturns
  );

  if (!hasContent) {
    return null;
  }

  return (
    <Box
      sx={{
        py: 8,
        backgroundColor: 'var(--theme-surface, #F8FAFC)',
        borderTop: '4px solid var(--theme-primary, #1E3A8A)',
      }}
    >
      <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant='h3'
            component='h2'
            sx={{
              mb: 6,
              fontWeight: 700,
              color: 'var(--theme-text-primary, #1F2937)',
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
              textAlign: 'center',
            }}
          >
            Store Information & Policies
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{
              color: '#6B7280',
              fontSize: '1.125rem',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Essential business policies and information for professional
            customers
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          {displayStyle === 'accordion' || displayStyle === 'tabs'
            ? renderAccordionView()
            : renderCardsView()}
        </Box>

        {/* Trust Footer */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: '1px solid var(--theme-border, #E5E7EB)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant='body2'
            sx={{
              color: 'var(--theme-text-muted, #6B7280)',
              mb: 2,
              fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
            }}
          >
            Professional service backed by industry-leading policies and support
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {[
              'BBB Accredited',
              'ISO Certified',
              'Professional Grade',
              '24/7 Support',
            ].map((badge) => (
              <Chip
                key={badge}
                label={badge}
                size='small'
                sx={{
                  backgroundColor: 'var(--theme-primary, #1E3A8A)',
                  color: 'var(--theme-background, white)',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default PolicySectionModule;
