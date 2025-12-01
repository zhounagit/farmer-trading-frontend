import React from 'react';
import { Badge, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useCartItemCount } from '../../../hooks/useCartItemCount';

interface CartBadgeProps {
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'default' | 'error';
}

/**
 * Cart Badge Component
 *
 * Displays cart item count in header with loading and error states.
 * Follows Material-UI patterns from existing components.
 */
export const CartBadge: React.FC<CartBadgeProps> = ({
  onClick,
  size = 'medium',
  color = 'primary',
}) => {
  const { itemCount, isLoading, error } = useCartItemCount();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (onClick) {
      onClick();
    }
  };

  // Determine badge content and color
  const badgeContent = isLoading ? (
    <CircularProgress size={12} color="inherit" />
  ) : error ? (
    '!'
  ) : (
    itemCount > 99 ? '99+' : itemCount
  );

  const badgeColor = error ? 'error' : color;

  return (
    <Tooltip title={error ? 'Cart Error - Click to retry' : `Cart (${itemCount} items)`}>
      <IconButton
        size={size}
        color={badgeColor}
        onClick={handleClick}
        aria-label={`Shopping cart with ${itemCount} items`}
        sx={{
          position: 'relative',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        <Badge
          badgeContent={badgeContent}
          color={badgeColor}
          overlap="circular"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              height: '20px',
              minWidth: '20px',
              ...(itemCount > 99 && {
                fontSize: '0.7rem',
                padding: '0 4px',
              }),
              ...(error && {
                backgroundColor: 'error.main',
                color: 'error.contrastText',
              }),
            },
          }}
        >
          <ShoppingCart />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
