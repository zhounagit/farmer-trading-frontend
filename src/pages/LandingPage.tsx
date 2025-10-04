import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Button,
} from '@mui/material';
import { Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import AuthModal from '../components/auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  // handleRegisterClick removed as it's no longer needed

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  const handleSwitchAuthMode = (mode: 'login' | 'register') => {
    setAuthMode(mode);
  };

  const handleSearch = (query: string) => {
    console.log('🔍 Search initiated from landing page:', query);
    // Navigate to enhanced unified search page with search query
    navigate(`/unified-search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Box>
      {/* Header */}
      <Header onLoginClick={handleLoginClick} />

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth='lg'>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              '& > *': {
                flex: { xs: '1 1 100%', md: '0 1 auto' },
              },
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Neighbors Connect
              </Typography>
              <Typography variant='body2' color='grey.400' sx={{ mb: 2 }}>
                Connecting sellers and consumers for a more sustainable future.
              </Typography>
              <Stack direction='row' spacing={1}>
                <Email sx={{ fontSize: '1.2rem' }} />
                <Typography variant='body2' color='grey.400'>
                  hello@neighborsconnect.com
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '0 1 16%' } }}
            >
              <Typography variant='h6' fontWeight={600} sx={{ mb: 2 }}>
                Platform
              </Typography>
              <Stack spacing={1}>
                <Typography variant='body2' color='grey.400'>
                  For Sellers
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  For Consumers
                </Typography>
                <Typography variant='body2' color='grey.400'>
                  Pricing
                </Typography>
              </Stack>
            </Box>

            <Box
              sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%', md: '0 1 16%' } }}
            >
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
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
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
            </Box>
          </Box>

          <Divider sx={{ my: 4, bgcolor: 'grey.800' }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems='center'
            spacing={2}
          >
            <Typography variant='body2' color='grey.500'>
              © 2025 Neighbors Connect. All rights reserved.
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
