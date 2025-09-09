import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { CheckCircle, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import AuthModal from '../components/auth/AuthModal';
import ApiTestButton from '../components/debug/ApiTestButton';
import { useAuth } from '../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // TODO: Implement search functionality - navigate to search results page
    // This will show stores that have the searched category of items
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

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: { xs: 4, md: 6 } }}>
        <Box sx={{ width: '100%', px: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Heartwood-Redig
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Sophisticated B2C marketplace with multi-store operations, price
                negotiation, and referral rewards system.
              </Typography>
              <Stack direction='row' spacing={1}>
                <Email sx={{ fontSize: '1.2rem' }} />
                <Typography variant='body2' color='grey.400'>
                  hello@heartwood-redig.com
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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

            <Grid item xs={12} sm={6} md={2}>
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

            <Grid item xs={12} md={4}>
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
              © 2025 Heartwood-Redig. All rights reserved.
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

      {/* API Debug Component (only in development) */}
      <ApiTestButton />
    </Box>
  );
};

export default LandingPage;
