import React from 'react';
import { Box, Container, Typography, Avatar, Paper, Grid } from '@mui/material';
import { Store } from '@mui/icons-material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '@/features/search/services/storefront.api';

interface StoreIntroductionModuleProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
}

const StoreIntroductionModule: React.FC<StoreIntroductionModuleProps> = ({
  module,
  storefront,
}) => {
  const settings = module.settings || {};

  // Get settings with fallbacks
  const content = (settings.content as string) || storefront.description || '';
  const showOwnerPhoto = (settings.showOwnerPhoto as boolean) !== false; // Default to true
  const textAlignment = (settings.textAlignment as string) || 'left';

  // Use logo as owner photo if available
  const ownerPhotoUrl = storefront.store.logoUrl || storefront.logoUrl;

  // Convert HTML content to display properly
  const renderContent = () => {
    if (content.includes('<p>') || content.includes('<br>')) {
      return (
        <Typography
          variant='body1'
          sx={{
            textAlign: textAlignment as any,
            lineHeight: 1.7,
            fontSize: 'var(--theme-text-lg, 1.125rem)',
            color: 'var(--theme-text-primary, #0f172a)',
            fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
            '& p': {
              marginBottom: 2,
              '&:last-child': {
                marginBottom: 0,
              },
            },
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <Typography
        variant='body1'
        sx={{
          textAlign: textAlignment as any,
          lineHeight: 1.7,
          fontSize: 'var(--theme-text-lg, 1.125rem)',
          color: 'var(--theme-text-primary, #0f172a)',
          fontFamily: 'var(--theme-font-primary, Inter, sans-serif)',
          whiteSpace: 'pre-line', // Preserve line breaks
        }}
      >
        {content}
      </Typography>
    );
  };

  if (!content.trim()) {
    return null; // Don't render if no content
  }

  return (
    <Box sx={{ py: 8, backgroundColor: 'var(--theme-surface, #f8fafc)' }}>
      <Container maxWidth='xl' sx={{ px: { xs: 2, md: 4 } }}>
        <Paper
          elevation={1}
          sx={{
            p: { xs: 4, md: 8 },
            backgroundColor: 'var(--theme-background, white)',
            borderRadius: 'var(--theme-radius-lg, 12px)',
            boxShadow: 'var(--theme-shadow-lg, 0 4px 20px rgba(0, 0, 0, 0.08))',
          }}
        >
          <Grid container spacing={6} alignItems='center'>
            {/* Owner Photo */}
            {showOwnerPhoto && ownerPhotoUrl && (
              <Grid item xs={12} md={4} lg={3}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: {
                      xs: 'center',
                      md: textAlignment === 'right' ? 'flex-end' : 'flex-start',
                    },
                    mb: { xs: 2, md: 0 },
                  }}
                >
                  <Avatar
                    src={ownerPhotoUrl}
                    alt={`${storefront.storeName} Logo`}
                    sx={{
                      width: { xs: 140, md: 180, lg: 200 },
                      height: { xs: 140, md: 180, lg: 200 },
                      border: '4px solid',
                      borderColor: 'primary.main',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Store sx={{ fontSize: '3rem', color: 'primary.main' }} />
                  </Avatar>
                </Box>
              </Grid>
            )}

            {/* Content */}
            <Grid
              item
              xs={12}
              md={showOwnerPhoto && ownerPhotoUrl ? 8 : 12}
              lg={showOwnerPhoto && ownerPhotoUrl ? 9 : 12}
            >
              <Box>
                {/* Store Name as Header */}
                <Typography
                  variant='h3'
                  component='h2'
                  sx={{
                    mb: 3,
                    textAlign: textAlignment as any,
                    fontWeight: 'bold',
                    color: 'primary.main',
                  }}
                >
                  {module.title || `About ${storefront.storeName}`}
                </Typography>

                {/* Story Content */}
                <Box
                  sx={{
                    maxWidth: textAlignment === 'center' ? 800 : 'none',
                    margin: textAlignment === 'center' ? '0 auto' : 'initial',
                  }}
                >
                  {renderContent()}
                </Box>

                {/* Store Highlights */}
                {storefront.store.categories &&
                  storefront.store.categories.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                      <Typography
                        variant='h6'
                        sx={{
                          mb: 2,
                          textAlign: textAlignment as any,
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        What We Offer
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          justifyContent:
                            textAlignment === 'center'
                              ? 'center'
                              : textAlignment === 'right'
                                ? 'flex-end'
                                : 'flex-start',
                        }}
                      >
                        {storefront.store.categories
                          .slice(0, 5)
                          .map((category: any, index: number) => (
                            <Box
                              key={index}
                              sx={{
                                px: 2,
                                py: 1,
                                backgroundColor: 'primary.main',
                                color: 'white',
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                fontWeight: 500,
                              }}
                            >
                              {category.categoryName || category.name}
                            </Box>
                          ))}
                      </Box>
                    </Box>
                  )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default StoreIntroductionModule;
