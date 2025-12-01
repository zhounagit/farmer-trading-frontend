import type { RouteObject } from 'react-router-dom';
import { CartPage } from './components/CartPage';
import GuestCheckoutPage from './components/GuestCheckoutPage';
import UserCheckoutPage from './components/UserCheckoutPage';

/**
 * Cart Routes Configuration
 *
 * Defines routes for cart management functionality.
 * Follows existing route patterns from other features.
 */
export const cartRoutes: RouteObject[] = [
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/checkout',
    element: <UserCheckoutPage />,
  },
  {
    path: '/checkout/guest',
    element: <GuestCheckoutPage />,
  },
];

export default cartRoutes;
