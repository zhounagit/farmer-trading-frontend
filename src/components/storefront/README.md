# Storefront Themes Documentation

This directory contains the theme system for customizable storefronts in the Farmer Trading Platform. The theme system provides three pre-designed templates that can be customized to match different farming and artisanal brand aesthetics.

## Overview

The storefront theme system consists of three main components:

1. **Theme Definitions** (`../../types/themes.ts`) - Core theme data structures and predefined themes
2. **Theme Selector** (`ThemeSelector.tsx`) - Component for choosing between available themes
3. **Theme Customizer** (`ThemeCustomizer.tsx`) - Advanced customization interface
4. **Theme Preview** (`ThemePreview.tsx`) - Live preview component showing theme application

## Available Themes

### 1. Clean & Modern Theme
- **Best for:** High-quality product photography, professional farming operations
- **Characteristics:** White background, plenty of whitespace, sans-serif fonts (Inter/Roboto)
- **Color Palette:** Modern blues, grays, and clean whites
- **Inspiration:** D2C brands like Allbirds and Glossier
- **Use Cases:**
  - Premium organic produce vendors
  - Professional farming operations
  - Minimalist aesthetic preferences
  - Direct-to-consumer brands

### 2. Rustic & Artisanal Theme
- **Best for:** Family farms, artisanal food producers, traditional farming
- **Characteristics:** Warm colors, serif fonts (Merriweather), authentic feel
- **Color Palette:** Amber browns, warm stones, natural greens
- **Inspiration:** Local farmers markets and artisanal brands like Stone Buhr
- **Use Cases:**
  - Family-owned farms
  - Heritage seed varieties
  - Traditional farming methods
  - Homestyle and authentic products
  - Farmers market vendors

### 3. Bold & Vibrant Theme
- **Best for:** Unique products, specialty items, energetic brands
- **Characteristics:** Bold colors, dynamic typography, energetic design
- **Color Palette:** Bold reds, vibrant purples, bright oranges
- **Inspiration:** Energetic brands like Lush and Misfits Market
- **Use Cases:**
  - Specialty hot sauces
  - Exotic fruits and vegetables
  - Vibrant handmade crafts
  - Products targeting younger demographics

## Usage

### Basic Theme Selection

```typescript
import { ThemeSelector } from '../components/storefront';
import { StorefrontTheme } from '../types/themes';

function MyStorefrontCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState<StorefrontTheme | null>(null);

  const handleThemeSelect = (theme: StorefrontTheme) => {
    setSelectedTheme(theme);
    // Apply theme to your storefront
  };

  return (
    <ThemeSelector
      selectedThemeId={selectedTheme?.id}
      onThemeSelect={handleThemeSelect}
    />
  );
}
```

### Advanced Theme Customization

```typescript
import { ThemeCustomizer } from '../components/storefront';

function AdvancedCustomizer() {
  const [customTheme, setCustomTheme] = useState<StorefrontTheme | null>(null);

  return (
    <ThemeCustomizer
      selectedThemeId={customTheme?.id}
      onThemeChange={setCustomTheme}
      onSave={(theme) => {
        // Save customized theme
        console.log('Saving theme:', theme);
      }}
    />
  );
}
```

### Theme Preview

```typescript
import { ThemePreview } from '../components/storefront';
import { CLEAN_MODERN_THEME } from '../types/themes';

function PreviewDemo() {
  return (
    <ThemePreview theme={CLEAN_MODERN_THEME} />
  );
}
```

## Theme Structure

Each theme includes the following customizable properties:

### Colors
- **Primary/Secondary/Accent:** Main brand colors
- **Background/Surface:** Layout backgrounds
- **Text:** Primary, secondary, and muted text colors
- **Border/Shadow:** UI element styling

### Typography
- **Font Families:** Primary and secondary font stacks
- **Font Sizes:** Responsive size scale (xs to 4xl)
- **Font Weights:** Normal, medium, semibold, bold
- **Line Heights:** Tight, normal, relaxed

### Layout
- **Max Width:** Container maximum width
- **Padding:** Container padding values
- **Border Radius:** Corner rounding (sm to xl)
- **Breakpoints:** Responsive design breakpoints

### Effects
- **Box Shadows:** Depth and elevation effects
- **Transitions:** Animation timing and easing
- **Custom Properties:** Theme-specific CSS variables

## Customization Options

### Color Customization
- Interactive color picker for all color properties
- Real-time preview updates
- Organized by categories (Primary, Background, Text)

### Typography Customization
- Font family selection from curated list
- Font weight sliders (100-900)
- Line height adjustments

### Layout Customization
- Container width and padding controls
- Border radius adjustments
- Spacing preference settings

## CSS Generation

The theme system automatically generates CSS custom properties:

```typescript
import { generateThemeCSS } from '../types/themes';

const theme = getThemeById('clean-modern');
const cssVariables = generateThemeCSS(theme);
// Outputs CSS custom properties like:
// :root {
//   --theme-primary: #2563eb;
//   --theme-background: #ffffff;
//   --theme-font-primary: Inter, sans-serif;
//   ...
// }
```

## Integration with Storefront

### Applying Themes
1. Select a base theme using `ThemeSelector`
2. Optionally customize using `ThemeCustomizer`
3. Generate CSS using `generateThemeCSS()`
4. Apply the CSS to your storefront components

### Theme Persistence
Themes should be saved in the storefront customization data:

```typescript
interface StorefrontCustomization {
  storeId: number;
  themeId?: string;
  globalSettings: {
    // Theme-generated settings
  };
  customCss?: string; // Generated theme CSS
  // ... other properties
}
```

## Best Practices

1. **Theme Selection:** Choose themes based on product type and target audience
2. **Customization:** Make subtle adjustments rather than dramatic changes
3. **Consistency:** Maintain visual consistency across all storefront modules
4. **Performance:** Use CSS custom properties for optimal performance
5. **Accessibility:** Ensure sufficient color contrast for text readability

## File Structure

```
src/components/storefront/
├── README.md              # This documentation
├── index.ts               # Component exports
├── ThemeSelector.tsx      # Theme selection interface
├── ThemeCustomizer.tsx    # Advanced customization
└── ThemePreview.tsx       # Live theme preview

src/types/
└── themes.ts              # Theme definitions and utilities
```

## Future Enhancements

Planned improvements for the theme system:

1. **Custom Theme Creation:** Allow users to create entirely custom themes
2. **Theme Marketplace:** Community-contributed themes
3. **Advanced Animations:** Motion and micro-interaction presets
4. **Accessibility Tools:** Automated contrast checking and suggestions
5. **Mobile Optimization:** Mobile-specific theme variants
6. **Theme Analytics:** Usage statistics and performance metrics

## Support

For questions or issues with the theme system:

1. Check the theme preview to ensure expected behavior
2. Verify CSS generation is working correctly
3. Test theme customizations in a safe environment
4. Consult the main storefront customization documentation