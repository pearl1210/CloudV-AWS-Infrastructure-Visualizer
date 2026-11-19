import { Component, type ErrorInfo, type ReactNode } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorFallbackProps = {
  title: string;
  description: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

function ErrorFallback({ title, description }: ErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        <button
          type="button"
          onClick={handleReload}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4" />
          Reload app
        </button>
      </div>
    </div>
  );
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CloudV crashed', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <ErrorFallback title="Something went wrong" description="CloudV hit an unexpected error. Reload the app to try again." />;
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = 'Something went wrong';
  let description = 'CloudV hit an unexpected error. Reload the app to try again.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description = typeof error.data === 'string' ? error.data : description;
  } else if (error instanceof Error) {
    description = error.message;
  }

  return <ErrorFallback title={title} description={description} />;
}
