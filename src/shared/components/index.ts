// Main export for shared components
export * from './ui';
export * from './layout';
export * from './forms';
export * from './feedback';

// Component composition utilities
export interface ComponentCompositionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Common component patterns
export interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'aria-label'?: string;
}

// Size variants used across components
export type ComponentSize = 'small' | 'medium' | 'large';

// Color variants used across components
export type ComponentVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Common spacing values
export type Spacing = 'none' | 'small' | 'medium' | 'large';

// Responsive breakpoint helpers
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Animation durations
export type AnimationDuration = 'short' | 'standard' | 'complex';

// Component state helpers
export interface ComponentState {
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  success?: boolean;
}

// Form field state
export interface FieldState {
  value: any;
  error?: string;
  touched?: boolean;
  dirty?: boolean;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type ChangeHandler<T = any> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;

// Common props for interactive components
export interface InteractiveProps {
  onClick?: EventHandler<React.MouseEvent>;
  onFocus?: EventHandler<React.FocusEvent>;
  onBlur?: EventHandler<React.FocusEvent>;
  onKeyDown?: EventHandler<React.KeyboardEvent>;
  onMouseEnter?: EventHandler<React.MouseEvent>;
  onMouseLeave?: EventHandler<React.MouseEvent>;
}

// Accessibility props
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Component ref types
export type ComponentRef<T = HTMLElement> = React.Ref<T>;

// Forward ref helper
export type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;
