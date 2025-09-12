import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import AuthModal from '../components/auth/AuthModal';

export const LandingPage: React.FC = () => {
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

  const handleGetStarted = () => {
    handleRegisterClick();
  };

  const handleLearnMore = () => {
    // Navigate to How It Works page
    window.location.href = '/how-it-works';
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
      <Header
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />

      {/* Hero Section */}
      <HeroSection
        onGetStarted={handleGetStarted}
        onLearnMore={handleLearnMore}
      />

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth='lg'>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Farm Connect
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Connecting farmers and consumers for a more sustainable future.
              </Typography>
              <Stack direction='row' spacing={1}>
                <Email sx={{ fontSize: '1.2rem' }} />
                <Typography variant='body2' color='grey.400'>
                  hello@farmconnect.com
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Platform
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2' color='grey.400'>
                  For Farmers
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  For Consumers
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Pricing
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2' color='grey.400'>
                  About Us
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Blog
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Careers
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Get Updates
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Subscribe to our newsletter for the latest updates and features.
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
                Subscribe
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
              © 2025 Farm Connect. All rights reserved.
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
        </Container>
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

export default LandingPage;
