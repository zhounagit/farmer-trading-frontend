import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => !['loading'].includes(prop as string),
})<ButtonProps>(({ theme, variant: customVariant, size }) => {
  const getVariantStyles = () => {
    switch (customVariant) {
      case 'primary':
        return {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&:disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        };
      case 'secondary':
        return {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
          '&:disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.palette.primary.main,
          border: `1px solid ${theme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            color: theme.palette.action.disabled,
            borderColor: theme.palette.action.disabled,
          },
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            color: theme.palette.action.disabled,
          },
        };
      case 'danger':
        return {
          backgroundColor: theme.palette.error.main,
          color: theme.palette.error.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.error.dark,
          },
          '&:disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
          },
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
          fontSize: '0.75rem',
          minHeight: '32px',
        };
      case 'large':
        return {
          padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
          fontSize: '1.125rem',
          minHeight: '48px',
        };
      default: // medium
        return {
          padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
          fontSize: '1rem',
          minHeight: '40px',
        };
    }
  };

  return {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: theme.spacing(1),
    boxShadow: 'none',
    transition: theme.transitions.create(
      ['background-color', 'border-color', 'color', 'box-shadow'],
      {
        duration: theme.transitions.duration.short,
      }
    ),
    '&:hover': {
      boxShadow: 'none',
    },
    '&:focus': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px',
    },
    ...getVariantStyles(),
    ...getSizeStyles(),
  };
});

export const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  startIcon,
  endIcon,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <StyledButton
      variant='contained'
      size={size}
      disabled={isDisabled}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          sx={{
            marginRight: 1,
            color: 'inherit',
          }}
        />
      )}
      {children}
    </StyledButton>
  );
};

export default Button;
