'use client';

import { useEffect } from 'react';
import { getErrorMessage } from '@/app/lib/errors';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundaryComponent extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    const { children, fallback: Fallback } = this.props;
    const { error } = this.state;

    if (error) {
      return (
        <Fallback error={error} reset={() => this.setState({ error: null })} />
      );
    }

    return children;
  }
}

import React from 'react';

export { ErrorBoundaryComponent };

export default function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryComponent fallback={fallback}>
      {children}
    </ErrorBoundaryComponent>
  );
}

/**
 * Default fallback component for the error boundary
 */
export function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 rounded-lg border border-red-200 bg-red-50 my-4">
      <h2 className="text-lg font-medium text-red-800 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-red-700 mb-4">{getErrorMessage(error)}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

/**
 * Hook to log errors to an error monitoring service
 */
export function useErrorLogger(error: Error | null) {
  useEffect(() => {
    if (error) {
      // Log to console in development
      console.error('Error caught by error boundary:', error);

      // In production, you would log to an error monitoring service like Sentry
      // Example: if (process.env.NODE_ENV === 'production') { Sentry.captureException(error); }
    }
  }, [error]);
}
