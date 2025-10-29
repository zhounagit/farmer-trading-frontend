import React, { Component, type ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  featureName: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class FeatureErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Error in ${this.props.featureName} feature:`,
      error,
      errorInfo
    );

    // You can integrate with error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            padding: 2,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              padding: 4,
              textAlign: 'center',
              maxWidth: 500,
              width: '100%',
            }}
          >
            <ErrorOutline
              color='error'
              sx={{
                fontSize: 64,
                marginBottom: 2,
              }}
            />

            <Typography variant='h5' gutterBottom>
              Oops! Something went wrong
            </Typography>

            <Typography variant='body1' color='text.secondary' paragraph>
              There was an error loading the {this.props.featureName} feature.
              This might be a temporary issue.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Paper
                sx={{
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  marginY: 2,
                  textAlign: 'left',
                  overflow: 'auto',
                }}
              >
                <Typography variant='caption' component='pre'>
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </Typography>
              </Paper>
            )}

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                marginTop: 3,
              }}
            >
              <Button
                variant='contained'
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                color='primary'
              >
                Try Again
              </Button>

              <Button
                variant='outlined'
                onClick={this.handleGoHome}
                color='primary'
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default FeatureErrorBoundary;
