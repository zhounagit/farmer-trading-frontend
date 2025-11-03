import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Container,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth='md' sx={{ py: 8 }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.paper',
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />

            <Typography
              variant='h4'
              component='h1'
              gutterBottom
              sx={{ fontWeight: 600, color: 'error.main' }}
            >
              Oops! Something went wrong
            </Typography>

            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
            >
              We encountered an unexpected error. Don't worry, our team has been
              notified and we're working on a fix.
            </Typography>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity='error' sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Error Details (Development Mode):
                </Typography>
                <Typography
                  variant='body2'
                  component='pre'
                  sx={{
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </Typography>
              </Alert>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant='contained'
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                size='large'
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Try Again
              </Button>

              <Button
                variant='outlined'
                startIcon={<HomeIcon />}
                onClick={this.handleGoHome}
                size='large'
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Go to Home
              </Button>
            </Box>

            {/* Help Text */}
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 3, display: 'block' }}
            >
              If this problem persists, please contact our support team at{' '}
              <a
                href='mailto:support@farmertrading.com'
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                support@farmertrading.com
              </a>
            </Typography>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Utility function to create a simple error boundary wrapper
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));
};

// Hook to manually trigger error boundary (for testing)
export const useErrorHandler = () => {
  return (error: Error) => {
    // This will trigger the error boundary
    throw error;
  };
};
