# Theme System Developer Integration Guide

## Quick Start

### 1. Import Required Components
```typescript
import { 
  ThemeSelector,
  ThemePreview,
  EnhancedThemePreview,
  ThemeComparison 
} from '@/components/storefront';
import { 
  AVAILABLE_THEMES, 
  generateThemeCSS,
  getThemeById 
} from '@/types/themes';
```

### 2. Basic Theme Selection
```tsx
const [selectedTheme, setSelectedTheme] = useState(AVAILABLE_THEMES[0]);

<ThemeSelector
  selectedThemeId={selectedTheme.id}
  onThemeSelect={(theme) => setSelectedTheme(theme)}
  onPreviewTheme={(theme) => console.log('Preview:', theme)}
/>
```

### 3. Apply Theme to Component
```tsx
const themeCSS = generateThemeCSS(selectedTheme);

<div>
  <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
  <YourStoreComponent />
</div>
```

## API Integration

### Save Theme Selection
```typescript
const saveThemeSelection = async (storeId: number, themeId: string) => {
  const response = await fetch(`/api/stores/${storeId}/customization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      themeId,
      modules: currentModules,
      globalSettings: selectedTheme.globalSettings,
      customCss: generateThemeCSS(selectedTheme),
      isPublished: false
    })
  });
  return response.json();
};
```

### Publish Theme to Live Store
```typescript
const publishTheme = async (storeId: number, customization: StorefrontCustomization) => {
  const response = await fetch(`/api/stores/${storeId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...customization,
      isPublished: true,
      publishedAt: new Date().toISOString()
    })
  });
  return response.json();
};
```

## Theme Structure

### Complete Theme Object
```typescript
const customTheme: StorefrontTheme = {
  id: 'custom-theme',
  name: 'Custom Theme',
  description: 'A custom theme for specific needs',
  category: 'modern',
  previewImage: '/themes/custom-preview.jpg',
  
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#059669',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      muted: '#94a3b8'
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      secondary: 'Georgia, serif'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem'
  },
  
  layout: {
    maxWidth: '1200px',
    containerPadding: '1rem',
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px'
    }
  },
  
  effects: {
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px'
    },
    transition: {
      fast: 'all 0.15s ease-in-out',
      normal: 'all 0.3s ease-in-out',
      slow: 'all 0.5s ease-in-out'
    }
  },
  
  customProperties: {
    '--hero-overlay': '0.2',
    '--card-hover-scale': '1.02'
  },
  
  recommendedFor: [
    'Modern businesses',
    'Tech products',
    'Professional services'
  ],
  
  inspiration: 'Inspired by modern SaaS platforms'
};
```

## Component Integration

### Using Theme in Module Components
```tsx
// In a module component (e.g., HeroBannerModule.tsx)
const HeroBannerModule: React.FC<ModuleProps> = ({ settings, theme }) => {
  return (
    <Box
      sx={{
        backgroundColor: 'var(--theme-surface)',
        color: 'var(--theme-text-primary)',
        fontFamily: 'var(--theme-font-primary)',
        borderRadius: 'var(--theme-radius-lg)',
        padding: 'var(--theme-spacing-xl)',
        boxShadow: 'var(--theme-shadow-md)'
      }}
    >
      <Typography variant="h1" sx={{ color: 'var(--theme-primary)' }}>
        {settings.title}
      </Typography>
    </Box>
  );
};
```

### Theme-Aware Product Cards
```tsx
const ProductCard: React.FC<{ product: Product; theme: StorefrontTheme }> = ({ 
  product, 
  theme 
}) => {
  // Different rendering based on theme category
  switch (theme.category) {
    case 'industrial':
      return <IndustrialProductCard product={product} />;
    case 'gallery':
      return <GalleryProductCard product={product} />;
    case 'minimalist':
      return <MinimalProductCard product={product} />;
    default:
      return <StandardProductCard product={product} />;
  }
};
```

## Advanced Features

### Custom CSS Injection
```typescript
const injectCustomCSS = (theme: StorefrontTheme, customCSS: string) => {
  const baseCSS = generateThemeCSS(theme);
  const combinedCSS = `
    ${baseCSS}
    
    /* Custom Overrides */
    ${customCSS}
  `;
  
  return combinedCSS;
};
```

### Theme Persistence
```typescript
// Save theme preference to localStorage
const saveThemePreference = (themeId: string) => {
  localStorage.setItem('preferredTheme', themeId);
};

// Load saved theme on component mount
const loadSavedTheme = () => {
  const savedThemeId = localStorage.getItem('preferredTheme');
  if (savedThemeId) {
    const theme = getThemeById(savedThemeId);
    if (theme) {
      setSelectedTheme(theme);
    }
  }
};
```

### Theme Analytics
```typescript
// Track theme usage
const trackThemeSelection = (themeId: string, storeId: number) => {
  analytics.track('Theme Selected', {
    themeId,
    storeId,
    timestamp: new Date().toISOString()
  });
};

// Track theme performance
const trackThemePerformance = (themeId: string, metrics: ThemeMetrics) => {
  analytics.track('Theme Performance', {
    themeId,
    loadTime: metrics.loadTime,
    conversionRate: metrics.conversionRate,
    bounceRate: metrics.bounceRate
  });
};
```

## Testing Themes

### Unit Tests
```typescript
describe('ThemeSelector', () => {
  it('should display all available themes', () => {
    render(<ThemeSelector />);
    expect(screen.getAllByTestId('theme-option')).toHaveLength(10);
  });
  
  it('should apply selected theme CSS', () => {
    const { container } = render(<ThemePreview theme={CLEAN_MODERN_THEME} />);
    const styles = container.querySelector('style');
    expect(styles?.innerHTML).toContain('--theme-primary: #2563eb');
  });
});
```

### E2E Tests
```typescript
describe('Theme Customization Flow', () => {
  it('should allow theme selection and preview', async () => {
    await page.goto('/customization');
    await page.click('[data-theme="rustic-artisanal"]');
    await page.waitForSelector('.preview-container');
    
    const previewStyle = await page.$eval(
      '.preview-container',
      el => getComputedStyle(el).getPropertyValue('--theme-primary')
    );
    expect(previewStyle).toBe('#92400e');
  });
});
```

## Performance Optimization

### Lazy Load Themes
```typescript
const loadTheme = async (themeId: string) => {
  const theme = await import(`@/themes/${themeId}`);
  return theme.default;
};
```

### CSS-in-JS Optimization
```typescript
const memoizedThemeCSS = useMemo(
  () => generateThemeCSS(selectedTheme),
  [selectedTheme.id]
);
```

### Image Optimization
```typescript
const getOptimizedThemeImage = (theme: StorefrontTheme) => {
  return {
    src: theme.previewImage,
    srcSet: `
      ${theme.previewImage}?w=300 300w,
      ${theme.previewImage}?w=600 600w,
      ${theme.previewImage}?w=1200 1200w
    `,
    sizes: '(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px'
  };
};
```

## Troubleshooting

### Common Issues

1. **Theme not applying correctly**
```typescript
// Check if CSS variables are properly injected
console.log(getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'));
```

2. **Theme preview not updating**
```typescript
// Force re-render after theme change
const [key, setKey] = useState(0);
const updateTheme = (theme) => {
  setSelectedTheme(theme);
  setKey(prev => prev + 1); // Force re-render
};
```

3. **Custom properties not working**
```typescript
// Ensure custom properties are prefixed
const validateCustomProperties = (props: Record<string, string>) => {
  return Object.entries(props).reduce((acc, [key, value]) => {
    const prefixedKey = key.startsWith('--') ? key : `--${key}`;
    return { ...acc, [prefixedKey]: value };
  }, {});
};
```

## Resources

- **Theme Documentation**: `/docs/themes`
- **Component Library**: `/docs/components`
- **API Reference**: `/docs/api/themes`
- **Example Implementation**: `/examples/theme-implementation`
- **Support**: developers@farmertrading.com