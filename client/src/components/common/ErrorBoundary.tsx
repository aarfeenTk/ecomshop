import React, { ErrorInfo } from 'react';
import { Typography, Button, Container, Box, Paper, Alert } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 2
          }}
        >
          <Container maxWidth="md">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'error.main'
              }}
            >
              <Box sx={{ mb: 3 }}>
                <BugReport sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              </Box>

              <Typography variant="h4" gutterBottom color="error" sx={{ fontWeight: 700 }}>
                Oops! Something went wrong
              </Typography>

              <Typography variant="body1" gutterBottom color="text.secondary" sx={{ mb: 3 }}>
                We're sorry, but an unexpected error occurred. This has been logged for debugging purposes.
              </Typography>

              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                  Error: {this.state.error?.message || 'Unknown error occurred'}
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleRetry}
                  sx={{ borderRadius: 2 }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleRefresh}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh Page
                </Button>
              </Box>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Development Error Details
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      maxHeight: 300,
                      overflow: 'auto'
                    }}
                  >
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.875rem' }}>
                      {this.state.error.toString()}
                      {'\n\n'}
                      Component Stack:
                      {this.state.errorInfo ? this.state.errorInfo.componentStack : 'No component stack available'}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
