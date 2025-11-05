import React from 'react';
import { Box, Container, Typography, Grid, Button, Paper } from '@mui/material';
import {
  Category,
  Build,
  Engineering,
  Inventory,
  LocalShipping,
  ArrowForward,
} from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/storefront/types/public-storefront';

interface ProductCategoriesModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const ProductCategoriesModule: React.FC<ProductCategoriesModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};

  // Industrial professional styling
  const title = (settings.title as string) || 'Shop by Category';
  const subtitle =
    (settings.subtitle as string) ||
    'Find exactly what you need with our organized product categories';

  // Get categories from store or create default industrial categories
  const categories = storefront.store.categories || [];

  // Default industrial categories if none exist
  const defaultCategories = [
    {
      id: 'tools',
      name: 'Tools & Equipment',
      icon: Build,
      description: 'Professional-grade tools and equipment',
    },
    {
      id: 'parts',
      name: 'Parts & Components',
      icon: Engineering,
      description: 'Precision parts and components',
    },
    {
      id: 'supplies',
      name: 'Industrial Supplies',
      icon: Inventory,
      description: 'Essential supplies and materials',
    },
    {
      id: 'shipping',
      name: 'Shipping & Logistics',
      icon: LocalShipping,
      description: 'Shipping and logistics solutions',
    },
  ];

  const displayCategories =
    categories.length > 0 ? categories : defaultCategories;

  const getIconForCategory = (_category: any, index: number) => {
    const icons = [Build, Engineering, Inventory, LocalShipping, Category];
    const IconComponent = icons[index % icons.length];
    return IconComponent;
  };

  const handleCategoryClick = (_category: any) => {
    // Scroll to products section
    const productsSection =
      document.getElementById('products') ||
      document.querySelector('[id*="featured-products"]') ||
      document.querySelector('[id*="all-products"]');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            textAlign='center'
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
              color: '#6B7280',
              fontSize: '1.125rem',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        {/* Category Grid */}
        <Grid container spacing={3}>
          {displayCategories.map((category, index) => {
            const IconComponent =
              category.icon || getIconForCategory(category, index);

            return (
              <Grid
                size={{ xs: 12, sm: 6, lg: 3 }}
                key={
                  (category as any).categoryId || (category as any).id || index
                }
              >
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--theme-transition-normal, all 0.2s ease)',
                    border: '2px solid transparent',
                    backgroundColor: 'var(--theme-background, white)',
                    borderRadius: 'var(--theme-radius-lg, 8px)',
                    '&:hover': {
                      borderColor: 'var(--theme-accent, #F59E0B)',
                      transform: 'translateY(-4px)',
                      boxShadow:
                        'var(--theme-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1))',
                    },
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--theme-radius-md, 8px)',
                      backgroundColor: 'var(--theme-primary, #1E3A8A)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      '&:hover': {
                        backgroundColor: 'var(--theme-accent, #F59E0B)',
                      },
                      transition:
                        'var(--theme-transition-normal, all 0.2s ease)',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 32, color: 'white' }} />
                  </Box>

                  {/* Category Name */}
                  <Typography
                    variant='h6'
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      color: 'var(--theme-text-primary, #1F2937)',
                      fontSize: 'var(--theme-text-xl, 1.25rem)',
                      textAlign: 'center',
                      fontFamily:
                        'var(--theme-font-primary, Inter, sans-serif)',
                    }}
                  >
                    {(category as any).categoryName || (category as any).name}
                  </Typography>

                  {/* Description */}
                  <Typography
                    variant='body2'
                    sx={{
                      color: '#6B7280',
                      mb: 3,
                      flexGrow: 1,
                      lineHeight: 1.5,
                      fontSize: '0.875rem',
                    }}
                  >
                    {category.description ||
                      'Professional grade products and solutions'}
                  </Typography>

                  {/* Product Count & CTA */}
                  <Box sx={{ width: '100%' }}>
                    <Button
                      variant='text'
                      endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                      sx={{
                        color: '#1E3A8A',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        p: 0,
                        '&:hover': {
                          backgroundColor: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Browse Category
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Bottom CTA */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant='body2' sx={{ color: '#6B7280', mb: 2 }}>
            Can't find what you're looking for?
          </Typography>
          <Button
            variant='outlined'
            size='large'
            sx={{
              px: 4,
              py: 1.5,
              borderColor: '#1E3A8A',
              color: '#1E3A8A',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              '&:hover': {
                borderColor: '#F59E0B',
                color: '#F59E0B',
                backgroundColor: 'transparent',
              },
            }}
          >
            Contact Us for Custom Solutions
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductCategoriesModule;
