/**
 * Cart Feature Exports
 *
 * Central export file for all cart-related components, services, and utilities.
 */

// Export services
export { CartService } from './services/userCartService';
export { GuestCartService } from './services/guestCartStorageService';
export { checkoutService } from './services/checkoutService';
export { guestService } from './services/guestService';

export { CartPage } from './components/CartPage';
export { CartItem as CartItemComponent } from './components/CartItem';
export { CartBadge } from './components/CartBadge';

// Re-export hooks for convenience
export { useCart } from '../../hooks/useCart';
export { useCartItemCount } from '../../hooks/useCartItemCount';
export { useCartValidation } from '../../hooks/useCartValidation';

// Re-export types for convenience
export type {
  Cart,
  CartItem as CartItemType,
  StoreCartGroup,
  CartOperationResult,
  UseCartReturn,
  UseCartItemCountReturn,
  UseCartValidationReturn,
} from '../../types/cart';
