import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  useTheme,
  Paper,
  Chip,
} from '@mui/material';
import { Search, Store, LocalOffer, Category } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { debounce } from '@/utils/debounce';
import StorefrontApiService, {
  type SearchSuggestion,
} from '@/features/search/services/storefront.api';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const MotionBox = motion(Box);

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularTerms, setPopularTerms] = useState<string[]>([]);

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

  // Load popular search terms
  useEffect(() => {
    const loadPopularTerms = async () => {
      try {
        const response = await StorefrontApiService.getPopularSearchTerms(6);
        setPopularTerms(response.terms);
      } catch (error) {
        console.error('Failed to load popular search terms:', error);
        // Set empty terms on error to prevent UI issues
        setPopularTerms([]);
      }
    };

    loadPopularTerms();
  }, []);

  // Debounced search suggestions
  const debouncedGetSuggestions = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query.trim().length < 2) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }

        try {
          const response = await StorefrontApiService.getSearchSuggestions({
            query: query.trim(),
            limit: 6,
            entityTypes: ['product', 'store', 'category'],
          });
          setSuggestions(response.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to get search suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300),
    []
  );

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      debouncedGetSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  const handlePopularTermClick = (term: string) => {
    setSearchQuery(term);
    if (onSearch) {
      onSearch(term);
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
            HelloNeighbors
          </Typography>

          <Box
            sx={{
              maxWidth: '600px',
              mx: 'auto',
              mb: { xs: 5, md: 6 },
              position: 'relative',
            }}
          >
            <TextField
              fullWidth
              variant='outlined'
              placeholder='Search for goods... (e.g., fresh vegetables, handmade crafts, organic fruits)'
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={() => {
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2 && suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              sx={{
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

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Paper
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  maxHeight: 300,
                  overflow: 'auto',
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: theme.shadows[8],
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      borderBottom:
                        index < suggestions.length - 1
                          ? '1px solid #f0f0f0'
                          : 'none',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        borderRadius:
                          index === 0
                            ? '8px 8px 0 0'
                            : index === suggestions.length - 1
                              ? '0 0 8px 8px'
                              : '0',
                      },
                    }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.entityType === 'product' && (
                      <LocalOffer
                        sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                      />
                    )}
                    {suggestion.entityType === 'store' && (
                      <Store
                        sx={{ color: 'secondary.main', fontSize: '1.2rem' }}
                      />
                    )}
                    {suggestion.entityType === 'category' && (
                      <Category
                        sx={{ color: 'info.main', fontSize: '1.2rem' }}
                      />
                    )}

                    <Box sx={{ flex: 1 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500 }}>
                        {suggestion.text}
                      </Typography>
                      {suggestion.category && (
                        <Typography variant='caption' color='text.secondary'>
                          in {suggestion.category}
                        </Typography>
                      )}
                      {suggestion.store && (
                        <Typography variant='caption' color='text.secondary'>
                          from {suggestion.store}
                        </Typography>
                      )}
                    </Box>

                    <Chip
                      label={suggestion.matchCount}
                      size='small'
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          {/* Popular Search Terms */}
          {!searchQuery && popularTerms.length > 0 && (
            <Box sx={{ maxWidth: '600px', mx: 'auto', mb: { xs: 3, md: 4 } }}>
              <Typography
                variant='body2'
                color='text.secondary'
                gutterBottom
                sx={{ textAlign: 'center', mb: 1 }}
              >
                Popular searches:
              </Typography>
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1,
                }}
              >
                {popularTerms.map((term) => (
                  <Chip
                    key={term}
                    label={term}
                    variant='outlined'
                    size='small'
                    clickable
                    onClick={() => handlePopularTermClick(term)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(46, 125, 50, 0.3)',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white',
                        border: '1px solid transparent',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Platform Features - 6 Pillars Grid */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              width: '100%',
              margin: '0',
              padding: '0',
            }}
          >
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
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
            </div>
          </div>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default HeroSection;
