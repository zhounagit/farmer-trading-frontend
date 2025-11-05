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
})<Omit<ButtonProps, 'variant' | 'size'> & { variant?: string; size?: string }>(
  ({ theme, size }) => {
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
      ...getSizeStyles(),
    };
  }
);

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Map custom variants to MUI variants
  const muiVariant =
    variant === 'outline'
      ? 'outlined'
      : variant === 'ghost'
        ? 'text'
        : 'contained';

  return (
    <StyledButton
      variant={muiVariant}
      size={size as 'small' | 'medium' | 'large' | undefined}
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
