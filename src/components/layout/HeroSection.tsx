import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const MotionBox = motion(Box);

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
        minHeight: { xs: '70vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        py: { xs: 6, md: 10 },
      }}
    >
      <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
        {/* Centered Hero Content */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          sx={{
            textAlign: 'center',
            mb: { xs: 6, md: 8 },
            maxWidth: '900px',
            mx: 'auto',
          }}
        >
          <Typography
            variant='h1'
            component='h1'
            sx={{
              fontSize: {
                xs: '2.2rem',
                sm: '3rem',
                md: '4rem',
                lg: '4.5rem',
              },
              fontWeight: 700,
              lineHeight: { xs: 1.2, md: 1.1 },
              mb: { xs: 3, md: 4 },
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Discover Local Goods
          </Typography>

          <Typography
            variant='h5'
            color='text.secondary'
            sx={{
              mb: { xs: 4, md: 5 },
              maxWidth: '100%',
              mx: 'auto',
              px: 0,
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
              lineHeight: 1.8,
            }}
          >
            The sophisticated marketplace connecting diverse sellers with smart
            consumers. Enjoy price negotiations, earn referral rewards, and
            choose flexible fulfillment options in our commission-based
            ecosystem.
          </Typography>

          <Typography
            variant='h3'
            component='h2'
            fontWeight={700}
            textAlign='center'
            sx={{
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: 'primary.main',
            }}
          >
            HeartWood
          </Typography>

          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search for goods... (e.g., fresh vegetables, handmade crafts, organic fruits)'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              mb: { xs: 5, md: 6 },
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                py: { xs: 1, md: 1.5 },
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
                '&.Mui-focused': {
                  boxShadow: theme.shadows[12],
                },
              },
              '& .MuiOutlinedInput-input': {
                py: { xs: 2, md: 2.5 },
                textAlign: 'center',
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={handleSearch}
                    edge='end'
                    disabled={!searchQuery.trim()}
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        color: 'white',
                      },
                      '&.Mui-disabled': {
                        color: 'grey.400',
                      },
                    }}
                  >
                    <Search fontSize='large' />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Platform Features - 6 Pillars Grid */}
          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            sx={{
              width: '100%',
              mx: 0,
              px: 0,
              '& .MuiGrid-item:nth-of-type(4)': {
                mt: { xs: 2, md: 4 },
              },
              '& .MuiGrid-item:nth-of-type(5)': {
                mt: { xs: 2, md: 4 },
              },
              '& .MuiGrid-item:nth-of-type(6)': {
                mt: { xs: 2, md: 4 },
              },
            }}
          >
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='primary.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  🏪 Multi-store Marketplace
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    px: { xs: 0, md: 1 },
                  }}
                >
                  Diverse Sellers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='secondary.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  💰 Price Negotiation
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Make Offers & Save
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='info.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  📦 Inventory Management
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Real-Time Tracking
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='success.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  🎁 Referral Rewards
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Earn Up to 5%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='warning.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  🔒 Secure Payment
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Multiple Methods
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', py: { xs: 2, md: 3 } }}>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  color='error.main'
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    mb: 0.5,
                  }}
                >
                  🚚 Flexible Fulfillment
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                >
                  Delivery & Pickup
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default HeroSection;
