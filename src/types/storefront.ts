// Types for modular storefront customization system

export type StorefrontModuleType =
  | 'hero-banner'
  | 'store-introduction'
  | 'featured-products'
  | 'product-categories'
  | 'all-products'
  | 'testimonials'
  | 'policy-section'
  | 'contact-form'
  | 'newsletter-signup'
  | 'social-media'
  | 'search-filter'
  | 'business-address';

export interface StorefrontModuleConfig {
  id: string;
  type: StorefrontModuleType;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  order: number;
  settings: Record<string, any>;
}

export interface HeroBannerSettings {
  backgroundImage?: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity: number;
  textAlignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large';
}

export interface StoreIntroductionSettings {
  content: string; // Rich text HTML
  showOwnerPhoto: boolean;
  ownerPhotoUrl?: string;
  backgroundColor?: string;
  textAlignment: 'left' | 'center' | 'right';
}

export interface FeaturedProductsSettings {
  productIds: number[];
  displayStyle: 'grid' | 'carousel' | 'list';
  productsPerRow: 2 | 3 | 4;
  showPrices: boolean;
  showQuickView: boolean;
  maxProducts: number;
}

export interface ProductCategoriesSettings {
  displayStyle: 'cards' | 'icons' | 'text';
  categoriesPerRow: 2 | 3 | 4 | 6;
  showProductCounts: boolean;
  showImages: boolean;
}

export interface AllProductsSettings {
  displayStyle: 'grid' | 'list';
  productsPerPage: 12 | 24 | 48;
  productsPerRow: 2 | 3 | 4;
  enableFiltering: boolean;
  enableSorting: boolean;
  showSearchBar: boolean;
  defaultSortBy: 'name' | 'price-low' | 'price-high' | 'newest';
}

export interface TestimonialsSettings {
  testimonialIds: string[];
  displayStyle: 'carousel' | 'grid' | 'list';
  showRatings: boolean;
  showCustomerPhotos: boolean;
  maxTestimonials: number;
  autoRotate: boolean;
  rotationInterval: number; // in seconds
}

export interface PolicySectionSettings {
  showShipping: boolean;
  showReturns: boolean;
  showContact: boolean;
  customPolicies: Array<{
    title: string;
    content: string;
  }>;
  displayStyle: 'tabs' | 'accordion' | 'sections';
}

export interface ContactFormSettings {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
    required: boolean;
    options?: string[]; // for select fields
  }>;
  submitText: string;
  successMessage: string;
  emailNotifications: boolean;
  notificationEmail?: string;
}

export interface NewsletterSignupSettings {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  position: 'inline' | 'popup' | 'sidebar';
  backgroundColor?: string;
  textColor?: string;
}

export interface SocialMediaSettings {
  platforms: Array<{
    name:
      | 'facebook'
      | 'instagram'
      | 'twitter'
      | 'youtube'
      | 'tiktok'
      | 'linkedin';
    url: string;
    enabled: boolean;
  }>;
  displayStyle: 'icons' | 'buttons' | 'text';
  iconSize: 'small' | 'medium' | 'large';
  openInNewTab: boolean;
}

export interface StorefrontTemplate {
  id: string;
  name: string;
  description: string;
  category: 'minimal' | 'modern' | 'classic' | 'bold' | 'rustic' | 'vibrant';
  previewImage: string;
  modules: StorefrontModuleConfig[];
  globalSettings: {
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: {
        primary: string;
        secondary: string;
        muted: string;
      };
      border: string;
      shadow: string;
    };
    typography: {
      fontFamily: {
        primary: string;
        secondary?: string;
      };
      fontSize: 'small' | 'medium' | 'large';
      fontWeight: {
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
      };
    };
    layout: {
      maxWidth: string;
      containerPadding: string;
      spacing: 'compact' | 'normal' | 'spacious';
      borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
    };
    effects: {
      boxShadow: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
      };
      transition: {
        fast: string;
        normal: string;
        slow: string;
      };
    };
    customProperties?: Record<string, string>;
  };
}

export interface StorefrontCustomization {
  storeId: number;
  templateId?: string;
  themeId?: string;
  modules: StorefrontModuleConfig[];
  globalSettings: StorefrontTemplate['globalSettings'];
  customCss?: string;
  isPublished: boolean;
  lastModified: string;
  createdAt: string;
}

export interface ModuleTemplate {
  type: StorefrontModuleType;
  name: string;
  description: string;
  icon: string;
  category: 'content' | 'products' | 'engagement' | 'information';
  defaultSettings: Record<string, any>;
  requiredSettings: string[];
  previewComponent: string;
  configComponent: string;
}

export interface StorefrontPreviewMode {
  device: 'desktop' | 'tablet' | 'mobile';
  isLivePreview: boolean;
  selectedModuleId?: string;
}

// API Response types
export interface GetStorefrontCustomizationResponse {
  customization: StorefrontCustomization;
  availableModules: ModuleTemplate[];
  templates: StorefrontTemplate[];
}

export interface SaveStorefrontCustomizationRequest {
  modules: StorefrontModuleConfig[];
  globalSettings: StorefrontTemplate['globalSettings'];
  themeId?: string;
  customCss?: string;
  isPublished: boolean;
}

export interface SaveStorefrontCustomizationResponse {
  success: boolean;
  customization: StorefrontCustomization;
  previewUrl: string;
  publishedUrl?: string;
}
