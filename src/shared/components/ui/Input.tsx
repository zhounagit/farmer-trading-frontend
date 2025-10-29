import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff, ErrorOutline } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant' | 'size'> {
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium' | 'large';
  label?: string;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  showPasswordToggle?: boolean;
  loading?: boolean;
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !['loading'].includes(prop as string),
})<InputProps>(({ theme, size, error }) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          '& .MuiInputBase-root': {
            minHeight: '36px',
            fontSize: '0.875rem',
          },
          '& .MuiInputBase-input': {
            padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
          },
        };
      case 'large':
        return {
          '& .MuiInputBase-root': {
            minHeight: '52px',
            fontSize: '1.125rem',
          },
          '& .MuiInputBase-input': {
            padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
          },
        };
      default: // medium
        return {
          '& .MuiInputBase-root': {
            minHeight: '44px',
            fontSize: '1rem',
          },
          '& .MuiInputBase-input': {
            padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
          },
        };
    }
  };

  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(1),
      transition: theme.transitions.create([
        'border-color',
        'background-color',
        'box-shadow',
      ], {
        duration: theme.transitions.duration.short,
      }),
      '&:hover:not(.Mui-disabled):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
      '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
      },
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
        borderWidth: '2px',
        boxShadow: `0 0 0 3px ${theme.palette.error.main}20`,
      },
      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.action.disabled,
        },
      },
    },
    '& .MuiInputLabel-root': {
      fontWeight: 500,
      '&.Mui-focused:not(.Mui-error)': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiFormHelperText-root': {
      marginLeft: theme.spacing(0.5),
      marginTop: theme.spacing(0.5),
      fontSize: '0.75rem',
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
    },
    ...getSizeStyles(),
  };
});

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error = false,
      required = false,
      disabled = false,
      fullWidth = true,
      variant = 'outlined',
      size = 'medium',
      type = 'text',
      startAdornment,
      endAdornment,
      showPasswordToggle = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const getInputType = () => {
      if (type === 'password' && showPasswordToggle) {
        return showPassword ? 'text' : 'password';
      }
      return type;
    };

    const getEndAdornment = () => {
      const adornments = [];

      if (error) {
        adornments.push(
          <ErrorOutline
            key="error-icon"
            color="error"
            fontSize="small"
            sx={{ mr: 1 }}
          />
        );
      }

      if (type === 'password' && showPasswordToggle) {
        adornments.push(
          <IconButton
            key="password-toggle"
            aria-label="toggle password visibility"
            onClick={handleTogglePassword}
            edge="end"
            size="small"
            disabled={disabled}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        );
      }

      if (endAdornment) {
        adornments.push(endAdornment);
      }

      return adornments.length > 0 ? (
        <InputAdornment position="end">
          {adornments}
        </InputAdornment>
      ) : undefined;
    };

    const getStartAdornment = () => {
      return startAdornment ? (
        <InputAdornment position="start">
          {startAdornment}
        </InputAdornment>
      ) : undefined;
    };

    return (
      <StyledTextField
        ref={ref}
        label={required ? `${label} *` : label}
        helperText={helperText}
        error={error}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        variant={variant}
        size={size as any}
        type={getInputType()}
        InputProps={{
          startAdornment: getStartAdornment(),
          endAdornment: getEndAdornment(),
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
