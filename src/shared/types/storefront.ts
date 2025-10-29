// Consolidated Storefront Types - Single Source of Truth

export interface Storefront {
  storefrontId: number;
  storeId: number;
  slug: string;
  title: string;
  description?: string;
  isPublished: boolean;
  isActive: boolean;
  customization: StorefrontCustomization;
  seoSettings: SEOSettings;
  socialMedia: SocialMediaSettings;
  analytics: StorefrontAnalytics;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastViewedAt?: string;

  // Related data (optional)
  store?: {
    storeName: string;
    logoUrl?: string;
    contactInfo: {
      email?: string;
      phone?: string;
    };
  };
  featuredProducts?: StorefrontProduct[];
  categories?: StorefrontCategory[];
  reviews?: StorefrontReview[];
}

export interface StorefrontCustomization {
  // Theme and Layout
  theme: StorefrontTheme;
  layout: LayoutType;
  colorScheme: ColorScheme;
  typography: TypographySettings;

  // Header and Navigation
  header: HeaderSettings;
  navigation: NavigationSettings;

  // Hero Section
  heroSection: HeroSectionSettings;

  // Product Display
  productDisplay: ProductDisplaySettings;

  // Footer
  footer: FooterSettings;

  // Custom CSS
  customCss?: string;
  customJs?: string;
}

export interface StorefrontTheme {
  id: string;
  name: string;
  category: 'modern' | 'classic' | 'minimalist' | 'rustic' | 'elegant';
  isPremium: boolean;
  previewUrl?: string;
  thumbnailUrl?: string;
}

export interface ColorScheme {
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
  success: string;
  warning: string;
  error: string;
}

export interface TypographySettings {
  fontFamily: {
    heading: string;
    body: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface HeaderSettings {
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  showStoreName: boolean;
  showTagline: boolean;
  tagline?: string;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  isSticky: boolean;
  backgroundColor: string;
  textColor: string;
}

export interface NavigationSettings {
  style: 'horizontal' | 'vertical' | 'dropdown';
  showCategories: boolean;
  showSearch: boolean;
  showCart: boolean;
  showAccount: boolean;
  customMenuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
  openInNewTab: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface HeroSectionSettings {
  isEnabled: boolean;
  type: 'banner' | 'slideshow' | 'video' | 'split';
  content: HeroContent;
  layout: 'full-width' | 'contained' | 'split-left' | 'split-right';
  height: 'small' | 'medium' | 'large' | 'full';
  backgroundSettings: BackgroundSettings;
}

export interface HeroContent {
  headline?: string;
  subheadline?: string;
  description?: string;
  ctaButton?: {
    text: string;
    url: string;
    style: 'primary' | 'secondary' | 'outline';
  };
  images?: HeroImage[];
  videoUrl?: string;
}

export interface HeroImage {
  id: string;
  url: string;
  altText: string;
  caption?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image' | 'video';
  color?: string;
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
  imageUrl?: string;
  videoUrl?: string;
  overlay?: {
    color: string;
    opacity: number;
  };
}

export interface ProductDisplaySettings {
  layout: 'grid' | 'list' | 'masonry';
  itemsPerRow: number;
  showProductImages: boolean;
  showProductPrices: boolean;
  showProductDescription: boolean;
  showProductRating: boolean;
  showProductBadges: boolean;
  showAddToCartButton: boolean;
  showQuickViewButton: boolean;
  sortOptions: ProductSortOption[];
  filterOptions: ProductFilterOption[];
}

export interface ProductSortOption {
  id: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
  isDefault: boolean;
  isActive: boolean;
}

export interface ProductFilterOption {
  id: string;
  type: 'category' | 'price' | 'rating' | 'availability' | 'custom';
  label: string;
  field?: string;
  options?: { value: string; label: string }[];
  isActive: boolean;
}

export interface FooterSettings {
  isEnabled: boolean;
  layout: 'single-column' | 'multi-column' | 'split';
  showLogo: boolean;
  showContactInfo: boolean;
  showSocialLinks: boolean;
  showNewsletter: boolean;
  showBusinessHours: boolean;
  customSections: FooterSection[];
  copyrightText?: string;
  backgroundColor: string;
  textColor: string;
}

export interface FooterSection {
  id: string;
  title: string;
  content: string;
  links?: { label: string; url: string; isExternal: boolean }[];
  sortOrder: number;
  isActive: boolean;
}

export interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robotsDirective?: string;
  structuredData?: Record<string, unknown>;
}

export interface SocialMediaSettings {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  pinterest?: string;
  website?: string;
  showSocialIcons: boolean;
  socialIconStyle: 'round' | 'square' | 'outline';
  socialIconSize: 'sm' | 'md' | 'lg';
}

export interface StorefrontAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  pageViews: Record<string, number>;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  topReferrers: { source: string; visits: number }[];
  popularProducts: { productId: number; views: number }[];
  searchTerms: { term: string; count: number }[];
}

// Product-related types for storefront
export interface StorefrontProduct {
  productId: number;
  itemId: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  unit: string;
  imageUrl?: string;
  images?: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  isOrganic: boolean;
  isInStock: boolean;
  quantityAvailable: number;
  averageRating?: number;
  totalReviews?: number;
  badges?: ProductBadge[];
  variants?: ProductVariant[];
  isFeatured: boolean;
  sortOrder: number;
}

export interface ProductBadge {
  id: string;
  type:
    | 'organic'
    | 'sale'
    | 'new'
    | 'bestseller'
    | 'limited'
    | 'seasonal'
    | 'custom';
  label: string;
  color: string;
  backgroundColor: string;
}

export interface ProductVariant {
  variantId: number;
  name: string;
  price: number;
  quantityAvailable: number;
  attributes: { name: string; value: string }[];
  isAvailable: boolean;
}

export interface StorefrontCategory {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount: number;
  isActive: boolean;
  sortOrder: number;
  parentCategoryId?: number;
  subcategories?: StorefrontCategory[];
}

export interface StorefrontReview {
  reviewId: number;
  productId?: number;
  storeId: number;
  customerName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerified: boolean;
  isPublic: boolean;
  createdAt: string;
  helpfulCount: number;
}

// Search and filtering
export interface StorefrontSearchParams {
  query?: string;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  inStockOnly?: boolean;
  tags?: string[];
  sortBy?: 'name' | 'price' | 'rating' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StorefrontSearchResult {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  filters: SearchFilter[];
  suggestions?: string[];
}

export interface SearchFilter {
  type: 'category' | 'price' | 'rating' | 'availability' | 'organic' | 'tags';
  label: string;
  values: FilterValue[];
}

export interface FilterValue {
  value: string | number;
  label: string;
  count: number;
  isSelected: boolean;
}

// Request/Response types
export interface CreateStorefrontRequest {
  storeId: number;
  slug: string;
  title: string;
  description?: string;
  customization?: Partial<StorefrontCustomization>;
  seoSettings?: Partial<SEOSettings>;
  socialMedia?: Partial<SocialMediaSettings>;
}

export interface UpdateStorefrontRequest {
  title?: string;
  description?: string;
  slug?: string;
  customization?: Partial<StorefrontCustomization>;
  seoSettings?: Partial<SEOSettings>;
  socialMedia?: Partial<SocialMediaSettings>;
}

export interface StorefrontPublishRequest {
  isPublished: boolean;
  scheduledPublishAt?: string;
}

export interface StorefrontListResponse {
  storefronts: Storefront[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface StorefrontStatsResponse {
  totalViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  topProducts: { name: string; views: number; sales: number }[];
  recentActivity: StorefrontActivity[];
  performanceMetrics: {
    loadTime: number;
    mobileScore: number;
    seoScore: number;
  };
}

export interface StorefrontActivity {
  activityId: number;
  type: 'view' | 'search' | 'product_view' | 'add_to_cart' | 'purchase';
  description: string;
  userId?: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Validation types
export interface StorefrontValidationErrors {
  title?: string;
  description?: string;
  slug?: string;
  customization?: Record<string, string>;
  seoSettings?: Record<string, string>;
  socialMedia?: Record<string, string>;
}

// Enums and constants
export type LayoutType = 'default' | 'wide' | 'boxed' | 'full-width';
export type StorefrontStatus = 'draft' | 'published' | 'archived' | 'suspended';

export const STOREFRONT_THEMES = [
  { id: 'modern', name: 'Modern', category: 'modern', isPremium: false },
  { id: 'classic', name: 'Classic', category: 'classic', isPremium: false },
  {
    id: 'minimalist',
    name: 'Minimalist',
    category: 'minimalist',
    isPremium: false,
  },
  { id: 'rustic', name: 'Rustic Farm', category: 'rustic', isPremium: true },
  { id: 'elegant', name: 'Elegant', category: 'elegant', isPremium: true },
] as const;

export const DEFAULT_COLOR_SCHEME: ColorScheme = {
  primary: '#10B981',
  secondary: '#059669',
  accent: '#F59E0B',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const DEFAULT_STOREFRONT_CUSTOMIZATION: StorefrontCustomization = {
  theme: STOREFRONT_THEMES[0],
  layout: 'default',
  colorScheme: DEFAULT_COLOR_SCHEME,
  typography: DEFAULT_TYPOGRAPHY,
  header: {
    showLogo: true,
    logoPosition: 'left',
    showStoreName: true,
    showTagline: false,
    showContactInfo: true,
    showSocialLinks: true,
    isSticky: true,
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
  },
  navigation: {
    style: 'horizontal',
    showCategories: true,
    showSearch: true,
    showCart: true,
    showAccount: true,
    customMenuItems: [],
  },
  heroSection: {
    isEnabled: true,
    type: 'banner',
    layout: 'full-width',
    height: 'medium',
    content: {
      headline: 'Fresh From Our Farm',
      subheadline: 'Discover locally grown, organic produce',
      description:
        'Support local agriculture and enjoy the freshest ingredients delivered right to your door.',
    },
    backgroundSettings: {
      type: 'color',
      color: '#F9FAFB',
    },
  },
  productDisplay: {
    layout: 'grid',
    itemsPerRow: 3,
    showProductImages: true,
    showProductPrices: true,
    showProductDescription: true,
    showProductRating: true,
    showProductBadges: true,
    showAddToCartButton: true,
    showQuickViewButton: false,
    sortOptions: [
      {
        id: 'name',
        label: 'Name',
        field: 'name',
        direction: 'asc',
        isDefault: true,
        isActive: true,
      },
      {
        id: 'price-low',
        label: 'Price: Low to High',
        field: 'price',
        direction: 'asc',
        isDefault: false,
        isActive: true,
      },
      {
        id: 'price-high',
        label: 'Price: High to Low',
        field: 'price',
        direction: 'desc',
        isDefault: false,
        isActive: true,
      },
    ],
    filterOptions: [
      { id: 'category', type: 'category', label: 'Category', isActive: true },
      { id: 'price', type: 'price', label: 'Price Range', isActive: true },
      {
        id: 'organic',
        type: 'custom',
        label: 'Organic Only',
        field: 'isOrganic',
        isActive: true,
      },
    ],
  },
  footer: {
    isEnabled: true,
    layout: 'multi-column',
    showLogo: true,
    showContactInfo: true,
    showSocialLinks: true,
    showNewsletter: true,
    showBusinessHours: true,
    customSections: [],
    backgroundColor: '#1F2937',
    textColor: '#FFFFFF',
  },
};
