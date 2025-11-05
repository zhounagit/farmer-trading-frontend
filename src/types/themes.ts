// Storefront theme definitions for customizable store templates

export interface ThemeColors {
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
}

export interface ThemeTypography {
  fontFamily: {
    primary: string;
    secondary?: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
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

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeLayout {
  maxWidth: string;
  containerPadding: string;
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ThemeEffects {
  boxShadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  blur: {
    sm: string;
    md: string;
    lg: string;
  };
  transition: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface StorefrontTheme {
  id: string;
  name: string;
  description: string;
  category:
    | 'modern'
    | 'rustic'
    | 'vibrant'
    | 'industrial'
    | 'gallery'
    | 'minimalist'
    | 'bold'
    | 'luxe'
    | 'vintage';
  previewImage: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  layout: ThemeLayout;
  effects: ThemeEffects;
  customProperties: Record<string, string>;
  recommendedFor: string[];
  inspiration: string;
  premium?: boolean;
}

// Theme 1: Clean & Modern Template
export const CLEAN_MODERN_THEME: StorefrontTheme = {
  id: 'clean-modern',
  name: 'Clean & Modern',
  description:
    'Clarity, functionality, and trust-building. Clean grid systems with strong typography. Perfect for professional operations and high-quality product photography.',
  category: 'modern',
  previewImage: '/themes/clean-modern-preview.jpg',
  colors: {
    primary: '#2563eb', // Modern blue
    secondary: '#64748b', // Slate gray
    accent: '#059669', // Emerald green
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8',
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: {
      primary:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
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
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  layout: {
    maxWidth: '1200px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
    transition: {
      fast: 'all 0.15s ease-in-out',
      normal: 'all 0.3s ease-in-out',
      slow: 'all 0.5s ease-in-out',
    },
  },
  customProperties: {
    '--hero-overlay': '0.2',
    '--card-hover-scale': '1.02',
    '--button-hover-brightness': '1.05',
  },
  recommendedFor: [
    'High-quality product photography',
    'Professional farming operations',
    'Premium organic produce',
    'Direct-to-consumer brands',
    'Minimalist aesthetic preferences',
  ],
  inspiration: 'Modern D2C brands like Allbirds and Glossier',
};

// Theme 2: Rustic & Artisanal Template
export const RUSTIC_ARTISANAL_THEME: StorefrontTheme = {
  id: 'rustic-artisanal',
  name: 'Rustic & Authentic',
  description:
    'Authenticity, craftsmanship, and natural quality. Features warm, sun-drenched imagery with organic layouts. Perfect for family farms and artisanal producers.',
  category: 'rustic',
  previewImage: '/themes/rustic-artisanal-preview.jpg',
  colors: {
    primary: '#92400e', // Amber brown
    secondary: '#78716c', // Warm stone
    accent: '#16a34a', // Natural green
    background: '#fffbeb', // Warm white
    surface: '#fef3c7', // Light amber
    text: {
      primary: '#451a03',
      secondary: '#78716c',
      muted: '#a8a29e',
    },
    border: '#d6d3d1',
    shadow: 'rgba(146, 64, 14, 0.15)',
  },
  typography: {
    fontFamily: {
      primary: 'Merriweather, Georgia, "Times New Roman", serif',
      secondary:
        'Source Sans Pro, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: '0.375rem',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '2.5rem',
    '2xl': '3.5rem',
    '3xl': '4.5rem',
    '4xl': '6rem',
  },
  layout: {
    maxWidth: '1100px',
    containerPadding: '1.5rem',
    borderRadius: {
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 2px 4px rgba(146, 64, 14, 0.1)',
      md: '0 4px 8px rgba(146, 64, 14, 0.15)',
      lg: '0 8px 16px rgba(146, 64, 14, 0.2)',
      xl: '0 12px 24px rgba(146, 64, 14, 0.25)',
    },
    blur: {
      sm: '3px',
      md: '6px',
      lg: '12px',
    },
    transition: {
      fast: 'all 0.2s ease-out',
      normal: 'all 0.4s ease-out',
      slow: 'all 0.6s ease-out',
    },
  },
  customProperties: {
    '--hero-overlay': '0.35',
    '--card-hover-scale': '1.01',
    '--button-hover-brightness': '1.1',
    '--texture-pattern': 'url("/textures/paper-subtle.png")',
    '--handdrawn-border': '2px solid #92400e',
  },
  recommendedFor: [
    'Family-owned farms',
    'Artisanal food producers',
    'Heritage seed varieties',
    'Traditional farming methods',
    'Homestyle and authentic products',
    'Farmers market vendors',
  ],
  inspiration: 'Local farmers markets and artisanal brands like Stone Buhr',
};

// Theme 3: Bold & Vibrant Template
export const BOLD_VIBRANT_THEME: StorefrontTheme = {
  id: 'bold-vibrant',
  name: 'Bold & Vibrant',
  description:
    'Eye-catching design with bright colors and energetic personality. Features dynamic layouts, strong visual hierarchy, and impactful presentation. Great for brands that want to stand out from the crowd.',
  category: 'vibrant',
  previewImage: '/themes/bold-vibrant-preview.jpg',
  colors: {
    primary: '#dc2626', // Bold red
    secondary: '#7c3aed', // Vibrant purple
    accent: '#f59e0b', // Bright orange
    background: '#ffffff',
    surface: '#fef2f2', // Light red tint
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      muted: '#6b7280',
    },
    border: '#f3f4f6',
    shadow: 'rgba(220, 38, 38, 0.2)',
  },
  typography: {
    fontFamily: {
      primary: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
      secondary: 'Open Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      '2xl': '1.625rem',
      '3xl': '2rem',
      '4xl': '2.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.75rem',
    xl: '2.25rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  layout: {
    maxWidth: '1300px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 2px 6px rgba(220, 38, 38, 0.15)',
      md: '0 6px 12px rgba(220, 38, 38, 0.2)',
      lg: '0 12px 20px rgba(220, 38, 38, 0.25)',
      xl: '0 20px 32px rgba(220, 38, 38, 0.3)',
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
    transition: {
      fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      normal: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  customProperties: {
    '--hero-overlay': '0.4',
    '--card-hover-scale': '1.05',
    '--button-hover-brightness': '1.15',
    '--gradient-primary': 'linear-gradient(135deg, #dc2626, #7c3aed)',
    '--gradient-accent': 'linear-gradient(45deg, #f59e0b, #dc2626)',
  },
  recommendedFor: [
    'Specialty hot sauces',
    'Exotic fruits and vegetables',
    'Vibrant handmade crafts',
    'Unique niche products',
    'Young, energetic brands',
    'Products targeting younger demographics',
  ],
  inspiration: 'Energetic brands like Lush and Misfits Market',
};

// Industrial Professional Theme
export const INDUSTRIAL_PROFESSIONAL_THEME: StorefrontTheme = {
  id: 'industrial-professional',
  name: 'Industrial Professional',
  description:
    'Focused & Functional design with clarity and trust-building. Features strong sans-serif fonts, clean grids, and card-based layouts. Perfect for B2B, industrial suppliers, and professional farming operations.',
  category: 'industrial',
  previewImage: '/themes/industrial-professional-preview.jpg',
  colors: {
    primary: '#1E3A8A', // Professional dark blue
    secondary: '#F59E0B', // Industrial orange accent
    accent: '#DC2626', // Alert red for important CTAs
    background: '#FFFFFF', // Clean white
    surface: '#F8FAFC', // Light gray for cards
    text: {
      primary: '#1F2937', // Dark gray for readability
      secondary: '#6B7280', // Medium gray for secondary text
      muted: '#9CA3AF', // Light gray for captions
    },
    border: '#E5E7EB', // Light gray border
    shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
  },
  typography: {
    fontFamily: {
      primary:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      secondary:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
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
      relaxed: 1.625,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  layout: {
    maxWidth: '1280px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)',
    },
    transition: {
      fast: '150ms ease-in-out',
      normal: '300ms ease-in-out',
      slow: '500ms ease-in-out',
    },
  },
  customProperties: {
    '--gradient-primary': 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
    '--gradient-secondary': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    '--gradient-hero':
      'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #3B82F6 100%)',
    '--industrial-grid-bg':
      'data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23f1f5f9" fill-opacity="0.4"><path d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>',
  },
  recommendedFor: [
    'B2B agricultural suppliers',
    'Industrial equipment dealers',
    'Bulk commodity trading',
    'Commercial farming operations',
    'Professional service providers',
  ],
  inspiration:
    'Designed for serious business operations that need to project competence, reliability, and scale. Perfect for B2B agricultural suppliers who need to build trust with commercial clients.',
};

// Collection of all available themes
// Gallery-Centric & Expressive Theme
export const GALLERY_EXPRESSIVE_THEME: StorefrontTheme = {
  id: 'gallery-expressive',
  name: 'Artist Gallery',
  description:
    "Gallery-centric design where the website is an extension of the artist's portfolio. Features masonry grids, massive images with zoom, and minimal text. Perfect for artists, photographers, and creative professionals.",
  category: 'gallery',
  previewImage: '/themes/gallery-expressive-preview.jpg',
  colors: {
    primary: '#2D3748', // Charcoal gray
    secondary: '#E2E8F0', // Light gray
    accent: '#F56565', // Coral red
    background: '#FFFFFF',
    surface: '#F7FAFC',
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      muted: '#718096',
    },
    border: '#E2E8F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: {
      primary: '"Playfair Display", Georgia, serif',
      secondary: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
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
      relaxed: 1.625,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  layout: {
    maxWidth: '1200px',
    containerPadding: '2rem',
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)',
    },
    transition: {
      fast: '150ms ease-in-out',
      normal: '300ms ease-in-out',
      slow: '500ms ease-in-out',
    },
  },
  customProperties: {
    '--gallery-grid': '1fr 1fr 1fr',
    '--image-aspect-ratio': '4/3',
    '--gallery-gap': '2rem',
  },
  recommendedFor: [
    'Art galleries',
    'Photography studios',
    'Creative portfolios',
    'Design agencies',
    'Visual artists',
  ],
  inspiration:
    'Inspired by modern art galleries and creative spaces. Emphasizes visual storytelling with clean typography and strategic white space.',
};

// Minimalist/Scandinavian Theme
export const MINIMALIST_SCANDINAVIAN_THEME: StorefrontTheme = {
  id: 'minimalist-scandinavian',
  name: 'Minimalist Scandinavian',
  description:
    '"Less is more" philosophy with clarity, calmness, and functionality. Features sparse grids, maximum whitespace, and focus on product form. Perfect for design-focused brands.',
  category: 'minimalist',
  previewImage: '/themes/minimalist-scandinavian-preview.jpg',
  colors: {
    primary: '#2C3E50', // Dark blue-gray
    secondary: '#BDC3C7', // Light gray
    accent: '#3498DB', // Soft blue
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
      muted: '#BDC3C7',
    },
    border: '#ECF0F1',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: {
      primary:
        '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
      secondary:
        '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: 300,
      medium: 400,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.6,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
    '4xl': '8rem',
  },
  layout: {
    maxWidth: '1100px',
    containerPadding: '1.5rem',
    borderRadius: {
      sm: '3px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    blur: {
      sm: 'blur(2px)',
      md: 'blur(4px)',
      lg: 'blur(8px)',
    },
    transition: {
      fast: '200ms ease-out',
      normal: '350ms ease-out',
      slow: '600ms ease-out',
    },
  },
  customProperties: {
    '--minimalist-spacing': '3rem',
    '--card-elevation': '0 1px 3px rgba(0,0,0,0.1)',
    '--text-line-height': '1.6',
  },
  recommendedFor: [
    'Lifestyle brands',
    'Wellness products',
    'Home goods',
    'Sustainable products',
    'Clean beauty',
  ],
  inspiration:
    'Inspired by Scandinavian design principles. Emphasizes simplicity, functionality, and natural light.',
};

// Bold/Brutalist Theme
export const BOLD_BRUTALIST_THEME: StorefrontTheme = {
  id: 'bold-brutalist',
  name: 'Bold Brutalist',
  description:
    '"Unapologetically different" with edgy, attention-grabbing design. Features heavy typography, raw layouts, and high contrast. Perfect for streetwear, unconventional brands, and making a statement.',
  category: 'bold',
  previewImage: '/themes/bold-brutalist-preview.jpg',
  colors: {
    primary: '#000000', // Pure black
    secondary: '#FF6B35', // Orange
    accent: '#FFFF00', // Yellow
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: {
      primary: '#000000',
      secondary: '#333333',
      muted: '#666666',
    },
    border: '#000000',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  typography: {
    fontFamily: {
      primary: '"Space Grotesk", monospace',
      secondary: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '2.5rem',
      '4xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 600,
      semibold: 700,
      bold: 900,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.3,
      relaxed: 1.5,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  layout: {
    maxWidth: '1400px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '0px',
      md: '0px',
      lg: '2px',
      xl: '4px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '2px 2px 0px rgba(0, 0, 0, 1)',
      md: '4px 4px 0px rgba(0, 0, 0, 1)',
      lg: '8px 8px 0px rgba(0, 0, 0, 1)',
      xl: '12px 12px 0px rgba(0, 0, 0, 1)',
    },
    blur: {
      sm: 'blur(1px)',
      md: 'blur(2px)',
      lg: 'blur(4px)',
    },
    transition: {
      fast: '100ms ease-in',
      normal: '200ms ease-in',
      slow: '300ms ease-in',
    },
  },
  customProperties: {
    '--brutalist-border': '3px solid #000',
    '--impact-shadow': '8px 8px 0px #FF6B35',
    '--bold-transform': 'uppercase',
  },
  recommendedFor: [
    'Streetwear brands',
    'Tech startups',
    'Gaming companies',
    'Bold brands',
    'Youth-focused products',
  ],
  inspiration:
    'Inspired by brutalist architecture and bold graphic design. Emphasizes impact and memorable visual presence.',
};

// Modern & Luxe Theme
export const MODERN_LUXE_THEME: StorefrontTheme = {
  id: 'modern-luxe',
  name: 'Modern Luxe',
  description:
    '"Exclusive and high-quality" with sophisticated, sleek design. Features cinematic imagery, dark themes, and metallic accents. Perfect for premium products and luxury brands.',
  category: 'luxe',
  previewImage: '/themes/modern-luxe-preview.jpg',
  colors: {
    primary: '#1A1A1A', // Rich black
    secondary: '#D4AF37', // Gold
    accent: '#8B4513', // Bronze
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      muted: '#8A8A8A',
    },
    border: '#E8E8E8',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: {
      primary: '"Cormorant Garamond", Georgia, serif',
      secondary: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      '2xl': '1.75rem',
      '3xl': '2.25rem',
      '4xl': '3rem',
    },
    fontWeight: {
      normal: 300,
      medium: 400,
      semibold: 500,
      bold: 600,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.5,
      relaxed: 1.7,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.875rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
    '4xl': '8rem',
  },
  layout: {
    maxWidth: '1200px',
    containerPadding: '2rem',
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
      md: '0 4px 8px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
      xl: '0 16px 32px rgba(0, 0, 0, 0.15)',
    },
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)',
    },
    transition: {
      fast: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '600ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  customProperties: {
    '--luxury-gradient': 'linear-gradient(135deg, #D4AF37 0%, #8B4513 100%)',
    '--premium-border': '1px solid #D4AF37',
    '--elegant-spacing': '2.5rem',
  },
  recommendedFor: [
    'Luxury goods',
    'Premium jewelry',
    'High-end fashion',
    'Fine dining',
    'Exclusive services',
  ],
  inspiration:
    'Inspired by luxury retail and high-end brands. Emphasizes sophistication, exclusivity, and premium quality.',
};

// Vintage/Retro Theme
export const VINTAGE_RETRO_THEME: StorefrontTheme = {
  id: 'vintage-retro',
  name: 'Vintage Retro',
  description:
    '"Nostalgic and warm" design evoking specific eras. Features film filters, era-appropriate fonts, and vintage styling. Perfect for heritage brands and classic products.',
  category: 'vintage',
  previewImage: '/themes/vintage-retro-preview.jpg',
  colors: {
    primary: '#8B4513', // Saddle brown
    secondary: '#DEB887', // Burlywood
    accent: '#CD853F', // Peru
    background: '#FFF8DC', // Cornsilk
    surface: '#F5F5DC', // Beige
    text: {
      primary: '#2F2F2F',
      secondary: '#5D4E37',
      muted: '#8B7355',
    },
    border: '#D2B48C',
    shadow: 'rgba(139, 69, 19, 0.2)',
  },
  typography: {
    fontFamily: {
      primary: '"Playfair Display", Georgia, serif',
      secondary: '"Crimson Text", Georgia, serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
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
      relaxed: 1.65,
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  layout: {
    maxWidth: '1100px',
    containerPadding: '1.5rem',
    borderRadius: {
      sm: '3px',
      md: '6px',
      lg: '10px',
      xl: '15px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 1px 3px rgba(139, 69, 19, 0.12)',
      md: '0 4px 6px rgba(139, 69, 19, 0.16)',
      lg: '0 10px 15px rgba(139, 69, 19, 0.19)',
      xl: '0 20px 25px rgba(139, 69, 19, 0.25)',
    },
    blur: {
      sm: 'blur(3px)',
      md: 'blur(6px)',
      lg: 'blur(12px)',
    },
    transition: {
      fast: '250ms ease-out',
      normal: '400ms ease-out',
      slow: '650ms ease-out',
    },
  },
  customProperties: {
    '--vintage-texture': 'url("data:image/svg+xml,...")',
    '--retro-pattern':
      'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139,69,19,0.05) 2px, rgba(139,69,19,0.05) 4px)',
    '--classic-border': '2px solid #8B4513',
  },
  recommendedFor: [
    'Heritage brands',
    'Vintage shops',
    'Antique stores',
    'Classic products',
    'Traditional crafts',
  ],
  inspiration:
    'Inspired by vintage advertising and classic Americana. Emphasizes nostalgia, craftsmanship, and timeless appeal.',
};

// Theme 10: Playful & Quirky Template
export const PLAYFUL_QUIRKY_THEME: StorefrontTheme = {
  id: 'playful-quirky',
  name: 'Playful & Quirky',
  description:
    'Fun and friendly design with energetic colors and playful elements. Perfect for creative products, family-friendly farms, and brands with personality.',
  category: 'vibrant',
  previewImage: '/themes/playful-quirky-preview.jpg',
  colors: {
    primary: '#ec4899', // Bright pink
    secondary: '#8b5cf6', // Purple
    accent: '#06b6d4', // Cyan
    background: '#fefce8', // Light yellow
    surface: '#fef3c7', // Warm surface
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      muted: '#9ca3af',
    },
    border: '#fbbf24', // Yellow border
    shadow: 'rgba(236, 72, 153, 0.15)',
  },
  typography: {
    fontFamily: {
      primary: '"Quicksand", "Comic Sans MS", cursive, sans-serif',
      secondary: '"Fredoka", "Quicksand", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.75rem',
      '3xl': '2.25rem',
      '4xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8,
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '5rem',
  },
  layout: {
    maxWidth: '1280px',
    containerPadding: '1.25rem',
    borderRadius: {
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  effects: {
    boxShadow: {
      sm: '0 2px 4px 0 rgba(236, 72, 153, 0.1)',
      md: '0 6px 12px -2px rgba(139, 92, 246, 0.15)',
      lg: '0 12px 24px -4px rgba(6, 182, 212, 0.2)',
      xl: '0 24px 48px -8px rgba(236, 72, 153, 0.25)',
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
    transition: {
      fast: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      normal: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      slow: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  customProperties: {
    '--hero-overlay': '0.1',
    '--card-hover-scale': '1.05',
    '--button-hover-brightness': '1.1',
    '--playful-rotation': '2deg',
    '--bounce-animation': 'bounce 1s infinite',
    '--wiggle-animation': 'wiggle 0.5s ease-in-out',
    '--gradient-rainbow':
      'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffc600 100%)',
    '--blob-shape': 'border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%',
  },
  recommendedFor: [
    "Children's products",
    'Creative and craft items',
    'Family-friendly farms',
    'Educational products',
    'Fun food items and treats',
    'Pet products',
    'Party supplies',
    'Seasonal and holiday items',
  ],
  inspiration:
    'Inspired by brands like Bando, Sugru, and Moose Toys. Creates a delightful, energetic shopping experience with fun micro-interactions and playful design elements.',
};

export const AVAILABLE_THEMES: StorefrontTheme[] = [
  CLEAN_MODERN_THEME,
  RUSTIC_ARTISANAL_THEME,
  BOLD_VIBRANT_THEME,
  INDUSTRIAL_PROFESSIONAL_THEME,
  GALLERY_EXPRESSIVE_THEME,
  MINIMALIST_SCANDINAVIAN_THEME,
  BOLD_BRUTALIST_THEME,
  MODERN_LUXE_THEME,
  VINTAGE_RETRO_THEME,
  PLAYFUL_QUIRKY_THEME,
];

// Helper functions for theme management
export const getThemeById = (themeId: string): StorefrontTheme | undefined => {
  return AVAILABLE_THEMES.find((theme) => theme.id === themeId);
};

export const getThemesByCategory = (
  category: 'modern' | 'rustic' | 'vibrant'
): StorefrontTheme[] => {
  return AVAILABLE_THEMES.filter((theme) => theme.category === category);
};

export const generateThemeCSS = (theme: StorefrontTheme): string => {
  const cssVariables = [
    // Colors
    `--theme-primary: ${theme.colors.primary};`,
    `--theme-secondary: ${theme.colors.secondary};`,
    `--theme-accent: ${theme.colors.accent};`,
    `--theme-background: ${theme.colors.background};`,
    `--theme-surface: ${theme.colors.surface};`,
    `--theme-text-primary: ${theme.colors.text.primary};`,
    `--theme-text-secondary: ${theme.colors.text.secondary};`,
    `--theme-text-muted: ${theme.colors.text.muted};`,
    `--theme-border: ${theme.colors.border};`,
    `--theme-shadow: ${theme.colors.shadow};`,

    // Typography
    `--theme-font-primary: ${theme.typography.fontFamily.primary};`,
    `--theme-font-secondary: ${theme.typography.fontFamily.secondary || theme.typography.fontFamily.primary};`,
    `--theme-text-xs: ${theme.typography.fontSize.xs};`,
    `--theme-text-sm: ${theme.typography.fontSize.sm};`,
    `--theme-text-base: ${theme.typography.fontSize.base};`,
    `--theme-text-lg: ${theme.typography.fontSize.lg};`,
    `--theme-text-xl: ${theme.typography.fontSize.xl};`,
    `--theme-text-2xl: ${theme.typography.fontSize['2xl']};`,
    `--theme-text-3xl: ${theme.typography.fontSize['3xl']};`,
    `--theme-text-4xl: ${theme.typography.fontSize['4xl']};`,

    // Spacing
    `--theme-space-xs: ${theme.spacing.xs};`,
    `--theme-space-sm: ${theme.spacing.sm};`,
    `--theme-space-md: ${theme.spacing.md};`,
    `--theme-space-lg: ${theme.spacing.lg};`,
    `--theme-space-xl: ${theme.spacing.xl};`,
    `--theme-space-2xl: ${theme.spacing['2xl']};`,
    `--theme-space-3xl: ${theme.spacing['3xl']};`,
    `--theme-space-4xl: ${theme.spacing['4xl']};`,

    // Layout
    `--theme-max-width: ${theme.layout.maxWidth};`,
    `--theme-container-padding: ${theme.layout.containerPadding};`,
    `--theme-radius-sm: ${theme.layout.borderRadius.sm};`,
    `--theme-radius-md: ${theme.layout.borderRadius.md};`,
    `--theme-radius-lg: ${theme.layout.borderRadius.lg};`,
    `--theme-radius-xl: ${theme.layout.borderRadius.xl};`,

    // Effects
    `--theme-shadow-sm: ${theme.effects.boxShadow.sm};`,
    `--theme-shadow-md: ${theme.effects.boxShadow.md};`,
    `--theme-shadow-lg: ${theme.effects.boxShadow.lg};`,
    `--theme-shadow-xl: ${theme.effects.boxShadow.xl};`,
    `--theme-transition-fast: ${theme.effects.transition.fast};`,
    `--theme-transition-normal: ${theme.effects.transition.normal};`,
    `--theme-transition-slow: ${theme.effects.transition.slow};`,

    // Custom properties
    ...Object.entries(theme.customProperties).map(
      ([key, value]) => `${key}: ${value};`
    ),
  ];

  return `:root {\n  ${cssVariables.join('\n  ')}\n}`;
};

// Type guard function
export const isValidTheme = (theme: unknown): theme is StorefrontTheme => {
  if (!theme || typeof theme !== 'object') return false;

  const t = theme as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string' &&
    [
      'modern',
      'rustic',
      'vibrant',
      'industrial',
      'gallery',
      'minimalist',
      'bold',
      'luxe',
      'vintage',
    ].includes(t.category as string) &&
    !!t.colors &&
    !!t.typography &&
    !!t.spacing &&
    !!t.layout &&
    !!t.effects
  );
};
