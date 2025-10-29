import React from 'react';
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Controller } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control?: Control<TFieldValues>;
  label?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactElement;
  rules?: any;
  defaultValue?: any;
  fullWidth?: boolean;
  margin?: 'none' | 'dense' | 'normal';
  error?: boolean;
  errorMessage?: string;
}

const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => !['margin'].includes(prop as string),
})<{ margin?: string }>(({ theme, margin }) => {
  const getMarginStyles = () => {
    switch (margin) {
      case 'dense':
        return {
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
        };
      case 'normal':
        return {
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        };
      default: // none
        return {
          margin: 0,
        };
    }
  };

  return {
    ...getMarginStyles(),
    '& .MuiFormLabel-root': {
      fontWeight: 600,
      marginBottom: theme.spacing(0.5),
      color: theme.palette.text.primary,
      fontSize: '0.875rem',
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
      '&.Mui-focused:not(.Mui-error)': {
        color: theme.palette.primary.main,
      },
    },
    '& .MuiFormHelperText-root': {
      marginTop: theme.spacing(0.5),
      marginLeft: 0,
      fontSize: '0.75rem',
      '&.Mui-error': {
        color: theme.palette.error.main,
      },
    },
  };
});

const RequiredIndicator = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.25),
  fontSize: '0.875rem',
}));

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  label,
  helperText,
  required = false,
  disabled = false,
  children,
  rules,
  defaultValue,
  fullWidth = true,
  margin = 'normal',
  error: externalError = false,
  errorMessage,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  // If control is provided, use react-hook-form Controller
  if (control) {
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => {
          const hasError = fieldState.error || externalError;
          const displayErrorMessage = fieldState.error?.message || errorMessage;

          return (
            <StyledFormControl
              error={!!hasError}
              disabled={disabled}
              fullWidth={fullWidth}
              margin={margin}
              {...props}
            >
              {label && (
                <FormLabel component='legend' required={required}>
                  {label}
                  {required && <RequiredIndicator>*</RequiredIndicator>}
                </FormLabel>
              )}

              <Box sx={{ mt: label ? 0.5 : 0 }}>
                {React.cloneElement(children, {
                  ...field,
                  error: !!hasError,
                  disabled,
                  fullWidth,
                  required,
                  ...children.props,
                })}
              </Box>

              {(helperText || displayErrorMessage) && (
                <FormHelperText error={!!hasError}>
                  {displayErrorMessage || helperText}
                </FormHelperText>
              )}
            </StyledFormControl>
          );
        }}
      />
    );
  }

  // Fallback for non-react-hook-form usage
  const hasError = externalError;
  const displayErrorMessage = errorMessage;

  return (
    <StyledFormControl
      error={hasError}
      disabled={disabled}
      fullWidth={fullWidth}
      margin={margin}
      {...props}
    >
      {label && (
        <FormLabel component='legend' required={required}>
          {label}
          {required && <RequiredIndicator>*</RequiredIndicator>}
        </FormLabel>
      )}

      <Box sx={{ mt: label ? 0.5 : 0 }}>
        {React.cloneElement(children, {
          error: hasError,
          disabled,
          fullWidth,
          required,
          ...children.props,
        })}
      </Box>

      {(helperText || displayErrorMessage) && (
        <FormHelperText error={hasError}>
          {displayErrorMessage || helperText}
        </FormHelperText>
      )}
    </StyledFormControl>
  );
}

export default FormField;
