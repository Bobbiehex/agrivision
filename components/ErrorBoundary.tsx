import React from 'react';

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console and allow visibility in UI
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
    this.setState({ error, info });
  }

  render() {
    const { hasError, error, info } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="mb-4">An unexpected error occurred while rendering the app. Details are shown below.</p>
            <pre className="whitespace-pre-wrap text-xs bg-white p-4 rounded border overflow-auto text-left">
              {error?.toString()}
              {info?.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
