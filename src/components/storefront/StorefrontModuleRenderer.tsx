import React from 'react';
import { Box } from '@mui/material';
import type {
  StorefrontModule,
  PublicStorefront,
} from '../../services/storefront.api';

// Module Components
import HeroBannerModule from './modules/HeroBannerModule';
import StoreIntroductionModule from './modules/StoreIntroductionModule';
import ContactFormModule from './modules/ContactFormModule';
import PolicySectionModule from './modules/PolicySectionModule';
import FeaturedProductsModule from './modules/FeaturedProductsModule';
import ProductCategoriesModule from './modules/ProductCategoriesModule';
import AllProductsModule from './modules/AllProductsModule';
import SearchFilterModule from './modules/SearchFilterModule';
import BusinessAddressModule from './modules/BusinessAddressModule';

interface StorefrontModuleRendererProps {
  module: StorefrontModule;
  storefront: PublicStorefront;
  index: number;
}

const StorefrontModuleRenderer: React.FC<StorefrontModuleRendererProps> = ({
  module,
  storefront,
  index,
}) => {
  // Don't render if module is not visible
  if (!module.isVisible) {
    return null;
  }

  const renderModule = () => {
    switch (module.type) {
      case 'hero-banner':
        return <HeroBannerModule module={module} storefront={storefront} />;

      case 'store-introduction':
        return (
          <StoreIntroductionModule module={module} storefront={storefront} />
        );

      case 'contact-form':
        return <ContactFormModule module={module} storefront={storefront} />;

      case 'policy-section':
        return <PolicySectionModule module={module} storefront={storefront} />;

      case 'featured-products':
        return (
          <FeaturedProductsModule module={module} storefront={storefront} />
        );

      case 'product-categories':
        return (
          <ProductCategoriesModule module={module} storefront={storefront} />
        );

      case 'all-products':
        return <AllProductsModule module={module} storefront={storefront} />;

      case 'search-filter':
        return <SearchFilterModule module={module} storefront={storefront} />;

      case 'business-address':
        return (
          <BusinessAddressModule module={module} storefront={storefront} />
        );

      case 'testimonials':
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <p>Testimonials Module - Coming Soon</p>
          </Box>
        );

      case 'newsletter-signup':
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <p>Newsletter Signup Module - Coming Soon</p>
          </Box>
        );

      case 'social-media':
        return (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <p>Social Media Module - Coming Soon</p>
          </Box>
        );

      default:
        // Unknown module type
        return null;
    }
  };

  return (
    <Box
      id={`module-${module.id}`}
      sx={{
        order: module.order || index,
        width: '100%',
      }}
    >
      {renderModule()}
    </Box>
  );
};

interface StorefrontModulesProps {
  storefront: PublicStorefront;
}

export const StorefrontModules: React.FC<StorefrontModulesProps> = ({
  storefront,
}) => {
  // Module filtering logic

  // Filter out modules that should appear in the footer instead of main content
  // These modules will be rendered separately in the footer section
  const footerModuleTypes = ['policy-section', 'contact-form'];

  // Sort modules by order, excluding footer modules from main content
  const sortedModules = [...(storefront.customization?.modules || [])]
    .filter((module) => module.isVisible !== false)
    .filter((module) => !footerModuleTypes.includes(module.type))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (sortedModules.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        '& > *:not(:last-child)': {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {sortedModules.map((module, index) => {
        // Add visual separation between modules
        return (
          <Box
            key={module.id}
            sx={{
              position: 'relative',
              '&:not(:first-of-type)': {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 2,
                  backgroundColor: 'primary.main',
                  opacity: 0.3,
                },
              },
            }}
          >
            <StorefrontModuleRenderer
              module={module}
              storefront={storefront}
              index={index}
            />
          </Box>
        );
      })}
    </Box>
  );
};

// Export function to get footer modules for separate rendering
export const getFooterModules = (storefront: PublicStorefront) => {
  const footerModuleTypes = ['policy-section', 'contact-form'];

  return [...(storefront.customization?.modules || [])]
    .filter((module) => module.isVisible !== false)
    .filter((module) => footerModuleTypes.includes(module.type))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
};

export default StorefrontModuleRenderer;
