import React from 'react';
import {
  Box,
  Typography,
  Alert,
  AlertTitle,
  Paper,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ErrorOutline,
  Warning,
  Info,
  CheckCircle,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Button from '../ui/Button';

export interface ErrorDisplayProps {
  variant?: 'error' | 'warning' | 'info' | 'success';
  severity?: 'low' | 'medium' | 'high';
  title?: string;
  message?: string;
  details?: string;
  error?: Error;
  showRetry?: boolean;
  showDetails?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  fullWidth?: boolean;
  compact?: boolean;
  children?: React.ReactNode;
}

const StyledErrorContainer = styled(Paper, {
  shouldForwardProp: (prop) => !['variant', 'severity', 'compact'].includes(prop as string),
})<{ variant?: string; severity?: string; compact?: boolean }>(
  ({ theme, variant, severity, compact }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'error':
          return {
            backgroundColor: theme.palette.error.light + '10',
            borderColor: theme.palette.error.main,
            color: theme.palette.error.dark,
          };
        case 'warning':
          return {
            backgroundColor: theme.palette.warning.light + '10',
            borderColor: theme.palette.warning.main,
            color: theme.palette.warning.dark,
          };
        case 'info':
          return {
            backgroundColor: theme.palette.info.light + '10',
            borderColor: theme.palette.info.main,
            color: theme.palette.info.dark,
          };
        case 'success':
          return {
            backgroundColor: theme.palette.success.light + '10',
            borderColor: theme.palette.success.main,
            color: theme.palette.success.dark,
          };
        default:
          return {
            backgroundColor: theme.palette.grey[50],
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
          };
      }
    };

    const getSeverityStyles = () => {
      switch (severity) {
        case 'high':
          return {
            border: `2px solid`,
            boxShadow: theme.shadows[3],
          };
        case 'medium':
          return {
            border: `1px solid`,
            boxShadow: theme.shadows[1],
          };
        default: // low
          return {
            border: `1px solid`,
          };
      }
    };

    return {
      padding: compact ? theme.spacing(1.5) : theme.spacing(2),
      borderRadius: theme.spacing(1),
      ...getVariantStyles(),
      ...getSeverityStyles(),
    };
  }
);

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginRight: theme.spacing(1.5),
  marginTop: theme.spacing(0.25),
}));

const ContentContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1.5),
  flexWrap: 'wrap',
}));

const DetailsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  borderRadius: theme.spacing(0.5),
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  overflow: 'auto',
  maxHeight: '200px',
}));

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  variant = 'error',
  severity = 'medium',
  title,
  message,
  details,
  error,
  showRetry = false,
  showDetails = true,
  onRetry,
  onDismiss,
  fullWidth = true,
  compact = false,
  children,
}) => {
  const [showDetailedInfo, setShowDetailedInfo] = React.useState(false);

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <ErrorOutline color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      case 'success':
        return <CheckCircle color="success" />;
      default:
        return <Info />;
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case 'error':
        return 'Something went wrong';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'success':
        return 'Success';
      default:
        return 'Notification';
    }
  };

  const getErrorMessage = () => {
    if (message) return message;
    if (error?.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
  };

  const getErrorDetails = () => {
    if (details) return details;
    if (error?.stack) return error.stack;
    return null;
  };

  const displayTitle = title || getDefaultTitle();
  const displayMessage = getErrorMessage();
  const displayDetails = getErrorDetails();
  const hasDetails = showDetails && displayDetails;
  const hasActions = showRetry || onDismiss;

  return (
    <StyledErrorContainer
      variant={variant}
      severity={severity}
      compact={compact}
      elevation={0}
      sx={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Box display="flex" alignItems="flex-start">
        <IconContainer>
          {getIcon()}
        </IconContainer>

        <ContentContainer>
          <Typography
            variant={compact ? 'subtitle2' : 'h6'}
            component="div"
            fontWeight={600}
            gutterBottom={!compact}
          >
            {displayTitle}
          </Typography>

          {displayMessage && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: compact ? 0.5 : 1 }}
            >
              {displayMessage}
            </Typography>
          )}

          {children && (
            <Box sx={{ mt: 1 }}>
              {children}
            </Box>
          )}

          {hasDetails && (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mt: 1,
                  cursor: 'pointer',
                }}
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
              >
                <Typography variant="caption" color="textSecondary">
                  {showDetailedInfo ? 'Hide' : 'Show'} details
                </Typography>
                <IconButton size="small" sx={{ ml: 0.5 }}>
                  {showDetailedInfo ? (
                    <ExpandLess fontSize="small" />
                  ) : (
                    <ExpandMore fontSize="small" />
                  )}
                </IconButton>
              </Box>

              <Collapse in={showDetailedInfo}>
                <DetailsContainer>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {displayDetails}
                  </pre>
                </DetailsContainer>
              </Collapse>
            </>
          )}

          {hasActions && (
            <>
              {!compact && <Divider sx={{ my: 1.5 }} />}
              <ActionsContainer>
                {showRetry && onRetry && (
                  <Button
                    variant="outline"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={onRetry}
                  >
                    Try Again
                  </Button>
                )}
                {onDismiss && (
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={onDismiss}
                  >
                    Dismiss
                  </Button>
                )}
              </ActionsContainer>
            </>
          )}
        </ContentContainer>
      </Box>
    </StyledErrorContainer>
  );
};

// Convenience components for specific error types
export const ErrorAlert: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => (
  <ErrorDisplay variant="error" {...props} />
);

export const WarningAlert: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => (
  <ErrorDisplay variant="warning" {...props} />
);

export const InfoAlert: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => (
  <ErrorDisplay variant="info" {...props} />
);

export const SuccessAlert: React.FC<Omit<ErrorDisplayProps, 'variant'>> = (props) => (
  <ErrorDisplay variant="success" {...props} />
);

export default ErrorDisplay;
