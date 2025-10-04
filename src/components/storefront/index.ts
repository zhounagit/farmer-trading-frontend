// Storefront components index file
export { default as ThemeSelector } from './ThemeSelector';
export { default as ThemePreview } from './ThemePreview';
export { default as ThemeCustomizer } from './ThemeCustomizer';
export { default as ThemeSwitcher } from './ThemeSwitcher';
export { default as ThemeDiagnostic } from './ThemeDiagnostic';

// Theme enhancements
export { default as EnhancedThemePreview } from './theme-enhancements/EnhancedThemePreview';
export { default as ThemeComparison } from './theme-enhancements/ThemeComparison';
export { default as ThemeTester } from './theme-enhancements/ThemeTester';

// Re-export types for convenience
export type {
  StorefrontTheme,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeLayout,
  ThemeEffects,
} from '../../types/themes';

export {
  AVAILABLE_THEMES,
  CLEAN_MODERN_THEME,
  RUSTIC_ARTISANAL_THEME,
  BOLD_VIBRANT_THEME,
  getThemeById,
  getThemesByCategory,
  generateThemeCSS,
  isValidTheme,
} from '../../types/themes';
