import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete, Store, Inventory } from '@mui/icons-material';
import type { CartItem as CartItemType } from '../../../types/cart';

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (itemId: number, newQuantity: number) => void;
  onRemove: (itemId: number) => void;
  disabled?: boolean;
  isGuestItem?: boolean;
}

/**
 * Cart Item Component
 *
 * Displays individual cart item with quantity controls, pricing, and status.
 * Follows Material-UI patterns from existing components.
 */
export const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
  disabled = false,
  isGuestItem = false,
}) => {
  const handleIncrease = () => {
    if (!disabled && item.isQuantityAvailable) {
      onQuantityChange(item.itemId, item.quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (!disabled && item.quantity > 1) {
      onQuantityChange(item.itemId, item.quantity - 1);
    } else if (item.quantity === 1) {
      onRemove(item.itemId);
    }
  };

  const handleRemove = () => {
    if (!disabled) {
      onRemove(item.itemId);
    }
  };

  // Determine item status and styling
  const getStatusInfo = () => {
    if (item.isOutOfStock) {
      return {
        color: 'error' as const,
        label: 'Out of Stock',
        variant: 'outlined' as const,
      };
    }
    if (item.needsQuantityAdjustment) {
      return {
        color: 'warning' as const,
        label: 'Limited Stock',
        variant: 'outlined' as const,
      };
    }
    if (!item.isActive) {
      return {
        color: 'default' as const,
        label: 'Unavailable',
        variant: 'outlined' as const,
      };
    }
    if (item.hasDiscount) {
      return {
        color: 'success' as const,
        label: `${item.discountPercentage}% Off`,
        variant: 'filled' as const,
      };
    }
    return null;
  };

  const statusInfo = getStatusInfo();
  const isItemDisabled = disabled || item.isOutOfStock || !item.isActive;

  // Guest item specific styling
  const guestCardStyle = isGuestItem
    ? {
        border: '2px solid',
        borderColor: 'secondary.main',
        backgroundColor: 'secondary.50',
      }
    : {};

  return (
    <Card
      sx={{
        mb: 2,
        opacity: isItemDisabled ? 0.6 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isItemDisabled ? 1 : 3,
        },
        ...guestCardStyle,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Item Image */}
          <Avatar
            variant='rounded'
            src={item.itemImageUrl}
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'grey.100',
            }}
          >
            <Inventory />
          </Avatar>

          {/* Item Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Item Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant='h6'
                  component='h3'
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    lineHeight: 1.3,
                    mb: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.itemName}
                </Typography>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Store sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: '0.875rem' }}
                  >
                    Store #{item.storeId}
                  </Typography>
                </Box>
              </Box>

              {/* Status Chip */}
              {statusInfo && (
                <Chip
                  size='small'
                  color={statusInfo.color}
                  variant={statusInfo.variant}
                  label={statusInfo.label}
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
              {/* Guest Item Indicator */}
              {isGuestItem && (
                <Chip
                  size='small'
                  color='secondary'
                  variant='outlined'
                  label='Guest'
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
            </Box>

            {/* Pricing Information */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {item.hasDiscount && item.originalPrice && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{
                    textDecoration: 'line-through',
                    fontSize: '0.875rem',
                  }}
                >
                  ${item.originalPrice.toFixed(2)}
                </Typography>
              )}

              <Typography
                variant='h6'
                color={item.hasDiscount ? 'success.main' : 'primary.main'}
                sx={{
                  fontWeight: 600,
                  fontSize: '1.125rem',
                }}
              >
                ${item.effectivePrice.toFixed(2)}
              </Typography>

              {item.hasDiscount && (
                <Chip
                  size='small'
                  color='success'
                  variant='outlined'
                  label={`Save $${item.totalSavings.toFixed(2)}`}
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Quantity Controls and Actions */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {/* Quantity Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mr: 1 }}
                >
                  Qty:
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <IconButton
                    size='small'
                    onClick={handleDecrease}
                    disabled={isItemDisabled || item.quantity <= 1}
                    sx={{
                      borderRadius: '4px 0 0 4px',
                      minWidth: 32,
                      height: 32,
                    }}
                  >
                    <Remove fontSize='small' />
                  </IconButton>

                  <Typography
                    sx={{
                      px: 2,
                      minWidth: 40,
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {item.quantity}
                  </Typography>

                  <IconButton
                    size='small'
                    onClick={handleIncrease}
                    disabled={isItemDisabled || !item.isQuantityAvailable}
                    sx={{
                      borderRadius: '0 4px 4px 0',
                      minWidth: 32,
                      height: 32,
                    }}
                  >
                    <Add fontSize='small' />
                  </IconButton>
                </Box>

                {/* Stock Information */}
                {!item.isOutOfStock && item.availableQuantity > 0 && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ ml: 1 }}
                  >
                    {item.availableQuantity} available
                  </Typography>
                )}
                {/* Guest Item Warning */}
                {isGuestItem && (
                  <Typography
                    variant='caption'
                    color='warning.main'
                    sx={{ ml: 1 }}
                  >
                    Guest cart - sign in to save
                  </Typography>
                )}
              </Box>

              {/* Line Total and Remove Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    minWidth: 80,
                    textAlign: 'right',
                  }}
                >
                  ${item.lineTotalWithDiscount.toFixed(2)}
                </Typography>

                <IconButton
                  size='small'
                  onClick={handleRemove}
                  disabled={isItemDisabled}
                  color='error'
                  sx={{
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText',
                    },
                  }}
                >
                  <Delete fontSize='small' />
                </IconButton>
              </Box>
            </Box>

            {/* Warning Messages */}
            {item.needsQuantityAdjustment && (
              <Typography
                variant='caption'
                color='warning.main'
                sx={{ display: 'block', mt: 1 }}
              >
                Only {item.availableQuantity} available. Quantity adjusted.
              </Typography>
            )}

            {item.isOutOfStock && (
              <Typography
                variant='caption'
                color='error.main'
                sx={{ display: 'block', mt: 1 }}
              >
                This item is out of stock and cannot be purchased.
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
