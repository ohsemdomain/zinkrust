import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (import.meta.env.PROD) {
      // In production, you might want to send this to an error reporting service
      // reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Stack gap="lg">
            <Title order={1} ta="center" c="red">
              Something went wrong
            </Title>

            <Alert color="red" title="Error Details" variant="light">
              <Text size="sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
            </Alert>

            <Button
              onClick={this.handleReset}
              variant="filled"
              color="blue"
              size="md"
              mx="auto"
            >
              Try Again
            </Button>

            {import.meta.env.DEV && this.state.errorInfo && (
              <Alert color="gray" title="Stack Trace" variant="light">
                <Text
                  size="xs"
                  ff="monospace"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {this.state.errorInfo.componentStack}
                </Text>
              </Alert>
            )}
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}
