import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Avatar,
  Rating,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  Star,
  LocationOn,
  Phone,
  Email,
  Facebook,
  Instagram,
  Twitter,
} from '@mui/icons-material';
import { generateThemeCSS } from '../../types/themes';
import type { StorefrontTheme } from '../../types/themes';

interface ThemePreviewProps {
  theme: StorefrontTheme;
  className?: string;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, className }) => {
  // Generate CSS variables for the theme
  const themeCSS = generateThemeCSS(theme);

  // Mock data for preview
  const mockProducts = [
    {
      id: 1,
      name: 'Organic Tomatoes',
      price: '$4.99/lb',
      image: '/api/placeholder/200/200',
      rating: 4.8,
      reviews: 24,
    },
    {
      id: 2,
      name: 'Fresh Basil',
      price: '$2.50/bunch',
      image: '/api/placeholder/200/200',
      rating: 4.9,
      reviews: 18,
    },
    {
      id: 3,
      name: 'Farm Eggs',
      price: '$6.00/dozen',
      image: '/api/placeholder/200/200',
      rating: 5.0,
      reviews: 35,
    },
  ];

  const mockTestimonial = {
    name: 'Sarah Johnson',
    text: 'Amazing quality produce! Everything is so fresh and flavorful.',
    rating: 5,
    avatar: '/api/placeholder/40/40',
  };

  return (
    <Box className={className}>
      {/* Inject theme CSS */}
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />

      <Box
        sx={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text-primary)',
          fontFamily: 'var(--theme-font-primary)',
          minHeight: '600px',
          borderRadius: 'var(--theme-radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--theme-shadow-lg)',
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'var(--theme-surface)',
            borderBottom: `1px solid var(--theme-border)`,
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant='h5'
              sx={{
                fontFamily: 'var(--theme-font-primary)',
                fontWeight: 600,
                color: 'var(--theme-primary)',
              }}
            >
              Green Valley Farm
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography
                variant='body2'
                sx={{ color: 'var(--theme-text-secondary)' }}
              >
                Home • Products • About • Contact
              </Typography>
              <IconButton size='small' sx={{ color: 'var(--theme-primary)' }}>
                <ShoppingCart />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Hero Section */}
        <Box
          sx={{
            backgroundColor: 'var(--theme-primary)',
            color: 'white',
            p: 4,
            textAlign: 'center',
            background:
              theme.customProperties['--gradient-primary'] ||
              `var(--theme-primary)`,
          }}
        >
          <Typography
            variant='h3'
            sx={{
              fontFamily: 'var(--theme-font-primary)',
              fontWeight: 700,
              mb: 1,
              fontSize: 'var(--theme-text-3xl)',
            }}
          >
            Fresh From Our Farm
          </Typography>
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'var(--theme-font-secondary)',
              opacity: 0.9,
              mb: 2,
              fontSize: 'var(--theme-text-lg)',
            }}
          >
            Organic produce grown with love and care
          </Typography>
          <Button
            variant='contained'
            size='large'
            sx={{
              backgroundColor: 'var(--theme-accent)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              '&:hover': {
                backgroundColor: 'var(--theme-accent)',
                filter: `brightness(${theme.customProperties['--button-hover-brightness'] || '1.1'})`,
              },
              transition: 'var(--theme-transition-fast)',
            }}
          >
            Shop Now
          </Button>
        </Box>

        {/* About Section */}
        <Box sx={{ p: 3, backgroundColor: 'var(--theme-surface)' }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={8}>
              <Typography
                variant='h5'
                sx={{
                  fontFamily: 'var(--theme-font-primary)',
                  fontWeight: 600,
                  color: 'var(--theme-text-primary)',
                  mb: 1,
                }}
              >
                Welcome to Our Farm
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  fontFamily: 'var(--theme-font-secondary)',
                  color: 'var(--theme-text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {theme.category === 'rustic'
                  ? 'For three generations, our family has been cultivating the finest organic produce using traditional farming methods passed down through the years.'
                  : theme.category === 'vibrant'
                    ? "We're passionate about bringing you the most vibrant, flavorful produce that will transform your meals into culinary adventures!"
                    : 'We specialize in sustainable farming practices to bring you the highest quality organic produce, grown with care for both you and the environment.'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'var(--theme-primary)',
                  fontSize: 'var(--theme-text-2xl)',
                }}
              >
                JD
              </Avatar>
            </Grid>
          </Grid>
        </Box>

        {/* Search & Filter */}
        <Box sx={{ p: 3, backgroundColor: 'var(--theme-surface)' }}>
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'var(--theme-font-primary)',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              mb: 2,
            }}
          >
            Search & Filter
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                flex: 1,
                height: 40,
                backgroundColor: 'var(--theme-background)',
                borderRadius: 'var(--theme-radius-sm)',
                border: '1px solid var(--theme-border)',
                display: 'flex',
                alignItems: 'center',
                px: 2,
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Search products...
              </Typography>
            </Box>
            <Button
              variant='outlined'
              size='small'
              sx={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '&:hover': {
                  borderColor: 'var(--theme-primary)',
                  backgroundColor: 'var(--theme-surface)',
                },
              }}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Featured Products */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant='h5'
            sx={{
              fontFamily: 'var(--theme-font-primary)',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              mb: 2,
            }}
          >
            Featured Products
          </Typography>
          <Grid container spacing={2}>
            {mockProducts.map((product) => (
              <Grid item xs={4} key={product.id}>
                <Card
                  sx={{
                    borderRadius: 'var(--theme-radius-md)',
                    boxShadow: 'var(--theme-shadow-sm)',
                    transition: 'var(--theme-transition-normal)',
                    '&:hover': {
                      transform: `scale(${theme.customProperties['--card-hover-scale'] || '1.02'})`,
                      boxShadow: 'var(--theme-shadow-md)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      backgroundColor: 'var(--theme-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius:
                        'var(--theme-radius-md) var(--theme-radius-md) 0 0',
                    }}
                  >
                    <Typography
                      variant='body2'
                      sx={{ color: 'var(--theme-text-muted)' }}
                    >
                      Product Image
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography
                      variant='subtitle2'
                      sx={{
                        fontWeight: 600,
                        color: 'var(--theme-text-primary)',
                        mb: 0.5,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Rating value={product.rating} size='small' readOnly />
                      <Typography
                        variant='caption'
                        sx={{ color: 'var(--theme-text-muted)' }}
                      >
                        ({product.reviews})
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant='subtitle2'
                        sx={{
                          color: 'var(--theme-primary)',
                          fontWeight: 700,
                        }}
                      >
                        {product.price}
                      </Typography>
                      <IconButton
                        size='small'
                        sx={{
                          backgroundColor: 'var(--theme-primary)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'var(--theme-primary)',
                            filter: 'brightness(0.9)',
                          },
                        }}
                      >
                        <ShoppingCart sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonial */}
        <Box
          sx={{
            backgroundColor: 'var(--theme-surface)',
            p: 3,
            borderTop: `1px solid var(--theme-border)`,
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'var(--theme-font-primary)',
              fontWeight: 600,
              color: 'var(--theme-text-primary)',
              mb: 2,
            }}
          >
            What Our Customers Say
          </Typography>
          <Card
            sx={{
              p: 2,
              backgroundColor: 'var(--theme-background)',
              borderLeft: `4px solid var(--theme-accent)`,
              borderRadius: 'var(--theme-radius-md)',
              boxShadow: 'var(--theme-shadow-sm)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar
                src={mockTestimonial.avatar}
                sx={{ width: 40, height: 40 }}
              >
                {mockTestimonial.name[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'var(--theme-font-secondary)',
                    color: 'var(--theme-text-primary)',
                    mb: 1,
                    fontStyle:
                      theme.category === 'rustic' ? 'italic' : 'normal',
                  }}
                >
                  "{mockTestimonial.text}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'var(--theme-text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {mockTestimonial.name}
                  </Typography>
                  <Rating
                    value={mockTestimonial.rating}
                    size='small'
                    readOnly
                  />
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            backgroundColor: 'var(--theme-primary)',
            color: 'white',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Grid container spacing={2} alignItems='center'>
            <Grid item xs={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'center',
                }}
              >
                <LocationOn sx={{ fontSize: 16 }} />
                <Typography variant='caption'>
                  123 Farm Lane, Valley Town
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <IconButton size='small' sx={{ color: 'white' }}>
                  <Facebook sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size='small' sx={{ color: 'white' }}>
                  <Instagram sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size='small' sx={{ color: 'white' }}>
                  <Twitter sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  justifyContent: 'center',
                }}
              >
                <Phone sx={{ fontSize: 16 }} />
                <Typography variant='caption'>(555) 123-4567</Typography>
              </Box>
            </Grid>
          </Grid>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              mt: 1,
              opacity: 0.8,
              fontFamily: 'var(--theme-font-secondary)',
            }}
          >
            © 2024 Green Valley Farm • All Rights Reserved
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ThemePreview;
