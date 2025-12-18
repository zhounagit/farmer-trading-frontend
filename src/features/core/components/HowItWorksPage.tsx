import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import AuthModal from '../../../components/auth/AuthModal';
import { useCommissionRates } from '@/features/referral/hooks/useCommissionRates';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export const HowItWorksPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');

  // Fetch commission rates for referral rewards display
  const {
    directRate: directCommissionRate,
    indirectRate: indirectCommissionRate,
    isLoading: isLoadingCommissionRates,
  } = useCommissionRates();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleSwitchAuthMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  return (
    <Box>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} />

      {/* Back Button */}
      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackToHome}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Box sx={{ width: '100%', px: { xs: 3, md: 4 } }}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant='h2'
              component='h1'
              textAlign='center'
              fontWeight={700}
              sx={{
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              How It Works
            </Typography>
            <Typography
              variant='h6'
              textAlign='center'
              color='text.secondary'
              sx={{
                mb: { xs: 4, md: 6 },
                maxWidth: '700px',
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.25rem' },
                lineHeight: 1.6,
              }}
            >
              Experience our comprehensive marketplace ecosystem
            </Typography>
          </MotionBox>

          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            justifyContent='center'
            sx={{ px: { xs: 2, sm: 0 } }}
          >
            {[
              {
                step: '01',
                title: 'Multi-Store Shopping',
                description:
                  'Browse diverse sellers - farmers, artisans, producers & merchants in one platform',
              },
              {
                step: '02',
                title: 'Negotiate & Purchase',
                description:
                  'Make offers, negotiate prices, choose fulfillment (delivery/pickup/farmgate)',
              },
              {
                step: '03',
                title: 'Earn & Refer',
                description:
                  'Complete orders, earn referral commissions, and build your network for passive income',
              },
            ].map((item, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.step}>
                <MotionCard
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  sx={{
                    textAlign: 'center',
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: { xs: 280, md: 320 },
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  <Typography
                    variant='h3'
                    color='primary.main'
                    fontWeight={700}
                    sx={{
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '3rem' },
                    }}
                  >
                    {item.step}
                  </Typography>
                  <Typography
                    variant='h5'
                    fontWeight={600}
                    sx={{
                      mb: 2,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </Typography>
                </MotionCard>
              </Grid>
            ))}
          </Grid>

          {/* Additional Details */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            sx={{ mt: { xs: 6, md: 8 } }}
          >
            <Typography
              variant='h4'
              component='h2'
              textAlign='center'
              fontWeight={600}
              sx={{
                mb: 4,
                fontSize: { xs: '1.5rem', md: '2rem' },
              }}
            >
              Why Choose Our Platform?
            </Typography>

            <Grid container spacing={3} sx={{ maxWidth: '800px', mx: 'auto' }}>
              {[
                'Commission-based system - no upfront fees',
                isLoadingCommissionRates
                  ? 'Two-tier referral rewards loading...'
                  : directCommissionRate && indirectCommissionRate
                    ? `Two-tier referral rewards up to ${directCommissionRate + indirectCommissionRate}%`
                    : 'Two-tier referral rewards',
                'Direct negotiation with sellers',
                'Multiple fulfillment options',
                'Secure payment processing',
                'Real-time inventory tracking',
              ].map((benefit, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <CheckCircle color='success' />
                    <Typography variant='body1'>{benefit}</Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </MotionBox>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant='contained'
              size='large'
              onClick={handleBackToHome}
              sx={{ px: 6, py: 2 }}
            >
              Start Shopping Now
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: { xs: 4, md: 6 } }}>
        <Box sx={{ width: '100%', px: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                HelloNeighbors
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Sophisticated B2C marketplace with multi-store operations, price
                negotiation, and referral rewards system.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Features
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2' color='grey.400'>
                  Multi-Store Marketplace
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Price Negotiation
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Referral Rewards
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Flexible Fulfillment
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Business Model
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2' color='grey.400'>
                  Commission System
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Store Tier Benefits
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Payout Management
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Join Our Ecosystem
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Start earning through our referral system and experience
                sophisticated marketplace features.
              </Typography>
              <Button
                variant='outlined'
                size='small'
                onClick={handleBackToHome}
                sx={{
                  borderColor: 'grey.600',
                  color: 'grey.400',
                  '&:hover': {
                    borderColor: 'white',
                    color: 'white',
                  },
                }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, bgcolor: 'grey.800' }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems='center'
            spacing={2}
          >
            <Typography variant='body2' color='grey.500'>
              © 2025 HelloNeighbors. All rights reserved.
            </Typography>
            <Stack direction='row' spacing={3}>
              <Typography variant='body2' color='grey.500'>
                Privacy Policy
              </Typography>
              <Typography variant='body2' color='grey.500'>
                Terms of Service
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={handleCloseAuthModal}
        mode={authMode}
        onSwitchMode={handleSwitchAuthMode}
      />
    </Box>
  );
};

export default HowItWorksPage;
