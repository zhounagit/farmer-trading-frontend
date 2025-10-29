import React from 'react';
import {
  Card as MuiCard,
  CardContent,
  CardHeader,
  CardActions,
  CardProps as MuiCardProps,
  Typography,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CardProps extends Omit<MuiCardProps, 'variant'> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  header?: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  showDivider?: boolean;
  headerAction?: React.ReactNode;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => !['padding', 'loading', 'error'].includes(prop as string),
})<CardProps>(({ theme, variant, padding, loading, error }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          elevation: 2,
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        };
      case 'outlined':
        return {
          elevation: 0,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        };
      case 'filled':
        return {
          elevation: 0,
          backgroundColor: theme.palette.grey[50],
          boxShadow: 'none',
        };
      default:
        return {
          elevation: 1,
          boxShadow: theme.shadows[1],
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: theme.spacing(1) };
      case 'large':
        return { padding: theme.spacing(3) };
      default: // medium
        return { padding: theme.spacing(2) };
    }
  };

  return {
    borderRadius: theme.spacing(1.5),
    transition: theme.transitions.create([
      'box-shadow',
      'border-color',
    ], {
      duration: theme.transitions.duration.short,
    }),
    ...(error && {
      border: `1px solid ${theme.palette.error.main}`,
      backgroundColor: theme.palette.error.light + '10',
    }),
    ...(loading && {
      opacity: 0.7,
      pointerEvents: 'none',
    }),
    ...getVariantStyles(),
  };
});

const StyledCardContent = styled(CardContent)<{ padding?: string }>(({ theme, padding }) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0 !important' };
      case 'small':
        return {
          padding: `${theme.spacing(1)} !important`,
          '&:last-child': { paddingBottom: `${theme.spacing(1)} !important` }
        };
      case 'large':
        return {
          padding: `${theme.spacing(3)} !important`,
          '&:last-child': { paddingBottom: `${theme.spacing(3)} !important` }
        };
      default: // medium
        return {
          padding: `${theme.spacing(2)} !important`,
          '&:last-child': { paddingBottom: `${theme.spacing(2)} !important` }
        };
    }
  };

  return {
    ...getPaddingStyles(),
  };
});

const StyledCardHeader = styled(CardHeader)<{ padding?: string }>(({ theme, padding }) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0 !important' };
      case 'small':
        return {
          padding: `${theme.spacing(1)} ${theme.spacing(1)} 0 ${theme.spacing(1)} !important`,
        };
      case 'large':
        return {
          padding: `${theme.spacing(3)} ${theme.spacing(3)} 0 ${theme.spacing(3)} !important`,
        };
      default: // medium
        return {
          padding: `${theme.spacing(2)} ${theme.spacing(2)} 0 ${theme.spacing(2)} !important`,
        };
    }
  };

  return {
    ...getPaddingStyles(),
    '& .MuiCardHeader-title': {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    '& .MuiCardHeader-subheader': {
      fontSize: '0.875rem',
      color: theme.palette.text.secondary,
      marginTop: theme.spacing(0.5),
    },
  };
});

const StyledCardActions = styled(CardActions)<{ padding?: string }>(({ theme, padding }) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0 !important' };
      case 'small':
        return {
          padding: `0 ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} !important`,
        };
      case 'large':
        return {
          padding: `0 ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)} !important`,
        };
      default: // medium
        return {
          padding: `0 ${theme.spacing(2)} ${theme.spacing(2)} ${theme.spacing(2)} !important`,
        };
    }
  };

  return {
    ...getPaddingStyles(),
    gap: theme.spacing(1),
  };
});

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  header,
  title,
  subtitle,
  actions,
  children,
  loading = false,
  error = false,
  showDivider = false,
  headerAction,
  ...props
}) => {
  const hasHeader = header || title || subtitle || headerAction;

  return (
    <StyledCard
      variant={variant}
      padding={padding}
      loading={loading}
      error={error}
      {...props}
    >
      {hasHeader && (
        <>
          <StyledCardHeader
            padding={padding}
            title={title && (
              <Typography variant="h6" component="h3">
                {title}
              </Typography>
            )}
            subheader={subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            action={headerAction}
          >
            {header}
          </StyledCardHeader>
          {showDivider && <Divider />}
        </>
      )}

      <StyledCardContent padding={padding}>
        {children}
      </StyledCardContent>

      {actions && (
        <>
          {showDivider && <Divider />}
          <StyledCardActions padding={padding}>
            {actions}
          </StyledCardActions>
        </>
      )}
    </StyledCard>
  );
};

export default Card;
